export interface ICollegeCasteCategory {
    imcC_Id: number;
    imcC_CategoryName: string;
    imcC_CategoryDesc: string;
    imcC_ActiveFlag?: boolean;
}

export interface ICollegeMasterCaste {
    iC_Id: number;
    imcC_Id: number;
    iC_CasteName: string;
    iC_CasteDesc: string;
    categoryName?: string;
    imcC_CategoryName?: string;
    imC_Id?: number;
    imC_CasteName?: string;
    imC_CasteDesc?: string;
}

export interface ICollegeMasterCasteCategoryDropdown {
    imcC_Id: number;
    imcC_CategoryName: string;
    selected?: boolean;
}

export interface IClgMasterCourseCategoryMap {
    amcocM_Id: number;
    amcO_Id: number;
    amcoC_Id: number;
    amcO_CourseName?: string;
    amcoC_Name?: string;
    amcocM_ActiveFlg?: boolean;
}

export interface IClgMasterCourseBranchMap {
    amcobM_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amcobM_Code?: string;
    amcobM_CBCSFlg?: number;
    amcobM_CBCSIntroYear?: number | string;
    amcobM_ElectiveFlg?: number;
    amcobM_ElectiveIntroYear?: number | string;
    amcobM_FileName?: string;
    amcobM_FilePath?: string;

    // Virtual fields
    amcO_CourseName?: string;
    amB_BranchName?: string;
    amcobM_ActiveFlg?: boolean;
}

export interface IClgMasterBatch {
    acmB_Id: number;
    acmsN_SessionName: string;
    acmnS_Order: number | string;
    acmsN_ActiveFlag?: boolean;
}

export interface IClgMasterBranch {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode: string;
    amB_BranchInfo: string;
    amB_BranchType: string;
    amB_Order: number | string;
    amB_StudentCapacity: number | string;
    amB_AidedUnAided: string;
    amB_ActiveFlag?: boolean;
}

export interface IClgMasterCategory {
    amcoC_Id: number;
    amcoC_Name: string;
    amcoC_Address: string;
    acmC_RegNoPrefix: string;
    amcoC_Details: string;
    amcoC_Type: string;
    acmC_ActiveFlag?: boolean;
}

export interface IMasterCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode: string;
    amcO_CourseInfo: string;
    amcO_NoOfYears: number | string;
    amcO_NoOfSemesters: number | string;
    amcO_Order: number | string;
    amcO_MinAttPer: number;
    amcO_RegFeeFlg: boolean;
    amcO_CourseFlag: boolean;
    amcO_FeeAplFlg: boolean;
    amcO_ActiveFlag?: boolean | number;
}

export interface IMasterQuota {
    acQ_Id: number;
    acQ_QuotaName: string;
    acQ_QuotaCode: string;
    acQ_QuotaInfo: string;
    acQ_ActiveFlg?: boolean;
}

export interface IMasterQuotaCategory {
    acqC_Id: number;
    acqC_CategoryName: string;
    acqC_CategoryCode: string;
    acqC_CategoryInfo: string;
    acqC_ActiveFlg?: boolean;
    checkedsub?: boolean;
}

export interface IMasterQuotaCategoryMapping {
    acqcM_Id: number;
    acQ_Id: number;
    acqC_Id: number;
    acQ_QuotaName?: string;
    acqC_CategoryName?: string;
    acqcM_ActiveFlg?: boolean;
}

export interface IClgSubjectSchemeType {
    acsT_Id: number;
    acsT_SchmeType: string;
    acsT_ActiveFlg?: boolean;
}

export interface IClgSubjectSchemeName {
    acsS_Id: number;
    acsS_SchmeName: string;
    acsT_ActiveFlg?: boolean; // Legacy code seems to share the active flag logic or name
}

export interface IClgMasterCombination {
    admcB_ID: number;
    admcB_NAME: string;
    admcB_Activeflag?: boolean;
}

export interface IClgMasterSection {
    acmS_Id: number;
    acmS_SectionName: string;
    acmS_SectionCode: string;
    acmS_Order: number;
    acmS_MaxCapacity: number;
    acmS_ActiveFlag?: number;
}

export interface IClgMasterSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMCode: string;
    amsE_SEMInfo: string;
    amsE_SEMTypeFlag: string;
    amsE_SEMOrder: number;
    amsE_Year: number;
    amsE_EvenOdd: string;
    amsE_ActiveFlg?: boolean;
}

export interface IBranchChange {
    acscoB_Id: number;
    amcsT_Id: number;
    sName?: string;
    amcsT_Name?: string;
    amcO_CourseName?: string;
    amB_BranchName?: string;
    newBranch?: string;
    acscoB_COBFees?: number | string;
    acscoB_OldRegNo?: string;
    acscoB_NewRegNo?: string;
    acscoB_Remarks?: string;
    acscoB_ActiveFlag?: boolean | number;
    acscoB_COBDate?: string;
}
