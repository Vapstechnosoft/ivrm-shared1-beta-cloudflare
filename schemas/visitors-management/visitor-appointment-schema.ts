import { z } from 'zod';

export const documentSchema = z.object({
    cfilename: z.string().optional(),
    cfilepath: z.string().optional(),
    cfiledesc: z.string().optional(),
    filetype: z.string().optional(),
    cfileid: z.number().optional()
});

export const multiVisitorSchema = z.object({
    vmapvI_VisitorName: z.string().min(1, 'Name is required'),
    vmapvI_VisitorContactNo: z.string().optional(),
    vmapvI_VisitorEmailId: z.string().email('Invalid email').optional().or(z.literal('')),
    vmapvI_VisitorAddress: z.string().optional()
});

export const visitorAppointmentSchema = z.object({
    vmaP_Id: z.number().optional(),
    visitorName: z.string().min(1, 'Visitor Name is required'),
    contactNo: z.string().length(10, 'Contact No must be 10 digits').regex(/^\d+$/, 'Must be numeric'),
    email: z.string().email('Invalid email'),
    fromPlace: z.string().min(1, 'From place is required'),
    meetingDurationHrs: z.number().min(0).optional(),
    meetingDurationMins: z.number().min(0).max(59).optional(),
    toMeet: z.string().min(1, 'To Meet is required'),
    staffId: z.number().min(1, 'Select a staff member'),
    visitType: z.string().min(1, 'Select Visit Type'),
    purpose: z.string().min(1, 'Purpose is required'),
    personsAccompanying: z.number().min(0).default(0),
    entryDate: z.date({ required_error: 'Date is required' }),
    fromTime: z.string().min(1, 'From Time is required'),
    toTime: z.string().min(1, 'To Time is required'),
    location: z.string().min(1, 'Location is required'),
    remarks: z.string().min(1, 'Remarks is required'),
    address: z.string().min(1, 'Address is required'),
    documents: z.array(documentSchema).optional(),
    multiVisitors: z.array(multiVisitorSchema).optional()
});

export type VisitorAppointmentSchema = z.infer<typeof visitorAppointmentSchema>;
