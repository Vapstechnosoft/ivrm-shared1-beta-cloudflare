/**
 * Common dropdown item structure from MasterDropDown APIs
 */
export interface DropdownItem {
    key: number;
    value: string;
}

/**
 * Group Type item from /api/MasterDropDown/GroupType
 */
export interface GroupTypeItem extends DropdownItem {}

/**
 * Department item from /api/MasterDropDown/department_drop_down_by_group_Type/{hrmgt_ids}
 */
export interface DepartmentItem extends DropdownItem {}

/**
 * Designation item from /api/MasterDropDown/designations_drop_down_by_dept/{hrmd_ids}
 */
export interface DesignationItem extends DropdownItem {}

/**
 * Employee item from /api/MasterDropDown/employees_drop_down_by_dept_and_designation/{hrmd_ids}/{hrmdes_ids}
 */
export interface EmployeeItem extends DropdownItem {}

/**
 * Generic API response structure for MasterDropDown endpoints
 */
export interface MasterDropdownResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    total: number | null;
    page: number | null;
    page_size: number | null;
}
