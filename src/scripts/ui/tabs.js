// Tab switching functionality
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
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

            // Update buttons (only within the same tabs group)
            const siblingButtons = btn.parentElement.querySelectorAll('.tab-btn');
            siblingButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (!container) return;

            // Update panels
            container.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

            const targetPanel = container.querySelector(`#${tabName}Panel`) || container.querySelector(`[id*="${tabName}"]`);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}
