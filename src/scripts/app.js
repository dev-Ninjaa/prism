// Main application bootstrap
document.addEventListener('DOMContentLoaded', async () => {
    // Load persisted data
    await loadHistory();
    await loadEnvVars();
    
    // Initialize all modules
    initSidebar();
    initRequestBar();
    initTabs();
    initAuthForm();
    renderEnvVars();

    console.log('🚀 Prism initialized');
    console.log('State:', state);
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
