'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import React, { useRef } from 'react';
import type { IAttendanceMonthlyItem, IStudentProgressCard } from '../types';

interface ProgressCardViewProps {
    studentCards: IStudentProgressCard[];
    workAttendance: IAttendanceMonthlyItem[];
    presentAttendance: IAttendanceMonthlyItem[];
    examName?: string;
    issueDate?: Date;
    onPrint?: () => void;
}

export function ProgressCardView({
    studentCards,
    workAttendance,
    presentAttendance,
    examName = 'Exam',
    issueDate = new Date()
}: ProgressCardViewProps) {
    const printContainerRef = useRef<HTMLDivElement>(null);

    const formattedDate = React.useMemo(() => {
        const d = issueDate || new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    }, [issueDate]);

    const handlePrint = () => {
        if (!printContainerRef.current) return;
        const innerContents = printContainerRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=900');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Progress Card Report - ${examName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #111;
                        background: #fff;
                    }
                    .report-card {
                        page-break-after: always;
                        break-after: page;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                    }
                    .report-card:last-child {
                        page-break-after: auto;
                        break-after: auto;
                    }
                    .header-title {
                        text-align: center;
                        margin-bottom: 18px;
                    }
                    .header-title h3 {
                        font-size: 17px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 5px 0;
                    }
                    .student-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 8px 16px;
                        font-size: 13px;
                        margin-bottom: 16px;
                        border: 1px solid #ddd;
                        padding: 12px;
                        border-radius: 4px;
                    }
                    .student-field {
                        display: flex;
                        align-items: baseline;
                    }
                    .field-label {
                        font-weight: bold;
                        width: 110px;
                        flex-shrink: 0;
                    }
                    .field-value {
                        font-weight: 500;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                        margin-bottom: 14px;
                    }
                    th, td {
                        border: 1px solid #444;
                        padding: 6px 8px;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                        text-align: center;
                    }
                    .text-left { text-align: left; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .attendance-header {
                        background-color: #eee;
                        text-align: center;
                        font-weight: bold;
                    }
                    .footer-signatures {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 60px;
                        padding-top: 20px;
                        text-align: center;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .signature-block {
                        width: 30%;
                        border-top: 1px dashed #666;
                        padding-top: 6px;
                    }
                    @media print {
                        @page {
                            size: portrait;
                            margin: 15mm;
                        }
                        body { margin: 0; }
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
        <div className='fade-in animate-in space-y-6 duration-300'>
            {/* Action Bar */}
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='font-bold text-foreground text-lg'>Progress Report Cards</h3>
                    <p className='text-muted-foreground text-xs'>Generated {studentCards.length} student progress card(s)</p>
                </div>
                <Button onClick={handlePrint} className='h-9 font-semibold text-xs shadow-sm'>
                    <Printer className='mr-1.5 h-3.5 w-3.5' />
                    Print All Cards
                </Button>
            </div>

            {/* Printable Container */}
            <div ref={printContainerRef} className='space-y-8'>
                {studentCards.map((report, cardIdx) => {
                    const workAtt = workAttendance.find((a) => a.AMCST_Id === report.AMCST_Id);
                    const presAtt = presentAttendance.find((a) => a.AMCST_Id === report.AMCST_Id);

                    return (
                        <Card
                            key={report.AMCST_Id || cardIdx}
                            className='report-card border-border/80 p-6 shadow-md print:border-none print:shadow-none'>
                            {/* Card Header Title */}
                            <div className='header-title mb-5 space-y-1 text-center'>
                                <h3 className='font-bold text-lg text-primary uppercase tracking-wider'>
                                    {examName || report.EME_ExamName || 'Exam'} Transcript / Marks Statement
                                </h3>
                            </div>

                            {/* Student Metadata */}
                            <div className='student-grid mb-5 grid grid-cols-1 gap-3 rounded-md border bg-muted/20 p-4 text-xs sm:grid-cols-2 md:grid-cols-3'>
                                <div className='student-field flex'>
                                    <span className='field-label w-24 font-bold text-muted-foreground'>Name:</span>
                                    <span className='field-value font-semibold text-foreground'>{report.StudentName}</span>
                                </div>
                                <div className='student-field flex'>
                                    <span className='field-label w-28 font-bold text-muted-foreground'>Enrolment No.:</span>
                                    <span className='field-value font-semibold text-foreground'>{report.AMCST_RegistrationNo || '-'}</span>
                                </div>
                                <div className='student-field flex'>
                                    <span className='field-label w-24 font-bold text-muted-foreground'>Course:</span>
                                    <span className='field-value font-semibold text-foreground'>{report.AMCO_CourseName || '-'}</span>
                                </div>
                                <div className='student-field flex'>
                                    <span className='field-label w-24 font-bold text-muted-foreground'>Branch:</span>
                                    <span className='field-value font-semibold text-foreground'>{report.AMB_BranchName || '-'}</span>
                                </div>
                                <div className='student-field flex'>
                                    <span className='field-label w-24 font-bold text-muted-foreground'>Semester:</span>
                                    <span className='field-value font-semibold text-foreground'>{report.AMSE_SEMName || '-'}</span>
                                </div>
                                {report.ACMS_SectionName && (
                                    <div className='student-field flex'>
                                        <span className='field-label w-24 font-bold text-muted-foreground'>Section:</span>
                                        <span className='field-value font-semibold text-foreground'>{report.ACMS_SectionName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Subject Marks Table */}
                            <div className='mb-5 overflow-x-auto rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='bg-muted/60'>
                                            <TableHead className='text-left font-bold text-foreground text-xs'>Subject Code</TableHead>
                                            <TableHead className='min-w-[200px] text-left font-bold text-foreground text-xs'>
                                                Subject Name
                                            </TableHead>
                                            <TableHead className='text-center font-bold text-foreground text-xs'>Max.Marks</TableHead>
                                            <TableHead className='text-center font-bold text-foreground text-xs'>Obtained Marks</TableHead>
                                            <TableHead className='text-center font-bold text-foreground text-xs'>Grade</TableHead>
                                            <TableHead className='text-center font-bold text-foreground text-xs'>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.subject.map((sub, sIdx) => (
                                            <TableRow key={sub.ISMS_Id || sIdx} className='hover:bg-muted/30'>
                                                <TableCell className='text-left font-semibold text-xs'>
                                                    {sub.ISMS_SubjectCode || '-'}
                                                </TableCell>
                                                <TableCell className='text-left font-medium text-xs'>{sub.ISMS_SubjectName}</TableCell>
                                                <TableCell className='text-center font-medium text-xs'>
                                                    {sub.ECSTMPS_MaxMarks ?? '-'}
                                                </TableCell>
                                                <TableCell className='text-center font-bold text-primary text-xs'>
                                                    {sub.ECSTMPS_ObtainedMarks ?? '-'}
                                                </TableCell>
                                                <TableCell className='text-center font-medium text-xs'>
                                                    {sub.ECSTMPS_ObtainedGrade || '-'}
                                                </TableCell>
                                                <TableCell className='text-center font-semibold text-xs'>
                                                    {sub.ECSTMPS_PassFailFlg || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Aggregate Rows */}
                                        <TableRow className='bg-muted/30 font-bold text-xs'>
                                            <TableCell className='text-left font-bold'>Total Percentage</TableCell>
                                            <TableCell colSpan={5} className='text-center font-bold text-primary'>
                                                {report.ECSTMP_Percentage !== undefined && report.ECSTMP_Percentage !== null
                                                    ? `${report.ECSTMP_Percentage}%`
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='bg-muted/30 font-bold text-xs'>
                                            <TableCell className='text-left font-bold'>Rank In Section</TableCell>
                                            <TableCell colSpan={5} className='text-center font-bold'>
                                                {report.ECSTMP_SectionRank || '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='bg-muted/30 font-bold text-xs'>
                                            <TableCell className='text-left font-bold'>Result</TableCell>
                                            <TableCell colSpan={5} className='text-center font-bold'>
                                                {report.ECSTMP_Result || '-'}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Monthly Attendance Breakdown */}
                            <div className='mb-4 overflow-x-auto rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='bg-muted/60'>
                                            <TableHead
                                                colSpan={16}
                                                className='attendance-header text-center font-bold text-foreground text-xs uppercase tracking-wider'>
                                                ATTENDANCE
                                            </TableHead>
                                        </TableRow>
                                        <TableRow className='bg-muted/40 text-center font-bold text-[11px]'>
                                            <TableHead colSpan={2} className='text-center font-bold'>
                                                MONTH
                                            </TableHead>
                                            <TableHead className='text-center font-bold'>MAY</TableHead>
                                            <TableHead className='text-center font-bold'>JUN</TableHead>
                                            <TableHead className='text-center font-bold'>JUL</TableHead>
                                            <TableHead className='text-center font-bold'>AUG</TableHead>
                                            <TableHead className='text-center font-bold'>SEP</TableHead>
                                            <TableHead className='text-center font-bold'>OCT</TableHead>
                                            <TableHead className='text-center font-bold'>NOV</TableHead>
                                            <TableHead className='text-center font-bold'>DEC</TableHead>
                                            <TableHead className='text-center font-bold'>JAN</TableHead>
                                            <TableHead className='text-center font-bold'>FEB</TableHead>
                                            <TableHead className='text-center font-bold'>MAR</TableHead>
                                            <TableHead className='text-center font-bold'>APR</TableHead>
                                            <TableHead className='text-center font-bold'>TOTAL</TableHead>
                                            <TableHead className='text-center font-bold'>TOTAL%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className='text-center text-xs'>
                                        <TableRow className='hover:bg-muted/20'>
                                            <TableCell colSpan={2} className='text-left font-bold text-xs'>
                                                WORKING DAYS
                                            </TableCell>
                                            <TableCell>{workAtt?.May ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.June ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.July ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.August ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.September ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.October ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.November ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.December ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.January ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.Febrauary ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.March ?? '-'}</TableCell>
                                            <TableCell>{workAtt?.April ?? '-'}</TableCell>
                                            <TableCell className='font-bold'>{workAtt?.TotalWorkingDays ?? '-'}</TableCell>
                                            <TableCell className='font-bold'>
                                                {workAtt?.Total_Percentage ? `${workAtt.Total_Percentage}%` : '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className='hover:bg-muted/20'>
                                            <TableCell colSpan={2} className='text-left font-bold text-xs'>
                                                PRESENT DAYS
                                            </TableCell>
                                            <TableCell>{presAtt?.May ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.June ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.July ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.August ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.September ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.October ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.November ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.December ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.January ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.Febrauary ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.March ?? '-'}</TableCell>
                                            <TableCell>{presAtt?.April ?? '-'}</TableCell>
                                            <TableCell className='font-bold text-primary'>{presAtt?.TotalPresentDays ?? '-'}</TableCell>
                                            <TableCell className='font-bold text-primary'>
                                                {presAtt?.Total_Percentage ? `${presAtt.Total_Percentage}%` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Date of Issue */}
                            <div className='pt-1 font-semibold text-muted-foreground text-xs'>Date Of Issue : {formattedDate}</div>

                            {/* Signatures */}
                            <div className='footer-signatures grid grid-cols-3 gap-8 pt-14 text-center font-bold text-xs'>
                                <div className='signature-block border-t border-dashed pt-2'>
                                    Prepared by <br />
                                    <span className='font-normal text-[11px] text-muted-foreground'>stt. Exam Cell</span>
                                </div>
                                <div className='signature-block border-t border-dashed pt-2'>
                                    Checked by <br />
                                    <span className='font-normal text-[11px] text-muted-foreground'>Dy. COE</span>
                                </div>
                                <div className='signature-block border-t border-dashed pt-2'>Controller of Examination</div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
