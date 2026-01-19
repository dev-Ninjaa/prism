use crate::models::{ApiRequest, ApiResponse};
use crate::engine::auth;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use std::collections::HashMap;
use std::str::FromStr;
use std::time::Instant;

pub async fn execute_request(req: ApiRequest) -> Result<ApiResponse, String> {
    let start = Instant::now();

    // Parse and build URL with query params
    let mut url = url::Url::parse(&req.url)
        .map_err(|e| format!("Invalid URL: {}", e))?;

    // Add query parameters
    for param in req.params.iter().filter(|p| p.enabled && !p.key.trim().is_empty()) {
        url.query_pairs_mut()
            .append_pair(&param.key, &param.value);
    }

    // Build headers
    let mut headers = HeaderMap::new();
    for header in req.headers.iter().filter(|h| h.enabled && !h.key.trim().is_empty()) {
        if let (Ok(name), Ok(value)) = (
            HeaderName::from_str(&header.key),
            HeaderValue::from_str(&header.value),
        ) {
            headers.insert(name, value);
        }
    }

    // Apply authentication
    auth::apply_auth(&req.auth, &mut headers, &mut url)
        .map_err(|e| format!("Auth error: {}", e))?;

    // Build HTTP client
    let mut default_headers = HeaderMap::new();
    default_headers.insert("Accept", HeaderValue::from_static("application/json, text/plain, */*"));
    default_headers.insert("Accept-Language", HeaderValue::from_static("en-US,en;q=0.9"));
    
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .default_headers(default_headers)
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;

    // Build request
    let method = reqwest::Method::from_str(&req.method.to_uppercase())
        .map_err(|e| format!("Invalid HTTP method: {}", e))?;

    let mut request_builder = client.request(method.clone(), url.as_str())
        .headers(headers);

    // Add body if present and method allows it
    if method != reqwest::Method::GET && method != reqwest::Method::DELETE {
        if let Some(body) = req.body {
            if !body.trim().is_empty() {
                request_builder = request_builder.body(body);
            }
        }
    }

    // Execute request
    let response = request_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    // Extract response data
    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason()
        .unwrap_or("Unknown")
        .to_string();

    // Extract headers
    let response_headers: HashMap<String, String> = response
        .headers()
        .iter()
        .map(|(k, v)| {
            (
                k.to_string(),
                v.to_str().unwrap_or("").to_string(),
            )
        })
        .collect();

    // Get response body
    let body_bytes = response.bytes().await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    let size_kb = body_bytes.len() as f64 / 1024.0;
    let size = format!("{:.2}", size_kb);

    // Try to parse as JSON, fallback to string
    let body_value = if let Ok(json) = serde_json::from_slice::<serde_json::Value>(&body_bytes) {
        json
    } else {
        // If not JSON, return as string
        let text = String::from_utf8_lossy(&body_bytes).to_string();
        serde_json::Value::String(text)
    };

    let elapsed = start.elapsed().as_millis();

    Ok(ApiResponse {
        status,
        status_text,
        time: elapsed,
        size,
        headers: response_headers,
        body: body_value,
    })
}
