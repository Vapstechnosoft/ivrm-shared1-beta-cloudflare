'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { MasterLocationInitialData } from '@/types/visitors-management/masters';

export async function getMasterLocationData(): Promise<ApiResponse<MasterLocationInitialData>> {
    // Mock
    return {
        success: true,
        message: 'Data fetched successfully',
        data: {
            getdata: [
                {
                    vmmL_Id: 1,
                    vmmL_Location: 'Gate 1',
                    vmmL_LocationDescription: 'Main Entrance',
                    vmmL_LocationFacilities: 'Security Check, Waiting Area',
                    vmmL_ActiveFlg: true
                },
                {
                    vmmL_Id: 2,
                    vmmL_Location: 'Reception',
                    vmmL_LocationDescription: 'Admin Block Reception',
                    vmmL_LocationFacilities: 'Seating, Water',
                    vmmL_ActiveFlg: true
                }
            ]
        }
    };
}

export async function saveMasterLocation(data: any): Promise<ApiResponse<any>> {
    console.log('Saving Location:', data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: 'Saved Successfully', data: null };
}
