import { z } from 'zod';

export const cbsNoObjectionCertSchema = z
    .object({
        allorindi: z.string().default('A'),
        optradio: z.string().default('S'),
        asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
        asmcL_Id: z.coerce.number().optional().default(0),
        asmS_Id: z.coerce.number().optional().default(0),
        date: z.date({ required_error: 'Date is required' }),
        amsT_Id: z.coerce.number().optional()
    })
    .superRefine((data, ctx) => {
        if (data.allorindi === 'I') {
            if (!data.asmcL_Id || data.asmcL_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Class is required',
                    path: ['asmcL_Id']
                });
            }
            if (!data.asmS_Id || data.asmS_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Section is required',
                    path: ['asmS_Id']
                });
            }
        }

        // Student is always required
        if (!data.amsT_Id || data.amsT_Id === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Student Name is required',
                path: ['amsT_Id']
            });
        }
    });

export type TCbsNoObjectionCertSchema = z.infer<typeof cbsNoObjectionCertSchema>;
