import { z } from 'zod';

export const slabWiseExamReportSchema = z
    .object({
        asmaY_Id: z.coerce.number().min(1, 'Select Academic Year'),
        asmcL_Id: z.coerce.number().min(1, 'Select Class'),
        asmS_Id: z.coerce.number().min(1, 'Select Section'),
        emE_Id: z.coerce.number().min(1, 'Select Exam Name'),
        ISMS_Id: z.coerce.number().optional(),
        frommarks: z.coerce.number().min(0, 'Enter From Marks/%'),
        tomarks: z.coerce.number().min(0, 'Enter To Marks/%'),
        reporttype: z.enum(['Marks', 'Percentage'])
    })
    .refine(
        (data) => {
            if (data.reporttype === 'Marks' && (!data.ISMS_Id || data.ISMS_Id === 0)) {
                return false;
            }
            return true;
        },
        {
            message: 'Select Subject',
            path: ['ISMS_Id']
        }
    );

export type SlabWiseExamReportValues = z.infer<typeof slabWiseExamReportSchema>;
