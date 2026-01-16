use std::collections::HashMap;

/// Resolves {{VAR}} syntax in strings using provided environment variables
/// - Exact match, case-sensitive
/// - Single pass, no recursion
/// - Unresolved variables remain unchanged
pub fn resolve_variables(input: &str, env_vars: &HashMap<String, String>) -> String {
    let mut result = String::with_capacity(input.len());
    let mut chars = input.chars().peekable();
    
    while let Some(ch) = chars.next() {
        if ch == '{' {
            if let Some(&next_ch) = chars.peek() {
                if next_ch == '{' {
                    // Found opening {{
                    chars.next(); // consume second {
                    
                    // Extract variable name
                    let var_name = extract_var_name(&mut chars);
                    
                    // Try to resolve
                    if let Some(value) = env_vars.get(&var_name) {
                        result.push_str(value);
                    } else {
                        // Keep original if not found
                        result.push_str("{{");
                        result.push_str(&var_name);
                        result.push_str("}}");
                    }
                    continue;
                }
            }
        }
        result.push(ch);
    }
    
    result
}

fn extract_var_name(chars: &mut std::iter::Peekable<std::str::Chars>) -> String {
    let mut var_name = String::new();
    let mut found_closing = false;
    
    while let Some(ch) = chars.next() {
        if ch == '}' {
            if let Some(&next_ch) = chars.peek() {
                if next_ch == '}' {
                    chars.next(); // consume second }
                    found_closing = true;
                    break;
                }
            }
        }
        var_name.push(ch);
    }
    
    if !found_closing {
        // Malformed, return as-is (will be wrapped back with {{}} by caller)
        var_name
    } else {
        var_name
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_replacement() {
        let mut vars = HashMap::new();
        vars.insert("API_URL".to_string(), "https://api.example.com".to_string());
        
        let result = resolve_variables("{{API_URL}}/users", &vars);
        assert_eq!(result, "https://api.example.com/users");
    }

    #[test]
    fn test_multiple_variables() {
        let mut vars = HashMap::new();
        vars.insert("HOST".to_string(), "example.com".to_string());
        vars.insert("PORT".to_string(), "8080".to_string());
        
        let result = resolve_variables("http://{{HOST}}:{{PORT}}/api", &vars);
        assert_eq!(result, "http://example.com:8080/api");
    }

    #[test]
    fn test_unresolved_variable() {
        let vars = HashMap::new();
        
        let result = resolve_variables("{{UNKNOWN}}/path", &vars);
        assert_eq!(result, "{{UNKNOWN}}/path");
    }

    #[test]
    fn test_no_variables() {
        let vars = HashMap::new();
        
        let result = resolve_variables("https://api.example.com", &vars);
        assert_eq!(result, "https://api.example.com");
    }

    #[test]
    fn test_case_sensitive() {
        let mut vars = HashMap::new();
        vars.insert("token".to_string(), "lowercase".to_string());
        
        let result = resolve_variables("{{TOKEN}}", &vars);
        assert_eq!(result, "{{TOKEN}}"); // Not resolved
        
        let result2 = resolve_variables("{{token}}", &vars);
        assert_eq!(result2, "lowercase"); // Resolved
    }

    #[test]
    fn test_partial_braces() {
        let vars = HashMap::new();
        
        let result = resolve_variables("{single}", &vars);
        assert_eq!(result, "{single}");
    }
}
