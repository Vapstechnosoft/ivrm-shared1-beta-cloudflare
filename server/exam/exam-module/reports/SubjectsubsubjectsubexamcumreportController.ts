'use server';

import { api } from '@/lib/apiService';

/**
 * Subjectsubsubjectsubexamcumreport Controller
 * Ported from: SubjectsubjexamasubsubjectCumulativeReport.js
 */

export async function getSubjectSubOnLoadDetails() {
    try {
        const url = '/HHSMIDFINALCumReport/Getdetails';
        return await api.get<any>('exam', url);
    } catch (error) {
        console.error('getSubjectSubOnLoadDetails error:', error);
        return { success: false, data: null };
    }
}

export async function getSubjectSubClasses(asmaY_Id: number) {
    try {
        const url = '/ExamCalculation_SSSE/get_classes';
        return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
    } catch (error) {
        console.error('getSubjectSubClasses error:', error);
        return { success: false, data: null };
    }
}

export async function getSubjectSubSections(asmaY_Id: number, asmcL_Id: number) {
    try {
        const url = '/ExamCalculation_SSSE/get_cls_sections';
        return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
    } catch (error) {
        console.error('getSubjectSubSections error:', error);
        return { success: false, data: null };
    }
}

export async function getSubjectSubExamsAndStudents(payload: any) {
    try {
        const url = '/ExamCalculation_SSSE/get_exams';
        return await api.post<any>('exam', url, payload);
    } catch (error) {
        console.error('getSubjectSubExamsAndStudents error:', error);
        return { success: false, data: null };
    }
}

export async function getSubjectSubCumulativeReport(payload: any) {
    try {
        const url = '/HHSMIDFINALCumReport/savedetailsnew';
        const response = await api.post<any>('exam', url, payload);

        if (response?.success && response.data) {
            return response;
        } else if (response && !response.data && response.savelistnew) {
            // Handle legacy response where data is at root
            return { success: true, data: response };
        }

        return response;
    } catch (error) {
        console.error('getSubjectSubCumulativeReport error:', error);
        return { success: false, status: 500, message: 'Server error', data: null };
    }
}
