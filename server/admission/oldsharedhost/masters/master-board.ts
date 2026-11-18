'use server';

import { api } from '@/lib/apiService';

export async function getMasterBoardData() {
    return await api.get<any>('admission', `/MasterBoardandSchoolType/getAllDetails`);
}

export async function saveMasterBoard(data: {
    ivrmmB_Id: number;
    ivrmmB_Name: string;
    ivrmmB_Description: string;
}) {
    return await api.post<any>('admission', `/MasterBoardandSchoolType/savedet`, data);
}

export async function getMasterBoardDetails(id: number) {
    return await api.post<any>('admission', `/MasterBoardandSchoolType/Editdetails?IVRMMB_Id=${id}`);
}

export async function deleteMasterBoard(id: number) {
    return await api.post<any>('admission', `/MasterBoardandSchoolType/deleterec?IVRMMB_Id=${id}`);
}
