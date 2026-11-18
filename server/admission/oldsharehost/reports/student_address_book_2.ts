'use server';

import { api } from '@/lib/apiService';

export async function getStudentAddressBook2InitialData() {
    const url = `/StudentAddressBook2/getinitialdata`;
    return await api.get<any>('admission', url);
}

export async function studentAddressBook2YearChange(data: any) {
    const url = `/StudentAddressBook2/yearchange?flag=${data.flag}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function studentAddressBook2SectionChange(data: any) {
    const url = `/StudentAddressBook2/sectionchange?flag=${data.flag}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getStudentAddressBook2Report(data: any) {
    const url = `/StudentAddressBook2/getdetails?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&AMST_Id=${data.AMST_Id}&sall=${data.sall}&flag=${data.flag}`;
    return await api.post<any>('admission', url, {});
}
