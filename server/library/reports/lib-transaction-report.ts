'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ILibTransactionReportInitialData, ILibTransactionReportRequest } from '@/types/library/reports/lib-transaction-report';

const FACADE = 'LibTransactionReport';

const extractList = (list: any) => {
    if (!list) return [];
    // Handle the case where the list itself is the response object or has a data property
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

// Get initial data for the report form
export async function getLibTransactionReportInitialData() {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        MI_Id: session.mi_id
    };

    // api/LibTransactionReport/library_countreport_getdetails
    const url = `${FACADE}/library_countreport_getdetails`;
    const response = await api.get<any>('library', url, { params: payload });
    const data = response?.data ?? response;

    return {
        msterliblist1: extractList(data.subjectList || data.msterliblist1 || []),
        yearlist: extractList(data.departmentList || data.yearlist || [])
    } as ILibTransactionReportInitialData;
}

// Get report data
export async function getLibTransactionReportSearch(data: ILibTransactionReportRequest) {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        ...data,
        MI_Id: session.mi_id,
        IVRMUL_Id: session.roleId || 0
    };

    const url = `${FACADE}/get-transaction-count-report`;
    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;

    return {
        alldata: extractList(
            responseData.alldata ||
                responseData.reportlist ||
                responseData.griddata ||
                responseData.statuslist ||
                (Array.isArray(responseData) ? responseData : [])
        ),
        classlist: extractList(responseData.classlist || [])
    };
}
