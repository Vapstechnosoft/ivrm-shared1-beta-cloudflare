import * as z from 'zod';

export const masterBoardSchema = z.object({
    ivrmmB_Id: z.number().default(0),
    ivrmmB_Name: z
        .string()
        .min(1, 'Board Name is required')
        .max(50, 'Maximum 50 characters allowed')
        .regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces are allowed'),
    ivrmmB_Description: z
        .string()
        .min(1, 'Board Description is required')
        .max(100, 'Maximum 100 characters allowed')
        .regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces are allowed')
});

export type MasterBoardFormValues = z.infer<typeof masterBoardSchema>;
