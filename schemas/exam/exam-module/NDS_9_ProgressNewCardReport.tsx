import { z } from 'zod';

export const nds9ReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedStudents: z.array(z.string()).min(1, 'Select Atleast One Student'),
    date: z.date().optional()
});

export type NDS9ReportSchema = z.infer<typeof nds9ReportSchema>;
