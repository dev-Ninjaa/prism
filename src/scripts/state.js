// Centralized application state
const state = {
    request: {
        method: 'GET',
        url: '',
        params: [],
        headers: [],
        body: '',
        auth: {
            type: 'none',
            token: '',
            apiKey: '',
            apiValue: '',
            username: '',
            password: ''
        }
    },
    response: null,
    history: [],
    envVars: []
};

// State management functions
function updateRequest(updates) {
    state.request = { ...state.request, ...updates };
}

function updateAuth(updates) {
    state.request.auth = { ...state.request.auth, ...updates };
}

function setResponse(response) {
    state.response = response;
}

async function clearHistory() {
    try {
        const { invoke } = window.__TAURI__.core;
        await invoke('clear_history');
        state.history = [];
    } catch (e) {
        console.error('Failed to clear history:', e);
        throw e;
    }
}

async function loadHistory() {
    try {
        const { invoke } = window.__TAURI__.core;
        const history = await invoke('get_history');
        state.history = history;
    } catch (e) {
        console.error('Failed to load history:', e);
        state.history = [];
    }
}

// Environment variables management
async function loadEnvVars() {
    try {
        const { invoke } = window.__TAURI__.core;
        const envVars = await invoke('get_env_vars');
        state.envVars = envVars;
    } catch (e) {
        console.error('Failed to load env vars:', e);
        state.envVars = [];
    }
}

async function setEnvVar(key, value) {
    try {
        const { invoke } = window.__TAURI__.core;
        await invoke('set_env_var', { key, value });
        await loadEnvVars();
    } catch (e) {
        console.error('Failed to set env var:', e);
        throw e;
    }
}

async function deleteEnvVar(key) {
    try {
        const { invoke } = window.__TAURI__.core;
        await invoke('delete_env_var', { key });
        await loadEnvVars();
    } catch (e) {
        console.error('Failed to delete env var:', e);
        throw e;
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    if (typeof text !== 'string') return String(text);
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
