import mongoose, { Document } from 'mongoose';
import { z } from 'zod';
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
export declare const UserValidationSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    picture: z.ZodOptional<z.ZodString>;
    googleId: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["admin", "user", "guest"]>;
    isDeleted: z.ZodDefault<z.ZodBoolean>;
    deletedAt: z.ZodOptional<z.ZodDate>;
    lastLogin: z.ZodOptional<z.ZodDate>;
    preferences: z.ZodDefault<z.ZodObject<{
        darkMode: z.ZodDefault<z.ZodBoolean>;
        language: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        darkMode: boolean;
        language: string;
    }, {
        darkMode?: boolean | undefined;
        language?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    role: "admin" | "user" | "guest";
    isDeleted: boolean;
    preferences: {
        darkMode: boolean;
        language: string;
    };
    picture?: string | undefined;
    googleId?: string | undefined;
    deletedAt?: Date | undefined;
    lastLogin?: Date | undefined;
}, {
    email: string;
    name: string;
    role: "admin" | "user" | "guest";
    picture?: string | undefined;
    googleId?: string | undefined;
    isDeleted?: boolean | undefined;
    deletedAt?: Date | undefined;
    lastLogin?: Date | undefined;
    preferences?: {
        darkMode?: boolean | undefined;
        language?: string | undefined;
    } | undefined;
}>;
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
