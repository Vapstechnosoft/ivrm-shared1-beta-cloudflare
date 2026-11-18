'use server';
import { api } from '@/lib/apiService';
// biome-ignore lint/style/useImportType: <explanation>
import { IMasterInstitution } from '@/types/exam/exam-module/report';

import { auth } from '@/lib/auth';

export async function getExamReportCard(data: any) {
    const session = await auth();
    const miId = data.mI_Id || data.MI_Id || (session as any)?.mi_id || session?.user?.mi_id || (session as any)?.user?.mI_Id || 30;

    const studentArr = Array.isArray(data.studentList)
        ? data.studentList.map((s: any) => ({
              AMST_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s),
              amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s)
          }))
        : data.amsT_Ids
          ? String(data.amsT_Ids)
                .split(',')
                .filter(Boolean)
                .map((id: string) => ({
                    AMST_Id: Number(id),
                    amsT_Id: Number(id)
                }))
          : [];

    const payload = {
        ...data,
        mI_Id: Number(miId),
        MI_Id: Number(miId),
        asmaY_Id: Number(data.asmaY_Id || data.ASMAY_Id || 0),
        ASMAY_Id: Number(data.asmaY_Id || data.ASMAY_Id || 0),
        asmcL_Id: Number(data.asmcL_Id || data.ASMCL_Id || 0),
        ASMCL_Id: Number(data.asmcL_Id || data.ASMCL_Id || 0),
        asmS_Id: Number(data.asmS_Id || data.ASMS_Id || 0),
        ASMS_Id: Number(data.asmS_Id || data.ASMS_Id || 0),
        emE_Id: Number(data.emE_Id || data.EME_Id || 0),
        EME_Id: Number(data.emE_Id || data.EME_Id || 0),
        temp_AmstIds: studentArr,
        Temp_AmstIds: studentArr,
        studentList: studentArr,
        studentlist: studentArr
    };

    const url = '/individual_exam_report_card/exam_report_card';
    console.info('url', url);
    console.info('payload', payload);
    return await api.post<any>('exam', url, payload);
}

//Elective Subject Report

export async function getExamElectivesReport(payload: any) {
    const {
        ASMAY_Id,
        Type = 'All',
        EMCA_Id = 0,
        EMG_Id = 0,
        ISMS_Id = 0,
        ASMCL_Id = 0,
        ASMS_Id = 0,
        mob_flg = 0,
        mail_flg = 0,
        Left_Flag = 0,
        Deactive_Flag = 0
    } = payload;

    const params = new URLSearchParams({
        // MI_Id: '30',
        ASMAY_Id: String(ASMAY_Id),
        Type,
        EMCA_Id: String(EMCA_Id),
        EMG_Id: String(EMG_Id),
        ISMS_Id: String(ISMS_Id),
        ASMCL_Id: String(ASMCL_Id),
        ASMS_Id: String(ASMS_Id),
        mob_flg: String(mob_flg),
        mail_flg: String(mail_flg),
        Left_Flag: String(Left_Flag),
        Deactive_Flag: String(Deactive_Flag)
    });

    const url = `/baldwin_elective_report/exam_elective_report?${params.toString()}`;
    const res = await api.get<any>('exam', url);
    return res;
}

