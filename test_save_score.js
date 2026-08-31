const http = require('http');

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    try {
        const email = 'test' + Date.now() + '@example.com';
        let res = await request({
            hostname: 'localhost', port: 8080, path: '/api/auth/register', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { firstName: 'Test', lastName: 'User', email, password: 'password' });
        
        if (res.status !== 200 && res.status !== 201) {
            console.log('Register failed', res);
            return;
        }
        
        const token = JSON.parse(res.body).token;
        console.log('Token:', token.substring(0, 20) + '...');
        
        const scoreRes = await request({
            hostname: 'localhost', port: 8080, path: '/api/aptitude/assessments/save-score', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        }, { score: 10, totalQuestions: 15, accuracy: 66.67 });
        
        console.log('Score Response Status:', scoreRes.status);
        console.log('Score Response Body:', scoreRes.body);
    } catch (e) {
        console.error(e);
    }
}
run();
