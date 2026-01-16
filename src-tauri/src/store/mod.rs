pub mod models;
pub mod db;

use std::sync::Arc;
use db::Database;
use models::HistoryEntry;

pub struct Store {
    db: Arc<Database>,
}

impl Store {
    pub fn new(db_path: &str) -> Result<Self, String> {
        let db = Database::new(db_path)
            .map_err(|e| format!("Failed to initialize database: {}", e))?;
        
        Ok(Store {
            db: Arc::new(db),
        })
    }

    pub fn add_history_entry(&self, entry: HistoryEntry) -> Result<(), String> {
        self.db.add_entry(&entry)
            .map_err(|e| format!("Failed to add history entry: {}", e))
    }

    pub fn get_history(&self) -> Result<Vec<HistoryEntry>, String> {
        self.db.get_all()
            .map_err(|e| format!("Failed to get history: {}", e))
    }

    pub fn clear_history(&self) -> Result<(), String> {
        self.db.clear_all()
            .map_err(|e| format!("Failed to clear history: {}", e))
    }
}
