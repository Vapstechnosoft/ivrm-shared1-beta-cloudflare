import { z } from 'zod';

export const bbhsStudentTcSchema = z.object({
    asmaY_Id: z.string().min(1, 'Select Left Year'),
    admname: z.enum(['regno', 'stdname'], {
        required_error: 'Select Adm.No. / Name'
    }),
    asmcL_Id: z.string().min(1, 'Select Class'),
    asmS_Id: z.string().min(1, 'Select Section'),
    amsT_Id: z.string().min(1, 'Select Student'),
    amC_Id: z.string().optional(),
    pervious: z.string().max(50, 'Maximum 50 characters').optional()
});

export type BbhsStudentTcSchema = z.infer<typeof bbhsStudentTcSchema>;
