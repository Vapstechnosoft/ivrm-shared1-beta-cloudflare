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

    const getTotalMaxMarks = (student: ICumulativeReport) => {
        if (student.estmP_Result === 'AB') return '';
        if (student.estmP_TotalMaxMarks != null && Number(student.estmP_TotalMaxMarks) > 0) {
            return student.estmP_TotalMaxMarks;
        }
        const validMax = student.sub_list?.reduce((acc, sub: any) => {
            const m = Number(sub.estmpS_MaxMarks ?? subjects.find((s) => s.ismS_Id === sub.ismS_Id)?.estmpS_MaxMarks);
            return acc + (!isNaN(m) && m > 0 ? m : 0);
        }, 0) ?? 0;
        if (validMax > 0) return validMax;

        const subjectsMax = subjects
            .filter((s) => s.eyceS_AplResultFlg !== false)
            .reduce((acc, s) => acc + (Number(s.estmpS_MaxMarks) || 0), 0);
        if (subjectsMax > 0) return subjectsMax;

        return (student.estmP_TotalMaxMarks != null && student.estmP_TotalMaxMarks !== 0 && student.estmP_TotalMaxMarks !== '0')
            ? student.estmP_TotalMaxMarks
            : '-';
    };

    const getTotalObtMarks = (student: ICumulativeReport) => {
        if (student.estmP_Result === 'AB') return '';
        if (student.estmP_TotalObtMarks != null && Number(student.estmP_TotalObtMarks) > 0) {
            return student.estmP_TotalObtMarks;
        }
        let hasMarks = false;
        const validObt = student.sub_list?.reduce((acc, sub: any) => {
            if (sub.estmpS_PassFailFlg === 'AB') return acc;
            const m = Number(sub.estmpS_ObtainedMarks);
            if (!isNaN(m)) {
                hasMarks = true;
                return acc + m;
            }
            return acc;
        }, 0) ?? 0;
        if (hasMarks) return validObt;
        return (student.estmP_TotalObtMarks != null && student.estmP_TotalObtMarks !== 0 && student.estmP_TotalObtMarks !== '0') ? student.estmP_TotalObtMarks : '-';
    };

    // ====================== EXCEL EXPORT FUNCTION ======================
    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const applicableSubjects = columnFlags.applicable
            ? subjects.filter((s) => s.eyceS_AplResultFlg !== false)
            : [];
        const nonApplicableSubjects = columnFlags.nonapplicable
            ? subjects.filter((s) => s.eyceS_AplResultFlg === false)
            : [];

        const finalApplicableSubjects =
            applicableSubjects.length > 0
                ? applicableSubjects
                : (columnFlags.applicable && !columnFlags.nonapplicable) ? subjects : [];

        const showBothSubj = columnFlags.marksdisplay && columnFlags.grdaeDisply;

        // Calculate total column span
        let totalCols = 2; // SL NO + STUDENT NAME
        if (columnFlags.admno) totalCols++;
        if (columnFlags.regno) totalCols++;
        if (columnFlags.rollno) totalCols++;

        finalApplicableSubjects.forEach((subj) => {
            totalCols += !showBothSubj ? 1 : 2;
        });

        totalCols += 2; // TOTAL + OBTAINED
        if (columnFlags.readmit) totalCols++;
        if (columnFlags.gradecolm) totalCols++;
        if (columnFlags.sectionrank) totalCols++;
        if (columnFlags.classrank) totalCols++;
        if (!columnFlags.attendancedispaly) totalCols += 2;
        if (columnFlags.status) totalCols++;

        nonApplicableSubjects.forEach((subj) => {
            totalCols += !showBothSubj ? 1 : 2;
        });

        // Build Excel Table HTML with guaranteed native center alignment & original colors
        let tableHtml = `
        <table border="1" style="border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; width: 100%;">
            <thead>
                <tr>
                    <th colspan="${totalCols}" align="center" style="text-align: center; font-size: 14pt; font-weight: bold; padding: 6px; border: none; background-color: #ffffff; color: #000000;">
                        ${(headerInfo.mI_Name || institution?.mI_Name || 'ALEXANDRA SCHOOL').toUpperCase()}
                    </th>
                </tr>
                <tr>
                    <th colspan="${totalCols}" align="center" style="text-align: center; font-size: 12pt; font-weight: bold; padding: 4px; border: none; background-color: #ffffff; color: #000000;">
                        CLASS WISE CUMULATIVE REPORT
                    </th>
                </tr>
                <tr>
                    <th colspan="${totalCols}" align="center" style="text-align: center; font-size: 11pt; font-weight: bold; padding: 3px; border: none; background-color: #ffffff; color: #000000;">
                        ACADEMIC YEAR : ${headerInfo.yr || ''}
                    </th>
                </tr>
                <tr>
                    <th colspan="${totalCols}" align="center" style="text-align: center; font-size: 11pt; font-weight: bold; padding: 3px; border: none; background-color: #ffffff; color: #000000;">
                        CLASS &amp; SEC : ${headerInfo.cla || ''} - ${headerInfo.sec || ''}
                    </th>
                </tr>
                <tr>
                    <th colspan="${totalCols}" align="center" style="text-align: center; font-size: 11pt; font-weight: bold; padding: 3px; border: none; background-color: #ffffff; color: #000000;">
                        EXAM : ${headerInfo.exmmid || ''}
                    </th>
                </tr>
                <tr>
                    <th colspan="${totalCols}" style="height: 10px; border: none; background-color: #ffffff;"></th>
                </tr>
        `;

        if (showBothSubj) {
            tableHtml += `<tr style="background-color: #D9EAD3; font-weight: bold; text-align: center;">
                <th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">SL NO</th>
                <th rowspan="2" align="left" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: left;">STUDENT NAME</th>`;

            if (columnFlags.admno) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">ADM NO</th>`;
            if (columnFlags.regno) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">REG NO</th>`;
            if (columnFlags.rollno) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">ROLL NO</th>`;

            finalApplicableSubjects.forEach((subj) => {
                tableHtml += `<th colspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">${subj.ismS_SubjectName?.toUpperCase()}</th>`;
            });

            tableHtml += `<th colspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">TOTAL</th>`;

            if (columnFlags.readmit) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">PERCENTAGE</th>`;
            if (columnFlags.gradecolm) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">OVER ALL GRADE</th>`;
            if (columnFlags.sectionrank) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">SECTION RANK</th>`;
            if (columnFlags.classrank) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">CLASS RANK</th>`;
            if (!columnFlags.attendancedispaly) {
                tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">CLASS HELD</th>
                              <th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">ATTENDANCE</th>`;
            }
            if (columnFlags.status) tableHtml += `<th rowspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">STATUS</th>`;

            nonApplicableSubjects.forEach((subj) => {
                tableHtml += `<th colspan="2" align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">${subj.ismS_SubjectName?.toUpperCase()}</th>`;
            });

            tableHtml += `</tr><tr style="background-color: #D9EAD3; font-weight: bold; text-align: center;">`;

            finalApplicableSubjects.forEach((subj) => {
                tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 4px; text-align: center;">MARKS</th>
                              <th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 4px; text-align: center;">GRADE</th>`;
            });

            tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 4px; text-align: center;">MAX</th>
                          <th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 4px; text-align: center;">OBTAINED</th>`;

            nonApplicableSubjects.forEach((subj) => {
                tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 4px; text-align: center;">MARKS</th>
                              <th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 4px; text-align: center;">GRADE</th>`;
            });

            tableHtml += `</tr>`;
        } else {
            tableHtml += `<tr style="background-color: #D9EAD3; font-weight: bold; text-align: center;">
                <th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">SL NO</th>
                <th align="left" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: left;">STUDENT NAME</th>`;

            if (columnFlags.admno) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">ADM NO</th>`;
            if (columnFlags.regno) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">REG NO</th>`;
            if (columnFlags.rollno) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">ROLL NO</th>`;

            finalApplicableSubjects.forEach((subj) => {
                tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">${getSubjectHeaderName(subj).toUpperCase()}</th>`;
            });

            tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">TOTAL</th>
                          <th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">OBTAINED</th>`;

            if (columnFlags.readmit) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">PERCENTAGE</th>`;
            if (columnFlags.gradecolm) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">OVER ALL GRADE</th>`;
            if (columnFlags.sectionrank) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">SECTION RANK</th>`;
            if (columnFlags.classrank) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">CLASS RANK</th>`;
            if (!columnFlags.attendancedispaly) {
                tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">CLASS HELD</th>
                              <th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">ATTENDANCE</th>`;
            }
            if (columnFlags.status) tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">STATUS</th>`;

            nonApplicableSubjects.forEach((subj) => {
                tableHtml += `<th align="center" style="background-color: #D9EAD3; border: 1px solid #000000; padding: 6px; text-align: center;">${getSubjectHeaderName(subj).toUpperCase()}</th>`;
            });

            tableHtml += `</tr>`;
        }

        tableHtml += `</thead><tbody>`;

        // Data rows
        reportData.forEach((student, idx) => {
            const isAbsent = student.estmP_Result === 'AB';
            tableHtml += `<tr>
                <td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${idx + 1}</td>
                <td align="left" style="text-align: left; border: 1px solid #000000; padding: 5px 8px;">${student.amsT_FirstName || 'Unknown'}</td>`;

            if (columnFlags.admno) tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${student.amsT_AdmNo ?? '-'}</td>`;
            if (columnFlags.regno) tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${student.amsT_RegistrationNo ?? '-'}</td>`;
            if (columnFlags.rollno) tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${student.amaY_RollNo ?? '-'}</td>`;

            // Applicable subjects
            finalApplicableSubjects.forEach((subj) => {
                const sub = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                const marks = sub?.estmpS_ObtainedMarks;
                const grade = sub?.estmpS_ObtainedGrade;
                const isAB = sub?.estmpS_PassFailFlg === 'AB';

                if (isAB) {
                    if (!showBothSubj) {
                        tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">AB</td>`;
                    } else {
                        tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">AB</td><td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">AB</td>`;
                    }
                } else if (showBothSubj) {
                    tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${marks ?? '-'}</td>
                                  <td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${grade ?? '-'}</td>`;
                } else if (columnFlags.grdaeDisply) {
                    tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${grade ?? '-'}</td>`;
                } else {
                    tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${marks ?? '-'}</td>`;
                }
            });

            // Totals
            tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${isAbsent ? '' : getTotalMaxMarks(student)}</td>
                          <td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${isAbsent ? '' : getTotalObtMarks(student)}</td>`;

            if (columnFlags.readmit) {
                tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${isAbsent || student.estmP_Percentage == null ? '-' : `${student.estmP_Percentage}`}</td>`;
            }
            if (columnFlags.gradecolm) {
                tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}</td>`;
            }
            if (columnFlags.sectionrank) {
                tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${isAbsent || student.estmP_SectionRank === '0' || student.estmP_SectionRank === 0 ? '' : (student.estmP_SectionRank ?? '-')}</td>`;
            }
            if (columnFlags.classrank) {
                tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${isAbsent || student.estmP_ClassRank === '0' || student.estmP_ClassRank === 0 ? '' : (student.estmP_ClassRank ?? '-')}</td>`;
            }
            if (!columnFlags.attendancedispaly) {
                tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${student.classheld ?? '-'}</td>
                              <td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${student.classatt ?? '-'}</td>`;
            }
            if (columnFlags.status) {
                tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${student.estmP_Result ?? '-'}</td>`;
            }

            // Non-applicable subjects
            nonApplicableSubjects.forEach((subj) => {
                const sub = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                const marks = sub?.estmpS_ObtainedMarks;
                const grade = sub?.estmpS_ObtainedGrade;
                const isAB = sub?.estmpS_PassFailFlg === 'AB';

                if (isAB) {
                    if (!showBothSubj) {
                        tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">AB</td>`;
                    } else {
                        tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">AB</td><td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">AB</td>`;
                    }
                } else if (showBothSubj) {
                    tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${marks ?? '-'}</td>
                                  <td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${grade ?? '-'}</td>`;
                } else if (columnFlags.grdaeDisply) {
                    tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${grade ?? '-'}</td>`;
                } else {
                    tableHtml += `<td align="center" style="text-align: center; border: 1px solid #000000; padding: 5px;">${marks ?? '-'}</td>`;
                }
            });

            tableHtml += `</tr>`;
        });

        tableHtml += `</tbody></table>`;

        const fullHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
            <xml>
            <x:ExcelWorkbook>
            <x:ExcelWorksheets>
            <x:ExcelWorksheet>
            <x:Name>Cumulative Report</x:Name>
            <x:WorksheetOptions>
            <x:DisplayGridlines/>
            </x:WorksheetOptions>
            </x:ExcelWorksheet>
            </x:ExcelWorksheets>
            </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        </head>
        <body>
            ${tableHtml}
        </body>
        </html>
        `;

        const fileName = `Cumulative_Report_${(headerInfo.cla || 'Class').replace(/[\/\\?%*:|"<>]/g, '_')}_${(headerInfo.sec || '').replace(
            /[\/\\?%*:|"<>]/g,
            '_'
        )}_${(headerInfo.exmmid || 'Exam').replace(/[\/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`;

        const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    const applicableSubjects = columnFlags.applicable
        ? subjects.filter((s) => s.eyceS_AplResultFlg !== false)
        : [];
    const nonApplicableSubjects = columnFlags.nonapplicable
        ? subjects.filter((s) => s.eyceS_AplResultFlg === false)
        : [];

    const finalApplicableSubjects =
        applicableSubjects.length > 0
            ? applicableSubjects
            : (columnFlags.applicable && !columnFlags.nonapplicable) ? subjects : [];

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
            <div className='mt-6 mb-4'>
                <div className='text-center space-y-1'>
                    <h3 className='text-xl md:text-2xl font-bold uppercase text-[#005ba4] tracking-wide'>
                        {headerInfo.mI_Name}
                    </h3>
                    <h5 className='text-sm md:text-base font-bold uppercase text-[#005ba4] tracking-wider'>
                        CLASS WISE CUMULATIVE REPORT
                    </h5>
                    <div className='mx-auto mt-2 w-fit text-left text-xs md:text-sm font-semibold uppercase text-gray-800'>
                        <div className='grid grid-cols-[auto_auto_1fr] items-center gap-x-2 gap-y-0.5'>
                            <span>ACADEMIC YEAR</span>
                            <span>:</span>
                            <span>{headerInfo.yr}</span>

                            <span>CLASS & SEC</span>
                            <span>:</span>
                            <span>{headerInfo.cla} - {headerInfo.sec}</span>

                            <span>EXAM</span>
                            <span>:</span>
                            <span>{headerInfo.exmmid}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table with Sticky Student Column */}
            <div className='overflow-x-auto border border-gray-300 shadow-sm rounded mt-4 relative'>
                <table className='w-full border-collapse text-sm'>
                        <thead>
                            <tr className='bg-[#005ba4] text-white text-xs md:text-sm font-bold uppercase'>
                                <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>Sl No</th>
                                <th className='sticky left-0 bg-[#005ba4] z-10 border border-white/20 px-4 py-2.5 whitespace-nowrap text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]'>
                                    Student Name
                                </th>
                                {columnFlags.admno && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>Adm No</th>}
                                {columnFlags.regno && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>Reg No</th>}
                                {columnFlags.rollno && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>Roll No</th>}

                                {finalApplicableSubjects.map((subj) => (
                                    <th key={subj.ismS_Id} className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center min-w-[76px]'>
                                        {getSubjectHeaderName(subj)}
                                    </th>
                                ))}
                                <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>TOTAL</th>
                                <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>OBTAINED</th>
                                {columnFlags.readmit && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>Percentage</th>}
                                {columnFlags.gradecolm && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>Over All Grade</th>}
                                {columnFlags.sectionrank && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>SECTION RANK</th>}
                                {columnFlags.classrank && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>CLASS RANK</th>}
                                {!columnFlags.attendancedispaly && (
                                    <>
                                        <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>CLASS HELD</th>
                                        <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>ATTENDANCE</th>
                                    </>
                                )}
                                {columnFlags.status && <th className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center'>STATUS</th>}
                                {nonApplicableSubjects.map((subj) => (
                                    <th key={subj.ismS_Id} className='border border-white/20 px-3 py-2.5 whitespace-nowrap text-center min-w-[76px]'>
                                        {(subj.ismS_SubjectName || '').toUpperCase()} (M | G)
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((student, idx) => {
                                const isAbsent = student.estmP_Result === 'AB';

                                return (
                                    <tr key={idx} className='hover:bg-blue-50/40 bg-white transition-colors'>
                                        <td className='border border-gray-300 px-3 py-2 text-center font-medium'>{idx + 1}</td>
                                        <td className='sticky left-0 bg-white z-10 border border-gray-300 px-4 py-2 text-left font-medium text-gray-900 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]'>
                                            {student.amsT_FirstName}
                                        </td>

                                        {columnFlags.admno && (
                                            <td className='border border-gray-300 px-3 py-2 text-center'>{student.amsT_AdmNo ?? '-'}</td>
                                        )}
                                        {columnFlags.regno && (
                                            <td className='border border-gray-300 px-3 py-2 text-center'>{student.amsT_RegistrationNo ?? '-'}</td>
                                        )}
                                        {columnFlags.rollno && (
                                            <td className='border border-gray-300 px-3 py-2 text-center'>{student.amaY_RollNo ?? '-'}</td>
                                        )}

                                        {/* Applicable Subjects */}
                                        {finalApplicableSubjects.map((subj) => (
                                            <td key={subj.ismS_Id} className='border border-gray-300 px-3 py-2 text-center font-medium text-gray-900'>
                                                {renderMarkCellContent(subj, student)}
                                            </td>
                                        ))}

                                        <td className='border border-gray-300 px-3 py-2 text-center font-medium text-gray-900'>
                                            {isAbsent ? '' : getTotalMaxMarks(student)}
                                        </td>
                                        <td className='border border-gray-300 px-3 py-2 text-center font-medium text-gray-900'>
                                            {isAbsent ? '' : getTotalObtMarks(student)}
                                        </td>
                                        {columnFlags.readmit && (
                                            <td className='border border-gray-300 px-3 py-2 text-center'>
                                                {isAbsent
                                                    ? '-'
                                                    : student.estmP_Percentage
                                                        ? `${student.estmP_Percentage}`
                                                        : '-'}
                                            </td>
                                        )}
                                        {columnFlags.gradecolm && (
                                            <td className='border border-gray-300 px-3 py-2 text-center'>
                                                {isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}
                                            </td>
                                        )}
                                        {columnFlags.sectionrank && (
                                            <td className='border border-gray-300 px-3 py-2 text-center font-semibold'>
                                                {isAbsent || student.estmP_SectionRank === '0' || student.estmP_SectionRank === 0 ? '' : (student.estmP_SectionRank ?? '-')}
                                            </td>
                                        )}
                                        {columnFlags.classrank && (
                                            <td className='border border-gray-300 px-3 py-2 text-center font-semibold'>
                                                {isAbsent || student.estmP_ClassRank === '0' || student.estmP_ClassRank === 0 ? '' : (student.estmP_ClassRank ?? '-')}
                                            </td>
                                        )}
                                        {!columnFlags.attendancedispaly && (
                                            <>
                                                <td className='border border-gray-300 px-3 py-2 text-center'>{student.classheld ?? '-'}</td>
                                                <td className='border border-gray-300 px-3 py-2 text-center'>{student.classatt ?? '-'}</td>
                                            </>
                                        )}
                                        {columnFlags.status && (
                                            <td className='border border-gray-300 px-3 py-2 text-center font-semibold'>
                                                <span className={student.estmP_Result === 'Pass' ? 'text-green-600' : 'text-red-600'}>
                                                    {student.estmP_Result ?? '-'}
                                                </span>
                                            </td>
                                        )}

                                        {/* Non-applicable Subjects */}
                                        {nonApplicableSubjects.map((subj) => (
                                            <td key={subj.ismS_Id} className='border border-gray-300 px-3 py-2 text-center font-medium text-gray-900'>
                                                {renderMarkCellContent(subj, student)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
            </div>
        </div>
    );
}
