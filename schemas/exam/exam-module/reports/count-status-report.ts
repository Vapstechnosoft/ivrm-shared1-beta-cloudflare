import { z } from 'zod';

export const countStatusReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required')
});

export type CountStatusReportFormValues = z.infer<typeof countStatusReportSchema>;
