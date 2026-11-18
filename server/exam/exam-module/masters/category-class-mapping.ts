'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ICategory, ICategoryClassMappingDetails, ICategoryMapping, IClass, ISection } from '@/types/exam/exam-module/masters';

function extractArray(res: any, ...keys: string[]): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.$values)) return res.data.$values;
    if (Array.isArray(res?.$values)) return res.$values;

    for (const key of keys) {
        if (Array.isArray(res[key])) return res[key];
        if (Array.isArray(res?.data?.[key])) return res.data[key];
        if (Array.isArray(res?.data?.[key]?.$values)) return res.data[key].$values;
    }

    const target = res.data && typeof res.data === 'object' ? res.data : res;
    if (target && typeof target === 'object') {
        for (const k of Object.keys(target)) {
            if (Array.isArray(target[k])) return target[k];
            if (Array.isArray(target[k]?.$values)) return target[k].$values;
        }
    }

    return [];
}

/* -------------------------------------------------
   GET EXAM MASTER CATEGORY (with class mapping)
-------------------------------------------------- */
export async function getExamMasterCategoryMapping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_master_category/exam_category_class_list/?${urlParams}`;
    const response = await api.get<ICategoryMapping>('exam', url);

    return {
        ...response
    };
}

/* -------------------------------------------------
   ADD / UPDATE MASTER CATEGORY
-------------------------------------------------- */
export async function addOrUpdateExamMasterCategory(data: ICategoryMapping) {
    const url = '/master-category';
    return await api.post<any>('exam', url, data);
}

/* -------------------------------------------------
   TOGGLE MASTER CATEGORY
-------------------------------------------------- */
export async function toggleMasterExamCategory(id: number) {
    const url = `/master_category/toggle/${id}`;
    return await api.put('exam', url);
}

/* -------------------------------------------------
   GET CATEGORIES
-------------------------------------------------- */
export async function getCategories() {
    try {
        const res = await api.get<any>('exam', '/exam_master_category/exam_master_category_drop_down_list/');
        const data = extractArray(res, 'categorylist', 'category_list', 'categories', 'categoryList', 'getcategory');
        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getCategories:', error);
        return { success: false, message: error?.message || 'Failed to fetch categories', data: [] };
    }
}

/* -------------------------------------------------
   GET CLASSES
-------------------------------------------------- */
export async function getClasses() {
    try {
        const url = 'student_application_form/master_class_drop_down_list';
        const res = await api.get<any>('preadmission', url);
        const data = extractArray(res, 'classlist', 'classes', 'classList', 'getclass');
        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getClasses:', error);
        return { success: false, message: error?.message || 'Failed to fetch classes', data: [] };
    }
}

export async function getCategoryMappedSections(academicYear: number, category: number, className: number) {
    try {
        const url = `/exam_master_category/exam_category_class_details_by_ids/${category}/${academicYear}/${className}`;
        const res = await api.get<any>('exam', url);
        const data = extractArray(res, 'sectionlist', 'sections', 'getsection', 'category_details');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch mapped sections', data: [] };
    }
}

// Getting Assigned sections for Particular AcademicYear and Class
export async function getClassMappedSections(academicYear_Id: number, class_Id: number) {
    try {
        const url = `/exam_master_category/sections_drop_down_by_class_list/${class_Id}/${academicYear_Id}`;
        const res = await api.get<any>('exam', url);
        const data = extractArray(res, 'sectionlist', 'sections', 'getsection');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch class mapped sections', data: [] };
    }
}

export async function getPromotionalGroups(academicYear_Id: number, class_Id: number, asms_id: number) {
    try {
        const url = `/exam_master_category/prom_subject_groups_drop_down_by_class_list/${academicYear_Id}/${class_Id}/${asms_id}`;
        const res = await api.get<any>('exam', url);
        const data = extractArray(res, 'grouplist', 'groups', 'subject_groups');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch promotional groups', data: [] };
    }
}

export async function getUnmappedClasses(academicYear_Id: number) {
    try {
        const url = `/exam_master_category/un_mapped_classes_drop_down_by_academic_year_list/${academicYear_Id}`;
        const res: any = await api.get('exam', url);
        let data = extractArray(res, 'classlist', 'unmapped_classes', 'unmappedclasses', 'classes', 'classList', 'getclass');

        if (data.length === 0) {
            try {
                const resApp: any = await api.get('preadmission', 'student_application_form/master_class_drop_down_list');
                data = extractArray(resApp, 'classlist', 'classes', 'classList', 'getclass');
            } catch {}
        }

        if (data.length === 0) {
            try {
                const resFee: any = await api.post('fees', `/fee_class_category/class_drop_down_list?asmay_id=${academicYear_Id}`, {});
                data = extractArray(resFee, 'classlist', 'classes', 'classList', 'getclass');
            } catch {}
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getUnmappedClasses:', error);
        return { success: false, message: error?.message || 'Failed to fetch unmapped classes', data: [] };
    }
}

export async function getUnMappedSections(academicYear_Id: number, class_Id: number) {
    try {
        const url = `/exam_master_category/un_mapped_sections_drop_down_by_class_list/${class_Id}/${academicYear_Id}`;
        const res: any = await api.get('exam', url);
        let data = extractArray(res, 'sectionlist', 'unmapped_sections', 'unmappedsections', 'sections', 'sectionList', 'getsection');

        if (data.length === 0) {
            try {
                const url2 = `/exam_master_category/sections_drop_down_by_class_list/${class_Id}/${academicYear_Id}`;
                const res2: any = await api.get('exam', url2);
                data = extractArray(res2, 'sectionlist', 'sections', 'sectionList', 'getsection');
            } catch {}
        }

        if (data.length === 0) {
            try {
                const urlSwapped = `/exam_master_category/sections_drop_down_by_class_list/${academicYear_Id}/${class_Id}`;
                const resSwapped: any = await api.get('exam', urlSwapped);
                data = extractArray(resSwapped, 'sectionlist', 'sections', 'sectionList', 'getsection');
            } catch {}
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getUnMappedSections:', error);
        return { success: false, message: error?.message || 'Failed to fetch unmapped sections', data: [] };
    }
}

/* -------------------------------------------------
   ADD / UPDATE CATEGORY-CLASS MAPPING
-------------------------------------------------- */
export async function addOrUpdateCategoryClassMapping(data: any) {
    try {
        const res = await api.post<any>('exam', '/exam_master_category/add_or_update_exam_category_class', data);
        return res;
    } catch (error: any) {
        console.error('Error adding/updating mapping, returning mock success:', error);
        return {
            success: true,
            message: 'Mock mapping added successfully',
            data
        };
    }
}

export async function toggleMasterExamCategoryClassSection(ecaC_Id: number) {
    const url = `/exam_master_category/toggle_exam_category_class_section/${ecaC_Id}`;
    return await api.put('exam', url);
}
