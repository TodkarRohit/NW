/**
 * Engineering Notes Hub - Step 7 Security Verification Test Suite
 * Re-verifies all access control paths and reports exact HTTP status codes.
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { app } = require('./server');
const User = require('./models/User');
const { generateToken } = require('./utils/tokenUtils');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qkasthiyysuussaxtkzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXN0aGl5eXN1dXNzYXh0a3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjA2MDgsImV4cCI6MjEwMzkzNjYwOH0.Plte859APDo38ybU9vhCqxfHGpq4Idzxj7HCX5aXjvA';

async function runSecurityVerification() {
    console.log('================================================================');
    console.log('      STEP 7 SECURITY RE-VERIFICATION TEST SUITE               ');
    console.log('================================================================\n');

    const PORT = 5002;
    const testServer = app.listen(PORT);
    const BACKEND_URL = `http://localhost:${PORT}/api/assignments`;

    // Create mock in-memory database entries if DB isn't running
    let regularUserToken;
    let adminUserToken;

    try {
        let regUser = await User.findOne({ username: 'stduser1' });
        if (!regUser) {
            regUser = new User({ username: 'stduser1', password: 'password123', role: 'user' });
            await regUser.save().catch(() => {});
        }
        regularUserToken = generateToken(regUser);
    } catch {
        regularUserToken = generateToken({ id: '507f1f77bcf86cd799439011', username: 'stduser1', role: 'user' });
    }

    try {
        let adminUser = await User.findOne({ username: 'adminadm' });
        if (!adminUser) {
            adminUser = new User({ username: 'adminadm', password: 'password123', role: 'admin' });
            await adminUser.save().catch(() => {});
        }
        adminUserToken = generateToken(adminUser);
    } catch {
        adminUserToken = generateToken({ id: '507f1f77bcf86cd799439022', username: 'adminadm', role: 'admin' });
    }

    console.log('--- TEST 1: Direct Anonymous Supabase REST API (Anon Key) ---');

    // 1a. Direct Anon INSERT on assignments
    try {
        const resInsert = await fetch(`${SUPABASE_URL}/rest/v1/assignments`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                id: 'test_anon_insert_id',
                subject_key: 'dsa',
                chapter_id: 'ch1',
                title: 'Anon Insert Test',
                question_file: 'test.pdf',
                question_data_url: 'data:application/pdf;base64,'
            })
        });
        console.log(`  [STATUS ${resInsert.status}] Direct Anon INSERT on public.assignments`);
    } catch (e) {
        console.log(`  [REJECTED/ERROR] Direct Anon INSERT on public.assignments: ${e.message}`);
    }

    // 1b. Direct Anon UPDATE on assignments
    try {
        const resUpdate = await fetch(`${SUPABASE_URL}/rest/v1/assignments?id=eq.test_anon_insert_id`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: 'Hacked Title' })
        });
        console.log(`  [STATUS ${resUpdate.status}] Direct Anon UPDATE on public.assignments`);
    } catch (e) {
        console.log(`  [REJECTED/ERROR] Direct Anon UPDATE on public.assignments: ${e.message}`);
    }

    // 1c. Direct Anon DELETE on assignments
    try {
        const resDelete = await fetch(`${SUPABASE_URL}/rest/v1/assignments?id=eq.test_anon_insert_id`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        console.log(`  [STATUS ${resDelete.status}] Direct Anon DELETE on public.assignments`);
    } catch (e) {
        console.log(`  [REJECTED/ERROR] Direct Anon DELETE on public.assignments: ${e.message}`);
    }

    // 1d. Direct Anon Upload on storage academic-files
    try {
        const resStorageUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/academic-files/test_anon_file.txt`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'text/plain'
            },
            body: 'anonymous upload attempt'
        });
        console.log(`  [STATUS ${resStorageUpload.status}] Direct Anon Upload on academic-files storage`);
    } catch (e) {
        console.log(`  [REJECTED/ERROR] Direct Anon Upload on academic-files: ${e.message}`);
    }

    // 1e. Direct Anon SELECT on assignments (Allowed Read)
    try {
        const resSelect = await fetch(`${SUPABASE_URL}/rest/v1/assignments?select=id,title&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        console.log(`  [STATUS ${resSelect.status}] Direct Anon SELECT on public.assignments (Public Read)`);
    } catch (e) {
        console.log(`  [ERROR] Direct Anon SELECT: ${e.message}`);
    }

    console.log('\n--- TEST 2: Express Backend Write Proxy Security Routes ---');

    // 2a. Anonymous call to /api/assignments/upsert (No Token)
    try {
        const resNoToken = await fetch(`${BACKEND_URL}/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'test', title: 'test' })
        });
        console.log(`  [STATUS ${resNoToken.status}] Anonymous POST /api/assignments/upsert (No JWT)`);
    } catch (e) {
        console.log(`  [FETCH ERROR] Anonymous /api/assignments/upsert: ${e.message}`);
    }

    // 2b. Regular Non-Admin User call to /api/assignments/upsert
    try {
        const resUserUpsert = await fetch(`${BACKEND_URL}/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${regularUserToken}`
            },
            body: JSON.stringify({ id: 'test', title: 'test' })
        });
        console.log(`  [STATUS ${resUserUpsert.status}] Non-Admin User POST /api/assignments/upsert`);
    } catch (e) {
        console.log(`  [FETCH ERROR] Non-Admin /api/assignments/upsert: ${e.message}`);
    }

    // 2c. Regular Non-Admin User call to /api/assignments/delete
    try {
        const resUserDelete = await fetch(`${BACKEND_URL}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${regularUserToken}`
            },
            body: JSON.stringify({ id: 'test' })
        });
        console.log(`  [STATUS ${resUserDelete.status}] Non-Admin User POST /api/assignments/delete`);
    } catch (e) {
        console.log(`  [FETCH ERROR] Non-Admin /api/assignments/delete: ${e.message}`);
    }

    // 2d. Admin User call to /api/assignments/upsert
    try {
        const resAdminUpsert = await fetch(`${BACKEND_URL}/upsert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminUserToken}`
            },
            body: JSON.stringify({
                id: 'test_admin_upsert_123',
                subject_key: 'dsa',
                chapter_id: 'ch1',
                title: 'Admin Verified Assignment',
                question_file: 'q.pdf',
                question_data_url: 'data:application/pdf;base64,test'
            })
        });
        console.log(`  [STATUS ${resAdminUpsert.status}] Promoted Admin POST /api/assignments/upsert`);
    } catch (e) {
        console.log(`  [FETCH ERROR] Admin /api/assignments/upsert: ${e.message}`);
    }

    // 2e. Admin User call to /api/assignments/delete
    try {
        const resAdminDelete = await fetch(`${BACKEND_URL}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminUserToken}`
            },
            body: JSON.stringify({ id: 'test_admin_upsert_123' })
        });
        console.log(`  [STATUS ${resAdminDelete.status}] Promoted Admin POST /api/assignments/delete`);
    } catch (e) {
        console.log(`  [FETCH ERROR] Admin /api/assignments/delete: ${e.message}`);
    }

    console.log('\n================================================================');
    console.log('              VERIFICATION RUN COMPLETE                         ');
    console.log('================================================================\n');

    testServer.close();
    process.exit(0);
}

runSecurityVerification().catch(err => {
    console.error('Fatal verification error:', err);
    process.exit(1);
});
