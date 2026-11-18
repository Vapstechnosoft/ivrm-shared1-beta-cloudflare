'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export interface IPDAHeadWiseReportParams {
    ASMAY_Id: number;
    PDAMH_ID: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    From_Date: string;
    To_Date: string;
    active: number;
    deactive: number;
    left: number;
}

export async function getPDAHeadWiseInitialData() {
    const session = await auth();
    const mi_id = session?.mi_id || 2;
    // According to Angular code: pageid = 2; getalldetails
    const url = `/PDAHeadWiseReport/getalldetails/2`;
    return await api.get<any>('pettycashandassettracking', url);
}

export async function getPDAHeadWiseReportData(data: IPDAHeadWiseReportParams) {
    const url = `/PDAHeadWiseReport/radiobtndata`;
    return await api.post('pettycashandassettracking', url, data);
}
