'use server';

import { api } from '@/lib/apiService';
import type {
    IClgExamMonthEndReportApiResponse,
    IClgExamMonthEndReportPayload
} from './types';

// Helper to execute API requests with comprehensive fallback endpoint resolution
async function executeApiRequest<T>(
    method: 'get' | 'post' | 'both',
    subPaths: string[],
    data: any = {}
) {
    const controllers = [
        'ClgExamMonthEndReportFacade',
        'ClgExamMonthEndReport',
        'clgexammonthendreportfacade',
        'clgexammonthendreport',
        'ExamMonthEndReportFacade',
        'ExamMonthEndReport',
        'exam_month_end_report'
    ];

    const endpoints: string[] = [];
    for (const controller of controllers) {
        for (const sub of subPaths) {
            const cleanSub = sub.replace(/^\/+/, '');
            endpoints.push(`/${controller}/${cleanSub}`);
        }
    }

    let lastError: any = null;
    for (const endpoint of endpoints) {
        const methodsToTry: ('post' | 'get')[] =
            method === 'both' ? ['post', 'get'] : [method];

        for (const m of methodsToTry) {
            try {
                let res: any;
                if (m === 'get') {
                    res = await api.get<T>('exam', endpoint);
                } else if (m === 'post') {
                    res = await api.post<T>('exam', endpoint, data);
                }
                if (res) {
                    const resData = (res?.data !== undefined ? res.data : res) as T;
                    return {
                        success: true,
                        data: resData
                    };
                }
            } catch (error: any) {
                lastError = error;
                const status = error?.response?.status || error?.status;
                if (status && status !== 404 && status !== 405) {
                    continue;
                }
            }
        }
    }

    return {
        success: false,
        message: lastError?.message || 'API request failed',
        data: null
    };
}

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

// Helper to extract arrays safely across diverse backend naming conventions
function extractArray(obj: any, keys: string[]): any[] {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== 'object') return [];

    if (obj.data && typeof obj.data === 'object') {
        const nested = extractArray(obj.data, keys);
        if (nested.length > 0) return nested;
    }

    for (const key of keys) {
        const val = obj[key];
        if (Array.isArray(val) && val.length > 0) return val;
        if (val && typeof val === 'object' && Array.isArray(val.$values) && val.$values.length > 0) {
            return val.$values;
        }
    }
    return [];
}

const YEAR_KEYS = [
    'acdlist', 'yearlist', 'yearList', 'academicYearList', 'getyear', 'getYear', 'year_list', 'academicYear', 'allAcademicYear'
];

const MONTH_KEYS = [
    'monthlist', 'monthList', 'getmonth', 'getMonth', 'month_list', 'months', 'allMonths'
];

const EXAM_KEYS = [
    'exammastername', 'examlist', 'examList', 'getexam', 'getExam', 'masterExamList', 'masterexamlist',
    'clgexamlist', 'clg_exam_list', 'exam_list', 'exams', 'allExams', 'allexam', 'allexamlist', 'getexammaster', 'griddata'
];

/**
 * Fetch initial dropdown details (Academic Years, Months, Exams)
 * Uses primary controllers and master fallbacks to ensure options always populate
 */
