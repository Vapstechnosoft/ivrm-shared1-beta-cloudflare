'use client';

import { Printer } from 'lucide-react';

interface StJamesConsolidatedPointsReportListProps {
    data: any;
    institution: any;
}

export default function StJamesConsolidatedPointsReportList({ data, institution }: StJamesConsolidatedPointsReportListProps) {
    const cleanLabel = (text: string) => {
        return text ? text.replace(/[\r\n]+/g, ' ').trim() : '';
    };

    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    const {
        getstudentdetails = [],
        tempsubjectdetails = [],
        getexamdetails = [],
        year = '',
        cla = '',
        sec = '',
        StjamesPoints = true
    } = data;

    return (
        <div className='mt-8 space-y-8 overflow-x-auto'>
            <div className='no-print flex justify-end gap-2 px-4'>
                <button
                    onClick={handlePrint}
                    className='flex items-center gap-2 rounded-md bg-sky-800 px-4 py-2 text-white shadow-md transition-all hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; background: white; }
                    .Baldwin { padding: 10px; width: 100%; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black !important; font-size: 10px !important; padding: 2px !important; }
                }
                .Baldwin {
                    font-family: 'Times New Roman', serif;
                    color: black;
                }
                .table-bordered {
                    width: 100%;
                    border-collapse: collapse;
                }
                .table-bordered th, .table-bordered td {
                    border: 1px solid black;
                    padding: 4px;
                    text-align: center;
                    font-size: 11px;
                }
                .vertical-header {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    white-space: nowrap;
                    height: 120px;
                    min-width: 30px;
                    padding: 5px !important;
                }
                .name-column {
                    width: 150px;
                    text-align: left !important;
                    padding-left: 8px !important;
                }
                .roll-column {
                    width: 40px;
                }
            `}</style>

            <div id='Baldwin' className='Baldwin bg-white p-4'>
                <h5 className='mb-4 text-center font-bold text-lg'>CONSOLIDATED FINAL REPORT</h5>

                <div className='mb-4 flex justify-between font-bold text-sm uppercase'>
                    <div>
                        CLASS & SEC : {cla}-{sec}
                    </div>
                    <div>ACADEMIC YEAR : {year}</div>
                </div>

                <table className='table-bordered'>
                    <thead>
                        <tr>
                            <th className='vertical-header roll-column'>Roll No</th>
                            <th className='name-column'>NAME</th>
                            <th className='vertical-header'>Reg. No</th>
                            <th className='vertical-header'>House</th>
                            <th className='vertical-header'>Term</th>
                            {tempsubjectdetails.map((sub: any, idx: number) => (
                                <th key={idx} className='vertical-header'>
                                    {cleanLabel(sub.subjectname || sub.ismS_SubjectName || sub.ISMS_SubjectName)}
                                </th>
                            ))}
                            <th className='vertical-header'>Total</th>
                            <th className='vertical-header'>Grand Total</th>
                            <th className='vertical-header'>Percentage</th>
                            {StjamesPoints && <th className='vertical-header'>Total Points</th>}
                            <th className='vertical-header'>Rank</th>
                            <th className='vertical-header'>Attendance</th>
                        </tr>
                    </thead>
                    {getstudentdetails.map((mn: any, sIdx: number) => (
                        <tbody key={sIdx}>
                            {getexamdetails.map((grp: any, gIdx: number) => (
                                <tr key={gIdx}>
                                    {gIdx === 0 && (
                                        <>
                                            <td rowSpan={getexamdetails.length} className='text-center font-bold'>
                                                {mn.rollno}
                                            </td>
                                            <td rowSpan={getexamdetails.length} className='name-column font-bold'>
                                                {mn.studentname}
                                            </td>
                                            <td rowSpan={getexamdetails.length} className='vertical-header text-center font-bold'>
                                                {mn.regno}
                                            </td>
                                            <td rowSpan={getexamdetails.length} className='text-center font-bold'>
                                                {mn.spccmH_HouseName || mn.shortHouseName}
                                            </td>
                                        </>
                                    )}
                                    <td className='text-center font-bold'>{grp.empG_DistplayName}</td>

                                    {/* Subject Marks */}
                                    {tempsubjectdetails.map((sub: any, subIdx: number) => {
                                        const subId = String(sub.subid ?? sub.ismS_Id ?? sub.ISMS_Id);
                                        const subName = (sub.subjectname || sub.ismS_SubjectName || sub.ISMS_SubjectName)
                                            ?.toLowerCase()
                                            .trim();
                                        const grpName = grp.empG_GroupName?.toLowerCase().trim();

                                        // Helper to get group name from mark object
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

                                        // Filter marks for this subject
                                        const subjectMarks =
                                            mn.marks?.filter((m: any) => {
                                                const mSubId = String(m.ismS_Id ?? m.ISMS_Id);
                                                const mSubName = (m.ismS_SubjectName ?? m.ISMS_SubjectName)?.toLowerCase().trim();
                                                return mSubId === subId && mSubName === subName;
                                            }) || [];

                                        // Find mark for this group
                                        let markEntry = subjectMarks.find((m: any) => getMarkGroupName(m) === grpName);

                                        // FALLBACK: If no group name in marks and only one mark exists, or matching by index
                                        if (!markEntry && subjectMarks.length > 0) {
                                            const hasGroupInfo = subjectMarks.some((m: any) => getMarkGroupName(m));
                                            if (!hasGroupInfo) {
                                                // If NO mark has group info, match by index (gIdx)
                                                markEntry = subjectMarks[gIdx];
                                            }
                                        }

                                        let displayValue: any = '';
                                        if (markEntry) {
                                            const isPointsCol = sub.isPointsColumn || sub.subjectname === 'Points';
                                            if (isPointsCol) {
                                                displayValue = markEntry.estmppsG_GradePoints ?? markEntry.ESTMPPSG_GradePoints ?? '';
                                            } else {
                                                const obtMarks = markEntry.estmppsG_GroupObtMarks ?? markEntry.ESTMPPSG_GroupObtMarks;
                                                const obtGrade = markEntry.estmppsG_GroupObtGrade ?? markEntry.ESTMPPSG_GroupObtGrade;

                                                if (sub.EYCES_AplResultFlg) {
                                                    displayValue =
                                                        obtMarks !== null && obtMarks !== undefined && String(obtMarks) !== '0'
                                                            ? obtMarks
                                                            : 'AB';
                                                } else {
                                                    displayValue = sub.ISMS_SubjectCode === 'CCA' ? (obtMarks ?? '') : (obtGrade ?? '');
                                                }
                                            }
                                        }

                                        return (
                                            <td key={subIdx} className='font-bold'>
                                                {displayValue}
                                            </td>
                                        );
                                    })}

                                    {/* Group Totals */}
                                    <td className='font-bold'>
                                        {mn.markstotal?.find(
                                            (mt: any) =>
                                                (mt.GROUPNAME || mt.groupname)?.toLowerCase().trim() ===
                                                grp.empG_GroupName?.toLowerCase().trim()
                                        )?.TOTALOBTAINEDMARKS ?? ''}
                                    </td>
                                    <td className='font-bold'>
                                        {mn.markstotal?.find(
                                            (mt: any) =>
                                                (mt.GROUPNAME || mt.groupname)?.toLowerCase().trim() ===
                                                grp.empG_GroupName?.toLowerCase().trim()
                                        )?.GRANDTOTALOBRAINEDMARKS ?? ''}
                                    </td>
                                    <td className='font-bold'>
                                        {mn.markstotal?.find(
                                            (mt: any) =>
                                                (mt.GROUPNAME || mt.groupname)?.toLowerCase().trim() ===
                                                grp.empG_GroupName?.toLowerCase().trim()
                                        )?.PERCENTAGEOBTAINED ?? ''}
                                    </td>
                                    {StjamesPoints && (
                                        <td className='font-bold'>
                                            {mn.markstotal?.find(
                                                (mt: any) =>
                                                    (mt.GROUPNAME || mt.groupname)?.toLowerCase().trim() ===
                                                    grp.empG_GroupName?.toLowerCase().trim()
                                            )?.ESTMP_POINTS ??
                                                mn.markstotal?.find(
                                                    (mt: any) =>
                                                        (mt.GROUPNAME || mt.groupname)?.toLowerCase().trim() ===
                                                        grp.empG_GroupName?.toLowerCase().trim()
                                                )?.GRANDTOTALPOINT ??
                                                ''}
                                        </td>
                                    )}
                                    <td className='font-bold'>
                                        {mn.markstotal?.find(
                                            (mt: any) =>
                                                (mt.GROUPNAME || mt.groupname)?.toLowerCase().trim() ===
                                                grp.empG_GroupName?.toLowerCase().trim()
                                        )?.POSITION ?? ''}
                                    </td>
                                    <td className='font-bold'>
                                        {mn.attendance?.find(
                                            (att: any) =>
                                                (att.GROUPNAME || att.groupname)?.toLowerCase().trim() ===
                                                grp.empG_GroupName?.toLowerCase().trim()
                                        )?.PERCENTAGEOBTAINED ?? ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ))}
                </table>
            </div>
        </div>
    );
}
