use std::fs;
use std::path::Path;
use super::models::SavedRequest;
use crate::models::ApiRequest;

/// Save a request to a JSON file
pub fn save_request_to_file(request: ApiRequest, path: &str) -> Result<(), String> {
    let saved_request = SavedRequest::from_request(request);
    
    // Serialize to pretty JSON
    let json = serde_json::to_string_pretty(&saved_request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;
    
    // Write to file with UTF-8 encoding
    fs::write(path, json)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(())
}

/// Load a request from a JSON file
pub fn load_request_from_file(path: &str) -> Result<ApiRequest, String> {
    // Check if file exists
    if !Path::new(path).exists() {
        return Err(format!("File not found: {}", path));
    }
    
    // Read file content
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // Parse JSON
    let saved_request: SavedRequest = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    
    Ok(saved_request.request)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{AuthPayload};
    use std::fs;

    #[test]
    fn test_save_and_load_request() {
        let temp_path = "test_request.json";
        
        // Create a test request
        let request = ApiRequest {
            method: "GET".to_string(),
            url: "https://api.example.com/users".to_string(),
            params: vec![],
            headers: vec![],
            body: None,
            auth: AuthPayload::default(),
        };
        
        // Save
        save_request_to_file(request.clone(), temp_path).unwrap();
        
        // Load
        let loaded = load_request_from_file(temp_path).unwrap();
        
        // Verify
        assert_eq!(loaded.method, request.method);
        assert_eq!(loaded.url, request.url);
        
        // Cleanup
        fs::remove_file(temp_path).ok();
    }
}
