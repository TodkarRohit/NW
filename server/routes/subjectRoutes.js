const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabaseAdmin');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @desc    Upsert subject (Save / Update subject)
 * @route   POST /api/subjects/upsert
 * @access  Protected (Admin only)
 */
router.post('/upsert', protect, requireAdmin, async (req, res, next) => {
    try {
        const subjectData = req.body.subject || req.body;
        if (!subjectData || (!subjectData.id && !subjectData.code && !subjectData.title)) {
            return res.status(400).json({ success: false, message: 'Invalid subject payload' });
        }

        // 1. Sync global state app_data.json in Supabase Storage if state payload provided
        if (req.body.exportData) {
            const jsonBuffer = Buffer.from(JSON.stringify(req.body.exportData, null, 2), 'utf-8');
            const { error: storageErr } = await supabaseAdmin.storage
                .from('academic-files')
                .upload('published_state/app_data.json', jsonBuffer, {
                    contentType: 'application/json',
                    upsert: true
                });
            if (storageErr) {
                console.warn('[SubjectRoutes] Warning publishing state to storage:', storageErr.message);
            }
        }

        // 2. Optionally upsert into public.subjects table if created in DB
        let dbData = null;
        try {
            const { data, error } = await supabaseAdmin
                .from('subjects')
                .upsert(subjectData)
                .select();
            if (!error) dbData = data;
        } catch {
            // Ignore if subjects table does not exist in DB schema
        }

        res.status(200).json({
            success: true,
            message: 'Subject saved successfully through backend proxy.',
            data: dbData || subjectData
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc    Delete subject
 * @route   POST /api/subjects/delete
 * @access  Protected (Admin only)
 */
router.post('/delete', protect, requireAdmin, async (req, res, next) => {
    try {
        const { id, subjectId } = req.body;
        const targetId = id || subjectId;

        if (!targetId) {
            return res.status(400).json({ success: false, message: 'Subject ID required' });
        }

        // 1. Delete from subjects table if exists
        try {
            await supabaseAdmin
                .from('subjects')
                .delete()
                .eq('id', targetId);
        } catch {
            // Ignore if subjects table does not exist
        }

        // 2. Sync global state app_data.json in Supabase Storage if state payload provided
        if (req.body.exportData) {
            const jsonBuffer = Buffer.from(JSON.stringify(req.body.exportData, null, 2), 'utf-8');
            await supabaseAdmin.storage
                .from('academic-files')
                .upload('published_state/app_data.json', jsonBuffer, {
                    contentType: 'application/json',
                    upsert: true
                });
        }

        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully through backend proxy.',
            id: targetId
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
