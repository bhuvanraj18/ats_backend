const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000';
const LOG_FILE = __dirname + '/api_test_results.txt';

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
};

const run = async () => {
    try {
        fs.writeFileSync(LOG_FILE, ''); // Clean result file
        log('--- STARTING COMPREHENSIVE API TEST ---');

        // 1. AUTH: Register Recruiter
        log('\n[TEST] Register Recruiter');
        const recEmail = `rec_${Date.now()}@test.com`;
        const recRes = await axios.post(`${API_URL}/auth/register`, {
            email: recEmail,
            password: 'password123',
            role: 'RECRUITER',
            name: 'Recruiter User',
            companyId: 1
        });
        log('SUCCESS: Registered Recruiter ID ' + recRes.data.userId);

        // 2. AUTH: Login Recruiter
        log('\n[TEST] Login Recruiter');
        const recLogin = await axios.post(`${API_URL}/auth/login`, {
            email: recEmail,
            password: 'password123'
        });
        const recToken = recLogin.data.token;
        log('SUCCESS: Recruiter Token received');

        // 3. JOB: Create Job (Recruiter only)
        log('\n[TEST] Create Job');
        const jobRes = await axios.post(`${API_URL}/jobs`, {
            title: 'Backend Dev',
            description: 'Node.js expert',
            companyId: 1
        }, { headers: { Authorization: `Bearer ${recToken}` } });
        const jobId = jobRes.data.id;
        log('SUCCESS: Job Created ID ' + jobId);

        // 4. JOB: Get All Jobs (Public)
        log('\n[TEST] Get All Jobs');
        const jobsRes = await axios.get(`${API_URL}/jobs`);
        if (jobsRes.data.length > 0) log('SUCCESS: Jobs list retrieved');
        else throw new Error('Jobs list empty');

        // 5. AUTH: Register Candidate
        log('\n[TEST] Register Candidate');
        const canEmail = `can_${Date.now()}@test.com`;
        const canRes = await axios.post(`${API_URL}/auth/register`, {
            email: canEmail,
            password: 'password123',
            role: 'CANDIDATE',
            name: 'Candidate User'
        });
        log('SUCCESS: Registered Candidate ID ' + canRes.data.userId);

        // 6. AUTH: Login Candidate
        log('\n[TEST] Login Candidate');
        const canLogin = await axios.post(`${API_URL}/auth/login`, {
            email: canEmail,
            password: 'password123'
        });
        const canToken = canLogin.data.token;
        log('SUCCESS: Candidate Token received');

        // 7. APPLICATION: Create Application
        log('\n[TEST] Apply for Job');
        const appRes = await axios.post(`${API_URL}/applications`, {
            jobId: jobId
        }, { headers: { Authorization: `Bearer ${canToken}` } });
        const appId = appRes.data.id;
        log('SUCCESS: Application Created ID ' + appId);

        // 8. APPLICATION: Get My Applications
        log('\n[TEST] Get My Applications');
        const myAppsRes = await axios.get(`${API_URL}/applications/my`, {
            headers: { Authorization: `Bearer ${canToken}` }
        });
        if (myAppsRes.data.length > 0 && myAppsRes.data[0].id === appId) {
            log('SUCCESS: My applications retrieved correctly');
        } else {
            throw new Error('My applications check failed');
        }

        // 9. APPLICATION: Update Stage (Recruiter) - The NEW API
        log('\n[TEST] Update Application Stage (Recruiter)');
        const updateRes = await axios.put(`${API_URL}/applications/${appId}/stage`, {
            stage: 'INTERVIEW'
        }, { headers: { Authorization: `Bearer ${recToken}` } });

        if (updateRes.data.stage === 'INTERVIEW') {
            log('SUCCESS: Stage updated to INTERVIEW');
        } else {
            throw new Error('Stage update mismatch: ' + updateRes.data.stage);
        }

        log('\n--- ALL TESTS PASSED ---');

    } catch (error) {
        log('\n!!! TEST FAILED !!!');
        if (error.response) {
            log(`Status: ${error.response.status}`);
            log('Data: ' + JSON.stringify(error.response.data));
        } else {
            log('Error: ' + error.message);
        }
    }
};

run();
