// Tab switching functionality
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            const container = btn.closest('.tabs').nextElementSibling;
            
            // Update buttons
            btn.parentElement.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            // Update panels
            container.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            const targetPanel = container.querySelector(`#${tabName}Panel`) || 
                               container.querySelector(`[id*="${tabName}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}
