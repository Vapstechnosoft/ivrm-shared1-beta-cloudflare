'use server';

import { api } from '@/lib/apiService';

import { transformReportData } from './bcehs-final-promotion-report';

function getProp(obj: any, snake: string, camel: string) {
    if (!obj) return undefined;
    if (obj[camel] !== undefined) return obj[camel];
    if (obj[snake] !== undefined) return obj[snake];
    const lower = camel.toLowerCase();
    if (obj[lower] !== undefined) return obj[lower];
    return undefined;
}

export async function getBBHSFinalPromotionReportBBHS(data: any) {
    const url = '/Baldwin_All_Reports/Baldwin_Final_P_Report_card';

    const payload = {
        asmaY_Id: Number(data.ASMAY_Id),
        asmcL_Id: Number(data.ASMCL_Id),
        asmS_Id: Number(data.ASMS_Id),
        temp_AmstIds: data.selectedStudents.map((id: any) => ({ amsT_Id: Number(id) })),
        ASMAY_Id: Number(data.ASMAY_Id),
        ASMCL_Id: Number(data.ASMCL_Id),
        ASMS_Id: Number(data.ASMS_Id),
        Temp_AmstIds: data.selectedStudents.map((id: any) => ({ amsT_Id: Number(id) }))
    };

    const response = await api.post<any>('exam', url, payload);
    console.log('getBBHSFinalPromotionReportBBHS success:', response?.success);
    console.log('getBBHSFinalPromotionReportBBHS keys:', response ? Object.keys(response) : 'null');

    const actualData = response?.data || response;
    console.log('actualData keys:', actualData ? Object.keys(actualData) : 'null');

    const examlist = getProp(actualData, 'examlist', 'examList') || [];
    const subjectlist = getProp(actualData, 'subjectlist', 'subjectList') || [];
    const studentlist = getProp(actualData, 'studentlist', 'studentList') || [];

    console.log('Lengths - examlist:', examlist.length, 'subjectlist:', subjectlist.length, 'studentlist:', studentlist.length);

    const hasExamList = examlist.length > 0;
    const hasSubjectList = subjectlist.length > 0;

    if (actualData && hasExamList && hasSubjectList) {
        const transformed = await transformReportData(actualData, Number(data.ASMAY_Id), Number(data.ASMCL_Id), Number(data.ASMS_Id));
        console.log('transformed student_list length:', transformed?.student_list?.length);
        return transformed;
    }
    return actualData;
}

function getStudentId(obj: any): number {
    if (!obj) return 0;
    return Number(obj.AMST_Id ?? obj.amsT_Id ?? obj.amsT_ID ?? obj.amst_Id ?? 0);
}

