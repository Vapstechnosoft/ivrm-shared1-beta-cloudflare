import { z } from 'zod';

export const constraintReportSchema = {
    search: z.object({
        asmaY_Id: z.number().min(1, 'Please Select Academic Year'),
        ttconstrep: z.enum(['F', 'R', 'C', 'B', 'L']),
        fixing1: z.string().optional()
    })
};
