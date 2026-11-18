export interface labConstraints {
    ttfG_Id: number; //AcademicYear
    asmaY_Year: string; //AcademicYear

    ttmC_Id: number; //category
    ttmC_CategoryName: string; //category

    asmcL_Id: number; //class
    asmcL_ClassName: string; //class

    asms_Id: number; //section
    asms_SectionName: string; //section

    hrmE_Id: number; //staff
    staffName: string; //staff

    ismS_Id: number; //subject
    ismS_SubjectName: string; //subject

    categoryName: string;
    asmayYear: string;
    ttlaB_LABLIBName: string;
    ttlaB_ActiveFlag: boolean;
    ttlaB_Id: number;
}
