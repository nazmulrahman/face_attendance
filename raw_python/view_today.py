import pandas as pd
from datetime import date

today = date.today().strftime("%Y-%m-%d")
file_path = f"logs/attendance_{today}.csv"

try:
    df = pd.read_csv(file_path)
    print(f"📅 Today's Attendance ({today}):\n", df)
except FileNotFoundError:
    print(f"❌ No attendance file found for {today}.")
