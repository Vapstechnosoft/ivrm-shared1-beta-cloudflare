'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';

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
        a.download = 'CONSOLIDATED_MARKS_SHEET_REPORT.xls';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!data) return null;

    const { getsubjectslist = [], getcumulativereportdetails = [], getinstitution = [] } = data;

    const institute = getinstitution[0] || {};

    // Grouping students logic
    const studentList: any[] = [];
    getcumulativereportdetails.forEach((dd: any) => {
        const existing = studentList.find((s) => s.AMST_Id === dd.AMST_Id);
        if (!existing) {
            studentList.push({
                AMST_Id: dd.AMST_Id,
                studentname: dd.STUDENTNAME,
                admno: dd.ADMNO,
                regno: dd.REGNO,
                markslist: getcumulativereportdetails.filter((m: any) => m.AMST_Id === dd.AMST_Id)
            });
        }
    });

    // Create sub-columns (M and G) for each subject
    const subcolmns: any[] = [];
    getsubjectslist.forEach((dd: any) => {
        subcolmns.push({ subjid: dd.ISMS_Id, subjcolname: 'M' });
        subcolmns.push({ subjid: dd.ISMS_Id, subjcolname: 'G' });
    });

    const colnspan = 6 + subcolmns.length;

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

            <div id='printidnew' className='overflow-x-auto rounded-lg border bg-white p-4 shadow-sm'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: landscape; margin: 5mm; }
                        body { visibility: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        #printidnew, #printidnew * { visibility: visible; }
                        #printidnew { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
                        .no-print { display: none !important; }
                    }
                    .report-table { width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif; border: 1px solid black; }
                    .report-table th, .report-table td { border: 1px solid black; padding: 4px; text-align: center; font-size: 12px; }
                    .text-left { text-align: left !important; }
                    .padding-left-5 { padding-left: 5px !important; }
                `
                    }}
                />

                <table className='report-table' ref={tableRef}>
                    <thead>
                        <tr>
                            <th colSpan={colnspan} className='border-none p-4 text-center'>
                                <div className='space-y-1'>
                                    <h2 className='font-bold text-2xl uppercase'>{institute.mI_Name}</h2>
                                    <p className='text-sm'>
                                        {institute.mI_Address1}, {institute.ivrmmcT_Name}-{institute.mI_Pincode}
                                    </p>
                                    <h3 className='mt-4 inline-block border-black border-b pb-1 font-bold text-xl'>
                                        CONSOLIDATED MARKS SHEET
                                    </h3>
                                    <div className='mt-4 grid grid-cols-2 font-bold text-sm uppercase'>
                                        <span>ACADEMIC YEAR : {params.year}</span>
                                        <span>
                                            CLASS & SEC : {params.class} - {params.section}
                                        </span>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        <tr className='bg-gray-50'>
                            <th rowSpan={2} className='w-10'>
                                Sl No
                            </th>
                            <th rowSpan={2} className='w-24'>
                                Reg.NO
                            </th>
                            <th rowSpan={2}>Student Name</th>
                            {getsubjectslist.map((sub: any) => (
                                <th key={sub.ISMS_Id} colSpan={2}>
                                    {sub.ISMS_SubjectName}
                                </th>
                            ))}
                            <th rowSpan={2}>Total</th>
                            <th rowSpan={2}>Per.(%)</th>
                            <th rowSpan={2}>Grade</th>
                        </tr>
                        <tr className='bg-gray-50'>
                            {subcolmns.map((col, i) => (
                                <th key={i} className='w-8'>
                                    {col.subjcolname}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {studentList.map((stu, idx) => (
                            <tr key={stu.AMST_Id}>
                                <td>{idx + 1}</td>
                                <td className='padding-left-5 text-left'>{stu.regno}</td>
                                <td className='padding-left-5 text-left'>{stu.studentname}</td>
                                {subcolmns.map((col, i) => {
                                    const mark = stu.markslist.find((m: any) => m.ISMS_Id === col.subjid);
                                    return <td key={i}>{mark ? (col.subjcolname === 'M' ? mark.MARKSOBTAINED : mark.GRADE) : ''}</td>;
                                })}
                                <td>{stu.markslist.find((m: any) => m.ISMS_Id === 1000000)?.MARKSOBTAINED}</td>
                                <td>{stu.markslist.find((m: any) => m.ISMS_Id === 1000000)?.PERCENTAGE}</td>
                                <td>{stu.markslist.find((m: any) => m.ISMS_Id === 1000000)?.GRADE}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
