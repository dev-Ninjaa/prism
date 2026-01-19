use serde::{Deserialize, Serialize};
use crate::models::ApiRequest;

/// Represents a saved request file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedRequest {
    pub name: String,
    pub request: ApiRequest,
}

impl SavedRequest {
    pub fn from_request(request: ApiRequest) -> Self {
        // Generate a default name from method and URL
        let name = format!("{} {}", request.method, extract_endpoint(&request.url));
        Self { name, request }
    }
}

/// Extract a readable endpoint from a URL for naming
fn extract_endpoint(url: &str) -> String {
    if let Ok(parsed) = url::Url::parse(url) {
        let path = parsed.path();
        if path.len() > 1 {
            // Take last 2 segments or full path if shorter
            let segments: Vec<&str> = path.split('/').filter(|s| !s.is_empty()).collect();
            if segments.len() > 2 {
                format!(".../{}/{}", segments[segments.len() - 2], segments[segments.len() - 1])
            } else {
                path.to_string()
            }
        } else {
            parsed.host_str().unwrap_or("Request").to_string()
        }
    } else {
        "Request".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_endpoint() {
        assert_eq!(extract_endpoint("https://api.example.com/users/123"), ".../users/123");
        assert_eq!(extract_endpoint("https://api.example.com/users"), "/users");
        assert_eq!(extract_endpoint("https://api.example.com"), "api.example.com");
    }
}
