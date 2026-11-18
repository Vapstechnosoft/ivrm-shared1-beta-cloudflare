export interface IGeneralConfiguration {
    ivrmgC_Id: number;
    ivrmgC_MobileValOTPFlag: boolean;
    ivrmgC_EnableWhatsappFlg: boolean;
    ivrmgC_EnableQRCodeFlg: boolean;
    ivrmgC_emailValOTPFlag: boolean;
    ivrmgC_StudentPhotoPath?: string;
    ivrmgC_StaffPhotoPath?: string;
    ivrmgC_ComTrasaNoFlag: boolean;
    ivrmgC_SMSDomain?: string;
    ivrmgC_SMSURL?: string;
    ivrmgC_SMSUserName?: string;
    ivrmgC_SMSPassword?: string;
    ivrmgC_SMSSenderId?: string;
    ivrmgC_SendGrid_Key?: string;
    ivrmgC_SMSWorkingKey?: string;
    ivrmgC_SMSFooter?: string;
    ivrmgC_SMSActiveFlag: boolean;
    ivrmgC_OTPMobileNo?: number | string;
    ivrmgC_OTPMailId?: string;
    ivrmgC_emailUserName?: string;
    ivrmgC_emailPassword?: string;
    ivrmgC_HostName?: string;
    ivrmgC_PortNo?: string;
    ivrmgC_MailGenralDesc?: string;
    ivrmgC_Webiste?: string;
    ivrmgC_emailid?: string;
    ivrmgC_emailFooter?: string;
    ivrmgC_CCMail?: string;
    ivrmgC_BCCMail?: string;
    ivrmgC_ToMail?: string;
    ivrmgC_EmailActiveFlag: boolean;
    ivrmgC_Pagination?: number;
    ivrmgC_PagePagination?: number;
    ivrmgC_ReminderDays?: number;
    ivrmgC_ClassCapacity?: number;
    ivrmgC_SectionCapacity?: number;
    ivrmgC_SCLockingPeriod?: number;
    ivrmgC_SCActive: boolean;
    ivrmgC_FPActive: boolean;
    ivrmgC_OnlineFPActive: boolean;
    ivrmgC_FaceReaderActive: boolean;
    ivrmgC_DefaultStudentSelection: boolean;
    ivrmgC_CatLogoFlg: boolean;
    ivrmgC_ReportPagination?: number;
    ivrmgC_TransportRequired: boolean;
    ivrmgC_AdmnoColumnDisplay: boolean;
    ivrmgC_RegnoColumnDisplay: boolean;
    ivrmgC_RollnoColumnDisplay: boolean;
    ivrmgC_SportsPointsDropdownFlg: boolean;
    ivrmgC_Classwise_Payment?: number;
    ivrmgC_APIOrSMTPFlg?: string;
    ivrmgC_AdmNo_RegNo_RollNo_DefaultFlag?: number;
    ivrmgC_FPLockingPeriod?: number;
    ivrmgC_PasswordExpiryDuration?: number;
    ivrmgC_AttendanceShortagePercent?: number;
    ivrmgC_AttShortageAlertDays?: number;
    ivrmgC_AttendanceShortageAlertFlg: boolean;
    ivrmgC_Disclaimer?: string;
    ivrmgC_PrincipalSign?: string;
    ivrmgC_ManagerSign?: string;

    ivrmgC_EnableSTSUBTIntFlg: boolean;
    ivrmgC_EnableSTCTIntFlg: boolean;
    ivrmgC_EnableSTHODIntFlg: boolean;
    ivrmgC_EnableSTPrincipalIntFlg: boolean;
    ivrmgC_EnableSTASIntFlg: boolean;
    ivrmgC_EnableSTECIntFlg: boolean;
    ivrmgC_GMRDTOALLFlg: boolean;
    ivrmgC_EnableStaffwiseIntFlg: boolean;
    ivrmgC_EnableCTSTIntFlg: boolean;
    ivrmgC_EnableHODSTIntFlg: boolean;
    ivrmgC_EnablePrincipalSTIntFlg: boolean;
    ivrmgC_EnableASSTIntFlg: boolean;
    ivrmgC_EnableECSTIntFlg: boolean;
    ivrmgC_EnableSUBTSTUIntFlg: boolean;

    ivrmgC_StudentDataChangeAlertFlg: boolean;
    ivrmgC_StudentDataChangeAlertDays?: number;

    ivrmgC_StudentLoginCred: boolean;
    ivrmgC_FatherLoginCred: boolean;
    ivrmgC_MotherLoginCred: boolean;
    ivrmgC_GuardianLoginCred: boolean;
    ivrmgC_AutoCreateStudentCredFlg: boolean;
    ivrmgC_UserNameOptionsFlg?: string;

    instuitename?: string;
}

export interface IPageList {
    ivrmP_Id: number;
    ivrmmP_PageName: string;
}

export interface IUsernameArray {
    ivrmcunP_Id: number;
    ivrmcunP_Length: number;
    ivrmcunP_Order: number;
    ivrmcunP_FromOrderFlg: string;
    ivrmcunP_Field: string;
}

export interface IGeneralConfigurationResponse {
    mstConfigList: IGeneralConfiguration[];
    pagelist: IPageList[];
    usernamearray: IUsernameArray[];
    message?: string;
    returnval?: string;
}
