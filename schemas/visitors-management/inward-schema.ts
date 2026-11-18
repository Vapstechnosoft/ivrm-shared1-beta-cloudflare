import { z } from 'zod';

export const inwardSchema = z.object({
    foiN_Id: z.number().optional(),
    description: z.string().min(1, 'Description is required').max(200, 'Description must not exceed 200 characters'),
    date: z.date({ required_error: 'Date is required' }),
    from: z.string().min(1, 'From is required'),
    contactPerson: z.string().min(1, 'Contact Person is required'),
    phoneNo: z
        .string()
        .length(10, 'Phone Number must be 10 digits')
        .regex(/^[0-9]+$/, 'Phone number must be numeric'), // Not strictly required in HTML pattern but nice to have. HTML says allow-pattern="\d" and min/max 10.
    emailId: z.string().email('Invalid email address').optional().or(z.literal('')),
    personTo: z.number({ required_error: 'Person To is required' }), // Employee ID
    handedOverTo: z.number().optional(), // Nullable in HTML valid? Label says "HandedOver To:" without star, but logic might vary. Let's make optional based on HTML label.
    dispatchedBy: z.number().optional(),
    address: z.string().optional() // HTML doesn't have required on textarea for inward
});

export type InwardSchema = z.infer<typeof inwardSchema>;
