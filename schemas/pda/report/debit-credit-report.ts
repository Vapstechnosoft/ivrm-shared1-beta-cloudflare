import { z } from 'zod';

export const pdaDebitCreditReportSchema = z
    .object({
        reportCategory: z.enum(['All', 'Individual']).default('Individual'),
        type: z.enum(['All', 'CR', 'DR']),
        asmaY_Id: z.coerce.number().min(1, 'Please Select the Academic Year'),
        classIds: z.array(z.number()).min(1, 'Select Class'),
        sectionIds: z.array(z.number()).min(1, 'Select Section'),
        amst_Id: z.coerce.number().optional(),
        fromDate: z.date({ required_error: 'Please Select From Date' }),
        toDate: z.date({ required_error: 'Please Select To Date' })
    })
    .superRefine((data, ctx) => {
        if (data.reportCategory === 'Individual' && (!data.amst_Id || data.amst_Id === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please Select Student Name',
                path: ['amst_Id']
            });
        }
    });

export type PDADebitCreditReportFormValues = z.infer<typeof pdaDebitCreditReportSchema>;
