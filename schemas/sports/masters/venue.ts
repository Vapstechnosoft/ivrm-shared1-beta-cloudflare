import { z } from 'zod';
import { deleteIdSchema } from '../../validationSchemas';

export const masterVenueSchema = {
    addOrUpdate: z.object({
        spccmeV_Id: z.number().optional().default(0),
        mI_Id: z.number().optional(),
        spccmeV_EventVenue: z
            .string({ message: 'Enter Venue Name' })
            .min(1, 'Enter Venue Name')
            .max(100, 'Venue Name must not exceed 100 characters')
            .regex(/^[A-Za-z0-9\s]+$/, 'Enter valid Venue Name (Only letters, numbers and spaces)'),
        spccmeV_EventVenueDesc: z
            .string({ message: 'Enter Description' })
            .min(1, 'Enter Description')
            .max(250, 'Description must not exceed 250 characters')
            .refine((val) => !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{4,}/.test(val), 'Multiple continuous special characters are not allowed')
            .refine((val) => /[A-Za-z0-9]/.test(val), 'Description must contain some letters or numbers'),
        spccmeV_ActiveFlag: z.boolean().default(true)
    }),
    delete: z.object({
        spccmeV_Id: deleteIdSchema('spccmeV_Id')
    })
};
