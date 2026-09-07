const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseAdmin = require('../config/supabaseAdmin');

async function cleanupTestData() {
    console.log('--- Cleaning Up Test Data in Supabase public.assignments ---');

    try {
        // 1. Fetch current rows count before deletion
        const { data: rowsBefore, error: errBefore } = await supabaseAdmin
            .from('assignments')
            .select('id, title, subject_key');

        if (errBefore) {
            console.error('Error querying assignments table:', errBefore);
            process.exit(1);
        }

        console.log(`Row count BEFORE cleanup: ${rowsBefore.length}`);
        console.log('Current rows:', rowsBefore);

        // 2. Identify test IDs to delete
        const testIds = rowsBefore
            .filter(r => r.id.includes('test') || r.id.includes('anon') || (r.title && r.title.toLowerCase().includes('test')))
            .map(r => r.id);

        console.log('\nTest IDs identified for deletion:', testIds);

        if (testIds.length > 0) {
            // Delete statement
            const { data: deletedData, error: delErr } = await supabaseAdmin
                .from('assignments')
                .delete()
                .in('id', testIds)
                .select();

            if (delErr) {
                console.error('Error deleting test rows:', delErr);
            } else {
                console.log('Successfully deleted test rows:', deletedData);
            }
        } else {
            console.log('No test rows found matching deletion criteria.');
        }

        // 3. Fetch rows count after deletion
        const { data: rowsAfter, error: errAfter } = await supabaseAdmin
            .from('assignments')
            .select('id, title, subject_key');

        if (errAfter) {
            console.error('Error querying assignments table after cleanup:', errAfter);
        } else {
            console.log(`\nRow count AFTER cleanup: ${rowsAfter.length}`);
            console.log('Remaining rows:', rowsAfter);
        }

    } catch (e) {
        console.error('Exception during cleanup:', e.message);
    }

    process.exit(0);
}

cleanupTestData();
