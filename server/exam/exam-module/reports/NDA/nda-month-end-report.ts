'use server';

import { type ApiResponse, api } from '@/lib/apiService';

export const getInitialDataNDA = async () => {
    let acdlist: any[] = [];
    let monthlist: any[] = [];
    let examlist: any[] = [];

    const DEFAULT_MONTHS = [
        { ivrM_Month_Id: 1, ivrM_Month_Name: 'January' },
        { ivrM_Month_Id: 2, ivrM_Month_Name: 'February' },
        { ivrM_Month_Id: 3, ivrM_Month_Name: 'March' },
        { ivrM_Month_Id: 4, ivrM_Month_Name: 'April' },
        { ivrM_Month_Id: 5, ivrM_Month_Name: 'May' },
        { ivrM_Month_Id: 6, ivrM_Month_Name: 'June' },
        { ivrM_Month_Id: 7, ivrM_Month_Name: 'July' },
        { ivrM_Month_Id: 8, ivrM_Month_Name: 'August' },
        { ivrM_Month_Id: 9, ivrM_Month_Name: 'September' },
        { ivrM_Month_Id: 10, ivrM_Month_Name: 'October' },
        { ivrM_Month_Id: 11, ivrM_Month_Name: 'November' },
        { ivrM_Month_Id: 12, ivrM_Month_Name: 'December' }
    ];

    const endpoints = [
        '/ExamMonthEndReport/getdetails/0',
        '/ExamMonthEndReport/getdetails',
        '/exam_month_end_report/getdetails',
        '/ExamMonthEndReportFacade/getdetails'
    ];

    const getArray = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'object' && Array.isArray(val.$values)) return val.$values;
        return [];
    };

    for (const ep of endpoints) {
        try {
            let res: any;
            if (ep.includes('Facade')) {
                res = await api.post<any>('exam', ep, {});
            } else {
                try {
                    res = await api.get<any>('exam', ep);
                } catch {
                    res = await api.post<any>('exam', ep, {});
                }
            }
            const raw = res?.data || res;
            if (raw && typeof raw === 'object') {
                const years = getArray(raw.acdlist || raw.yearlist || raw.yearList || raw.getyear || raw.academicYearList || raw.year_list);
                const months = getArray(
                    raw.monthlist || raw.monthList || raw.getmonth || raw.getMonth || raw.month_list || raw.months || raw.allMonths
                );
                const exams = getArray(raw.examlist || raw.examList || raw.getexam || raw.getExam || raw.exam_list || raw.exams);

                if (years.length > 0) acdlist = years;
                if (months.length > 0) monthlist = months;
                if (exams.length > 0) examlist = exams;

                if (acdlist.length > 0 || monthlist.length > 0 || examlist.length > 0) {
                    break;
                }
            }
        } catch (err) {
            console.warn(`[getInitialDataNDA] ${ep} failed:`, err);
        }
    }

    if (monthlist.length === 0) {
        monthlist = DEFAULT_MONTHS;
    }

    if (acdlist.length === 0) {
        try {
            const yrRes: any = await api.get<any>('exam', '/exam_master/get_academic_year_list');
            const rawYr = yrRes?.data || yrRes;
            const years = getArray(rawYr);
            if (years.length > 0) {
                acdlist = years;
            }
        } catch (err) {
            console.warn('[getInitialDataNDA] /exam_master/get_academic_year_list failed:', err);
        }
    }

    return { acdlist, monthlist, examlist };
};

export const getNDAMonthEndReportData = async (_data: any): Promise<ApiResponse<any>> => {
    const payload = {
        asmaY_Id: Number(_data.ASMAY_Id),
        emE_Id: Number(_data.EME_Id),
        ivrM_Month_Id: Number(_data.IVRM_Month_Id),
        ASMAY_Id: Number(_data.ASMAY_Id),
        EME_Id: Number(_data.EME_Id),
        IVRM_Month_Id: Number(_data.IVRM_Month_Id),
        genderflage: _data.radiodata || 'All',
        radiodata: _data.radiodata || 'All'
    };

    const endpoints = [
        '/ExamMonthEndReport/getreport',
        '/ExamMonthEndReport/onreport',
        '/ExamMonthEndReportFacade/getreport',
        '/ExamMonthEndReportFacade/onreport',
        '/exam_month_end_report'
    ];

    let lastError: any = null;
    for (const ep of endpoints) {
        try {
            console.log(`[getNDAMonthEndReportData] Attempting POST to: ${ep} with payload:`, JSON.stringify(payload));
            const res = await api.post<any>('exam', ep, payload);
            if (res) {
                console.log(`[getNDAMonthEndReportData] Success response from ${ep}`);
                return res;
            }
        } catch (e: any) {
            console.warn(`[getNDAMonthEndReportData] POST ${ep} failed:`, e);
            lastError = e;
        }
    }

    throw lastError || new Error('All report endpoints failed');
};
