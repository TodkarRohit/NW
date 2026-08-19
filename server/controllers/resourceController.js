const Resource = require('../models/Resource');
const { getGoogleDriveEmbedUrl } = require('../utils/driveValidator');

/**
 * @desc    Get all public study resources / Google Drive links
 * @route   GET /api/resources
 * @access  Public (No Login Required)
 */
const getResources = async (req, res, next) => {
    try {
        const { subject, type, unit } = req.query;
        const filter = { isPublic: true };

        if (subject) {
            filter.subject = subject.toLowerCase().trim();
        }
        if (type) {
            filter.type = type.toLowerCase().trim();
        }
        if (unit) {
            filter.unit = unit.trim();
        }

        const resources = await Resource.find(filter)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resources.length,
            resources
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Add a new verified Google Drive resource link
 * @route   POST /api/resources
 * @access  Private (JWT Required)
 */
const createResource = async (req, res, next) => {
    try {
        const { title, subject, description, type, unit, googleDriveUrl } = req.body;

        // Generate safe embed preview URL
        const previewUrl = getGoogleDriveEmbedUrl(googleDriveUrl) || googleDriveUrl;

        const resource = await Resource.create({
            title: title.trim(),
            subject: subject.toLowerCase().trim(),
            description: description ? description.trim() : '',
            type: (type || 'notes').toLowerCase().trim(),
            unit: (unit || 'Unit 1').trim(),
            googleDriveUrl: googleDriveUrl.trim(),
            previewUrl,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Resource published successfully',
            resource
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete a resource link
 * @route   DELETE /api/resources/:id
 * @access  Private (JWT Required)
 */
const deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        await resource.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getResources,
    createResource,
    deleteResource
};
