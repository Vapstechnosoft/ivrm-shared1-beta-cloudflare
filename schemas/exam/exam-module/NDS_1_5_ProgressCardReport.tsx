import { z } from 'zod';

export const nds15ReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedStudents: z.array(z.string()).min(1, 'Select Atleast One Student'),
    date: z.date().optional(),
    re_opendate: z.date().optional()
});

export type NDS15ReportSchema = z.infer<typeof nds15ReportSchema>;
