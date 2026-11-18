'use server';

import { type ApiResponse, api } from '@/lib/apiService';

/**
 * Get initial details for Over All View Report (Academic Years, etc.)
 * Calls CategoryWiseAttendance/getinitialdata
 */
export const getOverAllViewReportInitialDetails = async (): Promise<ApiResponse<any>> => {
    return api.get('admission', '/Smartcarddetails/getinitialdata');
};

export async function getOverAllViewReportData(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    stdmobilenumber: string; // Used for Regular/New radio
}) {
    const url = `/Smartcarddetails/searchdata?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&stdmobilenumber=${data.stdmobilenumber}`;
    return await api.post<any>('admission', url);
}
