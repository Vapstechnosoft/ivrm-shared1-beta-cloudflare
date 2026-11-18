export interface RequisitionReport {
    mI_Id: number;
    mI_Name: string;

    pcreqtN_Id: number;
    pcreqtN_RequisitionNo: string;
    pcreqtN_DepartmentId: number;
    departmentname: string;
    pcreqtN_RequestedBy: number;
    employeename: string;
    pcreqtN_CreatedDate: string;
    pcreqtN_Purpose: string;
}
