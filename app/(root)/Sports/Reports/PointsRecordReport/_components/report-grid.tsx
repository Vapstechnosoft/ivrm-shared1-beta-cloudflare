'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer, Search } from 'lucide-react';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

import { DataTable } from '@/components/ui/data-table/data-table';
import { Input } from '@/components/ui/input';
import { usePointsRecordReport } from '@/hooks/sports/usePointsRecordReport';
import type { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';
import type { ColumnDef } from '@tanstack/react-table';
import type { PointsRecordReportFormSchema } from '../schema';

function buildPrintHtml(data: IPointsRecordReportData[], formData: PointsRecordReportFormSchema | null, loadData: any): string {
    const getYearName = (yearId: number) => {
        return loadData?.data?.yearlist?.find((y: any) => y.asmaY_Id === yearId)?.asmaY_Year || '';
    };

    const getCategoryName = (catId?: number) => {
        if (!catId) return '';
        return loadData?.data?.categoryList?.find((c: any) => c.spccmcC_Id === catId)?.spccmcC_CompitionCategory || '';
    };

    let tableContent = '';

    if (formData?.Type === 'CC') {
        const groupedData = data.reduce((acc: any, item) => {
            const eventName = item.spccmE_EventName || 'Unknown Event';
            if (!acc[eventName]) acc[eventName] = [];
            acc[eventName].push(item);
            return acc;
        }, {});

        const eventNames = Object.keys(groupedData);

        if (eventNames.length > 0) {
            tableContent = `
                <thead style="background:#f3f4f6;text-align:center;font-weight:bold;">
                    <tr>
                        <th style="border:1px solid #000;padding:6px 10px;">SL. NO</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Place</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Student Name</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Adm. No.</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Class</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Section</th>
                        <th style="border:1px solid #000;padding:6px 10px;">House Name</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Points</th>
                        <th style="border:1px solid #000;padding:6px 10px;">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventNames
                        .map((eventName, eIdx) => {
                            let html = `<tr><th colspan="9" style="border:1px solid #000;padding:6px 10px;text-align:left;background:#f9fafb;">EVENT: ${eventName}</th></tr>`;
                            html += groupedData[eventName]
                                .map((item: any, sIdx: number) => {
                                    let rowHtml = `<tr>`;
                                    if (sIdx === 0) {
                                        rowHtml += `<td rowspan="${groupedData[eventName].length}" style="border:1px solid #000;padding:6px 10px;text-align:center;vertical-align:middle;font-weight:bold;">${eIdx + 1}</td>`;
                                    }
                                    rowHtml += `
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.spccestR_Rank ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:left;">${item.amsT_Name ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.amsT_AdmNo ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.asmcL_ClassName ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.asmC_SectionName ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.spccmH_HouseName ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.spccestR_Points ?? '-'}</td>
                                <td style="border:1px solid #000;padding:6px 10px;text-align:center;">${item.spccestR_Remarks ?? '-'}</td>
                            </tr>`;
                                    return rowHtml;
                                })
                                .join('');
                            return html;
                        })
                        .join('')}
                </tbody>
            `;
        } else {
            tableContent = `<tbody><tr><td colspan="9" style="text-align:center;padding:20px;">No Records Found</td></tr></tbody>`;
        }
    } else {
        const printHeaders = [
            'SL.NO',
            'Student Name',
            'Adm. No.',
            'Class',
            'Section',
            'House Name',
            'Event',
            'Venue',
            'Sports',
            'Points',
            'Place',
            'Remarks'
        ];

        const printAccessors: (keyof IPointsRecordReportData)[] = [
            'amsT_Name',
            'amsT_AdmNo',
            'asmcL_ClassName',
            'asmC_SectionName',
            'spccmH_HouseName',
            'spccmE_EventName',
            'spccmeV_EventVenue',
            'spccmscC_SportsCCName',
            'spccestR_Points',
            'spccestR_Rank',
            'spccestR_Remarks'
        ];

        const headerCells = printHeaders
            .map(
                (h) => `<th style="border:1px solid #000;padding:6px 10px;background:#f3f4f6;text-align:center;font-weight:bold;">${h}</th>`
            )
            .join('');

        const rows = data
            .map((row, idx) => {
                const cells = printAccessors
                    .map((key) => {
                        const val = row[key] !== null && row[key] !== undefined ? String(row[key]) : '-';
                        return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${val}</td>`;
                    })
                    .join('');
                return `<tr><td style="border:1px solid #000;padding:6px 10px;text-align:center;">${idx + 1}</td>${cells}</tr>`;
            })
            .join('');

        tableContent = `
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows.length > 0 ? rows : `<tr><td colspan="${printHeaders.length + 1}" style="text-align:center;padding:20px;">No Records Found</td></tr>`}</tbody>
        `;
    }

    const titleSuffix = formData?.Type === 'CC' ? '' : formData?.ASMAY_Id ? ` ${getYearName(formData.ASMAY_Id)}` : '';
    const subtitle =
        formData?.Type === 'CC'
            ? `
        <div style="margin-top:8px;font-size:14px;font-weight:normal;">
            <p style="margin:4px 0;">Academic Year: ${formData?.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</p>
            <p style="margin:4px 0;">Competition Category: ${formData?.SPCCMCC_Id ? getCategoryName(formData.SPCCMCC_Id) : ''}</p>
        </div>
    `
            : '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Points Record Report</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; background: #fff; color: #000; }
                h2 { text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; }
                @media print {
                    body { margin: 10mm; }
                    @page { size: landscape; margin: 10mm; }
                }
            </style>
        </head>
        <body>
            <h2>POINTS RECORD REPORT${titleSuffix}${subtitle}</h2>
            <table>
                ${tableContent}
            </table>
        </body>
        </html>
    `;
}

interface ReportGridProps {
    data: IPointsRecordReportData[];
    formData: PointsRecordReportFormSchema | null;
}

export default function ReportGrid({ data, formData }: ReportGridProps) {
    const { loadData } = usePointsRecordReport();
    const [searchQuery, setSearchQuery] = useState('');

    const getYearName = (yearId: number) => {
        return loadData.data?.yearlist.find((y) => y.asmaY_Id === yearId)?.asmaY_Year || '';
    };

    const getCategoryName = (catId?: number) => {
        if (!catId) return '';
        return loadData.data?.categoryList.find((c) => c.spccmcC_Id === catId)?.spccmcC_CompitionCategory || '';
    };

    const filteredData = data.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
            (item.amsT_Name && item.amsT_Name.toLowerCase().includes(query)) ||
            (item.amsT_AdmNo && item.amsT_AdmNo.toLowerCase().includes(query)) ||
            (item.spccmH_HouseName && item.spccmH_HouseName?.toLowerCase().includes(query)) ||
            (item.spccmE_EventName && item.spccmE_EventName?.toLowerCase().includes(query)) ||
            (item.asmcL_ClassName && item.asmcL_ClassName?.toLowerCase().includes(query)) ||
            (item.asmC_SectionName && item.asmC_SectionName?.toLowerCase().includes(query))
        );
    });

    const groupedData = filteredData.reduce((acc: any, item) => {
        const eventName = item.spccmE_EventName || 'Unknown Event';
        if (!acc[eventName]) acc[eventName] = [];
        acc[eventName].push(item);
        return acc;
    }, {});

    const eventNames = Object.keys(groupedData);

    const handlePrint = () => {
        const html = buildPrintHtml(filteredData, formData, loadData);

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render before printing
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PointsRecordReport');
        XLSX.writeFile(workbook, 'PointsRecordReport.xlsx');
    };

    const columns: ColumnDef<IPointsRecordReportData>[] = [
        {
            accessorKey: 'index',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'amsT_Name',
            header: 'Student Name'
        },
        {
            accessorKey: 'amsT_AdmNo',
            header: 'Adm. No.'
        },
        {
            accessorKey: 'asmcL_ClassName',
            header: 'Class'
        },
        {
            accessorKey: 'asmC_SectionName',
            header: 'Section'
        },
        {
            accessorKey: 'spccmH_HouseName',
            header: 'House Name'
        },
        {
            accessorKey: 'spccmE_EventName',
            header: 'Event'
        },
        {
            accessorKey: 'spccmeV_EventVenue',
            header: 'Venue'
        },
        {
            accessorKey: 'spccmscC_SportsCCName',
            header: 'Sports'
        },
        {
            accessorKey: 'spccestR_Points',
            header: 'Points'
        },
        {
            accessorKey: 'spccestR_Rank',
            header: 'Place'
        },
        {
            accessorKey: 'spccestR_Remarks',
            header: 'Remarks'
        }
    ];

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='mr-4 font-medium text-muted-foreground text-sm'>
                        Total Records: <span className='rounded-full bg-primary/10 px-3 py-1 font-bold text-primary'>{data.length}</span>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={handlePrint} className='border-2 hover:bg-primary/5'>
                            <Printer className='mr-2 h-4 w-4 text-primary' />
                            Print
                        </Button>
                        <Button variant='outline' size='sm' onClick={handleExcelExport} className='border-2 hover:bg-primary/5'>
                            <FileSpreadsheet className='mr-2 h-4 w-4 text-success' />
                            Excel
                        </Button>
                    </div>
                </div>
                <div className='relative w-72'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search...'
                        className='h-10 border-2 pl-10'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className='overflow-visible rounded-lg border bg-white p-6 shadow-sm'>
                {formData?.Type === 'CC' ? (
                    <div className='space-y-6'>
                        <div className='text-center'>
                            <h3 className='font-bold text-xl uppercase underline'>POINTS RECORD REPORT</h3>
                            <div className='mt-2 font-medium text-sm'>
                                <p>Academic Year: {formData.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</p>
                                <p>Competition Category: {formData.SPCCMCC_Id ? getCategoryName(formData.SPCCMCC_Id) : ''}</p>
                            </div>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border border-gray-300 text-center text-sm'>
                                <thead className='bg-[#3a5dae] text-white'>
                                    <tr>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>SL. NO</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Place</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Student Name</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Adm. No.</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Class</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Section</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>House Name</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Points</th>
                                        <th className='border border-gray-300 bg-[#3a5dae] p-2 font-bold text-white'>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventNames.length > 0 ? (
                                        eventNames.map((eventName, eIdx) => (
                                            <React.Fragment key={eIdx}>
                                                <tr className='bg-slate-50'>
                                                    <th
                                                        colSpan={9}
                                                        className='border border-gray-300 bg-slate-50 p-2 px-4 text-left font-bold'>
                                                        EVENT: {eventName}
                                                    </th>
                                                </tr>
                                                {groupedData[eventName].map((item: any, sIdx: number) => (
                                                    <tr key={`${eIdx}-${sIdx}`} className='bg-white hover:bg-gray-50'>
                                                        {sIdx === 0 && (
                                                            <td
                                                                rowSpan={groupedData[eventName].length}
                                                                className='border border-gray-300 p-2 align-middle font-bold'>
                                                                {eIdx + 1}
                                                            </td>
                                                        )}
                                                        <td className='border border-gray-300 p-2'>{item.spccestR_Rank}</td>
                                                        <td className='border border-gray-300 p-2 text-left'>{item.amsT_Name}</td>
                                                        <td className='border border-gray-300 p-2'>{item.amsT_AdmNo}</td>
                                                        <td className='border border-gray-300 p-2'>{item.asmcL_ClassName}</td>
                                                        <td className='border border-gray-300 p-2'>{item.asmC_SectionName}</td>
                                                        <td className='border border-gray-300 p-2'>{item.spccmH_HouseName}</td>
                                                        <td className='border border-gray-300 p-2'>{item.spccestR_Points}</td>
                                                        <td className='border border-gray-300 p-2'>{item.spccestR_Remarks}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className='border border-gray-300 p-8 text-center font-medium text-muted-foreground'>
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        <div className='text-center'>
                            <h3 className='font-bold text-xl uppercase underline'>
                                POINTS RECORD REPORT {formData?.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}
                            </h3>
                        </div>

                        <div>
                            <DataTable columns={columns} data={filteredData} totalItems={filteredData.length} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
