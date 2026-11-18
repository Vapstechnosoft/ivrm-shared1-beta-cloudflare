'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';

// --------------------------------------------
// Get All Exam Subject Wizard Records
// --------------------------------------------
export async function getExamSubjectWizard(searchParams?: ApiSearchparams) {
    const session = await auth();
    const miId = session?.mi_id ? Number(session.mi_id) : 0;
    const urlParams = getSearchParamsUrl({
        ...(miId > 0 ? { mI_Id: miId, MI_Id: miId } : {}),
        ...(searchParams ?? {})
    });
    const url = `exam_subject_mapping?${urlParams}`;
    console.info('getExamSubjectWizard url:', url);
    const res: any = await api.get('exam', url);

    const extractArray = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.data?.$values)) return data.data.$values;
        if (Array.isArray(data?.$values)) return data.$values;

        const candidateKeys = [
            'exam_subject_mapping_list',
            'exam_subject_mapping',
            'examsubjectmappinglist',
            'get_details',
            'getdetails',
            'category_exam_list',
            'categoryexamlist',
            'mapped_exam_list',
            'mappedexamlist',
            'yearly_category_exam_list',
            'yearlycategoryexamlist',
            'exam_list',
            'examlist',
            'subject_list',
            'subjectlist',
            'alldata',
            'all_data',
            'grid_data',
            'griddata',
            'data'
        ];

        for (const k of candidateKeys) {
            if (Array.isArray(data?.[k])) return data[k];
            if (Array.isArray(data?.[k]?.$values)) return data[k].$values;
            if (Array.isArray(data?.data?.[k])) return data.data[k];
            if (Array.isArray(data?.data?.[k]?.$values)) return data.data[k].$values;
        }

        const target = data?.data ?? data;
        if (target && typeof target === 'object') {
            for (const key of Object.keys(target)) {
                const val = target[key];
                if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                    return val;
                }
                if (val && typeof val === 'object' && Array.isArray(val.$values) && val.$values.length > 0) {
                    return val.$values;
                }
            }
        }
        return [];
    };

    const rawList = extractArray(res);

    const normalizedList = rawList.map((d: any, index: number) => ({
        ...d,
        slno: d.slno ?? index + 1,
        eycE_Id: Number(d.eycE_Id ?? d.EYCE_Id ?? 0),
        EYCE_Id: Number(d.eycE_Id ?? d.EYCE_Id ?? 0),
        eyC_Id: Number(d.eyC_Id ?? d.EYC_Id ?? 0),
        EYC_Id: Number(d.eyC_Id ?? d.EYC_Id ?? 0),
        emcA_Id: Number(d.emcA_Id ?? d.EMCA_Id ?? 0),
        EMCA_Id: Number(d.emcA_Id ?? d.EMCA_Id ?? 0),
        asmaY_Id: Number(d.asmaY_Id ?? d.ASMAY_Id ?? 0),
        ASMAY_Id: Number(d.asmaY_Id ?? d.ASMAY_Id ?? 0),
        emE_Id: Number(d.emE_Id ?? d.EME_Id ?? 0),
        EME_Id: Number(d.emE_Id ?? d.EME_Id ?? 0),
        emgR_Id: Number(d.emgR_Id ?? d.EMGR_Id ?? 0),
        EMGR_Id: Number(d.emgR_Id ?? d.EMGR_Id ?? 0),
        asmaY_Year: d.asmaY_Year ?? d.ASMAY_Year ?? '',
        ASMAY_Year: d.asmaY_Year ?? d.ASMAY_Year ?? '',
        emcA_CategoryName: d.emcA_CategoryName ?? d.EMCA_CategoryName ?? '',
        EMCA_CategoryName: d.emcA_CategoryName ?? d.EMCA_CategoryName ?? '',
        emE_ExamName: d.emE_ExamName ?? d.EME_ExamName ?? '',
        EME_ExamName: d.emE_ExamName ?? d.EME_ExamName ?? '',
        emE_ExamCode: d.emE_ExamCode ?? d.EME_ExamCode ?? '',
        EME_ExamCode: d.emE_ExamCode ?? d.EME_ExamCode ?? '',
        emgR_GradeName: d.emgR_GradeName ?? d.EMGR_GradeName ?? '',
        EMGR_GradeName: d.emgR_GradeName ?? d.EMGR_GradeName ?? '',
        eycE_AttendanceFromDate: d.eycE_AttendanceFromDate ?? d.EYCE_AttendanceFromDate ?? '',
        EYCE_AttendanceFromDate: d.eycE_AttendanceFromDate ?? d.EYCE_AttendanceFromDate ?? '',
        eycE_AttendanceToDate: d.eycE_AttendanceToDate ?? d.EYCE_AttendanceToDate ?? '',
        EYCE_AttendanceToDate: d.eycE_AttendanceToDate ?? d.EYCE_AttendanceToDate ?? '',
        eycE_SubExamFlg: Boolean(d.eycE_SubExamFlg ?? d.EYCE_SubExamFlg ?? false),
        EYCE_SubExamFlg: Boolean(d.eycE_SubExamFlg ?? d.EYCE_SubExamFlg ?? false),
        eycE_SubSubjectFlg: Boolean(d.eycE_SubSubjectFlg ?? d.EYCE_SubSubjectFlg ?? false),
        EYCE_SubSubjectFlg: Boolean(d.eycE_SubSubjectFlg ?? d.EYCE_SubSubjectFlg ?? false),
        eycE_ActiveFlg: Boolean(d.eycE_ActiveFlg ?? d.EYCE_ActiveFlg ?? true),
        EYCE_ActiveFlg: Boolean(d.eycE_ActiveFlg ?? d.EYCE_ActiveFlg ?? true),
        eycE_BestOf: Number(d.eycE_BestOf ?? d.EYCE_BestOf ?? 0) || 0,
        EYCE_BestOf: Number(d.eycE_BestOf ?? d.EYCE_BestOf ?? 0) || 0,
        eycE_BestOfApplicableFlg: Boolean(d.eycE_BestOfApplicableFlg ?? d.EYCE_BestOfApplicableFlg ?? false),
        EYCE_BestOfApplicableFlg: Boolean(d.eycE_BestOfApplicableFlg ?? d.EYCE_BestOfApplicableFlg ?? false)
    }));

    return {
        ...(typeof res === 'object' ? res : {}),
        success: true,
        data: normalizedList,
        total: res?.total || normalizedList.length
    };
}

