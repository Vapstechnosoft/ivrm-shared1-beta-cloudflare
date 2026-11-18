import { z } from 'zod';

export const labConstraintsSchema = z.object({
    ttlaB_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    ttmC_Id: z.number().min(1, 'Category is required'),
    ttlaB_LABLIBName: z.string().min(1, 'Lab Name is required').max(100, 'Lab Name too long'),
    tempararyArrayList: z
        .array(
            z.object({
                asmcL_Id: z.number().min(1, 'Class is required'),
                asmS_Id: z.number().min(1, 'Section is required'),
                ismS_Id: z.number().min(1, 'Subject is required'),
                clsName: z.string().optional(),
                sectName: z.string().optional(),
                subName: z.string().optional()
            })
        )
        .min(1, 'At least one lab detail is required')
});

export type LabConstraintsSchema = z.infer<typeof labConstraintsSchema>;
