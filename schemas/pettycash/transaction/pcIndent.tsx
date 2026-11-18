import { z } from 'zod';

export const indentFilterSchema = z.object({
    mI_Id: z.number().min(1, 'Organization is required'),
    from_Date: z.date({
        required_error: 'From Date is required',
        invalid_type_error: "That's not a date!"
    }),
    to_Date: z.date({
        required_error: 'To Date is required',
        invalid_type_error: "That's not a date!"
    })
});

export const pcIndentSchema = z
    .object({
        pcindT_Id: z.number().optional(),
        mdept_Id: z.number().min(1, 'Department is required'),
        pcindT_IndentNo: z.string().optional(),
        pcindT_FromDate: z.date({
            required_error: 'From Date is required'
        }),
        pcindT_ToDate: z.date({
            required_error: 'To Date is required'
        }),
        pcindT_ActiveFlg: z.boolean().default(true)
    })
    .refine((data) => data.pcindT_ToDate >= data.pcindT_FromDate, {
        message: 'To Date must be greater than or equal to From Date',
        path: ['pcindT_ToDate']
    });

export type IndentFilterValues = z.infer<typeof indentFilterSchema>;
export type PcIndentFormValues = z.infer<typeof pcIndentSchema>;
