use rusqlite::{Connection, Result as SqlResult};
use std::sync::Mutex;
use super::models::EnvVar;

pub struct EnvStore {
    conn: Mutex<Connection>,
}

impl EnvStore {
    pub fn new(db_path: &str) -> SqlResult<Self> {
        let conn = Connection::open(db_path)?;
        
        // Create env_vars table if not exists (includes enabled flag)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS env_vars (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                enabled INTEGER DEFAULT 1
            )",
            [],
        )?;

        // Ensure backward compatibility: add 'enabled' column if missing
        {
            let mut stmt = conn.prepare("PRAGMA table_info(env_vars)")?;
            let mut rows = stmt.query([])?;
            let mut has_enabled = false;
            while let Some(row) = rows.next()? {
                let col_name: String = row.get(1)?;
                if col_name == "enabled" {
                    has_enabled = true;
                    break;
                }
            }
            if !has_enabled {
                conn.execute("ALTER TABLE env_vars ADD COLUMN enabled INTEGER DEFAULT 1", [])?;
            }
        }

        Ok(EnvStore {
            conn: Mutex::new(conn),
        })
    }

    pub fn get_all(&self) -> SqlResult<Vec<EnvVar>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT key, value, COALESCE(enabled,1) FROM env_vars ORDER BY key")?;

        let vars = stmt.query_map([], |row| {
            Ok(EnvVar {
                key: row.get(0)?,
                value: row.get(1)?,
                enabled: row.get(2)?,
            })
        })?;

        let mut result = Vec::new();
        for var in vars {
            result.push(var?);
        }
        Ok(result)
    }

    pub fn set(&self, key: &str, value: &str, enabled: bool) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO env_vars (key, value, enabled) VALUES (?1, ?2, ?3)",
            (key, value, enabled as i32),
        )?;
        Ok(())
    }

    pub fn delete(&self, key: &str) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM env_vars WHERE key = ?1", [key])?;
        Ok(())
    }
}
