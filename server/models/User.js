const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function (val) {
                // Must be exactly 8 characters in length
                return typeof val === 'string' && val.length === 8;
            },
            message: 'Username must be exactly 8 characters long'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

// Hash password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare candidate password with stored bcrypt hash
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure password and internal fields are never serialized in JSON responses
userSchema.methods.toJSON = function () {
    const userObj = this.toObject();
    delete userObj.password;
    delete userObj.__v;
    return userObj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
