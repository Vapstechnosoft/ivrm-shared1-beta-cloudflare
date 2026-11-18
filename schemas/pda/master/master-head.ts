import { z } from 'zod';

export const pdaMasterHeadSchema = {
    addOrUpdate: z.object({
        pdamH_HeadName: z
            .string()
            .min(1, 'Enter the HeadName')
            .min(3, 'The HeadName should contain minimum 3 alphabets')
            .max(40, 'HeadName should not exceed 40 characters')
            .regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces are allowed'),
        fmH_Id: z.coerce.number().min(1, 'Please Select the Fee Head')
    })
};

export type PDAMasterHeadFormValues = z.infer<typeof pdaMasterHeadSchema.addOrUpdate>;
