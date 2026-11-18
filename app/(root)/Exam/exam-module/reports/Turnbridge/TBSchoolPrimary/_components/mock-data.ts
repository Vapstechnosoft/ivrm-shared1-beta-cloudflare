/**
 * Mock Data for TBSchoolPrimary Report
 */

export const getMockTBSPrimaryData = () => {
    const students = [
        {
            AMST_Id: 1,
            studentname: 'Aiden Smith',
            admno: 'TBS/2024/001',
            rollno: 1,
            dob: '2015-06-12',
            AMST_Photoname: 'https://vapsclg.blob.core.windows.net/files/Logo02.jpg',
            clastechname: 'Mrs. Rodriguez'
        }
    ];

    const subjects = [
        { ISMS_Id: 1, ISMS_SubjectName: 'ENGLISH' },
        { ISMS_Id: 2, ISMS_SubjectName: 'MATHEMATICS' },
        { ISMS_Id: 3, ISMS_SubjectName: 'SCIENCE' },
        { ISMS_Id: 4, ISMS_SubjectName: 'SOCIAL STUDIES' },
        { ISMS_Id: 5, ISMS_SubjectName: 'HINDI' },
        { ISMS_Id: 6, ISMS_SubjectName: 'KANNADA' },
        { ISMS_Id: 7, ISMS_SubjectName: 'COMPUTER SCIENCE' },
        { ISMS_Id: 8, ISMS_SubjectName: 'GENERAL KNOWLEDGE' },
        { ISMS_Id: 9, ISMS_SubjectName: 'ART & CRAFT' },
        { ISMS_Id: 10, ISMS_SubjectName: 'VALUE EDUCATION' }
    ];

    const allOutcomes = [
        // English
        { ISMS_Id: 1, subExam: 'Reading Fluency', score: 1 },
        { ISMS_Id: 1, subExam: 'Writing Skills', score: 2 },
        { ISMS_Id: 1, subExam: 'Listening & Speaking', score: 1 },
        // Maths
        { ISMS_Id: 2, subExam: 'Numerical Ability', score: 1 },
        { ISMS_Id: 2, subExam: 'Problem Solving', score: 2 },
        { ISMS_Id: 2, subExam: 'Logical Reasoning', score: 3 },
        // Science
        { ISMS_Id: 3, subExam: 'Scientific Enquiry', score: 1 },
        { ISMS_Id: 3, subExam: 'Conceptual Understanding', score: 2 },
        // Social
        { ISMS_Id: 4, subExam: 'Geography Skills', score: 1 },
        { ISMS_Id: 4, subExam: 'Historical Facts', score: 2 },
        // Hindi
        { ISMS_Id: 5, subExam: 'Oral Skills', score: 1 },
        { ISMS_Id: 5, subExam: 'Vocabulary', score: 2 },
        // Kannada
        { ISMS_Id: 6, subExam: 'Reading', score: 1 },
        { ISMS_Id: 6, subExam: 'Writing', score: 2 },
        // Computer
        { ISMS_Id: 7, subExam: 'Keyboarding', score: 1 },
        { ISMS_Id: 7, subExam: 'Coding Logic', score: 2 },
        // GK
        { ISMS_Id: 8, subExam: 'General Awareness', score: 1 },
        // Art
        { ISMS_Id: 9, subExam: 'Creativity', score: 1 },
        // Value Ed
        { ISMS_Id: 10, subExam: 'Behavior', score: 1 }
    ];

    const getstudentwisesubjectlist: any[] = [];
    students.forEach((stu) => {
        subjects.forEach((sub) => {
            // Add outcomes for Term 1 (EME_Id 1) and Term 2 (EME_Id 2)
            [1, 2].forEach((emeId) => {
                const subOutcomes = allOutcomes.filter((o) => o.ISMS_Id === sub.ISMS_Id);
                subOutcomes.forEach((out) => {
                    getstudentwisesubjectlist.push({
                        AMST_Id: stu.AMST_Id,
                        ISMS_Id: sub.ISMS_Id,
                        ISMS_SubjectName: sub.ISMS_SubjectName,
                        EME_Id: emeId,
                        EMSE_SubExamName: out.subExam,
                        ESTMPSSS_ObtainedMarks: out.score
                    });
                });
            });
        });
    });

    const uniqueSubjects: any[] = [];
    getstudentwisesubjectlist.forEach((item) => {
        if (!uniqueSubjects.find((s) => s.ISMS_Id === item.ISMS_Id && s.AMST_Id === item.AMST_Id)) {
            uniqueSubjects.push({
                AMST_Id: item.AMST_Id,
                ISMS_Id: item.ISMS_Id,
                ISMS_SubjectName: item.ISMS_SubjectName
            });
        }
    });

    const getstudentwiseattendancedetails = students.flatMap((stu) => [
        { AMST_Id: stu.AMST_Id, EME_Id: 1, PRESENTDAYS: 45, TOTALWORKINGDAYS: 50, ATTENDANCEPERCENTAGE: 90 },
        { AMST_Id: stu.AMST_Id, EME_Id: 2, PRESENTDAYS: 48, TOTALWORKINGDAYS: 50, ATTENDANCEPERCENTAGE: 96 }
    ]);

    return {
        getstudentdetails: students,
        getstudentwisesubjectlist,
        uniqueSubjects,
        getstudentwiseattendancedetails,
        clstchname: 'Mrs. Rodriguez'
    };
};
