import mongoose, { Document, Schema, Model } from 'mongoose';
import { z } from 'zod';

// Zod schema for Message validation
export const MessageValidationSchema = z.object({
  content: z.string().min(1),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().optional(),
});

// Interface for Message document
export interface IMessage extends Document {
  content: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Helper method for soft delete
  softDelete(userId: mongoose.Types.ObjectId): Promise<IMessage>;
  // Helper method to restore a soft-deleted message
  restore(userId: mongoose.Types.ObjectId): Promise<IMessage>;
}

// Interface for Message Model with static methods
export interface IMessageModel extends Model<IMessage> {
  findActiveById(id: string): Promise<IMessage | null>;
  findActiveMessages(limit?: number, skip?: number): Promise<IMessage[]>;
}

// Create the Message schema
const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Ensure indexes for faster queries
MessageSchema.index({ createdBy: 1 });
MessageSchema.index({ isDeleted: 1 });
MessageSchema.index({ createdAt: -1 });

// Add instance method for soft delete
MessageSchema.methods.softDelete = async function(this: IMessage, userId: mongoose.Types.ObjectId): Promise<IMessage> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

// Add instance method to restore a soft-deleted message
MessageSchema.methods.restore = async function(this: IMessage, userId: mongoose.Types.ObjectId): Promise<IMessage> {
  this.isDeleted = false;
  this.deletedAt = null;
  this.updatedBy = userId;
  return this.save();
};

// Add static method to find active (not soft-deleted) message by ID
MessageSchema.statics.findActiveById = async function(
  this: IMessageModel,
  id: string
): Promise<IMessage | null> {
  return this.findOne({ _id: id, isDeleted: false });
};

// Add static method to find active messages with pagination
MessageSchema.statics.findActiveMessages = async function(
  this: IMessageModel,
  limit: number = 10,
  skip: number = 0
): Promise<IMessage[]> {
  return this.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');
};

// Create and export the Message model
const Message = mongoose.model<IMessage, IMessageModel>('Message', MessageSchema);

export default Message;
