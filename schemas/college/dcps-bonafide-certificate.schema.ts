import { z } from 'zod';

export const dcpsBonafideCertificateSchema = z
    .object({
        allorindi: z.enum(['A', 'I']).default('A'),
        optradio: z.enum(['S', 'D', 'L']).default('S'),
        Character: z.literal('1').default('1'),
        asmaY_Id: z.coerce.number().min(1, 'Please select Academic Year'),
        amcO_Id: z.coerce.number().optional().nullable(),
        amB_Id: z.coerce.number().optional().nullable(),
        amsE_Id: z.coerce.number().optional().nullable(),
        acmS_Id: z.coerce.number().optional().nullable(),
        amcsT_Id: z.coerce.number().min(1, 'Please select Student'),
        date: z.date({
            required_error: 'Please select Date'
        }),
        exmname: z.string().optional().nullable(),
        purpose: z.string().optional().nullable()
    })
    .superRefine((data, ctx) => {
        if (data.allorindi === 'I') {
            if (!data.amcO_Id || data.amcO_Id <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Course',
                    path: ['amcO_Id']
                });
            }
            if (!data.amB_Id || data.amB_Id <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Branch',
                    path: ['amB_Id']
                });
            }
            if (!data.amsE_Id || data.amsE_Id <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Semester',
                    path: ['amsE_Id']
                });
            }
            if (!data.acmS_Id || data.acmS_Id <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Section',
                    path: ['acmS_Id']
                });
            }
        }
    });

export type DCPSBonafideCertificateFormData = z.infer<typeof dcpsBonafideCertificateSchema>;
