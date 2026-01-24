// Main application bootstrap
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI modules first (non-blocking)
    try {
        initSidebar();
        initRequestBar();
        initTabs();
        initAuthForm();
        initResponseControls();
    } catch (e) {
        console.error('Module initialization failed:', e);
    }

    // Load data in background
    loadHistory().then(() => {
        renderHistory();
    });
    
    loadEnvVars().then(() => {
        renderEnvVars();
    });

    // Load and render collections
    loadCollections();
    renderCollections();

    // Prism initialized
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send request
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
    }
    
    // Ctrl/Cmd + S to save request
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRequest();
    }
    
    // Ctrl/Cmd + O to load request
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleLoadRequest();
    }
    
    // Ctrl/Cmd + Shift + N to create new collection
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        const newCollectionBtn = document.getElementById('newCollectionBtn');
        if (newCollectionBtn) newCollectionBtn.click();
    }
    
    // Ctrl/Cmd + Shift + S to save to collection
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        const saveToCollectionBtn = document.getElementById('saveToCollectionBtn');
        if (saveToCollectionBtn) saveToCollectionBtn.click();
    }
    
    // Ctrl/Cmd + Shift + E to export collections
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const exportBtn = document.getElementById('exportCollectionsBtn');
        if (exportBtn) exportBtn.click();
    }
    
    // Ctrl/Cmd + Shift + M to move current request to collection
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        moveCurrentRequestToCollection();
    }
});

// Move current request to a collection
function moveCurrentRequestToCollection() {
    if (state.collections.length === 0) {
        alert('No collections available. Create a collection first.');
        return;
    }
    
    const collectionOptions = state.collections.map((col, idx) => 
        `<option value="${idx}">${col.name} (${col.requests.length} requests)</option>`
    ).join('');
    
    const dialog = document.createElement('div');
    dialog.className = 'move-dialog-overlay';
    dialog.innerHTML = `
        <div class="move-dialog">
            <h3>Move Current Request</h3>
            <p>Move current request to collection:</p>
            <select id="moveCurrentTargetCollection">
                ${collectionOptions}
            </select>
            <div class="move-dialog-actions">
                <button id="moveCurrentCancelBtn">Cancel</button>
                <button id="moveCurrentConfirmBtn">Move</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Handle dialog buttons
    document.getElementById('moveCurrentCancelBtn').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    document.getElementById('moveCurrentConfirmBtn').addEventListener('click', () => {
        const targetCollectionIdx = parseInt(document.getElementById('moveCurrentTargetCollection').value);
        const requestName = prompt('Name for the request:', state.request.url || 'New Request');
        if (!requestName) return;
        
        // Add current request to target collection
        state.collections[targetCollectionIdx].requests.push({ 
            ...structuredClone(state.request), 
            name: requestName.trim() 
        });
        
        // Save and re-render
        saveCollections();
        renderCollections();
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = `Request moved to "${state.collections[targetCollectionIdx].name}"`;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
        
        document.body.removeChild(dialog);
    });
}
