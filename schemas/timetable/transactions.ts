import { createStringOnlySchema, deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const DeputationSchema = z.object({
    asmaY_Id: z.string().min(1, 'Please Select Academic Year'),
    ttmD_Date: z.date({ required_error: 'Please Select Date' }).optional().nullable(),
    absent_Staff_Flag: z.boolean().default(false),
    hrmE_Id: z.string().min(1, 'Please Select Staff'),
    ttmD_Id: z.number().optional(),
    ttmD_Day: z.string().optional(),
    ttmD_Remarks: z.string().optional(),
    sms_Flag: z.boolean().default(false),
    email_Flag: z.boolean().default(false),
    notification_Flag: z.boolean().default(false)
});

export const ManualPeriodInsertionSchema = z.object({
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    ttmC_Id: z.string().min(1, 'Category is required'),
    asmcL_Id: z.string().min(1, 'Class is required'),
    asms_Id: z.string().optional()
});
export type ManualPeriodInsertionValues = z.infer<typeof ManualPeriodInsertionSchema>;

export const StaffRepacementExistingToNewSchema = z.object({
    asmaY_Id: z.string().optional(), //Academic Year
    ttmC_Id: z.string().min(1, 'Please Provide Category'), //category
    asmcL_Id: z.string().min(1, 'Please Select Class'), //Class
    asms_Id: z.string().min(1, 'Please Select Section'), //Section
    hrmE_Id_From: z.string().min(1, 'Replace Staff From is required'), //staff from
    hrmE_Id_To: z.string().min(1, 'Replace Staff To is required'), //staff to
    ismS_Id: z.string().min(1, 'Please Select Subject') //Subject
});
export type StaffReplacementExistingToNewValues = z.infer<typeof StaffRepacementExistingToNewSchema>;

export const staffReplacementInTheirTimeTableSchema = z.object({
    hrmE_Id: z.string().min(1, 'Staff is required') //staff
});
export type StaffReplacementInTheirTimetableValues = z.infer<typeof staffReplacementInTheirTimeTableSchema>;

export const staffReplacementInUnallocatedPeriodSchema = z.object({
    hrmE_Id: z.string().min(1, 'Staff is required') //staff
});
export type StaffReplacementInUnallocatedPeriodValues = z.infer<typeof staffReplacementInUnallocatedPeriodSchema>;

export const staffPeriodTransferSchema = z.object({
    asmaY_Id: z.string().min(1, 'Academic Year is required'), //academic
    asmcL_Id: z.string().optional(), //Class
    asms_Id: z.string().optional(), //Section
    hrmE_Id: z.string().min(1, 'Staff is required'), //staff
    ismS_Id: z.string().optional() //Subject
});
export type StaffPeriodTransferValues = z.infer<typeof staffPeriodTransferSchema>;

export const timeTableGenerationSchema = z.object({
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    ttmC_Id: z.string().min(1, 'Category Name is required'),
    hrmE_Id: z.string().optional(),
    asmcL_Id: z.string().optional(),
    asms_Id: z.string().optional(),
    notConfirmedPeriods: z.string().optional()
});
export const ttGenerationSchema = {
    addOrUpdate: z.object({
        ttmD_Id: z.number().optional(),
        ttmD_DayName: createStringOnlySchema('Day Name', 1, 100),
        ttmD_DayCode: createStringOnlySchema('Day Code', 1, 100)
    }),
    delete: z.object({
        ttfG_Id: deleteIdSchema('ttfG_Id')
    })
};
export type TimeTableGenerationValues = z.infer<typeof timeTableGenerationSchema>;

export const uniformDistributionSchema = z.object({
    ttmC_Id: z.number({
        required_error: 'Category is required'
    }),
    calssids: z.array(z.string()).min(1, 'Select at least one class')
});
export type UniformDistributionForm = z.infer<typeof uniformDistributionSchema>;
