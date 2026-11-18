'use server';

import type { InwardSchema } from '@/schemas/visitors-management/transactions';
import type { InwardInitialData, InwardTransactionData } from '@/types/visitors-management/transactions';

// Mock Data
const mockEmployees = [
    { hrmE_Id: 101, hrmE_EmployeeFirstName: 'John Doe' },
    { hrmE_Id: 102, hrmE_EmployeeFirstName: 'Jane Smith' },
    { hrmE_Id: 103, hrmE_EmployeeFirstName: 'Robert Johnson' }
];

// biome-ignore lint/style/useConst: <explanation>
let mockInwardData: InwardTransactionData[] = [
    {
        foiN_Id: 1,
        foiN_Discription: 'Courier from Head Office',
        foiN_From: 'Head Office',
        foiN_ContactPerson: 'Ramesh',
        foiN_DateTime: '2023-10-25T10:30:00',
        foiN_InwardNo: 'INW/2023/001',
        foiN_PhoneNo: '9876543210',
        foiN_EmailId: 'ramesh@example.com',
        foiN_To: 101, // John Doe
        foiN_HandedOverTo: 102, // Jane Smith
        foiN_DispatchedBy: 103, // Robert Johnson
        foiN_Address: '123 Main St',
        hrmE_EmployeeFirstName: 'John Doe',
        firstName1: 'Jane',
        firstName2: '',
        firstName3: 'Smith',
        secnam1: 'Robert',
        secnam2: '',
        secnam3: 'Johnson',
        foiN_ActiveFlag: true
    },
    {
        foiN_Id: 2,
        foiN_Discription: 'Books Delivery',
        foiN_From: 'Amazon',
        foiN_ContactPerson: 'Delivery Agent',
        foiN_DateTime: '2023-10-26T14:00:00',
        foiN_InwardNo: 'INW/2023/002',
        foiN_PhoneNo: '9988776655',
        foiN_EmailId: '',
        foiN_To: 102, // Jane Smith
        foiN_HandedOverTo: 101, // John Doe
        foiN_DispatchedBy: 103, // Robert Johnson
        foiN_Address: '456 Tech Park',
        hrmE_EmployeeFirstName: 'Jane Smith',
        firstName1: 'John',
        firstName2: '',
        firstName3: 'Doe',
        secnam1: 'Robert',
        secnam2: '',
        secnam3: 'Johnson',
        foiN_ActiveFlag: true
    }
];

export async function getInwardData(): Promise<InwardInitialData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        emplist: mockEmployees,
        getdataall: mockInwardData
    };
}

export async function saveInwardData(data: InwardSchema) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Here you would typically map the schema data to your DB entity
    // and save it. For mock purposes, we'll just log it.
    console.log('Saving Inward Data:', data);

    // Simulate a successful save
    return { success: true, message: 'Inward Entry Saved Successfully' };
}

export async function deleteInwardData(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Deleting Inward ID:', id);
    return { success: true, message: 'Inward Entry Deleted Successfully' };
}
