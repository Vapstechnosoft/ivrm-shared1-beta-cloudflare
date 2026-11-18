import * as z from 'zod';

export const alexanderTCSchema = z
    .object({
        allorindii: z.enum(['A', 'I'], { required_error: 'Please select scope' }),
        tctemporper: z.enum(['Temp', 'Per'], { required_error: 'Please select TC type' }),
        asmaY_Id: z.string({ required_error: 'Please select Academic Year' }).min(1, 'Please select Academic Year'),
        asmcL_Id: z.string().optional(),
        asmS_Id: z.string().optional(),
        amsT_Id: z.string().optional(),
        transfer_from: z.string().optional(),
        left_on_date: z.date().optional(),
        ASA_FromDate: z.date({
            required_error: 'Certificate Date is required.'
        })
    })
    .refine(
        (data) => {
            if (data.allorindii === 'I' && !data.asmcL_Id) {
                return false;
            }
            return true;
        },
        {
            message: 'Class is required when Individual is selected',
            path: ['asmcL_Id']
        }
    )
    .refine(
        (data) => {
            if (data.allorindii === 'I' && !data.asmS_Id) {
                return false;
            }
            return true;
        },
        {
            message: 'Section is required when Individual is selected',
            path: ['asmS_Id']
        }
    )
    .refine(
        (data) => {
            if (!data.amsT_Id) {
                return false;
            }
            return true;
        },
        {
            message: 'Student is required',
            path: ['amsT_Id']
        }
    );

export type AlexanderTCSchema = z.infer<typeof alexanderTCSchema>;
