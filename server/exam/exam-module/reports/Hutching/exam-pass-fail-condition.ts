'use server';

import { api } from '@/lib/apiService';

async function getWithFallback(urlPrimary: string, urlFallback: string) {
    try {
        const response = await api.get<any>('exam', urlPrimary);
        if (response) return response;
    } catch (e) {
        console.warn(`[getWithFallback] ${urlPrimary} failed, trying ${urlFallback}...`);
    }
    return await api.get<any>('exam', urlFallback);
}

async function postWithFallback(urlPrimary: string, urlFallback: string, data: any) {
    try {
        const response = await api.post<any>('exam', urlPrimary, data);
        if (response) return response;
    } catch (e) {
        console.warn(`[postWithFallback] ${urlPrimary} failed, trying ${urlFallback}...`);
    }
    return await api.post<any>('exam', urlFallback, data);
}

import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';

/**
 * Get initial details for Exam Pass/Fail Condition page (year list, grid list, exam condition list)
 */
export async function getPassFailConditionDetails() {
    try {
        let detailsResponse: any = null;

        // Try primary endpoints (HutchingReports prioritized)
        try {
            detailsResponse = await api.get<any>('exam', '/HutchingReports/Getdetails');
        } catch {
            try {
                detailsResponse = await api.post<any>('exam', '/HutchingReports/Getdetails', {});
            } catch {
                try {
                    detailsResponse = await api.post<any>('exam', '/HutchingReports/getInitailData', {});
                } catch {
                    try {
                        detailsResponse = await api.get<any>('exam', '/ExamPassFailCondition/Getdetails');
                    } catch {
                        try {
                            detailsResponse = await api.post<any>('exam', '/ExamPassFailCondition/Getdetails', {});
                        } catch (e) {
                            console.warn('All exam details endpoints failed, falling back to academic year dropdown:', e);
                        }
                    }
                }
            }
        }

        const raw = detailsResponse?.data ?? detailsResponse ?? {};

        // Always ensure year_list is populated
        let yearList = raw.year_list || raw.yearlist || raw.yearList || raw.academicList || raw.years;
        if (!yearList || (Array.isArray(yearList) && yearList.length === 0)) {
            try {
                const yearRes: any = await getAcademicYearDropdown();
                const yearData = Array.isArray(yearRes)
                    ? yearRes
                    : Array.isArray(yearRes?.data)
                      ? yearRes.data
                      : Array.isArray(yearRes?.data?.$values)
                        ? yearRes.data.$values
                        : [];
                if (yearData.length > 0) {
                    raw.year_list = yearData;
                }
            } catch (err) {
                console.warn('Failed to fetch fallback academic years:', err);
            }
        }

        return { success: true, data: raw };
    } catch (error: any) {
        console.error('Error in getPassFailConditionDetails:', error);
        // Even on error, attempt to return academic years so form is usable
        try {
            const yearRes: any = await getAcademicYearDropdown();
            const yearData = Array.isArray(yearRes?.data) ? yearRes.data : Array.isArray(yearRes) ? yearRes : [];
            return { success: true, data: { year_list: yearData, passfailrank_list: [], examconditionlist: [] } };
        } catch {
            return { success: false, message: error?.message || 'Failed to fetch details', data: null };
        }
    }
}

/**
 * Get Category list by Academic Year ID
 */
export async function getCategoryByYear(asmaY_Id: number) {
    try {
        if (!asmaY_Id) return { success: false, message: 'Academic Year ID is required', data: [] };

        // 1. Try primary POST endpoints
        try {
            const res1 = await api.post<any>('exam', '/ExamPassFailCondition/get_category', { ASMAY_Id: asmaY_Id });
            const data1 = res1?.data ?? res1;
            if (data1 && (Array.isArray(data1) ? data1.length > 0 : (data1.categorylist || data1.categoryList || data1.$values))) {
                return { success: true, data: data1 };
            }
        } catch {}

        try {
            const res2 = await api.post<any>('exam', '/HutchingReports/get_category', { ASMAY_Id: asmaY_Id });
            const data2 = res2?.data ?? res2;
            if (data2 && (Array.isArray(data2) ? data2.length > 0 : (data2.categorylist || data2.categoryList || data2.$values))) {
                return { success: true, data: data2 };
            }
        } catch {}

        // 2. Try GET by year endpoint
        try {
            const res3 = await api.get<any>('exam', `/exam_master_category/exam_category_drop_down_by_academic_year_list/${asmaY_Id}`);
            const data3 = res3?.data ?? res3;
            if (data3 && (Array.isArray(data3) ? data3.length > 0 : (data3.categorylist || data3.categoryList || data3.$values))) {
                return { success: true, data: data3 };
            }
        } catch {}

        // 3. Fallback to master category list
        try {
            const res4 = await api.get<any>('exam', '/exam_master_category/exam_master_category_drop_down_list/');
            const data4 = res4?.data ?? res4;
            if (data4) {
                return { success: true, data: data4 };
            }
        } catch {}

        return { success: true, data: [] };
    } catch (error: any) {
        console.error('Error in getCategoryByYear:', error);
        return { success: false, message: error?.message || 'Failed to fetch categories', data: [] };
    }
}

