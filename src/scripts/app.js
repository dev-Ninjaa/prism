// Main application bootstrap
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI modules first (non-blocking)
    try {
        initSidebar();
        initRequestBar();
        initTabs();
        initAuthForm();
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
});
