// Environment Variables UI Management

function isValidEnvKey(key) {
    // Allow uppercase letters, numbers and underscores, start with letter or underscore
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
}

function renderEnvVars() {
    const container = document.getElementById('envVarsList');
    if (!container) return;

    if (state.envVars.length === 0) {
        container.innerHTML = '<div class="empty-state">No environment variables</div>';
        return;
    }

    container.innerHTML = state.envVars.map(envVar => `
        <div class="kv-row" data-env-key="${escapeHtml(envVar.key)}">
            <label class="env-toggle">
                <input type="checkbox" class="env-enabled" ${envVar.enabled ? 'checked' : ''} data-key="${escapeHtml(envVar.key)}">
            </label>
            <input type="text" 
                   class="env-key" 
                   placeholder="VARIABLE_NAME" 
                   value="${escapeHtml(envVar.key)}"
                   data-original-key="${escapeHtml(envVar.key)}">
            <div class="env-value-wrap">
                <input type="text" 
                       class="env-value" 
                       placeholder="value" 
                       value="${escapeHtml(envVar.value)}">
                <button class="btn-icon-small btn-mask" title="Mask/Unmask">●●</button>
                <button class="btn-icon-small btn-copy" title="Copy value">⧉</button>
            </div>
            <button class="btn-icon-small btn-delete-env" data-key="${escapeHtml(envVar.key)}">×</button>
            <div class="env-error" aria-live="polite"></div>
        </div>
    `).join('');

    // Attach event listeners
    attachEnvVarListeners();
}

function attachEnvVarListeners() {
    const container = document.getElementById('envVarsList');
    if (!container) return;

    // Handle toggle change
    container.querySelectorAll('.env-enabled').forEach(chk => {
        chk.addEventListener('change', async (e) => {
            const key = chk.dataset.key;
            const enabled = chk.checked;
            const env = state.envVars.find(v => v.key === key);
            if (!env) return;
            try {
                await setEnvVar(env.key, env.value, enabled);
                renderEnvVars();
            } catch (e) {
                console.error('Failed to toggle env var:', e);
            }
        });
    });

    // Handle key/value changes
    container.querySelectorAll('.kv-row').forEach(row => {
        const keyInput = row.querySelector('.env-key');
        const valueInput = row.querySelector('.env-value');
        const maskBtn = row.querySelector('.btn-mask');
        const copyBtn = row.querySelector('.btn-copy');
        const errorEl = row.querySelector('.env-error');
        const originalKey = keyInput.dataset.originalKey;

        // Debounce updates
        let updateTimeout;

        const showError = (msg) => {
            if (errorEl) {
                errorEl.textContent = msg;
            }
        };

        const clearError = () => {
            if (errorEl) errorEl.textContent = '';
        };

        const handleUpdate = async () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(async () => {
                const newKey = keyInput.value.trim();
                const newValue = valueInput.value;

                if (!newKey) {
                    showError('Key cannot be empty');
                    return;
                }
                if (!isValidEnvKey(newKey)) {
                    showError('Invalid key. Only letters, numbers and underscores allowed and must start with letter or underscore.');
                    return;
                }

                // Check duplicates
                const existingKeys = state.envVars.map(v => v.key);
                if (newKey !== originalKey && existingKeys.includes(newKey)) {
                    showError('A variable with that name already exists.');
                    return;
                }

                try {
                    const env = state.envVars.find(v => v.key === originalKey) || { enabled: true };
                    // If key changed, delete old one first
                    if (newKey !== originalKey) {
                        await deleteEnvVar(originalKey);
                    }
                    await setEnvVar(newKey, newValue, env.enabled !== false);
                    clearError();
                    renderEnvVars();
                } catch (e) {
                    console.error('Failed to update env var:', e);
                    showError('Failed to save');
                }
            }, 500);
        };

        keyInput.addEventListener('input', handleUpdate);
        valueInput.addEventListener('input', handleUpdate);

        // Mask/unmask
        if (maskBtn) {
            maskBtn.addEventListener('click', () => {
                if (valueInput.type === 'password') {
                    valueInput.type = 'text';
                    maskBtn.textContent = '●●';
                } else {
                    valueInput.type = 'password';
                    maskBtn.textContent = '👁';
                }
            });
        }

        // Copy
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(valueInput.value);
                } catch (e) {
                    console.error('Copy failed', e);
                }
            });
        }
    });

    // Handle delete buttons
    container.querySelectorAll('.btn-delete-env').forEach(btn => {
        btn.addEventListener('click', async () => {
            const key = btn.dataset.key;
            try {
                await deleteEnvVar(key);
                renderEnvVars();
            } catch (e) {
                console.error('Failed to delete env var:', e);
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add new env var button
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addEnvVarBtn');
    const exportBtn = document.getElementById('exportEnvBtn');
    const importBtn = document.getElementById('importEnvBtn');
    const importInput = document.getElementById('importEnvInput');

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            // Add a new empty variable
            const newKey = `VAR_${Date.now()}`;
            try {
                await setEnvVar(newKey, '');
                renderEnvVars();
                
                // Focus on the new key input
                setTimeout(() => {
                    const container = document.getElementById('envVarsList');
                    const lastRow = container.querySelector('.kv-row:last-child');
                    if (lastRow) {
                        const keyInput = lastRow.querySelector('.env-key');
                        keyInput.select();
                    }
                }, 100);
            } catch (e) {
                console.error('Failed to add env var:', e);
            }
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const invoke = window.getInvoke ? window.getInvoke() : null;
            if (invoke) {
                try {
                    await invoke('export_env_vars');
                } catch (e) {
                    console.error('Export failed:', e);
                    alert('Export failed: ' + e.message);
                }
            } else {
                // Browser fallback: download local JSON
                const data = { version: '1.0', exportedAt: new Date().toISOString(), env: state.envVars };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'env-vars.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        });
    }

    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', async (e) => {
            const file = importInput.files[0];
            if (!file) return;
            const text = await file.text();
            try {
                const payload = JSON.parse(text);
                const items = payload.env || payload;
                if (!Array.isArray(items)) throw new Error('Invalid format');

                // Merge with prompt on conflicts
                const existingKeys = state.envVars.map(v => v.key);
                let skipped = 0;
                for (const item of items) {
                    const key = item.key;
                    const value = item.value || '';
                    const enabled = item.enabled !== false;
                    if (existingKeys.includes(key)) {
                        // ask whether to overwrite
                        const tauri = window.__TAURI__;
                        const dialog = tauri?.dialog || tauri?.core?.dialog;
                        let overwrite = false;
                        if (dialog) {
                            overwrite = await dialog.confirm(`Environment variable ${key} exists. Overwrite?`, { title: 'Import Env Vars', type: 'warning' });
                        } else {
                            overwrite = confirm(`Environment variable ${key} exists. Overwrite?`);
                        }
                        if (!overwrite) {
                            skipped++;
                            continue;
                        }
                    }
                    await setEnvVar(key, value, enabled);
                }

                if (skipped > 0) {
                    alert(`${skipped} variables were skipped`);
                }

                renderEnvVars();
            } catch (err) {
                console.error('Failed to import env vars:', err);
                alert('Failed to import env vars: ' + err.message);
            } finally {
                importInput.value = null;
            }
        });
    }
});
