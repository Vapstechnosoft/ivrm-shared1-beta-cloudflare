export interface IMasterStudentCountReportList {
    user_id?: number;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    FatherName?: string;
    UserName?: string;
    EmailID?: string;
    Mobileno?: string;
    RegDate?: string;
    Class?: string;
    RegNo?: string;
    [key: string]: any;
}
export interface IParentsDashboardStudentResponse {
    pasr_id: number;
    registration_number: string;
    student_name: string;
    date_of_birth: string;
    mobile_no: number;
    email_id: string;
    applied_class_name: string;
    is_fee_applicable: number;
    payment_status: number;
    application_status: string;
    admission_status: string;
    student_photo: string;
}

export interface IClassTeacherReportList {
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    IVRMSTAUL_UserName: string;
    PAMS_SubjectName: string;
}

export interface IStudentYearlyAttendenceReportList {
    RowNo: number;
    AMST_Id: number;
    name: string;
    AMST_AdmNo: string;
    AMST_RegistrationNo: string;
    AMAY_RollNo: number;
    monthlyAttendance: {
        [key: string]: number;
    };
    totalPresent: number;
    totalWorkingDays: number;
    totalAbsent: number;
    percentage: string;
}
export interface IRigistrationReportList {
    rowNumber: number;
    user_Name: string;
    email_Id: string;
    mob_No: string;
    name: string;
    created_Date: string;
}

export interface IStudentAttendanceReportList {
    AMST_Id: number;
    name: string;
    AMST_AdmNo: string;
    AMAY_RollNo: number;
    ASA_ClassHeld: number;
    ASA_Class_Attended: number;
    Percentage: number;
    RowNo: number;
}
export type Student = {
    studentnam: string;
    AMST_Id: number;
    admno: string;
    fathername: string;
    mothername: string;
    class: string;
    section: string;
    acadamicyear: string;
    dob: string;
    caste_name: string;
    addressd1: string;
    addressd13: string;
    city: string;
    photopath: string;
    MI_Logo: string;
    IVRMMCT_Name: string;
    pincode: string;
    street: string;
    area: string;
    constreet: string;
    conarea: string;
    concity: string;
    dobwords: string;
};

export type StudyCertificateResponse = {
    studentList: Student[];
    masterCompany: any[];
    academicList: any[];
    principalSign: any[];
};

export type GenerateQRCodeResponse = {
    ascisS_QRCode: string;
};

export interface IScheduleReportList {
    name: string;
    regno: string;
    class: string;
    gender: string;
    ScheduleDate: string;
    ScheduleTime: string;
    ScheduleTimeTo: string;
    PAOTS_Remarks: string;
    scheduledate?: string; // Lowercase from backend
    scheduletime?: string; // Lowercase from backend
    scheduletimeto?: string; // Lowercase from backend
    remarks?: string | null; // From backend
    age: string;
    place: string;
    fathername: string;
    PASR_DOB: string;
    PASR_emailId: string;
    PASR_MobileNo: string;
    PASR_PerStreet: string;
    PASR_PerArea: string;
    PASR_PerCity: string;
    PASR_PerPincode: string;
    Category: string;
    Medium: string;
    Syllabus: string;
    selected?: boolean;
}

export interface IScheduleReportInitialDetailsResponse {
    year: { asmaY_Id: number; asmaY_Year: string }[];
    classname: { asmcL_Id: number; asmcL_ClassName: string }[];
}

export type IScheduleListResponse =
    | {
          writentestlist: { disid: number; disname: string }[];
      }
    | { disid: number; disname: string }[];

export type IScheduleReportDetailsResponse =
    | {
          searchstudentlist?: IScheduleReportList[];
          student?: IScheduleReportList[];
          StudentList?: IScheduleReportList[];
      }
    | IScheduleReportList[];
