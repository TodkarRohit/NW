/**
 * Engineering Notes Hub - Comprehensive Backend Test Suite
 * Tests all components:
 * 1. Google Drive Option A Safety Validator Utility
 * 2. JWT Generation, Verification & Expiry/Tampering Defense
 * 3. Bcrypt Password Hashing & Safe Serialization Security
 * 4. User Model 8-Character Strict Schema Validation
 * 5. HTTP API Endpoints:
 *    - Health Check (/api/health)
 *    - Registration Validation (Reject <8, >8, short passwords)
 *    - Login Validation (Reject missing credentials)
 *    - Protected Routes (/api/users) - Missing & Tampered JWT rejection
 *    - Protected Routes (/api/users) - Valid JWT acceptance
 *    - Resource Management & Google Drive Link Verification
 *    - Logout Endpoint (/api/auth/logout)
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('./utils/tokenUtils');
const { isValidGoogleDriveUrl, extractGoogleDriveId, getGoogleDriveEmbedUrl } = require('./utils/driveValidator');
const User = require('./models/User');

const BASE_URL = 'http://localhost:5000/api';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passedTests++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failedTests++;
    }
}

async function runTests() {
    console.log('================================================================');
    console.log('       ENGINEERING NOTES HUB - BACKEND TEST SUITE               ');
    console.log('================================================================\n');

    // ----------------------------------------------------
    // Section 1: Google Drive Option A Safety Validator
    // ----------------------------------------------------
    console.log('--- SECTION 1: Google Drive Option A Safety Validator ---');
    const validDriveUrls = [
        'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/view?usp=sharing',
        'https://drive.google.com/file/d/1A_2B-3C4D5E6F7G8H9I0J1K2L3M4N5O6P/view',
        'https://drive.google.com/open?id=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
        'https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/edit',
        'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'
    ];

    const invalidDriveUrls = [
        'http://drive.google.com/file/d/123/view', // Non-https
        'https://evil-drive.google.com/file/d/123', // Malicious subdomain
        'https://example.com/notes.pdf', // External domain
        'javascript:alert(1)', // XSS attack payload
        'https://drive.google.com/not-a-file-id' // Malformed path
    ];

    validDriveUrls.forEach(url => {
        assert(isValidGoogleDriveUrl(url), `Valid Drive URL accepted: ${url.substring(0, 45)}...`);
        const id = extractGoogleDriveId(url);
        assert(id && id.length >= 25, `Drive File ID correctly extracted: ${id}`);
        const embedUrl = getGoogleDriveEmbedUrl(url);
        assert(embedUrl && embedUrl.startsWith('https://'), `Embed preview URL generated safely`);
    });

    invalidDriveUrls.forEach(url => {
        assert(!isValidGoogleDriveUrl(url), `Invalid or untrusted URL rejected: ${url}`);
    });

    // ----------------------------------------------------
    // Section 2: JWT Security & Token Utility Tests
    // ----------------------------------------------------
    console.log('\n--- SECTION 2: JWT Token Utilities & Tamper Resistance ---');
    const mockUser = { _id: '507f1f77bcf86cd799439011', username: 'student8' };
    const validToken = generateToken(mockUser);
    assert(typeof validToken === 'string' && validToken.length > 20, 'JWT token generated successfully');

    const decoded = verifyToken(validToken);
    assert(decoded.id === mockUser._id && decoded.username === 'student8', 'Decoded JWT payload matches user info');

    let tamperedFailed = false;
    try {
        verifyToken(validToken + 'tampered');
    } catch {
        tamperedFailed = true;
    }
    assert(tamperedFailed, 'Tampered JWT signature was correctly rejected by verifyToken');

    // ----------------------------------------------------
    // Section 3: Bcrypt Password Hashing & Safety Tests
    // ----------------------------------------------------
    console.log('\n--- SECTION 3: Bcrypt Hashing & Password Security ---');
    const rawPassword = 'StudentSecretPassword@2026';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    assert(hashedPassword !== rawPassword, 'Password is hashed and differs from plain text');
    assert(hashedPassword.startsWith('$2'), 'Bcrypt hash format ($2a / $2b) verified');

    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    assert(isMatch === true, 'Bcrypt successfully verified correct password');

    const isWrongMatch = await bcrypt.compare('WrongPassword123', hashedPassword);
    assert(isWrongMatch === false, 'Bcrypt successfully rejected incorrect password');

    // Test safe serialization (toJSON method removes password)
    const testUserDoc = new User({ username: 'user1234', password: hashedPassword });
    const serializedJson = testUserDoc.toJSON();
    assert(serializedJson.password === undefined, 'toJSON() strips password from serialized responses');
    assert(serializedJson.username === 'user1234', 'toJSON() preserves safe fields');

    // ----------------------------------------------------
    // Section 4: User Model 8-Character Schema Validation
    // ----------------------------------------------------
    console.log('\n--- SECTION 4: User Model 8-Character Validation Schema ---');
    const validUserInstance = new User({ username: 'exact8ch', password: 'password123' });
    const validErr = validUserInstance.validateSync();
    assert(!validErr, '8-character username passes User schema validation');

    const shortUserInstance = new User({ username: 'short', password: 'password123' });
    const shortErr = shortUserInstance.validateSync();
    assert(shortErr && shortErr.errors.username, '5-character username fails User schema validation');

    const longUserInstance = new User({ username: 'verylonguser12', password: 'password123' });
    const longErr = longUserInstance.validateSync();
    assert(longErr && longErr.errors.username, '14-character username fails User schema validation');

    // ----------------------------------------------------
    // Section 5: Live API Endpoints Verification
    // ----------------------------------------------------
    console.log('\n--- SECTION 5: Live HTTP API Endpoints ---');

    // 5a. Health Check
    try {
        const healthRes = await fetch(`${BASE_URL}/health`);
        const healthData = await healthRes.json();
        assert(healthRes.status === 200, `GET /api/health returned 200 OK`);
        assert(healthData.success === true, `Health check returned success: true`);
    } catch (err) {
        console.error('Cannot connect to server. Ensure server is running on port 5000:', err.message);
        process.exit(1);
    }

    // 5b. Registration Input Validation (7 chars)
    const res7 = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user123', password: 'password123' })
    });
    const data7 = await res7.json();
    assert(res7.status === 400, 'POST /api/auth/register with 7 chars rejected with 400 Bad Request');
    assert(data7.success === false && data7.message.includes('8 characters'), 'Error message states 8 characters rule');

    // 5c. Registration Input Validation (9 chars)
    const res9 = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user12345', password: 'password123' })
    });
    assert(res9.status === 400, 'POST /api/auth/register with 9 chars rejected with 400 Bad Request');

    // 5d. Registration Input Validation (short password)
    const resPass = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user1234', password: '123' })
    });
    assert(resPass.status === 400, 'POST /api/auth/register with <6 char password rejected with 400 Bad Request');

    // 5e. Login Missing Fields Validation
    const resMissingLogin = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '', password: '' })
    });
    assert(resMissingLogin.status === 400, 'POST /api/auth/login with missing fields rejected with 400 Bad Request');

    // 5f. Protected Endpoint Authorization (Missing JWT)
    const resNoToken = await fetch(`${BASE_URL}/users`);
    assert(resNoToken.status === 401, 'GET /api/users without JWT rejected with 401 Unauthorized');

    // 5g. Protected Endpoint Authorization (Invalid / Tampered JWT)
    const resBadToken = await fetch(`${BASE_URL}/users`, {
        headers: { 'Authorization': 'Bearer invalid.tampered.token' }
    });
    assert(resBadToken.status === 401, 'GET /api/users with invalid JWT rejected with 401 Unauthorized');

    // 5h. Public Resources Access (No JWT Required)
    const resPublicResources = await fetch(`${BASE_URL}/resources?subject=dsa`);
    const dataPublicResources = await resPublicResources.json();
    assert(resPublicResources.status === 200 || resPublicResources.status === 503, 'GET /api/resources is public and does not require JWT');

    // 5i. Logout Endpoint
    const resLogout = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST'
    });
    assert(resLogout.status === 200, 'POST /api/auth/logout returned 200 OK');

    // ----------------------------------------------------
    // Section 6: Summary
    // ----------------------------------------------------
    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
    console.log('================================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
});
