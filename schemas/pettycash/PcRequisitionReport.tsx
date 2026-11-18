import { z } from 'zod';

export const UsePcRequisitionReportSchemas = {
    addOrUpdate: z.object({
        mI_Id: z.number({ required_error: 'Organization is required' }).min(1, 'Organization is required'),
        fromDate: z.date({ required_error: 'From Date is required' }),
        toDate: z.date({ required_error: 'To Date is required' })
    })
};

export type UsePcRequisitionReport = z.infer<typeof UsePcRequisitionReportSchemas.addOrUpdate>;
