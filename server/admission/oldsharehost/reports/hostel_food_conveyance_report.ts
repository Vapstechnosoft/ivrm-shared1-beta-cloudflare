'use server';

import { api } from '@/lib/apiService';

export async function getHostelFoodConveyanceReportInitialDetails() {
    const url = `/HostelFoodConveyanceReport/getloaddata`;
    return await api.get<any>('admission', url);
}

export async function getHostelFoodConveyanceReport(data: any) {
    const asmsId = data.ASMS_Id || data.ASMC_Id;
    const url = `/HostelFoodConveyanceReport/getStudData?HFC_Flag=${data.HFC_Flag}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${asmsId}`;
    return await api.post<any>('admission', url);
}
