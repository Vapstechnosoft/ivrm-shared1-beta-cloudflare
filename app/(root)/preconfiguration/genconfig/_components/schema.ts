import { z } from 'zod';

export const genConfigSchema = z.object({
    IVRMGC_MobileValOTPFlag: z.boolean().default(false),
    IVRMGC_emailValOTPFlag: z.boolean().default(false),
    IVRMGC_OTPMobileNo: z
        .string()
        .regex(/^[6-9]{1}[0-9]{9}$/, 'Invalid Mobile Number')
        .optional()
        .or(z.literal('')),
    IVRMGC_OTPMailId: z.string().email('Invalid Email').optional().or(z.literal('')),

    IVRMGC_EnableQRCodeFlg: z.boolean().default(false),
    IVRMGC_EnableWhatsappFlg: z.boolean().default(false),

    IVRMGC_StudentPhotoPath: z.string().optional(),
    IVRMGC_StaffPhotoPath: z.string().optional(),

    IVRMGC_SMSDomain: z.string().min(1, 'SMS Domain is required'),
    IVRMGC_SMSURL: z.string().min(1, 'SMS URL is required'),
    IVRMGC_SMSUserName: z.string().min(1, 'SMS Username is required'),
    IVRMGC_SMSPassword: z.string().min(1, 'SMS Password is required'),
    IVRMGC_SMSSenderId: z.string().min(1, 'SMS Sender ID is required'),
    IVRMGC_SMSWorkingKey: z.string().min(1, 'SMS Working Key is required'),
    IVRMGC_SMSFooter: z.string().optional(),
    IVRMGC_SMSActiveFlag: z.boolean().default(false),

    IVRMGC_emailUserName: z.string().min(1, 'Email Username is required'),
    IVRMGC_emailPassword: z.string().min(1, 'Email Password is required'),
    IVRMGC_HostName: z.string().min(1, 'Host Name is required'),
    IVRMGC_PortNo: z.string().min(1, 'Port No is required'),
    IVRMGC_MailGenralDesc: z.string().optional(),
    IVRMGC_Webiste: z.string().optional(),
    IVRMGC_PrincipalSign: z.any().optional(),
    IVRMGC_ManagerSign: z.any().optional(),

    IVRMGC_AdmNo_RegNo_RollNo_DefaultFlag: z.string().min(1, 'Select Default Combo Box Display'),

    IVRMGC_CCMail: z.string().optional(),
    IVRMGC_BCCMail: z.string().optional(),
    IVRMGC_SendGrid_Key: z.string().min(1, 'Send Grid Id is required'),
    IVRMGC_EmailActiveFlag: z.boolean().default(false),

    IVRMGC_Pagination: z.string().min(1, 'Pagination is required'),
    IVRMGC_PagePagination: z.string().min(1, 'Page Pagination is required'),
    IVRMGC_ReportPagination: z.string().min(1, 'Report Pagination is required'),
    IVRMGC_ReminderDays: z.string().min(1, 'Reminder Days is required'),
    IVRMGC_ClassCapacity: z.string().min(1, 'Class Capacity is required'),
    IVRMGC_SectionCapacity: z.string().min(1, 'Section Capacity is required'),

    IVRMGC_SCLockingPeriod: z.string().optional(),
    IVRMGC_FPLockingPeriod: z.string().optional(),
    IVRMGC_Disclaimer: z.string().optional(),
    IVRMGC_ComTrasaNoFlag: z.boolean().default(false),
    IVRMGC_SCActive: z.boolean().default(false),
    IVRMGC_FPActive: z.boolean().default(false),
    IVRMGC_OnlineFPActive: z.boolean().default(false),
    IVRMGC_FaceReaderActive: z.boolean().default(false),
    IVRMGC_DefaultStudentSelection: z.boolean().default(false),
    IVRMGC_TransportRequired: z.boolean().default(false),

    IVRMGC_AdmnoColumnDisplay: z.boolean().default(false),
    regno: z.boolean().default(false),
    IVRMGC_CatLogoFlg: z.boolean().default(false),
    rolno: z.boolean().default(false),
    IVRMGC_Classwise_Payment: z.string().min(1, 'Select Classwise Payment'),
    IVRMGC_APIOrSMTPFlg: z.string().min(1, 'Select Email Type'),
    IVRMGC_SportsPointsDropdownFlg: z.boolean().default(false),

    IVRMGC_EnableSUBTSTUIntFlg: z.boolean().default(false),
    IVRMGC_EnableSTSUBTIntFlg: z.boolean().default(false),
    IVRMGC_EnableCTSTIntFlg: z.boolean().default(false),
    IVRMGC_EnableSTCTIntFlg: z.boolean().default(false),
    IVRMGC_EnableHODSTIntFlg: z.boolean().default(false),
    IVRMGC_EnableSTHODIntFlg: z.boolean().default(false),
    IVRMGC_EnablePrincipalSTIntFlg: z.boolean().default(false),
    IVRMGC_EnableSTPrincipalIntFlg: z.boolean().default(false),
    IVRMGC_EnableASSTIntFlg: z.boolean().default(false),
    IVRMGC_EnableSTASIntFlg: z.boolean().default(false),
    IVRMGC_EnableECSTIntFlg: z.boolean().default(false),
    IVRMGC_EnableSTECIntFlg: z.boolean().default(false),
    IVRMGC_GMRDTOALLFlg: z.boolean().default(false),
    IVRMGC_EnableStaffwiseIntFlg: z.boolean().default(false),

    IVRMGC_StudentDataChangeAlertFlg: z.boolean().default(false),
    IVRMGC_StudentDataChangeAlertDays: z.string().optional(),

    IVRMGC_PasswordExpiryDuration: z.string().optional(),

    IVRMGC_AttendanceShortageAlertFlg: z.boolean().default(false),
    IVRMGC_AttShortageAlertDays: z.string().optional(),

    IVRMGC_StudentLoginCred: z.boolean().default(false),
    IVRMGC_FatherLoginCred: z.boolean().default(false),
    IVRMGC_MotherLoginCred: z.boolean().default(false),
    IVRMGC_GuardianLoginCred: z.boolean().default(false),
    IVRMGC_AutoCreateStudentCredFlg: z.boolean().default(false),
    IVRMGC_UserNameOptionsFlg: z.string().optional(),

    pagecontentlist: z
        .array(
            z.object({
                IVRMP_Id: z.number(),
                IVRMIMP_DisplayContent: z.string(),
                IVRMMP_PageName: z.string()
            })
        )
        .default([]),

    usernamearray: z
        .array(
            z.object({
                IVRMCUNP_Field: z.string(),
                IVRMCUNP_Length: z.string(),
                IVRMCUNP_FromOrderFlg: z.string(),
                IVRMCUNP_Order: z.string()
            })
        )
        .default([])
});

export type GenConfigFormValues = z.infer<typeof genConfigSchema>;
