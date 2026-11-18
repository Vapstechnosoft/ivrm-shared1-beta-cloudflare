import { z } from 'zod';

// Master Job Schema
export const recruitmentMasterJobSchema = z.object({
    hrmJ_Id: z.number().optional(),
    hrmJ_JobCode: z
        .string({ message: 'Job Code is required' })
        .min(1, { message: 'Job Code is required' })
        .max(50, { message: 'Job Code must not exceed 20 characters' }),
    hrmJ_JobTiTle: z
        .string({ message: 'Job Title is required' })
        .min(1, { message: 'Job Title is required' })
        .max(100, { message: 'Job Title must not exceed 100 characters' }),
    hrmlO_Id: z.coerce.number({ message: 'Job Location is required' }).min(1, 'Job Location is required'),
    hrC_Id: z.number().optional().default(0)
});

// Master Location Schema
export const recruitmentMasterLocationSchema = z.object({
    mi_Id: z.number().optional().default(0),
    hrmlO_Id: z.number().optional().default(0),
    hrmlO_Institution: z.string({ message: 'Institution is required' }).min(1, 'Institution is required'),
    hrmlO_LocationName: z.string({ message: 'Location Name is required' }).min(1, 'Location Name is required'),
    hrmlO_LocationDesc: z.string({ message: 'Location Description is required' }).min(1, 'Location Description is required'),
    hrmlO_ActiveFlg: z.boolean().default(true)
});

// Master Position Schema
export const recruitmentMasterPositionSchema = z.object({
    mi_Id: z.number().optional().default(0),
    hrmP_Id: z.number().optional().default(0),
    hrmP_Institution: z.string({ message: 'Institution is required' }).min(1, 'Institution is required'),
    hrmP_Position: z
        .string({ message: 'Position Name is required' })
        .min(1, 'Position Name is required')
        .regex(/^[A-Za-z\s\-,']+$/, 'Position Name must contain only letters'),
    hrmP_Skills: z
        .string({ message: 'Skill is required' })
        .min(1, 'Skill is required')
        .regex(/^[A-Za-z\s\-,']+$/, 'Skill must contain only letters'),
    hrmP_Desc: z
        .string({ message: 'Description is required' })
        .min(1, 'Description is required')
        .regex(/^[A-Za-z\s\-,']+$/, 'Description must contain only letters'),
    hrmP_ActiveFlg: z.boolean().default(true)
});

// Master Position Type Schema
export const recruitmentMasterPositionTypeSchema = z.object({
    mI_Id: z.number().optional().default(0),
    hrmpT_Id: z.number().optional(),
    hrmpT_Institution: z.string({ message: 'Institution is required' }).min(1, 'Institution is required'),
    hrmpT_Name: z
        .string()
        .min(1, 'Position Type Name is required')
        .regex(/^[A-Za-z\s\-,'.]+$/, 'Position Type Name must contain only letters'),
    hrmpT_Desc: z
        .string()
        .min(1, 'Description is required')
        .regex(/^[A-Za-z\s\-,'.]+$/, 'Description must contain only letters'),
    hrmpT_ActiveFlg: z.boolean().default(true)
});

// Master Priority Schema
export const recruitmentMasterPrioritySchema = z.object({
    hrmpR_Id: z.number().optional().default(0),
    hrmP_Name: z
        .string({ message: 'Priority Name is required' })
        .min(1, 'Priority Name is required')
        .max(100, 'Priority Name must not exceed 100 characters')
        .regex(/^[A-Za-z\s\-,']+$/, 'Priority Name must contain only letters'),
    hrmP_Order: z
        .string({ message: 'Order is required' })
        .min(1, 'Order is required')
        .regex(/^[0-9]+$/, 'Order must be a number'),
    hrmP_ActiveFlag: z.boolean().default(true)
});
