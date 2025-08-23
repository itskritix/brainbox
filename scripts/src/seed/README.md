# Brainbox seed script

This directory contains a script that automatically creates a set of **dummy data** for **Brainbox**, which can be used for testing, demos, or local development. Specifically, it provisions multiple user accounts, a primary workspace, and a variety of example content including pages, databases, channels, chats, and messages, all in a few automated steps.

## How It Works

1. **Load Accounts**  
   The script reads `accounts.json` for a list of sample accounts, each with a name, email, password, and avatar. It then:

   - Creates the **main** account (first in the JSON list).
   - Sets up a new workspace named “Brainbox” for this main account.
   - Uploads a workspace avatar image and assigns it to the workspace.

2. **Invite & Create Additional Accounts**  
   The remaining accounts in `accounts.json` (beyond the first) are each registered, and then automatically invited to the newly created workspace.  
   _Example:_ It might create accounts for “Daniel Sykes,” “Mark Lynch,” etc., all while assigning them consistent user IDs.

3. **Populate the Workspace**  
   Once the main and secondary accounts exist:

   - A **Node Generator** (`node-generator.ts`) script runs to create spaces, pages, channels, and databases within the main workspace.
   - **Messages, Records, and Content**: The script inserts example text (using [faker](https://fakerjs.dev/)) into pages, channels, and direct chats, generating thousands of random message items for realistic scenario testing.

4. **Batch Mutations**  
   The script organizes database or chat updates into **mutations**. These mutations are then sent in batches (to the server’s REST API) to avoid large single-payload operations. This approach simulates real-world usage where multiple items might be created sequentially or in small chunks.

5. **Local vs. Remote**  
   By default, it points at a **development server** on `http://localhost:3000` to register users and send data. If you need to seed another environment, adjust the `SERVER_DOMAIN` constant in `index.ts`.

**The account information in `accounts.json` is entirely fictional and generated using GPT-4. Any resemblance to real individuals is purely coincidental. The account avatars were created using OpenAI's DALL-E.**

## Usage

1. **Install Dependencies** (from the monorepo root):

   ```bash
   npm install
   ```

2. **Run the Seed Script** (within the `scripts` directory):
   ```bash
   npm run seed
   ```
   This command reads `accounts.json`, creates each account, sets up the workspace, and populates it with sample data. Once complete, you’ll have a fully seeded development instance of **Brainbox** to explore.

## Notes

- **Email Verification**: Make sure to disable email verification on your target server before running the seed script. Otherwise, the script will fail since it cannot complete the verification process for the generated accounts.
- **Performance**: By default, the script creates several thousand messages, records, and pages. If you find performance is an issue, you can reduce the numbers (e.g., number of messages per channel, or records per database) in `node-generator.ts`.
- **Avatars**: The `avatars/` folder (referenced in `index.ts`) contains sample `.webp` images for users. These are automatically uploaded to the server, and each user's `avatar` field is updated accordingly.
- **Data Cleanup**: The script does not automatically purge any existing data. If you run it repeatedly against the same server or workspace, it will fail because of duplicate account emails used before.
