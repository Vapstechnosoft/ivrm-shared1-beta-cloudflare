import { z } from 'zod';

export const ndaTcSchema = z.object({
    asmaY_Id: z.string().min(1, 'Please select Academic Year'),
    Date11: z.date({
        required_error: 'Please select Issued Date'
    }),
    admnoorname: z.string().default('stdname'),
    tctemporper: z.string().default('per'),
    amsT_Id: z.object(
        {
            amsT_Id: z.number(),
            studentname: z.string().optional()
        },
        {
            required_error: 'Please select a Student'
        }
    )
});

export type NdaTcFields = z.infer<typeof ndaTcSchema>;
