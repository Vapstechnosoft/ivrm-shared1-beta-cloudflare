import { z } from 'zod';

export const invRGRNSchema = z
    .object({
        typeflag: z.enum(['All', 'Overall', 'Detailed']),
        optionflag: z.string().optional(), // "Individual_1", "Item_1", "Supplier"
        bw_dates: z.boolean().default(false),
        startdate: z.date().optional(),
        enddate: z.date().optional(),
        grnArray: z.array(z.any()).optional(),
        itemArray: z.array(z.any()).optional(),
        supplierArray: z.array(z.any()).optional()
    })
    .superRefine((data, ctx) => {
        // Date Validation
        if (data.bw_dates) {
            if (!data.startdate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Start Date is required',
                    path: ['startdate']
                });
            }
            if (!data.enddate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'End Date is required',
                    path: ['enddate']
                });
            }
            if (data.startdate && data.enddate && data.startdate > data.enddate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Start Date cannot be greater than End Date',
                    path: ['enddate']
                });
            }
        }

        // Selection Validation
        if (data.typeflag === 'Overall' || data.typeflag === 'Detailed') {
            if (!data.optionflag) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select a Filter option',
                    path: ['optionflag']
                });
                return;
            }
            if (data.optionflag === 'Individual_1') {
                if (!data.grnArray || data.grnArray.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Please select at least one GRN',
                        path: ['grnArray']
                    });
                }
            }
            if (data.optionflag === 'Item_1') {
                if (!data.itemArray || data.itemArray.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Please select at least one Item',
                        path: ['itemArray']
                    });
                }
            }
            if (data.optionflag === 'Supplier') {
                if (!data.supplierArray || data.supplierArray.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Please select at least one Supplier',
                        path: ['supplierArray']
                    });
                }
            }
        }
    });

export type InvRGRNSchema = z.infer<typeof invRGRNSchema>;
