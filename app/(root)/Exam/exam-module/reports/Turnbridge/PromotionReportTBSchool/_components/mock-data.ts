export const getMockTBSReportData = () => {
    return {
        studentdetails: [
            {
                AMST_Id: 1,
                studentname: 'Rohan Sharma',
                classname: 'Class 5',
                sectionname: 'A',
                admno: 'ADM101',
                asmaY_Year: '2024-2025',
                TOTALAttendancePercentage: '92.5'
            },
            {
                AMST_Id: 2,
                studentname: 'Ananya Verma',
                classname: 'Class 5',
                sectionname: 'A',
                admno: 'ADM102',
                asmaY_Year: '2024-2025',
                TOTALAttendancePercentage: '96.0'
            }
        ],
        getstudentwisesubjectlist: [
            { AMST_Id: 1, ISMS_Id: 101, ISMS_SubjectName: 'English', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 1, ISMS_Id: 102, ISMS_SubjectName: 'Mathematics', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 1, ISMS_Id: 103, ISMS_SubjectName: 'Science', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 1, ISMS_Id: 104, ISMS_SubjectName: 'Social Studies', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 1, ISMS_Id: 105, ISMS_SubjectName: 'Hindi', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            
            { AMST_Id: 2, ISMS_Id: 101, ISMS_SubjectName: 'English', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 2, ISMS_Id: 102, ISMS_SubjectName: 'Mathematics', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 2, ISMS_Id: 103, ISMS_SubjectName: 'Science', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 2, ISMS_Id: 104, ISMS_SubjectName: 'Social Studies', EYCES_MarksDisplayFlg: true, GropuFlag: 0 },
            { AMST_Id: 2, ISMS_Id: 105, ISMS_SubjectName: 'Hindi', EYCES_MarksDisplayFlg: true, GropuFlag: 0 }
        ],
        getstudentmarksdetails: [
            // Student 1
            { AMST_Id: 1, ISMS_Id: 101, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 85, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 102, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 78, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 103, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 88, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 104, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 74, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 105, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 81, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            
            { AMST_Id: 1, ISMS_Id: 101, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 82, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 102, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 90, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 103, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 85, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 104, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 80, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 1, ISMS_Id: 105, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 88, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },

            // Student 2
            { AMST_Id: 2, ISMS_Id: 101, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 90, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 102, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 95, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 103, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 92, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 104, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 88, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 105, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 91, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },

            { AMST_Id: 2, ISMS_Id: 101, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 94, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 102, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 98, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 103, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 96, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 104, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 92, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' },
            { AMST_Id: 2, ISMS_Id: 105, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 95, EYCES_MarksDisplayFlg: true, PassFailFlag: 'P' }
        ],
        getgroupdetails: [
            { empG_DistplayName: 'T1', empG_GroupName: 'TERM 1' },
            { empG_DistplayName: 'T2', empG_GroupName: 'TERM 2' }
        ],
        getgroupexamdetails: [
            { emE_Id: 1, emE_ExamName: 'Unit Test 1', empG_DistplayName: 'T1', empsgE_ForMaxMarkrs: '100', emE_ExamCode: 'UT1', emE_ExamOrder: 1 },
            { emE_Id: 2, emE_ExamName: 'Unit Test 2', empG_DistplayName: 'T2', empsgE_ForMaxMarkrs: '100', emE_ExamCode: 'UT2', emE_ExamOrder: 2 }
        ],
        getstudent_examwisemarks: [
            { AMST_Id: 1, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 406, TotalMarks: 500, TotalPercentage: '81.2' },
            { AMST_Id: 1, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 417, TotalMarks: 500, TotalPercentage: '83.4' },
            { AMST_Id: 1, EME_Id: 9800000, EMPSG_DisplayName: 'T1', ObtainedMarks: 406, TotalMarks: 500, TotalPercentage: '81.2' },
            
            { AMST_Id: 2, EME_Id: 1, EMPSG_DisplayName: 'T1', ObtainedMarks: 466, TotalMarks: 500, TotalPercentage: '93.2' },
            { AMST_Id: 2, EME_Id: 2, EMPSG_DisplayName: 'T2', ObtainedMarks: 475, TotalMarks: 500, TotalPercentage: '95.0' },
            { AMST_Id: 2, EME_Id: 9800000, EMPSG_DisplayName: 'T2', ObtainedMarks: 475, TotalMarks: 500, TotalPercentage: '95.0' }
        ],
        getstudentwisetermwisedetails: [
            { AMST_Id: 1, ESTMPP_TotalObtMarks: 823, ESTMPP_TotalMaxMarks: 1000, ESTMPP_Percentage: '82.3' },
            { AMST_Id: 2, ESTMPP_TotalObtMarks: 941, ESTMPP_TotalMaxMarks: 1000, ESTMPP_Percentage: '94.1' }
        ],
        getstudentwiseattendancedetails: [
            { AMST_Id: 1, EME_Id: 1, EMPSG_DisplayName: 'T1', TOTALAttendancePercentage: 92, TOTALPRESENTDAYS: 46, TOTALWORKINGDAYS: 50 },
            { AMST_Id: 1, EME_Id: 2, EMPSG_DisplayName: 'T2', TOTALAttendancePercentage: 94, TOTALPRESENTDAYS: 47, TOTALWORKINGDAYS: 50 },
            { AMST_Id: 2, EME_Id: 1, EMPSG_DisplayName: 'T1', TOTALAttendancePercentage: 96, TOTALPRESENTDAYS: 48, TOTALWORKINGDAYS: 50 },
            { AMST_Id: 2, EME_Id: 2, EMPSG_DisplayName: 'T2', TOTALAttendancePercentage: 98, TOTALPRESENTDAYS: 49, TOTALWORKINGDAYS: 50 }
        ],
        examwiseremarks: [
            { AMST_Id: 1, EME_ExamName: 'TERM 1', ESTMP_ClassRank: 2, EMER_Remarks: 'Good performance in first term.' },
            { AMST_Id: 1, EME_ExamName: 'TERM 2', ESTMP_ClassRank: 2, EMER_Remarks: 'Consistent progress maintained.' },
            { AMST_Id: 2, EME_ExamName: 'TERM 1', ESTMP_ClassRank: 1, EMER_Remarks: 'Excellent academic achievements.' },
            { AMST_Id: 2, EME_ExamName: 'TERM 2', ESTMP_ClassRank: 1, EMER_Remarks: 'Outstanding results in all subjects.' }
        ],
        getpromotionremarksdetails: [
            { amsT_Id: 1, eprD_ClassPromoted: '6', eprD_Remarks: 'Promoted to Class VI' },
            { amsT_Id: 2, eprD_ClassPromoted: '6', eprD_Remarks: 'Promoted to Class VI with Distinction' }
        ]
    };
};
