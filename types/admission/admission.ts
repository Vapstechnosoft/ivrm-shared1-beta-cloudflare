export interface IadmissionAcademicYear {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Cut_Of_Date: string;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_TransportSDate: string | null;
    asmaY_TransportEDate: string | null;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_ReferenceDate: string | null;
    asmaY_AcademicYearCode: string;
    asmaY_AdvanceFeeDate: string | null;
    asmaY_RegularFeeFDate: string | null;
    asmaY_RegularFeeTDate: string | null;
    asmaY_ArrearFeeDate: string | null;
    createdDate: string;
    updatedDate: string;
}

export interface IadmissionReligion {
    ivrmmR_Id: number;
    ivrmmR_ReligionName: string;
    ivrmmR_Name?: string; // Compatibility alias
}

export interface IadmissionCasteCategory {
    imcC_Id: number;
    imcC_CategoryName: string;
}

export interface IadmissionCaste {
    imC_Id: number;
    imC_CasteName: string;
    imcC_Id: number;
    ivrmmR_Id?: number; // Related religion ID
}

export interface IadmissionCountry {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
    ivrmmC_ZipNoLength?: number;
    ivrmmC_CountryCode?: string;
}

export interface IadmissionState {
    ivrmmS_Id: number;
    ivrmmS_Name: string;
    ivrmmC_Id: number;
}

export interface IadmissionSource {
    pamS_Id: number;
    pamS_SourceName: string;
}

export interface IadmissionReference {
    pamR_Id: number;
    pamR_ReferenceName: string;
}

export interface IadmissionMonth {
    ivrmmM_Id: number;
    ivrmmM_MonthName: string;
}

export interface IadmissionClass {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassName: string;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_Order: number;
    asmcL_ClassCode: string;
    asmcL_ActiveFlag: boolean;
    asmcL_MaxCapacity: number;
    asmcL_PreadmFlag: number;
    asmcL_StreamFlg: boolean | null;
    asmcL_CreatedBy: number | null;
    asmcL_UpdatedBy: number | null;
    createdDate: string;
    updatedDate: string;
}

export type IadmissionClassDropdown = IadmissionClass;

export interface IadmissionFormDetails {
    academicYearOnLoad: IadmissionAcademicYear[];
    allAcademicYear: IadmissionAcademicYear[];
    allClass: IadmissionClass[];
    allGender: any[];
    allNationality: IadmissionCountry[];
    allReligion: IadmissionReligion[];
    allCasteCategory: IadmissionCasteCategory[];
    allCaste: IadmissionCaste[];
    allCountry: IadmissionCountry[];
    allState: IadmissionState[];
    vpre_allCountry: IadmissionCountry[];
    vpre_allState: IadmissionState[];
    vpre_allCasteCategory: IadmissionCasteCategory[];
    allMonths: IadmissionMonth[];
    allMonths_vaps: IadmissionMonth[];
    admissionConfiguration: any;
    allLocation: any[];
    allReference: IadmissionReference[];
    allSources: IadmissionSource[];
    allCity: any[];
    allSubjectGroup: IadmissionSubjectGroup[];
    allExam: IadmissionCompetitiveExam[];
    allStreams: IadmissionStream[];
    stfDetails: any[];
    allCompSubject: any[];
    documentList?: any[];
}

export interface IadmissionStudentApplicationList {
    amsT_Id: number;
    studentName: string;
    className: string;
    sectionName?: string;
    admissionDate: string;
    gender: string;
    registrationNo: string;
    admissionNo: string;
    emailId: string;
    mobileNo: string;
    status: string | null;
    photoUrl: string;
    isActive: boolean;
}

export interface IadmissionStream {
    asmsT_Id: number;
    asmsT_StreamName: string;
}

export interface IadmissionCompetitiveExam {
    asmcE_Id: number;
    asmcE_CompetitiveExamName: string;
}

export interface IadmissionSubjectGroup {
    emG_Id: number;
    emG_GroupName: string;
    electivelist?: IadmissionSubject[];
}

export interface IadmissionSubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    selected?: boolean;
}
