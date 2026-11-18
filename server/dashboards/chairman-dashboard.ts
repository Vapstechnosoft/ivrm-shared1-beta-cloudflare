'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export async function getDashboardCounts() {
    try {
        const url = '/configuration/dashboard';
        return await api.get<any>('preadmission', url);
    } catch (err) {
        console.error('getDashboardCounts Error', err);
        return { success: false, data: [] };
    }
}

export async function GetChairmanDashBoardFeesdata(ASMAY_ID?: number) {
    let activeAsmayId = ASMAY_ID;
    try {
        if (!activeAsmayId || activeAsmayId === 0) {
            const session = await auth();
            activeAsmayId = session?.asmay_id || (session as any)?.user?.asmay_id;
            
            // Dynamically retrieve active academic year from API if not in session to avoid hardcoding
            if (!activeAsmayId || activeAsmayId === 0) {
                try {
                    const yearResponse = await api.get<any>('fees', '/fee_class_category/academicyearlist');
                    const years = yearResponse?.data || [];
                    if (Array.isArray(years)) {
                        const activeYear = years.find((y: any) => y.selected || y.Selected || y.activeFlag === 1 || y.asmaY_ActiveFlag === 1);
                        if (activeYear) {
                            activeAsmayId = activeYear.asmaY_Id || activeYear.asmay_id || activeYear.ASMAY_Id;
                        }
                    }
                } catch (e) {
                    console.error('Error fetching academic years list', e);
                }
            }
        }
        
        // Use a leading slash to match /api correctly, and append ASMAY_ID if resolved
        const baseUrl = '/FeesCommon/GetChairmanDashBoardFeesdata';
        const url = activeAsmayId ? `${baseUrl}?ASMAY_ID=${activeAsmayId}` : baseUrl;
            
        return await api.get<any>('fees', url);
    } catch (err) {
        console.error('GetChairmanDashBoardFeesdata Error', err);
        return { success: false, data: [] };
    }
}

export async function GetTeacherCount(mi_id?: number) {
    try {
        let activeMiId = mi_id;
        if (!activeMiId || activeMiId === 0) {
            const session = await auth();
            activeMiId = session?.mi_id || (session as any)?.user?.mi_id;
        }
        const url = `/api/MasterDropDown/get_today_employee_punch_counts?MI_Id=${activeMiId}`;
        return await api.get<any>('hmslms', url);
    } catch (err) {
        console.error('GetTeacherCount Error', err);
        return { success: false, data: [] };
    }
}