// --------------------------------------------
// Get Categories For Exam Subject Wizard
// --------------------------------------------
export async function getExamSubjectWizardCategories(asmay_id: number) {
    if (!asmay_id) return { success: true, data: [] };

    const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.$values)) return res.data.$values;
        if (Array.isArray(res?.$values)) return res.$values;

        const candidateKeys = [
            'category_list',
            'categorylist',
            'categoryList',
            'catlist',
            'exam_category_list',
            'exam_category_drop_down_list',
            'mastercategorylist',
            'master_category_list',
            'year_category_list',
            'year_categorylist',
            'get_category',
            'category_dropdown'
        ];

        for (const k of candidateKeys) {
            if (Array.isArray(res?.[k])) return res[k];
            if (Array.isArray(res?.[k]?.$values)) return res[k].$values;
            if (Array.isArray(res?.data?.[k])) return res.data[k];
            if (Array.isArray(res?.data?.[k]?.$values)) return res.data[k].$values;
        }

        const target = res?.data ?? res;
        if (target && typeof target === 'object') {
            for (const key of Object.keys(target)) {
                const val = target[key];
                if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                    return val;
                }
            }
        }
        return [];
    };

    const normalize = (rawList: any[]) =>
        rawList
            .map((item: any) => ({
                mI_Id: Number(item.mI_Id ?? item.MI_Id ?? item.mi_Id ?? 0),
                emcA_Id: Number(item.emcA_Id ?? item.EMCA_Id ?? item.emca_Id ?? 0),
                eyC_Id: Number(item.eyC_Id ?? item.EYC_Id ?? item.eyc_Id ?? 0),
                emcA_CategoryName: String(
                    item.emcA_CategoryName ??
                    item.EMCA_CategoryName ??
                    item.emca_CategoryName ??
                    item.eyC_CategoryName ??
                    item.EYC_CategoryName ??
                    item.categoryName ??
                    item.CategoryName ??
                    ''
                ).trim()
            }))
            .filter((c) => c.emcA_CategoryName && (c.eyC_Id > 0 || c.emcA_Id > 0));

    try {
        // 1. Primary: fetch mapped yearly categories for this academic year
        const response: any = await api.get(
            'exam',
            `/exam_master_category/category_drop_down_by_exam_year_category_list/${asmay_id}`
        );
        const list = normalize(extractArray(response));
        if (list.length > 0) {
            return { success: true, data: list };
        }
    } catch (error: any) {
        console.warn('Failed to fetch from category_drop_down_by_exam_year_category_list:', error?.message);
    }

    try {
        // 2. Fallback: fetch categories by academic year
        const response: any = await api.get(
            'exam',
            `/exam_master_category/exam_category_drop_down_by_academic_year_list/${asmay_id}`
        );
        const list = normalize(extractArray(response));
        if (list.length > 0) {
            return { success: true, data: list };
        }
    } catch (error: any) {
        console.warn('Failed to fetch from exam_category_drop_down_by_academic_year_list:', error?.message);
    }

    return { success: true, data: [] };
}

