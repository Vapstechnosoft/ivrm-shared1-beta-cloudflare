'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IBookArrivalReportInitialData, IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';
import { format } from 'date-fns';

const FACADE = 'BookArrivalReport';

const extractList = (list: any): any[] => {
    if (!list) return [];
    if (Array.isArray(list)) return list;
    if (list && typeof list === 'object' && '$values' in list && Array.isArray(list.$values)) {
        return list.$values;
    }
    const actualList = list.data || list.reportlist || list.griddata || list.alldata || list;
    if (Array.isArray(actualList)) return actualList;
    if (actualList && typeof actualList === 'object' && '$values' in actualList && Array.isArray(actualList.$values)) {
        return actualList.$values;
    }
    return [];
};

export async function getBookArrivalReportInitialData() {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const url = `${FACADE}/bookarrivalReport-getdetails`;
    const response = await api.get<any>('library', url);
    const data = response?.data ?? response;

    let libList = extractList(data.lib_list || data.msterliblist1 || data.libraryList || data.libList || []);
    const deptList = extractList(data.deptlist || data.departmentList || data.dept_list || []);

    if (libList.length === 0) {
        try {
            const masterLibUrl = `MasterLibrary/get-master-library-list?page=1&page_size=100&sort_column=lmaL_LibraryName&sort_direction=asc&mI_Id=${session.mi_id}`;
            const masterLibRes = await api.get<any>('library', masterLibUrl);
            const mData = masterLibRes?.data || masterLibRes;
            if (mData) {
                libList = extractList(mData.list || mData.librylist || mData.liballdata || mData.msterliblist1 || []);
            }
        } catch (e: any) {
            console.warn('Failed to fetch master libraries fallback:', e?.message || String(e));
        }
    }

    return {
        lib_list: libList,
        deptlist: deptList
    } as IBookArrivalReportInitialData;
}

export async function getBookArrivalReportData(data: IBookArrivalReportRequest) {
    try {
        const session = await auth();
        if (!session?.mi_id) {
            throw new Error('Authentication required');
        }

        const lmdVal =
            data.LMD_Id !== undefined && data.LMD_Id !== null && data.LMD_Id !== ''
                ? data.LMD_Id
                : data.p_lmd_id !== undefined && data.p_lmd_id !== null && data.p_lmd_id !== ''
                  ? data.p_lmd_id
                  : 'ALL';

        const lmdId = lmdVal === '0' || lmdVal === 0 || lmdVal === 'ALL' ? 'ALL' : String(lmdVal);
        const lmalId = Number(data.LMAL_Id || data.p_lmal_id || data.lmaL_Id || 0);
        const type = data.Type || data.p_type || data.type || 'ALL';
        const type2 = data.Type2 || data.p_type2 || data.type2 || 'ALL';

        // Format dates to yyyy-MM-dd
        let fromDate = '2000-01-01';
        let toDate = format(new Date(), 'yyyy-MM-dd');

        const rawFrom = data.Fromdate || data.p_fromdate || data.FromDate || data.fromDate;
        if (rawFrom) {
            try {
                const d = new Date(rawFrom);
                if (!Number.isNaN(d.getTime())) {
                    fromDate = format(d, 'yyyy-MM-dd');
                } else if (typeof rawFrom === 'string' && rawFrom.trim() !== '') {
                    fromDate = rawFrom.trim();
                }
            } catch {
                // fallback to default
            }
        }

        const rawTo = data.ToDate || data.p_todate || data.toDate || data.Todate;
        if (rawTo) {
            try {
                const d = new Date(rawTo);
                if (!Number.isNaN(d.getTime())) {
                    toDate = format(d, 'yyyy-MM-dd');
                } else if (typeof rawTo === 'string' && rawTo.trim() !== '') {
                    toDate = rawTo.trim();
                }
            } catch {
                // fallback to default
            }
        }

        // URL format: /api/BookArrivalReport/bookarrivaldetails-Report/ALL/ALL/2022-03-09/2026-03-09/13
        const url = `/${FACADE}/bookarrivaldetails-Report/${type}/${type2}/${fromDate}/${toDate}/${lmalId}`;

        const payload: Record<string, any> = {
            Type: type,
            type: type,
            Type2: type2,
            type2: type2,
            LMD_Id: lmdId,
            LMAL_Id: lmalId,
            MI_Id: session.mi_id,
            IVRMUL_Id: session.roleId || 0,
            Fromdate: fromDate,
            fromdate: fromDate,
            ToDate: toDate,
            todate: toDate,
            bookArrival: true,
            subjectsthomos: false,
            stthomosSubject: []
        };

        let response: any;
        try {
            response = await api.post<any>('library', url, payload);
        } catch (postErr: any) {
            if (typeof postErr === 'string' && (postErr.includes('405') || postErr.includes('Method Not Allowed'))) {
                response = await api.get<any>('library', url);
            } else {
                throw postErr;
            }
        }

        const responseData = response?.data || response;

        let list: any[] = [];
        if (Array.isArray(responseData)) {
            list = responseData;
        } else if (responseData?.$values && Array.isArray(responseData.$values)) {
            list = responseData.$values;
        } else if (
            responseData?.reportlist ||
            responseData?.griddata ||
            responseData?.alldata ||
            responseData?.bookarrivaldetails ||
            responseData?.data
        ) {
            const inner =
                responseData.reportlist ||
                responseData.griddata ||
                responseData.alldata ||
                responseData.bookarrivaldetails ||
                responseData.data;
            list = extractList(inner);
        }

        return {
            success: true,
            data: list,
            reportlist: list
        };
    } catch (error) {
        console.error('Error in getBookArrivalReportData:', error);
        return { success: false, message: 'Failed to fetch book arrival report data', data: [], reportlist: [] };
    }
}
