const express = require('express');
const axios = require('axios');
const { AuthedUsers, WebUsers } = require('./models/index');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const createRouter = () => {
    const router = express.Router();

    // Route for handling the Discord OAuth2 callback
    router.get('/', async (req, res) => {
        const code = req.query.code;
        if (!code) {
            return res.status(400).send('No code provided');
        }

        try {
            // Exchange the authorization code for an access token
            const params = new URLSearchParams();
            params.append('client_id', process.env.CLIENT_ID);
            params.append('client_secret', process.env.CLIENT_SECRET);
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', process.env.REDIRECT_URI);

            const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token } = tokenResponse.data;

            // Use the access token to get the user's identity
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            const userData = userResponse.data;

            // Insert or update user in the database
            await AuthedUsers.upsert({
                userId: userData.id,
                username: userData.username,
                accessToken: access_token,
                refreshToken: refresh_token
            });

            return res.send('You have been verified. Please go back to the server and press the "Manual Verification" button.');
        } catch (error) {
            console.error('Error processing verification:', error.response ? error.response.data : error.message);
            res.status(500).send('Internal server error');
        }
    });

    // Route for user login on the web panel
    router.post('/api/login', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('Missing username or password');
        }

        try {
            const user = await WebUsers.findOne({ where: { username } });

            if (!user) {
                return res.status(404).send('User not found');
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).send('Invalid password');
            }

            const webToken = crypto.randomBytes(16).toString('hex');

            await WebUsers.update({
                webToken,
                webTokenExpire: Date.now() + 1000 * 60 * 60 * 24 // Token expires in 24 hours
            }, {
                where: { userId: user.userId }
            });

            res.cookie('authToken', webToken, {
                domain: process.env.COOKIE_DOMAIN || '.estopia.net',
                httpOnly: false,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 24 hours
            });

            return res.send({ token: webToken });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).send('Internal server error');
        }
    });

    // Route for user registration on the web panel
    router.post('/api/register', async (req, res) => {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).send('Missing parameters');
        }

        try {
            const existingUser = await WebUsers.findOne({ where: { username } });

            if (existingUser) {
                return res.status(409).send('User with that username already exists');
            }

            const passwordHash = bcrypt.hashSync(password, 10);
            const webToken = crypto.randomBytes(16).toString('hex');

            await WebUsers.create({
                username,
                password: passwordHash,
                email,
                webToken,
                webTokenExpire: Date.now() + 1000 * 60 * 60 * 24 // Token expires in 24 hours
            });

            res.cookie('authToken', webToken, {
                domain: process.env.COOKIE_DOMAIN || '.estopia.net',
                httpOnly: false,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 24 hours
            });

            return res.status(201).send({ token: webToken });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).send('Internal server error');
        }
    });

    // Route to verify a web token
    router.post('/api/verifyToken', async (req, res) => {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ valid: false, message: 'Token is required' });
        }

        try {
            const webUser = await WebUsers.findOne({ where: { webToken: token } });

            if (!webUser) {
                return res.status(404).json({ valid: false, message: 'Invalid token' });
            }

            if (webUser.webTokenExpire < Date.now()) {
                return res.status(401).json({ valid: false, message: 'Token expired' });
            }

            return res.json({ valid: true });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(500).json({ valid: false, message: 'Internal server error' });
        }
    });

    return router;
};

module.exports = createRouter;