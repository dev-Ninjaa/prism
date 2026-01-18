// Auth form management
function initAuthForm() {
    const authTypeSelect = document.getElementById('authTypeSelect');
    const authFields = document.getElementById('authFields');

    authTypeSelect.addEventListener('change', (e) => {
        const authType = e.target.value;
        updateAuth({ type: authType });
        renderAuthFields(authType);
    });
}

function renderAuthFields(authType) {
    const authFields = document.getElementById('authFields');

    const templates = {
        none: '<div class="empty-state">No authentication</div>',
        
        bearer: `
            <div class="auth-field">
                <label>Token</label>
                <input type="password" id="bearerToken" placeholder="Enter bearer token" value="${escapeHtml(state.request.auth.token)}" />
            </div>
        `,
        
        apikey: `
            <div class="auth-field">
                <label>Key</label>
                <input type="text" id="apiKey" placeholder="e.g., X-API-Key" value="${escapeHtml(state.request.auth.apiKey)}" />
            </div>
            <div class="auth-field">
                <label>Value</label>
                <input type="password" id="apiValue" placeholder="Enter API key value" value="${escapeHtml(state.request.auth.apiValue)}" />
            </div>
        `,
        
        basic: `
            <div class="auth-field">
                <label>Username</label>
                <input type="text" id="basicUsername" placeholder="Enter username" value="${escapeHtml(state.request.auth.username)}" />
            </div>
            <div class="auth-field">
                <label>Password</label>
                <input type="password" id="basicPassword" placeholder="Enter password" value="${escapeHtml(state.request.auth.password)}" />
            </div>
        `
    };

    authFields.innerHTML = templates[authType] || templates.none;

    // Add event listeners for auth inputs
    if (authType === 'bearer') {
        document.getElementById('bearerToken')?.addEventListener('input', (e) => {
            updateAuth({ token: e.target.value });
        });
    } else if (authType === 'apikey') {
        document.getElementById('apiKey')?.addEventListener('input', (e) => {
            updateAuth({ apiKey: e.target.value });
        });
        document.getElementById('apiValue')?.addEventListener('input', (e) => {
            updateAuth({ apiValue: e.target.value });
        });
    } else if (authType === 'basic') {
        document.getElementById('basicUsername')?.addEventListener('input', (e) => {
            updateAuth({ username: e.target.value });
        });
        document.getElementById('basicPassword')?.addEventListener('input', (e) => {
            updateAuth({ password: e.target.value });
        });
    }
}
