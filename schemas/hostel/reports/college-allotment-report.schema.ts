import { z } from 'zod';

// Schema for College Allotment Report
export const collegeAllotmentReportSchema = z.object({
    type: z.enum(['Student', 'Staff', 'Guest'], { required_error: 'Type is required' }),
    ASMAY_Id: z.number().optional().nullable().or(z.literal(0)),
    HLMH_Id: z.number().optional().nullable().or(z.literal(0)),
    frmdate: z.date({ required_error: 'From Date is required' }),
    todate: z.date({ required_error: 'To Date is required' })
});

export type CollegeAllotmentReportSchema = z.infer<typeof collegeAllotmentReportSchema>;
