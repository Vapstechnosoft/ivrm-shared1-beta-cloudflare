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
        documentTitle: '9_Progress_Card_Report'
    });

    if (!data || !data.getstudentdetails) return null;

    const {
        getstudentdetails,
        gettermdetails,
        getgroupdetails,
        getgroupexamdetails,
        getstudentmarksdetails,
        getstudentwisesubjectlist,
        getstudentwiseskillslist,
        getstudentwiseactiviteslist,
        getpromotionremarksdetails,
        getinstitution,
        clstchname
    } = data;

    const institution = getinstitution?.[0] || {};
    const classTeacher = clstchname?.[0]?.hrmE_EmployeeFirstName || '';

    // Process Group Exam Details
    const groupWiseExamList: any[] = [];
    const processedGroups = (getgroupdetails || []).map((group: any) => {
        const exams = (getgroupexamdetails || []).filter((e: any) => e.empG_DistplayName === group.empG_DistplayName);
        let totalMaxMarks = 0;

        const groupExams = exams.map((exam: any) => {
            totalMaxMarks += exam.empsgE_ForMaxMarkrs;
            const examObj = {
                EME_Id: exam.emE_Id,
                examnamedisplay: exam.emE_ExamName,
                EMPG_DistplayName: exam.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: exam.empsgE_ForMaxMarkrs
            };

            if (!groupWiseExamList.some((ge) => ge.EMPG_DistplayName === examObj.EMPG_DistplayName && ge.EME_Id === examObj.EME_Id)) {
                groupWiseExamList.push(examObj);
            }

            return examObj;
        });

        const totalObj = {
            EME_Id: 9800000,
            examnamedisplay: 'Total',
            EMPG_DistplayName: group.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: totalMaxMarks
        };
        groupExams.push(totalObj);

        if (!groupWiseExamList.some((ge) => ge.EMPG_DistplayName === totalObj.EMPG_DistplayName && ge.EME_Id === totalObj.EME_Id)) {
            groupWiseExamList.push(totalObj);
        }

        return { ...group, groupExams, totalMaxMarks };
    });

    return (
        <div className='mx-auto flex w-[1400px] flex-col'>
            <div className='-mt-12 no-print relative z-50 mb-4 flex justify-end pr-0'>
                <Button
                    onClick={() => handlePrint()}
                    className='h-8 w-24 rounded bg-blue-600 text-white text-xs shadow-sm hover:bg-blue-700'>
                    <Printer className='mr-1 h-3 w-3' /> Print
                </Button>
            </div>

            <div ref={componentRef} className='print-area rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { 
                            size: A4; 
                            margin: 0; 
                        }
                        body {
                            visibility: hidden !important;
                            background: white !important;
                        }
                        .print-area, .print-area * {
                            visibility: visible !important;
                        }
                        .print-area {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .pagelayout { 
                            margin: 0 auto !important;
                            box-shadow: none !important;
                            border: 2px solid black !important; 
                            padding: 15mm !important; 
                            width: 210mm !important;
                            min-height: 297mm !important;
                            page-break-after: always !important; 
                            display: flex !important;
                            flex-direction: column !important;
                            background: white !important;
                            color: black !important;
                        }
                        .no-print { display: none !important; }
                        table { border-collapse: collapse !important; }
                        th, td { border: 1px solid black !important; color: black !important; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                    .pagelayout { 
                        border: 2px solid black; 
                        padding: 20px; 
                        margin-bottom: 40px; 
                        background: white; 
                        width: 100%;
                        min-height: 1000px;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid black; padding: 8px; text-align: center; }
                    .text-left { text-align: left !important; }
                    .border-bottom { border-bottom: 1px solid black; display: inline-block; min-width: 150px; padding-left: 5px; }
                    .header-logo { width: 100%; max-height: 120px; object-fit: contain; }
                `
                    }}
                />

                {(getstudentdetails || []).map((student: any, idx: number) => {
                    const studentId = student.amsT_Id || student.AMST_Id || idx;
                    const studentSubjects = (getstudentwisesubjectlist || []).filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
                    const studentMarks = (getstudentmarksdetails || []).filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentId);
                    const studentSkills = (getstudentwiseskillslist || []).filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
                    const studentActivities = (getstudentwiseactiviteslist || []).filter(
                        (a: any) => (a.amsT_Id || a.AMST_Id) === studentId
                    );
                    const studentRemarks = (getpromotionremarksdetails || []).find((r: any) => (r.amsT_Id || r.AMST_Id) === studentId);

                    const uniqueSkills = Array.from(new Set(studentSkills.map((s: any) => s.ECS_SkillName || s.ecS_SkillName)));
                    const uniqueActivities = Array.from(new Set(studentActivities.map((a: any) => a.ECACTA_SkillArea || a.ecsA_SkillArea)));

                    return (
                        <div key={`student-page-${studentId}`} className='pagelayout'>
                            {/* Header */}
                            <div className='mb-6 flex justify-center'>
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
                                    className='header-logo max-h-24 object-contain'
                                    alt={institution?.mI_Name || 'School Logo'}
                                />
                            </div>

                            {/* Student Info */}
                            <div className='mb-6 grid grid-cols-2 gap-4 text-sm'>
                                <div className='flex gap-2'>
                                    <span className='font-bold'>Roll No. : </span>
                                    <span className='flex-1 border-bottom font-bold'>
                                        {student.rollno || student.amaY_RollNo || student.AMAY_RollNo || ''}
                                    </span>
                                </div>
                                <div className='flex gap-2'>
                                    <span className='font-bold'>Date Of Birth : </span>
                                    <span className='flex-1 border-bottom font-bold'>{student.dob || student.amsT_DOB}</span>
                                </div>
                                <div className='col-span-2 flex gap-2'>
                                    <span className='font-bold'>Student's Name : </span>
                                    <span className='flex-1 border-bottom font-bold uppercase'>
                                        {student.studentName || student.studentname || student.amsT_FirstName}
                                    </span>
                                </div>
                                <div className='col-span-2 flex gap-2'>
                                    <span className='font-bold'>Father's/Mother's/Guardian's Name : </span>
                                    <span className='flex-1 border-bottom font-bold uppercase'>
                                        {student.fathername || student.amsT_FatherName || student.AMST_FatherName || ''}
                                    </span>
                                </div>
                            </div>

                            {/* Scholastic Areas Table */}
                            <div className='mb-6 overflow-x-auto'>
                                <table>
                                    <thead>
                                        <tr className='bg-gray-100'>
                                            <th className='p-2 text-left'>
                                                <b>Scholastic Areas(A)</b>
                                            </th>
                                            {processedGroups.map((grp: any, gidx: number) => (
                                                <th key={`group-header-${gidx}`} colSpan={grp.groupExams.length} className='p-2'>
                                                    <b>{grp.empG_DistplayName}</b>
                                                </th>
                                            ))}
                                        </tr>
                                        <tr className='bg-gray-50'>
                                            <th className='p-2 text-center'>
                                                <b>Subject Name</b>
                                            </th>
                                            {groupWiseExamList.map((grpexam: any, geidx: number) => (
                                                <th key={`exam-header-${geidx}`} className='p-2 text-center' style={{ width: '80px' }}>
                                                    {grpexam.examnamedisplay === 'Periodic Test 1'
                                                        ? 'Best of PT 1 and 2'
                                                        : grpexam.examnamedisplay}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSubjects.map((subj: any, sidx: number) => {
                                            const subjectName = subj.subjectName || subj.ISMS_SubjectName || subj.ismS_SubjectName;
                                            return (
                                                <tr key={`subject-row-${sidx}`}>
                                                    <td className='p-2 text-left font-bold uppercase'>{subjectName}</td>
                                                    {groupWiseExamList.map((grpexam: any, geidx: number) => {
                                                        const mark = studentMarks.find(
                                                            (m: any) =>
                                                                (m.ismS_SubjectName || m.ISMS_SubjectName) === subjectName &&
                                                                (m.emE_Id || m.EME_Id) === grpexam.EME_Id &&
                                                                (m.empsG_DisplayName || m.EMPSG_DisplayName) === grpexam.EMPG_DistplayName
                                                        );

                                                        const obtainedMarks = mark ? (mark.obtainedMarks ?? mark.ObtainedMarks) : '';
                                                        const passFailFlag = mark ? mark.passFailFlag || mark.PassFailFlag : '';

                                                        return (
                                                            <td key={`mark-${geidx}`} className='p-2'>
                                                                {mark ? (
                                                                    ['AB', 'M', 'L'].includes(passFailFlag) ? (
                                                                        <span>
                                                                            {passFailFlag} {obtainedMarks > 0 ? `(${obtainedMarks})` : ''}
                                                                        </span>
                                                                    ) : (
                                                                        <b>{obtainedMarks}</b>
                                                                    )
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Co-Scholastic & Discipline Sections */}
                            <div className='mb-6 grid grid-cols-2 gap-4'>
                                <div>
                                    <table>
                                        <thead>
                                            <tr className='bg-gray-100'>
                                                <th colSpan={gettermdetails.length + 1} className='p-1 text-xs'>
                                                    Co-Scholastic Areas (A-C scale)
                                                </th>
                                            </tr>
                                            <tr className='bg-gray-50'>
                                                <th></th>
                                                {gettermdetails.map((term: any) => (
                                                    <th key={`term-${term.ecT_Id}`} className='p-1 text-xs'>
                                                        {term.ecT_TermName}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueSkills.map((skillName: any, sidx: number) => (
                                                <tr key={`skill-${sidx}`}>
                                                    <td className='p-1 text-left font-bold text-xs uppercase'>{skillName}</td>
                                                    {gettermdetails.map((term: any) => {
                                                        const skill = studentSkills.find(
                                                            (s: any) =>
                                                                (s.ECS_SkillName || s.ecS_SkillName) === skillName &&
                                                                (s.ECT_Id || s.ecT_Id) === term.ecT_Id
                                                        );
                                                        return (
                                                            <td key={`term-val-${term.ecT_Id}`} className='p-1 text-xs'>
                                                                <b>{skill?.EMGD_Name || skill?.emgD_Name || ''}</b>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <table>
                                        <thead>
                                            <tr className='bg-gray-100'>
                                                <th colSpan={gettermdetails.length + 1} className='p-1 text-xs'>
                                                    Discipline (A-C scale)
                                                </th>
                                            </tr>
                                            <tr className='bg-gray-50'>
                                                <th></th>
                                                {gettermdetails.map((term: any) => (
                                                    <th key={`term-d-${term.ecT_Id}`} className='p-1 text-xs'>
                                                        {term.ecT_TermName}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueActivities.map((activityName: any, aidx: number) => (
                                                <tr key={`activity-${aidx}`}>
                                                    <td className='p-1 text-left font-bold text-xs uppercase'>{activityName}</td>
                                                    {gettermdetails.map((term: any) => {
                                                        const activity = studentActivities.find(
                                                            (a: any) =>
                                                                (a.ECACTA_SkillArea || a.ecsA_SkillArea) === activityName &&
                                                                (a.ECT_Id || a.ecT_Id) === term.ecT_Id
                                                        );
                                                        return (
                                                            <td key={`term-val-d-${term.ecT_Id}`} className='p-1 text-xs'>
                                                                <b>{activity?.EMGD_Name || activity?.emgD_Name || ''}</b>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Remarks & Signatures */}
                            <div className='mt-auto'>
                                <div className='mb-8 space-y-2 text-sm'>
                                    <div>
                                        <span className='font-bold'>Class Teacher's Remarks : </span>
                                        <span className='flex-1 border-bottom font-bold italic'>
                                            {studentRemarks?.eprD_Remarks || studentRemarks?.EPRD_Remarks || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='font-bold'>Promoted To Class : </span>
                                        <span className='flex-1 border-bottom font-bold'>
                                            {studentRemarks?.eprD_ClassPromoted || studentRemarks?.EPRD_ClassPromoted || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className='grid grid-cols-4 items-end gap-4 pt-10 text-center'>
                                    <div className='space-y-1 text-left font-bold text-xs'>
                                        <div>Place : {institution.ivrmmcT_Name || 'Howrah'}</div>
                                        <div>
                                            Date :{' '}
                                            {params.generatedDate
                                                ? format(params.generatedDate, 'dd/MM/yyyy')
                                                : format(new Date(), 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                    <div className='space-y-8'>
                                        <div className='border-black border-b pb-1 font-bold text-xs uppercase'>{classTeacher}</div>
                                        <div className='font-black text-[10px] uppercase'>Signature of Class Teacher</div>
                                    </div>
                                    <div className='space-y-8'>
                                        <div className='h-4'></div>
                                        <div className='border-black border-t pt-1 font-black text-[10px] uppercase'>
                                            Signature of Principal
                                        </div>
                                    </div>
                                    <div className='space-y-8'>
                                        <div className='h-4'></div>
                                        <div className='border-black border-t pt-1 font-black text-[10px] uppercase'>
                                            Signature of Parents
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-6 border-t pt-2'>
                                    <div className='font-bold text-[10px] underline'>Note :</div>
                                    <div className='grid grid-cols-2 gap-x-4 text-[9px] text-gray-600'>
                                        <div>1.PT1, PT2: Periodic Test</div>
                                        <div>2.NB1, NB2: Note Book</div>
                                        <div>3.SE1, SE2: Subject Enrichment</div>
                                        <div>4.HYE: HALF YEARLY EXAM</div>
                                        <div>5.YE: YEARLY EXAMINATION</div>
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
