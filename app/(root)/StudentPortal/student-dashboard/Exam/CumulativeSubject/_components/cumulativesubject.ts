'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { CumulativeSubjectLoadData, ExamDetailsResponse, SubjectListResponse } from '../types';

// Mock data as fallback
const mockLoadData: CumulativeSubjectLoadData = {
    stuyearlist: []
};

const mockSubjectData: SubjectListResponse = {
    subjectlist: [],
    stuyearlist: []
};

const mockExamDetails: ExamDetailsResponse = {
    examgradelist: []
};

export async function getCumulativeSubjectLoadData() {
    const url = `/fee_class_category/academicyearlist`;
    try {
        const response = await api.get<any>('fees', url);

        if (response && response.data) {
            const responseData = response.data;
            const yearList =
                responseData?.data?.studentYearList ||
                responseData?.studentYearList ||
                responseData?.data ||
                (Array.isArray(responseData) ? responseData : []) ||
                [];

            return {
                stuyearlist: yearList
            };
        }
        return { stuyearlist: [] };
    } catch (e) {
        console.warn('API Failed, using mock data for getCumulativeSubjectLoadData', e);
        return mockLoadData;
    }
}

export async function getSubjectDataforCumulatiSubject(asmay_Id: number) {
    const session = await auth();
    const amst_Id = (session as any)?.user?.amst_id || (session as any)?.amst_id || 17064;
    const url = `/CumulativeSubject/getSubjectsdata`;
    const payload = {
        ASMAY_Id: asmay_Id,
        AMST_Id: amst_Id
    };

    try {
        const response = await api.post<any>('portal', url, payload);
        console.log(response);

        if (response && response.data) {
            let subjects = [];

            // Check if response.data is the array directly (as seen in user's JSON)
            if (Array.isArray(response.data)) {
                subjects = response.data;
            } else if (response.data.subjectlist) {
                subjects = response.data.subjectlist;
            } else if (response.data.data) {
                subjects = response.data.data;
            } else if (Array.isArray(response.data.value)) {
                // Sometimes APIs return $values or value
                subjects = response.data.value;
            }

            // Filter duplicates based on ismS_Id
            subjects = subjects.filter((val: any, id: any, array: any[]) => {
                return array.findIndex((item: any) => item.ismS_Id === val.ismS_Id) === id;
            });

            return {
                subjectlist: subjects,
                stuyearlist: []
            };
        }
        return {
            subjectlist: [],
            stuyearlist: []
        };
    } catch (error) {
        console.error('Error in getSubjectDataforCumulatiSubject:', error);
        return {
            subjectlist: [],
            stuyearlist: []
        };
    }
}

export async function getExamDetails(asmaY_Id: number, ismS_Id: number) {
    const session = await auth();
    const amst_Id = (session as any)?.user?.amst_id || (session as any)?.amst_id || 17064;
    const url = `/CumulativeSubject/get_exam_details`;
    const payload = {
        ASMAY_Id: asmaY_Id,
        ISMS_Id: ismS_Id,
        AMST_Id: amst_Id
    };

    console.log('getExamDetails payload:', payload);

    try {
        const response = await api.post<any>('portal', url, payload);
        console.log('getExamDetails API Response:', JSON.stringify(response, null, 2));

        if (response) {
            let exams: any[] = [];
            // Handle various potential response structures
            if (response.data && response.data.examResults && Array.isArray(response.data.examResults)) {
                exams = response.data.examResults;
            } else if (response.examgradelist && Array.isArray(response.examgradelist)) {
                exams = response.examgradelist;
            } else if (response.data && response.data.examgradelist && Array.isArray(response.data.examgradelist)) {
                exams = response.data.examgradelist;
            } else if (response.data && Array.isArray(response.data)) {
                exams = response.data;
            } else if (response.data && response.data.exams && Array.isArray(response.data.exams)) {
                exams = response.data.exams;
            } else if (response.data && response.data.value && Array.isArray(response.data.value)) {
                exams = response.data.value;
            } else if (response.exams && Array.isArray(response.exams)) {
                exams = response.exams;
            } else if (response.value && Array.isArray(response.value)) {
                exams = response.value;
            } else if (Array.isArray(response)) {
                exams = response;
            }

            console.log('Extracted exams count:', exams.length);

            return {
                examgradelist: exams
            };
        }
        return { examgradelist: [] };
    } catch (e) {
        console.warn('API Failed, using mock data for getExamDetails', e);
        return { examgradelist: [] };
    }
}
