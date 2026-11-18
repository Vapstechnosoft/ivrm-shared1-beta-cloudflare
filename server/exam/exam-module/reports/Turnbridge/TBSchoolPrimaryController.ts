'use server';

import { api } from '@/lib/apiService';

/**
 * TBSchoolPrimary Controller (Server Action)
 * Ported from AngularJS: TBSchoolPrimaryController
 */

export async function getTBSchoolPrimaryReport(data: any) {
    try {
        const url = '/JSHSExamReports/TBSPrimarySchool';
        const payload = {
            ASMAY_Id: data.ASMAY_Id,
            ASMCL_Id: data.ASMCL_Id,
            ASMS_Id: data.ASMS_Id,
            Temp_AmstIds: data.Temp_AmstIds || [],
            examlist: data.examlist || [],
            EMGR_Id: 0
        };

        const response = await api.post<any>('exam', url, payload);

        if (response?.success && response.data) {
            return {
                ...response,
                data: transformPrimaryReportData(response.data)
            };
        } else if (response && !response.data && response.getstudentdetails) {
            return {
                success: true,
                data: transformPrimaryReportData(response)
            };
        }

        return response;
    } catch (error) {
        console.error('TBSchoolPrimaryController error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}

/**
 * Data Transformation logic for Primary School Report
 */
function transformPrimaryReportData(data: any) {
    const { getstudentdetails = [], getstudentwisesubjectlist = [], getstudentwiseattendancedetails = [] } = data;

    // 1. Group unique subjects
    const uniqueSubjects: any[] = [];
    if (getstudentwisesubjectlist && getstudentwisesubjectlist.length > 0) {
        getstudentwisesubjectlist.forEach((dev: any) => {
            const exists = uniqueSubjects.find((s) => s.ISMS_Id === dev.ISMS_Id && s.AMST_Id === dev.AMST_Id);
            if (!exists) {
                uniqueSubjects.push(dev);
            }
        });
    }

    // 2. Map attendance and subjects to each student
    const transformedStudents = getstudentdetails.map((stu: any) => {
        const studentAttendance = getstudentwiseattendancedetails.filter((att: any) => att.AMST_Id === stu.AMST_Id);
        const studentSubjects = getstudentwisesubjectlist.filter((sub: any) => sub.AMST_Id === stu.AMST_Id);

        return {
            ...stu,
            getstudentwiseattendancedetails: studentAttendance,
            subjects: studentSubjects
        };
    });

    return {
        ...data,
        uniqueSubjects,
        getstudentdetails: transformedStudents
    };
}
