import { z } from 'zod';

// Sub-schemas
export const documentSchema = z.object({
    id: z.string().optional(),
    file: z.any().optional(), // File object or string URL
    filePath: z.string().optional(),
    remarks: z.string().optional(),
    fileName: z.string().optional()
});

export const multiVisitorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Visitor Name is required'),
    contactNo: z.string().length(10, 'Contact Number must be 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    identityCardNo: z.string().optional(),
    address: z.string().optional(),
    remarks: z.string().optional(),
    photo: z.any().optional(),
    document: z.any().optional()
});

// Main Add Visitor Schema
export const addVisitorSchema = z
    .object({
        vmmV_Id: z.number().optional(),
        visitorName: z.string().min(1, 'Visitor Name is required'),
        contactNo: z
            .string()
            .length(10, 'Contact Number must be 10 digits')
            .regex(/^[6-9][0-9]{9}$/, 'Invalid mobile number'),
        email: z.string().email('Invalid email address').optional().or(z.literal('')),
        idCardType: z.string().min(1, 'Identity Card Type is required'),
        idCardNo: z.string().min(1, 'ID Card No is required'),
        visitType: z.string().min(1, 'Visit Type is required'), // Personal / Official
        fromPlace: z.string().min(1, 'From Place is required'),
        meetingLocation: z.string().min(1, 'Meeting Location is required'),
        entryDate: z.date({ required_error: 'Entry Date is required' }),
        entryTime: z.string().min(1, 'Entry Time is required'), // HH:mm format
        purpose: z.string().min(1, 'Meeting Purpose is required'),
        personsAccompanying: z.coerce.number().min(0).optional(),
        fromAddress: z.string().min(1, 'From Address is required'),
        vehicleNo: z.string().optional(),

        // Settings
        smsRequired: z.boolean().default(false),
        emailRequired: z.boolean().default(false),
        externalFlag: z.boolean().default(false),

        // Conditional To Meet
        toMeetExternal: z.string().optional(),
        toMeetInternal: z.number().optional(), // Employee ID

        // Remarks
        remarks: z.string().min(1, 'Remarks is required'),

        // Files
        visitorPhoto: z.any().optional(),

        // Arrays
        multiVisitors: z.array(multiVisitorSchema).optional(),
        documents: z.array(documentSchema).optional()
    })
    .refine(
        (data) => {
            if (data.externalFlag) {
                return !!data.toMeetExternal;
            } else {
                return !!data.toMeetInternal;
            }
        },
        {
            message: 'Please specify who to meet',
            path: ['toMeetInternal'] // Point error to internal field by default or external based on logic
        }
    );

export type AddVisitorSchema = z.infer<typeof addVisitorSchema>;
export type DocumentSchema = z.infer<typeof documentSchema>;
export type MultiVisitorSchema = z.infer<typeof multiVisitorSchema>;
