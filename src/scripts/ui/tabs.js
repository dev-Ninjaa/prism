// Tab switching functionality
function toCamelCaseDash(str) {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function setActiveTabButton(btn) {
    const group = btn.parentElement;
    if (!group) return;
    group.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
    btn.focus({ preventScroll: true });
}

function setActivePanel(container, panel) {
    container.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
    });
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
}

function initTabs() {
    // Setup ARIA roles and initial panel hidden state for each tabs group
    document.querySelectorAll('.tabs').forEach(group => {
        group.setAttribute('role', 'tablist');
        const ancestor = group.closest('.tab-group') || group.closest('.response-viewer') || document;
        const container = ancestor.querySelector('.tab-content');
        if (container) {
            container.querySelectorAll('.tab-panel').forEach(panel => {
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true');
            });
        }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        // Ensure ARIA attributes for accessibility
        btn.setAttribute('role', 'tab');
        if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', btn.classList.contains('active') ? '0' : '-1');
        if (!btn.hasAttribute('aria-selected')) btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');

        const activate = () => {
            const tabName = btn.dataset.tab;

            // Find the nearest container which has the tab panels as next sibling.
            let el = btn.closest('.tabs');
            let container = null;

            while (el) {
                if (el.nextElementSibling && el.nextElementSibling.querySelector && el.nextElementSibling.querySelector('.tab-panel')) {
                    container = el.nextElementSibling;
                    break;
                }
                el = el.parentElement;
            }

            // Fallback: try to find a sibling .tab-content somewhere up the tree
            if (!container) {
                const ancestor = btn.closest('.tab-group') || btn.closest('.response-viewer') || document;
                container = ancestor.querySelector('.tab-content');
            }

            if (!container) return;

            // Update buttons and panels
            setActiveTabButton(btn);

            // Find target panel robustly: exact, camelCase, fallback contains
            const possibleIds = [
                `${tabName}Panel`, // paramsPanel, envPanel
                `${toCamelCaseDash(tabName)}Panel`, // responseBodyPanel when tabName=response-body
            ];

            let targetPanel = null;
            for (const id of possibleIds) {
                targetPanel = container.querySelector(`#${id}`);
                if (targetPanel) break;
            }

            if (!targetPanel) {
                // Last resort: look for panels whose id contains the normalized name or contains the raw name
                const norm = toCamelCaseDash(tabName).toLowerCase();
                targetPanel = Array.from(container.querySelectorAll('.tab-panel')).find(p => {
                    const id = (p.id || '').toLowerCase();
                    return id.includes(norm) || id.includes(tabName.toLowerCase());
                });
            }

            if (!targetPanel) {
                // Fallback to index-based mapping: match the button index within its group to panels order
                try {
                    const buttons = Array.from(btn.parentElement.querySelectorAll('.tab-btn'));
                    const panels = Array.from(container.querySelectorAll('.tab-panel'));
                    const idx = buttons.indexOf(btn);
                    if (idx >= 0 && idx < panels.length) {
                        targetPanel = panels[idx];
                        console.warn(`Tab mapping fallback used for '${tabName}' — using index ${idx}`);
                    }
                } catch (e) {
                    console.error('Fallback indexing for tab mapping failed', e);
                }
            }

            if (targetPanel) {
                setActivePanel(container, targetPanel);
            } else {
                console.warn('Tab activation failed to find panel for', tabName, { container });
            }
        };

        btn.addEventListener('click', activate);

        // Keyboard support: Enter/Space to activate, ArrowLeft/Right to move
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
                return;
            }

            const group = btn.parentElement;
            if (!group) return;
            const buttons = Array.from(group.querySelectorAll('.tab-btn'));
            const idx = buttons.indexOf(btn);
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = buttons[(idx + 1) % buttons.length];
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
                if (prev) prev.focus();
            }
        });
    });
}
