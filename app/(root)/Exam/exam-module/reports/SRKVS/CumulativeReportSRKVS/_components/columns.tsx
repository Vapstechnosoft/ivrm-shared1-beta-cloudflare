'use client';

import { Button } from '@/components/ui/button';
import type { ICumulativeReport, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { FileSpreadsheetIcon, Printer } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface CumulativeReportGridViewProps {
    reportData: ICumulativeReport[];
    subjects: ISubject[];
    headerInfo: Partial<IReportHeader>;
    columnFlags: {
        admno: boolean;
        regno: boolean;
        rollno: boolean;
        classrank: boolean;
        sectionrank: boolean;
        attendancedispaly: boolean;
    };
    onPrint: () => void;
    initialSize?: string;
}

export default function CumulativeReportGridView({
    reportData,
    subjects,
    headerInfo,
    columnFlags,
    onPrint,
    initialSize = '10'
}: CumulativeReportGridViewProps) {
    const [size, setSize] = useState(initialSize);

    const fontSizeClass =
        {
            '8': 'text-xs',
            '9': 'text-xs',
            '10': 'text-sm',
            '11': 'text-base',
            '12': 'text-base',
            '14': 'text-lg',
            '16': 'text-xl',
            '18': 'text-2xl',
            '20': 'text-3xl'
        }[size] || 'text-sm';

    // ====================== EXCEL EXPORT FUNCTION ======================
    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const applicableSubjects = subjects.filter((s) => s.eyceS_AplResultFlg);
        const nonApplicableSubjects = subjects.filter((s) => !s.eyceS_AplResultFlg);

        // Title rows
        const titleRows = [
            [headerInfo.mI_Name || 'VIDYA VIKASA VIDYA SAMSTHE (R)'],
            ['CLASS WISE CUMULATIVE REPORT'],
            [`Academic Year: ${headerInfo.yr || ''}`],
            [`Class & Section: ${headerInfo.cla || ''} - ${headerInfo.sec || ''}`],
            [`Exam: ${headerInfo.exmmid || ''}`],
            []
        ];

        // Base columns count
        const baseColumnsCount = 2 + (columnFlags.admno ? 1 : 0) + (columnFlags.regno ? 1 : 0) + (columnFlags.rollno ? 1 : 0);

        // Header rows
        const mainHeaderRow: any[] = ['Sl No', 'Student Name'];
        const subHeaderRow: any[] = ['', ''];

        if (columnFlags.admno) {
            mainHeaderRow.push('Adm No');
            subHeaderRow.push('');
        }
        if (columnFlags.regno) {
            mainHeaderRow.push('Reg No');
            subHeaderRow.push('');
        }
        if (columnFlags.rollno) {
            mainHeaderRow.push('Roll No');
            subHeaderRow.push('');
        }

        // Applicable subjects
        applicableSubjects.forEach((subj) => {
            mainHeaderRow.push(subj.ismS_SubjectName || '');
            subHeaderRow.push('G');
        });

        // Total columns
        mainHeaderRow.push('TOTAL', 'Grade', 'Percentage');
        subHeaderRow.push('', '', '');

        // Data rows
        const dataRows = reportData.map((student, idx) => {
            const isAbsent = student.estmP_Result === 'AB';
            const row: any[] = [idx + 1, student.amsT_FirstName || 'Unknown'];

            if (columnFlags.admno) row.push(student.amsT_AdmNo ?? '-');
            if (columnFlags.regno) row.push(student.amsT_RegistrationNo ?? '-');
            if (columnFlags.rollno) row.push(student.amaY_RollNo ?? '-');

            // Applicable subjects
            applicableSubjects.forEach((subj) => {
                const sub = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                const isAB = sub?.estmpS_PassFailFlg === 'AB';

                if (isAB) {
                    row.push('AB');
                } else {
                    row.push(sub?.estmpS_ObtainedGrade ?? '');
                }
            });

            // Total Columns
            row.push(
                isAbsent ? '' : (student.estmP_TotalObtMarks ?? ''),
                isAbsent ? '' : (student.estmP_TotalGrade ?? ''),
                isAbsent || student.estmP_Percentage == null ? '' : `${Number(student.estmP_Percentage).toFixed(2)}`
            );

            return row;
        });

        // Create worksheet
        const worksheetData = [...titleRows, mainHeaderRow, subHeaderRow, ...dataRows];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Column widths
        ws['!cols'] = mainHeaderRow.map((_, i) => ({ wch: i === 1 ? 30 : 14 }));

        // Merges
        ws['!merges'] = [];
        const totalCols = mainHeaderRow.length;

        // Merge title rows
        for (let i = 0; i < titleRows.length - 1; i++) {
            ws['!merges']!.push({ s: { r: i, c: 0 }, e: { r: i, c: totalCols - 1 } });
        }

        // No horizontal subject merges needed as there is only 1 column per subject
        // Just merge the rowSpan for base columns and total columns
        for (let i = 0; i < baseColumnsCount; i++) {
            ws['!merges']!.push({
                s: { r: titleRows.length, c: i },
                e: { r: titleRows.length + 1, c: i }
            });
        }

        const totalColsStart = baseColumnsCount + applicableSubjects.length;
        for (let i = 0; i < 3; i++) {
            ws['!merges']!.push({
                s: { r: titleRows.length, c: totalColsStart + i },
                e: { r: titleRows.length + 1, c: totalColsStart + i }
            });
        }

        // Styling
        const range = XLSX.utils.decode_range(ws['!ref']!);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) ws[cellAddress] = { v: '' };

                const isTitleRow = R < titleRows.length - 1;
                const isHeaderRow = R === titleRows.length || R === titleRows.length + 1;

                ws[cellAddress].s = {
                    font: { name: 'Calibri', sz: isTitleRow ? 16 : 11, bold: isTitleRow || isHeaderRow },
                    alignment: {
                        horizontal: isTitleRow || C === 1 ? (isTitleRow ? 'center' : 'left') : 'center',
                        vertical: 'center',
                        wrapText: true
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: 'FF000000' } },
                        bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                        left: { style: 'thin', color: { rgb: 'FF000000' } },
                        right: { style: 'thin', color: { rgb: 'FF000000' } }
                    }
                };

                if (isHeaderRow) {
                    ws[cellAddress].s.fill = {
                        patternType: 'solid',
                        fgColor: { rgb: 'FFD9EAD3' }
                    };
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Cumulative Report');

        const fileName = `Cumulative_Report_${(headerInfo.cla || 'Class').replace(/[\/\\?%*:|"<>]/g, '_')}_${(headerInfo.sec || '').replace(
            /[\/\\?%*:|"<>]/g,
            '_'
        )}_${(headerInfo.exmmid || 'Exam').replace(/[\/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className={`screen-only ${fontSizeClass}`}>
            {/* Font Size Selector */}
            <div className='form-group no-print mb-4 flex items-center gap-3'>
                <span className='control-label font-medium'>Font Size :</span>
                <select className='form-control rounded border px-3 py-1 text-sm' value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value=''>Select Font Size</option>
                    {[8, 9, 10, 11, 12, 14, 16, 18, 20].map((v) => (
                        <option key={v} value={v}>
                            {v}px
                        </option>
                    ))}
                </select>
            </div>

            {/* Header Bar - Print + Excel Buttons */}
            <div className='no-print flex items-center justify-between border-orange-400 border-b-2 bg-orange-100 px-4 py-2 text-sm'>
                <span style={{ fontSize: '25px', fontWeight: '600' }}>GRID VIEW</span>
                <div className='flex gap-2'>
                    <Button type='submit' onClick={onPrint} className='flex w-fit text-white hover:bg-orange-800'>
                        <Printer className='h-4 w-4' />
                        <span>PRINT</span>
                    </Button>

                    <Button type='submit' onClick={exportToExcel} className='w-fit text-white hover:bg-orange-800'>
                        <FileSpreadsheetIcon className='h-4 w-4' />
                        Export to Excel
                    </Button>
                </div>
            </div>

            {/* Report Header */}
            <div className='mt-6'>
                <div className='mb-4 text-center'>
                    <h3 className='text-blue-900 text-xl'>{headerInfo.mI_Name || 'VIDYA VIKASA VIDYA SAMSTHE (R)'}</h3>
                    <h5 className='mt-1 text-blue-800 text-lg'>CLASS WISE CUMULATIVE REPORT</h5>
                    <div className='mt-2'>
                        <strong>Academic Year :</strong> {headerInfo.yr}
                    </div>
                    <div className='-ml-12 md:-ml-16'>
                        <strong>Class & Sec :</strong> {headerInfo.cla} - {headerInfo.sec}
                    </div>
                    <div className='ml-20 md:ml-24'>
                        <strong>Exam :</strong> {headerInfo.exmmid}
                    </div>
                </div>

                {/* Table */}
                <div className='overflow-x-auto border-2 border-blue-800'>
                    <table className='w-full border-collapse'>
                        <thead>
                            <tr className='bg-blue-800 text-white'>
                                <th className='border border-blue-900 px-2 py-3' rowSpan={2}>
                                    Sl No
                                </th>
                                <th className='border border-blue-900 px-4 py-3 text-left' rowSpan={2}>
                                    Student Name
                                </th>
                                {columnFlags.admno && (
                                    <th className='border border-blue-900 px-3 py-3' rowSpan={2}>
                                        Adm No
                                    </th>
                                )}
                                {columnFlags.regno && (
                                    <th className='border border-blue-900 px-3 py-3' rowSpan={2}>
                                        Reg No
                                    </th>
                                )}
                                {columnFlags.rollno && (
                                    <th className='border border-blue-900 px-3 py-3' rowSpan={2}>
                                        Roll No
                                    </th>
                                )}
                                {subjects
                                    .filter((s) => s.eyceS_AplResultFlg)
                                    .map((subj) => (
                                        <th key={subj.ismS_Id} className='border border-blue-900 px-3 py-3 text-center'>
                                            {subj.ismS_SubjectName}
                                        </th>
                                    ))}
                                <th className='border border-blue-900 px-3 py-3 text-center' rowSpan={2}>
                                    TOTAL
                                </th>
                                <th className='border border-blue-900 px-3 py-3 text-center' rowSpan={2}>
                                    Grade
                                </th>
                                <th className='border border-blue-900 px-3 py-3 text-center' rowSpan={2}>
                                    Percentage
                                </th>
                            </tr>
                            <tr className='bg-blue-800 text-white'>
                                {subjects
                                    .filter((s) => s.eyceS_AplResultFlg)
                                    .map((subj) => (
                                        <th key={`g-${subj.ismS_Id}`} className='border border-blue-900 px-3 py-3 text-center'>
                                            G
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((student, idx) => {
                                const isAbsent = student.estmP_Result === 'AB';

                                return (
                                    <tr key={idx} className='hover:bg-gray-50'>
                                        <td className='border border-gray-400 px-2 py-2 text-center'>{idx + 1}</td>
                                        <td className='border border-gray-400 px-4 py-2 text-left'>{student.amsT_FirstName}</td>

                                        {columnFlags.admno && (
                                            <td className='border border-gray-400 px-3 py-2 text-center'>{student.amsT_AdmNo ?? '-'}</td>
                                        )}
                                        {columnFlags.regno && (
                                            <td className='border border-gray-400 px-3 py-2 text-center'>
                                                {student.amsT_RegistrationNo ?? '-'}
                                            </td>
                                        )}
                                        {columnFlags.rollno && (
                                            <td className='border border-gray-400 px-3 py-2 text-center'>{student.amaY_RollNo ?? '-'}</td>
                                        )}

                                        {subjects
                                            .filter((s) => s.eyceS_AplResultFlg)
                                            .map((subj) => {
                                                const mark = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                                                const isAB = mark?.estmpS_PassFailFlg === 'AB';

                                                return (
                                                    <td key={subj.ismS_Id} className='border border-gray-400 py-2 text-center'>
                                                        {isAB ? 'AB' : (mark?.estmpS_ObtainedGrade ?? '')}
                                                    </td>
                                                );
                                            })}

                                        <td className='border border-gray-400 py-2 text-center'>
                                            {isAbsent ? '' : (student.estmP_TotalObtMarks ?? '-')}
                                        </td>
                                        <td className='border border-gray-400 py-2 text-center'>
                                            {isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}
                                        </td>
                                        <td className='border border-gray-400 py-2 text-center'>
                                            {isAbsent
                                                ? '-'
                                                : student.estmP_Percentage
                                                  ? `${Number(student.estmP_Percentage).toFixed(2)}`
                                                  : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
