/**
 * Engineering Notes Hub - Isolated 7-Step Security Verification Suite
 * Executes each test independently and captures raw HTTP status code + full body.
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { app } = require('./server');
const User = require('./models/User');
const { generateToken } = require('./utils/tokenUtils');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qkasthiyysuussaxtkzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXN0aGl5eXN1dXNzYXh0a3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjA2MDgsImV4cCI6MjEwMzkzNjYwOH0.Plte859APDo38ybU9vhCqxfHGpq4Idzxj7HCX5aXjvA';

async function runIsolatedTests() {
    const PORT = 5005;
    const testServer = app.listen(PORT);
    const BACKEND_URL = `http://localhost:${PORT}/api/assignments`;

    console.log('================================================================');
    console.log('            ISOLATED SECURITY VERIFICATION TESTS                ');
    console.log('================================================================\n');

    // Create target user objects
    // Legacy user created before role field (doc missing role property)
    const legacyUserObj = { _id: '507f1f77bcf86cd799439011', username: 'legacyu1' }; // role undefined -> resolves to 'user' default
    const adminUserObj = { _id: '507f1f77bcf86cd799439022', username: 'rohittod', role: 'admin' };

    // Mock User.findById so auth middleware resolves req.user cleanly without external MongoDB daemon
    User.findById = function (id) {
        return {
            select: function () {
                if (String(id) === String(legacyUserObj._id)) {
                    return Promise.resolve(legacyUserObj);
                }
                if (String(id) === String(adminUserObj._id)) {
                    return Promise.resolve(adminUserObj);
                }
                return Promise.resolve(null);
            }
        };
    };

    const legacyUserToken = generateToken(legacyUserObj);
    const adminUserToken = generateToken(adminUserObj);

    // --- TEST A ---
    console.log('--- TEST A: Anonymous POST to Supabase REST /rest/v1/assignments ---');
    try {
        const resA = await fetch(`${SUPABASE_URL}/rest/v1/assignments`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                id: 'test_anon_a_id',
                subject_key: 'dsa',
                chapter_id: 'ch1',
                title: 'Anon Insert Test',
                question_file: 'test.pdf',
                question_data_url: 'data:application/pdf;base64,'
            })
        });
        const bodyA = await resA.text();
        console.log(`HTTP Status: ${resA.status}`);
        console.log(`Response Body:\n${bodyA}\n`);
    } catch (err) {
        console.error('Test A Error:', err.message);
    }

    // --- TEST B ---
    console.log('--- TEST B: Anonymous POST to Supabase Storage /storage/v1/object/academic-files/... ---');
    try {
        const resB = await fetch(`${SUPABASE_URL}/storage/v1/object/academic-files/test_verification.txt`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'text/plain'
            },
            body: 'anonymous upload payload'
        });
        const bodyB = await resB.text();
        console.log(`HTTP Status: ${resB.status}`);
        console.log(`Response Body:\n${bodyB}\n`);
    } catch (err) {
        console.error('Test B Error:', err.message);
    }

    // --- TEST C ---
    console.log('--- TEST C: Anonymous GET to Supabase REST /rest/v1/assignments ---');
    try {
        const resC = await fetch(`${SUPABASE_URL}/rest/v1/assignments?select=id,title,subject_key,chapter_id&limit=2`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const bodyC = await resC.text();
        console.log(`HTTP Status: ${resC.status}`);
        console.log(`Response Body:\n${bodyC}\n`);
    } catch (err) {
        console.error('Test C Error:', err.message);
    }

    // --- TEST D ---
    console.log('--- TEST D: POST /api/assignments/upsert with no Authorization header ---');
    try {
        const resD = await fetch(`${BACKEND_URL}/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'test_d', title: 'Test D' })
        });
        const bodyD = await resD.text();
        console.log(`HTTP Status: ${resD.status}`);
        console.log(`Response Body:\n${bodyD}\n`);
    } catch (err) {
        console.error('Test D Error:', err.message);
    }

    // --- TEST E ---
    console.log('--- TEST E: POST /api/assignments/upsert with legacy user JWT (pre-role field) ---');
    try {
        const resE = await fetch(`${BACKEND_URL}/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${legacyUserToken}`
            },
            body: JSON.stringify({ id: 'test_e', title: 'Test E' })
        });
        const bodyE = await resE.text();
        console.log(`Resolved User Role: '${legacyUserObj.role || 'user'}' (Missing field defaults to 'user')`);
        console.log(`HTTP Status: ${resE.status}`);
        console.log(`Response Body:\n${bodyE}\n`);
    } catch (err) {
        console.error('Test E Error:', err.message);
    }

    // --- TEST F ---
    console.log('--- TEST F: POST /api/assignments/upsert with admin user JWT ---');
    try {
        const resF = await fetch(`${BACKEND_URL}/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminUserToken}`
            },
            body: JSON.stringify({
                id: 'test_f_admin_assignment',
                subject_key: 'dsa',
                chapter_id: 'ch1',
                title: 'Admin Created Test Assignment',
                question_file: 'test_q.pdf',
                question_data_url: 'data:application/pdf;base64,testdata'
            })
        });
        const bodyF = await resF.text();
        console.log(`HTTP Status: ${resF.status}`);
        console.log(`Response Body:\n${bodyF}\n`);
    } catch (err) {
        console.error('Test F Error:', err.message);
    }

    // --- TEST G ---
    console.log('--- TEST G: POST /api/assignments/upload with file over 25MB multer limit ---');
    try {
        const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024); // 26MB buffer
        const formData = new FormData();
        formData.append('path', 'assignments/oversized_test.pdf');
        formData.append('file', new Blob([oversizedBuffer], { type: 'application/pdf' }), 'oversized_test.pdf');

        const resG = await fetch(`${BACKEND_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminUserToken}`
            },
            body: formData
        });
        const bodyG = await resG.text();
        console.log(`HTTP Status: ${resG.status}`);
        console.log(`Response Body:\n${bodyG}\n`);
    } catch (err) {
        console.error('Test G Error:', err.message);
    }

    testServer.close();
    process.exit(0);
}

runIsolatedTests().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
});
