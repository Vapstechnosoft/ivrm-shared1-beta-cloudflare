export interface AcademicYearItem {
    asmaY_Id: number;
    mI_Id?: number;
    asmaY_Year: string;
    asmaY_From_Date?: string;
    asmaY_To_Date?: string;
    asmaY_Order?: number;
    asmaY_ActiveFlag?: number;
    is_Active?: boolean;
}

export interface StudentJoinedDetail {
    amsT_Id?: number;
    studentname?: string;
    amsT_FirstName?: string | null;
    amsT_MiddleName?: string | null;
    amsT_LastName?: string | null;
    amsT_AdmNo?: string;
    amsT_RegistrationNo?: string;
    amsT_DOB?: string;
    amsT_Date?: string;
    asmaY_Year?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string | null;
    amsT_Sex?: string;
    amsT_SOL?: string; // "S" = Active, "D" = Deactivated, "L" = Left
    amsT_Photoname?: string | null;
    amsT_BloodGroup?: string | null;
    amsT_PerArea?: string | null;
    amsT_PerCity?: string | null;
    amsT_PerState?: string | null;
    amsT_PerCountry?: string | null;
    amsT_PerPincode?: string | null;
    [key: string]: any;
}

export interface StudentDetail {
    amsT_Id?: number;
    mI_Id?: number;
    asmaY_Id?: number;
    amsT_FirstName?: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    amsT_Date?: string;
    amsT_RegistrationNo?: string;
    amsT_AdmNo?: string;
    amsT_Sex?: string;
    amsT_DOB?: string;
    amsT_DOB_Words?: string;
    pasR_Age?: number;
    amsT_BloodGroup?: string;
    amsT_MobileNo?: number | string;
    amsT_emailId?: string;
    amsT_Tpin?: string;
    // Father
    amsT_FatherName?: string;
    amsT_FatherSurname?: string | null;
    amsT_FatherMobleNo?: number | string;
    amsT_FatheremailId?: string;
    ansT_FatherPhoto?: string | null;
    amsT_FatherOccupation?: string | null;
    amsT_FatherEducation?: string | null;
    // Mother
    amsT_MotherName?: string;
    amsT_MotherSurname?: string | null;
    amsT_MotherMobileNo?: number | string;
    amsT_MotherEmailId?: string;
    ansT_MotherPhoto?: string | null;
    amsT_MotherOccupation?: string | null;
    amsT_MotherEducation?: string | null;
    // Addresses
    amsT_PerStreet?: string | null;
    amsT_PerArea?: string | null;
    amsT_PerCity?: string | null;
    amsT_PerState?: string | number | null;
    amsT_PerCountry?: string | number | null;
    amsT_PerPincode?: string | number | null;
    amsT_ConStreet?: string | null;
    amsT_ConArea?: string | null;
    amsT_ConCity?: string | null;
    amsT_ConState?: string | number | null;
    amsT_ConCountry?: string | number | null;
    amsT_ConPincode?: string | number | null;
    [key: string]: any;
}

export interface StudentAcademicYearDetail {
    asmaY_Year?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    order?: number;
    asmaY_Id?: number;
    amaY_RollNo?: number;
    status_Flag?: string; // "Current Year", etc.
    [key: string]: any;
}

export interface StudentGuardianDetail {
    amstG_Id?: number;
    amsT_Id?: number;
    amstG_GuardianName?: string;
    amstG_GuardianAddress?: string | null;
    amstG_GuardianPhoneNo?: string;
    amstG_emailid?: string;
    amstG_Relation?: string | null;
    amstG_GuardianPhoto?: string | null;
}

export interface StudentSubjectDetail {
    ismS_Id?: number;
    ismS_SubjectName: string;
    estsU_ElecetiveFlag?: boolean;
    order?: number;
}

export interface AttendanceRecord {
    asmaY_Year: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    workingDays: number;
    presentDays: number;
    percentage: number;
    statusFlag?: string;
}

export interface AttendanceMonthRecord {
    months: string;
    years: string;
    workingCount: number;
    presentCount: number;
    percentage?: number;
}

export interface FeeSummaryRecord {
    asmaY_Year: string;
    classSection: string;
    yearlyCharges: number;
    concession: number;
    payable: number;
    paidAmount: number;
    outstanding: number;
}

export interface FeeHeadRecord {
    feeHead: string;
    installment: string;
    charges: number;
    concession: number;
    payable: number;
    paid: number;
    balance: number;
}

export interface ExamRecord {
    examName: string;
    obtainedMarks: number;
    maxMarks: number;
    percentage?: number;
    result?: string;
    grade?: string;
}

export interface DisciplineRecord {
    subject?: string;
    complaints?: string;
    date?: string;
    fileName?: string;
    filePath?: string;
}

export interface TeacherRecord {
    empName: string;
    subjectName?: string;
    role?: string;
    hrmE_Id?: number;
}

export interface StudentViewDetailsResponse {
    yearlist?: AcademicYearItem[];
    viewstudentjoineddetails?: StudentJoinedDetail[];
    viewstudentdetails?: StudentDetail[];
    viewstudentacademicyeardetails?: StudentAcademicYearDetail[];
    viewstudentacademicyeardetailsnew?: StudentAcademicYearDetail[];
    viewstudentguardiandetails?: StudentGuardianDetail[];
    viewstudentsubjectdetails?: StudentSubjectDetail[];
    viewstudentattendancetails?: any; // Can be array of arrays, flat array, or array of objects
    viewstudentattendanceMonthdetails?: any;
    viewstudentfeedetails?: any;
    viewstudenfeeyeardetails?: any;
    viewstudentwiseexamdetails?: any;
    viewstudentaddressdetails?: string[];
    studentdivlist?: any;
    classteacher?: any[];
    sujectteachers?: any[];
    [key: string]: any;
}
