import sqlite3

DB_FILE = "jobboard.db"
TABLES = ("companies", "categories", "people", "ads", "applications")

conn = sqlite3.connect(DB_FILE)
conn.execute("PRAGMA foreign_keys = ON")
print(conn.execute("PRAGMA foreign_keys").fetchone())

for filename in ("schema.sql", "seed.sql"):
    with open(filename, encoding="utf-8") as f:
        conn.executescript(f.read())

for table in TABLES:
    count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    print(f"{table}: {count}")

conn.close()