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
            const val = e.target.value;
            updateRequest({ url: val });
            
            // Highlight unresolved
            if (getUnresolvedVars(val).length > 0) {
                urlInput.classList.add('unresolved-var');
            } else {
                urlInput.classList.remove('unresolved-var');
            }
        });

        if (bodyEditor) {
            bodyEditor.addEventListener('input', (e) => {
                const val = e.target.value;
                updateRequest({ body: val });
                
                // Highlight unresolved
                if (getUnresolvedVars(val).length > 0) {
                    bodyEditor.classList.add('unresolved-var');
                } else {
                    bodyEditor.classList.remove('unresolved-var');
                }
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
        if (saveToCollectionBtn) saveToCollectionBtn.addEventListener('click', handleSaveToCollection);

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

        // Body type switching
        const bodyTypeRadios = document.querySelectorAll('input[name="bodyType"]');
        bodyTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const rawBody = document.getElementById('rawBody');
                const formDataBody = document.getElementById('formDataBody');
                if (e.target.value === 'raw') {
                    rawBody.style.display = 'block';
                    formDataBody.style.display = 'none';
                } else {
                    rawBody.style.display = 'none';
                    formDataBody.style.display = 'block';
                    renderFormData();
                }
            });
        });

        // File upload
        const uploadFileBtn = document.getElementById('uploadFileBtn');
        const fileInput = document.getElementById('fileInput');
        if (uploadFileBtn && fileInput) {
            uploadFileBtn.addEventListener('click', () => {
                fileInput.click();
            });
            fileInput.addEventListener('change', handleFileSelect);
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

    // --- HARDENING: Body Validation ---
    const method = state.request.method.toUpperCase();
    if (method === 'GET' || method === 'DELETE') {
        // Body ignored for GET/DELETE (handled in backend but good to know here)
    } else {
        // Check if it's supposed to be JSON (if Content-Type header exists)
        const contentTypeHeader = state.request.headers.find(h => 
            h.enabled && h.key.toLowerCase() === 'content-type'
        );
        if (contentTypeHeader && contentTypeHeader.value.includes('application/json')) {
            if (!validateJson(state.request.body)) {
                alert('Invalid JSON body');
                return;
            }
        }
    }

    // --- HARDENING: Env Resolution Check ---
    const unresolved = [];
    unresolved.push(...getUnresolvedVars(state.request.url));
    state.request.params.filter(p => p.enabled).forEach(p => {
        unresolved.push(...getUnresolvedVars(p.key));
        unresolved.push(...getUnresolvedVars(p.value));
    });
    state.request.headers.filter(h => h.enabled).forEach(h => {
        unresolved.push(...getUnresolvedVars(h.key));
        unresolved.push(...getUnresolvedVars(h.value));
    });
    unresolved.push(...getUnresolvedVars(state.request.body));
    
    // Auth vars
    if (state.request.auth.type !== 'none') {
        unresolved.push(...getUnresolvedVars(state.request.auth.token));
        unresolved.push(...getUnresolvedVars(state.request.auth.apiKey));
        unresolved.push(...getUnresolvedVars(state.request.auth.apiValue));
        unresolved.push(...getUnresolvedVars(state.request.auth.username));
        unresolved.push(...getUnresolvedVars(state.request.auth.password));
    }

    if (unresolved.length > 0) {
        const uniqueUnresolved = [...new Set(unresolved)];
        console.warn('Unresolved variables:', uniqueUnresolved);
        // We don't block, but we could highlight UI here.
    }

    // --- HARDENING: Auth validation ---
    if (state.request.auth.type === 'bearer' && !state.request.auth.token) {
        alert('Bearer token is required');
        return;
    }
    if (state.request.auth.type === 'basic' && (!state.request.auth.username || !state.request.auth.password)) {
        alert('Username and password are required for Basic auth');
        return;
    }

    // Show loading state
    sendBtn.disabled = true;
    const btnText = sendBtn.querySelector('.btn-text');
    const btnLoader = sendBtn.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';

    try {
        const invoke = getInvoke();

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

const getInvoke = () => window.__TAURI__?.core?.invoke || window.__TAURI__?.invoke;

async function handleExportCurl() {
    if (!state.request.url.trim()) {
        alert('Please enter a URL');
        return;
    }

    try {
        const invoke = getInvoke();
        if (!invoke) {
            throw new Error('Tauri invoke not found');
        }
        
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
        const invoke = getInvoke();
        if (!invoke) {
            throw new Error('Tauri invoke not found');
        }
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
        const invoke = getInvoke();
        if (!invoke) {
            throw new Error('Tauri invoke not found');
        }
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

    container.innerHTML = items.map((item, index) => {
        const unresolvedKey = getUnresolvedVars(item.key).length > 0;
        const unresolvedValue = getUnresolvedVars(item.value).length > 0;
        
        let displayKey = item.key;
        if (type === 'headers' && item.key) {
            // Normalize casing for display: Camel-Case-Headers
            displayKey = item.key.split('-').map(part => 
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            ).join('-');
        }
        
        return `
            <div class="kv-row" data-index="${index}">
                <input type="checkbox" ${item.enabled ? 'checked' : ''} class="kv-enabled">
                <input type="text" placeholder="key" value="${escapeHtml(displayKey)}" 
                       class="kv-key ${unresolvedKey ? 'unresolved-var' : ''}">
                <input type="text" placeholder="value" value="${escapeHtml(item.value)}" 
                       class="kv-value ${unresolvedValue ? 'unresolved-var' : ''}">
                <button class="btn-icon-small btn-delete-kv">×</button>
            </div>
        `;
    }).join('');

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
            const val = e.target.value;
            items[index].key = val;
            
            // Highlight unresolved
            if (getUnresolvedVars(val).length > 0) {
                keyInput.classList.add('unresolved-var');
            } else {
                keyInput.classList.remove('unresolved-var');
            }

            // Warning for Content-Type override
            if (type === 'headers' && val.toLowerCase() === 'content-type') {
                keyInput.title = 'Warning: Overriding Content-Type may affect body parsing';
                keyInput.style.color = 'var(--warning)';
            } else {
                keyInput.title = '';
                keyInput.style.color = '';
            }
        });

        valueInput.addEventListener('input', (e) => {
            const val = e.target.value;
            items[index].value = val;
            
            // Highlight unresolved
            if (getUnresolvedVars(val).length > 0) {
                valueInput.classList.add('unresolved-var');
            } else {
                valueInput.classList.remove('unresolved-var');
            }
        });

        deleteBtn.addEventListener('click', () => {
            items.splice(index, 1);
            if (type === 'params') renderParams();
            else renderHeaders();
        });
    });
}

