import { z } from 'zod';

export const StjamesTcCustomReportSchema = z
    .object({
        reporttype: z.enum(['All', 'indi']),
        temporper: z.enum(['Temp', 'Per']),
        ASMAY_Id: z.number().min(1, 'Academic Year is required'),
        AMST_Id: z.number().optional(),
        ASMCL_Id: z.number().optional(),
        ASMS_Id: z.number().optional()
    })
    .superRefine((data, ctx) => {
        if (data.reporttype === 'indi') {
            if (!data.ASMCL_Id || data.ASMCL_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Class is required',
                    path: ['ASMCL_Id']
                });
            }
            if (!data.ASMS_Id || data.ASMS_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Section is required',
                    path: ['ASMS_Id']
                });
            }
            if (!data.AMST_Id || data.AMST_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Student is required',
                    path: ['AMST_Id']
                });
            }
        }
    });

export type StjamesTcCustomReportFields = z.infer<typeof StjamesTcCustomReportSchema>;
