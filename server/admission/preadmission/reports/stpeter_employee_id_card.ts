'use server';

import { api } from '@/lib/apiService';

export async function getStpeterEmployeeIdCardLoadData() {
    return await api.get<any>('admission', '/EmployeeProfileReport/onloadgetdetails');
}

export async function getStpeterDepts(data: { hrmgT_IdList: number[] }) {
    return await api.post<any>('admission', '/EmployeeProfileReport/get_depts', data);
}

export async function getStpeterDesig(data: { hrmgT_IdList: number[]; hrmD_IdList: number[] }) {
    return await api.post<any>('admission', '/EmployeeProfileReport/get_desig', data);
}

export async function filterStpeterEmployees(data: {
    hrmgT_IdList: number[];
    hrmD_IdList: number[];
    hrmdeS_IdList: number[];
}) {
    return await api.post<any>('admission', '/EmployeeProfileReport/filterEmployeedetailsBySelection', data);
}

export async function getStpeterEmployeeDetails(data: { hrmE_multiId: number[] }) {
    return await api.post<any>('admission', '/EmployeeProfileReport/getEmployeedetailsBySelection', data);
}
