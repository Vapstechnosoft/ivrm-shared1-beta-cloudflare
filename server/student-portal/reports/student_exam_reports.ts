'use server';

import { api } from '@/lib/apiService';

export async function getStudentExamReportDetails(asmat_Id: number, asmay_Id: number, type: string) {
    const url = `/ExamReport/get-exam-data?AMST_Id=${asmat_Id}&ASMAY_Id=${asmay_Id}&Type=${type}`;
    const response = await api.post<any>('portal', url);
    console.log('🔍 [SERVER] getStudentExamReportDetails response:', JSON.stringify(response, null, 2));
    console.log('🔍 [SERVER] response.data:', response?.data);
    console.log('🔍 [SERVER] response.data.data:', response?.data?.data);
    console.log('🔍 [SERVER] response.data.examData:', response?.data?.examData);
    console.log('🔍 [SERVER] response.data.data.examData:', response?.data?.data?.examData);
    return response;
}

export async function getAcademicYearDropDown() {
    const url = '/fee_class_category/academicyearlist';
    return await api.get<any>('fees', url);
}

export async function getStudentSubjectReportDetails(payload: any) {
    const url = 'ExamReport/get-Subjects';
    return await api.post<any>('portal', url, payload);
}
