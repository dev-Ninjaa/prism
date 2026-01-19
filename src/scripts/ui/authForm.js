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
            <div class="auth-field">
                <label>Add to</label>
                <select id="apiLocation">
                    <option value="header" ${state.request.auth.apiLocation === 'header' ? 'selected' : ''}>Header</option>
                    <option value="query" ${state.request.auth.apiLocation === 'query' ? 'selected' : ''}>Query Params</option>
                </select>
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
            const val = e.target.value;
            updateAuth({ token: val });
            highlightUnresolved(e.target, val);
        });
    } else if (authType === 'apikey') {
        document.getElementById('apiKey')?.addEventListener('input', (e) => {
            const val = e.target.value;
            updateAuth({ apiKey: val });
            highlightUnresolved(e.target, val);
        });
        document.getElementById('apiValue')?.addEventListener('input', (e) => {
            const val = e.target.value;
            updateAuth({ apiValue: val });
            highlightUnresolved(e.target, val);
        });
        document.getElementById('apiLocation')?.addEventListener('change', (e) => {
            updateAuth({ apiLocation: e.target.value });
        });
    } else if (authType === 'basic') {
        document.getElementById('basicUsername')?.addEventListener('input', (e) => {
            const val = e.target.value;
            updateAuth({ username: val });
            highlightUnresolved(e.target, val);
        });
        document.getElementById('basicPassword')?.addEventListener('input', (e) => {
            const val = e.target.value;
            updateAuth({ password: val });
            highlightUnresolved(e.target, val);
        });
    }
}

function highlightUnresolved(input, value) {
    if (getUnresolvedVars(value).length > 0) {
        input.classList.add('unresolved-var');
    } else {
        input.classList.remove('unresolved-var');
    }
}
