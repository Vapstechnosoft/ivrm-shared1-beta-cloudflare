'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import { format } from 'date-fns';

/**
 * Get initial details for Categorywise Attendance Report
 */
export const getCategoryWiseAttendanceInitialDetails = async (): Promise<ApiResponse<any>> => {
    return api.get('admission', '/CategoryWiseAttendance/getinitialdata');
};

export const getCategoryWiseAttendanceReport = async (
    asmaY_Id: number,
    fromdate: Date,
    categoryIds: number[],
    searchParams?: ApiSearchparams
): Promise<ApiResponse<any>> => {
    const amC_Id = categoryIds.length > 0 ? categoryIds[0] : 0;

    return api.post('admission', '/CategoryWiseAttendance/searchdata', {
        asmaY_Id,
        fromdate: format(fromdate, 'yyyy-MM-dd'),
        amC_Id,
        categorylistarray: categoryIds.map((id) => ({ amC_Id: id }))
    });
};
