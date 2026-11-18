/**
 * Mock Data for Subjectsubsubjectsubexamcumreport
 */

export const getMockSubjectSubCumulativeData = () => {
    const instname = [
        {
            mI_Name: 'TUNBRIDGE HIGH SCHOOL',
            mI_Address1: 'No. 1, Shimoga Road',
            ivrmmcT_Name: 'Shimoga',
            mI_Pincode: '577201'
        }
    ];

    const studlist = [
        {
            amsT_Id: 1,
            amsT_FirstName: 'Aiden Smith',
            amsT_RegistrationNo: 'REG001',
            total: 450,
            maxtotal: 500,
            percentage: 90,
            estmP_SectionRank: 1
        },
        {
            amsT_Id: 2,
            amsT_FirstName: 'Sophia Johnson',
            amsT_RegistrationNo: 'REG002',
            total: 420,
            maxtotal: 500,
            percentage: 84,
            estmP_SectionRank: 2
        }
    ];

    const submainlistnew = [
        { subjectname: 'ENGLISH', clmcnt: 2, rowspancnt: 1 },
        { subjectname: 'MATHEMATICS', clmcnt: 2, rowspancnt: 1 },
        { subjectname: 'SCIENCE', clmcnt: 1, rowspancnt: 2 }
    ];

    const abcd = [
        { subid: 1, subjectname: 'ENGLISH', subsubjectname: 'Oral', clspncnt: 1 },
        { subid: 1, subjectname: 'ENGLISH', subsubjectname: 'Written', clspncnt: 1 },
        { subid: 2, subjectname: 'MATHEMATICS', subsubjectname: 'Algebra', clspncnt: 1 },
        { subid: 2, subjectname: 'MATHEMATICS', subsubjectname: 'Geometry', clspncnt: 1 }
    ];

    const subjectlistwithdetails = [
        { ISMS_Id: 1, EMSS_SubSubjectName: 'Oral', EMSE_SubExamName: 'Term 1' },
        { ISMS_Id: 1, EMSS_SubSubjectName: 'Written', EMSE_SubExamName: 'Term 1' },
        { ISMS_Id: 2, EMSS_SubSubjectName: 'Algebra', EMSE_SubExamName: 'Term 1' },
        { ISMS_Id: 2, EMSS_SubSubjectName: 'Geometry', EMSE_SubExamName: 'Term 1' },
        { ISMS_Id: 3, EMSS_SubSubjectName: '', EMSE_SubExamName: 'Term 1' }
    ];

    const tempmarksgrade = [
        { subjidnew: 1, EMSS_SubSubjectName: 'Oral', EMSE_SubExamName: 'Term 1', name: 'M' },
        { subjidnew: 1, EMSS_SubSubjectName: 'Written', EMSE_SubExamName: 'Term 1', name: 'M' },
        { subjidnew: 2, EMSS_SubSubjectName: 'Algebra', EMSE_SubExamName: 'Term 1', name: 'M' },
        { subjidnew: 2, EMSS_SubSubjectName: 'Geometry', EMSE_SubExamName: 'Term 1', name: 'M' },
        { subjidnew: 3, EMSS_SubSubjectName: '', EMSE_SubExamName: 'Term 1', name: 'M' }
    ];

    const savelistnew = [
        // Student 1
        { AMST_Id: 1, ISMS_Id: 1, EMSS_SubSubjectName: 'Oral', EMSE_SubExamName: 'Term 1', subsubjectmarks: 45, subsubjectgrade: 'A' },
        { AMST_Id: 1, ISMS_Id: 1, EMSS_SubSubjectName: 'Written', EMSE_SubExamName: 'Term 1', subsubjectmarks: 88, subsubjectgrade: 'A' },
        { AMST_Id: 1, ISMS_Id: 2, EMSS_SubSubjectName: 'Algebra', EMSE_SubExamName: 'Term 1', subsubjectmarks: 92, subsubjectgrade: 'A+' },
        { AMST_Id: 1, ISMS_Id: 2, EMSS_SubSubjectName: 'Geometry', EMSE_SubExamName: 'Term 1', subsubjectmarks: 85, subsubjectgrade: 'A' },
        { AMST_Id: 1, ISMS_Id: 3, EMSS_SubSubjectName: '', EMSE_SubExamName: 'Term 1', subsubjectmarks: 90, subsubjectgrade: 'A+' },
        // Student 2
        { AMST_Id: 2, ISMS_Id: 1, EMSS_SubSubjectName: 'Oral', EMSE_SubExamName: 'Term 1', subsubjectmarks: 40, subsubjectgrade: 'B' },
        { AMST_Id: 2, ISMS_Id: 1, EMSS_SubSubjectName: 'Written', EMSE_SubExamName: 'Term 1', subsubjectmarks: 75, subsubjectgrade: 'B' },
        { AMST_Id: 2, ISMS_Id: 2, EMSS_SubSubjectName: 'Algebra', EMSE_SubExamName: 'Term 1', subsubjectmarks: 80, subsubjectgrade: 'A' },
        { AMST_Id: 2, ISMS_Id: 2, EMSS_SubSubjectName: 'Geometry', EMSE_SubExamName: 'Term 1', subsubjectmarks: 70, subsubjectgrade: 'B' },
        { AMST_Id: 2, ISMS_Id: 3, EMSS_SubSubjectName: '', EMSE_SubExamName: 'Term 1', subsubjectmarks: 85, subsubjectgrade: 'A' }
    ];

    // Wrap for component
    studlist.forEach((s) => {
        (s as any).arraybind = savelistnew.filter((sv) => sv.AMST_Id === s.amsT_Id);
    });

    return {
        instname,
        studlist,
        submainlistnew,
        abcd,
        subjectlistwithdetails,
        tempmarksgrade,
        savelistnew
    };
};
