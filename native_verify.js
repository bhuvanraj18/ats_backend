const http = require('http');
const fs = require('fs');

const logFile = 'native_test_result.txt';
const log = (msg) => {
    // console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

fs.writeFileSync(logFile, 'STARTING NATIVE TEST\n');

// Helper for requests
function request(method, path, data, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (token) options.headers['Authorization'] = 'Bearer ' + token;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: body ? JSON.parse(body) : {} });
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async () => {
    try {
        log('1. Registering Recruiter...');
        const recRes = await request('POST', '/auth/register', {
            email: `rec_native_${Date.now()}@test.com`,
            password: 'password123',
            role: 'RECRUITER',
            name: 'Native Recruiter',
            companyId: 1
        });
        log('Recruiter ID: ' + recRes.data.userId);

        log('2. Login Recruiter...');
        const recLogin = await request('POST', '/auth/login', {
            email: recRes.data.userId ? `rec_native_${Date.now()}@test.com` : 'failed', // Simplified
            // Wait, I can't reuse date.now exactly.
            // Better to capture email from register or just use fixed email unique per run?
            // Let's rely on the fact that I just sent it.
        });
        // Logic error above: Date.now() changes.
        // Fix:
    } catch (e) { log('Error: ' + e.message); }
})();

// Retrying logic with better composition
async function main() {
    try {
        const ts = Date.now();
        const recEmail = `rec_nat_${ts}@test.com`;

        log('1. Register Recruiter');
        const recReg = await request('POST', '/auth/register', {
            email: recEmail, password: 'password123', role: 'RECRUITER', name: 'Rec', companyId: 1
        });
        if (recReg.status !== 201) throw new Error('Reg Failed: ' + JSON.stringify(recReg.data));
        log('Recruiter Registered');

        log('2. Login Recruiter');
        const recLog = await request('POST', '/auth/login', { email: recEmail, password: 'password123' });
        const recToken = recLog.data.token;
        if (!recToken) throw new Error('No token');
        log('Got Recruiter Token');

        log('3. Create Job');
        const job = await request('POST', '/jobs', {
            title: 'Native Job', description: 'Desc', companyId: 1
        }, recToken);
        if (job.status !== 201) throw new Error('Job Failed: ' + JSON.stringify(job.data));
        const jobId = job.data.id;
        log('Job Created: ' + jobId);

        log('4. Register Candidate');
        const canEmail = `can_nat_${ts}@test.com`;
        const canReg = await request('POST', '/auth/register', {
            email: canEmail, password: 'password123', role: 'CANDIDATE', name: 'Can'
        });
        if (canReg.status !== 201) throw new Error('Can Reg Failed');

        log('5. Login Candidate');
        const canLog = await request('POST', '/auth/login', { email: canEmail, password: 'password123' });
        const canToken = canLog.data.token;
        log('Got Candidate Token');

        log('6. Apply');
        const app = await request('POST', '/applications', { jobId }, canToken);
        if (app.status !== 201) throw new Error('Apply Failed: ' + JSON.stringify(app.data));
        const appId = app.data.id;
        log('Application Created: ' + appId);

        log('7. Update Stage (Recruiter)');
        const update = await request('PUT', `/applications/${appId}/stage`, { stage: 'SCREENING' }, recToken);
        if (update.status !== 200) throw new Error('Update Failed: ' + JSON.stringify(update.data));
        log('Stage Updated to: ' + update.data.stage);

        log('SUCCESS: ALL NATIVE TESTS PASSED');

    } catch (e) {
        log('FAILED: ' + e.message);
    }
}

main();
