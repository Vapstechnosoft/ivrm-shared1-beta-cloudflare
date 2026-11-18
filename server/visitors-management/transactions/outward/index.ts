'use server';

import type { OutwardSchema } from '@/schemas/visitors-management/transactions';
import type { OutwardInitialData, OutwardTransactionData } from '@/types/visitors-management/transactions';

// Mock Data
const mockEmployees = [
    { hrmE_Id: 101, hrmE_EmployeeFirstName: 'John Doe' },
    { hrmE_Id: 102, hrmE_EmployeeFirstName: 'Jane Smith' },
    { hrmE_Id: 103, hrmE_EmployeeFirstName: 'Robert Johnson' }
];

// biome-ignore lint/style/useConst: <explanation>
let mockOutwardData: OutwardTransactionData[] = [
    {
        foouT_Id: 1,
        foouT_Discription: 'Confidential Documents',
        foouT_From: 'Admin Dept',
        foouT_To: 'External Auditor',
        foouT_DateTime: '2023-10-27T11:00:00',
        foouT_OutwardNo: 'OUT/2023/001',
        foouT_PhoneNo: '9876543210',
        foouT_EmailId: 'auditor@example.com',
        foouT_Address: '123, Financial District, City',
        foouT_DispatchedBy: 101,
        hrmE_EmployeeFirstName: 'John Doe',
        foouT_DispatchedPhNo: '9988776655',
        foouT_DispatchedThrough: 'Courier',
        foouT_DispatchedDeatils: 'DTDC123456789',
        foouT_ActiveFlag: true
    },
    {
        foouT_Id: 2,
        foouT_Discription: 'Student Records Transfer',
        foouT_From: 'Registrar',
        foouT_To: 'University Board',
        foouT_DateTime: '2023-10-28T09:30:00',
        foouT_OutwardNo: 'OUT/2023/002',
        foouT_PhoneNo: '080-12345678',
        foouT_EmailId: 'board@university.edu',
        foouT_Address: 'University Campus, Main Block',
        foouT_DispatchedBy: 102,
        hrmE_EmployeeFirstName: 'Jane Smith',
        foouT_DispatchedPhNo: '1122334455',
        foouT_DispatchedThrough: 'Hand Delivery',
        foouT_DispatchedDeatils: 'By Staff Member',
        foouT_ActiveFlag: true
    }
];

export async function getOutwardData(): Promise<OutwardInitialData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        emplist: mockEmployees,
        getdata: mockOutwardData
    };
}

export async function saveOutwardData(data: OutwardSchema) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Saving Outward Data:', data);

    // Simulate return
    return { success: true, message: 'Outward Entry Saved Successfully' };
}

export async function deleteOutwardData(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleting Outward ID:', id);
    return { success: true, message: 'Outward Entry Deleted Successfully' };
}
