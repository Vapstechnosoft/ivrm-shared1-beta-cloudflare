import { z } from 'zod';

export const ndaIdCardFilterSchema = z.object({
    academic_year: z.string().min(1, 'Select Academic Year'),
    classname: z.string().min(1, 'Select Class'),
    sectionname: z.string().min(1, 'Select Section'),
    house: z.string().min(1, 'Select House')
});

export type NdaIdCardFilterFields = z.infer<typeof ndaIdCardFilterSchema>;
