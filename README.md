# RestoreEstopia

**RestoreEstopia is a Discord verification bot designed to protect your server from raids, malicious users, and automated attacks.**

It ensures that new members are legitimate by requiring them to verify their identity through a secure process before gaining full access to the server. This bot is an open-source alternative to services like RestoreCord, offering transparency and customization.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Commands](#commands)
- [Web Panel](#web-panel)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)

## Features

*   **Advanced Verification System:** Choose between two types of verification panels:
    *   **Plain:** A simple verification panel where users click a button to get verified.
    *   **Ticket-based:** A more advanced system that creates a private ticket for manual verification by your staff team.
*   **Secure OAuth2 Flow:** The primary verification method uses Discord's OAuth2 for a secure and seamless user experience.
*   **Web Panel:** A web interface for users to register and manage their accounts (optional).
*   **Manual Verification Fallback:** A manual verification option is available for users who encounter issues with the standard flow.
*   **Role-Based Access:** Automatically assign a specific role to users upon successful verification.
*   **Slash Commands:** All administrative actions are handled through intuitive and easy-to-use slash commands.
*   **Moderation Tools:** Includes a context menu command for staff to easily submit proof of moderation actions to a designated channel.
*   **User Data Management:** Allows users to request their data be removed or to easily rejoin a server they were previously a member of.

## How It Works

When a new user joins your server, they will only have access to the channels that the default `@everyone` role can see. In your designated verification channel, they will see a panel with a "Verify" button.

1.  **OAuth2 Verification:** The user clicks the "Verify" button, which takes them to a Discord authorization screen. By authorizing the bot, they prove they own their Discord account.
2.  **Role Assignment:** Upon successful authorization, the bot grants them the designated "verified" role, giving them access to the rest of your server.
3.  **Manual Verification:** If a user cannot verify through the standard process, they can use the "Manual Verification" button. Depending on your setup, this will either guide them through a different process or open a ticket for your staff to handle.

This process helps filter out bots and bad actors, ensuring that your community remains safe.

## Commands

RestoreEstopia uses slash commands for all administrative tasks. You must have Administrator permissions to use them.

### `/setup`
This command is used to configure server-specific settings.

*   `/setup context`
    *   **Description:** Sets the channel where moderation proofs are sent.
    *   **Arguments:**
        *   `channel`: The text channel where the proof messages will be posted.

### `/verify`
This command is used to create and manage verification panels.

*   `/verify plain`
    *   **Description:** Creates a simple verification panel.
    *   **Arguments:**
        *   `channel`: The channel where the verification panel will be posted.
        *   `role`: The role to be assigned to users who successfully verify.

*   `/verify ticket`
    *   **Description:** Creates a more advanced verification panel that opens a ticket for manual verification.
    *   **Arguments:**
        *   `channel`: The channel where the verification panel will be posted.
        *   `role`: The role to be assigned to users who successfully verify.
        *   `catergory`: The channel category where the new verification ticket channels will be created.
        *   `pingrole` (Optional): A role to ping when a new ticket is created.
        *   `requirements` (Optional): A role that users must have to create a verification ticket.
        *   `instructions` (Optional): Custom instructions to show in the ticket.

## Web Panel

This project also includes an optional web panel that can be used for user registration and management. The web panel is not required for the bot's core verification functionality.

The API for the web panel is included in this repository. The frontend for the web panel is not included and would need to be developed separately.

The API includes the following routes:
- `POST /api/register`: Register a new user.
- `POST /api/login`: Log in a user and receive an authentication token.
- `POST /api/verifyToken`: Verify an authentication token.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kezza2k7/RestoreEstopia.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd RestoreEstopia
    ```
3.  **Install dependencies:**
    Use `npm` to install the required packages.
    ```bash
    npm install
    ```
4.  **Set up your environment variables:**
    Rename the `.env.example` file to `.env` and fill in the required values. See the [Configuration](#configuration) section for more details.

5.  **Deploy Slash Commands:**
    Before starting the bot, you need to deploy the slash commands to Discord.
    ```bash
    npm run deploy-commands
    ```

6.  **Start the bot:**
    ```bash
    npm start
    ```
    For development, you can use `nodemon` to automatically restart the bot on file changes:
    ```bash
    npm run dev
    ```

## Configuration

The bot is configured using environment variables, which should be placed in a `.env` file in the root of the project.

```env
DISCORD_TOKEN=
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=http://localhost:2999/auth/callback
PORT=2999
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
```

### Variable Explanations

*   `DISCORD_TOKEN`: The token for your Discord bot. You can get this from the [Discord Developer Portal](https://discord.com/developers/applications).
*   `CLIENT_ID`: The client ID of your Discord application. This can also be found in the Developer Portal.
*   `CLIENT_SECRET`: The client secret of your Discord application, used for the OAuth2 flow. Keep this value secure.
*   `REDIRECT_URI`: The URL that Discord will redirect users to after they authorize the bot. This must match the redirect URI you set in the "OAuth2" section of your application in the Developer Portal.
*   `PORT` (Optional): The port for the web server to run on. Defaults to `2999`.
*   `CORS_ORIGIN` (Optional): The allowed origin for CORS requests. Defaults to `['https://test.estopia.net', 'https://restore.estopia.net']`.
*   `COOKIE_DOMAIN` (Optional): The domain for cookies set by the web server. Defaults to `.estopia.net`.

## Usage

Once the bot is running and has been invited to your server, you can set up a verification panel.

1.  **Choose a Verification Channel:** Decide which channel you want new users to use for verification (e.g., `#verify`).
2.  **Run the `/verify` Command:** Go to any channel where you can use commands and start typing `/verify`. Choose either the `plain` or `ticket` subcommand.
3.  **Fill in the Arguments:**
    *   For a `plain` panel, you will need to provide the `channel` where the panel should be posted and the `role` to be given to verified users.
    *   For a `ticket` panel, you will need to provide the same, plus the `catergory` for tickets and any optional arguments you wish to use.
4.  **Send the Command:** Once you execute the command, the bot will create the verification panel in the specified channel.
5.  **Test the Process:** It's a good idea to test the verification flow yourself to ensure everything is working as expected.

Users will now be able to verify themselves and gain access to your server according to the system you have configured.

## Contributing

Contributions are welcome! If you have any ideas or suggestions, please open an issue or submit a pull request.
