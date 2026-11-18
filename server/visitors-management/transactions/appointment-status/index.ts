'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { AppointmentStatusInitialData } from '@/types/visitors-management/transactions';

export async function getAppointmentStatusData(): Promise<ApiResponse<AppointmentStatusInitialData>> {
    // Mock Data based on Old Architecture requirements
    const mockData: AppointmentStatusInitialData = {
        visitorlist: [
            {
                vmmV_Id: 1,
                vmmV_VisitorName: 'John Doe',
                vmmV_CkeckedInOutStatus: 'Checked In'
            },
            {
                vmmV_Id: 2,
                vmmV_VisitorName: 'Jane Smith',
                vmmV_CkeckedInOutStatus: 'Checked Out'
            }
        ]
    };
    return {
        success: true,
        message: 'Data fetched successfully',
        data: mockData
    };
}

export async function getAppointmentStatusEdit(vmmV_Id: number): Promise<ApiResponse<any>> {
    // Mock Data
    const mockData = {
        vmmV_Id: vmmV_Id,
        empname: 'Staff Member ' + vmmV_Id,
        vmmV_MeetingDateTime: new Date().toISOString(),
        vmmV_EntryDateTime: new Date().toISOString(),
        vmmV_Remarks: 'Regular visit from ' + vmmV_Id
    };
    return {
        success: true,
        message: 'Data fetched successfully',
        data: mockData
    };
}

export async function saveAppointmentStatus(data: any): Promise<ApiResponse<any>> {
    console.log('Saving Appointment Status:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        message: 'Appointment Status Saved Successfully',
        data: null
    };
}