export async function getPromotionReportStdIX2021(data: any) {
    try {
        const url = '/Baldwin_All_Reports/BBHS_IX_20202021';

        const payload = {
            asmaY_Id: Number(data.ASMAY_Id),
            asmcL_Id: Number(data.ASMCL_Id),
            asmS_Id: Number(data.ASMS_Id),
            temp_AmstIds: data.selectedStudents.map((id: any) => ({ amsT_Id: Number(id) })),
            ASMAY_Id: Number(data.ASMAY_Id),
            ASMCL_Id: Number(data.ASMCL_Id),
            ASMS_Id: Number(data.ASMS_Id),
            Temp_AmstIds: data.selectedStudents.map((id: any) => ({ amsT_Id: Number(id) }))
        };

        console.log('Sending payload to BBHS_IX_20202021:', JSON.stringify(payload));
        const response = await api.post<any>('exam', url, payload);
        console.log('getPromotionReportStdIX2021 raw response received:', !!response);

        const raw = response?.data || response;
        if (!raw) {
            return { success: false, message: 'No response data received from API' };
        }

        // 1. Get Class Teacher name
        let clastechname = '';
        if (Array.isArray(raw.clstchname) && raw.clstchname.length > 0) {
            const emp = raw.clstchname[0];
            if (emp) {
                clastechname = [emp.hrmE_EmployeeFirstName, emp.hrmE_EmployeeMiddleName, emp.hrmE_EmployeeLastName]
                    .filter(Boolean)
                    .join(' ');
            }
        }

        // 2. Build groupwiseexamlist
        const groupwiseexamlist: any[] = [];
        const getgroupdetails = Array.isArray(raw.getgroupdetails) ? raw.getgroupdetails : [];
        const getgroupexamdetails = Array.isArray(raw.getgroupexamdetails) ? raw.getgroupexamdetails : [];

        getgroupdetails.forEach((dd: any) => {
            if (!dd) return;
            let counttotal = 0;
            const groupwiseexamlist_temp: any[] = [];
            getgroupexamdetails.forEach((d: any) => {
                if (d && dd.empG_DistplayName === d.empG_DistplayName) {
                    counttotal += Number(d.empsgE_ForMaxMarkrs || 0);

                    const examItem = {
                        EMPG_GroupName: d.empG_GroupName,
                        EME_Id: d.emE_Id,
                        EME_ExamName: d.emE_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder,
                        EMPG_DistplayName: d.empG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode || d.emE_ExamName
                    };
                    groupwiseexamlist_temp.push(examItem);
                    groupwiseexamlist.push(examItem);
                }
            });

            // Add total column for this group
            const totalItem = {
                EMPG_GroupName: dd.empG_GroupName,
                EME_Id: 9800000,
                EME_ExamName: 'Marks Obtained',
                EME_ExamOrder: 9800000,
                EMPG_DistplayName: dd.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Total'
            };
            groupwiseexamlist_temp.push(totalItem);
            groupwiseexamlist.push(totalItem);

            dd.empsG_MarksValue = counttotal;
            dd.groupewiseexam = groupwiseexamlist_temp;
        });

        // 3. Format students
        const selectedIds = new Set((data.selectedStudents || []).map(Number));
        const rawStudents = Array.isArray(raw.getstudentdetails) ? raw.getstudentdetails : [];

        console.log('rawStudents length:', rawStudents.length);
        console.log('selectedIds:', Array.from(selectedIds));

        const filteredStudents = rawStudents.filter((s: any) => s && selectedIds.has(getStudentId(s)));
        console.log('filteredStudents length:', filteredStudents.length);

        const student_list = filteredStudents
            .map((stu: any) => {
                if (!stu) return null;
                const studentId = getStudentId(stu);

                // Subject List for this student
                const studentsubjects = (Array.isArray(raw.getstudentwisesubjectlist) ? raw.getstudentwisesubjectlist : []).filter(
                    (s: any) => s && getStudentId(s) === studentId
                );

                // Marks details for this student
                const studentmarks = (Array.isArray(raw.getstudentmarksdetails) ? raw.getstudentmarksdetails : []).filter(
                    (s: any) => s && getStudentId(s) === studentId
                );

                // Exam groupwise totals
                const student_marks = (Array.isArray(raw.getstudent_examwisemarks) ? raw.getstudent_examwisemarks : []).filter(
                    (s: any) => s && getStudentId(s) === studentId
                );

                // Promotion marks details (totals/ranks)
                const promo = (Array.isArray(raw.getpromotionmarksdetails) ? raw.getpromotionmarksdetails : []).find(
                    (s: any) => s && getStudentId(s) === studentId
                );

                return {
                    ...stu,
                    amsT_Id: studentId,
                    AMST_Id: studentId,
                    studentname:
                        stu.studentname || `${stu.amsT_FirstName || ''} ${stu.amsT_MiddleName || ''} ${stu.amsT_LastName || ''}`.trim(),
                    classname: stu.classname || data.selected_class || '',
                    sectionname: stu.sectionname || data.selected_section || '',
                    admno: stu.admno || stu.amsT_AdmNo || '',
                    dob: stu.dob || stu.amsT_DOB || '',
                    studentsubjects,
                    studentmarks,
                    student_marks,
                    TotalMarks: promo?.estmpP_TotalObtMarks ?? '',
                    TotalMaxMarks: promo?.estmpP_TotalMaxMarks ?? '',
                    TotalGrade: promo?.estmpP_TotalGrade ?? '',
                    TotalPercentage: promo?.estmpP_Percentage ?? '',
                    SectionRank: promo?.estmpP_SectionRank ?? '',
                    ClassRank: promo?.estmpP_ClassRank ?? ''
                };
            })
            .filter(Boolean);

        return {
            success: true,
            student_list,
            groupwiseexamlist,
            getgroupdetails,
            stud_work_attendence: Array.isArray(raw.work_attendence) ? raw.work_attendence : [],
            stud_present_attendence: Array.isArray(raw.present_attendence_P) ? raw.present_attendence_P : [],
            getstudentwisesubjectlist: Array.isArray(raw.getstudentwisesubjectlist) ? raw.getstudentwisesubjectlist : [],
            Year_Name: data.selected_academicYear || raw.Year_Name || '',
            Class_Teacher_Name: clastechname
        };
    } catch (error: any) {
        console.error('CRITICAL ERROR in getPromotionReportStdIX2021:', error);
        return {
            success: false,
            message: error?.message || String(error) || 'An unknown error occurred inside Server Action.'
        };
    }
}

export async function getPromotionReportIX(data: any) {
    return await getPromotionReportStdIX2021(data);
}

