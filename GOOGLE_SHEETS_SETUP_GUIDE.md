# Google Sheets API Infrastructure Setup & Configuration Guide

This guide describes how to configure a Google Cloud project, enable the Sheets API, create a Service Account, generate credentials, and integrate them with the backend environment.

---

## Step 1: Create a Google Cloud Project

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. Click the **Project Dropdown** at the top left of the console header (near the "Google Cloud" logo).
4. Click **New Project** in the upper-right corner of the modal.
5. Enter a project name (e.g., `Urban Power App`).
6. Select your organization and location (optional).
7. Click **Create** and wait for the project initialization to complete.
8. Ensure your new project is active (check the dropdown at the top).

---

## Step 2: Enable the Google Sheets API

1. In the left navigation menu, navigate to **APIs & Services > Library** (or search for "Google Sheets API" in the top search bar).
2. Search for `Google Sheets API`.
3. Select the **Google Sheets API** from the search results.
4. Click **Enable**.

---

## Step 3: Create a Service Account

1. Navigate to **APIs & Services > Credentials** (or **IAM & Admin > Service Accounts**).
2. Click **+ Create Credentials** at the top and select **Service Account**.
3. Fill in the Service Account Details:
   - **Service account name**: e.g., `sheets-sync-bot`
   - **Service account ID**: Automatically generated (e.g., `sheets-sync-bot@your-project-id.iam.gserviceaccount.com`).
   - **Service account description**: e.g., `Service account for syncing booking data from Urban Power app.`
4. Click **Create and Continue**.
5. Assign Roles (Optional):
   - For Sheets API, no special GCP role is required because permissions are handled directly on the Google Sheet by sharing it with the service account's email address.
   - Click **Continue** and then click **Done**.

---

## Step 4: Generate and Download the Credentials JSON

1. In the **Service Accounts** list (under **IAM & Admin > Service Accounts**), find the Service Account you just created.
2. Click on the service account email or select **Manage Keys** from the actions menu (three dots) on the right.
3. Select the **Keys** tab at the top.
4. Click **Add Key > Create new key**.
5. Select **JSON** as the key type.
6. Click **Create**.
7. The credentials JSON file will automatically download to your computer.
8. **Security Note:** Keep this file safe. Never commit it to git. Our root `.gitignore` is configured to ignore `backend/*credentials.json` files.

---

## Step 5: Configure the Target Spreadsheet

1. Create a new Google Sheet (or open an existing one) that you want to sync booking data to.
2. Note the **Spreadsheet ID** from the URL. The ID is the long string of characters between `/d/` and `/edit` in the URL:
   `https://docs.google.com/spreadsheets/d/S_S_ID_HERE/edit#gid=0`
3. Click the **Share** button in the top right of the Google Sheet.
4. Add the Service Account's email address (e.g., `sheets-sync-bot@your-project-id.iam.gserviceaccount.com`) in the "Add people and groups" field.
5. Set the permission role to **Editor** (required to write/modify data).
6. Uncheck "Notify people" and click **Share**.

---

## Step 6: Configure Environment Variables

Now, update your `.env` file in the `backend` folder.

You can configure the service using **either** a local credentials file path **or** the raw JSON content directly (ideal for production environments like Heroku, Render, AWS ECS, etc.).

### Option A: Local File Path (Recommended for Development)

1. Move the downloaded JSON credentials file into the `backend/` directory.
2. Rename the file to `google-sheets-credentials.json` (or any name ending with `credentials.json`).
3. Add the following to `backend/.env`:
   ```env
   GOOGLE_SHEETS_CREDENTIALS_FILE="google-sheets-credentials.json"
   GOOGLE_SHEETS_CREDENTIALS_JSON=""
   GOOGLE_SHEETS_SPREADSHEET_ID="YOUR_SPREADSHEET_ID_HERE"
   ```

### Option B: Inline JSON String (Recommended for Production)

1. Open the downloaded credentials JSON file and copy its entire text contents.
2. Minify the JSON or escape line breaks, then paste it as a single-line string into `backend/.env`:
   ```env
   GOOGLE_SHEETS_CREDENTIALS_FILE=""
   GOOGLE_SHEETS_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", "private_key_id": "...", "private_key": "...", ...}'
   GOOGLE_SHEETS_SPREADSHEET_ID="YOUR_SPREADSHEET_ID_HERE"
   ```

---

## Backend Integration Details

To use the Google Sheets API client anywhere in your FastAPI controllers or tasks:

```python
from app.services.google_sheets import get_google_sheets_service

# Initialize service helper
sheets_service = get_google_sheets_service()

if sheets_service.is_configured:
    try:
        # Build authorized Google Sheets API client
        client = sheets_service.get_sheets_client()
        
        # Get target Spreadsheet ID
        spreadsheet_id = sheets_service.spreadsheet_id
        
        # Example API read call
        result = client.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range="Sheet1!A1:D10"
        ).execute()
        
        # Example API append call
        client.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range="Sheet1!A:A",
            valueInputOption="RAW",
            body={"values": [["New User", "User Email", "Created At"]]}
        ).execute()
        
    except Exception as e:
        # Handle exceptions gracefully
        print(f"Google Sheets Sync Error: {e}")
else:
    print("Google Sheets integration is disabled or not configured.")
```
