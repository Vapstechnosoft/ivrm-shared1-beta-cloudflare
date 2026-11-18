/**
 * Mock Data for Multiple Exam Progress Card Report New
 * Useful for UI validation and development without active API dependencies.
 */

export const mockReportData = {
    getstudentdetails: [
        {
            AMST_Id: 1,
            studentname: 'John Doe',
            admno: 'ADM/2023/001',
            rollno: 1,
            dob: '2010-05-15',
            clastechname: 'Mr. Smith',
            classname: 'Grade 8',
            sectionname: 'A',
            subjects: [
                { ISMS_Id: 101, ISMS_SubjectName: 'English', EYCES_AplResultFlg: true },
                { ISMS_Id: 102, ISMS_SubjectName: 'Mathematics', EYCES_AplResultFlg: true },
                { ISMS_Id: 103, ISMS_SubjectName: 'Science', EYCES_AplResultFlg: true },
                { ISMS_Id: 104, ISMS_SubjectName: 'Art & Craft', EYCES_AplResultFlg: false },
                { ISMS_Id: 105, ISMS_SubjectName: 'Physical Education', EYCES_AplResultFlg: false }
            ],
            marks: [
                // English
                { EME_Id: 1, ISMS_Id: 101, OBTAINEDMARKS: 85, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 2, ISMS_Id: 101, OBTAINEDMARKS: 90, GRADE: 'A+', ExamConductFlag: 1 },
                { EME_Id: 150001, ISMS_Id: 101, OBTAINEDMARKS: 175, GRADE: 'A+', ExamConductFlag: 1 },
                { EME_Id: 150002, ISMS_Id: 101, OBTAINEDMARKS: 0, GRADE: 'A+', ExamConductFlag: 1 },
                // Mathematics
                { EME_Id: 1, ISMS_Id: 102, OBTAINEDMARKS: 75, GRADE: 'B', ExamConductFlag: 1 },
                { EME_Id: 2, ISMS_Id: 102, OBTAINEDMARKS: 80, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 150001, ISMS_Id: 102, OBTAINEDMARKS: 155, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 150002, ISMS_Id: 102, OBTAINEDMARKS: 0, GRADE: 'A', ExamConductFlag: 1 },
                // Science
                { EME_Id: 1, ISMS_Id: 103, OBTAINEDMARKS: 88, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 2, ISMS_Id: 103, OBTAINEDMARKS: 85, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 150001, ISMS_Id: 103, OBTAINEDMARKS: 173, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 150002, ISMS_Id: 103, OBTAINEDMARKS: 0, GRADE: 'A', ExamConductFlag: 1 },
                // Grand Totals (ISMS_Id 50001)
                { EME_Id: 1, ISMS_Id: 50001, OBTAINEDMARKS: 248, EMGD_Remarks: 'Good performance', ExamConductFlag: 1 },
                { EME_Id: 2, ISMS_Id: 50001, OBTAINEDMARKS: 255, EMGD_Remarks: 'Excellent improvement', ExamConductFlag: 1 },
                { EME_Id: 150001, ISMS_Id: 50001, OBTAINEDMARKS: 503, EMGD_Remarks: 'Overall Excellent', ExamConductFlag: 1 },
                { EME_Id: 150002, ISMS_Id: 50001, OBTAINEDMARKS: 0, GRADE: 'A+', ExamConductFlag: 1 },
                // Non-Scholastic (Art & Craft)
                { EME_Id: 1, ISMS_Id: 104, OBTAINEDMARKS: 0, GRADE: 'B', ExamConductFlag: 1 },
                { EME_Id: 2, ISMS_Id: 104, OBTAINEDMARKS: 0, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 150001, ISMS_Id: 104, OBTAINEDMARKS: 0, GRADE: 'A', ExamConductFlag: 1 },
                { EME_Id: 150002, ISMS_Id: 104, OBTAINEDMARKS: 0, GRADE: 'A', ExamConductFlag: 1 }
            ]
        }
    ],
    getexamdetails: [
        { emE_Id: 1, emE_ExamName: 'Periodic Test 1', eyceS_MaxMarks: 100 },
        { emE_Id: 2, emE_ExamName: 'Periodic Test 2', eyceS_MaxMarks: 100 },
        { emE_Id: 150001, emE_ExamName: 'Total', eyceS_MaxMarks: 200 },
        { emE_Id: 150002, emE_ExamName: 'Grade', eyceS_MaxMarks: '' }
    ],
    work_attendence: [
        { AMST_Id: 1, June: 22, July: 25, August: 24, September: 20, October: 22, TotalWorkingDays: 113, Total_Percentage: 100 }
    ],
    present_attendence: [
        { AMST_Id: 1, June: 20, July: 23, August: 22, September: 18, October: 20, TotalPresentDays: 103, Total_Percentage: 91.15 }
    ]
};
