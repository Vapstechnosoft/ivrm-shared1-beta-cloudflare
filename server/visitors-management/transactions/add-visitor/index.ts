'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { AddVisitorInitialData, AppointmentVisitorData, PreviousVisitorData } from '@/types/visitors-management/transactions';

export async function getAddVisitorData(): Promise<ApiResponse<AddVisitorInitialData>> {
    // In a real scenario, we would fetch from API:
    // return await api.get('visitors-management', '/AddVisitors/getDetails/1');

    // Returning Mock Data as per instructions
    const mockData: AddVisitorInitialData = {
        emplist: [
            { hrmE_Id: 101, hrmE_EmployeeFirstName: 'John Doe' },
            { hrmE_Id: 102, hrmE_EmployeeFirstName: 'Jane Smith' },
            { hrmE_Id: 103, hrmE_EmployeeFirstName: 'Robert Brown' }
        ],
        gridoptions: [
            {
                vmmV_Id: 1,
                vmmV_VisitorName: 'Alice Wonderland',
                vmmV_VisitorContactNo: '9876543210',
                vmmV_VisitorEmailid: 'alice@example.com',
                vmmV_MeetingDateTime: new Date().toISOString(),
                vmmV_EntryDateTime: '10:00',
                vmmV_FromPlace: 'New York',
                empname: 'John Doe',
                vmmV_MeetingPurpose: 'Official Meeting',
                vmmV_FromAddress: '123, 5th Avenue',
                vmmV_MeetingLocation: 'Conference Room A',
                vmmV_BlockedFlg: false,
                vmmV_IDCardNo: 'ID-001',
                vmmV_CkeckedInOutStatus: 'Checked In'
            },
            {
                vmmV_Id: 2,
                vmmV_VisitorName: 'Bob Builder',
                vmmV_VisitorContactNo: '9123456789',
                vmmV_VisitorEmailid: 'bob@example.com',
                vmmV_MeetingDateTime: new Date().toISOString(),
                vmmV_EntryDateTime: '11:30',
                vmmV_FromPlace: 'London',
                empname: 'Jane Smith',
                vmmV_MeetingPurpose: 'Site Visit',
                vmmV_FromAddress: '456, Westminster',
                vmmV_MeetingLocation: 'Reception',
                vmmV_BlockedFlg: false,
                vmmV_IDCardNo: 'ID-002',
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

export async function saveAddVisitor(_data: any): Promise<ApiResponse<any>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        success: true,
        message: 'Record Saved Successfully',
        data: null
    };
}

export async function getPreviousVisitors(_searchQuery: string): Promise<ApiResponse<PreviousVisitorData[]>> {
    // Mock Search
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
    return {
        success: true,
        message: 'Found previous visitors',
        data: [
            {
                vmmV_Id: 10,
                vmmV_VisitorName: 'Old Visitor 1',
                vmmV_VisitorContactNo: '9988776655',
                vmmV_VisitorEmailid: 'old1@example.com',
                vmmV_FromPlace: 'Old Town',
                vmmV_VisitorPhoto: '',
                vmmV_FromAddress: '123 Old St'
            },
            {
                vmmV_Id: 11,
                vmmV_VisitorName: 'Old Visitor 2',
                vmmV_VisitorContactNo: '8877665544',
                vmmV_VisitorEmailid: 'old2@example.com',
                vmmV_FromPlace: 'New Town',
                vmmV_VisitorPhoto: '',
                vmmV_FromAddress: '456 New St'
            }
        ]
    };
}

export async function getAppointmentVisitors(_searchQuery: string): Promise<ApiResponse<AppointmentVisitorData[]>> {
    // Mock Search
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
    return {
        success: true,
        message: 'Found appointment visitors',
        data: [
            {
                vpA_Id: 20,
                vpA_VisitorName: 'Approved Appt',
                vpA_ContactNo: '7766554433',
                vpA_EmailId: 'appt@example.com',
                vpA_FromPlace: 'City Center',
                vpA_VisitDateTime: new Date().toISOString(),
                empname: 'John Doe',
                vpA_Purpose: 'Scheduled Meeting'
            }
        ]
    };
}
