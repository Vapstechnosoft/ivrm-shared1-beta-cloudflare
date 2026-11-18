import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const collegeFeePrevilegeSchema = {
    addOrUpdate: z.object({
        academicYear: z.string({ required_error: 'Please select Academic Year' }).min(1, 'Please select Academic Year'),
        group: z.string({ required_error: 'Please select Group' }).min(1, 'Please select Group'),
        heads: z.array(z.string()).min(1, 'Please select at least one Head'),
        roles: z.string({ required_error: 'Please select Role' }).min(1, 'Please select Role'),
        users: z.array(z.string()).min(1, 'Please select at least one User'),
        fgL_Id: z.union([z.number(), z.string()]).optional()
    }),
    delete: z.object({
        fgL_Id: deleteIdSchema('fgL_Id')
    })
};

export type CollegeFeePrevilegeFormValues = z.infer<typeof collegeFeePrevilegeSchema.addOrUpdate>;
export type CollegeFeePrevilegeDeleteValues = z.infer<typeof collegeFeePrevilegeSchema.delete>;
