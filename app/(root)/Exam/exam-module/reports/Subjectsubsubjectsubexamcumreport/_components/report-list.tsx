'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';
import { getMockSubjectSubCumulativeData } from './mock-data';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const tableRef = useRef<HTMLTableElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleExportToExcel = () => {
        if (!tableRef.current) return;
        const tableHtml = tableRef.current.outerHTML;
        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Cumulative_Report.xls';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Fallback to mock data if no real data is provided
    let activeData = data && data.studlist && data.studlist.length > 0 ? data : getMockSubjectSubCumulativeData();

    // If using mock data (Demo Mode), update the student names to match the user's selection
    if ((!data || !data.studlist || data.studlist.length === 0) && params.selectedStudentsDetails?.length > 0) {
        const mockTemplate = activeData.studlist[0];
        activeData = {
            ...activeData,
            studlist: params.selectedStudentsDetails.map((s: any, i: number) => ({
                ...mockTemplate,
                amsT_Id: s.amsT_Id,
                amsT_FirstName: s.studentName,
                amsT_RegistrationNo: `REG/2024/${100 + i}`,
                arraybind: mockTemplate.arraybind.map((b: any) => ({ ...b, AMST_Id: s.amsT_Id }))
            }))
        };
    }

    if (!activeData) return null;

    const { instname = [], studlist = [], submainlistnew = [], abcd = [], subjectlistwithdetails = [], tempmarksgrade = [] } = activeData;

    const institute = instname[0] || {};
    const colSpanTotal = 7 + (params.sectionrank ? 1 : 0) + tempmarksgrade.length;

    return (
        <div className='space-y-4'>
            <div className='no-print flex justify-end gap-2'>
                <Button onClick={handlePrint} variant='outline' className='border-none bg-sky-800 text-white shadow-sm hover:bg-sky-900'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExportToExcel}
                    variant='outline'
                    className='border-none bg-green-600 text-white shadow-sm hover:bg-green-700'>
                    <FileSpreadsheet className='mr-2 h-4 w-4' /> Excel
                </Button>
            </div>

            <div id='report-print-area' className='overflow-x-auto rounded-lg border bg-white p-4 shadow-sm'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: landscape; margin: 5mm; }
                        body { visibility: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        #report-print-area, #report-print-area * { visibility: visible; }
                        #report-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
                        .no-print { display: none !important; }
                    }
                    .cum-table { width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif; border: 1px solid #000; }
                    .cum-table th, .cum-table td { border: 1px solid #000; padding: 4px 6px; text-align: center; font-size: 11px; color: #000; }
                    .cum-table thead th { background-color: #f0f0f0 !important; font-weight: bold; }
                    .sticky-col { position: sticky; left: 0; background-color: white; z-index: 10; border-right: 2px solid #000; }
                    .text-left { text-align: left !important; }
                `
                    }}
                />

                <table className='cum-table' ref={tableRef}>
                    <thead>
                        {/* Institute Header */}
                        <tr className='bg-white'>
                            <th colSpan={colSpanTotal} className='border-none bg-white p-4 text-center'>
                                <h2 className='font-bold text-2xl text-black uppercase'>{institute.mI_Name}</h2>
                                <p className='text-black text-xs'>
                                    {institute.mI_Address1}, {institute.ivrmmcT_Name} - {institute.mI_Pincode}
                                </p>
                                <h3 className='mt-2 border-black border-b pb-1 font-bold text-lg'>CONSOLIDATED MARKS SHEET</h3>
                                <div className='mt-2 flex justify-around font-bold text-xs'>
                                    <span>ACADEMIC YEAR : {params.year}</span>
                                    <span>EXAM : {params.exam}</span>
                                    <span>
                                        CLASS & SEC : {params.class} - {params.section}
                                    </span>
                                </div>
                            </th>
                        </tr>

                        {/* Row 1: Main Headers */}
                        <tr className='bg-gray-100 font-bold'>
                            <th rowSpan={4} style={{ width: '40px' }}>
                                Sl No
                            </th>
                            <th rowSpan={4} style={{ width: '100px' }}>
                                Reg. NO
                            </th>
                            <th rowSpan={4} className='sticky-col' style={{ width: '180px' }}>
                                Student Name
                            </th>
                            {submainlistnew.map((sub: any, i: number) => (
                                <th key={i} colSpan={sub.clmcnt} rowSpan={sub.rowspancnt}>
                                    {sub.subjectname}
                                </th>
                            ))}
                            <th rowSpan={4}>Total</th>
                            <th rowSpan={4}>Max.Total</th>
                            <th rowSpan={4}>Per.(%)</th>
                            {params.sectionrank && <th rowSpan={4}>Rank</th>}
                        </tr>

                        {/* Row 2: Sub-Subjects */}
                        <tr className='bg-gray-100 font-bold'>
                            {abcd.map(
                                (col: any, i: number) =>
                                    col.subsubjectname !== '' && (
                                        <th key={i} colSpan={col.clspncnt}>
                                            {col.subsubjectname}
                                        </th>
                                    )
                            )}
                        </tr>

                        {/* Row 3: Sub-Exams */}
                        <tr className='bg-gray-100 font-bold'>
                            {subjectlistwithdetails.map((col: any, i: number) => (
                                <th key={i}>{col.EMSE_SubExamName}</th>
                            ))}
                        </tr>

                        {/* Row 4: Marks/Grade Type */}
                        <tr className='bg-gray-100 font-bold'>
                            {tempmarksgrade.map((col: any, i: number) => (
                                <th key={i}>
                                    {col.name} {params.DisplayGrade && ' | G'}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {studlist.map((student: any, sIdx: number) => (
                            <tr key={sIdx}>
                                <td>{sIdx + 1}</td>
                                <td>{student.amsT_RegistrationNo}</td>
                                <td className='sticky-col bg-white text-left'>{student.amsT_FirstName}</td>
                                {tempmarksgrade.map((header: any, hIdx: number) => {
                                    const score = (student.arraybind || []).find(
                                        (f: any) =>
                                            f.ISMS_Id === header.subjidnew &&
                                            f.EMSE_SubExamName === header.EMSE_SubExamName &&
                                            f.EMSS_SubSubjectName === header.EMSS_SubSubjectName
                                    );

                                    return (
                                        <td key={hIdx}>
                                            {score ? (
                                                <>
                                                    {header.name === 'M' ? (
                                                        <span>{score.passfailflag === 'AB' ? 'AB' : score.subsubjectmarks}</span>
                                                    ) : (
                                                        <span>{score.passfailflag === 'AB' ? 'AB' : score.subsubjectgrade}</span>
                                                    )}
                                                    {params.DisplayGrade &&
                                                        header.name === 'M' &&
                                                        score.passfailflag !== 'AB' &&
                                                        score.subsubjectmarks > 0 && (
                                                            <span className='ml-1'>| {score.subsubjectgrade}</span>
                                                        )}
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    );
                                })}
                                <td className='font-bold'>{student.total}</td>
                                <td>{student.maxtotal}</td>
                                <td>{student.percentage}%</td>
                                {params.sectionrank && <td className='font-bold'>{student.estmP_SectionRank}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