export async function getClgExamMonthEndReportInitialDetails(data: any = {}) {
    try {
        const detailPaths = [
            'getdetails/2',
            'getdetails/0',
            'getdetails',
            'Getdetails',
            'getalldetails',
            'getalldetails/0',
            'getpagedetails/2'
        ];

        const payload = {
            mI_Id: 0,
            asmaY_Id: 0,
            emE_Id: 0,
            ivrM_Month_Id: 0,
            ...data
        };

        let acdlist: any[] = [];
        let monthlist: any[] = [];
        let examlist: any[] = [];

        // 1. Try primary controller endpoints with both POST & GET
        const result = await executeApiRequest<IClgExamMonthEndReportApiResponse>('both', detailPaths, payload);
        const primaryData = result?.data || (result as any);

        if (primaryData && typeof primaryData === 'object') {
            acdlist = extractArray(primaryData, YEAR_KEYS);
            monthlist = extractArray(primaryData, MONTH_KEYS);
            examlist = extractArray(primaryData, EXAM_KEYS);
        }

        // 2. Exam fallback endpoints (ClgExamMaster, ClgExamMasterFacade, ExamMonthEndReport, etc.)
        if (examlist.length === 0) {
            const examEndpoints = [
                () => api.post('exam', '/ClgExamMaster/Getdetails', { mI_Id: 0 }),
                () => api.get('exam', '/ClgExamMaster/Getdetails'),
                () => api.get('exam', '/ClgExamMaster/getdetails/2'),
                () => api.post('exam', '/ClgExamMasterFacade/Getdetails', { mI_Id: 0 }),
                () => api.get('exam', '/ClgExamMasterFacade/Getdetails'),
                () => api.get('exam', '/ClgExamMasterFacade/getdetails/2'),
                () => api.post('exam', '/clgexammaster/Getdetails', {}),
                () => api.get('exam', '/clgexammaster/Getdetails'),
                () => api.get('exam', '/ExamMonthEndReport/getdetails/0'),
                () => api.post('exam', '/ExamMonthEndReport/getdetails/0', {}),
                () => api.get('exam', '/ExamMonthEndReport/getdetails'),
                () => api.get('exam', '/exam_master/get_exam_list'),
                () => api.get('exam', '/LP_OnlineExam/getexammasterload/2'),
                () => api.get('exam', '/exammaster/getdetails'),
                () => api.get('exam', '/exam_master/getdetails/0')
            ];

            for (const fetcher of examEndpoints) {
                try {
                    const res: any = await fetcher();
                    const raw = res?.data || res;
                    const found = extractArray(raw, EXAM_KEYS);
                    if (found.length > 0) {
                        examlist = found;
                        break;
                    }
                } catch {
                    // Try next fallback
                }
            }
        }

        // 3. Academic Year fallback endpoints
        if (acdlist.length === 0) {
            const yearFallbacks = [
                () => api.get('admission', '/master_class_category/academic_year_drop_down_list'),
                () => api.get('fees', '/fee_class_category/academicyearlist'),
                () => api.get('exam', '/exam_master/get_academic_year_list'),
                () => api.get('timetable', '/TimeTableCommon/GetAcademicYearData'),
                () => api.get('exam', '/ExamMonthEndReport/getdetails/0'),
                () => api.post('exam', '/ClgExamMaster/Getdetails', { mI_Id: 0 })
            ];

            for (const fetcher of yearFallbacks) {
                try {
                    const res: any = await fetcher();
                    const raw = res?.data || res;
                    const found = extractArray(raw, YEAR_KEYS);
                    if (found.length > 0) {
                        acdlist = found;
                        break;
                    }
                } catch {
                    // Continue to next fallback
                }
            }
        }

        // 4. Default months if not returned from backend
        if (monthlist.length === 0) {
            monthlist = DEFAULT_MONTHS;
        }

        return {
            success: true,
            message: '',
            data: {
                acdlist,
                monthlist,
                examlist
            }
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to fetch initial dropdown details',
            data: null
        };
    }
}

/**
 * Fetch Exam Month End Report data based on selected criteria
 * Endpoint: [HttpPost] [Route("onreport")] / [Route("getreport")]
 */
export async function getClgExamMonthEndReportData(payload: IClgExamMonthEndReportPayload) {
    const reportPaths = [
        'getreport',
        'onreport',
        'Getreport',
        'get_report',
        'savedetails'
    ];
    const fullPayload = {
        mI_Id: 0,
        asmaY_Id: payload.ASMAY_Id,
        emE_Id: payload.EME_Id,
        ivrM_Month_Id: payload.IVRM_Month_Id,
        ...payload
    };
    return await executeApiRequest<IClgExamMonthEndReportApiResponse>('post', reportPaths, fullPayload);
}


