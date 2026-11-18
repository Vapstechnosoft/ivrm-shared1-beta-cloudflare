'use server';

import { api } from '@/lib/apiService';

/**
 * Multiple Exam Progress Card Report 2 (Baldwin) - Server Actions
 */

const CONTROLLER = 'JSHSExamReports';

// 🔹 Initial Data (Academic Years)
export async function getInitialData() {
    const url = `/${CONTROLLER}/Getdetails`;
    return await api.get<any>('exam', url);
}

// 🔹 Class Dropdown
export async function getClassesByYear(asmaY_Id: number) {
    const url = `/${CONTROLLER}/get_classes`;
    const payload = { ASMAY_Id: asmaY_Id };
    return await api.post<any>('exam', url, payload);
}

// 🔹 Section Dropdown
export async function getSectionsByClass(asmaY_Id: number, asmcL_Id: number) {
    const url = `/${CONTROLLER}/get_sections`;
    const payload = { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id };
    return await api.post<any>('exam', url, payload);
}

// 🔹 Exam & Grade Dropdowns
export async function getExamsAndGrades(asmaY_Id: number, asmcL_Id: number, asms_Id: number) {
    const url = `/${CONTROLLER}/get_Exam_grade`;
    const payload = { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id, ASMS_Id: asms_Id };
    return await api.post<any>('exam', url, payload);
}

// 🔹 Generate Report
export async function getMultipleExamProgressReport(payload: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    examlist: { EME_Id: number; EME_ExamName: string }[];
}) {
    const url = `/${CONTROLLER}/BGHS_GetMultiple_Exam_Progress_Report`;
    try {
        const promise = await api.post<any>('exam', url, payload);

        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (promise && promise.data) {
            // Handle legacy wrapper if present
            const actualData = promise.data;
            if (actualData.getstudentmarksdetails && actualData.getstudentmarksdetails.length > 0) {
                return transformReportData(actualData);
            }
        } else if (promise?.getstudentmarksdetails) {
            return transformReportData(promise);
        }

        return promise;
    } catch (error) {
        console.error('getMultipleExamProgressReport Error:', error);
        throw error;
    }
}

/**
 * Data Transformation logic moved from AngularJS controller to Server Action
 */
function transformReportData(promise: any) {
    const {
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentdetails = [],
        getexamdetails = [],
        getexamsubjectwisemarksdetails = [],
        getexamwisetotaldetails = []
    } = promise;

    // 1. Process Exam Details (Calculate Total and Grade columns)
    let totalMaxMarks = 0;
    for (const exam of getexamdetails) {
        totalMaxMarks += exam.eyceS_MaxMarks || 0;
    }

    const processedExamDetails = [...getexamdetails];
    processedExamDetails.push({ emE_Id: 150001, emE_ExamName: 'Total', eyceS_MaxMarks: totalMaxMarks });
    processedExamDetails.push({ emE_Id: 150002, emE_ExamName: 'Grade', eyceS_MaxMarks: '' });

    // 2. Map subjects and marks to students
    const transformedStudents = getstudentdetails.map((stu: any) => {
        const studentSubjects = getstudentwisesubjectlist.filter((sub: any) => sub.AMST_Id === stu.AMST_Id);

        const applicableCount = studentSubjects.filter((sub: any) => sub.EYCES_AplResultFlg).length;
        const nonApplicableCount = studentSubjects.filter((sub: any) => !sub.EYCES_AplResultFlg).length;

        const studentMarks = getstudentmarksdetails.filter((mark: any) => mark.AMST_Id === stu.AMST_Id);

        return {
            ...stu,
            subjects: studentSubjects,
            marks: studentMarks,
            applicablecount: applicableCount,
            nonapplicablecount: nonApplicableCount
        };
    });

    return {
        ...promise,
        getexamdetails: processedExamDetails,
        getstudentdetails: transformedStudents
    };
}
