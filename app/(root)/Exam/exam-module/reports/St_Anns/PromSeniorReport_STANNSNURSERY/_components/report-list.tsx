'use client';

import { Button } from '@/components/ui/button';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // Main Data Sources – using correct camelCase property names
    const studentDetails = data.getstudentdetails || [];
    const groupDetails = data.getgroupdetails || [];
    const groupWiseExamList = data.groupwiseexamlist || [];
    const _institution = data.institutionList?.[0] || data.masterinstitution || data.institution || data.getinstitution;
    const gradeDetails = data.getallgrade || [];
    const skillDetails = data.getstudentwiseskillslist || data.getskill || [];
    const examWiseTotalDetails = data.getexamwisetotaldetails || [];
    const promotionRemarks = data.getpromotionremarksdetails || [];
    const studentGraphDetails = data.studentdetailsgraph || [];

    // Attendance Sources
    const presentAttendance = data.present_attendence || [];

    // Config Flags
    const showLogo = params.printLogo;
    const showSuperAverage = params.superAverage;
    const examName = params.exmname;

    // Helper to get attendance
    const getAttendance = (amsT_Id: number) => {
        const present = presentAttendance.find((a: any) => a.amsT_Id === amsT_Id);
        return present ? present.attendancePercentage || 0 : 0;
    };

    // Helper to get mark for a cell
    const getMarkValue = (report: any, subjectId: number, examId: number, groupDisplayName: string, examNameDisplay: string) => {
        const marksArray = report.studentmarks || report.marks || [];
        const mark = marksArray.find(
            (m: any) => m.ismS_Id === subjectId && m.emE_Id === examId && m.empsG_DisplayName === groupDisplayName
        );

        if (!mark) return null;

        if (['AB', 'M', 'L'].includes(mark.passFailFlag)) {
            return mark.passFailFlag;
        }

        const isAvgExam = examNameDisplay === 'AVG';

        if (mark.obtainedMarks >= 0 && !['AB', 'M', 'L'].includes(mark.passFailFlag)) {
            if (isAvgExam) {
                return <b>{mark.obtainedMarks}</b>;
            }
            return mark.obtainedMarks;
        }

        if (isAvgExam && mark.esG_Id > 0) {
            return <b>{mark.obtainedMarks}</b>;
        }

        if (mark.obtainedGrade && examNameDisplay === 'AVG') {
            return mark.obtainedGrade;
        }

        return null;
    };

    // Get total/avg marks for total row
    const getTotalMarkValue = (report: any, examId: number, groupDisplayName: string) => {
        const marksArray = report.studentmarks || report.marks || [];
        const mark = marksArray.find((m: any) => m.emE_Id === examId && m.empsG_DisplayName === groupDisplayName);
        return mark ? mark.obtainedMarks : null;
    };

    const getTotalPercentageValue = (report: any, examId: number, groupDisplayName: string) => {
        const marksArray = report.studentmarks || report.marks || [];
        const mark = marksArray.find((m: any) => m.emE_Id === examId && m.empsG_DisplayName === groupDisplayName);
        return mark ? mark.totalPercentage : null;
    };

    const getRankValue = (report: any, examId: number, groupDisplayName: string) => {
        const marksArray = report.studentmarks || report.marks || [];
        const mark = marksArray.find((m: any) => m.emE_Id === examId && m.empsG_DisplayName === groupDisplayName);
        return mark ? mark.estmppS_SectionRank : null;
    };

    // Personality Profile Questions
    const personalityQuestions = [
        'IS SELF-MOTIVATED AND COMPLETES TASK',
        'WORKS WELL WITH MINIMUM DIRECTION',
        'ORIGINATES IDEAS BUT NEEDS CONSTANT GUIDANCE',
        'CONTRIBUTES READILY',
        'SOMETIMES TAKES PART',
        'EASILY DISTRACTED',
        'VERY CAREFUL WORKER',
        'USUALLY NEAT',
        'ACCEPTS RESPONSIBILITY FOR LEARNING'
    ];

    return (
        <div className='printable-content space-y-6 font-serif'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} className='print-area'>
                {studentDetails.length > 0 ? (
                    studentDetails.map((report: any, index: number) => {
                        // Use all subjects from studentsubjects (no filtering based on missing flag)
                        const allSubjects = report.studentsubjects || [];

                        // Remarks for this student
                        const remarks = promotionRemarks.filter((r: any) => r.amsT_Id === report.amsT_Id);

                        // Graph data (if any)
                        const _graphData = studentGraphDetails.find((g: any) => g.amsT_Id === report.amsT_Id);

                        return (
                            <div
                                key={index}
                                className='page-break-before-always mb-8 border border-gray-300 bg-white p-4 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                                {/* Header with logo */}
                                {showLogo && (
                                    <div className='mb-4 flex flex-row items-center justify-center'>
                                        <div className='w-full text-center'>
                                            {_institution?.mI_Logo && (
                                                <img
                                                    src={_institution?.mI_Logo}
                                                    className='mx-auto h-[70px] w-[80%] object-contain'
                                                    alt='Header Logo'
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!showLogo && <div className='mt-[130px]'>&nbsp;</div>}

                                <div className='relative'>
                                    {/* Watermark */}
                                    {/* <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-20 print:opacity-20'>
                                        {_institution?.mI_BackgroundImage || _institution?.mI_Logo ? (
                                            <img
                                                src={_institution?.mI_BackgroundImage || _institution?.mI_Logo}
                                                className='h-[417px] w-[420px] object-contain'
                                                alt='Watermark'
                                            />
                                        ) : null}
                                    </div> */}

                                    <div className='relative z-10'>
                                        {/* Exam Title */}
                                        <table className='mb-2 w-full bg-transparent'>
                                            <tbody>
                                                <tr>
                                                    <th className='w-full border-none text-center text-lg uppercase'>
                                                        <span>
                                                            {examName} REPORT CARD {report.academicYear || ''}
                                                        </span>
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Student Details */}
                                        <table className='mb-2 w-full border-collapse border border-gray-400 bg-transparent text-sm'>
                                            <tbody>
                                                <tr>
                                                    <td className='w-1/4 border border-gray-400 border-t-0 border-r-0 border-b-0 p-2 align-top'>
                                                        <div className='mb-1 flex gap-2'>
                                                            <span className='font-bold'>NAME :</span>
                                                            <span className='font-bold'>{report.studentname}</span>
                                                        </div>
                                                        <div className='flex gap-2'>
                                                            <span className='font-bold'>CLASS :</span>
                                                            <span className='font-bold'>
                                                                {report.classname || params.classs}-
                                                                {report.sectionname || params.clasection}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='w-1/4 border-none p-2 text-center align-middle'>
                                                        <b>
                                                            NO. IN CLASS: <span>{studentDetails.length}</span>
                                                        </b>
                                                    </td>
                                                    <td className='w-1/4 border-none p-2 text-center align-middle'>
                                                        <b>
                                                            ATTENDANCE: <span>{getAttendance(report.amsT_Id).toFixed(0)}%</span>
                                                        </b>
                                                    </td>
                                                    <td className='w-1/4 border-none p-2 pr-4 text-right align-middle'>
                                                        <b>STUDENT&apos;S ID: {report.admno}</b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th
                                                        colSpan={4}
                                                        className='border border-gray-400 border-r-0 border-l-0 pt-2 text-center font-bold text-[13px] uppercase'>
                                                        STATEMENT OF MARKS
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Marks Table */}
                                        <table className='w-full border-collapse border border-gray-400 bg-transparent text-[12px]'>
                                            <thead>
                                                <tr className='border-[0.5px] border-gray-500'>
                                                    <th className='w-[250px] border-[0.5px] border-gray-500 p-1 text-[13px]'>SUBJECTS</th>
                                                    {groupDetails.map((grp: any, i: number) => (
                                                        <th
                                                            key={i}
                                                            colSpan={grp.groupewiseexam?.length || 0}
                                                            className='border-[0.5px] border-gray-500 p-1 text-[13px] uppercase'>
                                                            {grp.empG_DistplayName}
                                                        </th>
                                                    ))}
                                                    <th
                                                        colSpan={groupDetails.length + 1}
                                                        className='border-[0.5px] border-gray-500 p-1 text-[13px] uppercase'>
                                                        SUPER AVERAGE
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className='border-[0.5px] border-gray-500 p-1' />
                                                    {groupWiseExamList.map((exa: any, i: number) => (
                                                        <th
                                                            key={i}
                                                            className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center font-normal text-[13px]'>
                                                            {exa.displayName !== 'Total' && exa.displayName !== 'AVG' && (
                                                                <span>{exa.maxMarks}</span>
                                                            )}
                                                            {exa.displayName === 'Total' && <span>{exa.maxMarks}/50</span>}
                                                            {exa.displayName === 'AVG' && <span>{exa.displayName}</span>}
                                                        </th>
                                                    ))}
                                                    <th className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center text-[13px]'>
                                                        100/50
                                                    </th>
                                                    <th className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center text-[13px]'>
                                                        <b>AVG</b>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* All Subjects (no filtering) */}
                                                {allSubjects.map((subj: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className='border-[0.5px] border-gray-500 p-1 pl-2 text-left'>
                                                            {subj.groupAVGMarks > 0 ? (
                                                                <span className='font-semibold'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ismS_SubjectName}
                                                                </span>
                                                            ) : (
                                                                <span className='font-normal'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                    {subj.ismS_SubjectName}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {groupWiseExamList.map((exa: any, j: number) => {
                                                            // Find which group this exam belongs to – we need groupDisplayName
                                                            // For simplicity, we assume groupWiseExamList entries have groupName property
                                                            const groupDisplayName = exa.groupName;
                                                            const val = getMarkValue(
                                                                report,
                                                                subj.ismS_Id,
                                                                exa.examId,
                                                                groupDisplayName,
                                                                exa.displayName
                                                            );
                                                            return (
                                                                <td
                                                                    key={j}
                                                                    className='w-[50px] border-[0.5px] border-gray-500 p-1 text-center'>
                                                                    {val}
                                                                </td>
                                                            );
                                                        })}
                                                        {/* Super Average Columns */}
                                                        <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                            {subj.ismS_Id < 1000 && showSuperAverage && (
                                                                <span>{subj.estmppsG_GroupObtMarks}</span>
                                                            )}
                                                        </td>
                                                        <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                            {(subj.esG_Id === 0 || subj.ismS_Id > 1000) && showSuperAverage && (
                                                                <span className='font-semibold'>{subj.groupAVGMarks}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Total Row */}
                                                <tr>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-left font-semibold'>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOTAL
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const isTotalExam = exa.displayName === 'Total';
                                                        const isAvgExam = exa.displayName === 'AVG';
                                                        const groupDisplayName = exa.groupName;

                                                        let val = null;
                                                        if (isTotalExam || isAvgExam) {
                                                            const mVal = getTotalMarkValue(report, exa.examId, groupDisplayName);
                                                            if (mVal !== null)
                                                                val = <span className='font-bold'>{Number(mVal).toFixed(0)}</span>;
                                                        }

                                                        return (
                                                            <td key={i} className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    {/* Super Average Totals */}
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {
                                                                    examWiseTotalDetails.find((t: any) => t.amsT_Id === report.amsT_Id)
                                                                        ?.estmppsG_GroupObtMarks
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {
                                                                    examWiseTotalDetails.find((t: any) => t.amsT_Id === report.amsT_Id)
                                                                        ?.estmppsG_GroupAvgMarks
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Percentage Row */}
                                                <tr>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-left font-semibold'>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PERCENTAGE
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const isTotalExam = exa.displayName === 'Total';
                                                        const isAvgExam = exa.displayName === 'AVG';
                                                        const groupDisplayName = exa.groupName;

                                                        let val = null;
                                                        if (isTotalExam || isAvgExam) {
                                                            const pVal = getTotalPercentageValue(report, exa.examId, groupDisplayName);
                                                            if (pVal !== null)
                                                                val = <span className='font-bold'>{Number(pVal).toFixed(0)}</span>;
                                                        }

                                                        return (
                                                            <td key={i} className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {
                                                                    examWiseTotalDetails.find((t: any) => t.amsT_Id === report.amsT_Id)
                                                                        ?.totalPercentage
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                        {showSuperAverage && (
                                                            <span className='font-bold'>
                                                                {
                                                                    examWiseTotalDetails.find((t: any) => t.amsT_Id === report.amsT_Id)
                                                                        ?.totaver
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Rank Row */}
                                                <tr>
                                                    <td className='border-[0.5px] border-gray-500 p-1 text-left font-semibold'>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RANK
                                                    </td>
                                                    {groupWiseExamList.map((exa: any, i: number) => {
                                                        const isTotalExam = exa.displayName === 'Total';
                                                        const groupDisplayName = exa.groupName;

                                                        let val = null;
                                                        if (isTotalExam) {
                                                            const rVal = getRankValue(report, exa.examId, groupDisplayName);
                                                            if (rVal !== null) val = <span className='font-bold'>{rVal}</span>;
                                                        }

                                                        return (
                                                            <td key={i} className='border-[0.5px] border-gray-500 p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    <td colSpan={2} className='border-[0.5px] border-gray-500 p-1 text-center' />
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Bottom Section: Co-Scholastic & Personality */}
                                        <div className='flex border-[0.5px] border-gray-500 border-t-0'>
                                            {/* Left Column: Graded Subjects & Personality */}
                                            <div className='w-[60%] border-gray-500 border-r-[0.5px]'>
                                                {/* Graded Subjects */}
                                                <table className='w-full bg-transparent text-[13px]'>
                                                    <thead>
                                                        <tr>
                                                            <th className='w-[180px] border-[0.5px] border-gray-500 border-t-0 border-l-0 p-1 text-left'>
                                                                GRADED SUBJECTS
                                                            </th>
                                                            <th className='w-[70px] border-[0.5px] border-gray-500 border-t-0 p-1 text-center'>
                                                                HALF YEARLY
                                                            </th>
                                                            <th className='w-[70px] border-[0.5px] border-gray-500 border-t-0 border-r-0 p-1 text-center'>
                                                                FINAL
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {skillDetails.map((skill: any, i: number) => (
                                                            <tr key={i} className='border-gray-500 border-b-[0.5px] last:border-b-0'>
                                                                <td className='border-gray-500 border-r-[0.5px] p-1 pl-4 text-left font-normal text-[13px]'>
                                                                    &nbsp;&nbsp;&nbsp;{skill.ecactA_SkillArea || skill.skillName}
                                                                </td>
                                                                <td className='border-gray-500 border-r-[0.5px] p-1 text-center text-[11px]'>
                                                                    {gradeDetails
                                                                        .filter(
                                                                            (g: any) =>
                                                                                g.amsT_Id === report.amsT_Id &&
                                                                                g.ecacT_SkillName === skill.ecactA_SkillArea &&
                                                                                g.emE_ExamName === 'First Unit Test'
                                                                        )
                                                                        .map((g: any) => g.emgD_Name)
                                                                        .join(', ')}
                                                                </td>
                                                                <td className='p-1 text-center text-[11px]'>
                                                                    {gradeDetails
                                                                        .filter(
                                                                            (g: any) =>
                                                                                g.amsT_Id === report.amsT_Id &&
                                                                                g.ecacT_SkillName === skill.ecactA_SkillArea &&
                                                                                g.emE_ExamName === 'FINAL EXAMINATION'
                                                                        )
                                                                        .map((g: any) => g.emgD_Name)
                                                                        .join(', ')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                {/* Personality Profile */}
                                                <table className='mt-2 w-full bg-transparent text-[13px]'>
                                                    <thead>
                                                        <tr>
                                                            <th className='border-[0.5px] border-gray-500 border-l-0 p-1 text-left font-medium text-[10px]'>
                                                                &nbsp;&nbsp;&nbsp;PERSONALITY PROFILE
                                                            </th>
                                                            <th className='w-[70px] border-[0.5px] border-gray-500 p-1 text-center'>
                                                                HALF YEARLY
                                                            </th>
                                                            <th className='w-[70px] border-[0.5px] border-gray-500 border-r-0 p-1 text-center'>
                                                                FINAL
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {personalityQuestions.map((q, idx) => (
                                                            <tr key={idx} className='border-gray-500 border-b-[0.5px] last:border-b-0'>
                                                                <td className='border-gray-500 border-r-[0.5px] p-0.5 pl-2 text-left text-[11px]'>
                                                                    &middot; &nbsp;{q}
                                                                </td>
                                                                <td className='border-gray-500 border-r-[0.5px] p-0.5 text-center'>
                                                                    <input type='checkbox' className='h-3 w-3' />
                                                                </td>
                                                                <td className='p-0.5 text-center'>
                                                                    <input type='checkbox' className='h-3 w-3' />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Right Column: Chart */}
                                            <div className='w-[40%] p-2'>
                                                <table className='w-full'>
                                                    <thead>
                                                        <tr>
                                                            <th className='border-[0.5px] border-gray-500 border-t-0 border-r-0 border-l-0 pb-2 text-center text-[13px]'>
                                                                PERFORMANCE ANALYSIS(TOTAL)
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className='flex h-[252px] justify-center pt-4'>
                                                                <div className='relative h-[250px] w-[250px]'>
                                                                    {/* Bar Chart representing Performance Analysis */}
                                                                    <Bar
                                                                        key={index}
                                                                        data={{
                                                                            labels: allSubjects
                                                                                .filter((s: any) => s.ismS_Id < 1000)
                                                                                .map((s: any) => s.ismS_SubjectName),
                                                                            datasets: [
                                                                                {
                                                                                    label: 'Marks Obtained',
                                                                                    data: allSubjects
                                                                                        .filter((s: any) => s.ismS_Id < 1000)
                                                                                        .map((s: any) => s.estmppsG_GroupObtMarks),
                                                                                    backgroundColor: 'rgb(63,81,181)',
                                                                                    borderColor: 'black',
                                                                                    borderWidth: 1
                                                                                },
                                                                                {
                                                                                    label: 'Average Marks',
                                                                                    data: allSubjects
                                                                                        .filter((s: any) => s.ismS_Id < 1000)
                                                                                        .map((s: any) => s.groupAVGMarks),
                                                                                    backgroundColor: 'rgb(255,87,34)',
                                                                                    borderColor: 'black',
                                                                                    borderWidth: 0
                                                                                }
                                                                            ]
                                                                        }}
                                                                        options={{
                                                                            responsive: true,
                                                                            maintainAspectRatio: false,
                                                                            plugins: { legend: { position: 'top' } }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        <table className='w-full border-collapse border border-gray-400 border-t-0 bg-transparent text-[12px]'>
                                            <tbody>
                                                <tr>
                                                    <td className='h-[70px] w-[183px] border-r-0 p-2 align-top font-bold'>REMARKS :</td>
                                                    <td className='border-l-0 p-2 align-top'>
                                                        {remarks.map((r: any, idx: number) => (
                                                            <span key={idx} className='block'>
                                                                {r.remarks || r.eprD_Remarks}
                                                            </span>
                                                        ))}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Signatures */}
                                        <table className='w-full border-collapse border border-gray-400 border-t-0 bg-transparent text-[12px]'>
                                            <thead>
                                                <tr>
                                                    <th className='h-[90px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        DATE
                                                    </th>
                                                    <th className='h-[90px] w-1/4 border border-gray-400 border-t-0 p-2 text-center align-bottom'>
                                                        {_institution?.mI_Signature ? (
                                                            <img
                                                                src={_institution.mI_Signature}
                                                                alt='Rector Signature'
                                                                className='mx-auto mb-1 h-[50px] object-contain'
                                                            />
                                                        ) : (
                                                            <div className='mb-1 h-[50px]'></div>
                                                        )}
                                                        RECTOR SIGNATURE
                                                    </th>
                                                    <th className='h-[90px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        CLASS TEACHER
                                                    </th>
                                                    <th className='h-[90px] w-1/4 border border-gray-400 border-t-0 p-2 align-bottom'>
                                                        PARENT&apos;S SIGNATURE
                                                    </th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='p-10 text-center text-gray-500'>No student details found to display report.</div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-area {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break-before-always {
                        page-break-before: always !important;
                    }
                }
            `}</style>
        </div>
    );
};
