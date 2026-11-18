import { z } from 'zod';

export const bcehStudyCertificateSchema = z
    .object({
        allorindii: z.enum(['A', 'I'], {
            required_error: 'Select All or Individual'
        }),
        optradio: z.enum(['S', 'L'], {
            required_error: 'Select Studying or Left'
        }),
        Character: z.string().default('0'), // Study Certificate
        asmaY_Id: z.string().min(1, 'Select Academic Year'),
        asmcL_Id: z.string().optional(),
        asmS_Id: z.string().optional(),
        amsT_Id: z.string().optional(),
        ASA_FromDate: z.date({
            required_error: 'Select Certificate Date'
        })
    })
    .refine(
        (data) => {
            if (data.allorindii === 'I') {
                return !!data.asmcL_Id && !!data.asmS_Id && !!data.amsT_Id;
            }
            return true;
        },
        {
            message: 'Class, Section and Student are required for Individual generation',
            path: ['amsT_Id']
        }
    );

export type BcehStudyCertificateSchema = z.infer<typeof bcehStudyCertificateSchema>;
