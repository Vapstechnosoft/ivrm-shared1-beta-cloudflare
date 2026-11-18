'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type {
    ICLGTransactionCountReportInitialData,
    ICLGTransactionCountReportRequest
} from '@/types/library/reports/clg-transaction-count-report';

const FACADE = 'LibTransactionReport'; // Assuming shared or similar facade

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getCLGTransactionCountReportInitialData() {
    const url = `${FACADE}/library_countreport_getdetails`;
    const response = await api.get<any>('library', url);
    const responseData = response?.data || response;
    const finalData = responseData?.data || responseData;

    return {
        msterliblist1: extractList(finalData.subjectList || finalData.msterliblist1 || finalData.alldata || []),
        yearlist: extractList(finalData.departmentList || finalData.yearlist || finalData.acdlist || [])
    } as ICLGTransactionCountReportInitialData;
}

export async function getCLGTransactionCountReportSearch(data: ICLGTransactionCountReportRequest) {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        ...data,
        mI_Id: session.mi_id
    };

    const url = `${FACADE}/CLGget_report`;
    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;

    return extractList(
        responseData.data?.alldata ||
            responseData.alldata ||
            responseData.reportlist ||
            responseData.griddata ||
            responseData.statuslist ||
            (Array.isArray(responseData) ? responseData : [])
    );
}
