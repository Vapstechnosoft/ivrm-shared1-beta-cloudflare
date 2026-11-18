import type { IAcademicYearDropdown, IClassDropdown, IExamDropdown, ISectionDropdown, ISubjectDropdown } from './transactions';

export interface IOnlineExamReportRow {
    slNo?: number;
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string | number;
    className: string;
    sectionName: string;
    examName: string;
    subjectName: string;
    examDate: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    maxMarks: number;
    marksObtained: number;
    percentage: number;
    resultStatus: 'Pass' | 'Fail' | 'Ab';
    rank?: number | string;
}

export interface IStaffWiseReportRow {
    slNo?: number;
    staffName: string;
    employeeCode: string;
    subjectName: string;
    className: string;
    sectionName: string;
    examName: string;
    examDate: string;
    totalStudents: number;
    totalAppeared: number;
    totalNotAppeared: number;
    totalPassed: number;
    totalFailed: number;
    passPercentage: number;
}

export interface INotSubmittedReportRow {
    slNo?: number;
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string | number;
    className: string;
    sectionName: string;
    examName: string;
    subjectName: string;
    examDate: string;
    attemptStatus: 'Not Started' | 'Incomplete / Disconnected';
    mobileNo?: string;
    fatherName?: string;
    remarks?: string;
}

export interface IExamReportInitialData {
    yearList: IAcademicYearDropdown[];
    classList: IClassDropdown[];
    sectionList: ISectionDropdown[];
    examList: IExamDropdown[];
    subjectList: ISubjectDropdown[];
}
