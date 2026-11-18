import { z } from 'zod';

export const hostelFileSchema = z.object({
    hlmhP_FileName: z.string(),
    hlmhP_FilePath: z.string(),
    filetype: z.string().optional()
});

export const masterHostelSchema = z.object({
    hlmH_Id: z.number().optional(),

    hlmH_Name: z.string().min(1, 'Hostel Name is required').max(50, 'Hostel Name must be within 50 characters'),

    hlmH_ContactNo: z.string().regex(/^[6-9][0-9]{9}$/, 'Enter valid Contact Number'),

    hlmH_TotalCapacity: z
        .union([z.string(), z.number()])
        .transform(Number)
        .refine((val) => val > 0, 'Total Capacity must be greater than 0'),

    // Multi-selects (API required names)
    selectedFacilityIds: z.array(z.number()).min(1, 'Please Select Facility'),

    selectedWardenIds: z.array(z.number()).min(1, 'Please Select Warden'),

    selectedMessIds: z.array(z.number()).min(1, 'Please Select Mess'),

    hlmhW_WardenType: z.string().optional(),

    hlmH_BoysGirlsFlg: z.enum(['Boys', 'Girls', 'Both'], {
        required_error: 'Please Select Any One Category'
    }),

    hlmH_Address: z.string().optional().or(z.literal('')),

    ivrmmC_Id: z.union([z.string(), z.number()]).transform(Number),

    ivrmmS_Id: z.union([z.string(), z.number()]).transform(Number).optional(),

    hlmH_City: z.string().min(1, 'Enter City Name').max(50),

    hlmH_Pincode: z
        .union([z.string(), z.number()])
        .transform(String)
        .refine((val) => /^[0-9]{6}$/.test(val), 'Enter valid 6 digit Pincode'),

    hlmH_TotalFloor: z
        .union([z.string(), z.number()])
        .transform(Number)
        .refine((val) => val >= 0, 'Invalid Floor count'),

    hlmH_TotalRoom: z
        .union([z.string(), z.number()])
        .transform(Number)
        .refine((val) => val >= 0, 'Invalid Room count'),

    hlmH_Desc: z.string().max(250, 'Description must be within 250 characters').optional(),

    hostelPhotos: z.array(hostelFileSchema).optional(),

    hlmH_ActiveFlag: z.boolean().default(true)
});

export type IMasterHostelForm = z.infer<typeof masterHostelSchema>;
