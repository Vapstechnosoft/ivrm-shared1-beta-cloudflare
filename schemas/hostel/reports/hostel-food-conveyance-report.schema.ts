import { z } from 'zod';

export const hostelFoodConveyanceReportSchema = z.object({
    hfcFlag: z.enum(['H', 'C']),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmC_Id: z.coerce.number().min(1, 'Section is required')
});

export type HostelFoodConveyanceReportValues = z.infer<typeof hostelFoodConveyanceReportSchema>;
