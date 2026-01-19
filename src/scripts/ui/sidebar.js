// Sidebar and history management
function renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (state.history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No requests yet</div>';
        return;
    }

    historyList.innerHTML = state.history.map((item, index) => {
        const statusClass = item.status >= 200 && item.status < 300 ? 'success' : 'error';
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleTimeString();
        
        return `
            <div class="history-item" data-index="${index}">
                <div class="history-item-header">
                    <span class="history-method ${item.method}">${item.method}</span>
                    <span class="history-status ${statusClass}">${item.status}</span>
                </div>
                <div class="history-url">${item.url}</div>
                <div class="history-time">${timeStr} • ${item.time_ms || item.time}ms</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            loadHistoryItem(state.history[index]);
        });
    });
}

function loadHistoryItem(item) {
    if (!item || !item.request) return;
    
    // Set the request and response state - deep clone to avoid modifying history
    const restoredRequest = JSON.parse(JSON.stringify(item.request));
    const restoredResponse = item.response ? JSON.parse(JSON.stringify(item.response)) : null;
    
    // Ensure all required fields exist (merge with defaults)
    state.request = {
        method: restoredRequest.method || 'GET',
        url: restoredRequest.url || '',
        params: restoredRequest.params || [],
        headers: restoredRequest.headers || [],
        body: restoredRequest.body || '',
        auth: {
            type: restoredRequest.auth?.type || 'none',
            token: restoredRequest.auth?.token || '',
            apiKey: restoredRequest.auth?.apiKey || '',
            apiValue: restoredRequest.auth?.apiValue || '',
            username: restoredRequest.auth?.username || '',
            password: restoredRequest.auth?.password || ''
        }
    };

    // Update response state
    state.response = restoredResponse;
    
    // Update UI elements
    const methodSelect = document.getElementById('methodSelect');
    const urlInput = document.getElementById('urlInput');
    const bodyEditor = document.querySelector('.body-editor');
    const responseViewer = document.getElementById('responseViewer');
    
    if (methodSelect) methodSelect.value = state.request.method.toUpperCase();
    if (urlInput) urlInput.value = state.request.url;
    if (bodyEditor) bodyEditor.value = state.request.body;
    
    // Update tabs and dynamic lists
    if (typeof renderParams === 'function') renderParams();
    if (typeof renderHeaders === 'function') renderHeaders();
    if (typeof renderAuth === 'function') renderAuth();
    
    // Render restored response if available
    if (state.response) {
        if (typeof renderResponse === 'function') renderResponse(state.response);
        if (responseViewer) responseViewer.style.display = 'flex';
    } else {
        if (responseViewer) responseViewer.style.display = 'none';
    }
    
    // Provide visual feedback
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // Find the clicked item and add a temporary highlight
        const items = sidebar.querySelectorAll('.history-item');
        items.forEach(el => {
            const index = parseInt(el.dataset.index);
            if (state.history[index] === item) {
                el.style.backgroundColor = 'var(--bg-tertiary)';
                setTimeout(() => el.style.backgroundColor = '', 300);
            }
        });
    }
}

async function initSidebar() {
    // History is loaded by app.js, we just attach listeners here
    const clearBtn = document.getElementById('clearHistory');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (confirm('Clear all history?')) {
                try {
                    await clearHistory();
                    renderHistory();
                } catch (e) {
                    alert('Failed to clear history: ' + e);
                }
            }
        });
    }
}
