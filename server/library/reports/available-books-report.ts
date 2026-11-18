'use server';

import { api } from '@/lib/apiService';
import type { IAvailableBooksReportInitialData, IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import { format } from 'date-fns';

const FACADE = 'AvailableBooksReport';

export async function getAvailableBooksReportInitialData() {
    try {
        const url = `${FACADE}/getdetails`;
        return await api.get<IAvailableBooksReportInitialData>('library', url);
    } catch (error: any) {
        console.error('Error fetching initial data:', error);
        return { libraryList: [], departmentList: [] };
    }
}

export async function getAvailableBooksReportData(data: IAvailableBooksReportRequest) {
    try {
        const type = data.Type || data.type || 'ALL';
        const type2 = data.Type2 || data.type2 || 'ALL';
        const lmdId = data.LMD_Id !== undefined && data.LMD_Id !== null ? data.LMD_Id : data.lmD_Id !== undefined ? data.lmD_Id : 0;
        const lmalId = data.LMAL_Id || data.lmaL_Id || 0;
        const statuscount = data.statuscount !== undefined ? String(Boolean(data.statuscount)) : 'true';

        // Format dates to yyyy-MM-dd
        let fromDate = '2000-01-01';
        let toDate = format(new Date(), 'yyyy-MM-dd');

        const rawFrom = data.Fromdate || data.fromdate || data.FromDate || data.fromDate || data.IssueFromDate;
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

        const rawTo = data.ToDate || data.todate || data.toDate || data.Todate || data.IssueToDate;
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

        // URL format: AvailableBooksReport/get-report/ALL/ALL/3/2026-10-10/2026-10-10/true/2
        const url = `${FACADE}/get-report/${type}/${type2}/${lmdId}/${fromDate}/${toDate}/${statuscount}/${lmalId}`;

        let response: any;
        try {
            response = await api.get<any>('library', url);
        } catch (err: any) {
            try {
                response = await api.post<any>('library', url, {});
            } catch {
                throw err;
            }
        }

        return response?.data ?? response;
    } catch (error: any) {
        console.error('Error in getAvailableBooksReportData:', error);
        const errMsg = typeof error === 'string' ? error : error?.message || 'Failed to fetch report data';
        return {
            success: false,
            message: errMsg.includes('401') ? 'Session expired or unauthorized. Please re-login.' : errMsg,
            data: []
        };
    }
}

