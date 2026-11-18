import { z } from 'zod';

// Online Exam Report Filter Schema
export const onlineExamReportFilterSchema = z.object({
    asmaY_Id:   z.coerce.number({ required_error: 'Academic Year is required' }).min(1, 'Select Academic Year'),
    asmcL_Id:   z.coerce.number({ required_error: 'Class is required' }).min(1, 'Select Class'),
    asmS_Id:    z.coerce.number().optional(),
    lpmoeeX_Id: z.coerce.number({ required_error: 'Exam Name is required' }).min(1, 'Select Exam Name'),
    ismS_Id:    z.coerce.number({ required_error: 'Subject is required' }).min(1, 'Select Subject'),
    fromDate:   z.string().min(1, 'Select From Date'),
    toDate:     z.string().min(1, 'Select To Date')
});

// Staff-Wise & Not-Submitted Report Filter Schema
export const staffWiseReportFilterSchema = z.object({
    asmaY_Id: z.coerce.number({ required_error: 'Academic Year is required' }).min(1, 'Select Academic Year'),
    asmcL_Id: z.coerce.number().optional(),
    asmS_Id: z.coerce.number().optional(),
    ismS_Id: z.coerce.number().optional(),
    lpmoeeX_Id: z.coerce.number({ required_error: 'Exam Name is required' }).min(1, 'Select Exam Name'),
    reportType: z.enum(['not_submitted', 'staff_wise']).default('not_submitted')
});
