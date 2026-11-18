'use server';

import { api } from '@/lib/apiService';

export async function getSrkvsAddressBookLoadData() {
    const res = await api.get<any>('admission', '/StudentAddressBook2/getinitialdata');
    return res?.data || res;
}

export async function changeYearSrkvsAddressBook(data: { ASMAY_Id: number; flag: string }) {
    const url = `/StudentAddressBook2/yearchangenew?ASMAY_Id=${data.ASMAY_Id}&flag=${data.flag}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function changeClassSrkvsAddressBook(data: { ASMAY_Id: number; flag: string; ASMCL_Id: number }) {
    const url = `/StudentAddressBook2/classchangenew?ASMAY_Id=${data.ASMAY_Id}&flag=${data.flag}&ASMCL_Id=${data.ASMCL_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function changeSectionSrkvsAddressBook(data: { ASMAY_Id: number; flag: string; ASMCL_Id: number; ASMS_Id: number }) {
    const url = `/StudentAddressBook2/sectionchangenew?ASMAY_Id=${data.ASMAY_Id}&flag=${data.flag}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function getSrkvsAddressBookReport(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    amsT_Id?: number;
    flag: string;
    sall: string;
    studentlisttemp: any[];
}) {
    const res = await api.post<any>('admission', '/StudentAddressBook2/getdetailsnew', data);
    return res?.data || res;
}
