import { z } from 'zod';

export const ndaPhotoFilterSchema = z.object({
    type: z.enum(['Student', 'Staff']),
    academic_year: z.string().optional(),
    classname: z.string().optional(),
    sectionname: z.string().optional()
});

export type NdaPhotoFilterFields = z.infer<typeof ndaPhotoFilterSchema>;
