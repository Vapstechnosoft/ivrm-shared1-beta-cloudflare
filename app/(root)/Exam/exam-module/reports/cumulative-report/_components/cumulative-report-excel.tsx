// app/exam/cumulative-report/_components/cumulative-report-excel.tsx
'use client';

import { Button } from '@/components/ui/button';
import type { ICumulativeReport, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { Download } from 'lucide-react';

interface CumulativeReportExcelProps {
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
        applicable: boolean;
        nonapplicable: boolean;
        readmit: boolean;
        grdaeDisply: boolean;
        marksdisplay: boolean;
        gradecolm: boolean;
        status?: boolean;
    };
}

export default function CumulativeReportExcel({ reportData, subjects, headerInfo, columnFlags }: CumulativeReportExcelProps) {
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

    const exportToExcel = () => {
        if (!reportData.length) return;

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
                        ${(headerInfo.mI_Name || 'ALEXANDRA SCHOOL').toUpperCase()}
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

    return (
        <Button onClick={exportToExcel} size='sm' variant='outline' className='gap-2'>
            <Download className='h-4 w-4' />
            Export Excel
        </Button>
    );
}
