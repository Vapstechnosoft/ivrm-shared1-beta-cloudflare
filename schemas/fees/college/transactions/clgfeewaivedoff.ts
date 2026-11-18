import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const collegeFeeWaivedOffHeadItemSchema = z.object({
    fmG_Id: z.number(),
    fmH_Id: z.number(),
    ftI_Id: z.number(),
    fcmaS_Id: z.number(),
    fcswO_WaivedOffAmount: z.coerce.number().min(0.01, 'Waived off amount must be greater than 0'),
    fmH_FeeName: z.string().optional(),
    ftI_Name: z.string().optional(),
    fcsS_ToBePaid: z.number().optional(),
    fcsS_PaidAmount: z.number().optional()
});

export const collegeFeeWaivedOffSchema = {
    addOrUpdate: z.object({
        fcswO_Id: z.union([z.number(), z.string()]).optional().default(0),
        asmaY_Id: z.string({ required_error: 'Please select Academic Year' }).min(1, 'Please select Academic Year'),
        amcO_Id: z.string({ required_error: 'Please select Course' }).min(1, 'Please select Course'),
        amB_Id: z.string({ required_error: 'Please select Branch' }).min(1, 'Please select Branch'),
        amsE_Id: z.string({ required_error: 'Please select Semester' }).min(1, 'Please select Semester'),
        amcsT_Id: z.string({ required_error: 'Please select Student' }).min(1, 'Please select Student'),
        fcswO_Date: z.date({ required_error: 'Please select Waived Off Date' }),
        filterrefund: z.enum(['NonRefunable', 'Refunable']).default('NonRefunable'),
        selectedGroups: z.array(z.string()).min(1, 'Please select at least one Fee Group'),
        checkedlist: z.array(collegeFeeWaivedOffHeadItemSchema).min(1, 'Please select and enter amount for at least one Fee Head')
    }),
    delete: z.object({
        fcswO_Id: deleteIdSchema('fcswO_Id')
    })
};

export type CollegeFeeWaivedOffFormValues = z.infer<typeof collegeFeeWaivedOffSchema.addOrUpdate>;
export type CollegeFeeWaivedOffDeleteValues = z.infer<typeof collegeFeeWaivedOffSchema.delete>;
