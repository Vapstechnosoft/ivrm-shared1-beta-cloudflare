'use server';

import { api } from '@/lib/apiService';

/**
 * Multiple Exam Progress Card Report New Controller (Server Action)
 * Ported from AngularJS: MultipleExamProgressCardReportNewController
 */

export async function getMultipleExamProgressCardReportNew(data: any) {
    try {
        const url = '/JSHSExamReports/BGHS_GetMultiple_Exam_Progress_Report';
        const payload = {
            ASMAY_Id: data.ASMAY_Id,
            ASMCL_Id: data.ASMCL_Id,
            ASMS_Id: data.ASMS_Id,
            examlist: data.examlist || []
        };

        const response = await api.post<any>('exam', url, payload);

        if (response?.success && response.data) {
            return {
                ...response,
                data: transformReportData(response.data)
            };
        } else if (response && !response.data && response.getstudentmarksdetails) {
            return {
                success: true,
                data: transformReportData(response)
            };
        }

        return response;
    } catch (error) {
        console.error('MultipleExamProgressCardReportNewController error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}

/**
 * Data Transformation logic (Equivalent to logic in legacy JS controller)
 */
function transformReportData(data: any) {
    const { getstudentmarksdetails = [], getstudentwisesubjectlist = [], getstudentdetails = [], getexamdetails = [] } = data;

    // 1. Calculate Total Max Marks and append Total/Grade columns to exam details
    let totalMaxMarks = 0;
    for (const exam of getexamdetails) {
        totalMaxMarks += exam.eyceS_MaxMarks || 0;
    }

    const processedExamDetails = [...getexamdetails];
    processedExamDetails.push({ emE_Id: 150001, emE_ExamName: 'Total', eyceS_MaxMarks: totalMaxMarks });
    processedExamDetails.push({ emE_Id: 150002, emE_ExamName: 'Grade', eyceS_MaxMarks: '' });

    // 2. Map subjects and marks to students (Optimization for rendering)
    const transformedStudents = getstudentdetails.map((stu: any) => {
        const studentSubjects = getstudentwisesubjectlist.filter((sub: any) => sub.AMST_Id === stu.AMST_Id);
        const studentMarks = getstudentmarksdetails.filter((mark: any) => mark.AMST_Id === stu.AMST_Id);

        return {
            ...stu,
            subjects: studentSubjects,
            marks: studentMarks
        };
    });

    return {
        ...data,
        getexamdetails: processedExamDetails,
        getstudentdetails: transformedStudents
    };
}
