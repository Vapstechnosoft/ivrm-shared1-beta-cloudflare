export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    Selected?: boolean;
}

export interface ICourse {
    amcO_Id: number;
    courseName: string;
    Selected?: boolean;
}

export interface IBranch {
    amB_Id: number;
    branchName: string;
    Selected?: boolean;
}

export interface ISemester {
    amsE_Id: number;
    semesterName: string;
    Selected?: boolean;
}

export interface IBatch {
    acmB_Id: number;
    acmsN_SessionName: string;
    Selected?: boolean;
}

export interface IReligion {
    ivrmmR_Id: number;
    ivrmmR_Name: string;
    Selected?: boolean;
}

export interface ICasteCategory {
    imcC_Id: number;
    imcC_CategoryName: string;
}

export interface ICaste {
    imC_Id: number;
    imC_CasteName: string;
}

export interface ICountry {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
    ivrmmC_Nationality: string;
    Selected?: boolean;
}

export interface IState {
    ivrmmS_Id: number;
    ivrmmS_Name: string;
}

export interface IStudentCategory {
    amcoC_Id: number;
    amcoC_Name: string;
    Selected?: boolean;
}

export interface IQuota {
    acQ_Id: number;
    acQ_QuotaName: string;
}

export interface IQuotaCategory {
    acqC_Id: number;
    acqC_CategoryName: string;
}

export interface ISubjectScheme {
    acsS_Id: number;
    acsS_SchmeName: string;
}

export interface ISchemeType {
    acsT_Id: number;
    acsT_SchmeType: string;
}

export interface IReference {
    pamR_Id: number;
    pamR_ReferenceName: string;
    Selected?: boolean;
}

export interface ISource {
    pamS_Id: number;
    pamS_SourceName: string;
    Selected?: boolean;
}

export interface ISection {
    acmS_Id: number;
    acmS_SectionName: string;
    Selected?: boolean;
}

export interface IPreviousSchoolDetail {
    acstpS_PrvSchoolName: string;
    acstpS_PreviousRegNo: string;
    acstpS_PreSchoolType: string;
    acstpS_PreviousClass: string;
    acstpS_PreviousMarks: string;
    acstpS_PreviousMaxMarks: string;
    acstpS_PreviousPer: string;
    acstpS_PassingYear: string;
    acstpS_PreviousBoard: string;
}

export interface IMobileNumber {
    acstsmS_CountryCode: string;
    amcsT_MobileNo: string;
}

export interface IEmailId {
    amcsT_emailId: string;
}

export interface ICollegeAdmissionInitialData {
    allAcademicYear: IAcademicYear[];
    courses: ICourse[];
    branches: IBranch[];
    semesters: ISemester[];
    batches: IBatch[];
    allReligion: IReligion[];
    allcasteCategory: ICasteCategory[];
    allCaste: ICaste[];
    allcountry: ICountry[];
    allcountrycode: any[];
    studentCategory: IStudentCategory[];
    quotas: IQuota[];
    quotaCategory: IQuotaCategory[];
    subjectScheme: ISubjectScheme[];
    schemeType: ISchemeType[];
    allRefrence: IReference[];
    allSources: ISource[];
    sectionlist: ISection[];
    studentList?: any[];
    boardList?: any[];
    schooltypelist?: any[];
    documentList?: any[];
    combinationlist?: any[];
    mastersectionlist?: ISection[];
    compExamarray?: any[];
    compSubarray?: any[];
    studentcurrenrtbranch?: any[];
}

export interface ICollegeAdmissionFormState {
    // Student Details
    AMCST_AdmNo?: string;
    AMCST_RegistrationNo?: string;
    AMCST_FirstName: string;
    AMCST_MiddleName?: string;
    AMCST_LastName?: string;
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMB_Id: number;
    AMCST_Date: Date;
    AMCST_DOB: Date;
    AMCST_DOBin_words?: string;
    IMCC_Id: number;
    IMC_Id: number;
    AMCST_StudentSubCaste?: string;
    AMCST_StuBankAccNo?: string;
    AMCST_BirthPlace?: string;
    AMCST_BirthCertNo?: string;
    AMCST_StuCasteCertiNo?: string;
    amsT_BiometricId?: string;
    amsT_RFCardNo?: string;
    AMCST_District?: string;
    ACMS_Id: number;
    AMCST_Age: number;
    AMCST_Sex: string;
    AMCST_MotherTongue?: string;
    IVRMMR_Id: number;
    AMCST_Nationality: string;
    AMCST_AadharNo?: string;
    AMCST_BloodGroup?: string;
    AMCOC_Id: number;
    ACQ_Id: number;
    ACQC_Id: number;
    ACSS_Id: number;
    ACST_Id: number;
    AMCST_BPLCardFlag?: boolean;
    AMCST_BPLCardNo?: string;
    AMCST_StuBankIFSCCode?: string;
    AMCST_TPINNO?: string;
    AMCST_Village?: string;
    AMCST_Taluk?: string;
    AMCST_Urban_Rural?: string;
    AMCST_Divyangjan?: boolean;

    // Address
    AMCST_PerStreet: string;
    AMCST_PerArea?: string;
    IVRMMC_Id: number;
    AMCST_PerState: number;
    AMCST_PerCity: string;
    AMCST_PerPincode: string;
    AMCST_ConStreet: string;
    AMCST_ConArea?: string;
    AMCST_ConCountryId: number;
    AMCST_ConState: number;
    AMCST_ConCity: string;
    AMCST_ConPincode: string;

    // Parents
    AMCST_FatherName: string;
    AMCST_FatherSurname?: string;
    AMCST_FatherAadharNo?: string;
    AMCST_FatherEducation?: string;
    AMCST_FatherOfficeAdd?: string;
    AMCST_FatherOccupation?: string;
    AMCST_FatherDesignation?: string;
    AMCST_FatherBankAccNo?: string;
    AMCST_FatherBankIFSCCode?: string;
    AMCST_FatherCasteCertiNo?: string;
    AMCST_FatherNationality: number;
    AMCST_FatherMonIncome?: string;
    AMCST_FatherAnnIncome?: string;

    AMCST_MotherName: string;
    AMCST_MotherSurname?: string;
    AMCST_MotherAadharNo?: string;
    AMCST_MotherEducation?: string;
    AMCST_MotherOfficeAdd?: string;
    AMCST_MotherOccupation?: string;
    AMCST_MotherDesignation?: string;
    AMCST_MotherBankAccNo?: string;
    AMCST_MotherBankIFSCCode?: string;
    AMCST_MotherCasteCertiNo?: string;
    AMCST_MotherNationality: number;
    AMCST_MotherMonIncome?: string;
    AMCST_MotherAnnIncome?: string;

    // Arrays
    mobilesstd: IMobileNumber[];
    emailsstd: IEmailId[];
    mobiles: any[]; // Father mobiles
    emails: any[]; // Father emails
    mobiles1: any[]; // Mother mobiles
    emails1: any[]; // Mother emails
    prevSchoolDetails: IPreviousSchoolDetail[];
}
