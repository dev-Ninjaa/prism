// Environment Variables UI Management

function renderEnvVars() {
    const container = document.getElementById('envVarsList');
    if (!container) return;

    if (state.envVars.length === 0) {
        container.innerHTML = '<div class="empty-state">No environment variables</div>';
        return;
    }

    container.innerHTML = state.envVars.map(envVar => `
        <div class="kv-row" data-env-key="${escapeHtml(envVar.key)}">
            <input type="text" 
                   class="env-key" 
                   placeholder="VARIABLE_NAME" 
                   value="${escapeHtml(envVar.key)}"
                   data-original-key="${escapeHtml(envVar.key)}">
            <input type="text" 
                   class="env-value" 
                   placeholder="value" 
                   value="${escapeHtml(envVar.value)}">
            <button class="btn-icon-small btn-delete-env" data-key="${escapeHtml(envVar.key)}">×</button>
        </div>
    `).join('');

    // Attach event listeners
    attachEnvVarListeners();
}

function attachEnvVarListeners() {
    const container = document.getElementById('envVarsList');
    if (!container) return;

    // Handle key/value changes
    container.querySelectorAll('.kv-row').forEach(row => {
        const keyInput = row.querySelector('.env-key');
        const valueInput = row.querySelector('.env-value');
        const originalKey = keyInput.dataset.originalKey;

        // Debounce updates
        let updateTimeout;

        const handleUpdate = async () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(async () => {
                const newKey = keyInput.value.trim();
                const newValue = valueInput.value;

                if (!newKey) return;

                try {
                    // If key changed, delete old and create new
                    if (newKey !== originalKey) {
                        await deleteEnvVar(originalKey);
                    }
                    await setEnvVar(newKey, newValue);
                    renderEnvVars();
                } catch (e) {
                    console.error('Failed to update env var:', e);
                }
            }, 500);
        };

        keyInput.addEventListener('input', handleUpdate);
        valueInput.addEventListener('input', handleUpdate);
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
});
