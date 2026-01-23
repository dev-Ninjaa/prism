#!/usr/bin/env node

/**
 * Quick setup script for Prism Test API
 * Starts the server and provides import instructions
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Prism Test API...');
console.log('📍 Server will be available at: http://localhost:3000');
console.log('');

const server = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

server.on('close', (code) => {
    console.log(`\nServer exited with code ${code}`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test API...');
    server.kill();
    process.exit(0);
});

setTimeout(() => {
    console.log('');
    console.log('📋 Test Collections:');
    console.log('   Import file: prism-test-collections.json');
    console.log('   Collections: Basic API Tests, API Hardening Tests, Authentication Tests, Advanced Tests');
    console.log('');
    console.log('🔗 In Prism: Click ⋮ menu → Import Collections → Select prism-test-collections.json');
    console.log('');
}, 2000);