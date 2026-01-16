// Request bar controls
function initRequestBar() {
    const methodSelect = document.getElementById('methodSelect');
    const urlInput = document.getElementById('urlInput');
    const sendBtn = document.getElementById('sendBtn');
    const exportCurlBtn = document.getElementById('exportCurlBtn');
    const saveRequestBtn = document.getElementById('saveRequestBtn');
    const loadRequestBtn = document.getElementById('loadRequestBtn');

    methodSelect.addEventListener('change', (e) => {
        updateRequest({ method: e.target.value });
    });

    urlInput.addEventListener('input', (e) => {
        updateRequest({ url: e.target.value });
    });

    sendBtn.addEventListener('click', handleSendRequest);

    exportCurlBtn.addEventListener('click', handleExportCurl);
    
    if (saveRequestBtn) {
        saveRequestBtn.addEventListener('click', handleSaveRequest);
    }
    
    if (loadRequestBtn) {
        loadRequestBtn.addEventListener('click', handleLoadRequest);
    }

    // Allow Enter key to send request
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendRequest();
        }
    });
}

async function handleSendRequest() {
    const sendBtn = document.getElementById('sendBtn');
    const responseViewer = document.getElementById('responseViewer');

    if (!state.request.url.trim()) {
        alert('Please enter a URL');
        return;
    }

    // Show loading state
    sendBtn.classList.add('loading');
    sendBtn.disabled = true;

    try {
        const response = await generateMockResponse(state.request);
        setResponse(response);
        
        // Reload history from Rust (it's already saved there)
        await loadHistory();

        // Update UI
        renderResponse(response);
        renderHistory();
        responseViewer.style.display = 'flex';
    } catch (error) {
        console.error('Request failed:', error);
        alert('Request failed: ' + error.message);
    } finally {
        sendBtn.classList.remove('loading');
        sendBtn.disabled = false;
    }
}

async function handleExportCurl() {
    if (!state.request.url.trim()) {
        alert('Please enter a URL');
        return;
    }

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const curlCommand = await invoke('export_curl', { 
                req: state.request 
            });
            
            // Copy to clipboard
            await navigator.clipboard.writeText(curlCommand);
            
            // Show success feedback
            const btn = document.getElementById('exportCurlBtn');
            const originalTitle = btn.title;
            btn.title = 'Copied!';
            btn.style.color = 'var(--success)';
            
            setTimeout(() => {
                btn.title = originalTitle;
                btn.style.color = '';
            }, 2000);
        } else {
            alert('cURL export is only available in the desktop app');
        }
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export cURL: ' + error);
    }
}

async function handleSaveRequest() {
    if (!state.request.url.trim()) {
        alert('Please enter a URL before saving');
        return;
    }

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            await invoke('save_request', { req: state.request });
            
            // Show success feedback
            const btn = document.getElementById('saveRequestBtn');
            const originalTitle = btn.title;
            btn.title = 'Saved!';
            btn.style.color = 'var(--success)';
            
            setTimeout(() => {
                btn.title = originalTitle;
                btn.style.color = '';
            }, 2000);
        } else {
            alert('Save request is only available in the desktop app');
        }
    } catch (error) {
        console.error('Save failed:', error);
        // User cancelled or error - don't show alert for cancellation
        if (error && !error.includes('No file selected')) {
            alert('Failed to save request: ' + error);
        }
    }
}

async function handleLoadRequest() {
    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const loadedRequest = await invoke('load_request');
            
            // Populate the UI with loaded request
            state.request = loadedRequest;
            
            // Update UI elements
            document.getElementById('methodSelect').value = loadedRequest.method;
            document.getElementById('urlInput').value = loadedRequest.url;
            
            // Update params, headers, body, auth
            renderParams();
            renderHeaders();
            renderBody();
            renderAuth();
            
            // Show success feedback
            const btn = document.getElementById('loadRequestBtn');
            const originalTitle = btn.title;
            btn.title = 'Loaded!';
            btn.style.color = 'var(--success)';
            
            setTimeout(() => {
                btn.title = originalTitle;
                btn.style.color = '';
            }, 2000);
        } else {
            alert('Load request is only available in the desktop app');
        }
    } catch (error) {
        console.error('Load failed:', error);
        // User cancelled or error - don't show alert for cancellation
        if (error && !error.includes('No file selected')) {
            alert('Failed to load request: ' + error);
        }
    }
}

// Helper functions to render loaded data
function renderParams() {
    // Params rendering is handled by the existing UI
    // This is a placeholder for future implementation
}

function renderHeaders() {
    // Headers rendering is handled by the existing UI
    // This is a placeholder for future implementation
}

function renderBody() {
    const bodyEditor = document.querySelector('.body-editor');
    if (bodyEditor && state.request.body) {
        bodyEditor.value = state.request.body;
    }
}

function renderAuth() {
    const authTypeSelect = document.getElementById('authTypeSelect');
    if (authTypeSelect) {
        authTypeSelect.value = state.request.auth.type;
        // Trigger change event to update auth fields
        authTypeSelect.dispatchEvent(new Event('change'));
    }
}
