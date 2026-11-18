'use server';

import { api } from '@/lib/apiService';

export const getDocumentViewReportDetails = async () => {
    return await api.get<any>('admission', `/DocumentViewReportAdm/get_detail/`);
};

export const getDocumentViewReportStudent = async (data: any) => {
    return await api.post<any>(
        'admission',
        `/DocumentViewReportAdm/getstudent?ASMAY_Id=${data.asmaY_Id}&ASMCL_Id=${data.asmcL_Id}&ASMS_Id=${data.asmS_Id}`
    );
};

export const getDocumentViewReportData = async (data: any) => {
    return await api.post<any>(
        'admission',
        `/DocumentViewReportAdm/getreport?ASMAY_Id=${data.asmaY_Id}&ASMCL_Id=${data.asmcL_Id}&ASMS_Id=${data.asmS_Id}&AMST_Id=${data.AMST_Id}&STDORDOC=${data.STDORDOC}&SUBORNOT=${data.SUBORNOT}&AMSMD_Id=${data.AMSMD_Id}`
    );
};
