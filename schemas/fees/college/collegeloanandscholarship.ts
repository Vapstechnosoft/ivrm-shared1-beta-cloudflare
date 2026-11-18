import { z } from 'zod';

export const collegeLoanFilterSchema = z.object({
    batchId: z.number({ required_error: 'Please select Batch.' }).min(1, 'Please select Batch.'),
    courseIds: z.array(z.string()).min(1, 'Please select at least one Course.'),
    branchIds: z.array(z.string()).min(1, 'Please select at least one Branch.'),
    semesterIds: z.array(z.string()).min(1, 'Please select at least one Semester.'),
    studentIds: z.array(z.string()).min(1, 'Please select at least one Student.')
});

export const collegeLoanEntryRowSchema = z.object({
    amcsT_Id: z.number(),
    loanAmount: z.number().min(0, 'Loan amount must be greater than or equal to zero.'),
    scholarshipAmount: z.number().min(0, 'Scholarship amount must be greater than or equal to zero.'),
    remarks: z.string().optional()
});

export type CollegeLoanFilterFormValues = z.infer<typeof collegeLoanFilterSchema>;
export type CollegeLoanEntryRowValues = z.infer<typeof collegeLoanEntryRowSchema>;
