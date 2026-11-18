'use server';

import { api } from '@/lib/apiService';

/**
 * MES Progress Card Report Server Actions
 */

export async function getInitialData() {
    const url = '/BaldwinAllReport/Getdetails';
    return await api.get<any>('exam', url);
}

export async function getStudents(data: any) {
    const url = '/Baldwin_Final_P_Report/get_students';
    return await api.post<any>('exam', url, data);
}

export async function getExamReport(data: any) {
    const endpoints = [
        '/individual_exam_report_card/exam_report_card',
        '/BaldwinAllReport/savedetails',
        '/JSHSExamReports_/nds_6_8_report',
        '/JSHSExamReports_/promotion_report_card',
        '/JSHSExamReportsFacade/promotion_report_card',
        '/JSHSExamReports/GetStudentDetails',
        '/BaldwinAllReport/studentDetails'
    ];

    let lastResponse: any = null;

    for (const ep of endpoints) {
        try {
            console.log(`[MES getExamReport] Attempting POST to: ${ep}`);
            const response = await api.post<any>('exam', ep, data);
            lastResponse = response;
            const resData = response?.data || response;
            const hasDetails =
                (resData?.getsavedetails && resData.getsavedetails.length > 0) ||
                (resData?.savelist && resData.savelist.length > 0) ||
                (resData?.getstudentmarksdetails && resData.getstudentmarksdetails.length > 0) ||
                (resData?.getstudentdetails && resData.getstudentdetails.length > 0) ||
                (resData?.studentdetails && resData.studentdetails.length > 0) ||
                (resData?.studentlist && resData.studentlist.length > 0) ||
                (resData?.list && resData.list.length > 0) ||
                (Array.isArray(resData) && resData.length > 0);

            if (hasDetails) {
                console.log(`[MES getExamReport] Found records from endpoint: ${ep}`);
                return response;
            }
        } catch (err) {
            console.warn(`[MES getExamReport] POST ${ep} failed:`, err);
        }
    }

    return lastResponse || { success: false, data: null, message: 'No records found' };
}

export async function onchangeYear(data: any) {
    const url = '/CumulativeReport/onchangeyear';
    return await api.post<any>('exam', url, data);
}

export async function onchangeClass(data: any) {
    const url = '/CumulativeReport/onchangeclass';
    return await api.post<any>('exam', url, data);
}

export async function onchangeSection(data: any) {
    const url = '/CumulativeReport/onchangesection';
    return await api.post<any>('exam', url, data);
}
