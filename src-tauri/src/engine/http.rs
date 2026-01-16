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
    for param in req.params.iter().filter(|p| p.enabled) {
        url.query_pairs_mut()
            .append_pair(&param.key, &param.value);
    }

    // Build headers
    let mut headers = HeaderMap::new();
    for header in req.headers.iter().filter(|h| h.enabled) {
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
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;

    // Build request
    let method = reqwest::Method::from_str(&req.method.to_uppercase())
        .map_err(|e| format!("Invalid HTTP method: {}", e))?;

    let mut request_builder = client.request(method, url.as_str())
        .headers(headers);

    // Add body if present
    if let Some(body) = req.body {
        if !body.trim().is_empty() {
            request_builder = request_builder.body(body);
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