export async function getBaldwinReportDetails(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { selectedStudents = [], studentDetails = [] } = data;

    const subjects = [
        { ismS_Id: 1, ismS_SubjectName: 'ENGLISH LANGUAGE', flag: true },
        { ismS_Id: 2, ismS_SubjectName: 'ENGLISH LITERATURE', flag: true },
        { ismS_Id: 3, ismS_SubjectName: 'MATHEMATICS', flag: true },
        { ismS_Id: 4, ismS_SubjectName: 'SCIENCE', flag: true },
        { ismS_Id: 5, ismS_SubjectName: 'SOCIAL STUDIES', flag: true },
        { ismS_Id: 6, ismS_SubjectName: 'KANNADA/HINDI', flag: true },
        { ismS_Id: 7, ismS_SubjectName: 'COMPUTER', flag: true },
        { ismS_Id: 8, ismS_SubjectName: 'VALUE EDUCATION', flag: false },
        { ismS_Id: 9, ismS_SubjectName: 'GENERAL KNOWLEDGE', flag: false }
    ];

    const exams = [
        { emE_Id: 1, emE_ExamName: 'UNIT TEST I', marks: 20, emE_FinalExamFlag: false },
        { emE_Id: 2, emE_ExamName: 'HALF YEARLY', marks: 80, emE_FinalExamFlag: false },
        { emE_Id: 3, emE_ExamName: 'ANNUAL EXAM', marks: 100, emE_FinalExamFlag: true }
    ];

    const student_list = (
        studentDetails.length > 0
            ? studentDetails
            : selectedStudents.map((id: any) => ({ amsT_Id: Number(id), studentName: 'MOCK STUDENT', amsT_AdmNo: 'MOCK/001' }))
    ).map((s: any, index: number) => ({
        amsT_Id: s.amsT_Id,
        amsT_FirstName: s.studentName || (index % 2 === 0 ? 'ARAVIND SWAMY' : 'SNEHA REDDY'),
        amsT_AdmNo: s.amsT_AdmNo || `B2023/00${index + 1}`,
        amsT_DOB: s.amsT_DOB || (index % 2 === 0 ? '2009-05-15' : '2009-11-22'),
        final_subj_marks: subjects.map((sub) => ({
            sub_details: { ...sub, estmppS_ObtainedMarks: 85, estmppS_Remarks: 'Good' },
            subj_marks_details: exams.map((e) => ({
                emE_Id: e.emE_Id,
                estmpS_ObtainedMarks: Math.floor(Math.random() * e.marks),
                estmpS_ObtainedGrade: 'A'
            }))
        })),
        stu_subjects: subjects.map((sub) => ({ ...sub, estmppS_ObtainedMarks: 90 })),
        stu_student_marks: [],
        stu_Total_Array_Grp: [{ total_s_o: 550, total_s_f: 580 }],
        stu_Total_total_grp: 600,
        total_percentage: 85.5,
        overall_percentage: 87.2,
        total_Exams: 650
    }));

    const attendanceMonths = [
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
        'January',
        'Febrauary',
        'March',
        'April'
    ];
    const generateAttendance = (studentId: number) => {
        const att: any = { AMST_Id: studentId, TotalWorkingDays: 210, TotalPresentDays: 195, Total_Percentage: 92.8 };
        attendanceMonths.forEach((m) => (att[m] = Math.floor(Math.random() * 20) + 5));
        return [att];
    };

    return {
        student_list,
        exam_list: exams,
        temp_headers: [
            { flag: 'O', Per_val: 20, equal_flag: false },
            { flag: 'F', Per_val: 100, equal_flag: false }
        ],
        exam_process_details: student_list.flatMap((s: any) =>
            exams.map((e) => ({
                amsT_Id: s.amsT_Id,
                emE_Id: e.emE_Id,
                estmP_TotalObtMarks: 150,
                estmP_Percentage: 75,
                estmP_SectionRank: 5,
                estmP_ClassRank: 12
            }))
        ),
        promotion_student_marks: student_list.flatMap((s: any) =>
            subjects.map((sub) => ({
                amsT_Id: s.amsT_Id,
                ismS_Id: sub.ismS_Id,
                estmppS_ObtainedMarks: 88,
                estmppS_MaxMarks: 100,
                estmppS_ObtainedGrade: 'A',
                estmppS_Remarks: 'Excellent'
            }))
        ),
        promotion_main_marks: student_list.map((s: any) => ({
            amsT_Id: s.amsT_Id,
            estmpP_SectionRank: 5
        })),
        stud_work_attendence: student_list.flatMap((s: any) => generateAttendance(s.amsT_Id)),
        stud_present_attendence: student_list.flatMap((s: any) => generateAttendance(s.amsT_Id)),
        ExmConfig_PromotionFlag: true,
        EMP_MarksPerFlg: 'P', // Toggle between 'P', 'F', 'T' to see variants
        Year_Name: '2023-24',
        Class_Teacher_Name: 'MS. SARAH WILLIAMS',
        Class_Name: 'IX',
        Section_Name: 'A',
        total_max_sub_marks: 100,
        masterinstitution: {
            mI_Name: 'BALDWIN BOYS HIGH SCHOOL',
            mI_Address1: '14, Richmond Road, Bangalore-560025',
            mI_Logo: 'https://dcampusstrg.blob.core.windows.net/files/Baldwin_Logo.png'
        }
    };
}
