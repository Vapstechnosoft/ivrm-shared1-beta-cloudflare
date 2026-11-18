import { z } from 'zod';

export const ndsPromotionReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    selectedStudents: z.array(z.string()).min(1, 'At least one student must be selected'),
    date: z.date({
        required_error: 'Date is required',
        invalid_type_error: "That's not a date!"
    })
});

export type NDSPromotionReportSchema = z.infer<typeof ndsPromotionReportSchema>;
