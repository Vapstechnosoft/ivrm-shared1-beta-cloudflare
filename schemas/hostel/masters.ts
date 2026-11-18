import { z } from 'zod';

export const masterFacilitySchema = z.object({
    hlmftY_Id: z.number().optional(),
    hlmftY_FacilityName: z
        .string()
        .min(1, 'Facility Name is required')
        .regex(/^[a-zA-Z0-9\s]*$/, 'Special characters are not allowed'),
    hlmftY_FacilityDesc: z.string().optional(),
    hlmftY_FacilityFileName: z.string().nullable().optional(),
    hlmftY_FacilityFilePath: z.string().nullable().optional(),
    hlmftY_ActiveFlag: z.boolean().optional().default(true)
});

export const masterFacilityDeleteSchema = z.object({
    hlmftY_Id: z.string().min(1, 'Facility ID is required')
});

export type IMasterFacility = z.infer<typeof masterFacilitySchema>;
