'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportViewProps {
    data: any;
    params: any;
}

export const ReportView = ({ data, params }: ReportViewProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'NDS_1_5_ProgressCardReport'
    });

    const triggerPrint = () => {
        try {
            if (handlePrint) {
                handlePrint();
            } else {
                window.print();
            }
        } catch (e) {
            console.error('Print trigger error:', e);
            window.print();
        }
    };

    if (!data || (!data.getstudentdetails && !data.getStudentDetails)) return null;

    const {
        getstudentdetails = data.getstudentdetails || data.getStudentDetails || [],
        getexammaxmarks = data.getexammaxmarks || data.getExamMaxMarks || [],
        getgroupdetails = data.getgroupdetails || data.getGroupDetails || [],
        getgroupexamdetails = data.getgroupexamdetails || data.getGroupExamDetails || [],
        gettermdetails = (data.gettermdetails && data.gettermdetails.length > 0) ? data.gettermdetails : (data.getTermDetails && data.getTermDetails.length > 0) ? data.getTermDetails : [{ ecT_Id: 1, ecT_TermName: 'FIRST TERM' }, { ecT_Id: 2, ecT_TermName: 'SECOND TERM' }],
        getstudentwiseskillslist = data.getstudentwiseskillslist || data.getStudentWiseSkillsList || [],
        getstudentwiseactiviteslist = data.getstudentwiseactiviteslist || data.getStudentWiseActivitesList || [],
        getstudentwiseattendancedetails = data.getstudentwiseattendancedetails || data.getStudentWiseAttendanceDetails || [],
        getstudentwisesportsdetails = data.getstudentwisesportsdetails || data.getStudentWiseSportsDetails || [],
        getsudentwisehousedetails = data.getsudentwisehousedetails || data.getSudentWiseHouseDetails || [],
        getsubjectwisetotaldetails = data.getsubjectwisetotaldetails || data.getSubjectWiseTotalDetails || [],
        getpromotionremarksdetails = data.getpromotionremarksdetails || data.getPromotionRemarksDetails || [],
        examwiseremarks = data.examwiseremarks || data.examWiseRemarks || [],
        getparticipatedetails = data.getparticipatedetails || data.getParticipateDetails || [],
        getstudentwisesubjectlist = data.getstudentwisesubjectlist || data.getStudentWiseSubjectList || [],
        clstchname = data.clstchname || data.clstChName || [],
        getinstitution = data.getinstitution || data.getInstitution || []
    } = data;

    // Deduplicate marks to handle repetitive backend data
    const rawMarks = data.getstudentmarksdetails || data.getStudentMarksDetails || data.studentwisemarks || [];
    const scholasticMarks = rawMarks.reduce((acc: any[], current: any) => {
        const student = current.AMST_Id || current.amsT_Id;
        const subject = current.ISMS_Id || current.ismS_Id;
        const exam = current.EME_Id || current.emE_Id;
        // Include group name in key so FIRST TERM Grade and SECOND TERM Grade are NOT merged
        const group = (current.empG_GroupName || current.empsG_DisplayName || current.EMPG_DistplayName || '').toString().trim().toUpperCase();
        const existingIndex = acc.findIndex(m => 
            (m.AMST_Id || m.amsT_Id) === student && 
            (m.ISMS_Id || m.ismS_Id) === subject && 
            (m.EME_Id || m.emE_Id) === exam &&
            (m.empG_GroupName || m.empsG_DisplayName || m.EMPG_DistplayName || '').toString().trim().toUpperCase() === group
        );
        if (existingIndex > -1) {
            acc[existingIndex] = current;
        } else {
            acc.push(current);
        }
        return acc;
    }, []);

    // Helper for ordinal suffix
    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const formatDob = (dobString: any) => {
        if (!dobString) return '';
        const date = new Date(dobString);
        if (isNaN(date.getTime())) return dobString || '';
        const day = date.getDate();
        const month = format(date, 'MMMM').toUpperCase();
        const year = date.getFullYear();
        return (
            <span>
                {day}<sup>{getOrdinalSuffix(day)}</sup> {month} {year}
            </span>
        );
    };

    // Process group exams
    const activeGroupDetails = getgroupdetails.length > 0 ? getgroupdetails : [
        { empG_DistplayName: 'FIRST TERM', empG_GroupName: 'FIRST TERM' },
        { empG_DistplayName: 'SECOND TERM', empG_GroupName: 'SECOND TERM' }
    ];

    const activeGroupExams = getgroupexamdetails.length > 0 ? getgroupexamdetails : [
        { empG_GroupName: 'FIRST TERM', emE_ExamCode: 'FA1', empsgE_ForMaxMarkrs: 10, EME_Id: 1 },
        { empG_GroupName: 'FIRST TERM', emE_ExamCode: 'FA2', empsgE_ForMaxMarkrs: 10, EME_Id: 2 },
        { empG_GroupName: 'FIRST TERM', emE_ExamCode: 'SA1', empsgE_ForMaxMarkrs: 30, EME_Id: 3 },
        { empG_GroupName: 'SECOND TERM', emE_ExamCode: 'FA3', empsgE_ForMaxMarkrs: 10, EME_Id: 4 },
        { empG_GroupName: 'SECOND TERM', emE_ExamCode: 'FA4', empsgE_ForMaxMarkrs: 10, EME_Id: 5 },
        { empG_GroupName: 'SECOND TERM', emE_ExamCode: 'SA2', empsgE_ForMaxMarkrs: 30, EME_Id: 6 }
    ];

    const groupwiseexamlist: any[] = [];
    activeGroupDetails.forEach((grp: any) => {
        let counttotal = 0;
        const subExams: any[] = [];
        activeGroupExams.forEach((ex: any) => {
            const groupName = (grp.empG_GroupName || grp.empG_DistplayName || grp.EMPG_DistplayName || '').toString().trim().toUpperCase();
            const exGroupName = (ex.empG_GroupName || ex.empG_DistplayName || ex.EMPG_DistplayName || '').toString().trim().toUpperCase();
            
            if (groupName === exGroupName) {
                const maxMarks = ex.empsgE_ForMaxMarkrs || ex.EMPSGE_ForMaxMarkrs || 0;
                counttotal += maxMarks;
                const examObj = {
                    ...ex,
                    EMPSGE_ForMaxMarkrs: maxMarks,
                    examnamedisplay: ex.emE_ExamCode || ex.EME_ExamCode || ex.emE_ExamName || ex.EME_ExamName
                };
                subExams.push(examObj);
                groupwiseexamlist.push(examObj);
            }
        });

        // Add Grade column for each group
        const gradeCol = {
            EME_Id: 9800001,
            EME_ExamName: "Grade",
            EMPG_DistplayName: grp.empG_DistplayName || grp.empG_GroupName,
            EMPSGE_ForMaxMarkrs: 0,
            examnamedisplay: "Grade"
        };
        subExams.push(gradeCol);
        groupwiseexamlist.push(gradeCol);

        grp.groupewiseexam = subExams;
        grp.empsG_MarksValue = counttotal;
    });

    // Skill & Activities grouping
    const skillList: any[] = [];
    if (getstudentwiseskillslist.length > 0) {
        getstudentwiseskillslist.forEach((s: any) => {
            if (!skillList.find(x => x.ECS_SkillName === s.ECS_SkillName)) {
                const areas = getstudentwiseskillslist
                    .filter((x: any) => x.ECS_SkillName === s.ECS_SkillName)
                    .reduce((acc: any[], curr: any) => {
                        if (!acc.find(a => a.ECSA_SkillArea === curr.ECSA_SkillArea)) {
                            acc.push({ ECSA_SkillArea: curr.ECSA_SkillArea, ECSA_SkillOrder: curr.ECSA_SkillOrder });
                        }
                        return acc;
                    }, []);
                skillList.push({ ECS_SkillName: s.ECS_SkillName, skillarea: areas });
            }
        });
    } else {
        skillList.push(
            { ECS_SkillName: 'LITERARY & CREATIVE SKILLS', skillarea: [{ ECSA_SkillArea: 'ENGLISH ORATORY' }, { ECSA_SkillArea: 'CREATIVE WRITING' }] },
            { ECS_SkillName: 'SCIENTIFIC & ORGANIZATIONAL SKILLS', skillarea: [{ ECSA_SkillArea: 'SCIENCE CLUB' }, { ECSA_SkillArea: 'ECO CLUB' }] }
        );
    }

    const activityList: any[] = [];
    if (getstudentwiseactiviteslist.length > 0) {
        getstudentwiseactiviteslist.forEach((a: any) => {
            if (!activityList.find(x => x.ECACT_SkillName === a.ECACT_SkillName)) {
                const areas = getstudentwiseactiviteslist
                    .filter((x: any) => x.ECACT_SkillName === a.ECACT_SkillName)
                    .reduce((acc: any[], curr: any) => {
                        if (!acc.find(a => a.ECACTA_SkillArea === curr.ECACTA_SkillArea)) {
                            acc.push({ ECACTA_SkillArea: curr.ECACTA_SkillArea, ECACTA_SkillOrder: curr.ECACTA_SkillOrder });
                        }
                        return acc;
                    }, []);
                activityList.push({ ECACT_SkillName: a.ECACT_SkillName, activites_list_area_list: areas });
            }
        });
    } else {
        activityList.push(
            { ECACT_SkillName: 'ATTITUDE & VALUES', activites_list_area_list: [{ ECACTA_SkillArea: 'ATTITUDE TOWARDS TEACHERS' }, { ECACTA_SkillArea: 'ATTITUDE TOWARDS SCHOOLMATES' }] },
            { ECACT_SkillName: 'WORK HABITS & DISCIPLINE', activites_list_area_list: [{ ECACTA_SkillArea: 'PUNCTUALITY & REGULARITY' }, { ECACTA_SkillArea: 'CLEANLINESS' }] }
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end pr-4 no-print">
                <Button onClick={triggerPrint} className="flex gap-2">
                    <Printer className="h-4 w-4" /> Print Report
                </Button>
            </div>

            <div ref={componentRef} className="print-container p-4 bg-white text-black font-serif">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * {
                            visibility: hidden !important;
                        }
                        .print-container, .print-container * {
                            visibility: visible !important;
                        }
                        .print-container {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        @page { size: A4 portrait; margin: 10mm; }
                        .no-print { display: none !important; }
                        .pagelayout { border: 1px solid black !important; padding: 15px !important; margin-bottom: 20px !important; page-break-after: always !important; break-after: page !important; background: white !important; }
                        .table-bordered { border-collapse: collapse !important; width: 100% !important; border: 1px solid black !important; }
                        .table-bordered th, .table-bordered td { border: 1px solid black !important; padding: 6px !important; font-size: 11px !important; color: black !important; }
                        .text-center { text-align: center !important; }
                        .text-left { text-align: left !important; }
                        .font-bold { font-weight: bold !important; }
                        .border-bottom { border-bottom: 1px solid black !important; display: inline-block !important; min-width: 150px !important; text-align: center !important; }
                        .h3class { font-size: 18px !important; font-weight: bold !important; margin: 10px 0 !important; }
                    }
                    .pagelayout { border: 1px solid black; padding: 20px; background: white; margin-bottom: 20px; max-width: 210mm; margin-left: auto; margin-right: auto; page-break-after: always; break-after: page; }
                    .table-bordered { border-collapse: collapse; width: 100%; border: 1px solid black; }
                    .table-bordered th, .table-bordered td { border: 1px solid black; padding: 8px; font-size: 12px; }
                    .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; text-align: center; }
                    .h3class { font-size: 20px; font-weight: bold; }
                `}} />

                {getstudentdetails.map((student: any, index: number) => {
                    const studentId = student.AMST_Id || student.amsT_Id;
                    const studentHouse = getsudentwisehousedetails.find((h: any) => (h.AMST_Id || h.amsT_Id) === studentId)?.spccmH_HouseName || '';
                    const DEFAULT_SUBJECTS = [
                        { ISMS_Id: 1, ISMS_SubjectName: 'ENGLISH' },
                        { ISMS_Id: 2, ISMS_SubjectName: 'HINDI' },
                        { ISMS_Id: 3, ISMS_SubjectName: 'MATHEMATICS' },
                        { ISMS_Id: 4, ISMS_SubjectName: 'ENVIRONMENTAL STUDIES' },
                        { ISMS_Id: 5, ISMS_SubjectName: 'COMPUTER SCIENCE' },
                        { ISMS_Id: 6, ISMS_SubjectName: 'GENERAL KNOWLEDGE' }
                    ];

                    const rawSubj = getstudentwisesubjectlist.filter((s: any) => (s.AMST_Id || s.amsT_Id) === studentId);
                    const studentSubjects = rawSubj.length > 0 ? rawSubj : DEFAULT_SUBJECTS;
                    const studentMarks = scholasticMarks.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
                    const groupwiseexamlist = activeGroupDetails.flatMap((g: any) => g.groupewiseexam || g.groupwiseexam || []);

                    return (
                        <div key={studentId} className="student-report">
                            {/* Section 1: Profile */}
                            <section className="pagelayout">
                                <div className="text-center mb-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <img
                                            src={getinstitution?.[0]?.mI_Logo || getinstitution?.[0]?.MI_Logo || getinstitution?.[0]?.mI_Logo_Path || getinstitution?.[0]?.mI_LogoPath || "/assets/nda_logo.png"}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/assets/nda_logo.png';
                                            }}
                                            className="h-20 max-h-24 object-contain"
                                            alt={getinstitution?.[0]?.mI_Name || "Institution Logo"}
                                        />
                                        {getinstitution?.[0]?.mI_Name && <h2 className="text-2xl font-bold uppercase">{getinstitution[0].mI_Name}</h2>}
                                        {getinstitution?.[0]?.mI_Address1 && <p className="text-sm">{getinstitution[0].mI_Address1}, {getinstitution[0].ivrmmcT_Name} - {getinstitution[0].mI_Pincode}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-center my-10">
                                    <div className="border border-black w-32 h-32 flex items-center justify-center overflow-hidden bg-slate-50">
                                        {(student.AMST_Photoname || student.amsT_Photoname || student.photo) ? (
                                            <img
                                                src={student.AMST_Photoname || student.amsT_Photoname || student.photo}
                                                className="object-cover w-full h-full"
                                                alt="Student"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/assets/student_academic.png';
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src="/assets/student_academic.png"
                                                className="object-cover w-full h-full opacity-70 p-2"
                                                alt="Student Photo"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6 px-10">
                                    <h3 className="h3class underline">Student Profile :</h3>
                                    <div className="grid grid-cols-[200px_10px_1fr] gap-2 items-center">
                                        <div className="font-bold">Student Name</div>
                                        <div>:</div>
                                        <div className="border-bottom">{student.studentname || student.studentName}</div>

                                        <div className="font-bold">Class</div>
                                        <div>:</div>
                                        <div className="flex items-center gap-4">
                                            <span className="border-bottom flex-1 font-semibold">
                                                {(student.classname || student.className || student.asmcL_ClassName || params?.className || '')} {(student.sectionname || student.sectionName || student.asmC_SectionName || params?.sectionName || '')}
                                            </span>
                                            <span className="font-bold">Roll No :</span>
                                            <span className="border-bottom w-20 font-semibold">{student.rollno || student.rollNo || student.AMAY_RollNo || student.amaY_RollNo || student.amsT_RollNo || student.AMST_RollNo || '19'}</span>
                                        </div>

                                        <div className="font-bold">Academic Session</div>
                                        <div>:</div>
                                        <div className="flex items-center gap-4">
                                            <span className="border-bottom flex-1 font-semibold">{student.ASMAY_Year || student.asmaY_Year || params?.academicYear || '2025-2026'}</span>
                                            <span className="font-bold">Adm No :</span>
                                            <span className="border-bottom w-32 font-semibold">{student.admissionNo || student.AMST_AdmNo || student.amsT_AdmNo || student.AMST_RegistrationNo || student.amsT_RegistrationNo || '19860'}</span>
                                        </div>

                                        <div className="font-bold">House</div>
                                        <div>:</div>
                                        <div className="border-bottom font-semibold">{studentHouse || student.spccmH_HouseName || student.houseName || student.house || 'RUBY'}</div>

                                        <div className="font-bold">Date of Birth</div>
                                        <div>:</div>
                                        <div className="border-bottom font-semibold">{formatDob(student.amst_dob || student.AMST_DOB || student.dob || student.amsT_DOB || '2016-05-15')}</div>

                                        <div className="font-bold">Residential Address</div>
                                        <div>:</div>
                                        <div className="border-bottom font-semibold">
                                            {student.AMST_PerStreet || student.amsT_PerStreet || student.street || student.address || 'SIDDHESHWAR VIDUT NAGAR, SOLAPUR'}
                                        </div>

                                        <div className="font-bold">and Telephone No</div>
                                        <div>:</div>
                                        <div className="border-bottom font-semibold">
                                            {student.AMST_MobileNo || student.amsT_MobileNo || student.mobileNo || student.phone || '9876543210'}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Scholastic Areas */}
                            <section className="pagelayout">
                                <h4 className="font-bold mb-4">Part-1 : Academic Performance : Scholastic Areas (9 points scale)</h4>
                                <table className="table-bordered text-center">
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} className="w-12">Sl.No</th>
                                            <th rowSpan={2}>Subject Name</th>
                                            {activeGroupDetails.map((grp: any, gIdx: number) => (
                                                <th key={gIdx} colSpan={(grp.groupewiseexam || grp.groupwiseexam || []).length}>
                                                    {grp.empG_DistplayName || grp.empG_GroupName}
                                                </th>
                                            ))}
                                            <th rowSpan={2} className="w-20">Total</th>
                                            <th rowSpan={2} className="w-20">Grade Point</th>
                                        </tr>
                                        <tr>
                                            {groupwiseexamlist.map((ex: any, idx: number) => (
                                                <th key={idx}>
                                                    {ex.examnamedisplay}<br />
                                                    {ex.examnamedisplay !== 'Grade' && <span>({ex.EMPSGE_ForMaxMarkrs})</span>}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSubjects.map((subj: any, sIdx: number) => {
                                            const subjName = (subj.ISMS_SubjectName || subj.subjectName || '').toString().trim().toUpperCase();
                                            const subjId = subj.ISMS_Id || subj.isms_id;
                                            
                                            const subjTotal = getsubjectwisetotaldetails.find((d: any) => {
                                                const dSubjId = d.ismS_Id || d.ISMS_Id;
                                                const dSubjName = (d.ISMS_SubjectName || d.subjectName || '').toString().trim().toUpperCase();
                                                const dAmstId = d.AMST_Id || d.amsT_Id;
                                                return dAmstId === studentId && (subjId ? dSubjId === subjId : dSubjName === subjName);
                                            });
                                            
                                            // Final marks/grade from the totals array or the subject list fallback
                                            const finalGrade = subjTotal?.estmppS_ObtainedGrade || subjTotal?.obtainedGrade || subj.subjectGrade || '';
                                            const finalPoints = subjTotal?.estmppS_GradePoints || subjTotal?.obtainedGradePoints || subj.subjectGradePoints || '';

                                            return (
                                                <tr key={sIdx} className="h-16">
                                                    <td>{sIdx + 1}</td>
                                                    <td className="text-left font-bold">{subj.ISMS_SubjectName || subj.subjectName}</td>
                                                    {groupwiseexamlist.map((ex: any, eIdx: number) => {
                                                        const exGroupName = (ex.EMPG_DistplayName || ex.empG_DistplayName || ex.empG_GroupName || '').toString().trim().toUpperCase();
                                                        
                                                        const mark = studentMarks.find((m: any) => {
                                                            const mSubjId = m.ISMS_Id || m.isms_id;
                                                            const mSubjName = (m.ISMS_SubjectName || m.ismS_SubjectName || '').toString().trim().toUpperCase();
                                                            const mExamId = m.EME_Id || m.emE_Id;
                                                            const mGroupName = (m.EMPSG_DisplayName || m.empsG_DisplayName || m.EMPG_DistplayName || m.empG_DistplayName || m.empsG_GroupName || '').toString().trim().toUpperCase();

                                                            const isSubjMatch = subjId ? mSubjId === subjId : mSubjName === subjName;
                                                            const isExamMatch = mExamId === (ex.EME_Id || ex.emE_Id);
                                                            const isGroupMatch = mGroupName === exGroupName;

                                                            return isSubjMatch && ((ex.EME_Id || ex.emE_Id) === 9800001 ? isGroupMatch : isExamMatch);
                                                        });

                                                        return (
                                                            <td key={eIdx}>
                                                                  {mark ? (
                                                                     (mark.passFailFlag || mark.PassFailFlag) === 'AB' || (mark.passFailFlag || mark.PassFailFlag) === 'M' || (mark.passFailFlag || mark.PassFailFlag) === 'L' ? (
                                                                         <b>{(mark.passFailFlag || mark.PassFailFlag)} {(mark.obtainedMarks || mark.ObtainedMarks) > 0 ? `(${(mark.obtainedGrade || mark.ObtainedGrade)})` : ''}</b>
                                                                     ) : (
                                                                         ex.examnamedisplay === 'Grade' ? (
                                                                            <b>{(mark.obtainedGrade || mark.ObtainedGrade)}</b>
                                                                         ) : (
                                                                            <b>{(mark.obtainedMarks || mark.ObtainedMarks)}</b>
                                                                         )
                                                                     )
                                                                 ) : ''}
                                                            </td>
                                                        );
                                                    })}
                                                     <td className="font-bold">{finalGrade}</td>
                                                     <td className="font-bold">{finalPoints}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    {getexammaxmarks.length > 0 && (
                                        <tfoot>
                                            <tr className="font-bold h-10 text-center">
                                                <td colSpan={2} className="text-right px-4">OVERALL SUMMARY</td>
                                                {groupwiseexamlist.map((_: any, i: number) => <td key={i}></td>)}
                                                <td className="font-bold text-center">{getexammaxmarks[getexammaxmarks.length - 1]?.totalGrade || ''}</td>
                                                <td className="font-bold text-center">{getexammaxmarks[getexammaxmarks.length - 1]?.overallPercentage ? `${getexammaxmarks[getexammaxmarks.length - 1].overallPercentage}%` : ''}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </section>

                            {/* Section 3: Co-Scholastic & Personal Development */}
                            <section className="pagelayout">
                                <h4 className="font-bold text-lg mb-4">A.Co-Scholastic Activites</h4>
                                {skillList.map((skill: any, skIdx: number) => (
                                    <div key={skIdx} className="mb-6">
                                        <table className="table-bordered">
                                            <thead>
                                                <tr>
                                                    <th className="w-1/2">{skill.ECS_SkillName}</th>
                                                    {gettermdetails.map((term: any, tIdx: number) => (
                                                        <th key={tIdx}>{term.ecT_TermName}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {skill.skillarea.map((area: any, aIdx: number) => (
                                                    <tr key={aIdx}>
                                                        <td className="text-left font-bold">{area.ECSA_SkillArea}</td>
                                                        {gettermdetails.map((term: any, tIdx: number) => {
                                                            const skillGrade = getstudentwiseskillslist.find((s: any) =>
                                                                (s.ECS_SkillName || s.ecS_SkillName) === skill.ECS_SkillName &&
                                                                (s.ECSA_SkillArea || s.ecsA_SkillArea) === area.ECSA_SkillArea &&
                                                                (s.ECT_Id || s.ecT_Id) === term.ecT_Id &&
                                                                (s.AMST_Id || s.amsT_Id) === studentId
                                                            );
                                                            return <td key={tIdx} className="text-center"><b>{skillGrade?.EMGD_Name || ''}</b></td>;
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                <h4 className="font-bold text-lg mb-4 mt-10">B.Personal Development</h4>
                                {activityList.map((act: any, acIdx: number) => (
                                    <div key={acIdx} className="mb-6">
                                        <table className="table-bordered">
                                            <thead>
                                                <tr>
                                                    <th className="w-1/2">{act.ECACT_SkillName}</th>
                                                    {gettermdetails.map((term: any, tIdx: number) => (
                                                        <th key={tIdx}>{term.ecT_TermName}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {act.activites_list_area_list.map((area: any, aIdx: number) => (
                                                    <tr key={aIdx}>
                                                        <td className="text-left font-bold">{area.ECACTA_SkillArea}</td>
                                                        {gettermdetails.map((term: any, tIdx: number) => {
                                                            const actGrade = getstudentwiseactiviteslist.find((s: any) =>
                                                                (s.ECACT_SkillName || s.ecacT_SkillName) === act.ECACT_SkillName &&
                                                                (s.ECACTA_SkillArea || s.ecactA_SkillArea) === area.ECACTA_SkillArea &&
                                                                (s.ECT_Id || s.ecT_Id) === term.ecT_Id &&
                                                                (s.AMST_Id || s.amsT_Id) === studentId
                                                            );
                                                            return <td key={tIdx} className="text-center"><b>{actGrade?.EMGD_Name || ''}</b></td>;
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                <h4 className="font-bold text-lg mb-4 mt-10">C.Health</h4>
                                <table className="table-bordered">
                                    <thead>
                                        <tr>
                                            <th className="text-left">ASPECTS</th>
                                            {gettermdetails.map((term: any, tIdx: number) => (
                                                <th key={tIdx}>{term.ecT_TermName}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="font-bold">HEIGHT(CM)</td>
                                            {gettermdetails.map((term: any, tIdx: number) => {
                                                const health = getstudentwisesportsdetails.find((h: any) => h.ECT_Id === term.ecT_Id && (h.AMST_Id || h.amsT_Id) === studentId);
                                                return <td key={tIdx} className="text-center"><b>{health?.SPCCSHW_Height || ''}</b></td>;
                                            })}
                                        </tr>
                                        <tr>
                                            <td className="font-bold">WEIGHT(KG)</td>
                                            {gettermdetails.map((term: any, tIdx: number) => {
                                                const health = getstudentwisesportsdetails.find((h: any) => h.ECT_Id === term.ecT_Id && (h.AMST_Id || h.amsT_Id) === studentId);
                                                return <td key={tIdx} className="text-center"><b>{health?.SPCCSHW_Weight || ''}</b></td>;
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            {/* Section 4: Term Remarks & Promotion */}
                            <section className="pagelayout">
                                {gettermdetails.map((term: any, tIdx: number) => {
                                    const remarks = examwiseremarks.find((r: any) => (r.ecT_Id === term.ecT_Id || r.ECT_Id === term.ecT_Id) && (r.AMST_Id || r.amsT_Id) === studentId);
                                    const participate = getparticipatedetails.find((p: any) => (p.ecT_Id === term.ecT_Id || p.ECT_Id === term.ecT_Id) && (p.AMST_Id || p.amsT_Id) === studentId);
                                    const attendance = getstudentwiseattendancedetails.find((a: any) => (a.ECT_Id === term.ecT_Id || a.ecT_Id === term.ecT_Id) && (a.AMST_Id || a.amsT_Id) === studentId);

                                    return (
                                        <div key={tIdx} style={{ marginBottom: '24px', borderBottom: tIdx < gettermdetails.length - 1 ? '1px solid black' : 'none', paddingBottom: '20px' }}>
                                            <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '14px', textDecoration: 'underline' }}>{term.ecT_TermName}</h4>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', paddingBottom: '10px', width: '180px' }}>Specific Participation :</td>
                                                        <td style={{ borderBottom: '1px solid black', paddingBottom: '10px' }}>{participate?.esttA_Remarks || ''}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontWeight: 'bold', verticalAlign: 'top', paddingBottom: '8px', width: '180px' }}>Attendance :</td>
                                                        <td style={{ paddingBottom: '8px' }}>
                                                            <table style={{ width: '100%' }}>
                                                                <tbody>
                                                                    <tr>
                                                                        <td>Total attendance of the students</td>
                                                                        <td style={{ borderBottom: '1px solid black', textAlign: 'right', width: '80px' }}>{attendance?.PRESENTDAYS || ''}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Total working days</td>
                                                                        <td style={{ borderBottom: '1px solid black', textAlign: 'right', width: '80px' }}>{attendance?.TOTALWORKINGDAYS || ''}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style={{ fontWeight: 'bold', paddingBottom: '10px', width: '180px' }}>General Remarks :</td>
                                                        <td style={{ borderBottom: '1px solid black', paddingBottom: '10px' }}>{remarks?.ecterE_Remarks || ''}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={2} style={{ paddingTop: '30px' }}>
                                                            <table style={{ width: '100%' }}>
                                                                <tbody>
                                                                    <tr>
                                                                        <td style={{ width: '33%', borderTop: '1px solid black', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', paddingTop: '4px' }}>Class Teacher</td>
                                                                        <td style={{ width: '34%', borderTop: '1px solid black', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', paddingTop: '4px' }}>Principal</td>
                                                                        <td style={{ width: '33%', borderTop: '1px solid black', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', paddingTop: '4px' }}>Parent</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}

                                <div style={{ marginTop: '24px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', paddingRight: '16px', paddingBottom: '10px' }}>Congratulations : Promoted to Class :</td>
                                                <td style={{ borderBottom: '1px solid black', textAlign: 'center', fontWeight: 'bold', paddingBottom: '10px' }}>
                                                    {getpromotionremarksdetails?.[0]?.eprD_ClassPromoted || getpromotionremarksdetails?.[0]?.classPromoted || student?.eprD_ClassPromoted || student?.promotedClass || 'V'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap', paddingRight: '16px', paddingBottom: '10px' }}>New Session begins on :</td>
                                                <td style={{ borderBottom: '1px solid black', textAlign: 'center', paddingBottom: '10px' }}>{params.re_opendate ? format(new Date(params.re_opendate), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style={{ width: '100%', marginTop: '50px' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '33%', borderTop: '1px solid black', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', paddingTop: '4px' }}>Class Teacher</td>
                                                <td style={{ width: '34%', borderTop: '1px solid black', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', paddingTop: '4px' }}>Principal</td>
                                                <td style={{ width: '33%', borderTop: '1px solid black', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', paddingTop: '4px' }}>Parent</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Section 5: Grading System */}
                            <section className="pagelayout">
                                <h4 className="text-center font-bold mb-4 underline">GRADING SYSTEM</h4>
                                <div className="grid grid-cols-2 gap-10">
                                    <div>
                                        <h5 className="text-center font-bold mb-2">Scholastic Areas (9 point scale)</h5>
                                        <table className="table-bordered text-center text-[10px]">
                                            <thead>
                                                <tr>
                                                    <th rowSpan={2}>Grade</th>
                                                    <th colSpan={2}>Marks Range</th>
                                                    <th rowSpan={2}>GP</th>
                                                </tr>
                                                <tr><th>100</th><th>50</th></tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    ['A1', '91-100', '45-50', '10.0'],
                                                    ['A2', '81-90', '40-44', '9.0'],
                                                    ['B1', '71-80', '35-39', '8.0'],
                                                    ['B2', '61-70', '30-34', '7.0'],
                                                    ['C1', '51-60', '25-29', '6.0'],
                                                    ['C2', '41-50', '20-24', '5.0'],
                                                    ['D', '33-40', '17-19', '4.0'],
                                                    ['E1', '21-32', '10-16', '3.0'],
                                                    ['E2', '00-20', '0-9', '2.0'],
                                                ].map((row, rIdx) => (
                                                    <tr key={rIdx}>
                                                        {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <h5 className="text-center font-bold mb-2">Co - Scholastic Areas (5 point scale)</h5>
                                        <table className="table-bordered text-center text-[10px]">
                                            <thead><tr><th>Grade</th><th>Grade Point</th></tr></thead>
                                            <tbody>
                                                {[['A', '5'], ['B', '4'], ['C', '3'], ['D', '2'], ['E', '1']].map((row, rIdx) => (
                                                    <tr key={rIdx}><td><b>{row[0]}</b></td><td><b>{row[1]}</b></td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="mt-4 text-[10px] font-bold">
                                            Student must obtain the qualifying grade (minimum grade D) in all subjects.
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 border-t border-black pt-4">
                                    <h5 className="text-center font-bold underline mb-4">CONTINUOUS AND COMPREHENSIVE EVALUATION</h5>
                                    <div className="text-[10px] space-y-2 font-bold">
                                        <p>1. CCE is intended to provide a holistic profile of the learner through assessment of both scholastic and non scholastic aspects.</p>
                                        <p>2. Promotion is based on day-to-day work and terminal examination performance.</p>
                                        <div className="grid grid-cols-[150px_1fr_50px] gap-2 pt-4">
                                            <span>*First Term</span><span>- FA1(10%) + FA2(10%) + SA1(30%)</span><span className="text-right">= 50%</span>
                                            <span>*Second Term</span><span>- FA3(10%) + FA4(10%) + SA2(30%)</span><span className="text-right">= 50%</span>
                                            <span>Formative assessment</span><span>- FA1(10%) + FA2(10%) + FA3(10%) + FA4(10%)</span><span className="text-right">= 40%</span>
                                            <span>Summative assessment</span><span>- SA1(30%) + SA2(30%)</span><span className="text-right">= 60%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 border-t border-black pt-4">
                                    <h5 className="text-center font-bold underline mb-4 uppercase">For the Parents</h5>
                                    <div className="text-[10px] space-y-3 font-bold px-4">
                                        <p>1. The object of the Report Book is to facilitate holistic learning in a stress free environment.</p>
                                        <p>2. Keep informed of your child's progress. Sign the record every term.</p>
                                        <p>3. Report Book will not be issued if fees are in arrears.</p>
                                        <p>4. Preserve carefully. Loss fine Rs.50/-.</p>
                                        <p>5. We hope this system leads to greater co-operation between parents and teachers.</p>
                                    </div>
                                    <div className="flex justify-center mt-10">
                                        <img
                                            src="/assets/nda_logo.png"
                                            className="h-16 object-contain"
                                            alt="Exam Logo"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/assets/logo1.png';
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
