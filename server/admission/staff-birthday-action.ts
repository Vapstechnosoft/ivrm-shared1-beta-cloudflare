'use server';

import { api } from '@/lib/apiService';

// Helper to format date strings to YYYY-MM-DD
function formatDate(dateInput: any): string {
    if (!dateInput) return '';
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return String(dateInput);
    }
}

export async function getStaffBirthdayReportDetails(data: any) {
    const fromDate = data.Fromdate || data.fromdate || '';
    const toDate = data.Todate || data.todate || '';
    const months = data.months !== undefined ? data.months : data.Months !== undefined ? data.Months : 1;
    const all1 = data.all1 !== undefined ? data.all1 : data.All1 !== undefined ? data.All1 : 0;
    const loginType = data.Logintype || data.logintype || '';
    const moId = data.MO_Id || data.mo_id || data.mo_Id || data.MO_ID || 2;

    const params = new URLSearchParams();
    params.append('Fromdate', formatDate(fromDate));
    params.append('Todate', formatDate(toDate));
    if (loginType) {
        params.append('Logintype', loginType);
    }
    params.append('months', String(months));
    params.append('all1', String(all1));
    params.append('MO_Id', String(moId));

    const url = `/Staffbirthdayreport/getstaffdetails?${params.toString()}`;
    const res = await api.get<any>('admission', url, data);

    if (res && res.data) {
        const staffList = res.data.staffList || res.data.staffDetails || [];
        const count = res.data.count !== undefined ? res.data.count : staffList.length;

        const mappedStaffList = staffList.map((staff: any) => ({
            ...staff,
            HRME_Id: staff.HRME_Id || staff.hrmE_Id || staff.hrme_id,
            HRME_EmployeeCode: staff.HRME_EmployeeCode || staff.hrmE_EmployeeCode || staff.hrme_employeecode,
            HRME_EmployeeFirstName: staff.HRME_EmployeeFirstName || staff.hrmE_EmployeeFirstName || staff.hrme_employeefirstname,
            HRMD_DepartmentName: staff.HRMD_DepartmentName || staff.hrmD_DepartmentName || staff.hrmd_departmentname,
            HRMDES_DesignationName: staff.HRMDES_DesignationName || staff.hrmdeS_DesignationName || staff.hrmdes_designationname,
            HRME_DOB: staff.HRME_DOB || staff.hrmE_DOB || staff.hrme_dob
        }));

        return {
            ...res,
            count,
            staffDetails: mappedStaffList
        };
    }

    return res;
}
