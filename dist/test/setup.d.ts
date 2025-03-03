export declare const createTestUser: (role?: string) => Promise<{
    role: string;
}>;
export declare const generateAuthToken: (userId: string) => string;
