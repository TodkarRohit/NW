const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabaseAdmin = require('../config/supabaseAdmin');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Configure multer memory storage (limit 25MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }
});

/**
 * @desc    Upload academic file (PDF/Image) to Supabase Storage
 * @route   POST /api/assignments/upload
 * @access  Protected (Admin only)
 */
router.post('/upload', protect, requireAdmin, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }
        const storagePath = req.body.path || req.body.storagePath || req.file.originalname;

        const { data, error } = await supabaseAdmin.storage
            .from('academic-files')
            .upload(storagePath, req.file.buffer, {
                contentType: req.file.mimetype || 'application/pdf',
                upsert: true
            });

        if (error) {
            console.error('[AssignmentRoutes] Supabase storage upload error:', error.message || error);
            return res.status(500).json({ success: false, message: error.message || 'Supabase storage upload failed' });
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('academic-files')
            .getPublicUrl(storagePath);

        res.status(200).json({
            success: true,
            path: storagePath,
            publicUrl: urlData ? urlData.publicUrl : null,
            data
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc    Delete academic file from Supabase Storage
 * @route   POST /api/assignments/delete-file
 * @access  Protected (Admin only)
 */
router.post('/delete-file', protect, requireAdmin, async (req, res, next) => {
    try {
        const { path } = req.body;
        if (!path) {
            return res.status(400).json({ success: false, message: 'File path required' });
        }

        const { data, error } = await supabaseAdmin.storage
            .from('academic-files')
            .remove([path]);

        if (error) {
            console.error('[AssignmentRoutes] Supabase storage remove error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc    Upsert assignment row into public.assignments
 * @route   POST /api/assignments/upsert
 * @access  Protected (Admin only)
 */
router.post('/upsert', protect, requireAdmin, async (req, res, next) => {
    try {
        const assignmentData = req.body;
        if (!assignmentData || (!assignmentData.id && !assignmentData.title)) {
            return res.status(400).json({ success: false, message: 'Invalid assignment data' });
        }

        const { data, error } = await supabaseAdmin
            .from('assignments')
            .upsert(assignmentData)
            .select();

        if (error) {
            console.error('[AssignmentRoutes] Supabase assignments upsert error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc    Delete assignment row from public.assignments
 * @route   POST /api/assignments/delete
 * @access  Protected (Admin only)
 */
router.post('/delete', protect, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Assignment ID required' });
        }

        const { data, error } = await supabaseAdmin
            .from('assignments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[AssignmentRoutes] Supabase assignments delete error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc    Publish application global state to published_state/app_data.json
 * @route   POST /api/assignments/publish-state
 * @access  Protected (Admin only)
 */
router.post('/publish-state', protect, requireAdmin, async (req, res, next) => {
    try {
        const statePayload = req.body.data || req.body;
        const jsonBuffer = Buffer.from(JSON.stringify(statePayload, null, 2), 'utf-8');

        const { data, error } = await supabaseAdmin.storage
            .from('academic-files')
            .upload('published_state/app_data.json', jsonBuffer, {
                contentType: 'application/json',
                upsert: true
            });

        if (error) {
            console.error('[AssignmentRoutes] Publish state error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
