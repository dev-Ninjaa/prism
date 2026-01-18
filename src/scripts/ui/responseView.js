// Response viewer
function renderResponse(response) {
    const statusBadge = document.getElementById('statusBadge');
    const responseTime = document.getElementById('responseTime');
    const responseSize = document.getElementById('responseSize');
    const responseBody = document.getElementById('responseBody');
    const responseHeaders = document.getElementById('responseHeaders');

    // Status badge
    const statusClass = `status-${Math.floor(response.status / 100)}xx`;
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = `${response.status} ${response.statusText}`;

    // Meta info
    responseTime.textContent = `${response.time}ms`;
    responseSize.textContent = `${response.size} KB`;

    // Body
    if (response.body) {
        if (typeof response.body === 'string') {
            responseBody.textContent = response.body;
        } else {
            const formatted = formatJSON(response.body);
            responseBody.innerHTML = formatted;
        }
    } else {
        responseBody.textContent = '(No content)';
    }

    // Headers
    if (response.headers) {
        const formatted = formatJSON(response.headers);
        responseHeaders.innerHTML = formatted;
    }
}

function formatJSON(obj) {
    const json = JSON.stringify(obj, null, 2);
    
    // Simple syntax highlighting
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: null/g, ': <span class="json-null">null</span>');
}
