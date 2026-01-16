// Centralized application state
const state = {
    request: {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1',
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

function addToHistory(item) {
    // History is now managed by Rust, just update local state
    state.history.unshift(item);
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
}

async function clearHistory() {
    if (window.__TAURI__) {
        try {
            const { invoke } = window.__TAURI__.core;
            await invoke('clear_history');
            state.history = [];
        } catch (e) {
            console.error('Failed to clear history:', e);
            throw e;
        }
    } else {
        // Fallback for browser testing
        state.history = [];
        localStorage.removeItem('prism-history');
    }
}

async function loadHistory() {
    if (window.__TAURI__) {
        try {
            const { invoke } = window.__TAURI__.core;
            const history = await invoke('get_history');
            state.history = history;
        } catch (e) {
            console.error('Failed to load history:', e);
            state.history = [];
        }
    } else {
        // Fallback for browser testing
        try {
            const saved = localStorage.getItem('prism-history');
            if (saved) {
                state.history = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }
}

// Environment variables management
async function loadEnvVars() {
    if (window.__TAURI__) {
        try {
            const { invoke } = window.__TAURI__.core;
            const envVars = await invoke('get_env_vars');
            state.envVars = envVars;
        } catch (e) {
            console.error('Failed to load env vars:', e);
            state.envVars = [];
        }
    } else {
        // Fallback for browser testing
        try {
            const saved = localStorage.getItem('prism-env-vars');
            if (saved) {
                state.envVars = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load env vars:', e);
        }
    }
}

async function setEnvVar(key, value) {
    if (window.__TAURI__) {
        try {
            const { invoke } = window.__TAURI__.core;
            await invoke('set_env_var', { key, value });
            await loadEnvVars();
        } catch (e) {
            console.error('Failed to set env var:', e);
            throw e;
        }
    } else {
        // Fallback for browser testing
        const existing = state.envVars.findIndex(v => v.key === key);
        if (existing >= 0) {
            state.envVars[existing].value = value;
        } else {
            state.envVars.push({ key, value });
        }
        localStorage.setItem('prism-env-vars', JSON.stringify(state.envVars));
    }
}

async function deleteEnvVar(key) {
    if (window.__TAURI__) {
        try {
            const { invoke } = window.__TAURI__.core;
            await invoke('delete_env_var', { key });
            await loadEnvVars();
        } catch (e) {
            console.error('Failed to delete env var:', e);
            throw e;
        }
    } else {
        // Fallback for browser testing
        state.envVars = state.envVars.filter(v => v.key !== key);
        localStorage.setItem('prism-env-vars', JSON.stringify(state.envVars));
    }
}