/**
 * Get Subjects/Exams list by Academic Year & Category
 */
export async function getSubjectsByCategory(asmaY_Id: number, emcA_Id: number) {
    try {
        if (!asmaY_Id || !emcA_Id) return { success: false, message: 'Academic Year and Category are required', data: [] };

        // 1. Try POST to ExamPassFailCondition
        try {
            const res1 = await api.post<any>('exam', '/ExamPassFailCondition/get_subjects', { ASMAY_Id: asmaY_Id, EMCA_Id: emcA_Id });
            const data1 = res1?.data ?? res1;
            const list1 = Array.isArray(data1) ? data1 : (data1?.examlist || data1?.examList || data1?.get_exam || data1?.$values);
            if (list1 && list1.length > 0) return { success: true, data: data1 };
        } catch {}

        // 2. Try POST to HutchingReports
        try {
            const res2 = await api.post<any>('exam', '/HutchingReports/get_subjects', { ASMAY_Id: asmaY_Id, EMCA_Id: emcA_Id });
            const data2 = res2?.data ?? res2;
            const list2 = Array.isArray(data2) ? data2 : (data2?.examlist || data2?.examList || data2?.get_exam || data2?.$values);
            if (list2 && list2.length > 0) return { success: true, data: data2 };
        } catch {}

        // 3. Try GET /exam_master/exam_drop_down_by_year_and_category_list/${asmaY_Id}/${emcA_Id}
        try {
            const res3 = await api.get<any>('exam', `/exam_master/exam_drop_down_by_year_and_category_list/${asmaY_Id}/${emcA_Id}`);
            const data3 = res3?.data ?? res3;
            const list3 = Array.isArray(data3) ? data3 : (data3?.examlist || data3?.examList || data3?.get_exam || data3?.$values || (Array.isArray(data3?.data) ? data3.data : null));
            if (list3 && list3.length > 0) return { success: true, data: data3 };
        } catch {}

        // 4. Try POST to ExamCalculation_SSSE/get_exams
        try {
            const res4 = await api.post<any>('exam', '/ExamCalculation_SSSE/get_exams', { ASMAY_Id: asmaY_Id, EMCA_Id: emcA_Id });
            const data4 = res4?.data ?? res4;
            const list4 = Array.isArray(data4) ? data4 : (data4?.examlist || data4?.examList || data4?.get_exam || data4?.$values);
            if (list4 && list4.length > 0) return { success: true, data: data4 };
        } catch {}

        // 5. Try GET /exam_master_category/exam_drop_down_by_academic_year_category_list
        try {
            const res5 = await api.get<any>('exam', `/exam_master_category/exam_drop_down_by_academic_year_category_list/${asmaY_Id}/${emcA_Id}`);
            const data5 = res5?.data ?? res5;
            if (data5) return { success: true, data: data5 };
        } catch {}

        // 6. Fallback to general master exam list
        try {
            const res6 = await api.get<any>('exam', '/exam_master');
            const data6 = res6?.data ?? res6;
            if (data6) return { success: true, data: data6 };
        } catch {}

        return { success: true, data: [] };
    } catch (error: any) {
        console.error('Error in getSubjectsByCategory:', error);
        return { success: false, message: error?.message || 'Failed to fetch subjects/exams', data: [] };
    }
}

/**
 * Get Exam condition list by Academic Year & Exam ID
 */
