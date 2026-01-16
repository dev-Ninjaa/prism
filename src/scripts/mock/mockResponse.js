// Real HTTP request via Tauri
async function generateMockResponse(request) {
    // Check if running in Tauri
    if (window.__TAURI__) {
        try {
            const { invoke } = window.__TAURI__.core;
            
            // Call Rust backend
            const response = await invoke('send_request', { 
                req: {
                    method: request.method,
                    url: request.url,
                    params: request.params || [],
                    headers: request.headers || [],
                    body: request.body || null,
                    auth: request.auth
                }
            });
            
            return response;
        } catch (error) {
            console.error('Tauri request failed:', error);
            throw new Error(error);
        }
    }
    
    // Fallback mock for browser testing
    return new Promise((resolve) => {
        setTimeout(() => {
            const responses = {
                GET: {
                    status: 200,
                    statusText: 'OK',
                    body: {
                        id: 1,
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                        username: 'johndoe',
                        address: {
                            street: '123 Main St',
                            city: 'San Francisco',
                            zipcode: '94102'
                        },
                        company: {
                            name: 'Tech Corp',
                            catchPhrase: 'Innovation at scale'
                        }
                    },
                    headers: {
                        'content-type': 'application/json',
                        'x-powered-by': 'Prism',
                        'cache-control': 'no-cache',
                        'date': new Date().toUTCString()
                    }
                },
                POST: {
                    status: 201,
                    statusText: 'Created',
                    body: {
                        message: 'Resource created successfully',
                        id: Math.floor(Math.random() * 1000),
                        timestamp: new Date().toISOString()
                    },
                    headers: {
                        'content-type': 'application/json',
                        'location': '/api/resource/123'
                    }
                },
                PUT: {
                    status: 200,
                    statusText: 'OK',
                    body: {
                        message: 'Resource updated successfully',
                        updated: true
                    }
                },
                DELETE: {
                    status: 204,
                    statusText: 'No Content',
                    body: null
                },
                PATCH: {
                    status: 200,
                    statusText: 'OK',
                    body: {
                        message: 'Resource partially updated',
                        modified: ['name', 'email']
                    }
                }
            };

            const response = responses[request.method] || responses.GET;
            const time = Math.floor(Math.random() * 300) + 100;
            const size = JSON.stringify(response.body).length / 1024;

            resolve({
                ...response,
                time,
                size: size.toFixed(2)
            });
        }, 800);
    });
}
