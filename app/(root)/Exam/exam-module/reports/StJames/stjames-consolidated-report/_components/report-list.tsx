'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Consolidated Final Report',
        pageStyle: `
            @page {
                size: A4 landscape;
                margin: 10mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    });

    const exportToExcel = () => {
        const table = document.getElementById('report-table');
        if (!table) return;

        const wb = XLSX.utils.table_to_book(table, { raw: true });
        XLSX.writeFile(wb, 'Consolidated_Final_Report.xlsx');
    };

    // Derived data mapping based on angular logic
    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getexamdetails = [],
        getgroupexamdetails = [],
        getstudentwiseattendancedetails = [],
        getexamwisetotaldetails = [],
        getstudentwisesubjectlistnew = [],
        getstudentwisesubjectlist = [],
        asmaY_Year = '',
        asmcL_ClassName = '',
        asmC_SectionName = ''
    } = data;

    const allSubjectList = getstudentwisesubjectlist.length > 0 ? getstudentwisesubjectlist : getstudentwisesubjectlistnew;

    // Extend exam details with 'Final Average' like Angular controller does
    const extendedExamDetails = [...getexamdetails, { empG_GroupName: 'Final Average', empsG_Order: 10001, empG_DistplayName: 'FI' }];

    // Build distinct subjects
    const subjectMap = new Map();
    allSubjectList.forEach((sub: any) => {
        const id = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);
        if (id && id !== 'undefined' && id !== 'null') subjectMap.set(id, sub);
    });

    // Add missing subjects from marks
    getstudentmarksdetails.forEach((mark: any) => {
        const id = String(mark.ismS_Id ?? mark.ISMS_Id);
        if (id && id !== 'undefined' && id !== 'null' && !subjectMap.has(id)) {
            subjectMap.set(id, {
                subid: id,
                ismS_Id: id,
                subjectname: mark.ismS_SubjectName ?? mark.ISMS_SubjectName,
                EYCES_AplResultFlg: mark.empS_AppToResultFlg ?? mark.EYCES_AplResultFlg,
                subjectorder: mark.empS_SubjOrder ?? mark.subjectgrporder,
                ismS_SubjectCode: mark.ismS_SubjectCode ?? mark.ISMS_SubjectCode
            });
        }
    });

    const distinctSubjects = Array.from(subjectMap.values()).sort((a: any, b: any) => {
        const orderA = a.subjectorder ?? a.empS_SubjOrder ?? 9999;
        const orderB = b.subjectorder ?? b.empS_SubjOrder ?? 9999;
        return orderA - orderB;
    });

    const subjectsWithResultFlag = distinctSubjects.filter((sub: any) => {
        const flag = sub.EYCES_AplResultFlg ?? sub.eyceS_AplResultFlg ?? sub.eyces_aplresultflg ?? sub.empS_AppToResultFlg;
        return flag === true || flag === 1 || String(flag).toLowerCase() === 'true' || String(flag).toLowerCase() === 'y';
    });

    const subjectsWithoutResultFlag = distinctSubjects.filter((sub: any) => {
        const flag = sub.EYCES_AplResultFlg ?? sub.eyceS_AplResultFlg ?? sub.eyces_aplresultflg ?? sub.empS_AppToResultFlg;
        return !(flag === true || flag === 1 || String(flag).toLowerCase() === 'true' || String(flag).toLowerCase() === 'y');
    });

    // Map student details
    const studentListWithDetails = getstudentdetails.map((stu: any) => {
        const studentId = stu.amsT_Id ?? stu.AMST_Id;
        const marks = getstudentmarksdetails.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(studentId));
        const markstotal = getexamwisetotaldetails.filter((t: any) => Number(t.amsT_Id ?? t.AMST_Id) === Number(studentId));
        const attendance = getstudentwiseattendancedetails.filter((a: any) => Number(a.amsT_Id ?? a.AMST_Id) === Number(studentId));

        const houseName = stu.spccmH_HouseName ?? stu.SPCCMH_HouseName;
        const shortHouseName = houseName
            ? houseName
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase())
                  .join('')
            : '';

        return {
            ...stu,
            rollno: stu.rollno ?? stu.rollNo,
            studentname: stu.studentname ?? stu.studentName,
            regno: stu.regno ?? stu.regNo,
            marks,
            markstotal,
            attendance,
            shortHouseName
        };
    });

    const cleanLabel = (text: string) => {
        return text ? text.replace(/[\r\n]+/g, ' ').trim() : '';
    };

    return (
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <style>
                {`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    text-align: center;
                    white-space: nowrap;
                }
                .report-table th, .report-table td {
                    border: 1px solid black;
                    padding: 4px;
                }
                `}
            </style>
            <div className='no-print mb-6 flex items-center justify-between'>
                <h2 className='font-semibold text-lg'>Consolidated Report</h2>
                <div className='flex gap-2'>
                    <Button variant='outline' onClick={() => handlePrint()} className='gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                    <Button variant='outline' onClick={exportToExcel} className='gap-2'>
                        <Download className='h-4 w-4' /> Excel
                    </Button>
                </div>
            </div>

            <div className='overflow-x-auto overflow-y-auto' style={{ maxHeight: '80vh' }}>
                <div ref={printRef} className='min-w-[1200px] bg-white p-4'>
                    <div className='mb-4 text-center'>
                        <h5 className='font-bold text-xl uppercase'>CONSOLIDATED FINAL REPORT</h5>
                    </div>

                    <div className='mb-4 flex justify-between font-bold text-sm uppercase'>
                        <div>
                            CLASS & SEC : {asmcL_ClassName}-{asmC_SectionName}
                        </div>
                        <div>ACADEMIC YEAR : {asmaY_Year}</div>
                    </div>

                    <table id='report-table' className='report-table w-full border-collapse border border-black text-sm'>
                        <thead>
                            <tr>
                                <th className='vertical-text h-[120px] w-12'>Roll No</th>
                                <th className='w-48'>NAME</th>
                                <th className='vertical-text'>Reg.No.</th>
                                <th className='vertical-text'>House</th>
                                <th className='vertical-text'>Term</th>
                                {subjectsWithResultFlag.map((sub: any, idx: number) => (
                                    <th key={`h-true-${idx}`} className='vertical-text'>
                                        {cleanLabel(sub.subjectname || sub.ismS_SubjectName || sub.ISMS_SubjectName)}
                                    </th>
                                ))}
                                {subjectsWithoutResultFlag.map((sub: any, idx: number) => (
                                    <th key={`h-false-${idx}`} className='vertical-text'>
                                        {cleanLabel(sub.subjectname || sub.ISMS_SubjectName || sub.ismS_SubjectName)}
                                    </th>
                                ))}
                                <th className='vertical-text'>Total</th>
                                <th className='vertical-text'>Grand Total</th>
                                <th className='vertical-text'>Percentage</th>
                                <th className='vertical-text'>Rank</th>
                                <th className='vertical-text'>Attendance</th>
                                <th className='min-w-[150px]'>Remarks</th>
                            </tr>
                        </thead>

                        <tbody>
                            {studentListWithDetails.map((stu: any, sIdx: number) => (
                                <React.Fragment key={sIdx}>
                                    {extendedExamDetails.map((grp: any, gIdx: number) => (
                                        <tr key={gIdx}>
                                            {gIdx === 0 && (
                                                <>
                                                    <td rowSpan={extendedExamDetails.length} className='text-center font-bold'>
                                                        {stu.rollno}
                                                    </td>
                                                    <td rowSpan={extendedExamDetails.length} className='px-2 text-left font-bold'>
                                                        {stu.studentname}
                                                    </td>
                                                    <td
                                                        rowSpan={extendedExamDetails.length}
                                                        className='vertical-text text-center font-bold'>
                                                        {stu.regno}
                                                    </td>
                                                    <td rowSpan={extendedExamDetails.length} className='text-center font-bold'>
                                                        {stu.shortHouseName}
                                                    </td>
                                                </>
                                            )}
                                            <td className='text-center font-bold'>{grp.empG_DistplayName}</td>

                                            {/* Subjects With Result Flag */}
                                            {subjectsWithResultFlag.map((sub: any, idx: number) => {
                                                const mId = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);
                                                const subName = (sub.subjectname || sub.ismS_SubjectName || sub.ISMS_SubjectName)
                                                    ?.toLowerCase()
                                                    .trim();
                                                const gName = grp.empG_GroupName?.toLowerCase().trim();

                                                const getMarkGroupName = (m: any) => {
                                                    const name =
                                                        m.empsG_GroupName ||
                                                        m.EMPSG_GroupName ||
                                                        m.empG_GroupName ||
                                                        m.EMPG_GroupName ||
                                                        m.groupname ||
                                                        m.GROUPNAME ||
                                                        m.mGroup ||
                                                        m.MGroup ||
                                                        m.emE_ExamName ||
                                                        m.EME_ExamName;
                                                    return name?.toLowerCase().trim();
                                                };

                                                const subjectMarks =
                                                    stu.marks?.filter((m: any) => {
                                                        const mSubId = String(m.ismS_Id ?? m.ISMS_Id);
                                                        const mSubName = (m.ismS_SubjectName ?? m.ISMS_SubjectName)?.toLowerCase().trim();
                                                        return mSubId === mId && mSubName === subName;
                                                    }) || [];

                                                let mark = subjectMarks.find((m: any) => getMarkGroupName(m) === gName);
                                                if (
                                                    !mark &&
                                                    subjectMarks.length > 0 &&
                                                    !subjectMarks.some((m: any) => getMarkGroupName(m))
                                                ) {
                                                    mark = subjectMarks[gIdx];
                                                }

                                                const obtMarks = mark?.estmppsG_GroupObtMarks ?? mark?.ESTMPPSG_GroupObtMarks;
                                                return (
                                                    <td key={`m-true-${idx}`} className='text-center font-bold'>
                                                        {mark ? (obtMarks !== 0 ? (obtMarks ?? '') : 'AB') : ''}
                                                    </td>
                                                );
                                            })}

                                            {/* Subjects Without Result Flag */}
                                            {subjectsWithoutResultFlag.map((sub: any, idx: number) => {
                                                const mId = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);
                                                const subName = (sub.subjectname || sub.ismS_SubjectName || sub.ISMS_SubjectName)
                                                    ?.toLowerCase()
                                                    .trim();
                                                const gName = grp.empG_GroupName?.toLowerCase().trim();

                                                const getMarkGroupName = (m: any) => {
                                                    const name =
                                                        m.empsG_GroupName ||
                                                        m.EMPSG_GroupName ||
                                                        m.empG_GroupName ||
                                                        m.EMPG_GroupName ||
                                                        m.groupname ||
                                                        m.GROUPNAME ||
                                                        m.mGroup ||
                                                        m.MGroup ||
                                                        m.emE_ExamName ||
                                                        m.EME_ExamName;
                                                    return name?.toLowerCase().trim();
                                                };

                                                const subjectMarks =
                                                    stu.marks?.filter((m: any) => {
                                                        const mSubId = String(m.ismS_Id ?? m.ISMS_Id);
                                                        const mSubName = (m.ismS_SubjectName ?? m.ISMS_SubjectName)?.toLowerCase().trim();
                                                        return mSubId === mId && mSubName === subName;
                                                    }) || [];

                                                let mark = subjectMarks.find((m: any) => getMarkGroupName(m) === gName);
                                                if (
                                                    !mark &&
                                                    subjectMarks.length > 0 &&
                                                    !subjectMarks.some((m: any) => getMarkGroupName(m))
                                                ) {
                                                    mark = subjectMarks[gIdx];
                                                }

                                                let displayValue: any = '';
                                                if (mark) {
                                                    const obtGrade = mark.estmppsG_GroupObtGrade ?? mark.ESTMPPSG_GroupObtGrade;
                                                    const obtMarks = mark.estmppsG_GroupObtMarks ?? mark.ESTMPPSG_GroupObtMarks;
                                                    const gradeDisplay = mark.gradedisplay ?? mark.Gradedisplay;
                                                    const marksDisplay = mark.marksdispaly ?? mark.Marksdispaly;
                                                    const subCode = sub.ismS_SubjectCode ?? sub.ISMS_SubjectCode;

                                                    if (subCode !== 'CCA') {
                                                        if (gradeDisplay === 1) displayValue = obtGrade;
                                                        else if (marksDisplay === 1) displayValue = obtMarks;
                                                        else displayValue = obtGrade || obtMarks; // Fallback
                                                    } else {
                                                        displayValue = obtMarks;
                                                    }
                                                }
                                                return (
                                                    <td key={`m-false-${idx}`} className='text-center font-bold'>
                                                        {displayValue}
                                                    </td>
                                                );
                                            })}

                                            {/* Totals */}
                                            <td className='text-center font-bold'>
                                                {stu.markstotal?.find(
                                                    (mt: any) =>
                                                        (mt.GROUPNAME || mt.groupname)?.toLowerCase() === grp.empG_GroupName?.toLowerCase()
                                                )?.TOTALOBTAINEDMARKS ?? ''}
                                            </td>
                                            <td className='text-center font-bold'>
                                                {stu.markstotal?.find(
                                                    (mt: any) =>
                                                        (mt.GROUPNAME || mt.groupname)?.toLowerCase() === grp.empG_GroupName?.toLowerCase()
                                                )?.GRANDTOTALOBRAINEDMARKS ?? ''}
                                            </td>
                                            <td className='text-center font-bold'>
                                                {stu.markstotal?.find(
                                                    (mt: any) =>
                                                        (mt.GROUPNAME || mt.groupname)?.toLowerCase() === grp.empG_GroupName?.toLowerCase()
                                                )?.PERCENTAGEOBTAINED ?? ''}
                                            </td>
                                            <td className='text-center font-bold'>
                                                {stu.markstotal?.find(
                                                    (mt: any) =>
                                                        (mt.GROUPNAME || mt.groupname)?.toLowerCase() === grp.empG_GroupName?.toLowerCase()
                                                )?.POSITION ?? ''}
                                            </td>
                                            <td className='text-center font-bold'>
                                                {stu.attendance?.find(
                                                    (at: any) =>
                                                        (at.GROUPNAME || at.groupname)?.toLowerCase() === grp.empG_GroupName?.toLowerCase()
                                                )?.PERCENTAGEOBTAINED ?? ''}
                                            </td>
                                            <td className='text-center font-bold'>&nbsp;</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
