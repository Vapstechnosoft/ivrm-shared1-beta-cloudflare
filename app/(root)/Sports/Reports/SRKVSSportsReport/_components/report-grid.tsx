'use client';

import { Button } from '@/components/ui/button';
import type { ISRKVSReportData } from '@/types/sports/reports/srkvs-sports-report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    data: ISRKVSReportData[];
    type: string;
}

// ── Print HTML builders ─────────────────────────────────────────────

const thStyle = 'border:1px solid #000;padding:8px 10px;background:#f3f4f6;text-align:center;font-weight:bold;';
const tdStyle = 'border:1px solid #000;padding:6px 10px;text-align:center;';
const tdLeftStyle = 'border:1px solid #000;padding:6px 10px;text-align:left;';
const groupHeaderStyle = 'border:1px solid #000;padding:8px 10px;background:#e5e7eb;text-align:left;font-weight:bold;';

function wrapHtml(title: string, tableHtml: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>${title}</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; background: #fff; color: #000; }
                h2 { text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; font-size: 16px; }
                h4 { text-align: center; margin: 12px 0 8px 0; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                .page-break { page-break-before: always; }
                .results { margin-top: 8px; font-size: 12px; }
                .results b { font-weight: bold; }
                @media print {
                    body { margin: 10mm; }
                    @page { size: A4 portrait; margin: 10mm; }
                    .page-break { page-break-before: always; }
                }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
            ${tableHtml}
        </body>
        </html>
    `;
}

function buildRecordPrintHtml(data: ISRKVSReportData[]): string {
    const headerCells = ['#', 'Category', 'Events', 'Timings', 'Year', 'Name'].map((h) => `<th style="${thStyle}">${h}</th>`).join('');

    let rows = '';
    data.forEach((group) => {
        rows += `<tr><th colspan="6" style="${groupHeaderStyle}">${group.SPCCMCC_CompitionCategory || ''}</th></tr>`;
        (group.RecordDetails || []).forEach((record: any, idx: number) => {
            rows += `<tr>
                <td style="${tdStyle}">${idx + 1}</td>
                <td style="${tdStyle}">${record.SPCCMCC_CompitionCategory || ''}</td>
                <td style="${tdLeftStyle}">${record.SPCCMSCCG_SportsCCGroupName || ''}</td>
                <td style="${tdStyle}">${record.SPCCESTR_Value ?? ''} ${record.SPCCMUOM_UOMName ?? ''}</td>
                <td style="${tdStyle}">${record.ASMAY_Year || ''}</td>
                <td style="${tdLeftStyle}">${record.AMST_FirstName || ''}</td>
            </tr>`;
        });
    });

    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;
}

function buildStartFinishPrintHtml(data: ISRKVSReportData[], type: string): string {
    let html = '';
    data.forEach((group, groupIdx) => {
        if (groupIdx > 0) html += '<div class="page-break"></div>';
        html += `<h4>${group.SPCCMCC_CompitionCategory || ''} : ${group.SPCCMSCCG_SportsCCGroupName || ''}</h4>`;
        html += `<table>
            <thead>
                <tr>
                    <th rowspan="2" style="${thStyle}">Lane No</th>
                    <th rowspan="2" style="${thStyle}">Roll No</th>
                    <th rowspan="2" style="${thStyle}">Name</th>
                    <th colspan="3" style="${thStyle}">Attempts</th>
                    ${type === 'Finish' ? `<th rowspan="2" style="${thStyle}">Rank</th>` : ''}
                </tr>
                <tr>
                    <th style="${thStyle}">I</th>
                    <th style="${thStyle}">II</th>
                    <th style="${thStyle}">III</th>
                </tr>
            </thead>
            <tbody>`;

        (group.RecordDetails || []).forEach((record: any, recIdx: number) => {
            html += `<tr>
                <td style="${tdStyle}">${recIdx + 1}</td>
                <td style="${tdStyle}">${record.AMAY_RollNo ?? ''}</td>
                <td style="${tdLeftStyle}">${record.AMST_FirstName || ''}</td>
                <td style="${tdStyle}">${record['I'] ?? ''}</td>
                <td style="${tdStyle}">${record['II'] ?? ''}</td>
                <td style="${tdStyle}">${record['III'] ?? ''}</td>
                ${type === 'Finish' ? `<td style="${tdStyle}">${record.SPCCESTR_Rank ?? ''}</td>` : ''}
            </tr>`;
        });

        html += '</tbody></table>';

        if (type === 'Finish') {
            const ranked = (group.RecordDetails || []).filter((r: any) => r.SPCCESTR_Rank);
            if (ranked.length > 0) {
                html += '<div class="results"><b>RESULTS:</b><br/>';
                ranked.forEach((r: any) => {
                    if (r.SPCCESTR_Rank === '1') html += `I PLACE: ${r.AMST_FirstName || ''}<br/>`;
                    if (r.SPCCESTR_Rank === '2') html += `II PLACE: ${r.AMST_FirstName || ''}<br/>`;
                    if (r.SPCCESTR_Rank === '3') html += `III PLACE: ${r.AMST_FirstName || ''}<br/>`;
                });
                html += '</div>';
            }
        }
    });
    return html;
}

function buildConsolidatedPrintHtml(data: ISRKVSReportData[], type: string): string {
    const isConsolidated = type === 'Consolidated';
    const headers = ['Place', 'Adm No', 'Name', 'Class', 'Section'];
    if (isConsolidated) headers.push('Time/Distance');

    const headerCells = headers.map((h) => `<th style="${thStyle}">${h}</th>`).join('');

    let rows = '';
    data.forEach((group) => {
        const colSpan = isConsolidated ? 6 : 5;
        rows += `<tr><th colspan="${colSpan}" style="${groupHeaderStyle}">${group.SPCCMSCCG_SportsCCGroupName || group.SPCCMCC_CompitionCategory || ''}</th></tr>`;
        (group.RecordDetails || []).forEach((record: any, recIdx: number) => {
            const place = type === 'Selection' ? String(recIdx + 1) : record.SPCCESTR_Rank || '';
            rows += `<tr>
                <td style="${tdStyle}">${place}</td>
                <td style="${tdStyle}">${record.AMST_AdmNo || ''}</td>
                <td style="${tdLeftStyle}">${record.AMST_FirstName || ''}</td>
                <td style="${tdStyle}">${record.ASMCL_ClassName || ''}</td>
                <td style="${tdStyle}">${record.ASMC_SectionName || ''}</td>
                ${isConsolidated ? `<td style="${tdStyle}">${record.SPCCESTR_Value ?? ''} ${record.SPCCMUOM_UOMName ?? ''}</td>` : ''}
            </tr>`;
        });
    });

    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;
}

function buildPrintHtml(data: ISRKVSReportData[], type: string): string {
    let tableHtml = '';

    if (type === 'Record') {
        tableHtml = buildRecordPrintHtml(data);
    } else if (type === 'Start' || type === 'Finish') {
        tableHtml = buildStartFinishPrintHtml(data, type);
    } else {
        // Consolidated, Indoor, Outdoor, Team, Externals, Selection
        tableHtml = buildConsolidatedPrintHtml(data, type);
    }

    return wrapHtml(`Sports Report - ${type}`, tableHtml);
}

// ── Component ───────────────────────────────────────────────────────

export const ReportGrid = ({ data, type }: ReportGridProps) => {
    const handlePrint = () => {
        if (!data || data.length === 0) return;
        const html = buildPrintHtml(data, type);

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render before printing
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    const exportToExcel = () => {
        if (!data || data.length === 0) return;

        // Flatten grouped data into export rows per report type
        const rows: Record<string, any>[] = [];

        data.forEach((group) => {
            (group.RecordDetails || []).forEach((record: any, idx: number) => {
                if (type === 'Record') {
                    rows.push({
                        'Sl.No': idx + 1,
                        Category: group.SPCCMCC_CompitionCategory || '',
                        Events: record.SPCCMSCCG_SportsCCGroupName || record.groupName || '',
                        Timings:
                            `${record.SPCCESTR_Value ?? record.points ?? ''} ${record.SPCCMUOM_UOMName ?? record.uomName ?? ''}`.trim(),
                        Year: record.ASMAY_Year || record.academicYear || '',
                        Name: record.AMST_FirstName || record.studentName || ''
                    });
                } else if (type === 'Start' || type === 'Finish') {
                    rows.push({
                        'Sl.No': idx + 1,
                        Category: group.SPCCMCC_CompitionCategory || '',
                        Group: group.SPCCMSCCG_SportsCCGroupName || '',
                        'Lane No': idx + 1,
                        'Roll No': record.AMAY_RollNo ?? record.rollNo ?? '',
                        Name: record.AMST_FirstName || record.studentName || '',
                        'Attempt I': record['I'] ?? '',
                        'Attempt II': record['II'] ?? '',
                        'Attempt III': record['III'] ?? '',
                        ...(type === 'Finish' ? { Rank: record.SPCCESTR_Rank ?? record.rank ?? '' } : {})
                    });
                } else if (type === 'Consolidated') {
                    rows.push({
                        'Sl.No': idx + 1,
                        Group: group.SPCCMSCCG_SportsCCGroupName || '',
                        Place: record.SPCCESTR_Rank ?? record.rank ?? '',
                        'Adm No': record.AMST_AdmNo || record.admNo || '',
                        Name: record.AMST_FirstName || record.studentName || '',
                        Class: record.ASMCL_ClassName || record.className || '',
                        Section: record.ASMC_SectionName || record.sectionName || '',
                        'Time/Distance':
                            `${record.SPCCESTR_Value ?? record.points ?? ''} ${record.SPCCMUOM_UOMName ?? record.uomName ?? ''}`.trim()
                    });
                } else {
                    // Indoor / Outdoor / Team / Externals / Selection
                    rows.push({
                        'Sl.No': idx + 1,
                        Group: group.SPCCMSCCG_SportsCCGroupName || '',
                        Place: type === 'Selection' ? idx + 1 : (record.SPCCESTR_Rank ?? record.rank ?? ''),
                        'Adm No': record.AMST_AdmNo || record.admNo || '',
                        Name: record.AMST_FirstName || record.studentName || '',
                        Class: record.ASMCL_ClassName || record.className || '',
                        Section: record.ASMC_SectionName || record.sectionName || ''
                    });
                }
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        // Generate Blob and trigger browser download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sports_Report_${type}.xlsx`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='font-medium text-sm'>
                        Total Groups: <span className='rounded bg-primary/10 px-3 py-1 font-bold text-primary'>{data.length}</span>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={handlePrint} className='border-2 hover:bg-primary/5'>
                            <Printer className='mr-2 h-4 w-4 text-primary' /> Print
                        </Button>
                        <Button variant='outline' size='sm' onClick={exportToExcel} className='border-2 hover:bg-primary/5'>
                            <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' /> Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className='rounded-md border bg-white p-4 shadow-sm'>
                <div className='mb-4 text-center'>
                    <h3 className='font-bold text-xl'>Sports Report - {type}</h3>
                </div>

                {type === 'Record' && (
                    <table className='w-full border-collapse border border-gray-300'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2'>Category</th>
                                <th className='border border-gray-300 p-2'>Events</th>
                                <th className='border border-gray-300 p-2'>Timings</th>
                                <th className='border border-gray-300 p-2'>Year</th>
                                <th className='border border-gray-300 p-2'>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((group, groupIdx) => (
                                <React.Fragment key={groupIdx}>
                                    <tr className='bg-gray-50'>
                                        <th colSpan={5} className='border border-gray-300 p-2 text-left'>
                                            {group.SPCCMCC_CompitionCategory}
                                        </th>
                                    </tr>
                                    {group.RecordDetails.map((record: any, recIdx: number) => (
                                        <tr key={recIdx}>
                                            <td className='border border-gray-300 p-2 text-center'>{recIdx + 1}</td>
                                            <td className='border border-gray-300 p-2'>{record.SPCCMSCCG_SportsCCGroupName}</td>
                                            <td className='border border-gray-300 p-2'>
                                                {record.SPCCESTR_Value} {record.SPCCMUOM_UOMName}
                                            </td>
                                            <td className='border border-gray-300 p-2'>{record.ASMAY_Year || ''}</td>
                                            <td className='border border-gray-300 p-2'>{record.AMST_FirstName}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}

                {(type === 'Start' || type === 'Finish') && (
                    <div className='space-y-6'>
                        {data.map((group, groupIdx) => (
                            <div key={groupIdx} className='mb-4 border p-2'>
                                <h4 className='mb-2 border-b pb-2 text-center font-bold'>
                                    {group.SPCCMCC_CompitionCategory} : {group.SPCCMSCCG_SportsCCGroupName}
                                </h4>
                                <table className='w-full border-collapse border border-gray-300'>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} className='border border-gray-300 p-2'>
                                                Lane No
                                            </th>
                                            <th rowSpan={2} className='border border-gray-300 p-2'>
                                                Roll/Name
                                            </th>
                                            <th colSpan={3} className='border border-gray-300 p-2'>
                                                Attempts
                                            </th>
                                            {type === 'Finish' && (
                                                <th rowSpan={2} className='border border-gray-300 p-2'>
                                                    Rank
                                                </th>
                                            )}
                                        </tr>
                                        <tr>
                                            <th className='border border-gray-300 p-2'>I</th>
                                            <th className='border border-gray-300 p-2'>II</th>
                                            <th className='border border-gray-300 p-2'>III</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.RecordDetails.map((record: any, recIdx: number) => (
                                            <tr key={recIdx}>
                                                <td className='border border-gray-300 p-2 text-center'>{recIdx + 1}</td>
                                                <td className='border border-gray-300 p-2'>
                                                    {record.AMAY_RollNo} : {record.AMST_FirstName}
                                                </td>
                                                <td className='border border-gray-300 p-2'>{record['I']}</td>
                                                <td className='border border-gray-300 p-2'>{record['II']}</td>
                                                <td className='border border-gray-300 p-2'>{record['III']}</td>
                                                {type === 'Finish' && (
                                                    <td className='border border-gray-300 p-2'>{record.SPCCESTR_Rank}</td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {type === 'Finish' && (
                                    <div className='mt-4'>
                                        <h5 className='font-bold'>RESULTS:</h5>
                                        {group.RecordDetails.filter((r: any) => r.SPCCESTR_Rank).map((r: any, i: number) => (
                                            <div key={i}>
                                                {r.SPCCESTR_Rank === '1' && <span>I PLACE: {r.AMST_FirstName}</span>}
                                                {r.SPCCESTR_Rank === '2' && <span>II PLACE: {r.AMST_FirstName}</span>}
                                                {r.SPCCESTR_Rank === '3' && <span>III PLACE: {r.AMST_FirstName}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {(type === 'Consolidated' ||
                    type === 'Indoor' ||
                    type === 'Outdoor' ||
                    type === 'Team' ||
                    type === 'Externals' ||
                    type === 'Selection') && (
                    <table className='w-full border-collapse border border-gray-300'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2'>Place</th>
                                <th className='border border-gray-300 p-2'>Adm No / Name</th>
                                <th className='border border-gray-300 p-2'>Class / Sec</th>
                                {type === 'Consolidated' && <th className='border border-gray-300 p-2'>Time/Distance</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((group, groupIdx) => (
                                <React.Fragment key={groupIdx}>
                                    <tr className='bg-gray-50'>
                                        <th colSpan={type === 'Consolidated' ? 4 : 3} className='border border-gray-300 p-2 text-left'>
                                            {group.SPCCMSCCG_SportsCCGroupName}
                                        </th>
                                    </tr>
                                    {group.RecordDetails.map((record: any, recIdx: number) => (
                                        <tr key={recIdx}>
                                            <td className='border border-gray-300 p-2 text-center'>
                                                {type === 'Selection' ? recIdx + 1 : record.SPCCESTR_Rank ? `${record.SPCCESTR_Rank}` : ''}
                                            </td>
                                            <td className='border border-gray-300 p-2'>
                                                {record.AMST_AdmNo} : {record.AMST_FirstName}
                                            </td>
                                            <td className='border border-gray-300 p-2'>
                                                {record.ASMCL_ClassName} {record.ASMC_SectionName}
                                            </td>
                                            {type === 'Consolidated' && (
                                                <td className='border border-gray-300 p-2'>
                                                    {record.SPCCESTR_Value} {record.SPCCMUOM_UOMName}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
