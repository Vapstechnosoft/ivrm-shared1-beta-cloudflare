import { z } from 'zod';

export const smscConductCertificateSchema = z
    .object({
        allorindi: z.enum(['A', 'I']).default('A'),
        optradio: z.enum(['S', 'D']).default('S'),
        Character: z.enum(['0', '1']).default('1'), // 1: Study, 0: Conduct
        asmaY_Id: z.coerce.number().min(1, 'please select academic year'),
        amcO_Id: z.coerce.number().optional().nullable(),
        amB_Id: z.coerce.number().optional().nullable(),
        amsE_Id: z.coerce.number().optional().nullable(),
        acmS_Id: z.coerce.number().optional().nullable(),
        amcsT_Id: z.coerce.number().min(1, 'please select student'),
        date: z.date({
            required_error: 'please select date'
        }),
        exmname: z.string().optional().nullable(),
        exmmonth: z.string().optional().nullable(),
        stdreg: z.string().optional().nullable()
    })
    .superRefine((data, ctx) => {
        if (data.allorindi === 'I') {
            if (!data.amcO_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please select course',
                    path: ['amcO_Id']
                });
            }
            if (!data.amB_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please select branch',
                    path: ['amB_Id']
                });
            }
            if (!data.amsE_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please select semester',
                    path: ['amsE_Id']
                });
            }
            if (!data.acmS_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please select section',
                    path: ['acmS_Id']
                });
            }
        }

        if (data.Character === '0') {
            if (!data.exmname || data.exmname.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please enter exam name',
                    path: ['exmname']
                });
            }
        }
    });

export type SMSCConductCertificateFormData = z.infer<typeof smscConductCertificateSchema>;
