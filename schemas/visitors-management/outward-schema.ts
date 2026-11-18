import { z } from 'zod';

export const outwardSchema = z.object({
    foouT_Id: z.number().optional(),
    description: z.string().min(1, 'Description is required').max(200, 'Description must not exceed 200 characters'),
    date: z.date({ required_error: 'Date is required' }),
    from: z.string().min(1, 'From is required'),
    to: z.string().min(1, 'To is required'),
    phoneNo: z
        .string()
        .length(10, 'Phone Number must be 10 digits')
        .regex(/^[0-9]+$/, 'Phone number must be numeric'),
    emailId: z.string().email('Invalid email address').optional().or(z.literal('')),
    dispatchedBy: z.number({ required_error: 'Dispatched By is required' }), // Employee ID
    dispatchedThrough: z.string().min(1, 'Dispatched Through is required'),
    dispatchedDetails: z.string().optional(),
    dispatchedPhNo: z.string().length(10, 'Dispatched Phone Number must be 10 digits').optional().or(z.literal('')),
    address: z.string().min(1, 'Address is required')
});

export type OutwardSchema = z.infer<typeof outwardSchema>;
