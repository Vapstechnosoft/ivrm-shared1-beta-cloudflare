import { z } from 'zod';

export const masterLocationSchema = z.object({
    vmmL_Id: z.number().optional(),
    locationName: z.string().min(1, 'Location Name is required'),
    locationDescription: z.string().min(1, 'Location Description is required'),
    locationFacilities: z.string().min(1, 'Location Facilities is required')
});

export type MasterLocationSchema = z.infer<typeof masterLocationSchema>;
