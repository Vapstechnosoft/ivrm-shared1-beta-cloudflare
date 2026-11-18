export interface IPcRequisition {
    departmentname: string;
    employeename: string;
    pcreqtN_ActiveFlg: boolean;
    pcreqtN_Date: Date;
    pcreqtN_Purpose: string;
    pcreqtN_Id: number;
    pcreqtN_RequisitionNo: string;
    pcreqtN_CreatedDate: Date;
}

export interface IDepartmentName {
    hrmD_DepartmentName: string;
    hrmD_Id: number;
    mI_Id: number;
    hrmD_Order: number;
    hrmD_ActiveFlag: boolean;
    hrmD_InternalTrainingMinimumHrs: number;
    createdDate: Date;
    updatedDate: Date;
}
export interface IEmployeeName {
    empname: string;
    hrmE_Id: number;
}
