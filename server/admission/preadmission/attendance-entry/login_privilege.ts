'use server';

import { api } from '@/lib/apiService';
import type { ILoginPrivilegeDTO } from '@/types/admission/preadmission/login_privilege';

const CONTROLLER = 'LoginPrivelege';

export const saveLoginPrivilege = async (data: ILoginPrivilegeDTO): Promise<any> => {
    const url = `/${CONTROLLER}/SaveLoginPrivilege`;
    return api.post('admission', url, data);
};

export const deleteLoginPrivilege = async (id: number): Promise<any> => {
    const url = `/${CONTROLLER}/DeleteAttPrivileges?id=${id}`;
    return api.delete('admission', url);
};

export const getEmployeeData = async (data: any): Promise<any> => {
    const url = `/${CONTROLLER}/GetEmployeeData`;
    return api.post('admission', url, data);
};

export const getEditData = async (data: { ASALU_Id: number; ASALUC_Id: number; ASALUCS_Id: number }): Promise<any> => {
    const queryParams = new URLSearchParams(data as any).toString();
    const url = `/${CONTROLLER}/GetEditData?${queryParams}`;
    return api.post('admission', url, {});
};

export const getDataByTypeSelected = async (data: any): Promise<any> => {
    const queryParams = new URLSearchParams(data).toString();
    const url = `/${CONTROLLER}/GetDataByTypeSelected?${queryParams}`;
    return api.post('admission', url, {});
};

export const getStaffWiseGrid = async (entryType: number, hrmeId: number): Promise<any> => {
    const queryParams = `ASALU_EntryTypeFlag=${entryType}&HRME_Id=${hrmeId}`;
    const url = `/${CONTROLLER}/GetStaffWiseGrid?${queryParams}`;
    return api.post<any>('admission', url, {});
};

export const deleteAttPrivileges = async (asalucId: number, asalucsId: number): Promise<any> => {
    const queryParams = `ASALUC_Id=${asalucId}&ASALUCS_Id=${asalucsId}`;
    const url = `/${CONTROLLER}/DeleteAttPrivileges?${queryParams}`;
    return api.delete('admission', url);
};
