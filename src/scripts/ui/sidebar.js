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
    
    // Set the request state
    state.request = JSON.parse(JSON.stringify(item.request));
    
    // Update UI elements
    document.getElementById('methodSelect').value = state.request.method;
    document.getElementById('urlInput').value = state.request.url;
    document.querySelector('.body-editor').value = state.request.body || '';
    
    // Update tabs
    renderParams();
    renderHeaders();
    renderAuth();
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