export async function getExamConditionByExam(asmaY_Id: number, emE_Id?: number | null, emcA_Id?: number | null) {
    try {
        if (!asmaY_Id) return { success: false, message: 'Academic Year is required', data: [] };

        const payload: any = { ASMAY_Id: asmaY_Id };
        if (emE_Id) payload.EME_Id = emE_Id;
        if (emcA_Id) payload.EMCA_Id = emcA_Id;

        // 1. Primary: /HutchingReports/get_condition
        try {
            const res1 = await api.post<any>('exam', '/HutchingReports/get_condition', payload);
            const data1 = res1?.data ?? res1;
            const list1 = Array.isArray(data1) ? data1 : (data1?.examconditionlist || data1?.examconditionList || data1?.conditionlist || data1?.condition_list || data1?.$values);
            if (list1 && list1.length > 0) return { success: true, data: data1 };
        } catch {}

        // 2. Secondary: /HutchingReports/get_examcondition
        try {
            const res2 = await api.post<any>('exam', '/HutchingReports/get_examcondition', payload);
            const data2 = res2?.data ?? res2;
            const list2 = Array.isArray(data2) ? data2 : (data2?.examconditionlist || data2?.examconditionList || data2?.conditionlist || data2?.$values);
            if (list2 && list2.length > 0) return { success: true, data: data2 };
        } catch {}

        // 3. Fallback: /ExamPassFailCondition/get_condition
        try {
            const res3 = await api.post<any>('exam', '/ExamPassFailCondition/get_condition', payload);
            const data3 = res3?.data ?? res3;
            if (data3) return { success: true, data: data3 };
        } catch {}

        // 4. Fallback: /ExamPassFailCondition/get_examcondition
        try {
            const res4 = await api.post<any>('exam', '/ExamPassFailCondition/get_examcondition', payload);
            const data4 = res4?.data ?? res4;
            if (data4) return { success: true, data: data4 };
        } catch {}

        return { success: true, data: [] };
    } catch (error: any) {
        console.error('Error in getExamConditionByExam:', error);
        return { success: false, message: error?.message || 'Failed to fetch exam conditions', data: [] };
    }
}

/**
 * Get Condition Type details by Academic Year & Exam Condition ID
 */
export async function getConditionTypeByCondition(asmaY_Id: number, ecM_Id: number) {
    try {
        if (!asmaY_Id || !ecM_Id) return { success: false, message: 'Academic Year and Exam Condition are required', data: [] };
        const response = await postWithFallback(
            '/HutchingReports/get_condition',
            '/ExamPassFailCondition/get_condition',
            { ASMAY_Id: asmaY_Id, ECM_Id: ecM_Id }
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in getConditionTypeByCondition:', error);
        return { success: false, message: error?.message || 'Failed to fetch condition details', data: [] };
    }
}

/**
 * Save or Update Pass/Fail Condition Record
 */
export async function savePassFailCondition(data: any) {
    try {
        // 1. Try POST to ExamPassFailCondition/savedata
        try {
            const res1 = await api.post<any>('exam', '/ExamPassFailCondition/savedata', data);
            if (res1 && (res1.data || res1.returnval !== undefined || res1.success !== undefined)) {
                return { success: true, data: res1?.data ?? res1 };
            }
        } catch (e: any) {
            console.warn('/ExamPassFailCondition/savedata failed:', e?.message || e);
        }

        // 2. Try POST to HutchingReports/savedata
        try {
            const res2 = await api.post<any>('exam', '/HutchingReports/savedata', data);
            if (res2 && (res2.data || res2.returnval !== undefined || res2.success !== undefined)) {
                return { success: true, data: res2?.data ?? res2 };
            }
        } catch (e: any) {
            console.warn('/HutchingReports/savedata failed:', e?.message || e);
        }

        // 3. Try POST to HutchingReports/savedetails
        try {
            const res3 = await api.post<any>('exam', '/HutchingReports/savedetails', data);
            if (res3 && (res3.data || res3.returnval !== undefined || res3.success !== undefined)) {
                return { success: true, data: res3?.data ?? res3 };
            }
        } catch (e: any) {
            console.warn('/HutchingReports/savedetails failed:', e?.message || e);
        }

        // 4. Try POST to ExamPassFailCondition/savedetails
        try {
            const res4 = await api.post<any>('exam', '/ExamPassFailCondition/savedetails', data);
            if (res4 && (res4.data || res4.returnval !== undefined || res4.success !== undefined)) {
                return { success: true, data: res4?.data ?? res4 };
            }
        } catch (e: any) {
            console.warn('/ExamPassFailCondition/savedetails failed:', e?.message || e);
        }

        return { success: false, message: 'Server did not return a valid response while saving' };
    } catch (error: any) {
        console.error('Error in savePassFailCondition:', error);
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

/**
 * Edit details for specific record
 */
export async function editPassFailConditionDetails(epfrC_Id: number) {
    try {
        if (!epfrC_Id) return { success: false, message: 'Record ID is required', data: null };
        const response = await getWithFallback(
            `/ExamPassFailCondition/editdetails/${epfrC_Id}`,
            `/HutchingReports/editdetails/${epfrC_Id}`
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in editPassFailConditionDetails:', error);
        return { success: false, message: error?.message || 'Failed to fetch edit record', data: null };
    }
}

/**
 * Toggle Active / Deactive status of a record
 */
export async function toggleActivePassFailCondition(record: any) {
    try {
        const response = await postWithFallback(
            '/ExamPassFailCondition/deactive',
            '/HutchingReports/deactive',
            record
        );
        return { success: true, data: response?.data ?? response };
    } catch (error: any) {
        console.error('Error in toggleActivePassFailCondition:', error);
        return { success: false, message: error?.message || 'Failed to change record status' };
    }
}
