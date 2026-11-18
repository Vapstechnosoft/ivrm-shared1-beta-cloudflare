'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { VisitorAppointmentInitialData } from '@/types/visitors-management/transactions';

export async function getVisitorAppointmentData(): Promise<ApiResponse<VisitorAppointmentInitialData>> {
    // Mock Data
    const mockData: VisitorAppointmentInitialData = {
        emplist: [
            { hrmE_Id: 1, hrmE_EmployeeFirstName: 'Staff A' },
            { hrmE_Id: 2, hrmE_EmployeeFirstName: 'Staff B' },
            { hrmE_Id: 3, hrmE_EmployeeFirstName: 'Principal' }
        ],
        getdata: [
            {
                vmaP_Id: 1,
                vmaP_VisitorName: 'John Visitor',
                vmaP_VisitorContactNo: '9988776655',
                vmaP_VisitorEmailid: 'john@example.com',
                EMPNAME: 'Staff A',
                vmaP_FromPlace: 'City Center',
                vmaP_VisitTypeFlg: 'Official',
                vmaP_EntryDateTime: new Date().toISOString(),
                vmaP_MeetingPurpose: 'Discussion',
                vmaP_MeetingLocation: 'Room 101',
                vmaP_Status: 'Waiting',
                vmaP_ActiveFlag: true,
                RCNT: 1
            },
            {
                vmaP_Id: 2,
                vmaP_VisitorName: 'Jane Guest',
                vmaP_VisitorContactNo: '8877665544',
                vmaP_VisitorEmailid: 'jane@example.com',
                EMPNAME: 'Principal',
                vmaP_FromPlace: 'Bangalore',
                vmaP_VisitTypeFlg: 'Personal',
                vmaP_EntryDateTime: new Date().toISOString(),
                vmaP_MeetingPurpose: 'Personal Visit',
                vmaP_MeetingLocation: 'Principal Office',
                vmaP_Status: 'Approved',
                vmaP_ActiveFlag: true
            }
        ]
    };
    return {
        success: true,
        message: 'Data fetched successfully',
        data: mockData
    };
}

export async function saveVisitorAppointment(_data: any): Promise<ApiResponse<any>> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        message: 'Appointment Saved Successfully',
        data: null
    };
}
