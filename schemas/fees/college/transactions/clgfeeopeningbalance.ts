import { z } from 'zod';

export const clgFeeOpeningBalanceSchema = {
    searchStudents: z.object({
        asmaY_Id: z.string({ required_error: 'Please Select Academic Year' }).min(1, 'Please Select Academic Year'),
        amcO_Id: z.string({ required_error: 'Please Select Course' }).min(1, 'Please Select Course'),
        amB_Id: z.string({ required_error: 'Please Select Branch' }).min(1, 'Please Select Branch'),
        amsE_Id: z.string({ required_error: 'Please Select Semester' }).min(1, 'Please Select Semester'),
        fmG_Id: z.string({ required_error: 'Please Select Group' }).min(1, 'Please Select Group'),
        fmH_Id: z.string({ required_error: 'Please Select Head' }).min(1, 'Please Select Head'),
        ftI_Id: z.string({ required_error: 'Please Select Installment' }).min(1, 'Please Select Installment')
    }),
    delete: z.object({
        fcmoB_Id: z.string({ required_error: 'Record ID is required' }).min(1, 'Record ID is required')
    })
};
