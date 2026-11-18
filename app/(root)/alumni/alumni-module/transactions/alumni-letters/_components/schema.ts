import { z } from 'zod';

export const alumniLettersSchema = z.object({
    reporttype: z.enum(['Alumni', 'Regular']),
    letter_list: z.string().min(1, 'Select Letter Type'),
    display_DateandTime: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])( ([01][0-9]|2[0-3]):([0-5][0-9]))?$/.test(val), {
            message: 'please enter correct data format yyyy/MM/dd'
        }),
    asmaY_Id: z.string().min(1, 'Select Academic Year'),
    asmcL_Id: z.string().min(1, 'Select Class')
});

export type AlumniLettersSchema = z.infer<typeof alumniLettersSchema>;
