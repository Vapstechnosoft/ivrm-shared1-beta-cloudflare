import { z } from 'zod';

export const collegeCasteCategorySchema = {
    addOrUpdate: z.object({
        imcC_CategoryName: z
            .string()
            .min(1, 'Category Name is required')
            .max(20, 'Category Name cannot exceed 20 characters')
            .regex(/^[a-zA-Z\s]*$/, 'Category Name can only contain letters and spaces'),
        imcC_CategoryDesc: z
            .string()
            .min(1, 'Description is required')
            .max(25, 'Description cannot exceed 25 characters')
            .regex(/^[a-zA-Z\s]*$/, 'Description can only contain letters and spaces')
    })
};

export const clgMasterCourseCategoryMapSchema = {
    addOrUpdate: z.object({
        amcO_Id: z.string({ required_error: 'Course Name is required' }).min(1, 'Course Name is required'),
        amcoC_Id: z.string({ required_error: 'Category Name is required' }).min(1, 'Category Name is required')
    })
};

export const clgMasterCourseBranchMapSchema = {
    addOrUpdate: z
        .object({
            amcO_Id: z.string({ required_error: 'Course Name is required' }).min(1, 'Course Name is required'),
            amB_Id: z.string({ required_error: 'Branch Name is required' }).min(1, 'Branch Name is required'),
            amcobM_Code: z.string().max(20, 'Code cannot exceed 20 characters').optional(),
            amcobM_CBCSFlg: z.boolean().default(false),
            amcobM_CBCSIntroYear: z.string().optional(),
            amcobM_ElectiveFlg: z.boolean().default(false),
            amcobM_ElectiveIntroYear: z.string().optional(),
            selectedSemesters: z.array(z.string()).min(1, 'At least one semester must be selected')
        })
        .refine(
            (data) => {
                if (data.amcobM_CBCSFlg && !data.amcobM_CBCSIntroYear) {
                    return false;
                }
                return true;
            },
            {
                message: 'CBCS Intro Year is required if CBCS Flag is checked',
                path: ['amcobM_CBCSIntroYear']
            }
        )
        .refine(
            (data) => {
                if (data.amcobM_ElectiveFlg && !data.amcobM_ElectiveIntroYear) {
                    return false;
                }
                return true;
            },
            {
                message: 'Elective Intro Year is required if Elective Flag is checked',
                path: ['amcobM_ElectiveIntroYear']
            }
        )
};

export const clgMasterBatchSchema = {
    addOrUpdate: z.object({
        acmsN_SessionName: z
            .string()
            .min(1, 'Batch Name is required')
            .max(30, 'Batch Name cannot exceed 30 characters')
            .regex(/^[a-zA-Z\s.]*$/, 'Batch Name can only contain letters, spaces, and dots'),
        acmnS_Order: z
            .string()
            .min(1, 'Batch Order is required')
            .max(5, 'Batch Order cannot exceed 5 characters')
            .regex(/^\d+$/, 'Batch Order must be a number')
    })
};

export const collegeMasterCasteSchema = {
    addOrUpdate: z.object({
        iC_CasteName: z
            .string()
            .min(1, 'Caste Name is required')
            .max(30, 'Caste Name cannot exceed 30 characters')
            .regex(/^[a-zA-Z\s]*$/, 'Caste Name can only contain letters and spaces'),
        iC_CasteDesc: z
            .string()
            .min(1, 'Caste Description is required')
            .max(30, 'Caste Description cannot exceed 30 characters')
            .regex(/^[a-zA-Z\s]*$/, 'Caste Description can only contain letters and spaces'),
        imcC_Id: z.string({ required_error: 'Caste Category is required' }).min(1, 'Caste Category is required')
    })
};

export const branchChangeSchema = {
    add: z
        .object({
            asmaY_Id1: z.string({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
            amcO_Id: z.string({ required_error: 'Course is required' }).min(1, 'Course is required'),
            amB_Id: z.string({ required_error: 'Branch is required' }).min(1, 'Branch is required'),
            acscoB_AMB_Id: z.string({ required_error: 'To Branch is required' }).min(1, 'To Branch is required'),
            amsE_Id1: z.string({ required_error: 'Semester is required' }).min(1, 'Semester is required'),
            amsE_Id: z.string({ required_error: 'To Semester is required' }).min(1, 'To Semester is required'),
            acmS_Id: z.string({ required_error: 'Section is required' }).min(1, 'Section is required'),
            acmS_Id_COB: z.string({ required_error: 'To Section is required' }).min(1, 'To Section is required'),
            amcsT_Id: z.string({ required_error: 'Student is required' }).min(1, 'Student is required'),
            acscoB_OldRegNo: z.string().optional(),
            acscoB_NewRegNo: z.string().optional(),
            acscoB_COBDate: z.date({ required_error: 'Date is required' }),
            acscoB_COBFees: z.string({ required_error: 'COB Fees is required' }).min(1, 'COB Fees is required'),
            acscoB_Remarks: z.string({ required_error: 'Reason is required' }).min(1, 'Reason is required')
        })
        .refine((data) => data.amB_Id !== data.acscoB_AMB_Id, {
            message: 'Select Different Branch In To Branch',
            path: ['acscoB_AMB_Id']
        })
};
