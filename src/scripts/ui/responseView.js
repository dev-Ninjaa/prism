// Response viewer
let isPrettyPrint = true;

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

    // Detect content type
    const contentType = getContentType(response.headers);
    const isJson = contentType && contentType.includes('application/json');
    const isXml = contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'));
    const isHtml = contentType && contentType.includes('text/html');

    // Body
    if (response.body) {
        if (isPrettyPrint) {
            if (isJson && typeof response.body === 'object') {
                responseBody.innerHTML = formatJSON(response.body);
            } else if (isXml) {
                responseBody.textContent = formatXML(response.body);
            } else if (isHtml) {
                responseBody.innerHTML = response.body;
            } else {
                responseBody.textContent = response.body;
            }
        } else {
            responseBody.textContent = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
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

function getContentType(headers) {
    if (!headers) return null;
    const contentType = Object.keys(headers).find(key => key.toLowerCase() === 'content-type');
    return contentType ? headers[contentType] : null;
}

function formatXML(xml) {
    // Basic XML formatting
    return xml.replace(/></g, '>\n<').replace(/(<[^>]+>)/g, '\n$1').trim();
}

// Initialize response controls
function initResponseControls() {
    const prettyPrintBtn = document.getElementById('prettyPrintBtn');
    const rawViewBtn = document.getElementById('rawViewBtn');

    if (prettyPrintBtn) {
        prettyPrintBtn.addEventListener('click', () => {
            isPrettyPrint = true;
            if (state.response) renderResponse(state.response);
        });
    }

    if (rawViewBtn) {
        rawViewBtn.addEventListener('click', () => {
            isPrettyPrint = false;
            if (state.response) renderResponse(state.response);
        });
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
