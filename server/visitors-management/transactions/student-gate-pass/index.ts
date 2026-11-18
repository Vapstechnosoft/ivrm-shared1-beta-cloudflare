'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { StudentGatePassInitialData } from '@/types/visitors-management/transactions';

export async function getStudentGatePassData(): Promise<ApiResponse<StudentGatePassInitialData>> {
    const mockData: StudentGatePassInitialData = {
        yearlist: [
            { asmaY_Id: 1, asmaY_Year: '2023-2024' },
            { asmaY_Id: 2, asmaY_Year: '2024-2025', Selected: true }
        ],
        alldata: [
            {
                gphS_Id: 1,
                studentname: 'Raj Kumar',
                amsT_AdmNo: 'ADM1002',
                asmcL_ClassName: 'Class 9',
                asmC_SectionName: 'A',
                amsT_MobileNo: '9876543210',
                gphS_GatePassNo: 'SGP-2023-001',
                gphS_ReceiverName: 'Father',
                gphS_ReceiverPhoneNo: '9988776655',
                gphS_ReceiverIdProof: 'Aadhar',
                gphS_ReceiverIdProofNo: '123456789012',
                gphS_IDCardNo: 'ID001',
                gphS_DateTime: new Date().toISOString(),
                gphS_Remarks: 'Sick leave early pickup',
                gphS_ActiveFlg: true,
                asmaY_Id: 2,
                asmcL_Id: 2,
                asmS_Id: 1,
                amsT_Id: 102
            }
        ]
    };

    return {
        success: true,
        message: 'Data fetched successfully',
        data: mockData
    };
}

export async function saveStudentGatePass(data: any): Promise<ApiResponse<any>> {
    console.log('Saving Student Gate Pass:', data);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
        success: true,
        message: 'Gate Pass Generated Successfully!!!',
        data: null
    };
}

export async function deactivateStudentGatePass(gphS_Id: number): Promise<ApiResponse<any>> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
        success: true,
        message: 'Status Changed Successfully!!!',
        data: null
    };
}

// Reuse methods if needed for classes, sections, students
export async function getGatePassClasses(asmaY_Id: number): Promise<ApiResponse<any>> {
    return {
        success: true,
        message: 'Classes fetched',
        data: {
            classList: [
                { asmcL_Id: 1, asmcL_ClassName: 'Class 8' },
                { asmcL_Id: 2, asmcL_ClassName: 'Class 9' }
            ]
        }
    };
}

export async function getGatePassSections(asmaY_Id: number, asmcL_Id: number): Promise<ApiResponse<any>> {
    return {
        success: true,
        message: 'Sections fetched',
        data: {
            sectionList: [
                { asmS_Id: 1, asmC_SectionName: 'A' },
                { asmS_Id: 2, asmC_SectionName: 'B' }
            ]
        }
    };
}

export async function getGatePassStudents(asmaY_Id: number, asmcL_Id: number, asmS_Id: number): Promise<ApiResponse<any>> {
    return {
        success: true,
        message: 'Students fetched',
        data: {
            studentlist: [
                { amsT_Id: 102, studentname: 'Raj Kumar', amsT_AdmNo: 'ADM1002' },
                { amsT_Id: 103, studentname: 'Priya Singh', amsT_AdmNo: 'ADM1003' }
            ]
        }
    };
}
