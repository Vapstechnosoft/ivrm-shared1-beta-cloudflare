import { z } from 'zod';

export const SophiaSmartcardReportSchema = z.object({
    ASMAY_Id: z.number().min(1, 'Please select Academic Year'),
    ASMCL_Id: z.number().min(1, 'Please select Class'),
    ASMS_Id: z.number().min(1, 'Please select Section'),
    SPCCMH_Id: z.number().optional(),
    Admnoallind: z.enum(['Regular', 'New'])
});

export type SophiaSmartcardReportFields = z.infer<typeof SophiaSmartcardReportSchema>;
