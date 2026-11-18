import { z } from 'zod';

export const ndaStudentProfileReportSchema = z
    .object({
        type: z.enum(['Student', 'Staff'], {
            required_error: 'Please select a report type'
        }),
        academic_year: z.string().optional(),
        classname: z.string().optional(),
        sectionname: z.string().optional()
    })
    .refine(
        (data) => {
            if (data.type === 'Student') {
                return !!data.academic_year && !!data.classname && !!data.sectionname;
            }
            return true;
        },
        {
            message: 'Academic Year, Class, and Section are required for Student report',
            path: ['academic_year']
        }
    );

export type NdaStudentProfileReportFields = z.infer<typeof ndaStudentProfileReportSchema>;
