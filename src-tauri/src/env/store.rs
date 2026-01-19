use rusqlite::{Connection, Result as SqlResult};
use std::sync::Mutex;
use super::models::EnvVar;

pub struct EnvStore {
    conn: Mutex<Connection>,
}

impl EnvStore {
    pub fn new(db_path: &str) -> SqlResult<Self> {
        let conn = Connection::open(db_path)?;
        
        // Create env_vars table if not exists
        conn.execute(
            "CREATE TABLE IF NOT EXISTS env_vars (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        Ok(EnvStore {
            conn: Mutex::new(conn),
        })
    }

    pub fn get_all(&self) -> SqlResult<Vec<EnvVar>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT key, value FROM env_vars ORDER BY key")?;

        let vars = stmt.query_map([], |row| {
            Ok(EnvVar {
                key: row.get(0)?,
                value: row.get(1)?,
            })
        })?;

        let mut result = Vec::new();
        for var in vars {
            result.push(var?);
        }
        Ok(result)
    }

    pub fn set(&self, key: &str, value: &str) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO env_vars (key, value) VALUES (?1, ?2)",
            (key, value),
        )?;
        Ok(())
    }

    pub fn delete(&self, key: &str) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM env_vars WHERE key = ?1", [key])?;
        Ok(())
    }
}
