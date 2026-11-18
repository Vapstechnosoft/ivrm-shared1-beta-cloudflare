import { z } from 'zod';

export const StjMigrationCertificateSchema = z
    .object({
        allorindi: z.enum(['A', 'I']),
        optradio: z.enum(['S', 'L', 'D']),
        ASMAY_Id: z.number().min(1, 'Please select Academic Year'),
        ASMCL_Id: z.number().optional().nullable(),
        ASMS_Id: z.number().optional().nullable(),
        AMST_Id: z.number().min(1, 'Please select Student'),
        ASA_FromDate: z.date({ required_error: 'Please select Date' }),
        examcertificatename: z.string().min(1, 'Please select Certificate Name'),
        certificatenameregno: z.string().min(1, 'Please enter Certificate Reg.No')
    })
    .refine(
        (data) => {
            if (data.allorindi === 'I') {
                return !!data.ASMCL_Id && !!data.ASMS_Id;
            }
            return true;
        },
        {
            message: 'Please select Class and Section for individual report',
            path: ['ASMCL_Id']
        }
    );

export type StjMigrationCertificateFields = z.infer<typeof StjMigrationCertificateSchema>;
