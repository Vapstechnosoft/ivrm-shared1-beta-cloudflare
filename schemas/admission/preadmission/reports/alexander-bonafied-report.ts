import { z } from 'zod';

export const AlexanderBonafiedReportSchema = z
    .object({
        allorindi: z.enum(['A', 'I']),
        optradio: z.enum(['S', 'L', 'D', '12']),
        ASMAY_Id: z.number().min(1, 'Academic Year is required'),
        ASMCL_Id: z.number().optional().default(0),
        ASMS_Id: z.number().optional().default(0),
        AMST_Id: z.number().min(1, 'Student is required'),
        ASA_FromDate: z.date({ required_error: 'Date is required' }),
        purpose: z.string().optional().default('')
    })
    .superRefine((data, ctx) => {
        if (data.allorindi === 'I') {
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
        }
    });

export type AlexanderBonafiedReportFields = z.infer<typeof AlexanderBonafiedReportSchema>;
