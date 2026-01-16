use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub method: String,
    pub url: String,
    pub status: u16,
    #[serde(rename = "time")]
    pub time_ms: u128,
    pub timestamp: i64,
}

impl HistoryEntry {
    pub fn new(method: String, url: String, status: u16, time_ms: u128) -> Self {
        let timestamp = chrono::Utc::now().timestamp_millis();
        let id = format!("{}-{}", timestamp, uuid_simple());
        
        Self {
            id,
            method,
            url,
            status,
            time_ms,
            timestamp,
        }
    }
}

// Simple UUID-like generator
fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .subsec_nanos();
    format!("{:x}", nanos)
}
