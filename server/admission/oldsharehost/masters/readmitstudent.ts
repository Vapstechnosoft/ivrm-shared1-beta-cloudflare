'use server';

import { api } from '@/lib/apiService';

export async function getReadmitStudentDetails() {
    return await api.get<any>('admission', `/ReadmitStudent/GetDropDownList`);
}

export async function getStudentListByYearAndClass(data: any) {
    return await api.post<any>(
        'admission',
        `/ReadmitStudent/GetstudentdetailsbyYearandclass?ASMAY_Id=${data.AMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`
    );
}

export async function getNewJoinList(data: any) {
    return await api.post<any>(
        'admission',
        `/ReadmitStudent/getnewjoinlist?ASMAY_Id_New=${data.AMAY_Id_New}&ASMCL_Id_New=${data.ASMCL_Id_New}&ASMS_Id_New=${data.ASMS_Id_New}`
    );
}

export async function saveReadmitStudent(data: any) {
    return await api.post<any>('admission', `/ReadmitStudent/savereadmit_student`, data);
}
