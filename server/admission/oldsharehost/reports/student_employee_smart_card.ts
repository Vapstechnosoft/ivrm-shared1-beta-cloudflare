'use server';

import { api } from '@/lib/apiService';

export async function getStudentEmployeeSmartCardInitialDetails() {
    const url = `/StudentAddressBook2/getinitialdata`;
    return await api.get<any>('admission', url);
}

export async function getStudentEmployeeSmartCardReport(data: any) {
    const url = `/StudentAddressBook2/getdetailsstdemp?flag=${data.flag}&ASMAY_Id=${data.asmaY_Id}&ASMCL_Id=${data.asmcL_Id}&ASMS_Id=${data.asmC_Id}`;
    return await api.post<any>('admission', url, {});
}
