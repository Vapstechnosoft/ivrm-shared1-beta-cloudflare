'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for BBHS Student TC Report (Years, Classes, etc.)
 */
export async function getBbhsStudentTcInitialData() {
    const url = '/StudenttcReportcustom/getinitialdata';
    const response = await api.get<any>('admission', url);
    return response.data || response;
}

/**
 * Fetches student list based on radio selection (Adm No or Name)
 */
export async function getBbhsStudentTcStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMC_Id?: number;
}) {
    const url = `/StudenttcReportcustom/getstuddetails?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMC_Id=${data.ASMC_Id || 0}`;
    const response = await api.post<any>('admission', url);
    return response.data || response;
}

/**
 * Fetches full TC details for a specific student
 */
export async function getBbhsStudentTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
}) {
    const url = `/StudenttcReportcustom/getTCdata?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    const response = await api.post<any>('admission', url);
    return response.data || response;
}

/**
 * Fetches student list based on Academic Year
 */
export async function getBbhsStudentTcACS(yearId: number) {
    const url = `/StudenttcReportcustom/getstudlist?ASMAY_Id=${yearId}`;
    const response = await api.post<any>('admission', url);
    return response.data || response;
}
