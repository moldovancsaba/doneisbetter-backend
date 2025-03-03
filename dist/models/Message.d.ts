import mongoose, { Document, Model } from 'mongoose';
import { z } from 'zod';
export declare const MessageValidationSchema: z.ZodObject<{
    content: z.ZodString;
    createdBy: z.ZodString;
    updatedBy: z.ZodOptional<z.ZodString>;
    isDeleted: z.ZodDefault<z.ZodBoolean>;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    isDeleted?: boolean;
    deletedAt?: Date;
    content?: string;
    createdBy?: string;
    updatedBy?: string;
}, {
    isDeleted?: boolean;
    deletedAt?: Date;
    content?: string;
    createdBy?: string;
    updatedBy?: string;
}>;
export interface IMessage extends Document {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    softDelete(userId: mongoose.Types.ObjectId): Promise<IMessage>;
    restore(userId: mongoose.Types.ObjectId): Promise<IMessage>;
}
export interface IMessageModel extends Model<IMessage> {
    findActiveById(id: string): Promise<IMessage | null>;
    findActiveMessages(limit?: number, skip?: number): Promise<IMessage[]>;
}
declare const Message: IMessageModel;
export default Message;
