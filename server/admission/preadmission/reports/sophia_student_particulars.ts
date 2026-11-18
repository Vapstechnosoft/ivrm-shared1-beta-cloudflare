'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentParticularsLoadData() {
    const url = '/DOBcertificate/getdata';
    return await api.get<any>('admission', url);
}

export async function getSophiaStudentParticularsStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
}) {
    const url = `/DOBcertificate/getstudbyclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}`;
    return await api.post<any>('admission', url);
}

export async function getSophiaStudentParticularsReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMC_Id: number;
    giftedtalented: { admmT_Id: number }[];
}) {
    const url = '/DOBcertificate/getStudData';
    return await api.post<any>('admission', url, data);
}
