import { z } from 'zod';

export const sportsCCNameSchema = {
    addOrUpdate: z
        .object({
            spccmscC_Id: z.number().optional().default(0),
            spccmsccG_Id: z.coerce
                .number({ required_error: 'Select Group/Main Event', invalid_type_error: 'Select Group/Main Event' })
                .refine((val) => val > 0, { message: 'Select Group/Main Event' }),
            spccmscC_SportsCCName: z
                .string({ required_error: 'Enter Sports Name / Sub Event', invalid_type_error: 'Enter Sports Name / Sub Event' })
                .min(1, 'Enter Sports Name / Sub Event')
                .max(100, 'Sports Name must not exceed 100 characters'),
            spccmscC_SportsCCDesc: z
                .string({ required_error: 'Enter Description', invalid_type_error: 'Enter Description' })
                .min(1, 'Enter Description')
                .max(250, 'Description must not exceed 250 characters')
                .refine(
                    (val) => !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{4,}/.test(val),
                    'Multiple continuous special characters are not allowed'
                )
                .refine((val) => /[A-Za-z0-9]/.test(val), 'Description must contain some letters or numbers'),
            spccmscC_SGFlag: z.enum(['Single', 'Group']),
            spccmscC_NoOfMembers: z.coerce
                .number({ required_error: 'Enter No.Of Members', invalid_type_error: 'Enter No.Of Members' })
                .refine((val) => val > 0, { message: 'Enter No.Of Members' }),
            spccmscC_RecHighLowFlag: z.enum(['High', 'Low']),
            spccmscC_RecInfo: z.string().optional(),
            spccmscC_MultiAttemptFlg: z.boolean().default(false),
            spccmscC_NoOfAttempts: z.coerce.number().nullable().optional(),
            spccmscC_ActiveFlag: z.boolean().optional(),
            tempDatas: z
                .array(
                    z.object({
                        spccmsccG_UnderEvent: z.string().optional(),
                        // Optional fields for existing records
                        spccmsccG_Id: z.number().optional()
                    })
                )
                .optional()
        })
        .superRefine((data, ctx) => {
            if (data.spccmscC_MultiAttemptFlg) {
                if (!data.spccmscC_NoOfAttempts || data.spccmscC_NoOfAttempts <= 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Number of attempts is required when Multi Attempt is checked',
                        path: ['spccmscC_NoOfAttempts']
                    });
                }
            }
        })
};
