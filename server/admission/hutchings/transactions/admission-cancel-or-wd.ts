'use server';

import { api } from '@/lib/apiService';

export async function on_load_admission_cancel() {
    return await api.get<any>('admission', '/StudentAdmissionFacade/OnLoadAdmissionCancel');
}

export async function on_change_admission_cancel_year(data: { ASMAY_Id: number }) {
    return await api.post<any>('admission', `/StudentAdmissionFacade/OnChangeAdmissionCancelYear?ASMAY_Id=${data.ASMAY_Id}`);
}

export async function on_change_admission_cancel_student(data: {
    ASMAY_Id: number;
    AMST_Id: number;
}) {
    return await api.post<any>(
        'admission',
        `/StudentAdmissionFacade/OnChangeAdmissionCancelStudent?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`
    );
}

export async function save_admission_cancel_student(data: {
    aacA_Id: number;
    amsT_Id: number;
    asmaY_Id: number;
    aacA_ACDate: string;
    aacA_ACReason: string;
    aacA_CancellationFee: number;
    aacA_ToRefundAmount: number;
}) {
    return await api.post<any>('admission', '/StudentAdmissionFacade/SaveAdmissionCancelStudent', data);
}

export async function edit_admission_cancel_student(data: {
    AACA_Id: number;
    AMST_Id: number;
    ASMAY_Id: number;
}) {
    return await api.post<any>(
        'admission',
        `/StudentAdmissionFacade/EditAdmissionCancelStudent?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}&AACA_Id=${data.AACA_Id}`
    );
}
