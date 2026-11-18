'use client';

import { Button } from '@/components/ui/button';
import type { ICumulativeReport, IMasterInstitution, IReportHeader, ISubject, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheetIcon, Printer } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface CumulativeReportGridViewProps {
    reportData: ICumulativeReport[];
    institution: Institution | IMasterInstitution | null;
    subjects: ISubject[];
    headerInfo: Partial<IReportHeader>;
    columnFlags: {
        admno: boolean;
        regno: boolean;
        rollno: boolean;
        classrank: boolean;
        sectionrank: boolean;
        attendancedispaly: boolean;
        applicable: boolean;
        nonapplicable: boolean;
        readmit: boolean;
        grdaeDisply: boolean;
        marksdisplay: boolean;
        gradecolm: boolean;
        status: boolean;
    };
    onPrint: () => void;
    initialSize?: string;
}

export default function CumulativeReportGridView({
    reportData,
    institution,
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

    // Helper to get subject header text
    const getSubjectHeaderName = (subj: ISubject) => {
        const name = subj.ismS_SubjectName || '';
        const isEVS = name.toUpperCase().includes('EVS');
        if (isEVS) return name; // EVS always shows Marks & Grade

        const showMarks = columnFlags.marksdisplay;
        const showGrade = columnFlags.grdaeDisply;

        if (showMarks && showGrade) {
            return `${name} (M | G)`;
        } else if (showMarks) {
            return `${name} (M)`;
        } else if (showGrade) {
            return `${name} (G)`;
        }
        return name;
    };

    // ====================== EXCEL EXPORT FUNCTION ======================
    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const applicableSubjects = columnFlags.applicable ? subjects.filter((s) => s.eyceS_AplResultFlg) : [];
        const nonApplicableSubjects = columnFlags.nonapplicable ? subjects.filter((s) => !s.eyceS_AplResultFlg) : [];
        console.log('headerInfo: ', headerInfo);
        // Title rows
        const titleRows = [
            [institution?.mI_Name || ''],
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

        const showBothSubj = columnFlags.marksdisplay && columnFlags.grdaeDisply;

        // Applicable subjects
        applicableSubjects.forEach((subj) => {
            const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');
            if (isEVS || !showBothSubj) {
                mainHeaderRow.push(subj.ismS_SubjectName || '');
                subHeaderRow.push(columnFlags.marksdisplay ? 'Marks' : 'Grade');
            } else {
                mainHeaderRow.push(subj.ismS_SubjectName || '');
                mainHeaderRow.push('');
                subHeaderRow.push('Marks');
                subHeaderRow.push('Grade');
            }
        });

        // Total columns
        mainHeaderRow.push('Total', 'Obtained');
        subHeaderRow.push('Max', 'Marks');

        if (columnFlags.readmit) {
            mainHeaderRow.push('%');
            subHeaderRow.push('');
        }
        if (columnFlags.gradecolm) {
            mainHeaderRow.push('Grade');
            subHeaderRow.push('');
        }
        if (columnFlags.sectionrank) {
            mainHeaderRow.push('Section Rank');
            subHeaderRow.push('');
        }
        if (columnFlags.classrank) {
            mainHeaderRow.push('Class Rank');
            subHeaderRow.push('');
        }
        if (!columnFlags.attendancedispaly) {
            mainHeaderRow.push('Class Held', 'Attendance');
            subHeaderRow.push('', '');
        }
        if (columnFlags.status) {
            mainHeaderRow.push('Status');
            subHeaderRow.push('');
        }

        // Non-applicable subjects
        nonApplicableSubjects.forEach((subj) => {
            const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');
            if (isEVS || !showBothSubj) {
                mainHeaderRow.push(subj.ismS_SubjectName || '');
                subHeaderRow.push(columnFlags.marksdisplay ? 'Marks' : 'Grade');
            } else {
                mainHeaderRow.push(subj.ismS_SubjectName || '');
                mainHeaderRow.push('');
                subHeaderRow.push('Marks');
                subHeaderRow.push('Grade');
            }
        });

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
                const marks = sub?.estmpS_ObtainedMarks;
                const grade = sub?.estmpS_ObtainedGrade;
                const isAB = sub?.estmpS_PassFailFlg === 'AB';
                const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');

                if (isAB) {
                    if (isEVS || !showBothSubj) {
                        row.push('AB');
                    } else {
                        row.push('AB', 'AB');
                    }
                } else if (isEVS || !showBothSubj) {
                    if (columnFlags.marksdisplay && columnFlags.grdaeDisply) {
                        row.push(marks != null && grade != null ? `${marks} | ${grade}` : (marks ?? grade ?? ''));
                    } else if (columnFlags.marksdisplay) {
                        row.push(marks ?? '');
                    } else {
                        row.push(grade ?? '');
                    }
                } else {
                    row.push(marks ?? '');
                    row.push(grade ?? '');
                }
            });

            // Total columns
            row.push(isAbsent ? '' : (student.estmP_TotalMaxMarks ?? ''), isAbsent ? '' : (student.estmP_TotalObtMarks ?? ''));

            if (columnFlags.readmit) {
                row.push(isAbsent || student.estmP_Percentage == null ? '' : `${Number(student.estmP_Percentage).toFixed(2)}%`);
            }
            if (columnFlags.gradecolm) {
                row.push(isAbsent ? '' : (student.estmP_TotalGrade ?? ''));
            }
            if (columnFlags.sectionrank) {
                row.push(isAbsent ? '' : (student.estmP_SectionRank ?? ''));
            }
            if (columnFlags.classrank) {
                row.push(isAbsent ? '' : (student.estmP_ClassRank ?? ''));
            }
            if (!columnFlags.attendancedispaly) {
                row.push(student.classheld ?? '', student.classatt ?? '');
            }
            if (columnFlags.status) {
                row.push(student.estmP_Result ?? '');
            }

            // Non-applicable subjects
            nonApplicableSubjects.forEach((subj) => {
                const sub = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                const marks = sub?.estmpS_ObtainedMarks;
                const grade = sub?.estmpS_ObtainedGrade;
                const isAB = sub?.estmpS_PassFailFlg === 'AB';
                const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');

                if (isAB) {
                    if (isEVS || !showBothSubj) {
                        row.push('AB');
                    } else {
                        row.push('AB', 'AB');
                    }
                } else if (isEVS || !showBothSubj) {
                    if (columnFlags.marksdisplay && columnFlags.grdaeDisply) {
                        row.push(marks != null && grade != null ? `${marks} | ${grade}` : (marks ?? grade ?? ''));
                    } else if (columnFlags.marksdisplay) {
                        row.push(marks ?? '');
                    } else {
                        row.push(grade ?? '');
                    }
                } else {
                    row.push(marks ?? '');
                    row.push(grade ?? '');
                }
            });

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

        // Merge subject names (non-EVS / non-single-column)
        let currentCol = baseColumnsCount;
        [...applicableSubjects, ...nonApplicableSubjects].forEach((subj) => {
            const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');
            if (!isEVS && showBothSubj) {
                ws['!merges']!.push({
                    s: { r: titleRows.length, c: currentCol },
                    e: { r: titleRows.length, c: currentCol + 1 }
                });
                currentCol += 2;
            } else {
                currentCol += 1;
            }
        });

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

    console.log(columnFlags);

    // Subject marks cell renderer helper
    const renderMarkCellContent = (subj: ISubject, student: ICumulativeReport) => {
        const mark = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
        if (!mark) return '-';
        if (mark.estmpS_PassFailFlg === 'AB') {
            return <span className='font-bold text-red-600'>AB</span>;
        }

        const showMarks = columnFlags.marksdisplay;
        const showGrade = columnFlags.grdaeDisply;

        const marksVal = mark.estmpS_ObtainedMarks;
        const gradeVal = mark.estmpS_ObtainedGrade;

        const isEVS = subj.ismS_SubjectName?.toUpperCase().includes('EVS');

        if (isEVS) {
            if (marksVal != null && gradeVal) {
                return `${marksVal} | ${gradeVal}`;
            }
            return marksVal ?? gradeVal ?? '-';
        }

        if (showMarks && showGrade) {
            if (marksVal != null && gradeVal) {
                return `${marksVal} | ${gradeVal}`;
            }
            return marksVal ?? gradeVal ?? '-';
        } else if (showMarks) {
            return marksVal ?? '-';
        } else if (showGrade) {
            return gradeVal ?? '-';
        }
        return marksVal ?? gradeVal ?? '-';
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
                    <h3 className='text-blue-900 text-xl'>{headerInfo.mI_Name}</h3>
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
                                <th className='border border-blue-900 px-2 py-3'>Sl No</th>
                                <th className='border border-blue-900 px-4 py-3 text-left'>Student Name</th>
                                {columnFlags.rollno && <th className='border border-blue-900 px-3 py-3'>Roll No</th>}
                                {columnFlags.admno && <th className='border border-blue-900 px-3 py-3'>Admission No</th>}
                                {columnFlags.regno && <th className='border border-blue-900 px-3 py-3'>Registration No</th>}

                                {columnFlags.applicable &&
                                    subjects
                                        .filter((s) => s.eyceS_AplResultFlg)
                                        .map((subj) => (
                                            <th key={subj.ismS_Id} className='border border-blue-900 px-3 py-3'>
                                                {getSubjectHeaderName(subj)}
                                            </th>
                                        ))}
                                {columnFlags.nonapplicable &&
                                    subjects
                                        .filter((s) => !s.eyceS_AplResultFlg)
                                        .map((subj) => (
                                            <th key={subj.ismS_Id} className='border border-blue-900 px-3 py-3'>
                                                {subj.ismS_SubjectName} (M | G)
                                            </th>
                                        ))}
                                <th className='border border-blue-900 px-3 py-3'>Total</th>
                                <th className='border border-blue-900 px-3 py-3'>Obtained</th>
                                {columnFlags.readmit && <th className='border border-blue-900 px-3 py-3'>%</th>}
                                {columnFlags.gradecolm && <th className='border border-blue-900 px-3 py-3'>Over All Grade</th>}
                                {columnFlags.sectionrank && <th className='border border-blue-900 px-3 py-3'>Section Rank</th>}
                                {columnFlags.classrank && <th className='border border-blue-900 px-3 py-3'>Class Rank</th>}
                                {!columnFlags.attendancedispaly && (
                                    <>
                                        <th className='border border-blue-900 px-3 py-3'>Class Held</th>
                                        <th className='border border-blue-900 px-3 py-3'>Attendance</th>
                                    </>
                                )}
                                {columnFlags.status && <th className='border border-blue-900 px-3 py-3'>Status</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((student, idx) => {
                                const isAbsent = student.estmP_Result === 'AB';

                                return (
                                    <tr key={idx} className='hover:bg-gray-50'>
                                        <td className='border border-gray-400 px-2 py-2 text-center'>{idx + 1}</td>
                                        <td className='border border-gray-400 px-4 py-2 text-left'>{student.amsT_FirstName}</td>

                                        {columnFlags.rollno && (
                                            <td className='border border-gray-400 px-3 py-2 text-center'>{student.amaY_RollNo ?? '-'}</td>
                                        )}
                                        {columnFlags.admno && (
                                            <td className='border border-gray-400 px-3 py-2 text-center'>{student.amsT_AdmNo ?? '-'}</td>
                                        )}
                                        {columnFlags.regno && (
                                            <td className='border border-gray-400 px-3 py-2 text-center'>
                                                {student.amsT_RegistrationNo ?? '-'}
                                            </td>
                                        )}

                                        {/* Applicable Subjects */}
                                        {columnFlags.applicable &&
                                            subjects
                                                .filter((s) => s.eyceS_AplResultFlg)
                                                .map((subj) => (
                                                    <td key={subj.ismS_Id} className='border border-gray-400 py-2 text-center'>
                                                        {renderMarkCellContent(subj, student)}
                                                    </td>
                                                ))}

                                        {/* Non-applicable Subjects */}
                                        {columnFlags.nonapplicable &&
                                            subjects
                                                .filter((s) => !s.eyceS_AplResultFlg)
                                                .map((subj) => (
                                                    <td key={subj.ismS_Id} className='border border-gray-400 py-2 text-center'>
                                                        {renderMarkCellContent(subj, student)}
                                                    </td>
                                                ))}

                                        <td className='border border-gray-400 py-2 text-center'>
                                            {isAbsent ? '' : (student.estmP_TotalMaxMarks ?? '-')}
                                        </td>
                                        <td className='border border-gray-400 py-2 text-center'>
                                            {isAbsent ? '' : (student.estmP_TotalObtMarks ?? '-')}
                                        </td>
                                        {columnFlags.readmit && (
                                            <td className='border border-gray-400 py-2 text-center'>
                                                {isAbsent
                                                    ? '-'
                                                    : student.estmP_Percentage
                                                      ? `${Number(student.estmP_Percentage).toFixed(1)}%`
                                                      : '-'}
                                            </td>
                                        )}
                                        {columnFlags.gradecolm && (
                                            <td className='border border-gray-400 py-2 text-center'>
                                                {isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}
                                            </td>
                                        )}
                                        {columnFlags.sectionrank && (
                                            <td className='border border-gray-400 py-2 text-center font-semibold'>
                                                {isAbsent || student.estmP_SectionRank === '0' ? '' : (student.estmP_SectionRank ?? '-')}
                                            </td>
                                        )}
                                        {columnFlags.classrank && (
                                            <td className='border border-gray-400 py-2 text-center font-semibold'>
                                                {isAbsent || student.estmP_ClassRank === '0' ? '' : (student.estmP_ClassRank ?? '-')}
                                            </td>
                                        )}
                                        {!columnFlags.attendancedispaly && (
                                            <>
                                                <td className='border border-gray-400 py-2 text-center'>{student.classheld ?? '-'}</td>
                                                <td className='border border-gray-400 py-2 text-center'>{student.classatt ?? '-'}</td>
                                            </>
                                        )}
                                        {columnFlags.status && (
                                            <td className='border border-gray-400 py-2 text-center font-semibold'>
                                                <span className={student.estmP_Result === 'Pass' ? 'text-green-600' : 'text-red-600'}>
                                                    {student.estmP_Result ?? '-'}
                                                </span>
                                            </td>
                                        )}
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
