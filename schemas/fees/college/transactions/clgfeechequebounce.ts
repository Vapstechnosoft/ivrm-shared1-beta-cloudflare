import { z } from 'zod';

export const clgFeeChequeBounceSchema = {
    save: z.object({
        fccB_Id: z.number().optional().default(0),
        asmaY_Id: z.string({ required_error: 'Please Select Academic Year' }).min(1, 'Please Select Academic Year'),
        amcO_Id: z.string({ required_error: 'Please Select Course' }).min(1, 'Please Select Course'),
        amB_Id: z.string({ required_error: 'Please Select Branch' }).min(1, 'Please Select Branch'),
        amsE_Id: z.string({ required_error: 'Please Select Semester' }).min(1, 'Please Select Semester'),
        amcsT_Id: z.string({ required_error: 'Please Select Student' }).min(1, 'Please Select Student'),
        fyP_Id: z.string({ required_error: 'Please Select Receipt No' }).min(1, 'Please Select Receipt No'),
        fccB_Date: z.date({ required_error: 'Please Select Date' }),
        fccB_Remarks: z.string({ required_error: 'Please Enter Remarks' }).min(1, 'Please Enter Remarks')
    }),
    delete: z.object({
        fccB_Id: z.string({ required_error: 'Record ID is required' }).min(1, 'Record ID is required')
    })
};
