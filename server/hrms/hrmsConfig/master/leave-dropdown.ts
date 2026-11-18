'use server';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { api } from '@/lib/apiService';

export async function getLeaveDropdown() {
    const url = `/api/LeaveAuthorization/get_authorization_details_by_miid?mi_id=${HRMS_MI_ID}`;
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;

        if (res.success || String(res.success) === 'true') {
            // The API returns an object with multiple lists (leaves, grades, etc.)
            // We only need 'leaves'
            const leaves = (res.data?.leaves || [])
                .map((item: any) => ({
                    key: item.hrmL_Id,
                    value: item.hrmL_LeaveName
                }))
                .filter((item: any) => item.key && item.value);

            return {
                success: true,
                data: leaves,
                message: 'Leave dropdown fetched successfully'
            };
        }
        return {
            success: false,
            data: [],
            message: res.message || 'Failed to fetch leave dropdown'
        };
    } catch (error: any) {
        console.error('Error fetching leave dropdown', error);
        return {
            success: false,
            data: [],
            message: error?.message || 'Error fetching leave dropdown'
        };
    }
}
