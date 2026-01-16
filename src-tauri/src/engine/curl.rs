use crate::models::ApiRequest;

/// Converts an ApiRequest into a cURL command string
pub fn to_curl(req: &ApiRequest) -> String {
    let mut parts = vec!["curl".to_string()];

    // Add method if not GET
    if req.method.to_uppercase() != "GET" {
        parts.push(format!("-X {}", req.method.to_uppercase()));
    }

    // Build URL with query parameters
    let full_url = build_url_with_params(req);
    parts.push(format!("'{}'", escape_single_quotes(&full_url)));

    // Add headers
    for header in req.headers.iter().filter(|h| h.enabled) {
        parts.push(format!(
            "-H '{}: {}'",
            escape_single_quotes(&header.key),
            escape_single_quotes(&header.value)
        ));
    }

    // Add authentication
    add_auth_to_curl(&mut parts, req);

    // Add body if present
    if let Some(body) = &req.body {
        if !body.trim().is_empty() {
            // Add Content-Type header if not already present and body looks like JSON
            if !has_content_type_header(req) && is_json_body(body) {
                parts.push("-H 'Content-Type: application/json'".to_string());
            }
            
            parts.push(format!("-d '{}'", escape_single_quotes(body)));
        }
    }

    // Join with line breaks for readability
    format_curl_command(&parts)
}

fn build_url_with_params(req: &ApiRequest) -> String {
    let mut url = req.url.clone();
    
    let enabled_params: Vec<_> = req.params.iter()
        .filter(|p| p.enabled)
        .collect();
    
    if !enabled_params.is_empty() {
        let separator = if url.contains('?') { '&' } else { '?' };
        let params_str = enabled_params
            .iter()
            .map(|p| format!("{}={}", 
                urlencoding::encode(&p.key), 
                urlencoding::encode(&p.value)
            ))
            .collect::<Vec<_>>()
            .join("&");
        
        url = format!("{}{}{}", url, separator, params_str);
    }
    
    url
}

fn add_auth_to_curl(parts: &mut Vec<String>, req: &ApiRequest) {
    match req.auth.auth_type.as_str() {
        "bearer" => {
            if let Some(token) = &req.auth.token {
                if !token.is_empty() {
                    parts.push(format!(
                        "-H 'Authorization: Bearer {}'",
                        escape_single_quotes(token)
                    ));
                }
            }
        }
        "apikey" => {
            if let (Some(key), Some(value)) = (&req.auth.api_key, &req.auth.api_value) {
                if !key.is_empty() && !value.is_empty() {
                    parts.push(format!(
                        "-H '{}: {}'",
                        escape_single_quotes(key),
                        escape_single_quotes(value)
                    ));
                }
            }
        }
        "basic" => {
            if let (Some(username), Some(password)) = (&req.auth.username, &req.auth.password) {
                if !username.is_empty() {
                    parts.push(format!(
                        "-u '{}:{}'",
                        escape_single_quotes(username),
                        escape_single_quotes(password)
                    ));
                }
            }
        }
        _ => {} // "none" or unknown
    }
}

fn has_content_type_header(req: &ApiRequest) -> bool {
    req.headers.iter()
        .filter(|h| h.enabled)
        .any(|h| h.key.to_lowercase() == "content-type")
}

fn is_json_body(body: &str) -> bool {
    let trimmed = body.trim();
    (trimmed.starts_with('{') && trimmed.ends_with('}')) ||
    (trimmed.starts_with('[') && trimmed.ends_with(']'))
}

fn escape_single_quotes(s: &str) -> String {
    // Escape single quotes for POSIX shell
    // Replace ' with '\''
    s.replace('\'', "'\\''")
}

fn format_curl_command(parts: &[String]) -> String {
    if parts.len() <= 3 {
        // Short command, keep on one line
        parts.join(" ")
    } else {
        // Long command, use line breaks
        let mut result = parts[0].clone();
        for part in &parts[1..] {
            result.push_str(" \\\n  ");
            result.push_str(part);
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{ApiRequest, AuthPayload, KeyValue};

    #[test]
    fn test_simple_get() {
        let req = ApiRequest {
            method: "GET".to_string(),
            url: "https://api.example.com/users".to_string(),
            params: vec![],
            headers: vec![],
            body: None,
            auth: AuthPayload {
                auth_type: "none".to_string(),
                token: None,
                api_key: None,
                api_value: None,
                username: None,
                password: None,
            },
        };

        let curl = to_curl(&req);
        assert!(curl.contains("curl"));
        assert!(curl.contains("https://api.example.com/users"));
    }

    #[test]
    fn test_post_with_json() {
        let req = ApiRequest {
            method: "POST".to_string(),
            url: "https://api.example.com/users".to_string(),
            params: vec![],
            headers: vec![],
            body: Some(r#"{"name":"John"}"#.to_string()),
            auth: AuthPayload {
                auth_type: "none".to_string(),
                token: None,
                api_key: None,
                api_value: None,
                username: None,
                password: None,
            },
        };

        let curl = to_curl(&req);
        assert!(curl.contains("-X POST"));
        assert!(curl.contains("Content-Type: application/json"));
        assert!(curl.contains(r#"{"name":"John"}"#));
    }

    #[test]
    fn test_bearer_auth() {
        let req = ApiRequest {
            method: "GET".to_string(),
            url: "https://api.example.com/protected".to_string(),
            params: vec![],
            headers: vec![],
            body: None,
            auth: AuthPayload {
                auth_type: "bearer".to_string(),
                token: Some("secret-token".to_string()),
                api_key: None,
                api_value: None,
                username: None,
                password: None,
            },
        };

        let curl = to_curl(&req);
        assert!(curl.contains("Authorization: Bearer secret-token"));
    }

    #[test]
    fn test_query_params() {
        let req = ApiRequest {
            method: "GET".to_string(),
            url: "https://api.example.com/search".to_string(),
            params: vec![
                KeyValue {
                    enabled: true,
                    key: "q".to_string(),
                    value: "test query".to_string(),
                },
            ],
            headers: vec![],
            body: None,
            auth: AuthPayload {
                auth_type: "none".to_string(),
                token: None,
                api_key: None,
                api_value: None,
                username: None,
                password: None,
            },
        };

        let curl = to_curl(&req);
        assert!(curl.contains("q=test%20query"));
    }
}
