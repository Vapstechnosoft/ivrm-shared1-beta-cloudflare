'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';

interface ReportViewProps {
    data: any;
    params: any;
}

export const ReportView = ({ data, params }: ReportViewProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const getinstitution = data?.getinstitution || data?.institution || data?.getInstitution || [];
    const getstudentdetails = data?.getstudentdetails || data?.studentdetails || data?.getStudentDetails || [];
    const getstudentmarksdetails =
        data?.getstudentmarksdetails || data?.studentmarksdetails || data?.studentmarks || data?.getStudentMarksDetails || [];
    const gettermdetails = data?.gettermdetails || data?.termdetails || data?.getTermDetails || [];
    const gettermexamdetails = data?.gettermexamdetails || data?.termexamdetails || data?.getTermExamDetails || [];
    const getgroupexamdetails = data?.getgroupexamdetails || data?.groupexamdetails || data?.getGroupExamDetails || [];
    const getgroupdetails = data?.getgroupdetails || data?.groupdetails || data?.getGroupDetails || [];
    const getstudentwisesubjectlist =
        data?.getstudentwisesubjectlist || data?.studentwisesubjectlist || data?.getStudentWiseSubjectList || [];
    const getstudentwiseskillslist = data?.getstudentwiseskillslist || data?.studentwiseskillslist || data?.getStudentWiseSkillsList || [];
    const getstudentwiseactiviteslist =
        data?.getstudentwiseactiviteslist || data?.studentwiseactiviteslist || data?.getStudentWiseActivitiesList || [];
    const getpromotionremarksdetails =
        data?.getpromotionremarksdetails || data?.promotionremarksdetails || data?.getPromotionRemarksDetails || [];
    const clstchname = data?.clstchname || data?.clstchname || [];

    const institution = getinstitution?.[0] || {};
    const teacherObj = clstchname?.[0] || {};
    const classTeacherName =
        teacherObj.hrmE_EmployeeFirstName ||
        teacherObj.HRME_EmployeeFirstName ||
        teacherObj.hrmE_FirstName ||
        teacherObj.userName ||
        teacherObj.username ||
        '';
    const generateddate = params?.generatedDate ? new Date(params.generatedDate) : new Date();

    const { reports, groupwiseexamlist, processedGroups } = useMemo(() => {
        if (!getstudentdetails || getstudentdetails.length === 0) return { reports: [], groupwiseexamlist: [], processedGroups: [] };

        const groupwiseexamlist_full: any[] = [];
        const groups_with_exams: any[] = [];

        getgroupdetails.forEach((dd: any) => {
            const groupwiseexamlist_temp: any[] = [];
            let counttotal = 0;

            const ddGroup = (dd.empG_DistplayName || dd.empG_GroupName || dd.EMPG_DistplayName || dd.EMPG_GroupName || '')
                .toLowerCase()
                .trim();

            getgroupexamdetails.forEach((d: any) => {
                const dGroup = (d.empG_DistplayName || d.empG_GroupName || d.EMPG_DistplayName || d.EMPG_GroupName || '')
                    .toLowerCase()
                    .trim();
                if (!ddGroup || !dGroup || ddGroup === dGroup) {
                    const maxMarks = d.empsgE_ForMaxMarkrs ?? d.EMPSGE_ForMaxMarkrs ?? d.maxMarks ?? 0;
                    counttotal += Number(maxMarks);

                    const examObj = {
                        EMPG_GroupName: d.empG_GroupName || d.EMPG_GroupName || dd.empG_GroupName,
                        EME_Id: d.emE_Id ?? d.EME_Id,
                        EME_ExamName: d.emE_ExamName || d.EME_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder ?? d.EME_ExamOrder,
                        EMPG_DistplayName: d.empG_DistplayName || d.EMPG_DistplayName || d.empG_GroupName || d.EMPG_GroupName || ddGroup,
                        EMPSGE_ForMaxMarkrs: maxMarks,
                        examnamedisplay: d.emE_ExamCode || d.EME_ExamCode || d.emE_ExamName || d.EME_ExamName || ''
                    };

                    groupwiseexamlist_temp.push(examObj);
                    groupwiseexamlist_full.push(examObj);
                }
            });

            const grpDisplayName = dd.empG_DistplayName || dd.empG_GroupName || dd.EMPG_DistplayName || dd.EMPG_GroupName || '';

            groupwiseexamlist_temp.push({
                EMPG_GroupName: dd.empG_GroupName || dd.EMPG_GroupName,
                EME_Id: 9800000,
                EME_ExamName: 'Marks Obtained',
                EME_ExamOrder: 9800000,
                EMPG_DistplayName: grpDisplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Total'
            });

            groupwiseexamlist_temp.push({
                EMPG_GroupName: dd.empG_GroupName || dd.EMPG_GroupName,
                EME_Id: 9800001,
                EME_ExamName: 'Grade',
                EME_ExamOrder: 9800001,
                EMPG_DistplayName: grpDisplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Grade'
            });

            groupwiseexamlist_full.push({
                EMPG_GroupName: dd.empG_GroupName || dd.EMPG_GroupName,
                EME_Id: 9800000,
                EME_ExamName: 'Marks Obtained',
                EME_ExamOrder: 9800000,
                EMPG_DistplayName: grpDisplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Total'
            });

            groupwiseexamlist_full.push({
                EMPG_GroupName: dd.empG_GroupName || dd.EMPG_GroupName,
                EME_Id: 9800001,
                EME_ExamName: 'Grade',
                EME_ExamOrder: 9800001,
                EMPG_DistplayName: grpDisplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Grade'
            });

            const myTerm = gettermdetails.find((t: any) => {
                const termId = t.ecT_Id ?? t.ECT_Id;
                const group_exams_in_term = gettermexamdetails
                    .filter((te: any) => (te.ecT_Id ?? te.ECT_Id) === termId)
                    .map((te: any) => te.emE_Id ?? te.EME_Id);
                return groupwiseexamlist_temp.some((e: any) => group_exams_in_term.includes(e.EME_Id || e.emE_Id));
            });

            groups_with_exams.push({
                ...dd,
                empsG_MarksValue: counttotal,
                groupewiseexam: groupwiseexamlist_temp,
                termName: myTerm?.ecT_TermName || myTerm?.ECT_TermName || ''
            });
        });

        // Fallback for groupwiseexamlist if getgroupdetails is empty
        if (groupwiseexamlist_full.length === 0 && getstudentmarksdetails.length > 0) {
            const seenGroups = new Set();
            getstudentmarksdetails.forEach((m: any) => {
                const grpName =
                    m.empG_DistplayName ||
                    m.EMPG_DistplayName ||
                    m.empG_GroupName ||
                    m.EMPG_GroupName ||
                    m.eme_ExamName ||
                    m.EME_ExamName ||
                    'Marks';
                if (!seenGroups.has(grpName)) {
                    seenGroups.add(grpName);
                    const examObj = {
                        EMPG_GroupName: grpName,
                        EME_Id: m.emE_Id ?? m.EME_Id ?? 1,
                        EME_ExamName: grpName,
                        EMPG_DistplayName: grpName,
                        EMPSGE_ForMaxMarkrs: m.maxMarks ?? 100,
                        examnamedisplay: grpName
                    };
                    groupwiseexamlist_full.push(examObj);
                }
            });
            groups_with_exams.push({
                empG_DistplayName: 'Academic Year',
                empsG_MarksValue: 100,
                groupewiseexam: groupwiseexamlist_full
            });
        }

        const studentReports = getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            const studentsubjects = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
            const all_student_marks = getstudentmarksdetails.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
            const studentmarks: any[] = [...all_student_marks];

            groups_with_exams.forEach((grp: any) => {
                const groupExams = (grp.groupewiseexam || []).filter((e: any) => (e.EME_Id || e.emE_Id) < 9000000);
                studentsubjects.forEach((subj: any) => {
                    const s_id = subj.ismS_Id ?? subj.ISMS_Id;
                    const s_name = (subj.ISMS_SubjectName || subj.subjectName || '').toLowerCase().trim();

                    const groupMarks = studentmarks.filter((m: any) => {
                        const m_sid = m.ismS_Id ?? m.ISMS_Id;
                        const m_name = (m.ISMS_SubjectName || m.ismS_SubjectName || m.subjectName || '').toLowerCase().trim();
                        const isSameSubject = (s_id && m_sid && s_id === m_sid) || (s_name && m_name && s_name === m_name);

                        const m_group = (m.EMPSG_DisplayName || m.empsG_DisplayName || m.EMPSG_GroupName || m.empsG_GroupName || '')
                            .toLowerCase()
                            .trim();
                        const g_group = (grp.empG_DistplayName || grp.empG_GroupName || grp.EMPG_DistplayName || grp.EMPG_GroupName || '')
                            .toLowerCase()
                            .trim();
                        const isSameGroup = !m_group || !g_group || m_group === g_group;

                        const m_emE_Id = m.EME_Id ?? m.emE_Id;
                        const isExamInGroup = groupExams.some((e: any) => (e.EME_Id ?? e.emE_Id) === m_emE_Id);

                        return isSameSubject && (isSameGroup || isExamInGroup);
                    });

                    if (groupMarks.length > 0) {
                        const totalObtained = groupMarks.reduce((sum: number, m: any) => {
                            const val = m.obtainedMarks ?? m.ObtainedMarks ?? m.estmpS_ObtainedMarks ?? 0;
                            return sum + Number(val);
                        }, 0);

                        const grpDisplayName =
                            grp.empG_DistplayName || grp.empG_GroupName || grp.EMPG_DistplayName || grp.EMPG_GroupName || '';

                        if (
                            !studentmarks.some(
                                (m: any) => m.ismS_Id === s_id && m.EME_Id === 9800000 && m.EMPSG_DisplayName === grpDisplayName
                            )
                        ) {
                            studentmarks.push({
                                ISMS_SubjectName: subj.ISMS_SubjectName || subj.subjectName,
                                ismS_Id: s_id,
                                EME_Id: 9800000,
                                EMPSG_DisplayName: grpDisplayName,
                                obtainedMarks: totalObtained,
                                PassFailFlag: 'Pass'
                            });
                        }

                        if (
                            !studentmarks.some(
                                (m: any) => m.ismS_Id === s_id && m.EME_Id === 9800001 && m.EMPSG_DisplayName === grpDisplayName
                            )
                        ) {
                            studentmarks.push({
                                ISMS_SubjectName: subj.ISMS_SubjectName || subj.subjectName,
                                ismS_Id: s_id,
                                EME_Id: 9800001,
                                EMPSG_DisplayName: grpDisplayName,
                                obtainedGrade: subj.subjectGrade || subj.subjectgrade || subj.estmpS_ObtainedGrade || '',
                                PassFailFlag: 'Pass'
                            });
                        }
                    }
                });
            });

            // STUDENT WISE SKILL LIST (Co-Scholastic)
            const skill_main_list: any[] = [];
            getstudentwiseskillslist.forEach((dd: any) => {
                if ((dd.AMST_Id || dd.amsT_Id) === studentId) {
                    const skillName =
                        dd.ECS_SkillName ||
                        dd.ecS_SkillName ||
                        dd.ecsM_SkillName ||
                        dd.ECSM_SkillName ||
                        dd.skillName ||
                        dd.skillname ||
                        dd.ecS_SkillArea ||
                        dd.ECS_SkillArea;
                    if (skillName && !skill_main_list.some((s) => s.ECS_SkillName === skillName)) {
                        skill_main_list.push({ ECS_SkillName: skillName });
                    }
                }
            });

            skill_main_list.forEach((skill) => {
                const skill_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    const termId = term.ecT_Id ?? term.ECT_Id;
                    getstudentwiseskillslist.forEach((dd: any) => {
                        const sName =
                            dd.ECS_SkillName ||
                            dd.ecS_SkillName ||
                            dd.ecsM_SkillName ||
                            dd.ECSM_SkillName ||
                            dd.skillName ||
                            dd.skillname ||
                            dd.ecS_SkillArea ||
                            dd.ECS_SkillArea;
                        const dTermId = dd.ecT_Id ?? dd.ECT_Id ?? dd.ecT_ID;
                        if ((dd.AMST_Id || dd.amsT_Id) === studentId && skill.ECS_SkillName === sName && termId === dTermId) {
                            skill_score_details.push({
                                scoregrade:
                                    dd.EMGD_Name || dd.emgD_Name || dd.EMGD_Grade || dd.emgD_Grade || dd.scoregrade || dd.grade || '',
                                ecT_Id: termId
                            });
                        }
                    });
                });
                skill.skill_score_details = skill_score_details;
            });

            // Student Wise Discipline List (Activities)
            const activity_main_list: any[] = [];
            getstudentwiseactiviteslist.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    const areaName =
                        act.ECACTA_SkillArea ||
                        act.ecactA_SkillArea ||
                        act.ecS_SkillArea ||
                        act.activityArea ||
                        act.activityName ||
                        act.activityname ||
                        act.ecsA_SkillName ||
                        act.ECACTA_SkillName ||
                        act.ecsA_AreaName ||
                        act.ECSA_AreaName;
                    if (areaName && !activity_main_list.some((a) => a.ECACTA_SkillArea === areaName)) {
                        activity_main_list.push({ ECACTA_SkillArea: areaName });
                    }
                }
            });

            activity_main_list.forEach((act) => {
                const activity_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    const termId = term.ecT_Id ?? term.ECT_Id;
                    getstudentwiseactiviteslist.forEach((dd: any) => {
                        const aName =
                            dd.ECACTA_SkillArea ||
                            dd.ecactA_SkillArea ||
                            dd.ecS_SkillArea ||
                            dd.activityArea ||
                            dd.activityName ||
                            dd.activityname ||
                            dd.ecsA_SkillName ||
                            dd.ECACTA_SkillName ||
                            dd.ecsA_AreaName ||
                            dd.ECSA_AreaName;
                        const dTermId = dd.ecT_Id ?? dd.ECT_Id ?? dd.ecT_ID;
                        if ((dd.AMST_Id || dd.amsT_Id) === studentId && act.ECACTA_SkillArea === aName && termId === dTermId) {
                            activity_score_details.push({
                                EMGD_Name:
                                    dd.EMGD_Name || dd.emgD_Name || dd.EMGD_Grade || dd.emgD_Grade || dd.scoregrade || dd.grade || '',
                                ecT_Id: termId
                            });
                        }
                    });
                });
                act.activity_score_details = activity_score_details;
            });

            const remarks_detail = getpromotionremarksdetails.find((d: any) => (d.amsT_Id || d.AMST_Id) === studentId);

            const fullName =
                stu.studentName ||
                stu.studentname ||
                `${stu.amsT_FirstName || stu.AMST_FirstName || ''} ${stu.amsT_MiddleName || stu.AMST_MiddleName || ''} ${stu.amsT_LastName || stu.AMST_LastName || ''}`.trim();
            const dobVal = stu.dob || stu.DOB || stu.amsT_DOB || stu.AMST_DOB || stu.amsT_Dob || stu.AMST_Dob || '';
            const clsNameVal = stu.className || stu.classname || stu.asmcL_ClassName || stu.ASMCL_ClassName || '';
            const secNameVal =
                stu.sectionName || stu.sectionname || stu.asmC_SectionName || stu.ASMC_SectionName || stu.asmS_SectionName || '';
            const classAndSec = secNameVal
                ? `${clsNameVal} / ${secNameVal} / ${stu.rollNo || stu.rollno || stu.amaY_RollNo || ''}`
                : clsNameVal;
            const finalSubjects = studentsubjects && studentsubjects.length > 0 ? studentsubjects : getstudentwisesubjectlist;

            return {
                ...stu,
                studentName: fullName,
                dob: dobVal,
                classAndSection: classAndSec,
                studentsubjects: finalSubjects,
                studentmarks,
                skill_main_list,
                activity_main_list,
                remarks: remarks_detail?.eprD_Remarks || remarks_detail?.EPRD_Remarks || remarks_detail?.remarks || '',
                promotedclass:
                    remarks_detail?.eprD_ClassPromoted || remarks_detail?.EPRD_ClassPromoted || remarks_detail?.promotedClass || ''
            };
        });

        return { reports: studentReports, groupwiseexamlist: groupwiseexamlist_full, processedGroups: groups_with_exams };
    }, [
        getstudentdetails,
        getgroupdetails,
        getgroupexamdetails,
        getstudentwisesubjectlist,
        getstudentmarksdetails,
        getstudentwiseskillslist,
        getstudentwiseactiviteslist,
        gettermdetails,
        getpromotionremarksdetails,
        gettermexamdetails
    ]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1100,height=850');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>NDS 9 Progress Card Report</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">
                        <style>
                            @page { size: portrait; margin: 6mm; }
                            body { font-family: 'Times New Roman', Times, serif; font-size: 11px; color: black; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 10px; }
                            .pagelayout { border: 2px solid black !important; padding: 15px !important; margin-bottom: 20px; page-break-after: always; background: white; width: 100% !important; box-sizing: border-box; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .text-bold { font-weight: bold; }
                            .table-bordered { width: 100% !important; border-collapse: collapse !important; margin-bottom: 0; }
                            .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td { border: 1px solid black !important; padding: 4px 5px !important; font-size: 11px; vertical-align: middle; }
                            .Ndsreport { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact !important; }
                            .Ndsreport1 { background-color: #f7db99 !important; -webkit-print-color-adjust: exact !important; }
                            .border-bottom { border-bottom: 1px solid black; padding-bottom: 2px; display: inline-block; min-width: 150px; }
                            .flex { display: flex; }
                            .items-center { align-items: center; }
                            .justify-between { justify-content: space-between; }
                            .gap-2 { gap: 8px; }
                            .flex-1 { flex: 1; }
                            @media print {
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        ${innerContents}
                    </body>
                </html>
            `);
            popupWinindow.document.close();
        }
    };

    if (!data || reports.length === 0) return null;

    return (
        <div className='space-y-6'>
            <style>{`
                #HHS02 thead { color: black !important; text-align: center; background: white !important; }
                #HHS02 .trclasssubject { height: 140px !important; white-space: pre-wrap; }
                #HHS02 .pagelayout { border: 2px solid black !important; padding: 20px !important; margin-bottom: 25px; background: white; max-width: 1100px; width: 100%; margin-left: auto; margin-right: auto; box-sizing: border-box; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                #HHS02 .Ndsreport { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                #HHS02 .Ndsreport1 { background-color: #f7db99 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                #HHS02 .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; }
                #HHS02 table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 0; table-layout: auto; }
                #HHS02 .table-bordered td, #HHS02 .table-bordered th { border: 1px solid black !important; padding: 5px 6px !important; vertical-align: middle; font-size: 11px; }
                #HHS02 .img-responsive { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            `}</style>

            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='bg-primary shadow-lg hover:bg-primary/90'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print All Reports
                </Button>
            </div>

            <div ref={printRef} id='HHS02' className='bg-gray-100 p-4'>
                {reports.map((report: any, index: number) => {
                    return (
                        <div key={index} className='pagelayout' style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                            <div className='my-2 flex justify-center'>
                                <img
                                    src={
                                        institution?.mI_Logo ||
                                        institution?.MI_Logo ||
                                        institution?.mI_Logo_Path ||
                                        institution?.mI_LogoPath ||
                                        institution?.logo ||
                                        '/assets/logo1.png'
                                    }
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/logo1.png';
                                    }}
                                    className='img-responsive max-h-24 object-contain'
                                    alt={institution?.mI_Name || 'School Logo'}
                                />
                            </div>

                            <div className='student-details-block my-4 space-y-1.5 px-1 text-xs'>
                                <div className='flex items-center gap-2 py-0.5'>
                                    <span className='w-36 shrink-0 font-bold text-gray-800 uppercase'>Class/Section/Roll No. :</span>
                                    <span className='min-w-[200px] border-bottom text-center font-bold uppercase'>
                                        {report.classAndSection || ''}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 py-0.5'>
                                    <span className='w-36 shrink-0 font-bold text-gray-800 uppercase'>Student's Name :</span>
                                    <span className='min-w-[250px] border-bottom text-center font-bold uppercase'>
                                        {report.studentName || report.studentname || ''}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 py-0.5'>
                                    <span className='w-36 shrink-0 font-bold text-gray-800 uppercase'>
                                        Father's/Mother's/Guardian's Name :
                                    </span>
                                    <span className='min-w-[250px] border-bottom text-center font-bold uppercase'>
                                        {report.fatherName ||
                                            report.fathername ||
                                            report.AMST_FatherName ||
                                            report.amsT_FatherName ||
                                            report.father_Name ||
                                            report.motherName ||
                                            report.mothername ||
                                            report.AMST_MotherName ||
                                            report.amsT_MotherName ||
                                            ''}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 py-0.5'>
                                    <span className='w-36 shrink-0 font-bold text-gray-800 uppercase'>Date Of Birth :</span>
                                    <span className='min-w-[200px] border-bottom text-center font-bold'>{report.dob || ''}</span>
                                </div>
                            </div>

                            <div className='my-4 w-full overflow-x-auto'>
                                <table className='table-bordered table w-full'>
                                    <thead>
                                        <tr>
                                            <th className='Ndsreport1 p-2 text-left font-bold' style={{ minWidth: '130px' }}>
                                                Scholastic Areas(A)
                                            </th>
                                            {processedGroups.map((grp: any, gIdx: number) => (
                                                <th
                                                    key={gIdx}
                                                    colSpan={grp.groupewiseexam.length}
                                                    className='Ndsreport1 p-2 text-center font-bold'
                                                    style={{ color: 'black' }}>
                                                    {grp.termName ? `${grp.termName} - ` : ''}
                                                    {grp.empG_DistplayName || grp.empG_GroupName} ({grp.empsG_MarksValue} Marks)
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th className='Ndsreport p-2 text-center font-bold' style={{ minWidth: '130px' }}>
                                                Subject Name
                                            </th>
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                <th
                                                    key={eIdx}
                                                    className='Ndsreport p-1 text-center font-bold text-[11px]'
                                                    style={{ minWidth: '50px', whiteSpace: 'normal' }}>
                                                    <div>{grpexam.examnamedisplay}</div>
                                                    {grpexam.EMPSGE_ForMaxMarkrs ? <div>({grpexam.EMPSGE_ForMaxMarkrs})</div> : null}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    {report.studentsubjects.map((subj: any, sIdx: number) => (
                                        <tbody key={sIdx}>
                                            <tr>
                                                <td
                                                    className={`text-left ${subj.EMPS_AppToResultFlg ? 'Ndsreport' : ''} p-1.5 font-bold`}
                                                    style={{ minWidth: '130px', wordBreak: 'break-word' }}>
                                                    {subj.ISMS_SubjectName || subj.subjectName || subj.ismS_SubjectName}
                                                </td>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <td key={eIdx} className='p-1 text-center font-semibold'>
                                                        {report.studentmarks
                                                            .filter((mrks: any) => {
                                                                const s_id = subj.ismS_Id ?? subj.ISMS_Id;
                                                                const m_sid = mrks.ismS_Id ?? mrks.ISMS_Id;
                                                                const s_name = (
                                                                    subj.ISMS_SubjectName ||
                                                                    subj.ismS_SubjectName ||
                                                                    subj.subjectName ||
                                                                    ''
                                                                )
                                                                    .toLowerCase()
                                                                    .trim();
                                                                const m_name = (
                                                                    mrks.ISMS_SubjectName ||
                                                                    mrks.ismS_SubjectName ||
                                                                    mrks.subjectName ||
                                                                    ''
                                                                )
                                                                    .toLowerCase()
                                                                    .trim();
                                                                const isSameSubject =
                                                                    (s_id && m_sid && s_id === m_sid) ||
                                                                    (s_name && m_name && s_name === m_name);

                                                                const m_emE_Id = mrks.EME_Id ?? mrks.emE_Id;
                                                                const g_emE_Id = grpexam.EME_Id ?? grpexam.emE_Id;
                                                                const isSameExam = m_emE_Id === g_emE_Id;

                                                                const m_group = (
                                                                    mrks.EMPSG_DisplayName ||
                                                                    mrks.empsG_DisplayName ||
                                                                    mrks.EMPSG_GroupName ||
                                                                    mrks.empsG_GroupName ||
                                                                    ''
                                                                )
                                                                    .toLowerCase()
                                                                    .trim();
                                                                const g_group = (
                                                                    grpexam.EMPG_DistplayName ||
                                                                    grpexam.EMPG_GroupName ||
                                                                    grpexam.empG_DistplayName ||
                                                                    grpexam.empG_GroupName ||
                                                                    ''
                                                                )
                                                                    .toLowerCase()
                                                                    .trim();
                                                                const isSameGroup = !m_group || !g_group || m_group === g_group;

                                                                return isSameSubject && isSameExam && isSameGroup;
                                                            })
                                                            .map((mrks: any, mIdx: number) => {
                                                                const obtMarks =
                                                                    mrks.ObtainedMarks ??
                                                                    mrks.obtainedMarks ??
                                                                    mrks.estmpS_ObtainedMarks ??
                                                                    '';
                                                                const obtGrade =
                                                                    mrks.ObtainedGrade ??
                                                                    mrks.obtainedGrade ??
                                                                    mrks.estmpS_ObtainedGrade ??
                                                                    '';
                                                                const pfFlag = mrks.PassFailFlag || mrks.passFailFlag || '';

                                                                return (
                                                                    <span key={mIdx}>
                                                                        {['AB', 'M', 'L'].includes(pfFlag) ? (
                                                                            <label>
                                                                                <b> {pfFlag}</b>
                                                                                {Number(obtMarks || 0) > 0 &&
                                                                                    grpexam.examnamedisplay !== 'Grade' && (
                                                                                        <b>({obtMarks})</b>
                                                                                    )}
                                                                            </label>
                                                                        ) : grpexam.examnamedisplay !== 'Grade' ? (
                                                                            <label>
                                                                                <b> {obtMarks}</b>
                                                                            </label>
                                                                        ) : (
                                                                            <label>
                                                                                <b> {obtGrade}</b>
                                                                            </label>
                                                                        )}
                                                                    </span>
                                                                );
                                                            })}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                            </div>

                            {/* Co-Scholastic Areas Table */}
                            {report.skill_main_list && report.skill_main_list.length > 0 && (
                                <div className='my-4 w-full overflow-x-auto'>
                                    <table className='table-bordered table w-full'>
                                        <thead>
                                            <tr>
                                                <th colSpan={gettermdetails.length + 1} className='Ndsreport1 p-2 text-center font-bold'>
                                                    Co-Scholastic Areas : on 5- Point(A-C) grading scale
                                                </th>
                                            </tr>
                                            <tr>
                                                <td style={{ minWidth: '130px' }} className='Ndsreport text-center font-bold'>
                                                    Skill Area
                                                </td>
                                                {gettermdetails.map((cos: any, tIdx: number) => (
                                                    <td key={tIdx} className='Ndsreport text-center font-bold'>
                                                        {cos.ecT_TermName || cos.ECT_TermName}
                                                    </td>
                                                ))}
                                            </tr>
                                        </thead>
                                        {report.skill_main_list.map((subjco: any, skIdx: number) => (
                                            <tbody key={skIdx}>
                                                <tr>
                                                    <td className='Ndsreport p-1.5 text-left font-bold' style={{ minWidth: '130px' }}>
                                                        {subjco.ECS_SkillName}
                                                    </td>
                                                    {gettermdetails.map((cos: any, tIdx: number) => {
                                                        const termId = cos.ecT_Id ?? cos.ECT_Id;
                                                        return (
                                                            <td key={tIdx} className='p-1.5 text-center font-semibold'>
                                                                {subjco.skill_score_details
                                                                    .filter((sc: any) => sc.ecT_Id === termId)
                                                                    .map((sc: any, scIdx: number) => (
                                                                        <b key={scIdx}>{sc.scoregrade}</b>
                                                                    ))}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                            )}

                            {/* Discipline Table */}
                            {report.activity_main_list && report.activity_main_list.length > 0 && (
                                <div className='my-4 w-full overflow-x-auto'>
                                    <table className='table-bordered table w-full'>
                                        <thead>
                                            <tr>
                                                <th colSpan={gettermdetails.length + 1} className='Ndsreport1 p-2 text-center font-bold'>
                                                    Discipline : on 5- Point(A-C) grading scale
                                                </th>
                                            </tr>
                                            <tr>
                                                <td style={{ minWidth: '130px' }} className='Ndsreport text-center font-bold'>
                                                    Activity Area
                                                </td>
                                                {gettermdetails.map((cos: any, tIdx: number) => (
                                                    <td key={tIdx} className='Ndsreport text-center font-bold'>
                                                        {cos.ecT_TermName || cos.ECT_TermName}
                                                    </td>
                                                ))}
                                            </tr>
                                        </thead>
                                        {report.activity_main_list.map((subjco: any, actIdx: number) => (
                                            <tbody key={actIdx}>
                                                <tr>
                                                    <td className='Ndsreport p-1.5 text-left font-bold' style={{ minWidth: '130px' }}>
                                                        {subjco.ECACTA_SkillArea}
                                                    </td>
                                                    {gettermdetails.map((cos: any, tIdx: number) => {
                                                        const termId = cos.ecT_Id ?? cos.ECT_Id;
                                                        return (
                                                            <td key={tIdx} className='p-1.5 text-center font-semibold'>
                                                                {subjco.activity_score_details
                                                                    .filter((sc: any) => sc.ecT_Id === termId)
                                                                    .map((sc: any, scIdx: number) => (
                                                                        <b key={scIdx}>{sc.EMGD_Name}</b>
                                                                    ))}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                            )}

                            <div className='margin-top-10 mt-6 space-y-2'>
                                <div className='flex items-center gap-2 py-1 text-xs'>
                                    <label className='w-44 shrink-0 font-bold'>Class Teacher's Remarks : </label>
                                    <b className='flex-1 border-bottom font-semibold'>{report.remarks}</b>
                                </div>

                                <div className='flex items-center gap-2 py-1 text-xs'>
                                    <label className='w-44 shrink-0 font-bold'>Promoted To Class : </label>
                                    <b className='flex-1 border-bottom font-semibold'>{report.promotedclass}</b>
                                </div>
                            </div>

                            <div className='mt-12 pt-4'>
                                <div className='flex items-end justify-between text-xs'>
                                    <div className='w-1/4'>
                                        <label className='font-bold'>Date : {format(generateddate, 'dd/MM/yyyy')}</label>
                                    </div>

                                    <div className='flex w-1/4 flex-col items-center text-center'>
                                        <span className='mb-6 font-bold'>{classTeacherName}</span>
                                        <label className='w-full border-black border-t px-2 pt-1 font-bold'>
                                            Signature of Class Teacher
                                        </label>
                                    </div>
                                    <div className='w-1/4 text-center'>
                                        <label className='w-full border-black border-t px-2 pt-1 font-bold'>Signature of Principal</label>
                                    </div>
                                    <div className='w-1/4 text-center'>
                                        <label className='w-full border-black border-t px-2 pt-1 font-bold'>Signature of Parents</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
