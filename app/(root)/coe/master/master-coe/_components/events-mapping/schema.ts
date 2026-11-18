import { z } from 'zod';

export const eventsMapSchema = z.object({
    COEE_Id: z.number().default(0),
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    COEME_Id: z.string().min(1, 'Event Name is required'),
    COEE_EStartDate: z.date({ required_error: 'Start Date is required' }),
    COEE_EEndDate: z.date({ required_error: 'End Date is required' }),
    COEE_EStartTime: z.string().min(1, 'Start Time is required'),
    COEE_EEndTime: z.string().min(1, 'End Time is required'),

    // New fields
    COEE_ReminderDays: z.string().optional(),
    COEE_ReminderDate: z.date().optional(),
    COEE_MailActiveFlag: z.boolean().default(false),
    COEE_SMSActiveFlag: z.boolean().default(false),
    COEE_RepeatFlag: z.boolean().default(false),
    COEE_ReminderSchedule: z.string().optional(),
    ASMAY_Id_o_s: z.string().optional(),

    COEE_StudentFlag: z.boolean().default(false),
    COEE_EmployeeFlag: z.boolean().default(false),
    COEE_OtherFlag: z.boolean().default(false),
    COEE_AlumniFlag: z.boolean().default(false),
    COEE_ManagementFlag: z.boolean().default(false),
    stu_class_list: z
        .array(
            z.object({
                ASMCL_Id: z.number()
            })
        )
        .default([]),
    emp_type_list: z
        .array(
            z.object({
                HRMD_Id: z.number()
            })
        )
        .default([]),
    others_list: z
        .array(
            z.object({
                COEEO_Name: z.string(),
                COEEO_MobileNo: z.string(),
                COEEO_Emailid: z.string()
            })
        )
        .default([]),
    images_listCoe: z
        .array(
            z.object({
                COEEI_Images: z.string()
            })
        )
        .default([]),
    videos_list: z
        .array(
            z.object({
                COEEV_VideoURL: z.string()
            })
        )
        .default([]),
    urldocumentlist: z
        .array(
            z.object({
                IHW_FilePath: z.string()
            })
        )
        .default([])
});

export type EventsMapFormValues = z.infer<typeof eventsMapSchema>;