// --------------------------------------------
// Get Exam Subject Wizard Details By ID
// --------------------------------------------

export async function getExamSubjectWizardDetails(ecycE_Id: number) {
    if (!ecycE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/grade_and_exam_subject_mapping_list/${ecycE_Id}`;
    return await api.get<IExamSubjectWizard>('exam', url);
}

// --------------------------------------------
// Toggle Exam Subject Wizard Active / Inactive
// --------------------------------------------
export async function toggleExamSubjectWizard(ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_yearly_category/${ecysE_Id}`;
    return await api.put('exam', url);
}

export async function toggleExamSubjectWizardDetails(eyceS_Id: number) {
    if (!eyceS_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_subject/${eyceS_Id}`;
    return await api.put('exam', url);
}

export async function UpdateOrderedSubjectDetails(data: any) {
    const url = '/exam_subject_mapping/set_subject_order_number';
    return await api.put<any>('exam', url, data);
}

export async function addOrUpdateExamSubjectWizard(data: any) {
    const session = await auth();
    const payload = {
        ...data,
        MI_Id: data.MI_Id || (session?.mi_id ? Number(session.mi_id) : 0),
        UserId: data.UserId || (session?.user_id ? Number(session.user_id) : session?.userId ? Number(session.userId) : 0)
    };
    const url = 'exam_subject_mapping';
    return await api.post<any>('exam', url, payload);
}

export async function deleteExamSubjectWizard(ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_wizard/delete/${ecysE_Id}`;
    return await api.delete('exam', url);
}

export async function saveSubExamMapping(data: any) {
    const url = 'exam_subject_wizard/save_sub_exam_mapping';
    return await api.post<any>('exam', url, data);
}

export async function saveSubSubjectMapping(data: any) {
    const url = 'exam_subject_wizard/save_sub_subject_mapping';
    return await api.post<any>('exam', url, data);
}

export async function getSubjectsByCategory(emCA_Id: number, alternativeId?: number) {
    if (!emCA_Id && !alternativeId) return { success: true, data: [] };

    const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.$values)) return res.data.$values;
        if (Array.isArray(res?.$values)) return res.$values;

        const candidateKeys = [
            'subject_list',
            'subjectlist',
            'subjectList',
            'subjects',
            'get_subjects',
            'getsubjects',
            'category_subjects',
            'yearly_category_subjects'
        ];

        for (const k of candidateKeys) {
            if (Array.isArray(res?.[k])) return res[k];
            if (Array.isArray(res?.[k]?.$values)) return res[k].$values;
            if (Array.isArray(res?.data?.[k])) return res.data[k];
            if (Array.isArray(res?.data?.[k]?.$values)) return res.data[k].$values;
        }

        const target = res?.data ?? res;
        if (target && typeof target === 'object') {
            for (const key of Object.keys(target)) {
                const val = target[key];
                if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                    return val;
                }
                if (val && typeof val === 'object' && Array.isArray(val.$values) && val.$values.length > 0) {
                    return val.$values;
                }
            }
        }
        return [];
    };

    const primaryId = emCA_Id || alternativeId!;
    try {
        const url = `exam_subject_mapping/subjects_by_yearly_exam_category_list/${primaryId}`;
        const res: any = await api.get('exam', url);
        const list = extractArray(res);
        if (list.length > 0) {
            return { success: true, data: list };
        }
    } catch (e) {
        console.warn(`Failed to fetch subjects with primaryId ${primaryId}:`, e);
    }

    if (alternativeId && alternativeId !== primaryId) {
        try {
            const altUrl = `exam_subject_mapping/subjects_by_yearly_exam_category_list/${alternativeId}`;
            const altRes: any = await api.get('exam', altUrl);
            const list = extractArray(altRes);
            if (list.length > 0) {
                return { success: true, data: list };
            }
        } catch (e) {
            console.warn(`Failed to fetch subjects with alternativeId ${alternativeId}:`, e);
        }
    }

    return { success: true, data: [] };
}

