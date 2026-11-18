import { z } from 'zod';

export const pcRequisitionSchema = {
    addOrUpdate: z.object({
        departmentname: z.string().min(1, 'Department Name is required'),
        employeename: z.string().min(1, 'Employee Name is required'),
        pcreqtN_Date: z.date({ required_error: 'Date is required' }),
        pcreqtN_Purpose: z.string().min(1, 'Purpose is required'),

        // Particulars Requirements Details
        requisitionDetails: z
            .array(
                z.object({
                    pcmparT_Id: z.string().min(1, 'Particulars is required'),
                    pcreqtndE_Amount: z.number().min(0, 'Amount must be positive'),
                    pcreqtndE_Remarks: z.string().optional()
                })
            )
            .min(1, 'At least one particular detail is required'),

        requisitionDocuments: z
            .array(
                z.object({
                    pcreqtndO_FileName: z.string().min(1, 'File Name is required'),
                    pcreqtndO_FilePath: z.string().optional(),
                    file: z.any().optional(),
                    fileType: z.string().optional()
                })
            )
            .optional()
    })
};

export type PcRequisitionFormValues = z.infer<typeof pcRequisitionSchema.addOrUpdate>;
