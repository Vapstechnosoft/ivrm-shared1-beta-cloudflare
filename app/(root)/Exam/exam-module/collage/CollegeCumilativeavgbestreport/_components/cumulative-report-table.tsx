'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, FileSpreadsheet, Printer, Search, Table as TableIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { IReportConfig, IReportHeaderInst, IReportStudentRecord, ISelectedExam } from '../types';

interface CumulativeReportTableProps {
    reportData: IReportStudentRecord[];
    examList: ISelectedExam[];
    headerInst?: IReportHeaderInst;
    config?: IReportConfig;

    yearName?: string;
    courseName?: string;
    branchName?: string;
    semesterName?: string;
    sectionName?: string;
    subjectName?: string;
}

export function CumulativeReportTable({
    reportData,
    examList,
    headerInst,
    config,
    yearName = '',
    courseName = '',
    branchName = '',
    semesterName = '',
    sectionName = '',
    subjectName = ''
}: CumulativeReportTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<string>('STUDENTNAME');
    const [sortAsc, setSortAsc] = useState<boolean>(true);
    const printRef = useRef<HTMLDivElement>(null);

    // Determine column visibility
    const showRegNo = useMemo(() => {
        if (!config) return true;
        if (config.exmConfig_RegnoColumnDisplay !== undefined) {
            return config.exmConfig_RegnoColumnDisplay;
        }
        return true;
    }, [config]);

    // Institution details
    const institutionName = headerInst?.mI_Name || 'INSTITUTION';
    const instAddress = [
        headerInst?.mI_Address1,
        headerInst?.mI_Address2,
        headerInst?.mI_Address3,
        headerInst?.mI_Pincode ? `- ${headerInst?.mI_Pincode}` : ''
    ]
        .filter(Boolean)
        .join(', ');

    // Filter & Sort
    const filteredAndSortedData = useMemo(() => {
        let list = [...reportData];

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter((row) => {
                const name = (row.STUDENTNAME || '').toLowerCase();
                const regno = (row.REGNO || '').toLowerCase();
                const admno = (row.ADMNO || '').toLowerCase();
                return name.includes(q) || regno.includes(q) || admno.includes(q);
            });
        }

        if (sortKey) {
            list.sort((a, b) => {
                const valA = a[sortKey] ?? '';
                const valB = b[sortKey] ?? '';

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortAsc ? valA - valB : valB - valA;
                }
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
            });
        }

        return list;
    }, [reportData, searchTerm, sortKey, sortAsc]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) return;

        const wb = XLSX.utils.book_new();

        const sheetData: any[][] = [
            [institutionName],
            instAddress ? [instAddress] : [],
            ['CUMULATIVE REPORT'],
            [`ACADEMIC YEAR: ${yearName}`],
            [`Subject: ${subjectName}`],
            [`COURSE: ${courseName}    BRANCH: ${branchName}    SEMESTER: ${semesterName}    SECTION: ${sectionName}`],
            []
        ];

        // Header Row
        const headerRow: string[] = ['Sl No', 'Student Name'];
        if (showRegNo) headerRow.push('Register No');
        examList.forEach((ex) => {
            headerRow.push(`${ex.EME_ExamName} Marks`);
        });
        headerRow.push('Final Marks', 'CLASS HELD', 'ATTENDANCE');
        sheetData.push(headerRow);

        // Data Rows
        filteredAndSortedData.forEach((row, index) => {
            const dataRow: any[] = [index + 1, row.STUDENTNAME || ''];
            if (showRegNo) dataRow.push(row.REGNO || '');
            examList.forEach((ex) => {
                const mark = row[ex.EME_Id] ?? row[String(ex.EME_Id)] ?? '-';
                dataRow.push(mark);
            });
            dataRow.push(row.final ?? '-', row.CLASSHELD ?? '-', row.PRESENT ?? '-');
            sheetData.push(dataRow);
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Set column widths
        ws['!cols'] = [
            { wch: 8 },
            { wch: 28 },
            ...(showRegNo ? [{ wch: 18 }] : []),
            ...examList.map(() => ({ wch: 16 })),
            { wch: 14 },
            { wch: 14 },
            { wch: 14 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Cumulative Report');
        XLSX.writeFile(wb, `Cumulative_Report_${yearName || 'Academic'}.xlsx`);
    };

    // Print
    const handlePrint = () => {
        if (!printRef.current) return;
        const innerContents = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cumulative Report - ${yearName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #111;
                    }
                    .header-section {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .header-section h2 {
                        margin: 4px 0;
                        font-size: 18px;
                        text-transform: uppercase;
                    }
                    .header-section h3 {
                        margin: 3px 0;
                        font-size: 15px;
                        font-weight: 600;
                    }
                    .header-section p {
                        margin: 3px 0;
                        font-size: 13px;
                    }
                    .info-bar {
                        display: flex;
                        justify-content: space-around;
                        font-size: 13px;
                        font-weight: bold;
                        border-top: 1px solid #333;
                        border-bottom: 1px solid #333;
                        padding: 6px 0;
                        margin: 10px 0 15px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #333;
                        padding: 6px 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                        text-align: center;
                    }
                    .text-left { text-align: left; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    @media print {
                        @page {
                            size: landscape;
                            margin: 15mm;
                        }
                    }
                </style>
            </head>
            <body>
                ${innerContents}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    return (
        <Card className='mt-6 border-border/60 shadow-sm'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <TableIcon className='h-5 w-5 text-primary' />
                            Data Grid View
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Showing {filteredAndSortedData.length} of {reportData.length} records
                        </CardDescription>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <div className='relative w-64'>
                            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search by student or reg no...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='h-9 pl-9 text-xs'
                            />
                        </div>
                        <Button variant='outline' size='sm' onClick={handlePrint} className='h-9 px-3 text-xs'>
                            <Printer className='mr-1.5 h-3.5 w-3.5' />
                            Print
                        </Button>
                        <Button
                            variant='secondary'
                            size='sm'
                            onClick={handleExportExcel}
                            className='h-9 bg-emerald-600 px-3 text-white text-xs hover:bg-emerald-700'>
                            <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                            Excel
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-6'>
                {/* Print and Export Container */}
                <div ref={printRef} className='space-y-4'>
                    {/* Header Details */}
                    <div className='space-y-1.5 rounded-md border bg-muted/20 p-4 text-center'>
                        <h2 className='font-bold text-foreground text-lg uppercase tracking-wide'>{institutionName}</h2>
                        {instAddress && <p className='text-muted-foreground text-xs'>{instAddress}</p>}
                        <h3 className='pt-1 font-semibold text-primary text-sm tracking-wider'>CUMULATIVE REPORT</h3>
                        <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 font-medium text-muted-foreground text-xs'>
                            <span>
                                <strong>Academic Year:</strong> {yearName || 'N/A'}
                            </span>
                            <span>
                                <strong>Subject:</strong> {subjectName || 'N/A'}
                            </span>
                        </div>
                        <div className='mt-1 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-md border bg-muted/40 px-3 py-1.5 font-medium text-foreground text-xs'>
                            <span>
                                <strong>COURSE:</strong> {courseName || 'N/A'}
                            </span>
                            <span>
                                <strong>BRANCH:</strong> {branchName || 'N/A'}
                            </span>
                            <span>
                                <strong>SEMESTER:</strong> {semesterName || 'N/A'}
                            </span>
                            <span>
                                <strong>SECTION:</strong> {sectionName || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className='overflow-x-auto rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-muted/50 hover:bg-muted/50'>
                                    <TableHead className='w-14 text-center font-bold text-foreground'>Sl No</TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none font-bold text-foreground'
                                        onClick={() => handleSort('STUDENTNAME')}>
                                        <div className='flex items-center gap-1'>
                                            Student Name
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    {showRegNo && (
                                        <TableHead
                                            className='w-36 cursor-pointer select-none font-bold text-foreground'
                                            onClick={() => handleSort('REGNO')}>
                                            <div className='flex items-center gap-1'>
                                                Register No
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </TableHead>
                                    )}
                                    {examList.map((exam) => (
                                        <TableHead key={exam.EME_Id} className='whitespace-nowrap text-center font-bold text-foreground'>
                                            {exam.EME_ExamName} Marks
                                        </TableHead>
                                    ))}
                                    <TableHead
                                        className='cursor-pointer select-none whitespace-nowrap text-center font-bold text-foreground'
                                        onClick={() => handleSort('final')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            Final Marks
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    <TableHead className='whitespace-nowrap text-center font-bold text-foreground'>CLASS HELD</TableHead>
                                    <TableHead className='whitespace-nowrap text-center font-bold text-foreground'>ATTENDANCE</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5 + examList.length + (showRegNo ? 1 : 0)}
                                            className='h-24 text-center text-muted-foreground'>
                                            No student records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedData.map((row, index) => (
                                        <TableRow key={index} className='hover:bg-muted/30'>
                                            <TableCell className='text-center font-medium text-xs'>{index + 1}</TableCell>
                                            <TableCell className='font-medium text-foreground text-xs'>{row.STUDENTNAME || '-'}</TableCell>
                                            {showRegNo && (
                                                <TableCell className='text-muted-foreground text-xs'>{row.REGNO || '-'}</TableCell>
                                            )}
                                            {examList.map((exam) => {
                                                const score = row[exam.EME_Id] ?? row[String(exam.EME_Id)] ?? '-';
                                                return (
                                                    <TableCell key={exam.EME_Id} className='text-center font-medium text-xs'>
                                                        {score}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className='text-center font-semibold text-primary text-xs'>
                                                {row.final ?? '-'}
                                            </TableCell>
                                            <TableCell className='text-center text-xs'>{row.CLASSHELD ?? '-'}</TableCell>
                                            <TableCell className='text-center font-medium text-xs'>{row.PRESENT ?? '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