export async function getSubSubjectSubExamList() {
    const url = 'exam_subject_mapping/sub_subjects_and_sub_exam_list';
    return await api.get('exam', url);
}

export async function getExamDropdownForWizardSubjectMapping(eyC_Id: number, alternativeId?: number) {
    if (!eyC_Id && !alternativeId) return { success: true, data: [] };
    const primaryId = eyC_Id || alternativeId!;
    try {
        const url = `exam_subject_mapping/exam_drop_down_for_wizard_subject_mapping/${primaryId}`;
        const res: any = await api.get<any>('exam', url);
        const data = res?.data ?? res;
        const hasData = Array.isArray(data)
            ? data.length > 0
            : Boolean(data?.exam_list?.length || data?.exams?.length || data?.$values?.length || data?.data?.$values?.length);
        if (hasData || !alternativeId || alternativeId === primaryId) {
            return res;
        }
    } catch (e) {
        if (!alternativeId || alternativeId === primaryId) throw e;
    }

    if (alternativeId && alternativeId !== primaryId) {
        const altUrl = `exam_subject_mapping/exam_drop_down_for_wizard_subject_mapping/${alternativeId}`;
        return await api.get<any>('exam', altUrl);
    }
}
// --------------------------------------------
// Get Sub Subjects Mapped List
// --------------------------------------------
export async function getSubSubjectsMappedList(eyceS_Id: number) {
    const url = `exam_subject_mapping/sub_subjects_mapped_popup_list/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}
// --------------------------------------------
// Get Sub Exams Mapped List
// --------------------------------------------
export async function getSubExamsMappedList(eyceS_Id: number) {
    console.info('subexams', eyceS_Id);
    const url = `exam_subject_mapping/sub_exams_mapped_popup_list/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}

// --------------------------------------------
// Get Sub Subjects and Sub Exams Mapped List
// --------------------------------------------
export async function getSubSubjectsAndSubExamsMappedList(eyceS_Id: number) {
    const url = `exam_subject_mapping/sub_subjects_and_sub_exams_mapped_popup_list/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}

export async function toggleMappedSubSubjectOrSubExam(eycesssId: number) {
    if (!eycesssId) throw new Error('Mapped SubSubject/SubExam ID is required');

    const url = `exam_subject_mapping/toggle_sub_subjects_or_sub_exam_mapped_popup/${eycesssId}`;
    return await api.put<{ success: boolean; message: string }>('exam', url);
}
