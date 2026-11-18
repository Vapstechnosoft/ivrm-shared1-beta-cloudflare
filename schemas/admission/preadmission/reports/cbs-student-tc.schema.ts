import { z } from 'zod';

export const CbsStudentTcSchema = z.object({
    reporttype: z.enum(['All', 'indi']).default('All'),
    temporper: z.enum(['Temp', 'Per']).default('Per'),
    asmaY_Id: z.number().min(1, 'please select academic year'),
    amsT_Id: z.any().refine((v) => !!v && (typeof v === 'object' ? !!v.amsT_Id : !!v), { message: 'please select student name' }),
    asmcL_Id: z.number().optional().default(0),
    asmS_Id: z.number().optional().default(0),
    BSPID: z.string().optional(),
    Boardtype: z.enum(['ISC', 'ICSE']).default('ICSE'),
    resulttype: z.string().min(1, 'please select result type'),
    search: z.string().optional(),
    Previous_School_Name: z.string().optional()
});

export type CbsStudentTcFields = z.infer<typeof CbsStudentTcSchema>;
