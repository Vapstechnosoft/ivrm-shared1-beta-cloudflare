import { z } from 'zod';

export const studentTcReportCustomSchema = z.object({
    asmaY_Id: z.string().min(1, 'Select Left Year'),
    admname: z.enum(['regno', 'stdname'], {
        description: 'Select Adm.No. / Name'
    }),
    asmcL_Id: z.string().min(1, 'Select Class'),
    ASMC_Id: z.string().min(1, 'Select Section'),
    AMST_Id: z.any().refine((val) => val && val.amsT_Id, {
        message: 'Select Student'
    }),
    prom: z.string().optional(),
    pervious: z.string().optional(),
    ASMCL_Id1: z.string().optional()
});

export type StudentTcReportCustomFields = z.infer<typeof studentTcReportCustomSchema>;
