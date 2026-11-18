export interface Category {
    ttmC_Id: number;
    ttmC_CategoryName: string;
}

export interface Subject {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export interface Class {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface Section {
    asms_Id: number;
    asms_SectionName: string;
}

export interface Staff {
    hrmE_Id: number;
    staffName: string;
}

export interface StaffReplacementExistingToNewMasters {
    categories: Category[];
    classes: Class[];
    staff: Staff[];
    subjects: Subject[];
}

export interface StaffReplacementGridData {
    ttmC_CategoryName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    hrmE_EmployeeFirstName: string;
    ismS_SubjectName: string;
    ttmP_PeriodName: string;
}

export interface StaffReplacementGridResponse {
    success: boolean;
    message: string;
    data: StaffReplacementGridData[];
    total: number;
    page: number;
    page_size: number;
}
