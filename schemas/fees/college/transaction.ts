import { z } from 'zod';

export const collegeFeeTransactionSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic year is required' }).min(1, 'Academic year is required'),
        amcst_Id: z.number().optional(),
        receiptNo: z.string().optional(),
        date: z.date().optional(),
        challanNo: z.string().optional(),
        modeofPayment: z.string().optional(),
        narrationId: z.number().optional()
    })
};

export type CollegeFeeTransactionFormValues = z.infer<typeof collegeFeeTransactionSchema.addOrUpdate>;
