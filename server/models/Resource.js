const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject identifier is required'],
        trim: true,
        lowercase: true,
        enum: {
            values: ['dsa', 'oop', 'os', 'maths', 'math', 'hardware', 'coa'],
            message: 'Invalid subject identifier'
        }
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    type: {
        type: String,
        required: [true, 'Resource type is required'],
        enum: {
            values: ['notes', 'qb', 'assignment', 'paper'],
            message: 'Type must be one of: notes, qb, assignment, paper'
        },
        default: 'notes'
    },
    unit: {
        type: String,
        trim: true,
        default: 'Unit 1'
    },
    googleDriveUrl: {
        type: String,
        required: [true, 'Google Drive URL is required'],
        trim: true
    },
    previewUrl: {
        type: String,
        trim: true,
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

resourceSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
