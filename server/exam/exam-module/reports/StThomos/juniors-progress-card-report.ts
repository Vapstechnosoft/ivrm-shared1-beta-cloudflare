'use server';

import { api } from '@/lib/apiService';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';

const ACADEMIC_YEARS = [{ asmaY_Id: 2023, asmaY_Year: '2023-2024' }];

const CLASSES = [
    { asmcL_Id: 10, asmcL_ClassName: 'I' },
    { asmcL_Id: 11, asmcL_ClassName: 'II' }
];

const SECTIONS = [
    { asmS_Id: 100, asmC_SectionName: 'A' },
    { asmS_Id: 101, asmC_SectionName: 'B' }
];

const EXAMS = [{ emE_Id: 50, emE_ExamName: 'Mid Term' }];

const STUDENTS = [
    { amsT_Id: 1, studentname: 'John Doe', amsT_AdmNo: 'A001' },
    { amsT_Id: 2, studentname: 'Jane Smith', amsT_AdmNo: 'A002' }
];

export async function getDetails() {
    try {
        const res = await getAcademicYearDropdown();
        return {
            acdlist: res.data || []
        };
    } catch (error) {
        console.error('getDetails error:', error);
        return {
            acdlist: []
        };
    }
}

export async function getClasses(yearId: any) {
    return {
        ctlist: CLASSES
    };
}

export async function getSections(classId: any) {
    return {
        seclist: SECTIONS
    };
}

export async function getExamsAndStudents(sectionId: any) {
    return {
        examlist: EXAMS,
        studentlist: STUDENTS
    };
}

export async function getReportDetails(data: any) {
    const url = '/JSHSExamReportsFacade/promotion_report_card';
    try {
        const response = await api.post<any>('exam', url, data);
        console.log('response', response);
        return response.data;
    } catch (error) {
        console.error('getReportDetails API Error:', error);
        return {
            getstudentdetails: [],
            getgroupdetails: [],
            getgroupexamdetails: [],
            getstudentwisesubjectlist: [],
            getstudentmarksdetails: [],
            getstudent_examwisemarks: [],
            getallgrade: [],
            present_attendence: [],
            work_attendence: [],
            savelisttot: [],
            getpromotionremarksdetails: []
        };
    }
}
