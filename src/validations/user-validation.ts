import {z, ZodType} from "zod";

export class UserValidation {
    static readonly REGISTER: ZodType = z.object({
        username: z.string({error: "Username is required",}).min(3, "Username must be at least 3 characters long"),
        email: z.email({
            error: "A valid email is required",
        }).min(1, "Email can't be empty"),
        password: z.string({
            error: "Password is required",
        }).min(8, "Password must be at least 8 characters long"),
    });

        static readonly LOGIN: ZodType = z.object({
        email: z.email({
            error: "A valid email is required",
        }).min(1, "Email can't be empty"),
        password: z.string({
            error: "Password is required",
        }).min(8, "Password must be at least 8 characters long"),
    });
}