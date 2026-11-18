'use server';

import { api } from '@/lib/apiService';

export async function getNdaStudentProfileDetails() {
    const url = `/StudentDashboard/Getdetails`;
    try {
        const res = await api.post<any>('admission', url, {});
        return res;
    } catch (error: any) {
        console.error('[Server] getNdaStudentProfileDetails error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getNdaSiblingDetails(updateFlag: boolean) {
    const url = `/StudentDashboard/Getdetails12?updateflag1=${updateFlag}&stdupdate=1`;
    try {
        const res = await api.post<any>('admission', url, {});
        return res;
    } catch (error: any) {
        console.error('[Server] getNdaSiblingDetails error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function saveNdaProfileUpdateRequest(payload: any) {
    const url = '/StudentDashboard/NDAsaverequest';
    try {
        const res = await api.post<any>('admission', url, payload);
        return res;
    } catch (error: any) {
        console.error('[Server] saveNdaProfileUpdateRequest error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function uploadNdaProfilePic(payload: { file: string[] }) {
    const url = '/StudentDashboard/Uploadprofilepic';
    try {
        const res = await api.post<any>('admission', url, payload);
        return res;
    } catch (error: any) {
        console.error('[Server] uploadNdaProfilePic error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}
