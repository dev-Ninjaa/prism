// Sidebar and history management
let historyFilter = '';
let collectionSearchFilter = '';

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

    // Filter collections based on search
    let filteredCollections = state.collections;
    if (collectionSearchFilter) {
        const filter = collectionSearchFilter.toLowerCase();
        filteredCollections = state.collections.filter(collection => 
            collection.name.toLowerCase().includes(filter) ||
            collection.requests.some(req => 
                (req.name || req.url).toLowerCase().includes(filter) ||
                req.method.toLowerCase().includes(filter)
            )
        );
    }

    if (filteredCollections.length === 0) {
        container.innerHTML = `<div class="empty-state">No collections match "${collectionSearchFilter}"</div>`;
        return;
    }

    container.innerHTML = filteredCollections.map((collection) => {
        // Find the original index in the full collections array
        const index = state.collections.findIndex(c => c === collection);
        return `
        <div class="collection-item" data-index="${index}">
            <div class="collection-folder" id="folder-${index}">
                <button class="collection-folder-toggle">▶</button>
                <span class="collection-name">${collection.name}</span>
                <div class="collection-meta">
                    <span class="collection-count">${collection.requests.length} requests</span>
                </div>
                <div class="collection-actions">
                    <button class="collection-edit-btn" data-index="${index}" title="Edit collection" aria-label="Edit collection">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M11.5 2.5L13.5 4.5L6.5 11.5L4.5 13.5L2.5 11.5L9.5 4.5L11.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9.5 4.5L11.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="collection-duplicate-btn" data-index="${index}" title="Duplicate collection" aria-label="Duplicate collection">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M4 6V2C4 1.44772 4.44772 1 5 1H13C13.5523 1 14 1.44772 14 2V10C14 10.5523 13.5523 11 13 11H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <rect x="2" y="6" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </button>
                    <button class="collection-delete-btn" data-index="${index}" title="Delete collection" aria-label="Delete collection">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M12 4H4V12C4 13.1046 4.89543 14 6 14H10C11.1046 14 12 13.1046 12 12V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M2 4H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 2H6C5.44772 2 5 2.44772 5 3V4H11V3C11 2.44772 10.5523 2 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="collection-add-btn" data-index="${index}" title="Add request" aria-label="Add request">+</button>
                </div>
            </div>
            <div class="collection-requests" id="requests-${index}" style="display: none;">
                ${collection.requests.map((req, reqIndex) => `
                    <div class="collection-request" data-collection="${index}" data-request="${reqIndex}">
                        <div class="collection-request-content">
                            <span class="history-method ${req.method}">${req.method}</span>
                            <span class="collection-request-name">${req.name || req.url}</span>
                        </div>
                        <div class="collection-request-actions">
                            <button class="collection-request-edit-btn" data-collection="${index}" data-request="${reqIndex}" title="Edit request name" aria-label="Edit request name">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M11.5 2.5L13.5 4.5L6.5 11.5L4.5 13.5L2.5 11.5L9.5 4.5L11.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M9.5 4.5L11.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button class="collection-request-move-btn" data-collection="${index}" data-request="${reqIndex}" title="Move to another collection" aria-label="Move to another collection">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M8 2L14 8L8 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 4H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button class="collection-request-duplicate-btn" data-collection="${index}" data-request="${reqIndex}" title="Duplicate request" aria-label="Duplicate request">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 6V2C4 1.44772 4.44772 1 5 1H13C13.5523 1 14 1.44772 14 2V10C14 10.5523 13.5523 11 13 11H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <rect x="2" y="6" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                            </button>
                            <button class="collection-request-delete-btn" data-collection="${index}" data-request="${reqIndex}" title="Delete request" aria-label="Delete request">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M12 4H4V12C4 13.1046 4.89543 14 6 14H10C11.1046 14 12 13.1046 12 12V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M8 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 8V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 4H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10 2H6C5.44772 2 5 2.44772 5 3V4H11V3C11 2.44772 10.5523 2 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;}).join('');

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

        // Edit collection button handler
        const editBtn = folder.querySelector('.collection-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent folder toggle
                const idx = parseInt(editBtn.dataset.index);
                const collection = state.collections[idx];
                const newName = prompt('Edit collection name:', collection.name);
                if (!newName || newName.trim() === collection.name) return;

                state.collections[idx].name = newName.trim();
                saveCollections();
                renderCollections();
            });
        }

        // Duplicate collection button handler
        const duplicateBtn = folder.querySelector('.collection-duplicate-btn');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent folder toggle
                const idx = parseInt(duplicateBtn.dataset.index);
                const collection = state.collections[idx];
                const newName = prompt('New collection name:', `${collection.name} Copy`);
                if (!newName) return;

                const duplicatedCollection = {
                    name: newName.trim(),
                    requests: collection.requests.map(req => ({ ...structuredClone(req) }))
                };
                state.collections.push(duplicatedCollection);
                saveCollections();
                renderCollections();
            });
        }

        // Delete collection button handler
        const deleteBtn = folder.querySelector('.collection-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent folder toggle
                const idx = parseInt(deleteBtn.dataset.index);
                const collection = state.collections[idx];
                
                const { dialog } = window.__TAURI__;
                const confirmed = await dialog.confirm(`Delete collection "${collection.name}" and all its ${collection.requests.length} requests?`, {
                    title: 'Delete Collection',
                    type: 'warning'
                });
                
                if (confirmed) {
                    state.collections.splice(idx, 1);
                    saveCollections();
                    renderCollections();
                }
            });
        }

        if (requests) {
            collection.requests.forEach((req, reqIndex) => {
                const reqEl = requests.querySelector(`[data-request="${reqIndex}"]`);
                if (reqEl) {
                    // Click handler for the request content (not the buttons)
                    const reqContent = reqEl.querySelector('.collection-request-content');
                    if (reqContent) {
                        reqContent.addEventListener('click', () => {
                            loadCollectionRequest(collection.requests[reqIndex]);
                        });
                    }

                    // Edit request button handler
                    const editBtn = reqEl.querySelector('.collection-request-edit-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const collectionIdx = parseInt(editBtn.dataset.collection);
                            const requestIdx = parseInt(editBtn.dataset.request);
                            const request = state.collections[collectionIdx].requests[requestIdx];
                            const newName = prompt('Edit request name:', request.name || request.url);
                            if (!newName || newName.trim() === (request.name || request.url)) return;

                            state.collections[collectionIdx].requests[requestIdx].name = newName.trim();
                            saveCollections();
                            renderCollections();
                        });
                    }

                    // Move request button handler
                    const moveBtn = reqEl.querySelector('.collection-request-move-btn');
                    if (moveBtn) {
                        moveBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const collectionIdx = parseInt(moveBtn.dataset.collection);
                            const requestIdx = parseInt(moveBtn.dataset.request);
                            const request = state.collections[collectionIdx].requests[requestIdx];
                            
                            // Create collection selection dialog
                            const collectionOptions = state.collections.map((col, idx) => 
                                `<option value="${idx}" ${idx === collectionIdx ? 'disabled' : ''}>${col.name}</option>`
                            ).join('');
                            
                            const dialog = document.createElement('div');
                            dialog.className = 'move-dialog-overlay';
                            dialog.innerHTML = `
                                <div class="move-dialog">
                                    <h3>Move Request</h3>
                                    <p>Move "${request.name || request.url}" to:</p>
                                    <select id="moveTargetCollection">
                                        ${collectionOptions}
                                    </select>
                                    <div class="move-dialog-actions">
                                        <button id="moveCancelBtn">Cancel</button>
                                        <button id="moveConfirmBtn">Move</button>
                                    </div>
                                </div>
                            `;
                            
                            document.body.appendChild(dialog);
                            
                            // Handle dialog buttons
                            document.getElementById('moveCancelBtn').addEventListener('click', () => {
                                document.body.removeChild(dialog);
                            });
                            
                            document.getElementById('moveConfirmBtn').addEventListener('click', () => {
                                const targetCollectionIdx = parseInt(document.getElementById('moveTargetCollection').value);
                                if (targetCollectionIdx === collectionIdx) return;
                                
                                // Move the request
                                const movedRequest = state.collections[collectionIdx].requests.splice(requestIdx, 1)[0];
                                state.collections[targetCollectionIdx].requests.push(movedRequest);
                                
                                saveCollections();
                                renderCollections();
                                document.body.removeChild(dialog);
                            });
                        });
                    }

                    // Duplicate request button handler
                    const duplicateBtn = reqEl.querySelector('.collection-request-duplicate-btn');
                    if (duplicateBtn) {
                        duplicateBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const collectionIdx = parseInt(duplicateBtn.dataset.collection);
                            const requestIdx = parseInt(duplicateBtn.dataset.request);
                            const request = state.collections[collectionIdx].requests[requestIdx];
                            const newName = prompt('New request name:', `${request.name || 'Request'} Copy`);
                            if (!newName) return;

                            const duplicatedRequest = { ...structuredClone(request), name: newName.trim() };
                            state.collections[collectionIdx].requests.splice(requestIdx + 1, 0, duplicatedRequest);
                            saveCollections();
                            renderCollections();
                        });
                    }

                    // Delete request button handler
                    const deleteBtn = reqEl.querySelector('.collection-request-delete-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const collectionIdx = parseInt(deleteBtn.dataset.collection);
                            const requestIdx = parseInt(deleteBtn.dataset.request);
                            const request = state.collections[collectionIdx].requests[requestIdx];
                            
                            const confirmDelete = confirm(`Delete request "${request.name || request.url}"?`);
                            if (!confirmDelete) return;

                            state.collections[collectionIdx].requests.splice(requestIdx, 1);
                            saveCollections();
                            renderCollections();
                        });
                    }
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

        // Export collections
        const exportCollectionsBtn = document.getElementById('exportCollectionsBtn');
        if (exportCollectionsBtn) {
            exportCollectionsBtn.addEventListener('click', async () => {
                if (state.collections.length === 0) {
                    const { dialog } = window.__TAURI__;
                    await dialog.message('No collections to export', {
                        title: 'Export Collections',
                        type: 'info'
                    });
                    return;
                }

                const exportData = {
                    version: '1.0',
                    exportedAt: new Date().toISOString(),
                    collections: state.collections
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `prism-collections-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Close dropdown
                const dropdown = document.getElementById('collectionsDropdown');
                if (dropdown) dropdown.classList.remove('show');
            });
        }

        // Import collections
        const importCollectionsBtn = document.getElementById('importCollectionsBtn');
        const importFileInput = document.getElementById('importFileInput');
        if (importCollectionsBtn && importFileInput) {
            importCollectionsBtn.addEventListener('click', () => {
                importFileInput.click();
                // Close dropdown
                const dropdown = document.getElementById('collectionsDropdown');
                if (dropdown) dropdown.classList.remove('show');
            });

            importFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const importData = JSON.parse(event.target.result);
                        
                        // Validate import data
                        if (!importData.collections || !Array.isArray(importData.collections)) {
                            throw new Error('Invalid file format');
                        }

                        // Check for conflicts
                        const existingNames = state.collections.map(c => c.name);
                        const conflicts = importData.collections.filter(c => existingNames.includes(c.name));
                        
                        let mergedCollections = [...state.collections];
                        
                        if (conflicts.length > 0) {
                            // Use Tauri dialog instead of browser confirm
                            const { dialog } = window.__TAURI__;
                            const confirmed = await dialog.confirm(`${conflicts.length} collection(s) already exist. Rename imported collections to avoid conflicts?`, {
                                title: 'Import Collections',
                                type: 'warning'
                            });
                            
                            if (confirmed) {
                                importData.collections.forEach(collection => {
                                    let newName = collection.name;
                                    let counter = 1;
                                    while (mergedCollections.some(c => c.name === newName)) {
                                        newName = `${collection.name} (${counter})`;
                                        counter++;
                                    }
                                    mergedCollections.push({ ...collection, name: newName });
                                });
                            } else {
                                // Skip conflicting collections
                                const nonConflicting = importData.collections.filter(c => !existingNames.includes(c.name));
                                mergedCollections = [...state.collections, ...nonConflicting];
                                if (nonConflicting.length < importData.collections.length) {
                                    await dialog.message(`${importData.collections.length - nonConflicting.length} collection(s) were skipped due to name conflicts.`, {
                                        title: 'Import Complete',
                                        type: 'info'
                                    });
                                }
                            }
                        } else {
                            mergedCollections = [...state.collections, ...importData.collections];
                        }

                        state.collections = mergedCollections;
                        saveCollections();
                        renderCollections();
                        
                        await dialog.message(`Successfully imported ${importData.collections.length} collection(s).`, {
                            title: 'Import Complete',
                            type: 'info'
                        });
                        
                    } catch (error) {
                        const { dialog } = window.__TAURI__;
                        await dialog.message(`Failed to import collections: ${error.message}`, {
                            title: 'Import Error',
                            type: 'error'
                        });
                    }
                };
                reader.readAsText(file);
                
                // Reset input
                e.target.value = '';
            });
        }

        // Clear all collections
        const clearAllCollectionsBtn = document.getElementById('clearAllCollectionsBtn');
        if (clearAllCollectionsBtn) {
            clearAllCollectionsBtn.addEventListener('click', async () => {
                if (state.collections.length === 0) {
                    const { dialog } = window.__TAURI__;
                    await dialog.message('No collections to clear', {
                        title: 'Clear Collections',
                        type: 'info'
                    });
                    return;
                }
                
                const { dialog } = window.__TAURI__;
                const confirmClear = await dialog.confirm(`Delete all ${state.collections.length} collections and their ${state.collections.reduce((sum, c) => sum + c.requests.length, 0)} requests?`, {
                    title: 'Clear All Collections',
                    type: 'warning'
                });
                
                if (confirmClear) {
                    state.collections = [];
                    saveCollections();
                    renderCollections();
                }
                
                // Close dropdown
                const dropdown = document.getElementById('collectionsDropdown');
                if (dropdown) dropdown.classList.remove('show');
            });
        }

        // Collections menu dropdown
        const collectionsMenuBtn = document.getElementById('collectionsMenuBtn');
        const collectionsDropdown = document.getElementById('collectionsDropdown');
        if (collectionsMenuBtn && collectionsDropdown) {
            collectionsMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                collectionsDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!collectionsMenuBtn.contains(e.target) && !collectionsDropdown.contains(e.target)) {
                    collectionsDropdown.classList.remove('show');
                }
            });
        }

        // Collection search
        const collectionSearchInput = document.getElementById('collectionSearch');
        if (collectionSearchInput) {
            collectionSearchInput.addEventListener('input', (e) => {
                collectionSearchFilter = e.target.value.trim();
                renderCollections();
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

        // Help button - show keyboard shortcuts
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                const shortcuts = [
                    'Ctrl/Cmd + Enter: Send request',
                    'Ctrl/Cmd + S: Save request',
                    'Ctrl/Cmd + O: Load request',
                    'Ctrl/Cmd + Shift + N: New collection',
                    'Ctrl/Cmd + Shift + S: Save to collection',
                    'Ctrl/Cmd + Shift + E: Export collections',
                    'Ctrl/Cmd + Shift + M: Move current request to collection'
                ].join('\n');
                
                alert('Keyboard Shortcuts:\n\n' + shortcuts);
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