export async function getClassDropDownByYearCategoryList(asmaY_Id: number, emcA_Id?: number | 'All') {
    try {
        const id = emcA_Id === 'All' ? 0 : emcA_Id || 0;
        const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}/${id}`;
        const response: any = await api.get('exam', url);
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.$values)) return response.data.$values;
        if (Array.isArray(response?.$values)) return response.$values;
        if (Array.isArray(response?.classlist)) return response.classlist;
        if (Array.isArray(response?.getclasses)) return response.getclasses;
        return response?.data || [];
    } catch (e) {
        console.error('getClassDropDownByYearCategoryList error:', e);
        return [];
    }
}

export async function getSectionDropDownByYearCategoryClassList(asmaY_Id: number, emcA_Id: number, asmcL_Id: number) {
    try {
        const id = emcA_Id || 0;
        const url = `/exam_master_category/sections_dropdown_by_year_category_class/${asmaY_Id}/${id}/${asmcL_Id}`;
        const response: any = await api.get('exam', url);
        let list: any[] = [];
        if (Array.isArray(response)) list = response;
        else if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response?.data?.$values)) list = response.data.$values;
        else if (Array.isArray(response?.$values)) list = response.$values;
        else if (Array.isArray(response?.sectionlist)) list = response.sectionlist;
        else if (Array.isArray(response?.getsections)) list = response.getsections;

        if (list.length > 0) return list;

        // Fallback to standard section dropdown by academic year and class
        const fallbackUrl = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
        const fallbackRes: any = await api.get('exam', fallbackUrl);
        if (Array.isArray(fallbackRes)) return fallbackRes;
        if (Array.isArray(fallbackRes?.data)) return fallbackRes.data;
        if (Array.isArray(fallbackRes?.data?.$values)) return fallbackRes.data.$values;
        return [];
    } catch (e) {
        console.error('getSectionDropDownByYearCategoryClassList error:', e);
        return [];
    }
}

export async function getCategoryDropDownByYearList(asmaY_Id: number) {
    try {
        const url = `/exam_master_category/exam_category_drop_down_by_academic_year_list/${asmaY_Id}`;
        const response: any = await api.get('exam', url);
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.$values)) return response.data.$values;
        if (Array.isArray(response?.$values)) return response.$values;
        if (Array.isArray(response?.category_list)) return response.category_list;
        if (Array.isArray(response?.catlist)) return response.catlist;
        return response?.data || [];
    } catch (e) {
        console.error('getCategoryDropDownByYearList error:', e);
        return [];
    }
}

export async function getSubjectGroupDropDownByYearCategoryList(asmaY_Id: number, emcA_Id?: number | 'All') {
    try {
        const id = emcA_Id === 'All' ? 0 : emcA_Id || 0;
        const url = `/baldwin_elective_report/group_drop_down_by_year_category_with_flag?asmay_id=${asmaY_Id}&emca_id=${id}`;
        let response: any = await api.get('exam', url).catch(() => null);

        let list: any[] = [];
        if (Array.isArray(response)) list = response;
        else if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response?.data?.$values)) list = response.data.$values;
        else if (Array.isArray(response?.$values)) list = response.$values;
        else if (Array.isArray(response?.grouplist)) list = response.grouplist;
        else if (Array.isArray(response?.group_list)) list = response.group_list;
        else if (Array.isArray(response?.get_groups)) list = response.get_groups;

        if (list.length > 0) return list;

        // Fallback 1: Uppercase params
        const fallbackUrl = `/baldwin_elective_report/group_drop_down_by_year_category_with_flag?ASMAY_Id=${asmaY_Id}&EMCA_Id=${id}`;
        response = await api.get('exam', fallbackUrl).catch(() => null);
        if (Array.isArray(response)) list = response;
        else if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response?.data?.$values)) list = response.data.$values;
        else if (Array.isArray(response?.$values)) list = response.$values;
        else if (Array.isArray(response?.grouplist)) list = response.grouplist;

        if (list.length > 0) return list;

        // Fallback 2: Master subject group dropdown
        const masterRes: any = await api.get('exam', '/master_subject_group/subjects_group_drop_down_by_list').catch(() => null);
        if (Array.isArray(masterRes)) return masterRes;
        if (Array.isArray(masterRes?.data)) return masterRes.data;
        if (Array.isArray(masterRes?.data?.$values)) return masterRes.data.$values;
        if (Array.isArray(masterRes?.$values)) return masterRes.$values;
        return response?.data || [];
    } catch (e) {
        console.error('getSubjectGroupDropDownByYearCategoryList error:', e);
        return [];
    }
}

export async function getSubjectDropDownByYearCategorySubjectGroupList(asmaY_Id: number, emcA_Id: number | 'All', emG_Id: number) {
    try {
        const id = emcA_Id === 'All' || !emcA_Id ? 0 : emcA_Id;

        const extractSubjects = (res: any): any[] => {
            if (!res) return [];
            if (Array.isArray(res)) return res;
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res.data?.$values)) return res.data.$values;
            if (Array.isArray(res.$values)) return res.$values;
            if (Array.isArray(res.subjectlist)) return res.subjectlist;
            if (Array.isArray(res.subject_list)) return res.subject_list;
            if (Array.isArray(res.get_subjects)) return res.get_subjects;
            if (Array.isArray(res.getsubjects)) return res.getsubjects;
            if (Array.isArray(res.getsubjectlist)) return res.getsubjectlist;
            if (Array.isArray(res.edit_subjectlist)) return res.edit_subjectlist;
            if (Array.isArray(res.subjectgroupdetails)) return res.subjectgroupdetails;
            if (Array.isArray(res.subject_group_details)) return res.subject_group_details;
            if (Array.isArray(res.ismS_SubjectGroup)) return res.ismS_SubjectGroup;
            if (Array.isArray(res.subjects)) return res.subjects;
            return [];
        };

        // Attempt 1: Standard query params (camelCase)
        let url = `/baldwin_elective_report/subjects_drop_down_by_year_category_group_with_flag?asmay_id=${asmaY_Id}&emca_id=${id}&emg_id=${emG_Id}`;
        let response: any = await api.get('exam', url).catch(() => null);
        let list = extractSubjects(response);
        if (list.length > 0) return list;

        // Attempt 2: Query params (PascalCase)
        const fallbackUrl1 = `/baldwin_elective_report/subjects_drop_down_by_year_category_group_with_flag?ASMAY_Id=${asmaY_Id}&EMCA_Id=${id}&EMG_Id=${emG_Id}`;
        response = await api.get('exam', fallbackUrl1).catch(() => null);
        list = extractSubjects(response);
        if (list.length > 0) return list;

        // Attempt 3: Route parameters with flag
        const fallbackUrl2 = `/baldwin_elective_report/subjects_drop_down_by_year_category_group_with_flag/${asmaY_Id}/${id}/${emG_Id}`;
        response = await api.get('exam', fallbackUrl2).catch(() => null);
        list = extractSubjects(response);
        if (list.length > 0) return list;

        // Attempt 4: Route parameters without flag
        const fallbackUrl3 = `/baldwin_elective_report/subjects_drop_down_by_year_category_group/${asmaY_Id}/${id}/${emG_Id}`;
        response = await api.get('exam', fallbackUrl3).catch(() => null);
        list = extractSubjects(response);
        if (list.length > 0) return list;

        // Attempt 5: POST request with payload
        response = await api.post('exam', '/baldwin_elective_report/subjects_drop_down_by_year_category_group_with_flag', {
            ASMAY_Id: asmaY_Id,
            EMCA_Id: id,
            EMG_Id: emG_Id
        }).catch(() => null);
        list = extractSubjects(response);
        if (list.length > 0) return list;

        // Attempt 6: Master Subject Group Details by group ID
        if (emG_Id) {
            const groupDetailsUrl = `/master_subject_group/subject_group_details_view_by_id/${emG_Id}`;
            response = await api.get('exam', groupDetailsUrl).catch(() => null);
            list = extractSubjects(response);
            if (list.length > 0) return list;

            const groupDetailsUrl2 = `/master_subject_group/GetSubjectGroupDetailsViewById/${emG_Id}`;
            response = await api.get('exam', groupDetailsUrl2).catch(() => null);
            list = extractSubjects(response);
            if (list.length > 0) return list;
        }

        // Attempt 7: Master Subject dropdown list fallback
        const masterSubUrl = '/master_subject/master_subject_drop_down_list';
        response = await api.get('exam', masterSubUrl).catch(() => null);
        list = extractSubjects(response);
        if (list.length > 0) return list;

        return response?.data || [];
    } catch (e) {
        console.error('getSubjectDropDownByYearCategorySubjectGroupList error:', e);
        return [];
    }
}

export async function getMasterInstitution() {
    const url = '/baldwin_elective_report/master_institution_details';
    return await api.get<IMasterInstitution>('exam', url);
}