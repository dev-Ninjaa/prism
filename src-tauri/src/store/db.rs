use rusqlite::{Connection, Result as SqlResult};
use std::sync::Mutex;
use super::models::HistoryEntry;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: &str) -> SqlResult<Self> {
        let conn = Connection::open(db_path)?;
        
        // Create history table if not exists
        conn.execute(
            "CREATE TABLE IF NOT EXISTS history (
                id TEXT PRIMARY KEY,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                status INTEGER NOT NULL,
                time_ms INTEGER NOT NULL,
                timestamp INTEGER NOT NULL
            )",
            [],
        )?;

        // Create index on timestamp for faster queries
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC)",
            [],
        )?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    pub fn add_entry(&self, entry: &HistoryEntry) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO history (id, method, url, status, time_ms, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            (
                &entry.id,
                &entry.method,
                &entry.url,
                entry.status,
                entry.time_ms as i64,
                entry.timestamp,
            ),
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> SqlResult<Vec<HistoryEntry>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, method, url, status, time_ms, timestamp 
             FROM history 
             ORDER BY timestamp DESC 
             LIMIT 50"
        )?;

        let entries = stmt.query_map([], |row| {
            Ok(HistoryEntry {
                id: row.get(0)?,
                method: row.get(1)?,
                url: row.get(2)?,
                status: row.get(3)?,
                time_ms: row.get::<_, i64>(4)? as u128,
                timestamp: row.get(5)?,
            })
        })?;

        let mut result = Vec::new();
        for entry in entries {
            result.push(entry?);
        }
        Ok(result)
    }

    pub fn clear_all(&self) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM history", [])?;
        Ok(())
    }
}
