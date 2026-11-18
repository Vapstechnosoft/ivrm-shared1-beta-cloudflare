import { z } from 'zod';

export const ndaStudentTcFilterSchema = z.object({
    academic_year: z.string().min(1, 'Please select Academic Year'),
    classname: z.string().min(1, 'Please select Class'),
    sectionname: z.string().min(1, 'Please select Section')
});

export type NdaStudentTcFilterFields = z.infer<typeof ndaStudentTcFilterSchema>;

export const ndaStudentTcApplySchema = z.object({
    AMST_Id: z.number(),
    StudentName: z.string(),
    AMST_AdmNo: z.string(),
    ASMCL_ClassName: z.string(),
    ASMC_SectionName: z.string(),
    selected: z.boolean().default(false),
    ASTC_TCApplicationDate: z.date().nullable().optional(),
    ASTC_TCDate: z.date().nullable().optional(),
    ASTC_Remarks: z.string().nullable().optional(),
    ASMAY_Id: z.number(),
    ASMS_Id: z.number(),
    ASMCL_Id: z.number()
});

export type NdaStudentTcApplyFields = z.infer<typeof ndaStudentTcApplySchema>;
