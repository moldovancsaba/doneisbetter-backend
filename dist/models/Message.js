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
exports.MessageValidationSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const zod_1 = require("zod");
// Zod schema for Message validation
exports.MessageValidationSchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
    createdBy: zod_1.z.string(),
    updatedBy: zod_1.z.string().optional(),
    isDeleted: zod_1.z.boolean().default(false),
    deletedAt: zod_1.z.date().nullable().optional(),
});
// Create the Message schema
const MessageSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
// Ensure indexes for faster queries
MessageSchema.index({ createdBy: 1 });
MessageSchema.index({ isDeleted: 1 });
MessageSchema.index({ createdAt: -1 });
// Add instance method for soft delete
MessageSchema.methods.softDelete = async function (userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.updatedBy = userId;
    return this.save();
};
// Add instance method to restore a soft-deleted message
MessageSchema.methods.restore = async function (userId) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.updatedBy = userId;
    return this.save();
};
// Add static method to find active (not soft-deleted) message by ID
MessageSchema.statics.findActiveById = async function (id) {
    return this.findOne({ _id: id, isDeleted: false });
};
// Add static method to find active messages with pagination
MessageSchema.statics.findActiveMessages = async function (limit = 10, skip = 0) {
    return this.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
};
// Create and export the Message model
const Message = mongoose_1.default.model('Message', MessageSchema);
exports.default = Message;
