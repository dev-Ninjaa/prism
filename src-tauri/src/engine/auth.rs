use crate::models::AuthPayload;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use std::str::FromStr;
use base64::Engine;

pub fn apply_auth(
    auth: &AuthPayload,
    headers: &mut HeaderMap,
    _url: &mut url::Url,
) -> Result<(), String> {
    match auth.auth_type.as_str() {
        "bearer" => {
            if let Some(token) = &auth.token {
                let value = HeaderValue::from_str(&format!("Bearer {}", token))
                    .map_err(|e| format!("Invalid bearer token: {}", e))?;
                headers.insert("authorization", value);
            }
        }
        "apikey" => {
            if let (Some(key), Some(value)) = (&auth.api_key, &auth.api_value) {
                // Try to add as header
                if let (Ok(header_name), Ok(header_value)) = (
                    HeaderName::from_str(key),
                    HeaderValue::from_str(value),
                ) {
                    headers.insert(header_name, header_value);
                }
            }
        }
        "basic" => {
            if let (Some(username), Some(password)) = (&auth.username, &auth.password) {
                let credentials = base64::engine::general_purpose::STANDARD
                    .encode(format!("{}:{}", username, password));
                let value = HeaderValue::from_str(&format!("Basic {}", credentials))
                    .map_err(|e| format!("Invalid basic auth: {}", e))?;
                headers.insert("authorization", value);
            }
        }
        _ => {} // "none" or unknown
    }
    Ok(())
}
