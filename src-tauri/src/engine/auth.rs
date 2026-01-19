use crate::models::AuthPayload;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use std::str::FromStr;
use base64::Engine;

pub fn apply_auth(
    auth: &AuthPayload,
    headers: &mut HeaderMap,
    url: &mut url::Url,
) -> Result<(), String> {
    match auth.auth_type.as_str() {
        "bearer" => {
            if let Some(token) = &auth.token {
                if !token.trim().is_empty() {
                    let value = HeaderValue::from_str(&format!("Bearer {}", token))
                        .map_err(|e| format!("Invalid bearer token: {}", e))?;
                    
                    // Don't override if user already set Authorization
                    if !headers.contains_key("authorization") {
                        headers.insert("authorization", value);
                    }
                }
            }
        }
        "apikey" => {
            if let (Some(key), Some(value)) = (&auth.api_key, &auth.api_value) {
                if !key.trim().is_empty() {
                    let location = auth.api_location.as_deref().unwrap_or("header");
                    
                    if location == "query" {
                        url.query_pairs_mut().append_pair(key, value);
                    } else {
                        if let (Ok(header_name), Ok(header_value)) = (
                            HeaderName::from_str(key),
                            HeaderValue::from_str(value),
                        ) {
                            if !headers.contains_key(&header_name) {
                                headers.insert(header_name, header_value);
                            }
                        }
                    }
                }
            }
        }
        "basic" => {
            if let (Some(username), Some(password)) = (&auth.username, &auth.password) {
                if !username.trim().is_empty() && !password.trim().is_empty() {
                    let credentials = base64::engine::general_purpose::STANDARD
                        .encode(format!("{}:{}", username, password));
                    let value = HeaderValue::from_str(&format!("Basic {}", credentials))
                        .map_err(|e| format!("Invalid basic auth: {}", e))?;
                    
                    if !headers.contains_key("authorization") {
                        headers.insert("authorization", value);
                    }
                }
            }
        }
        _ => {} // "none" or unknown
    }
    Ok(())
}
