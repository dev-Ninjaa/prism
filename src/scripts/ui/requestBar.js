// Request bar controls
function initRequestBar() {
    try {
        const methodSelect = document.getElementById('methodSelect');
        const urlInput = document.getElementById('urlInput');
        const sendBtn = document.getElementById('sendBtn');
        const exportCurlBtn = document.getElementById('exportCurlBtn');
        const saveRequestBtn = document.getElementById('saveRequestBtn');
        const loadRequestBtn = document.getElementById('loadRequestBtn');
        const addParamBtn = document.getElementById('addParamBtn');
        const addHeaderBtn = document.getElementById('addHeaderBtn');
        const bodyEditor = document.querySelector('.body-editor');

        if (!methodSelect || !urlInput || !sendBtn) {
            console.error('Critical UI elements missing in Request Bar');
            return;
        }

        methodSelect.addEventListener('change', (e) => {
            updateRequest({ method: e.target.value });
        });

        urlInput.addEventListener('input', (e) => {
            updateRequest({ url: e.target.value });
        });

        if (bodyEditor) {
            bodyEditor.addEventListener('input', (e) => {
                updateRequest({ body: e.target.value });
            });
        }

        sendBtn.addEventListener('click', () => {
            handleSendRequest();
        });

        // Initialize from URL search params if present
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('url')) {
            urlInput.value = urlParams.get('url');
            updateRequest({ url: urlInput.value });
        }

        if (exportCurlBtn) exportCurlBtn.addEventListener('click', handleExportCurl);
        if (saveRequestBtn) saveRequestBtn.addEventListener('click', handleSaveRequest);
        if (loadRequestBtn) loadRequestBtn.addEventListener('click', handleLoadRequest);

        if (addParamBtn) {
            addParamBtn.addEventListener('click', () => {
                state.request.params.push({ key: '', value: '', enabled: true });
                renderParams();
            });
        }

        if (addHeaderBtn) {
            addHeaderBtn.addEventListener('click', () => {
                state.request.headers.push({ key: '', value: '', enabled: true });
                renderHeaders();
            });
        }

        // Allow Enter key to send request
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendRequest();
            }
        });

        // Initialize UI from state
        methodSelect.value = state.request.method;
        urlInput.value = state.request.url;
        if (bodyEditor) bodyEditor.value = state.request.body;
        renderParams();
        renderHeaders();
    } catch (e) {
        console.error('Failed to initialize Request Bar:', e);
    }
}

async function handleSendRequest() {
    const sendBtn = document.getElementById('sendBtn');
    const responseViewer = document.getElementById('responseViewer');

    if (!state.request.url || !state.request.url.trim()) {
        alert('Please enter a URL');
        return;
    }

    // Show loading state
    sendBtn.disabled = true;
    const btnText = sendBtn.querySelector('.btn-text');
    const btnLoader = sendBtn.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';

    try {
        // Try multiple ways to get invoke for maximum compatibility
        let invoke;
        if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
            invoke = window.__TAURI__.core.invoke;
        } else if (window.__TAURI_INVOKE__) {
            invoke = window.__TAURI_INVOKE__;
        } else if (window.__TAURI__ && window.__TAURI__.invoke) {
            invoke = window.__TAURI__.invoke;
        }

        if (!invoke) {
            throw new Error('Tauri invoke not found. Are you running in a web browser?');
        }

        // Deep clone the request to avoid proxy/reference issues
        const requestPayload = JSON.parse(JSON.stringify(state.request));
        
        const response = await invoke('send_request', { 
            req: requestPayload
        });
        
        setResponse(response);
        
        // Reload history
        await loadHistory();

        // Update UI
        renderResponse(response);
        renderHistory();
        if (responseViewer) responseViewer.style.display = 'flex';
    } catch (error) {
        console.error('Request failed:', error);
        alert('Request failed: ' + (error.message || error));
    } finally {
        sendBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline-block';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

async function handleExportCurl() {
    if (!state.request.url.trim()) {
        alert('Please enter a URL');
        return;
    }

    try {
        const { invoke } = window.__TAURI__.core;
        const curlCommand = await invoke('export_curl', { 
            req: structuredClone(state.request)
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
        const { invoke } = window.__TAURI__.core;
        await invoke('save_request', { req: structuredClone(state.request) });
        
        // Show success feedback
        const btn = document.getElementById('saveRequestBtn');
        const originalTitle = btn.title;
        btn.title = 'Saved!';
        btn.style.color = 'var(--success)';
        
        setTimeout(() => {
            btn.title = originalTitle;
            btn.style.color = '';
        }, 2000);
    } catch (error) {
        console.error('Save failed:', error);
        if (error && !error.toString().includes('No file selected')) {
            alert('Failed to save request: ' + error);
        }
    }
}

async function handleLoadRequest() {
    try {
        const { invoke } = window.__TAURI__.core;
        const loadedRequest = await invoke('load_request');
        if (!loadedRequest) return;
        
        // Populate the UI with loaded request
        state.request = loadedRequest;
        
        // Update UI elements
        document.getElementById('methodSelect').value = loadedRequest.method;
        document.getElementById('urlInput').value = loadedRequest.url;
        document.querySelector('.body-editor').value = loadedRequest.body || '';
        
        // Update params, headers, body, auth
        renderParams();
        renderHeaders();
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
    } catch (error) {
        console.error('Load failed:', error);
        if (error && !error.toString().includes('No file selected')) {
            alert('Failed to load request: ' + error);
        }
    }
}

// Helper functions to render loaded data
function renderParams() {
    const container = document.getElementById('paramsList');
    if (!container) return;
    renderKVList(container, state.request.params, 'params');
}

function renderHeaders() {
    const container = document.getElementById('headersList');
    if (!container) return;
    renderKVList(container, state.request.headers, 'headers');
}

function renderKVList(container, items, type) {
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">No items</div>';
        return;
    }

    container.innerHTML = items.map((item, index) => `
        <div class="kv-row" data-index="${index}">
            <input type="checkbox" ${item.enabled ? 'checked' : ''} class="kv-enabled">
            <input type="text" placeholder="key" value="${escapeHtml(item.key)}" class="kv-key">
            <input type="text" placeholder="value" value="${escapeHtml(item.value)}" class="kv-value">
            <button class="btn-icon-small btn-delete-kv">×</button>
        </div>
    `).join('');

    // Add listeners
    container.querySelectorAll('.kv-row').forEach(row => {
        const index = parseInt(row.dataset.index);
        const enabledInput = row.querySelector('.kv-enabled');
        const keyInput = row.querySelector('.kv-key');
        const valueInput = row.querySelector('.kv-value');
        const deleteBtn = row.querySelector('.btn-delete-kv');

        enabledInput.addEventListener('change', (e) => {
            items[index].enabled = e.target.checked;
        });

        keyInput.addEventListener('input', (e) => {
            items[index].key = e.target.value;
        });

        valueInput.addEventListener('input', (e) => {
            items[index].value = e.target.value;
        });

        deleteBtn.addEventListener('click', () => {
            items.splice(index, 1);
            if (type === 'params') renderParams();
            else renderHeaders();
        });
    });
}

function renderAuth() {
    const authTypeSelect = document.getElementById('authTypeSelect');
    if (authTypeSelect) {
        authTypeSelect.value = state.request.auth.type;
        // Trigger change event to update auth fields
        authTypeSelect.dispatchEvent(new Event('change'));
    }
}
