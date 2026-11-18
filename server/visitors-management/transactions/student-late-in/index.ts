'use server';
import type { ApiResponse } from '@/lib/apiService';
import type { StudentLateInInitialData } from '@/types/visitors-management/transactions';

export async function getStudentLateInData(): Promise<ApiResponse<StudentLateInInitialData>> {
    const mockData: StudentLateInInitialData = {
        academicYear: [
            { asmaY_Id: 1, asmaY_Year: '2023-2024' },
            { asmaY_Id: 2, asmaY_Year: '2024-2025', selected: true }
        ],
        getstudentlist: [
            {
                alieoS_Id: 1,
                studentName: 'John Doe',
                amst_AdmNo: 'ADM1001',
                asmcL_ClassName: 'Class 10',
                asmC_SectionName: 'A',
                alieoS_AttendanceDate: new Date().toISOString(),
                alieoS_PunchDate: new Date().toISOString(),
                alieoS_PunchTime: '08:30',
                alieoS_Reason: 'Traffic jam',
                alieoS_AactiveFlag: true,
                asmaY_Id: 2,
                asmcL_Id: 5,
                asmS_Id: 1,
                amsT_Id: 101
            }
        ]
    };
    return {
        success: true,
        message: 'Data fetched successfully',
        data: mockData
    };
}

export async function getClasses(asmaY_Id: number): Promise<ApiResponse<any>> {
    // Mock classes
    return {
        success: true,
        message: 'Classes fetched',
        data: {
            classList: [
                { asmcL_Id: 1, asmcL_ClassName: 'Class 8' },
                { asmcL_Id: 2, asmcL_ClassName: 'Class 9' },
                { asmcL_Id: 5, asmcL_ClassName: 'Class 10' }
            ]
        }
    };
}

export async function getSections(asmaY_Id: number, asmcL_Id: number): Promise<ApiResponse<any>> {
    // Mock sections
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

export async function getStudents(asmaY_Id: number, asmcL_Id: number, asmS_Id: number): Promise<ApiResponse<any>> {
    // Mock students
    return {
        success: true,
        message: 'Students fetched',
        data: {
            studentlist: [
                { amsT_Id: 101, studentName: 'John Doe', amst_AdmNo: 'ADM1001' },
                { amsT_Id: 102, studentName: 'Jane Smith', amst_AdmNo: 'ADM1002' }
            ]
        }
    };
}

export async function saveStudentLateIn(data: any): Promise<ApiResponse<any>> {
    console.log('Saving Student Late In:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        message: 'Record Saved Successfully!!!',
        data: null
    };
}

export async function deactivateStudentLateIn(alieoS_Id: number): Promise<ApiResponse<any>> {
    console.log('Deactivating Student Late In ID:', alieoS_Id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        message: 'Status Changed Successfully!!!',
        data: null
    };
}
