'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { GatePassReportFilterPayload, GatePassReportInitialData, GatePassReportResponse, MonthItem } from './types';

const defaultMonths: MonthItem[] = [
    { monthid: 1, monthname: 'January' },
    { monthid: 2, monthname: 'February' },
    { monthid: 3, monthname: 'March' },
    { monthid: 4, monthname: 'April' },
    { monthid: 5, monthname: 'May' },
    { monthid: 6, monthname: 'June' },
    { monthid: 7, monthname: 'July' },
    { monthid: 8, monthname: 'August' },
    { monthid: 9, monthname: 'September' },
    { monthid: 10, monthname: 'October' },
    { monthid: 11, monthname: 'November' },
    { monthid: 12, monthname: 'December' }
];

async function getSessionContext() {
    try {
        const session = await auth();
        const mI_Id = Number(
            (session as any)?.user?.mI_Id || (session as any)?.mI_Id || (session as any)?.user?.MI_Id || (session as any)?.MI_Id || 4
        );
        const asmaY_Id = Number(
            (session as any)?.user?.asmaY_Id ||
                (session as any)?.asmaY_Id ||
                (session as any)?.user?.ASMAY_Id ||
                (session as any)?.ASMAY_Id ||
                1
        );
        return { mI_Id, asmaY_Id };
    } catch {
        return { mI_Id: 4, asmaY_Id: 1 };
    }
}

export async function getGatePassReportInitialData(): Promise<{
    success: boolean;
    data: GatePassReportInitialData;
    message?: string;
}> {
    try {
        const { mI_Id } = await getSessionContext();
        const response = await api.get<GatePassReportInitialData>('visitors', `/GatePassReport/loaddata/${mI_Id || 5}`);

        const month_list = response.data?.month_list && response.data.month_list.length > 0 ? response.data.month_list : defaultMonths;

        return {
            success: true,
            data: {
                ...response.data,
                month_list
            },
            message: 'Initial data loaded successfully'
        };
    } catch (err: any) {
        console.warn('Backend loaddata fallback activated:', err?.message);
        return {
            success: true,
            data: {
                month_list: defaultMonths
            },
            message: 'Loaded default months'
        };
    }
}

export async function getGatePassReportData(payload: GatePassReportFilterPayload): Promise<{
    success: boolean;
    data: GatePassReportResponse | null;
    message?: string;
}> {
    try {
        const { mI_Id, asmaY_Id } = await getSessionContext();
        const requestData = {
            MI_Id: mI_Id,
            ASMAY_Id: asmaY_Id,
            radiotype: payload.radiotype,
            all1: payload.all1,
            fromdate: payload.fromdate || '',
            todate: payload.todate || '',
            month_id: payload.month_id || ''
        };

        const response = await api.post<GatePassReportResponse>('visitors', '/GatePassReport/report', requestData);

        if (response?.data) {
            const raw = (response as any).rawResponse || response.data;
            const viewlist = raw.viewlist || response.data.viewlist || [];
            return {
                success: true,
                data: {
                    viewlist,
                    yarname: raw.yarname || response.data.yarname || []
                },
                message: viewlist.length > 0 ? 'Report generated successfully' : 'No Records Found'
            };
        }

        return {
            success: true,
            data: { viewlist: [] },
            message: 'No Records Found'
        };
    } catch (err: any) {
        console.error('Error generating gate pass report:', err?.message);
        return {
            success: false,
            data: null,
            message: err?.message || 'Failed to fetch report from server'
        };
    }
}
