export interface IRegisterReportClg {
    name: string;
    user_name?: string;
    email_Id?: string;
    email_id?: string;
    mob_No?: string;
    mob_no?: string;
    created_Date?: string | Date;
    created_date?: string | Date;
}

export interface IMasterCompanyClg {
    companyname: string;
    mI_Id: number;
    logo: string;
}

export interface IAcademicYearClg {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IDocumentViewClgDoc {
    filetype: string;
    amsmD_DocumentName: string;
    document_Path: string;
}

export interface IDocumentViewClgStudent {
    pacA_Id: number;
    name: string;
    pacA_RegistrationNo: string;
    classname: string;
    pacA_StudentPhoto?: string;
    doclist?: IDocumentViewClgDoc[];
}

export interface IAcademicCourseClg {
    amcO_Id: number;
    amcO_CourseName: string;
}

export interface IAcademicBranchClg {
    amB_Id: number;
    amB_BranchName: string;
}

export interface IAcademicSemesterClg {
    amsE_Id: number;
    amsE_SEMName: string;
}

