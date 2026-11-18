export interface ISMSCollegeStudentTCInitialData {
    getyear: { asmaY_Id: number; asmaY_Year: string }[];
    getconfigurationdetails: {
        admC_TCAllowBalanceFlg: number;
        asC_AdmNo_RegNo_RollNo_DefaultFlag: string;
    }[];
    admTransNumSetting: any[];
}

export interface ISMSCollegeStudentTCStudent {
    amcsT_Id: number;
    studentName: string;
}

export interface ISMSCollegeStudentTCDetails {
    studentname: string;
    fathername: string;
    coursename: string;
    branchname: string;
    semestername: string;
    sectionname: string;
    studentphoto: string;
    admno: string;
    regno: string;
    doa: string;
    dob: string;
    dobinwords: string;
    castename: string;
    ifsccode: string;
    birthplace: string;
    age: string;
    gender: string;
    mothertounge: string;
    nationality: string;
    mobileno: string;
    emailid: string;
    aadharno: string;
    ACSTC_TCNO?: string;
    ACSTC_PromotionDate?: string;
    ACSTC_MediumOfINStruction?: string;
    ACSTC_Scholarship?: string;
    ACSTC_MedicallyExam?: string;
    ACSTC_TCApplicationDate?: string;
    ACSTC_LeavingReason?: string;
    ACSTC_TCDate?: string;
    ACSTC_FeeConcession?: string;
    ACSTC_LastExamDetails?: string;
    ACSTC_Result?: string;
    ACSTC_ResultDetails?: string;
    ACSTC_Qual_PromotionFlag?: string;
    ACSTC_Qual_Course?: string;
    ACSTC_NCCDetails?: string;
    ACSTC_ExtraActivities?: string;
    ACSTC_Conduct?: string;
    ACSTC_Remarks?: string;
    Fee_Due_Amnt?: number;
    Library_Due_Amnt?: number;
    Store_Canteen_Due?: number;
    PDA_Due?: number;
    ACSTC_WorkingDays?: number;
    ACSTC_AttendedDays?: number;
    ACSTC_LastAttendedDate?: string;
    ACSTC_LanguageStudied?: string;
    ACSTC_ElectivesStudied?: string;
}

export interface ISMSCollegeStudentTCAttendanceDetails {
    classheld: number;
    classattened: number;
    lastdate: string;
}

export interface ISMSCollegeStudentTCFeeDetails {
    balance: number;
}

export interface ISMSCollegeStudentTCSubject {
    flag: number;
    subjectname: string;
}

export interface ISMSCollegeStudentTCResponse {
    getstudentdetails: ISMSCollegeStudentTCDetails[];
    getstudentattendancedetails: ISMSCollegeStudentTCAttendanceDetails[];
    getstudentfeedetails: ISMSCollegeStudentTCFeeDetails[];
    getstudentlanguagesubjects: ISMSCollegeStudentTCSubject[];
}
