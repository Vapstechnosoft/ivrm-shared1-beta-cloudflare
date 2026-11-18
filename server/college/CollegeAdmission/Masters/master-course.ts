'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const BASE_URL = '/MasterCourse';

export async function getMasterCourseInitialData(id?: number) {
    try {
        const session = (await auth()) as any;
        const miId = id || Number(session?.mi_id || session?.user?.mi_id || 2);
        return await api.get<any>('college', `${BASE_URL}/getalldetails/${miId}`);
    } catch (error: any) {
        console.error('[Server] getMasterCourseInitialData error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch initial data'
        } as any;
    }
}

export async function saveMasterCourse(data: any) {
    try {
        const session = (await auth()) as any;
        const miId = data?.mI_Id || data?.MI_Id || Number(session?.mi_id || session?.user?.mi_id || 2);
        const asmayId =
            data?.asmaY_Id || data?.ASMAY_Id || Number(session?.asmay_id || session?.user?.asmay_id || session?.user?.asmaY_Id || 0);

        const payload = {
            mI_Id: miId,
            asmaY_Id: asmayId,
            amcO_Id: data.amcO_Id ?? data.AMCO_Id ?? 0,
            amcO_CourseName: data.amcO_CourseName ?? data.AMCO_CourseName ?? '',
            amcO_CourseCode: data.amcO_CourseCode ?? data.AMCO_CourseCode ?? '',
            amcO_CourseInfo: data.amcO_CourseInfo ?? data.AMCO_CourseInfo ?? '',
            amcO_NoOfYears: Number(data.amcO_NoOfYears ?? data.AMCO_NoOfYears ?? 0),
            amcO_NoOfSemesters: Number(data.amcO_NoOfSemesters ?? data.AMCO_NoOfSemesters ?? 0),
            amcO_MinAttPer: Number(data.amcO_MinAttPer ?? data.AMCO_MinAttPer ?? 0),
            amcO_Order: Number(data.amcO_Order ?? data.AMCO_Order ?? 0),
            amcO_CourseFlag: Boolean(data.amcO_CourseFlag ?? data.AMCO_CourseFlag),
            amcO_FeeAplFlg: Boolean(data.amcO_FeeAplFlg ?? data.AMCO_FeeAplFlg),
            amcO_RegFeeFlg: Boolean(data.amcO_RegFeeFlg ?? data.AMCO_RegFeeFlg),
            amcO_ActiveFlag: data.amcO_ActiveFlag ?? data.AMCO_ActiveFlag ?? true,

            // C# model compatibility
            MI_Id: miId,
            ASMAY_Id: asmayId,
            AMCO_Id: data.amcO_Id ?? data.AMCO_Id ?? 0,
            AMCO_CourseName: data.amcO_CourseName ?? data.AMCO_CourseName ?? '',
            AMCO_CourseCode: data.amcO_CourseCode ?? data.AMCO_CourseCode ?? '',
            AMCO_CourseInfo: data.amcO_CourseInfo ?? data.AMCO_CourseInfo ?? '',
            AMCO_NoOfYears: Number(data.amcO_NoOfYears ?? data.AMCO_NoOfYears ?? 0),
            AMCO_NoOfSemesters: Number(data.amcO_NoOfSemesters ?? data.AMCO_NoOfSemesters ?? 0),
            AMCO_MinAttPer: Number(data.amcO_MinAttPer ?? data.AMCO_MinAttPer ?? 0),
            AMCO_Order: Number(data.amcO_Order ?? data.AMCO_Order ?? 0),
            AMCO_CourseFlag: Boolean(data.amcO_CourseFlag ?? data.AMCO_CourseFlag),
            AMCO_FeeAplFlg: Boolean(data.amcO_FeeAplFlg ?? data.AMCO_FeeAplFlg),
            AMCO_RegFeeFlg: Boolean(data.amcO_RegFeeFlg ?? data.AMCO_RegFeeFlg),
            AMCO_ActiveFlag: data.amcO_ActiveFlag ?? data.AMCO_ActiveFlag ?? true
        };

        const response = await api.post<any>('college', `${BASE_URL}/Savedetails`, payload);
        console.info('[Server] saveMasterCourse response:', {
            returnval: (response as any)?.returnval,
            duplicateval: (response as any)?.duplicateval,
            msg: (response as any)?.msg,
            retrunMsg: (response as any)?.retrunMsg
        });
        return response;
    } catch (error: any) {
        console.error('[Server] saveMasterCourse error:', error);
        return {
            success: false,
            returnval: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to save master course'
        } as any;
    }
}

export async function editMasterCourse(data: any) {
    try {
        const session = (await auth()) as any;
        const miId = data?.mI_Id || data?.MI_Id || Number(session?.mi_id || session?.user?.mi_id || 2);
        const payload = {
            mI_Id: miId,
            MI_Id: miId,
            amcO_Id: data.amcO_Id ?? data.AMCO_Id ?? 0,
            AMCO_Id: data.amcO_Id ?? data.AMCO_Id ?? 0,
            ...data
        };
        const response = await api.post<any>('college', `${BASE_URL}/EditData`, payload);
        return response;
    } catch (error: any) {
        console.error('[Server] editMasterCourse error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to edit master course'
        } as any;
    }
}

export async function deactivateMasterCourse(data: any) {
    try {
        const session = (await auth()) as any;
        const miId = data?.mI_Id || data?.MI_Id || Number(session?.mi_id || session?.user?.mi_id || 2);
        const payload = {
            ...data,
            mI_Id: miId,
            MI_Id: miId,
            amcO_Id: data.amcO_Id ?? data.AMCO_Id ?? 0,
            AMCO_Id: data.amcO_Id ?? data.AMCO_Id ?? 0
        };
        const response = await api.post<any>('college', `${BASE_URL}/Deletedetails`, payload);
        return response;
    } catch (error: any) {
        console.error('[Server] deactivateMasterCourse error:', error);
        return {
            success: false,
            returnval: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to update record status'
        } as any;
    }
}

export async function saveMasterCourseOrder(data: any) {
    try {
        const session = (await auth()) as any;
        const miId = data?.mI_Id || data?.MI_Id || Number(session?.mi_id || session?.user?.mi_id || 2);
        const payload = {
            mI_Id: miId,
            MI_Id: miId,
            ...data
        };
        const response = await api.post<any>('college', `${BASE_URL}/getOrder`, payload);
        return response;
    } catch (error: any) {
        console.error('[Server] saveMasterCourseOrder error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to save order'
        } as any;
    }
}