function renderFormData() {
    const container = document.getElementById('formDataList');
    if (!container) return;
    // Similar to renderKVList but for form data
    // For now, basic implementation
    if (!state.request.formData) state.request.formData = [];
    renderKVList(container, state.request.formData, 'formData');
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = files.map(file => `<div>${file.name} (${file.size} bytes)</div>`).join('');
    // Store files in state
    state.request.files = files;
}

function renderAuth() {
    const authTypeSelect = document.getElementById('authTypeSelect');
    if (authTypeSelect) {
        authTypeSelect.value = state.request.auth.type;
        // Trigger change event to update auth fields
        authTypeSelect.dispatchEvent(new Event('change'));
    }
}

async function handleSaveToCollection() {
    if (!state.request.url.trim()) {
        alert('Please enter a URL before saving to collection');
        return;
    }

    if (state.collections.length === 0) {
        alert('No collections available. Create a collection first.');
        return;
    }

    const collectionNames = state.collections.map(c => c.name);
    const selected = prompt(`Select collection:\n${collectionNames.join('\n')}`);
    const index = collectionNames.indexOf(selected);

    if (index === -1) {
        alert('Collection not found');
        return;
    }

    if (index >= 0) {
        const name = prompt('Request name:');
        if (name) {
            state.collections[index].requests.push({ ...structuredClone(state.request), name });
            saveCollections();
            renderCollections();

            // Auto-expand and highlight the saved request
            const requestsEl = document.getElementById(`requests-${index}`);
            const folderEl = document.getElementById(`folder-${index}`);
            const toggleBtn = folderEl ? folderEl.querySelector('.collection-folder-toggle') : null;
            if (requestsEl) requestsEl.style.display = 'block';
            if (toggleBtn) toggleBtn.textContent = '▼';

            // Highlight new request
            setTimeout(() => {
                const reqEls = requestsEl ? requestsEl.querySelectorAll('.collection-request') : [];
                const newReqEl = reqEls[reqEls.length - 1];
                if (newReqEl) {
                    newReqEl.style.backgroundColor = 'var(--bg-tertiary)';
                    newReqEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    setTimeout(() => newReqEl.style.backgroundColor = '', 500);
                }
            }, 50);
        }
    }
}
