import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Define TypeScript interfaces for the User model
export interface IUser extends Document {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
  role: 'admin' | 'user' | 'guest';
  isDeleted: boolean;
  deletedAt?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    darkMode: boolean;
    language: string;
  };
}

// Define Zod schema for validation
export const UserValidationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  picture: z.string().url().optional(),
  googleId: z.string().optional(),
  role: z.enum(['admin', 'user', 'guest']),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().optional(),
  lastLogin: z.date().optional(),
  preferences: z.object({
    darkMode: z.boolean().default(false),
    language: z.string().default('en'),
  }).default({
    darkMode: false,
    language: 'en',
  }),
});

// Define mongoose schema
const UserSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

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
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
