'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data (Years, Classes, Sections)
 */
export async function getStudentTcInitialData() {
    const url = `/StudenttcReportcustom/getinitialdata`;
    const response = await api.get<any>('admission', url);
    return response.data || response;
}

/**
 * Fetches student list based on search criteria
 */
export async function getStudentTcStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMC_Id?: number;
}) {
    const url = `/StudenttcReportcustom/getstuddetails?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMC_Id=${data.ASMC_Id || 0}`;
    const response = await api.post<any>('admission', url);
    return response.data || response;
}

/**
 * Fetches full TC details for a student
 */
export async function getStudentTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
}) {
    const url = `/StudenttcReportcustom/getTCdata?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    const response = await api.post<any>('admission', url);
    return response.data || response;
}

/**
 * Fetches student list based on Academic Year change
 */
export async function getStudentTcACS(yearId: number) {
    const url = `/StudenttcReportcustom/getstudlist?ASMAY_Id=${yearId}`;
    const response = await api.post<any>('admission', url);
    return response.data || response;
}
