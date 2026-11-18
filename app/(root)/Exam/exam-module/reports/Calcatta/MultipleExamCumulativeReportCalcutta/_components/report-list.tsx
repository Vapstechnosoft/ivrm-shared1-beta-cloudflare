'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MultipleExamCumulativeReportCalcuttaListProps {
    data: any;
}

const MultipleExamCumulativeReportCalcuttaList = ({ data }: MultipleExamCumulativeReportCalcuttaListProps) => {
    const { getinstitution = [], getsubjectslist = [], studentlistd = [], subcolmns = [], yr, cla, sec, colnspan } = data;

    const inst = getinstitution[0] || {};

    const handlePrint = () => {
        const printContent = document.getElementById('printidnew');
        if (printContent) {
            const windowUrl = 'about:blank';
            const uniqueName = new Date().getTime();
            const windowName = 'Print' + uniqueName;
            const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Consolidated Marks Sheet Report</title>
                            <style>
                                @media print {
                                    @page { size: landscape; margin: 10mm; }
                                    body { font-family: 'Times New Roman', serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: #212529; border: 1px solid #000 !important; }
                                    th, td { border: 1px solid #000 !important; padding: 4px !important; font-size: 10px !important; }
                                    .text-center { text-align: center !important; }
                                    .text-left { text-align: left !important; }
                                    .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
                                    .font-bold { font-weight: bold !important; }
                                    .uppercase { text-transform: uppercase !important; }
                                    .bg-purple-800 { background-color: #6b21a8 !important; color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                    .bg-orange-100 { background-color: #ffedd5 !important; color: #581c87 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                    .text-white { color: white !important; }
                                    .text-purple-800 { color: #6b21a8 !important; }
                                    .text-purple-900 { color: #581c87 !important; }
                                    .text-2xl { font-size: 20px !important; }
                                    .text-lg { font-size: 14px !important; }
                                    .text-sm { font-size: 11px !important; }
                                }
                                table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; color: #212529; border: 1px solid #000 !important; }
                                th, td { border: 1px solid #000 !important; padding: 4px !important; font-size: 10px !important; }
                                .text-center { text-align: center !important; }
                                .text-left { text-align: left !important; }
                                .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); display: inline-block; white-space: nowrap; }
                                .font-bold { font-weight: bold !important; }
                                .uppercase { text-transform: uppercase !important; }
                                .bg-purple-800 { background-color: #6b21a8 !important; color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                .bg-orange-100 { background-color: #ffedd5 !important; color: #581c87 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                                .text-white { color: white !important; }
                                .text-purple-800 { color: #6b21a8 !important; }
                                .text-purple-900 { color: #581c87 !important; }
                                .text-2xl { font-size: 20px !important; }
                                .text-lg { font-size: 14px !important; }
                                .text-sm { font-size: 11px !important; }
                            </style>
                        </head>
                        <body>
                            ${printContent.innerHTML}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const handleExport = () => {
        const table = document.getElementById('table1');
        if (table) {
            const wb = XLSX.utils.table_to_book(table);
            XLSX.writeFile(wb, 'CONSOLIDATED_MARKS_SHEET_REPORT.xlsx');
        }
    };

    if (!studentlistd || studentlistd.length === 0) return null;

    return (
        <div className='mt-6 space-y-4'>
            <div className='no-print flex justify-end gap-2'>
                <Button onClick={handlePrint} className='bg-orange-500 text-white hover:bg-orange-600'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
                <Button onClick={handleExport} className='bg-orange-500 text-white hover:bg-orange-600'>
                    <FileSpreadsheet className='mr-2 h-4 w-4' /> Excel
                </Button>
            </div>

            <div className='overflow-x-auto rounded-lg border bg-white p-4 shadow-sm' id='printidnew'>
                <table className='w-full border-collapse border border-black text-[12px]' id='table1'>
                    <thead>
                        <tr>
                            <th colSpan={colnspan} className='border border-black bg-white p-4 text-black'>
                                <div className='space-y-1 text-center'>
                                    <h1 className='font-bold text-2xl text-purple-800 uppercase'>{inst.mI_Name}</h1>
                                    <p className='font-bold text-gray-700 text-sm'>
                                        {inst.mI_Address1}, {inst.ivrmmcT_Name}-{inst.mI_Pincode}
                                    </p>
                                    <div className='border-black border-b py-1'>
                                        <h2 className='font-bold text-lg text-purple-800'>CONSOLIDATED MARKS SHEET</h2>
                                    </div>
                                    <div className='mt-2 flex justify-center gap-12 font-bold text-purple-900 text-sm'>
                                        <span>ACADEMIC YEAR : {yr}</span>
                                        <span>
                                            CLASS & SEC : {cla} - {sec}
                                        </span>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th className='w-10 border border-black bg-purple-800 p-2 text-white' rowSpan={2}>
                                <div className='vertical-text mx-auto font-bold'>Roll No</div>
                            </th>
                            <th className='min-w-[200px] border border-black bg-purple-800 p-2 text-white' rowSpan={2}>
                                <div className='vertical-text mx-auto font-bold'>Student Name</div>
                            </th>
                            <th className='w-24 border border-black bg-purple-800 p-2 text-white' rowSpan={2}>
                                <div className='vertical-text mx-auto font-bold'>Reg.NO</div>
                            </th>
                            <th className='w-16 border border-black bg-purple-800 p-2 text-white' rowSpan={2}>
                                <div className='vertical-text mx-auto font-bold'>ATTENDANCE %</div>
                            </th>
                            {getsubjectslist.map((sub: any, idx: number) => (
                                <th
                                    key={idx}
                                    colSpan={sub.colspan}
                                    className='border border-black bg-purple-800 p-2 text-center font-bold text-white'>
                                    {sub.ISMS_SubjectName}
                                </th>
                            ))}
                            <th className='border border-black bg-purple-800 p-2 text-center text-white' rowSpan={2}>
                                Total
                            </th>
                            <th className='border border-black bg-purple-800 p-2 text-center text-white' rowSpan={2}>
                                Percentage
                            </th>
                        </tr>
                        <tr>
                            {subcolmns.map((col: any, idx: number) => (
                                <th key={idx} className='w-10 border border-black bg-purple-800 p-2 text-center text-white'>
                                    <div className='vertical-text mx-auto text-[10px]'>{col.EMSE_SubExamName}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {studentlistd.map((stu: any, sIdx: number) => (
                            <tr key={sIdx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-black p-2 text-center'>{stu.AMAY_RollNo}</td>
                                <td className='border border-black p-2 text-left font-medium'>{stu.AMST_FirstName}</td>
                                <td className='border border-black p-2 text-left'>{stu.AMST_AdmNo}</td>
                                <td className='border border-black p-2 text-left'>{stu.ATTENDANCEPERCENTAGE}</td>
                                {stu.markslist?.map((mark: any, mIdx: number) => (
                                    <td key={mIdx} className='border border-black p-1 text-center'>
                                        {mark.ESTMPSSS_PassFailFlg !== 'AB' &&
                                            mark.EYCES_MarksDisplayFlg === true &&
                                            mark.ESTMPSSS_ObtainedMarks > 0 && (
                                                <span className={mark.EME_Id === 98000 || mark.EME_Id === 98001 ? 'font-bold' : ''}>
                                                    {mark.ESTMPSSS_ObtainedMarks}
                                                </span>
                                            )}
                                        {mark.ESTMPSSS_PassFailFlg !== 'AB' &&
                                            mark.EYCES_GradeDisplayFlg === true &&
                                            mark.ESTMPSSS_ObtainedGrade &&
                                            mark.ESTMPSSS_ObtainedGrade !== '0' && <span>{mark.ESTMPSSS_ObtainedGrade}</span>}
                                        {mark.ESTMPSSS_PassFailFlg === 'AB' && mark.ESTMPSSS_ObtainedMarks === 0 && (
                                            <span className='font-bold text-red-500'>{mark.ESTMPSSS_PassFailFlg}</span>
                                        )}
                                        {mark.ESTMPSSS_PassFailFlg !== 'AB' &&
                                            mark.ESTMPSSS_ObtainedMarks === 0 &&
                                            mark.EYCES_MarksDisplayFlg === true && <span>{mark.ESTMPSSS_ObtainedMarks}</span>}
                                    </td>
                                ))}
                                <td className='border border-black bg-orange-100 p-2 text-center font-bold text-purple-900'>
                                    {stu.totallist?.find((colt: any) => colt.ISMS_Id === 1000000)?.MARKSOBTAINED || ''}
                                </td>
                                <td className='border border-black bg-orange-100 p-2 text-center font-bold text-purple-900'>
                                    {stu.totallist?.find((colt: any) => colt.ISMS_Id === 1000000)?.PERCENTAGE || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx global>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    display: inline-block;
                    white-space: nowrap;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MultipleExamCumulativeReportCalcuttaList;
