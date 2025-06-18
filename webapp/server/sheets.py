# server/sheets.py

import datetime
import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Setup
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')

# Replace with your actual Sheet ID from URL
SPREADSHEET_ID = '1SxjHRf4eVyyLU5OeQAZy17iaSHituaeH3mwppOdVF6w'
SHEET_NAME = 'Attendance'

def log_to_google_sheets(name):
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=creds)

    sheet = service.spreadsheets()
    now = datetime.datetime.now().strftime("%Y-%m-%d,%H:%M:%S").split(",")
    values = [[name, now[0], now[1]]]

    body = {'values': values}

    sheet.values().append(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!A1",
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body=body
    ).execute()