// Sidebar and history management
let historyFilter = '';

function loadCollections() {
    const saved = localStorage.getItem('collections');
    if (saved) {
        try {
            state.collections = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load collections:', e);
            state.collections = [];
        }
    }
}

function saveCollections() {
    localStorage.setItem('collections', JSON.stringify(state.collections));
}

function renderCollections() {
    const container = document.getElementById('collectionsList');
    if (state.collections.length === 0) {
        container.innerHTML = '<div class="empty-state">No collections yet</div>';
        return;
    }

    container.innerHTML = state.collections.map((collection, index) => `
        <div class="collection-item" data-index="${index}">
            <div class="collection-folder" id="folder-${index}">
                <button class="collection-folder-toggle">▶</button>
                <span>${collection.name}</span>
                <button class="collection-add-btn" data-index="${index}" title="Add request" aria-label="Add request">+</button>
            </div>
            <div class="collection-requests" id="requests-${index}" style="display: none;">
                ${collection.requests.map((req, reqIndex) => `
                    <div class="collection-request" data-collection="${index}" data-request="${reqIndex}">
                        <span class="history-method ${req.method}">${req.method}</span>
                        ${req.name || req.url}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Add event listeners
    state.collections.forEach((collection, index) => {
        const folder = document.getElementById(`folder-${index}`);
        const requests = document.getElementById(`requests-${index}`);
        if (!folder) return;

        const toggle = folder.querySelector('.collection-folder-toggle');
        if (toggle && requests) {
            toggle.addEventListener('click', () => {
                const isCollapsed = requests.style.display === 'none';
                requests.style.display = isCollapsed ? 'block' : 'none';
                toggle.textContent = isCollapsed ? '▼' : '▶';
            });
        }

        // Add request button handler
        const addBtn = folder.querySelector('.collection-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const idx = parseInt(addBtn.dataset.index);
                const name = prompt('New request name:');
                if (!name) return;

                // Save a snapshot of the current request into the collection
                state.collections[idx].requests.push({ ...structuredClone(state.request), name });
                saveCollections();
                renderCollections();

                // After re-render, expand and highlight new request
                setTimeout(() => {
                    const requestsEl = document.getElementById(`requests-${idx}`);
                    const folderEl = document.getElementById(`folder-${idx}`);
                    const toggleBtn = folderEl ? folderEl.querySelector('.collection-folder-toggle') : null;
                    if (requestsEl) requestsEl.style.display = 'block';
                    if (toggleBtn) toggleBtn.textContent = '▼';

                    const reqEls = requestsEl ? requestsEl.querySelectorAll('.collection-request') : [];
                    const newReqEl = reqEls[reqEls.length - 1];
                    if (newReqEl) {
                        newReqEl.style.backgroundColor = 'var(--bg-tertiary)';
                        newReqEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        setTimeout(() => newReqEl.style.backgroundColor = '', 500);
                    }
                }, 50);
            });
        }

        if (requests) {
            collection.requests.forEach((req, reqIndex) => {
                const reqEl = requests.querySelector(`[data-request="${reqIndex}"]`);
                if (reqEl) {
                    reqEl.addEventListener('click', () => {
                        loadCollectionRequest(collection.requests[reqIndex]);
                    });
                }
            });
        }
    });
}

function loadCollectionRequest(req) {
    // Similar to loadHistoryItem but for collection requests
    state.request = { ...req };
    // Update UI
    document.getElementById('methodSelect').value = req.method;
    document.getElementById('urlInput').value = req.url;
    document.querySelector('.body-editor').value = req.body || '';
    renderParams();
    renderHeaders();
    renderAuth();
}


