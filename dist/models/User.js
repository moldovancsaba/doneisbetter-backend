"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidationSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const zod_1 = require("zod");
// Define Zod schema for validation
exports.UserValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1).max(100),
    picture: zod_1.z.string().url().optional(),
    googleId: zod_1.z.string().optional(),
    role: zod_1.z.enum(['admin', 'user', 'guest']),
    isDeleted: zod_1.z.boolean().default(false),
    deletedAt: zod_1.z.date().optional(),
    lastLogin: zod_1.z.date().optional(),
    preferences: zod_1.z.object({
        darkMode: zod_1.z.boolean().default(false),
        language: zod_1.z.string().default('en'),
    }).default({
        darkMode: false,
        language: 'en',
    }),
});
// Define mongoose schema
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    picture: {
        type: String,
        default: null,
    },
    googleId: {
        type: String,
        sparse: true, // Allows null values but still enforces uniqueness for non-null
        index: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'guest'],
        default: 'user',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    preferences: {
        darkMode: {
            type: Boolean,
            default: false,
        },
        language: {
            type: String,
            default: 'en',
        },
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
// Add index for soft delete filtering
UserSchema.index({ isDeleted: 1 });
// Add index for role-based queries
UserSchema.index({ role: 1 });
// Static method to find users that aren't deleted
UserSchema.statics.findNotDeleted = function () {
    return this.find({ isDeleted: false });
};
// Soft delete method
UserSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};
// Restore method (undo soft delete)
UserSchema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = undefined;
    return this.save();
};
// Method to update last login time
UserSchema.methods.updateLoginTime = function () {
    this.lastLogin = new Date();
    return this.save();
};
// Pre-find middleware to exclude deleted users by default
UserSchema.pre('find', function () {
    // @ts-ignore: Property 'getOptions' does not exist on type 'Query<...>'
    const options = this.getOptions();
    if (!options || !options.includeDeleted) {
        this.where({ isDeleted: false });
    }
});
// Pre-findOne middleware to exclude deleted users by default
UserSchema.pre('findOne', function () {
    // @ts-ignore: Property 'getOptions' does not exist on type 'Query<...>'
    const options = this.getOptions();
    if (!options || !options.includeDeleted) {
        this.where({ isDeleted: false });
    }
});
// Create and export the model
const User = mongoose_1.default.model('User', UserSchema);
exports.default = User;
//# sourceMappingURL=User.js.map