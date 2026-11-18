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
        .regex(/^[0-9]+$/, 'Phone number must be numeric'),
    emailId: z.string().email('Invalid email address').optional().or(z.literal('')),
    personTo: z.number({ required_error: 'Person To is required' }), // Employee ID
    handedOverTo: z.number().optional(),
    dispatchedBy: z.number().optional(),
    address: z.string().optional()
});

export type InwardSchema = z.infer<typeof inwardSchema>;

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

export const gatePassSchema = z
    .object({
        gatePassType: z.enum(['student', 'employee']),
        studentId: z.number().optional(),
        employeeId: z.number().optional(),
        remarks: z.string().min(1, 'Remarks is required').max(250, 'Remarks must not exceed 250 characters')
    })
    .refine(
        (data) => {
            if (data.gatePassType === 'student') return !!data.studentId;
            if (data.gatePassType === 'employee') return !!data.employeeId;
            return false;
        },
        {
            message: 'Please select Student or Employee',
            path: ['studentId'] // Default to studentId for error pointing
        }
    );

export type GatePassSchema = z.infer<typeof gatePassSchema>;
