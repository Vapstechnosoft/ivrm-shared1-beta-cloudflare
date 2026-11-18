import { z } from 'zod';

export const CustomTcSchema = z.object({
    ASMAY_Id: z.number().min(1, { message: 'Please select an academic year' }),
    ASMCL_Id: z.number().optional().default(0),
    ASMS_Id: z.number().optional().default(0),
    admnoorname: z.enum(['regno', 'stdname']),
    tctemporper: z.enum(['temp', 'per']),
    AMST_Id: z.number().min(1, { message: 'Please select a student' })
});

export type CustomTcFields = z.infer<typeof CustomTcSchema>;
