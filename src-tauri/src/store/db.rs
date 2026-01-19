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
                timestamp INTEGER NOT NULL,
                request_json TEXT,
                response_json TEXT
            )",
            [],
        )?;

        // Migration: Add request_json column if it doesn't exist
        let _ = conn.execute("ALTER TABLE history ADD COLUMN request_json TEXT", []);
        let _ = conn.execute("ALTER TABLE history ADD COLUMN response_json TEXT", []);

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
        let request_json = serde_json::to_string(&entry.request).unwrap_or_default();
        let response_json = serde_json::to_string(&entry.response).unwrap_or_default();
        conn.execute(
            "INSERT INTO history (id, method, url, status, time_ms, timestamp, request_json, response_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            (
                &entry.id,
                &entry.method,
                &entry.url,
                entry.status,
                entry.time_ms as i64,
                entry.timestamp,
                &request_json,
                &response_json,
            ),
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> SqlResult<Vec<HistoryEntry>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, method, url, status, time_ms, timestamp, request_json, response_json 
             FROM history 
             ORDER BY timestamp DESC 
             LIMIT 50"
        )?;

        let entries = stmt.query_map([], |row| {
            let request_json: String = row.get(6).unwrap_or_default();
            let response_json: String = row.get(7).unwrap_or_default();
            
            let request = serde_json::from_str(&request_json).unwrap_or_else(|_| {
                // Fallback for old entries without request_json
                crate::models::ApiRequest {
                    method: row.get(1).unwrap_or_else(|_| "GET".to_string()),
                    url: row.get(2).unwrap_or_else(|_| "".to_string()),
                    params: Vec::new(),
                    headers: Vec::new(),
                    body: None,
                    auth: crate::models::AuthPayload::default(),
                }
            });

            let response = serde_json::from_str(&response_json).unwrap_or_else(|_| {
                // Fallback for old entries without response_json
                crate::models::ApiResponse {
                    status: row.get(3).unwrap_or(200),
                    status_text: "OK".to_string(),
                    time: row.get::<_, i64>(4).unwrap_or(0) as u128,
                    size: "0".to_string(),
                    headers: std::collections::HashMap::new(),
                    body: serde_json::Value::Null,
                }
            });

            Ok(HistoryEntry {
                id: row.get(0)?,
                method: row.get(1)?,
                url: row.get(2)?,
                status: row.get(3)?,
                time_ms: row.get::<_, i64>(4)? as u128,
                timestamp: row.get(5)?,
                request,
                response,
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