function renderHistory() {
    const historyList = document.getElementById('historyList');
    const compact = localStorage.getItem('historyCompact') === 'true';
    let filteredHistory = state.history;
    
    if (historyFilter) {
        const filter = historyFilter.toLowerCase();
        filteredHistory = state.history.filter(item => 
            item.url.toLowerCase().includes(filter) ||
            item.method.toLowerCase().includes(filter) ||
            (item.status && item.status.toString().includes(filter))
        );
    }
    
    if (filteredHistory.length === 0) {
        historyList.innerHTML = historyFilter ? 
            '<div class="empty-state">No matching requests</div>' : 
            '<div class="empty-state">No requests yet</div>';
        return;
    }

    historyList.innerHTML = filteredHistory.map((item, originalIndex) => {
        const statusClass = item.status >= 200 && item.status < 300 ? 'success' : 'error';
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleTimeString();
        
        if (compact) {
            return `
                <div class="history-item compact" data-index="${originalIndex}">
                    <div class="history-item-header">
                        <span class="history-method ${item.method}">${item.method}</span>
                        <span class="history-status ${statusClass}">${item.status}</span>
                        <span class="history-url-compact">${item.url}</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="history-item" data-index="${originalIndex}">
                    <div class="history-item-header">
                        <span class="history-method ${item.method}">${item.method}</span>
                        <span class="history-status ${statusClass}">${item.status}</span>
                    </div>
                    <div class="history-url">${item.url}</div>
                    <div class="history-time">${timeStr} • ${item.time_ms || item.time}ms</div>
                </div>
            `;
        }
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

    // (Removed duplicate old collection handler - use the handler defined later that updates state.collections and persists)

    // Sidebar toggle functionality
    const toggleBtn = document.getElementById('toggleSidebar');
    const collapsedToggle = document.getElementById('collapsedToggle');
    const appContainer = document.querySelector('.app-container');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && collapsedToggle && appContainer && sidebar) {
        const toggleSidebar = () => {
            const isCollapsed = appContainer.classList.contains('collapsed');
            if (isCollapsed) {
                appContainer.classList.remove('collapsed');
                sidebar.classList.remove('collapsed');
                collapsedToggle.style.display = 'none';
            } else {
                appContainer.classList.add('collapsed');
                sidebar.classList.add('collapsed');
                collapsedToggle.style.display = 'block';
            }
        };

        toggleBtn.addEventListener('click', toggleSidebar);
        collapsedToggle.addEventListener('click', toggleSidebar);

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }

        // New collection
        const newCollectionBtn = document.getElementById('newCollectionBtn');
        if (newCollectionBtn) {
            newCollectionBtn.addEventListener('click', () => {
                const name = prompt('Collection name:');
                if (name) {
                    state.collections.push({ name, requests: [] });
                    saveCollections();
                    renderCollections();

                    // Auto-expand and scroll new collection into view
                    const idx = state.collections.length - 1;
                    const requestsEl = document.getElementById(`requests-${idx}`);
                    const folderEl = document.getElementById(`folder-${idx}`);
                    const toggleBtn = folderEl ? folderEl.querySelector('.collection-folder-toggle') : null;
                    if (requestsEl) {
                        requestsEl.style.display = 'block';
                    }
                    if (toggleBtn) {
                        toggleBtn.textContent = '▼';
                    }
                    if (folderEl) folderEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }

        // History settings
        const historySettingsBtn = document.getElementById('historySettingsBtn');
        if (historySettingsBtn) {
            historySettingsBtn.addEventListener('click', () => {
                const compact = confirm('Toggle compact history view? (OK for compact, Cancel for detailed)');
                localStorage.setItem('historyCompact', compact);
                renderHistory();
            });
        }
    }

    // Initialize vertical resize functionality
    initVerticalResize();
}

// Vertical resize functionality for collections and history
function initVerticalResize() {
    const resizeHandle = document.getElementById('historyResizeHandle');
    const collectionsList = document.getElementById('collectionsList');
    const sidebarSection = document.querySelector('.sidebar-section');
    const sidebar = document.querySelector('.sidebar');

    if (!resizeHandle || !collectionsList || !sidebarSection || !sidebar) return;

    let isResizing = false;
    let startY = 0;
    let startCollectionsHeight = 0;
    let startHistoryHeight = 0;

    // Load saved heights from localStorage
    const savedCollectionsHeight = localStorage.getItem('collectionsHeight');
    if (savedCollectionsHeight) {
        collectionsList.style.flex = `0 0 ${savedCollectionsHeight}px`;
        collectionsList.style.maxHeight = `${savedCollectionsHeight}px`;
    }

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startCollectionsHeight = collectionsList.offsetHeight;
        startHistoryHeight = sidebarSection.offsetHeight;

        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaY = e.clientY - startY;
        const newCollectionsHeight = Math.max(50, startCollectionsHeight + deltaY);
        const newHistoryHeight = Math.max(100, startHistoryHeight - deltaY);

        // Ensure minimum heights
        if (newCollectionsHeight >= 50 && newHistoryHeight >= 100) {
            collectionsList.style.flex = `0 0 ${newCollectionsHeight}px`;
            collectionsList.style.maxHeight = `${newCollectionsHeight}px`;

            sidebarSection.style.flex = `0 0 ${newHistoryHeight}px`;
            sidebarSection.style.maxHeight = `${newHistoryHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // Save the current height
            const currentHeight = collectionsList.offsetHeight;
            localStorage.setItem('collectionsHeight', currentHeight);
        }
    });

    // Prevent text selection during resize
    resizeHandle.addEventListener('dragstart', (e) => e.preventDefault());
}
