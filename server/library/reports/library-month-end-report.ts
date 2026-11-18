'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ILibraryMonthEndReportInitialData, ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';

const FACADE = 'LibraryMonthEndReport';

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getLibraryMonthEndReportInitialData() {
    let response: any;
    try {
        response = await api.get<any>('library', `${FACADE}/montheendreport_getdetails`);
    } catch {
        try {
            response = await api.get<any>('library', `${FACADE}/monthendreport_getdetails`);
        } catch {
            response = await api.post<any>('library', `${FACADE}/montheendreport_getdetails`, {});
        }
    }

    // Robust parsing for nested data objects
    const data = response?.data?.data || response?.data || response;

    return {
        acdlist: extractList(data.acdlist || data.yearlist || []),
        monthlist: extractList(data.monthlist || []),
        msterliblist1: extractList(data.alldata || data.msterliblist1 || data.lib_list || data.libraryList || [])
    } as ILibraryMonthEndReportInitialData;
}

export async function getLibraryMonthEndReportSearch(data: ILibraryMonthEndReportRequest) {
    const session = await auth();
    const miId = session?.mi_id ?? 30;

    const queryParams = new URLSearchParams();
    queryParams.set('LMRA_Id', String(data.LMRA_Id ?? 0));
    queryParams.set('ASMAY_Id', String(data.ASMAY_Id));
    queryParams.set('year', String(data.year));
    queryParams.set('IVRM_Month_Id', String(data.IVRM_Month_Id));
    if (data.IE_Name) queryParams.set('IE_Name', String(data.IE_Name));
    if (miId) queryParams.set('MI_Id', String(miId));

    const queryString = queryParams.toString();
    const urlWithQuery = `${FACADE}/monthendreport_Savedata?${queryString}`;

    const payload = {
        LMRA_Id: Number(data.LMRA_Id || 0),
        IE_Name: data.IE_Name || '',
        MI_Id: miId,
        ASMAY_Id: Number(data.ASMAY_Id),
        year: String(data.year),
        IVRM_Month_Id: String(data.IVRM_Month_Id),
        griddata: null
    };

    let response: any;
    try {
        // Try POST with query string + payload
        response = await api.post<any>('library', urlWithQuery, payload);
    } catch (postErr: any) {
        try {
            // Try GET with query string
            response = await api.get<any>('library', urlWithQuery, { params: payload });
        } catch {
            try {
                // Try POST without query string
                response = await api.post<any>('library', `${FACADE}/monthendreport_Savedata`, payload);
            } catch {
                throw postErr;
            }
        }
    }

    const responseData = response?.data ?? response;

    const rawList = extractList(
        responseData.data ||
            responseData.griddata ||
            responseData.reportlist ||
            responseData.reportList ||
            responseData.monthEndReportList ||
            responseData.alldata ||
            (Array.isArray(responseData) ? responseData : [])
    );

    // Normalize keys to uppercase for frontend consistency
    return rawList.map((item: any) => {
        const normalizedItem: any = {};
        for (const key in item) {
            normalizedItem[key.toUpperCase()] = item[key];
        }
        return normalizedItem;
    });
}
