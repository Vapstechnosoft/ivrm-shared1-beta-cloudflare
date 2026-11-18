'use server';

import { api } from '@/lib/apiService';

export async function getMigrationLoadData() {
    return await api.get<any>('admission', '/HHSStudyCertificate/getdetails/');
}

export async function getMigrationStudentStatusChange(data: {
    AMST_SOL: string;
}) {
    return await api.post<any>('admission', `/HHSStudyCertificate/getstudentlist?AMST_SOL=${data.AMST_SOL}`, {});
}

export async function getMigrationAcademicYearChange(data: {
    ASMAY_Id: number;
    AMST_SOL: string;
}) {
    const url = `/HHSStudyCertificate/onacademicyearchange?AMST_SOL=${data.AMST_SOL}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getMigrationSearchFilter(data: {
    filterinitialdata: string;
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    allorindid: string;
}) {
    const url = `/HHSStudyCertificate/searchfilter?AMST_SOL=${data.AMST_SOL}&allorindid=${data.allorindid}&searchfilter=${data.searchfilter}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMC_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getMigrationStudDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    save_flag: string;
}) {
    const url = `/HHSStudyCertificate/MigrationCertificateStuddetails?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMC_Id}&save_flag=${data.save_flag}`;
    return await api.post<any>('admission', url, {});
}
