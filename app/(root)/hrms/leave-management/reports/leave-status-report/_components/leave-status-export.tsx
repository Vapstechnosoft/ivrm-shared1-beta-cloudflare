import { exportToExcel } from '@/lib/export-to-file';

export const exportLeaveStatusReport = (reportData: any) => {
    if (!reportData || reportData.length === 0) {
        return false;
    }

    const processedContent = reportData.map((row: any, index: number) => {
        return {
            sl_no: index + 1,
            employee_code: row.hrmE_EmployeeCode || '',
            employee_name: row.hrmE_EmployeeName || '',
            leave_type: row.hrmL_LeaveName || '',
            total_leaves: row.hrelS_TotalLeaves !== undefined ? row.hrelS_TotalLeaves : '',
            leaves_used: row.hrelS_TransLeaves !== undefined ? row.hrelS_TransLeaves : 0,
            leave_balance: row.hrelS_CBLeaves !== undefined ? row.hrelS_CBLeaves : ''
        };
    });

    const safeColumns = [
        { label: 'Sl.No', value: 'sl_no' },
        { label: 'Employee Code', value: 'employee_code' },
        { label: 'Employee Name', value: 'employee_name' },
        { label: 'Leave Type', value: 'leave_type' },
        { label: 'Total Leaves', value: 'total_leaves' },
        { label: 'Leaves Used', value: 'leaves_used' },
        { label: 'Leave Balance', value: 'leave_balance' }
    ];

    exportToExcel('LeaveStatusReport', JSON.stringify(safeColumns), JSON.stringify(processedContent));

    return true;
};
