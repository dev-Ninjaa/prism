// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod engine;
mod store;
mod env;
mod workspace;

use models::{ApiRequest, ApiResponse};
use store::{Store, models::HistoryEntry};
use env::{EnvStore, EnvVar, resolve_variables};
use workspace::{save_request_to_file, load_request_from_file};
use std::sync::Arc;
use std::collections::HashMap;
use tauri::{State, Manager, AppHandle};

struct AppState {
    store: Arc<Store>,
    env_store: Arc<EnvStore>,
}

#[tauri::command]
async fn send_request(
    req: ApiRequest,
    state: State<'_, AppState>,
) -> Result<ApiResponse, String> {
    // Resolve environment variables
    let resolved_req = resolve_request_variables(req.clone(), &state.env_store)?;
    
    let response = engine::http::execute_request(resolved_req.clone()).await?;
    
    // Save to history (use original URL for display)
    let entry = HistoryEntry::new(
        req.method,
        req.url,
        response.status,
        response.time,
    );
    
    // Don't fail the request if history save fails
    if let Err(e) = state.store.add_history_entry(entry) {
        eprintln!("Warning: Failed to save history: {}", e);
    }
    
    Ok(response)
}

#[tauri::command]
fn get_history(state: State<'_, AppState>) -> Result<Vec<HistoryEntry>, String> {
    state.store.get_history()
}

#[tauri::command]
fn clear_history(state: State<'_, AppState>) -> Result<(), String> {
    state.store.clear_history()
}

#[tauri::command]
fn export_curl(req: ApiRequest, state: State<'_, AppState>) -> Result<String, String> {
    // Resolve environment variables before generating cURL
    let resolved_req = resolve_request_variables(req, &state.env_store)?;
    Ok(engine::curl::to_curl(&resolved_req))
}

#[tauri::command]
fn get_env_vars(state: State<'_, AppState>) -> Result<Vec<EnvVar>, String> {
    state.env_store.get_all()
        .map_err(|e| format!("Failed to get env vars: {}", e))
}

#[tauri::command]
fn set_env_var(key: String, value: String, state: State<'_, AppState>) -> Result<(), String> {
    state.env_store.set(&key, &value)
        .map_err(|e| format!("Failed to set env var: {}", e))
}

#[tauri::command]
fn delete_env_var(key: String, state: State<'_, AppState>) -> Result<(), String> {
    state.env_store.delete(&key)
        .map_err(|e| format!("Failed to delete env var: {}", e))
}

#[tauri::command]
async fn save_request(app: AppHandle, req: ApiRequest) -> Result<(), String> {
    use tauri_plugin_dialog::{DialogExt, FilePath};
    
    // Open save dialog (blocking)
    let file_path = app.dialog()
        .file()
        .set_title("Save Request")
        .add_filter("JSON Files", &["json"])
        .set_file_name("request.json")
        .blocking_save_file();
    
    if let Some(path) = file_path {
        let path_str = match path {
            FilePath::Path(p) => p.to_str()
                .ok_or_else(|| "Invalid file path".to_string())?.to_string(),
            FilePath::Url(u) => return Err("URL paths not supported".to_string()),
        };
        
        save_request_to_file(req, &path_str)?;
    }
    
    Ok(())
}

#[tauri::command]
async fn load_request(app: AppHandle) -> Result<ApiRequest, String> {
    use tauri_plugin_dialog::{DialogExt, FilePath};
    
    // Open file dialog (blocking)
    let file_path = app.dialog()
        .file()
        .set_title("Load Request")
        .add_filter("JSON Files", &["json"])
        .blocking_pick_file();
    
    if let Some(path) = file_path {
        let path_str = match path {
            FilePath::Path(p) => p.to_str()
                .ok_or_else(|| "Invalid file path".to_string())?.to_string(),
            FilePath::Url(u) => return Err("URL paths not supported".to_string()),
        };
        
        let request = load_request_from_file(&path_str)?;
        return Ok(request);
    }
    
    Err("No file selected".to_string())
}

/// Resolves environment variables in an ApiRequest
fn resolve_request_variables(mut req: ApiRequest, env_store: &EnvStore) -> Result<ApiRequest, String> {
    // Load all env vars into a HashMap
    let env_vars = env_store.get_all()
        .map_err(|e| format!("Failed to load env vars: {}", e))?;
    
    let env_map: HashMap<String, String> = env_vars
        .into_iter()
        .map(|var| (var.key, var.value))
        .collect();
    
    // Resolve URL
    req.url = resolve_variables(&req.url, &env_map);
    
    // Resolve params
    for param in &mut req.params {
        param.key = resolve_variables(&param.key, &env_map);
        param.value = resolve_variables(&param.value, &env_map);
    }
    
    // Resolve headers
    for header in &mut req.headers {
        header.key = resolve_variables(&header.key, &env_map);
        header.value = resolve_variables(&header.value, &env_map);
    }
    
    // Resolve body
    if let Some(body) = &req.body {
        req.body = Some(resolve_variables(body, &env_map));
    }
    
    // Resolve auth fields
    if let Some(token) = &req.auth.token {
        req.auth.token = Some(resolve_variables(token, &env_map));
    }
    if let Some(api_key) = &req.auth.api_key {
        req.auth.api_key = Some(resolve_variables(api_key, &env_map));
    }
    if let Some(api_value) = &req.auth.api_value {
        req.auth.api_value = Some(resolve_variables(api_value, &env_map));
    }
    if let Some(username) = &req.auth.username {
        req.auth.username = Some(resolve_variables(username, &env_map));
    }
    if let Some(password) = &req.auth.password {
        req.auth.password = Some(resolve_variables(password, &env_map));
    }
    
    Ok(req)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Initialize database
            let app_data_dir = app.path().app_data_dir()
                .expect("Failed to get app data directory");
            
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");
            
            let history_db_path = app_data_dir.join("history.db");
            let store = Store::new(history_db_path.to_str().unwrap())
                .expect("Failed to initialize store");
            
            let env_db_path = app_data_dir.join("env.db");
            let env_store = EnvStore::new(env_db_path.to_str().unwrap())
                .expect("Failed to initialize env store");
            
            let app_state = AppState {
                store: Arc::new(store),
                env_store: Arc::new(env_store),
            };
            
            app.manage(app_state);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            send_request,
            get_history,
            clear_history,
            export_curl,
            get_env_vars,
            set_env_var,
            delete_env_var,
            save_request,
            load_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
