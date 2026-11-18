import { z } from 'zod';

export const cbsStudyCertificateSchema = z
    .object({
        allorindi: z.string().default('A'),
        optradio: z.string().default('S'),
        character: z.string().default('0'), // 1: Character, 0: Study, 2: No Objection
        asmaY_Id: z.coerce.number().min(1, 'please select academic year'),
        asmcL_Id: z.coerce.number().optional().default(0),
        asmS_Id: z.coerce.number().optional().default(0),
        boardType: z.string().default('ICSE'),
        charType: z.string().default('satisfactory'),
        date: z.date({ required_error: 'please select date' }),
        amsT_Id: z.coerce.number().min(1, 'please select student'),
        address_opt: z.string().default('address_per'),
        paretsnamefather: z.string().default('0')
    })
    .superRefine((data, ctx) => {
        if (data.allorindi === 'I') {
            if (!data.asmcL_Id || data.asmcL_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please select class',
                    path: ['asmcL_Id']
                });
            }
            if (!data.asmS_Id || data.asmS_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'please select section',
                    path: ['asmS_Id']
                });
            }
        }
    });

export type TCbsStudyCertificateSchema = z.infer<typeof cbsStudyCertificateSchema>;
