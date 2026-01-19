use serde::{Deserialize, Serialize};
use crate::models::{ApiRequest, ApiResponse};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub method: String,
    pub url: String,
    pub status: u16,
    #[serde(rename = "time")]
    pub time_ms: u128,
    pub timestamp: i64,
    pub request: ApiRequest,
    pub response: ApiResponse,
}

impl HistoryEntry {
    pub fn new(request: ApiRequest, response: ApiResponse) -> Self {
        let timestamp = chrono::Utc::now().timestamp_millis();
        let id = format!("{}-{}", timestamp, uuid_simple());
        
        Self {
            id,
            method: request.method.clone(),
            url: request.url.clone(),
            status: response.status,
            time_ms: response.time,
            timestamp,
            request,
            response,
        }
    }
}

// Simple UUID-like generator
fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or(0);
    format!("{:x}", nanos)
}
