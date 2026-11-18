import { z } from 'zod';

export const DeputationNewSchema = z.object({
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    ttmD_Date: z.date({
        required_error: 'Date is required'
    }),
    ttmD_Day: z.string().optional(),
    ttmD_Id: z.number().min(1, 'Valid working day is required'),
    absflag: z.boolean().default(false),
    hrmE_Id: z.string().min(1, 'Staff Name is required'),
    remarks: z.string().optional().default(''),
    sms_Flag: z.boolean().default(false),
    email_Flag: z.boolean().default(false),
    not_Flag: z.boolean().default(false)
});

export type DeputationNewValues = z.infer<typeof DeputationNewSchema>;
