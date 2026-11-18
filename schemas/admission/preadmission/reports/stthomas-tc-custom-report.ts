import { z } from 'zod';

export const StthomasTcCustomReportSchema = z
    .object({
        reporttype: z.enum(['All', 'indi']),
        temporper: z.enum(['Temp', 'Per']),
        ASMAY_Id: z.number({ required_error: 'Please select Academic Year' }).min(1, 'Please select Academic Year'),
        AMST_Id: z.number().optional(),
        ASMCL_Id: z.number().optional(),
        ASMS_Id: z.number().optional()
    })
    .superRefine((data, ctx) => {
        if (!data.AMST_Id || data.AMST_Id <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please select Student',
                path: ['AMST_Id']
            });
        }
        if (data.reporttype === 'indi') {
            if (!data.ASMCL_Id || data.ASMCL_Id <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Class',
                    path: ['ASMCL_Id']
                });
            }
            if (!data.ASMS_Id || data.ASMS_Id <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Section',
                    path: ['ASMS_Id']
                });
            }
        }
    });

export type StthomasTcCustomReportFields = z.infer<typeof StthomasTcCustomReportSchema>;
