import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const collegeFeeRefundableHeadItemSchema = z.object({
    fcsS_Id: z.number(),
    fmH_Id: z.number(),
    ftI_Id: z.number(),
    fmG_Id: z.number(),
    fcR_RefundAmount: z.coerce.number().min(0.01, 'Refund amount must be greater than 0'),
    fmH_FeeName: z.string().optional(),
    ftI_Name: z.string().optional(),
    fcsS_ToBePaid: z.number().optional(),
    fcsS_PaidAmount: z.number().optional()
});

export const collegeFeeRefundableSchema = {
    addOrUpdate: z.object({
        fcR_Id: z.union([z.number(), z.string()]).optional().default(0),
        asmaY_Id: z.string({ required_error: 'Please select Academic Year' }).min(1, 'Please select Academic Year'),
        amcO_Id: z.string({ required_error: 'Please select Course' }).min(1, 'Please select Course'),
        amB_Id: z.string({ required_error: 'Please select Branch' }).min(1, 'Please select Branch'),
        amsE_Id: z.string({ required_error: 'Please select Semester' }).min(1, 'Please select Semester'),
        amcsT_Id: z.string({ required_error: 'Please select Student' }).min(1, 'Please select Student'),
        fcR_Date: z.date({ required_error: 'Please select Refund Date' }),
        fcR_RefundNo: z.string().min(1, 'Please enter Refund No'),
        fcR_ModeOfPayment: z.string().min(1, 'Please select Mode of Payment'),
        fcR_ChequeDDNo: z.coerce.number().optional().default(0),
        fcR_ChequeDDDate: z.date().optional(),
        fcR_Bank: z.string().optional().default(''),
        fcR_RefundRemarks: z.string().optional().default(''),
        filterrefund: z.enum(['NonRefunable', 'Refunable']).default('Refunable'),
        selectedGroups: z.array(z.string()).min(1, 'Please select at least one Fee Group'),
        checkedlist: z.array(collegeFeeRefundableHeadItemSchema).min(1, 'Please select and enter amount for at least one Fee Head')
    }),
    delete: z.object({
        fcR_Id: deleteIdSchema('fcR_Id')
    })
};

export type CollegeFeeRefundableFormValues = z.infer<typeof collegeFeeRefundableSchema.addOrUpdate>;
export type CollegeFeeRefundableDeleteValues = z.infer<typeof collegeFeeRefundableSchema.delete>;
