'use client';

import { getCalcuttaPromotionReportI_IX } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report-ix';
import { Download, Loader2, Printer } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';
import CalcuttaPromotionReportForm from './report-form';

export default function CalcuttaPromotionReportI_IXList() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState<any>(null);

    const filteredGroupwiseExamList =
        reportData?.groupwiseexamlist?.filter(
            (exam: any) => Number(exam.EME_Id) !== 98000012 && exam.examnamedisplay !== 'Highest in Class'
        ) || [];

    const handleGenerate = async (data: any) => {
        try {
            setLoading(true);
            setPayload(data);
            const result = await getCalcuttaPromotionReportI_IX(data);
            console.log('Report Data:', result);
            setReportData(result);
        } catch (error) {
            console.error('Failed to generate report', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        if (!reportData || !reportData.studentdetails || reportData.studentdetails.length === 0) return;

        const groups = reportData?.getgroupdetails || [];
        const sem1Name = groups[0]?.empG_DistplayName || 'SEMESTER 1';
        const sem2Name = groups[1]?.empG_DistplayName || 'SEMESTER 2';

        const rows: any[] = [];

        reportData.studentdetails.forEach((student: any) => {
            const studentId = student.AMST_Id || student.amsT_Id;
            const remarksObj = reportData.getpromotionremarksdetails?.find(
                (d: any) => Number(d.AMST_Id || d.amsT_Id) === Number(studentId)
            );
            const remarks = remarksObj?.eprD_Remarks ?? student.remarks ?? '';
            const conduct = remarksObj?.eprD_PromotionName ?? '';

            const sem1Exams =
                reportData.groupwiseexamlist?.filter(
                    (e: any) =>
                        (e.EMPG_DistplayName ?? e.empg_DistplayName ?? '').trim().toUpperCase() === sem1Name.trim().toUpperCase() &&
                        Number(e.EME_Id ?? e.eme_Id) !== 9800000 &&
                        Number(e.EME_Id ?? e.eme_Id) !== 98000012
                ) || [];
            const sem1RealExamId = sem1Exams[0]?.EME_Id ?? sem1Exams[0]?.eme_Id;

            const sem2Exams =
                reportData.groupwiseexamlist?.filter(
                    (e: any) =>
                        (e.EMPG_DistplayName ?? e.empg_DistplayName ?? '').trim().toUpperCase() === sem2Name.trim().toUpperCase() &&
                        Number(e.EME_Id ?? e.eme_Id) !== 9800000 &&
                        Number(e.EME_Id ?? e.eme_Id) !== 98000012
                ) || [];
            const sem2RealExamId = sem2Exams[0]?.EME_Id ?? sem2Exams[0]?.eme_Id;

            // Add Student Info Header
            rows.push({
                'Student Name': (
                    student.studentname || `${student.amsT_FirstName || ''} ${student.amsT_MiddleName || ''} ${student.amsT_LastName || ''}`
                ).toUpperCase(),
                Class: (student.classname || student.asmcL_ClassName || '').toUpperCase(),
                Section: (student.sectionname || student.asmC_SectionName || '').toUpperCase(),
                'Roll No': student.rollno || student.amaY_RollNo || '',
                'Scholar No': student.admno || student.amsT_AdmNo || '',
                Subject: '',
                [sem1Name.toUpperCase()]: '',
                [`Total [100] (${sem1Name})`]: '',
                [sem2Name.toUpperCase()]: '',
                [`Total [100] (${sem2Name})`]: '',
                'Grand Total [200]': '',
                'Yearly Avg': ''
            });

            const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                return appToResult === true || appToResult === 'true';
            });

            // Group map for subjects
            const groupMap: { [key: string]: any[] } = {};
            applicableSubjects.forEach((subj: any) => {
                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                const isGrouped =
                    subj.GropuFlag === 1 ||
                    subj.GropuFlag === '1' ||
                    subj.GropuFlag === true ||
                    subj.GropuFlag === 'true' ||
                    subj.gropuFlag === 1 ||
                    subj.gropuFlag === '1' ||
                    subj.gropuFlag === true ||
                    subj.gropuFlag === 'true';
                if (isGrouped && groupName) {
                    const trimmed = groupName.trim();
                    if (!groupMap[trimmed]) {
                        groupMap[trimmed] = [];
                    }
                    groupMap[trimmed].push(subj);
                }
            });

            const subjRowSpanMap = new Map<number, number>();
            applicableSubjects.forEach((subj: any) => {
                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                const isGrouped =
                    subj.GropuFlag === 1 ||
                    subj.GropuFlag === '1' ||
                    subj.GropuFlag === true ||
                    subj.GropuFlag === 'true' ||
                    subj.gropuFlag === 1 ||
                    subj.gropuFlag === '1' ||
                    subj.gropuFlag === true ||
                    subj.gropuFlag === 'true';
                const currentSubjId = subj.ISMS_Id ?? subj.ismS_Id;

                if (isGrouped && groupName) {
                    const trimmed = groupName.trim();
                    const groupSubjs = groupMap[trimmed];
                    groupSubjs.sort((a, b) => (a.grporder ?? 0) - (b.grporder ?? 0));
                    const firstSubj = groupSubjs[0];
                    const firstSubjId = firstSubj.ISMS_Id ?? firstSubj.ismS_Id;

                    if (Number(currentSubjId) === Number(firstSubjId)) {
                        subjRowSpanMap.set(currentSubjId, groupSubjs.length);
                    } else {
                        subjRowSpanMap.set(currentSubjId, -1);
                    }
                } else {
                    subjRowSpanMap.set(currentSubjId, 1);
                }
            });

            applicableSubjects.forEach((subj: any) => {
                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                const isGradeOnly =
                    (subj.eyceS_GradeDisplayFlg === 'true' ||
                        subj.eyceS_GradeDisplayFlg === true ||
                        subj.EYCES_GradeDisplayFlg === 'true' ||
                        subj.EYCES_GradeDisplayFlg === true) &&
                    !(
                        subj.eyceS_MarksDisplayFlg === 'true' ||
                        subj.eyceS_MarksDisplayFlg === true ||
                        subj.EYCES_MarksDisplayFlg === 'true' ||
                        subj.EYCES_MarksDisplayFlg === true
                    );

                const sem1MarksObj = getSubjectSemesterMarks(student, subjId, sem1Name, sem1RealExamId);
                const sem1GroupObj = getSemesterGroupTotal(student, groupMap, subj, sem1Name, sem1RealExamId);
                const sem2MarksObj = getSubjectSemesterMarks(student, subjId, sem2Name, sem2RealExamId);
                const sem2GroupObj = getSemesterGroupTotal(student, groupMap, subj, sem2Name, sem2RealExamId);

                let grandObt: number | string | null = null;
                let grandMax = 0;
                if (sem1GroupObj.obtained !== null || sem2GroupObj.obtained !== null) {
                    if (typeof sem1GroupObj.obtained === 'number' || typeof sem2GroupObj.obtained === 'number') {
                        grandObt = (Number(sem1GroupObj.obtained) || 0) + (Number(sem2GroupObj.obtained) || 0);
                    } else if (sem1GroupObj.obtained === 'AB' && sem2GroupObj.obtained === 'AB') {
                        grandObt = 'AB';
                    }
                    grandMax = sem1GroupObj.max + sem2GroupObj.max;
                }

                let yearlyAvgObt: number | string | null = null;
                if (grandObt !== null) {
                    if (typeof grandObt === 'number') {
                        const val = grandObt / 2;
                        yearlyAvgObt = val % 1 === 0 ? val : Number(val.toFixed(1));
                    } else {
                        yearlyAvgObt = grandObt;
                    }
                }

                const sem1Display = isGradeOnly
                    ? '-'
                    : sem1MarksObj && sem1MarksObj.obtained !== null && sem1MarksObj.obtained !== undefined
                      ? typeof sem1MarksObj.obtained === 'number' && Number(sem1MarksObj.max) === 50
                          ? `${sem1MarksObj.obtained} / 50`
                          : sem1MarksObj.obtained
                      : '-';

                const sem1GroupDisplay = isGradeOnly
                    ? getSubjectSemesterGrade(student, subjId, sem1Name)
                    : sem1GroupObj.obtained !== null && sem1GroupObj.obtained !== undefined
                      ? typeof sem1GroupObj.obtained === 'number' && Number(sem1GroupObj.max) === 50
                          ? `${sem1GroupObj.obtained} / 50`
                          : sem1GroupObj.obtained
                      : '-';

                const sem2Display = isGradeOnly
                    ? '-'
                    : sem2MarksObj && sem2MarksObj.obtained !== null && sem2MarksObj.obtained !== undefined
                      ? typeof sem2MarksObj.obtained === 'number' && Number(sem2MarksObj.max) === 50
                          ? `${sem2MarksObj.obtained} / 50`
                          : sem2MarksObj.obtained
                      : '-';

                const sem2GroupDisplay = isGradeOnly
                    ? getSubjectSemesterGrade(student, subjId, sem2Name)
                    : sem2GroupObj.obtained !== null && sem2GroupObj.obtained !== undefined
                      ? typeof sem2GroupObj.obtained === 'number' && Number(sem2GroupObj.max) === 50
                          ? `${sem2GroupObj.obtained} / 50`
                          : sem2GroupObj.obtained
                      : '-';

                const grandDisplay = isGradeOnly
                    ? '-'
                    : grandObt !== null && grandObt !== undefined
                      ? typeof grandObt === 'number' && grandMax === 100
                          ? `${grandObt} /100`
                          : grandObt
                      : '-';

                rows.push({
                    'Student Name': '',
                    Class: '',
                    Section: '',
                    'Roll No': '',
                    'Scholar No': '',
                    Subject: subj.ISMS_SubjectName || subj.ismS_SubjectName,
                    [sem1Name.toUpperCase()]: sem1Display,
                    [`Total [100] (${sem1Name})`]: sem1GroupDisplay,
                    [sem2Name.toUpperCase()]: sem2Display,
                    [`Total [100] (${sem2Name})`]: sem2GroupDisplay,
                    'Grand Total [200]': grandDisplay,
                    'Yearly Avg': isGradeOnly ? '-' : (yearlyAvgObt ?? '-')
                });
            });

            // Scholastic calculations for Excel TOTAL & PERCENTAGE rows
            const scholasticSubjects = applicableSubjects.filter((subj: any) => {
                const isGradeOnly =
                    (subj.eyceS_GradeDisplayFlg === 'true' ||
                        subj.eyceS_GradeDisplayFlg === true ||
                        subj.EYCES_GradeDisplayFlg === 'true' ||
                        subj.EYCES_GradeDisplayFlg === true) &&
                    !(
                        subj.eyceS_MarksDisplayFlg === 'true' ||
                        subj.eyceS_MarksDisplayFlg === true ||
                        subj.EYCES_MarksDisplayFlg === 'true' ||
                        subj.EYCES_MarksDisplayFlg === true
                    );
                return !isGradeOnly;
            });

            let sem1TotalObt = 0;
            let sem1TotalMax = 0;
            let sem2TotalObt = 0;
            let sem2TotalMax = 0;

            scholasticSubjects.forEach((subj: any) => {
                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                const rowSpan = subjRowSpanMap.get(subjId);
                if (rowSpan !== undefined && rowSpan === -1) return;

                const sem1Group = getSemesterGroupTotal(student, groupMap, subj, sem1Name, sem1RealExamId);
                if (sem1Group && typeof sem1Group.obtained === 'number') {
                    sem1TotalObt += sem1Group.obtained;
                    sem1TotalMax += sem1Group.max;
                }

                const sem2Group = getSemesterGroupTotal(student, groupMap, subj, sem2Name, sem2RealExamId);
                if (sem2Group && typeof sem2Group.obtained === 'number') {
                    sem2TotalObt += sem2Group.obtained;
                    sem2TotalMax += sem2Group.max;
                }
            });

            const grandTotalObt = sem1TotalObt + sem2TotalObt;
            const grandTotalMax = sem1TotalMax + sem2TotalMax;
            const yearlyAvgObtSum = Math.round(grandTotalObt / 2);
            const yearlyAvgMaxSum = Math.round(grandTotalMax / 2);

            const sem1Percentage = sem1TotalMax > 0 ? Math.round((sem1TotalObt / sem1TotalMax) * 100) : 0;
            const sem2Percentage = sem2TotalMax > 0 ? Math.round((sem2TotalObt / sem2TotalMax) * 100) : 0;
            const grandPercentage = grandTotalMax > 0 ? Math.round((grandTotalObt / grandTotalMax) * 100) : 0;
            const yearlyPercentage = yearlyAvgMaxSum > 0 ? Math.round((yearlyAvgObtSum / yearlyAvgMaxSum) * 100) : 0;

            // Total row
            rows.push({
                'Student Name': '',
                Class: '',
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: 'TOTAL',
                [sem1Name.toUpperCase()]: '',
                [`Total [100] (${sem1Name})`]: sem1TotalMax > 0 ? `${sem1TotalObt}/${sem1TotalMax}` : '-',
                [sem2Name.toUpperCase()]: '',
                [`Total [100] (${sem2Name})`]: sem2TotalMax > 0 ? `${sem2TotalObt}/${sem2TotalMax}` : '-',
                'Grand Total [200]': grandTotalMax > 0 ? `${grandTotalObt}/${grandTotalMax}` : '-',
                'Yearly Avg': yearlyAvgMaxSum > 0 ? `${yearlyAvgObtSum}/${yearlyAvgMaxSum}` : '-'
            });

            // Percentage row
            rows.push({
                'Student Name': '',
                Class: '',
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: 'PERCENTAGE',
                [sem1Name.toUpperCase()]: '',
                [`Total [100] (${sem1Name})`]: sem1TotalMax > 0 ? `${sem1Percentage}%` : '-',
                [sem2Name.toUpperCase()]: '',
                [`Total [100] (${sem2Name})`]: sem2TotalMax > 0 ? `${sem2Percentage}%` : '-',
                'Grand Total [200]': grandTotalMax > 0 ? `${grandPercentage}%` : '-',
                'Yearly Avg': yearlyAvgMaxSum > 0 ? `${yearlyPercentage}%` : '-'
            });

            // Attendance row
            const att1 = student.attendance?.find((a: any) => a.term?.trim().toUpperCase() === sem1Name.trim().toUpperCase());
            const att2 = student.attendance?.find((a: any) => a.term?.trim().toUpperCase() === sem2Name.trim().toUpperCase());
            const attAvg = student.attendance?.find((a: any) => a.term?.trim().toUpperCase() === 'ATT_AVERAGE');

            rows.push({
                'Student Name': '',
                Class: '',
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: 'ATTENDANCE',
                [sem1Name.toUpperCase()]: '',
                [`Total [100] (${sem1Name})`]:
                    att1?.percentage !== undefined && att1?.percentage !== null && att1?.percentage !== '' ? `${att1.percentage}%` : '-',
                [sem2Name.toUpperCase()]: '',
                [`Total [100] (${sem2Name})`]:
                    att2?.percentage !== undefined && att2?.percentage !== null && att2?.percentage !== '' ? `${att2.percentage}%` : '-',
                'Grand Total [200]':
                    attAvg?.percentage !== undefined && attAvg?.percentage !== null && attAvg?.percentage !== ''
                        ? `${attAvg.percentage}%`
                        : '-',
                'Yearly Avg':
                    attAvg?.percentage !== undefined && attAvg?.percentage !== null && attAvg?.percentage !== ''
                        ? `${attAvg.percentage}%`
                        : '-'
            });

            // Remarks row
            rows.push({
                'Student Name': `Remarks: ${remarks}`,
                Class: `Conduct: ${conduct}`,
                Section: '',
                'Roll No': '',
                'Scholar No': '',
                Subject: '',
                [sem1Name.toUpperCase()]: '',
                [`Total [100] (${sem1Name})`]: '',
                [sem2Name.toUpperCase()]: '',
                [`Total [100] (${sem2Name})`]: '',
                'Grand Total [200]': '',
                'Yearly Avg': ''
            });

            // Empty spacer row
            rows.push({});
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotion Report');
        XLSX.writeFile(workbook, `Calcutta_PromotionReport_I_X.xlsx`);
    };

    // Helper to format Date
    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB'); // dd/MM/yyyy
    };

    // Helper to get semester marks for a single subject
    const getSubjectSemesterMarks = (student: any, subjId: number, grpName: string, emeId?: number) => {
        const targetEmeId = emeId ?? 9800000;
        const rec = student.studentmarks?.find((m: any) => {
            const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
            const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
            const mGrp = (
                m.EMPSG_DisplayName ??
                m.empsG_DisplayName ??
                m.EMPSG_GroupName ??
                m.empG_GroupName ??
                m.empsg_DisplayName ??
                m.empsg_GroupName ??
                ''
            )
                ?.trim()
                .toUpperCase();
            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === Number(targetEmeId) && mGrp === grpName.trim().toUpperCase();
        });

        if (rec) {
            const passFail = rec.PassFailFlag ?? rec.passFailFlag;
            const isAbsent = ['AB', 'M', 'L'].includes(passFail);
            return {
                obtained: isAbsent ? passFail : Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? 0),
                max: Number(rec.maxMarks ?? rec.maxmarks ?? rec.maxMarks ?? rec.EMPS_MaxMarks ?? 100)
            };
        }

        return null;
    };

    // Helper to get semester total for a group (Average of subjects in group)
    const getSemesterGroupTotal = (student: any, groupMap: any, subj: any, grpName: string, emeId?: number) => {
        const isSubjGrouped =
            subj.GropuFlag === 1 ||
            subj.GropuFlag === '1' ||
            subj.GropuFlag === true ||
            subj.GropuFlag === 'true' ||
            subj.gropuFlag === 1 ||
            subj.gropuFlag === '1' ||
            subj.gropuFlag === true ||
            subj.gropuFlag === 'true';
        const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;

        if (isSubjGrouped && groupName) {
            const subjsInGroup = groupMap[groupName.trim()] || [];
            let sumObt = 0;
            let sumMax = 0;
            let count = 0;
            let allAbsent = true;

            subjsInGroup.forEach((s: any) => {
                const sId = s.ISMS_Id ?? s.ismS_Id ?? s.isms_Id ?? s.isms_id;
                const marks = getSubjectSemesterMarks(student, sId, grpName, emeId);
                if (marks) {
                    if (typeof marks.obtained === 'number') {
                        sumObt += marks.obtained;
                        allAbsent = false;
                    }
                    sumMax += marks.max;
                    count++;
                }
            });

            if (count === 0) return { obtained: null, max: 0 };
            return {
                obtained: allAbsent ? 'AB' : Math.round(sumObt / count),
                max: Math.round(sumMax / count)
            };
        } else {
            const sId = subj.ISMS_Id ?? subj.ismS_Id ?? subj.isms_Id ?? subj.isms_id;
            const marks = getSubjectSemesterMarks(student, sId, grpName, emeId);
            return {
                obtained: marks?.obtained ?? null,
                max: marks?.max ?? 0
            };
        }
    };

    const getSubjectSemesterGrade = (student: any, subjId: number, grpName: string) => {
        const rec = student.studentmarks?.find((m: any) => {
            const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
            const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
            const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '')?.trim().toUpperCase();
            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === 9800000 && mGrp === grpName.trim().toUpperCase();
        });
        return rec?.obtainedGrade ?? rec?.ObtainedGrade ?? rec?.obtainedgrade ?? rec?.Obtainedgrade ?? '-';
    };

    const getStudentTermTotal = (student: any, termName: string) => {
        const mr = student.student_marks?.find((m: any) => {
            const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
            const mGrp = (
                m.EMPSG_DisplayName ??
                m.empsG_DisplayName ??
                m.EMPSG_GroupName ??
                m.empG_GroupName ??
                m.empsg_DisplayName ??
                m.empsg_GroupName ??
                ''
            )
                ?.trim()
                .toUpperCase();
            return Number(mEmeId) === 9800000 && mGrp === termName.trim().toUpperCase();
        });

        if (mr) {
            const obt = mr.ObtainedMarks ?? mr.obtainedMarks ?? 0;
            const max = mr.maxmarks ?? mr.maxMarks ?? 0;
            const pct = mr.TotalPercentage ?? mr.totalPercentage ?? 0;
            return {
                obtained: obt,
                max: max,
                percentage: pct
            };
        }
        return null;
    };

    const getStudentGradeListRow = (studentId: number) => {
        return reportData?.getgradelist?.find((dd: any) => Number(dd.AMST_Id ?? dd.amsT_Id) === Number(studentId));
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='print:hidden'>
                <CalcuttaPromotionReportForm onSuccess={handleGenerate} />
            </div>

            {loading && (
                <div className='flex h-64 items-center justify-center rounded-md border bg-card print:hidden'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            )}

            {!loading && reportData && reportData.studentdetails?.length > 0 && (
                <div className='rounded-md border bg-card p-4 print:border-none print:bg-transparent print:p-0'>
                    <div className='mb-4 flex items-center justify-end gap-2 print:hidden'>
                        <button
                            onClick={handleExport}
                            className='inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm hover:bg-accent hover:text-accent-foreground'>
                            <Download className='h-4 w-4' />
                            Export Excel
                        </button>
                        <button
                            onClick={handlePrint}
                            className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-sm hover:bg-primary/90'>
                            <Printer className='h-4 w-4' />
                            Print
                        </button>
                    </div>

                    <div className='printable-content text-black'>
                        <style
                            dangerouslySetInnerHTML={{
                                __html: `
                            .printable-content {
                                color: black !important;
                                background-color: white !important;
                            }
                            .margin-top-200 { margin-top: 200px !important; }
                            .margin-top-100 { margin-top: 100px !important; }
                            .padding-top-10 { padding-top: 10px !important; }
                            .padding-top-5 { padding-top: 5px !important; }
                            
                            .row {
                                display: flex;
                                flex-wrap: wrap;
                                margin-right: -15px;
                                margin-left: -15px;
                            }
                            .col-sm-4, .col-sm-6, .col-sm-7, .col-sm-8 {
                                position: relative;
                                width: 100%;
                                min-height: 1px;
                                padding-right: 15px;
                                padding-left: 15px;
                                box-sizing: border-box;
                            }
                            @media (min-width: 768px) {
                                .col-sm-6 {
                                    flex: 0 0 50%;
                                    max-width: 50%;
                                }
                                .col-sm-4 {
                                    flex: 0 0 33.333333%;
                                    max-width: 33.333333%;
                                }
                                .col-sm-7 {
                                    flex: 0 0 58.333333%;
                                    max-width: 58.333333%;
                                }
                                .col-sm-8 {
                                    flex: 0 0 66.666667%;
                                    max-width: 66.666667%;
                                }
                            }

                            .table {
                                width: 100% !important;
                                max-width: 100% !important;
                                margin-bottom: 20px !important;
                                border-collapse: collapse !important;
                            }
                            .table-bordered th, .table-bordered td {
                                border: 0.5px solid black !important;
                                padding: 4px !important;
                                vertical-align: middle !important;
                            }
                            .text-center { text-align: center !important; }
                            .text-left { text-align: left !important; }
                            .text-right { text-align: right !important; }

                            @media print {
                                body {
                                    font-family: system-ui, -apple-system, sans-serif !important;
                                    background-color: white !important;
                                    color: black !important;
                                }
                                .printable-content {
                                    padding: 0 !important;
                                }
                                .page-break {
                                    page-break-after: always !important;
                                    width: 98% !important;
                                    max-width: 98% !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                }
                                table {
                                    -webkit-print-color-adjust: exact;
                                    color-adjust: exact;
                                }
                                td[style*="background-color:gray"], th[style*="background-color:gray"] {
                                    background-color: gray !important;
                                    -webkit-print-color-adjust: exact;
                                    color-adjust: exact;
                                }
                            }
                        `
                            }}
                        />

                        {reportData.studentdetails.map((report: any, index: number) => {
                            // Extract student information
                            const studentName =
                                report.studentname ??
                                report.studentName ??
                                `${report.amsT_FirstName ?? report.AMST_FirstName ?? ''} ${report.amsT_MiddleName ?? report.AMST_MiddleName ?? ''} ${report.amsT_LastName ?? report.AMST_LastName ?? ''}`.trim();
                            const admNo = report.admno ?? report.admNo ?? report.amsT_AdmNo ?? report.AMST_AdmNo ?? '';
                            const className =
                                report.classname ?? report.className ?? report.asmcL_ClassName ?? report.ASMCL_ClassName ?? '';
                            const sectionName =
                                report.sectionname ?? report.sectionName ?? report.asmC_SectionName ?? report.ASMC_SectionName ?? '';
                            const rollNo = report.rollno ?? report.rollNo ?? report.amaY_RollNo ?? report.AMAY_RollNo ?? '';
                            const photoName = report.AMST_Photoname ?? report.amsT_Photoname ?? report.AMST_Photoname ?? '';

                            return (
                                <div
                                    key={index}
                                    className={`page-break mx-auto w-[98%] max-w-[98%] bg-white p-4 font-sans ${index < reportData.studentdetails.length - 1 ? 'mb-8' : ''}`}>
                                    {/* Student Header Table */}
                                    <table className='table-bordered table' style={{ width: '100%', fontFamily: 'system-ui' }}>
                                        <caption style={{ position: 'relative', top: '17px', captionSide: 'top' }} className='text-center'>
                                            <label
                                                style={{
                                                    fontFamily: 'system-ui',
                                                    border: '0.5px solid black',
                                                    backgroundColor: 'white',
                                                    fontSize: '23px',
                                                    display: 'inline-block'
                                                }}>
                                                {'\u2003\u2003\u2003\u2003ACADEMIC SESSION ' +
                                                    (payload?.academicYearStr || '') +
                                                    '\u2003\u2003\u2003\u2003'}
                                            </label>
                                        </caption>
                                        <tbody>
                                            <tr>
                                                <td style={{ border: '0.5px solid black', width: '100%' }}>
                                                    <div className='row'>
                                                        <div className='col-sm-6 text-left'>
                                                            <div className='row'>
                                                                <div className='padding-top-10 col-sm-4'>
                                                                    <b>Student's Name </b>
                                                                </div>
                                                                <div className='padding-top-10 col-sm-7'>: {studentName}</div>
                                                                <div className='padding-top-10 col-sm-4'>
                                                                    {' '}
                                                                    <b>Scholar No.</b>
                                                                </div>
                                                                <div className='padding-top-10 col-sm-7'>: {admNo}</div>
                                                                <div className='padding-top-10 col-sm-4'>
                                                                    <b>Total Students</b>{' '}
                                                                </div>
                                                                <div className='padding-top-10 col-sm-7'>
                                                                    : {reportData.studentdetails.length}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='col-sm-6 text-left'>
                                                            <div className='row'>
                                                                <div className='col-sm-8'>
                                                                    <div className='row'>
                                                                        <div className='padding-top-10 col-sm-6'>
                                                                            <b>Class & sec</b>
                                                                        </div>
                                                                        <div className='padding-top-10 col-sm-6'>
                                                                            : {className}-{sectionName}
                                                                        </div>
                                                                        <div className='padding-top-10 col-sm-6'>
                                                                            <b>Roll No</b>
                                                                        </div>
                                                                        <div className='padding-top-10 col-sm-6'>: {rollNo}</div>
                                                                    </div>
                                                                </div>
                                                                <div className='col-sm-4 text-right' style={{ height: '100px' }}>
                                                                    {photoName ? (
                                                                        <img
                                                                            src={photoName}
                                                                            alt='Student Img'
                                                                            style={{
                                                                                width: '100px',
                                                                                height: '100px',
                                                                                objectFit: 'contain',
                                                                                display: 'inline-block'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            style={{
                                                                                width: '100px',
                                                                                height: '100px',
                                                                                border: '1px solid #ccc',
                                                                                display: 'inline-block'
                                                                            }}></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Scholastic Table */}
                                    {(() => {
                                        const studentId = report.AMST_Id || report.amsT_Id;
                                        const remarksObj = reportData.getpromotionremarksdetails?.find(
                                            (d: any) => Number(d.AMST_Id || d.amsT_Id) === Number(studentId)
                                        );
                                        const remarks =
                                            remarksObj?.eprD_Remarks ??
                                            remarksObj?.eprd_Remarks ??
                                            remarksObj?.eprd_remarks ??
                                            remarksObj?.EPRD_Remarks ??
                                            remarksObj?.remarks ??
                                            remarksObj?.Remarks ??
                                            report.remarks ??
                                            '-';
                                        const conduct =
                                            remarksObj?.eprD_PromotionName ??
                                            remarksObj?.eprd_PromotionName ??
                                            remarksObj?.eprd_promotionname ??
                                            '';

                                        const groups = reportData?.getgroupdetails || [];
                                        const sem1Name = groups[0]?.empG_DistplayName || 'SEMESTER 1';
                                        const sem2Name = groups[1]?.empG_DistplayName || 'SEMESTER 2';

                                        const sem1Exams =
                                            reportData.groupwiseexamlist?.filter(
                                                (e: any) =>
                                                    (e.EMPG_DistplayName ?? e.empg_DistplayName ?? '').trim().toUpperCase() ===
                                                        sem1Name.trim().toUpperCase() &&
                                                    Number(e.EME_Id ?? e.eme_Id) !== 9800000 &&
                                                    Number(e.EME_Id ?? e.eme_Id) !== 98000012
                                            ) || [];
                                        const sem1RealExamId = sem1Exams[0]?.EME_Id ?? sem1Exams[0]?.eme_Id;

                                        const sem2Exams =
                                            reportData.groupwiseexamlist?.filter(
                                                (e: any) =>
                                                    (e.EMPG_DistplayName ?? e.empg_DistplayName ?? '').trim().toUpperCase() ===
                                                        sem2Name.trim().toUpperCase() &&
                                                    Number(e.EME_Id ?? e.eme_Id) !== 9800000 &&
                                                    Number(e.EME_Id ?? e.eme_Id) !== 98000012
                                            ) || [];
                                        const sem2RealExamId = sem2Exams[0]?.EME_Id ?? sem2Exams[0]?.eme_Id;

                                        const applicableSubjects = (report.studentsubjects || []).filter((subj: any) => {
                                            const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                                            return appToResult === true || appToResult === 'true' || Number(appToResult) === 1;
                                        });

                                        // Group subjects by esG_SubjectGroupName
                                        const groupMap: { [key: string]: any[] } = {};
                                        applicableSubjects.forEach((subj: any) => {
                                            const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                            const isGrouped =
                                                subj.GropuFlag === 1 ||
                                                subj.GropuFlag === '1' ||
                                                subj.GropuFlag === true ||
                                                subj.GropuFlag === 'true' ||
                                                subj.gropuFlag === 1 ||
                                                subj.gropuFlag === '1' ||
                                                subj.gropuFlag === true ||
                                                subj.gropuFlag === 'true';
                                            if (isGrouped && groupName) {
                                                const trimmed = groupName.trim();
                                                if (!groupMap[trimmed]) {
                                                    groupMap[trimmed] = [];
                                                }
                                                groupMap[trimmed].push(subj);
                                            }
                                        });

                                        // Map subject IDs to their rowSpan and group size
                                        const subjRowSpanMap = new Map<number, number>();
                                        const subjGroupSizeMap = new Map<number, number>();
                                        applicableSubjects.forEach((subj: any) => {
                                            const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                            const isGrouped =
                                                subj.GropuFlag === 1 ||
                                                subj.GropuFlag === '1' ||
                                                subj.GropuFlag === true ||
                                                subj.GropuFlag === 'true' ||
                                                subj.gropuFlag === 1 ||
                                                subj.gropuFlag === '1' ||
                                                subj.gropuFlag === true ||
                                                subj.gropuFlag === 'true';
                                            const currentSubjId = subj.ISMS_Id ?? subj.ismS_Id;

                                            if (isGrouped && groupName) {
                                                const trimmed = groupName.trim();
                                                const groupSubjs = groupMap[trimmed];
                                                groupSubjs.sort((a, b) => (a.grporder ?? 0) - (b.grporder ?? 0));
                                                const firstSubj = groupSubjs[0];
                                                const firstSubjId = firstSubj.ISMS_Id ?? firstSubj.ismS_Id;

                                                if (Number(currentSubjId) === Number(firstSubjId)) {
                                                    subjRowSpanMap.set(currentSubjId, groupSubjs.length);
                                                } else {
                                                    subjRowSpanMap.set(currentSubjId, -1);
                                                }
                                                subjGroupSizeMap.set(currentSubjId, groupSubjs.length);
                                            } else {
                                                subjRowSpanMap.set(currentSubjId, 1);
                                                subjGroupSizeMap.set(currentSubjId, 1);
                                            }
                                        });

                                        // Helper for Roman/Arabic term matching
                                        const matchTermName = (termA: string, termB: string) => {
                                            const normalize = (str: string) => {
                                                return (str ?? '')
                                                    .trim()
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, '')
                                                    .replace(/SEMESTER/g, 'SEM')
                                                    .replace(/SEM1/g, 'SEMI')
                                                    .replace(/SEM2/g, 'SEMII')
                                                    .replace(/SEM-1/g, 'SEMI')
                                                    .replace(/SEM-2/g, 'SEMII')
                                                    .replace(/SEMESTER1/g, 'SEMI')
                                                    .replace(/SEMESTER2/g, 'SEMII')
                                                    .replace(/SEMESTERI/g, 'SEMI')
                                                    .replace(/SEMESTERII/g, 'SEMII');
                                            };
                                            const a = normalize(termA);
                                            const b = normalize(termB);
                                            if (a === b) return true;
                                            if ((a === 'SEMI' || a === 'SEM1') && (b === 'SEMI' || b === 'SEM1')) return true;
                                            if ((a === 'SEMII' || a === 'SEM2') && (b === 'SEMII' || b === 'SEM2')) return true;
                                            return false;
                                        };

                                        const getGrpExams = (g: any) => {
                                            return g.groupewiseexam ?? g.groupwiseexam ?? g.groupWiseExam ?? [];
                                        };

                                        const findAttendance = (termName: string) => {
                                            return report.attendance?.find((a: any) => matchTermName(a.term, termName));
                                        };

                                        const findAverageAttendance = () => {
                                            return report.attendance?.find((a: any) => {
                                                const aTerm = (a.term ?? '').trim().toUpperCase();
                                                return (
                                                    aTerm === 'ATT_AVERAGE' ||
                                                    aTerm === 'ATT_AVG' ||
                                                    aTerm === 'AVERAGE' ||
                                                    aTerm === 'AVERAGE ATTENDANCE'
                                                );
                                            });
                                        };

                                        // Helper to check mark record
                                        const getMarkRecord = (subjId: number, emeId: number, termName: string) => {
                                            return report.studentmarks?.find((mrks: any) => {
                                                const mSubjId = mrks.ISMS_Id ?? mrks.ismS_Id;
                                                const mEmeId = mrks.EME_Id ?? mrks.emE_Id;
                                                const mGrpName =
                                                    mrks.EMPSG_DisplayName ??
                                                    mrks.empsG_DisplayName ??
                                                    mrks.EMPSG_GroupName ??
                                                    mrks.empG_GroupName ??
                                                    '';
                                                return (
                                                    Number(mSubjId) === Number(subjId) &&
                                                    Number(mEmeId) === Number(emeId) &&
                                                    matchTermName(mGrpName, termName)
                                                );
                                            });
                                        };

                                        const getCellValue = (subj: any, exam: any) => {
                                            const subjId = subj.ISMS_Id || subj.ismS_Id;
                                            const examId = exam.EME_Id;
                                            const examName = exam.EME_ExamName;
                                            const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                                            const isME = (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'ME';
                                            const isSE = (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'SE';

                                            // Check displays
                                            const anyRec = report.studentmarks?.find(
                                                (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subjId)
                                            );
                                            const marksDisplay =
                                                anyRec?.EYCES_MarksDisplayFlg === true ||
                                                anyRec?.EYCES_MarksDisplayFlg === 1 ||
                                                anyRec?.EYCES_MarksDisplayFlg === 'true' ||
                                                anyRec?.eyceS_MarksDisplayFlg === true ||
                                                anyRec?.eyceS_MarksDisplayFlg === 1 ||
                                                anyRec?.eyceS_MarksDisplayFlg === 'true';
                                            const gradeDisplay =
                                                anyRec?.EYCES_GradeDisplayFlg === true ||
                                                anyRec?.EYCES_GradeDisplayFlg === 1 ||
                                                anyRec?.EYCES_GradeDisplayFlg === 'true' ||
                                                anyRec?.eyceS_GradeDisplayFlg === true ||
                                                anyRec?.eyceS_GradeDisplayFlg === 1 ||
                                                anyRec?.eyceS_GradeDisplayFlg === 'true';

                                            const isGradeOnly = gradeDisplay && !marksDisplay;

                                            // Find the matching mark record
                                            const mr = getMarkRecord(subjId, examId, grpName);

                                            const passFail = mr?.PassFailFlag ?? mr?.passFailFlag;
                                            const isAbsent = ['AB', 'M', 'L'].includes(passFail || '');

                                            // 1. If it's a regular exam column (not Total 9800000 and not Highest 98000012)
                                            if (examId !== 9800000 && examId !== 98000012) {
                                                if (!mr) return '';
                                                if (isAbsent) {
                                                    if (gradeDisplay && isME) return '-';
                                                    return 'AB';
                                                }
                                                if (isGradeOnly) {
                                                    return '-';
                                                }
                                                const obtainedMarks = mr.ObtainedMarks ?? mr.obtainedMarks ?? 0;
                                                const maxmarks = mr.maxmarks ?? mr.maxMarks ?? mr.max_marks ?? 0;
                                                if (isME && obtainedMarks !== 0) {
                                                    return '-';
                                                }
                                                return isSE ? `${obtainedMarks} / ${maxmarks}` : obtainedMarks;
                                            }

                                            // 2. If it's the Total Column (9800000)
                                            if (examId === 9800000) {
                                                if (isGradeOnly) {
                                                    if (!mr) return '-';
                                                    return mr.ObtainedGrade ?? mr.obtainedGrade ?? '-';
                                                }
                                                if (mr) {
                                                    const oVal = mr.ObtainedMarks ?? mr.obtainedMarks;
                                                    if (oVal !== undefined && oVal !== null && oVal !== '') {
                                                        const maxVal = mr.maxmarks ?? mr.maxMarks ?? mr.max_marks;
                                                        return isSE && maxVal ? `${oVal} / ${maxVal}` : oVal;
                                                    }
                                                }

                                                const grp = reportData?.getgroupdetails?.find((g: any) =>
                                                    matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                                                );
                                                if (!grp) return '';
                                                const semTotal = getSubjectSemesterTotal(subj, grp);
                                                if (semTotal.obtained === null) return '';
                                                if (semTotal.obtained === 'AB') return 'AB';
                                                return isSE ? `${semTotal.obtained} / ${semTotal.max}` : semTotal.obtained;
                                            }

                                            // 3. If it's the Highest Column (98000012)
                                            if (examId === 98000012) {
                                                if (isGradeOnly) {
                                                    if (!mr) return '-';
                                                    return (
                                                        mr.ESTMPPS_ObtainedGrade ??
                                                        mr.estmppS_ObtainedGrade ??
                                                        mr.ObtainedGrade ??
                                                        mr.obtainedGrade ??
                                                        '-'
                                                    );
                                                }
                                                if (mr) {
                                                    const hVal = mr.ESTMPPS_ClassHighest ?? mr.estmppS_ClassHighest;
                                                    if (hVal !== undefined && hVal !== null && hVal !== '') {
                                                        return hVal;
                                                    }
                                                }
                                                if (report.examwisetotal && Array.isArray(report.examwisetotal)) {
                                                    const highestRec = report.examwisetotal.find((rec: any) => {
                                                        const recSubjId = rec.ismS_Id ?? rec.ISMS_Id;
                                                        const recExamId = rec.emE_Id ?? rec.EME_Id;
                                                        const recGrpName = rec.empsG_GroupName ?? rec.EMPSG_GroupName ?? '';
                                                        return (
                                                            Number(recSubjId) === Number(subjId) &&
                                                            (Number(recExamId) === 98000012 || Number(recExamId) === 9800000) &&
                                                            (!recGrpName || matchTermName(recGrpName, grpName))
                                                        );
                                                    });
                                                    if (highestRec) {
                                                        const hVal = highestRec.estmppS_ClassHighest ?? highestRec.ESTMPPS_ClassHighest;
                                                        if (hVal !== undefined && hVal !== null && hVal !== '') {
                                                            return hVal;
                                                        }
                                                    }
                                                }

                                                const grp = reportData?.getgroupdetails?.find((g: any) =>
                                                    matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                                                );
                                                if (!grp) return '';
                                                const semHighest = getSubjectSemesterHighest(subj, grp);
                                                return semHighest !== '' ? semHighest : '';
                                            }

                                            return '';
                                        };

                                        // Helper to get semester total for a single subject
                                        const getSubjectSemesterTotal = (subj: any, grp: any) => {
                                            const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                            const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;

                                            const realGrp =
                                                reportData?.getgroupdetails?.find((g: any) =>
                                                    matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                                                ) || grp;

                                            const exams = getGrpExams(realGrp).filter(
                                                (e: any) => Number(e.EME_Id) !== 9800000 && Number(e.EME_Id) !== 98000012
                                            );

                                            let totalObt = 0;
                                            let totalMax = 0;
                                            let allAbsent = true;
                                            let hasMarks = false;

                                            exams.forEach((exam: any) => {
                                                const rec = getMarkRecord(subjId, exam.EME_Id, grpName);
                                                if (rec) {
                                                    hasMarks = true;
                                                    const passFail = rec.PassFailFlag ?? rec.passFailFlag;
                                                    const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                    if (!isAbsent) {
                                                        allAbsent = false;
                                                        totalObt += Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? 0);
                                                    }
                                                    totalMax += Number(
                                                        rec.maxMarks ?? rec.maxmarks ?? rec.maxMarks ?? exam.EMPSGE_ForMaxMarkrs ?? 0
                                                    );
                                                } else {
                                                    totalMax += Number(exam.EMPSGE_ForMaxMarkrs ?? 0);
                                                }
                                            });

                                            return {
                                                obtained: hasMarks ? (allAbsent ? 'AB' : totalObt) : null,
                                                max: totalMax
                                            };
                                        };

                                        // Helper to get semester highest for a single subject
                                        const getSubjectSemesterHighest = (subj: any, grp: any) => {
                                            const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                            const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                                            const realGrp =
                                                reportData?.getgroupdetails?.find((g: any) =>
                                                    matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                                                ) || grp;

                                            const exams = getGrpExams(realGrp).filter(
                                                (e: any) => Number(e.EME_Id) !== 9800000 && Number(e.EME_Id) !== 98000012
                                            );

                                            let maxHighest = 0;
                                            let hasHighest = false;

                                            exams.forEach((exam: any) => {
                                                const rec = getMarkRecord(subjId, exam.EME_Id, grpName);
                                                if (rec) {
                                                    const hVal =
                                                        rec.ESTMPPS_ClassHighest ??
                                                        rec.estmppS_ClassHighest ??
                                                        rec.ESTMPS_ClassHighest ??
                                                        rec.estmpS_ClassHighest ??
                                                        null;
                                                    if (hVal !== null && !isNaN(Number(hVal))) {
                                                        maxHighest = Math.max(maxHighest, Number(hVal));
                                                        hasHighest = true;
                                                    }
                                                }
                                            });

                                            return hasHighest ? maxHighest : '';
                                        };

                                        // Helper to get semester total for a group
                                        const getGroupSemesterTotal = (groupName: string, grp: any) => {
                                            const subjsInGroup = groupMap[groupName.trim()] || [];
                                            let sumObt = 0;
                                            let sumMax = 0;
                                            let count = 0;

                                            subjsInGroup.forEach((s: any) => {
                                                const tot = getSubjectSemesterTotal(s, grp);
                                                if (tot.obtained !== null) {
                                                    if (typeof tot.obtained === 'number') {
                                                        sumObt += tot.obtained;
                                                    }
                                                    sumMax += tot.max;
                                                    count++;
                                                }
                                            });

                                            if (count === 0) return { obtained: null, max: 0 };
                                            return {
                                                obtained: Math.round(sumObt / count),
                                                max: Math.round(sumMax / count)
                                            };
                                        };

                                        // Helper to get Grand Total for a subject (sum of Sem 1 & Sem 2)
                                        const getGrandTotal = (subj: any) => {
                                            const isSubjGrouped =
                                                subj.GropuFlag === 1 ||
                                                subj.GropuFlag === '1' ||
                                                subj.GropuFlag === true ||
                                                subj.GropuFlag === 'true' ||
                                                subj.gropuFlag === 1 ||
                                                subj.gropuFlag === '1' ||
                                                subj.gropuFlag === true ||
                                                subj.gropuFlag === 'true';
                                            const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;

                                            let sem1Obt: number | string | null = null;
                                            let sem1Max = 0;
                                            let sem2Obt: number | string | null = null;
                                            let sem2Max = 0;

                                            const sem1Group = reportData?.getgroupdetails?.find(
                                                (g: any) => g.empsG_Order === 1 || g.empG_Order === 1
                                            );
                                            const sem2Group = reportData?.getgroupdetails?.find(
                                                (g: any) => g.empsG_Order === 2 || g.empG_Order === 2
                                            );

                                            if (isSubjGrouped && groupName) {
                                                if (sem1Group) {
                                                    const tot1 = getGroupSemesterTotal(groupName, sem1Group);
                                                    sem1Obt = tot1.obtained;
                                                    sem1Max = tot1.max;
                                                }
                                                if (sem2Group) {
                                                    const tot2 = getGroupSemesterTotal(groupName, sem2Group);
                                                    sem2Obt = tot2.obtained;
                                                    sem2Max = tot2.max;
                                                }
                                            } else {
                                                if (sem1Group) {
                                                    const tot1 = getSubjectSemesterTotal(subj, sem1Group);
                                                    sem1Obt = tot1.obtained;
                                                    sem1Max = tot1.max;
                                                }
                                                if (sem2Group) {
                                                    const tot2 = getSubjectSemesterTotal(subj, sem2Group);
                                                    sem2Obt = tot2.obtained;
                                                    sem2Max = tot2.max;
                                                }
                                            }

                                            let grandObt: number | string | null = null;
                                            if (typeof sem1Obt === 'number' || typeof sem2Obt === 'number') {
                                                grandObt = (Number(sem1Obt) || 0) + (Number(sem2Obt) || 0);
                                            } else if (sem1Obt === 'AB' && sem2Obt === 'AB') {
                                                grandObt = 'AB';
                                            }

                                            return {
                                                obtained: grandObt,
                                                max: sem1Max + sem2Max
                                            };
                                        };

                                        // Helper for Yearly Average
                                        const getYearlyAvg = (subj: any) => {
                                            const gt = getGrandTotal(subj);
                                            if (typeof gt.obtained === 'number') {
                                                const val = gt.obtained / 2;
                                                return {
                                                    obtained: val % 1 === 0 ? val : Number(val.toFixed(1)),
                                                    max: Math.round(gt.max / 2)
                                                };
                                            }
                                            return {
                                                obtained: gt.obtained,
                                                max: Math.round(gt.max / 2)
                                            };
                                        };

                                        // Helper to get sum of all subjects for a semester (TOTAL row)
                                        const getSemesterTotalSum = (grp: any) => {
                                            let sumObt = 0;
                                            let sumMax = 0;
                                            let hasMarks = false;

                                            applicableSubjects.forEach((subj: any) => {
                                                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                const rowSpan = subjRowSpanMap.get(subjId);
                                                if (rowSpan !== undefined && rowSpan === -1) {
                                                    return; // Skip grouped subjects that are not the first
                                                }

                                                const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                                const isGrouped =
                                                    subj.GropuFlag === 1 ||
                                                    subj.GropuFlag === '1' ||
                                                    subj.GropuFlag === true ||
                                                    subj.GropuFlag === 'true' ||
                                                    subj.gropuFlag === 1 ||
                                                    subj.gropuFlag === '1' ||
                                                    subj.gropuFlag === true ||
                                                    subj.gropuFlag === 'true';

                                                // Skip grade-only subjects
                                                const isGradeOnly =
                                                    (subj.eyceS_GradeDisplayFlg === 'true' ||
                                                        subj.eyceS_GradeDisplayFlg === true ||
                                                        subj.EYCES_GradeDisplayFlg === 'true' ||
                                                        subj.EYCES_GradeDisplayFlg === true) &&
                                                    !(
                                                        subj.eyceS_MarksDisplayFlg === 'true' ||
                                                        subj.eyceS_MarksDisplayFlg === true ||
                                                        subj.EYCES_MarksDisplayFlg === 'true' ||
                                                        subj.EYCES_MarksDisplayFlg === true
                                                    );
                                                if (isGradeOnly) return;

                                                if (isGrouped && groupName) {
                                                    const tot = getGroupSemesterTotal(groupName, grp);
                                                    if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                                        sumObt += tot.obtained;
                                                        sumMax += tot.max;
                                                        hasMarks = true;
                                                    }
                                                } else {
                                                    const tot = getSubjectSemesterTotal(subj, grp);
                                                    if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                                        sumObt += tot.obtained;
                                                        sumMax += tot.max;
                                                        hasMarks = true;
                                                    }
                                                }
                                            });

                                            return hasMarks ? { obtained: sumObt, max: sumMax } : null;
                                        };

                                        const sem1Group = reportData?.getgroupdetails?.find(
                                            (g: any) => g.empsG_Order === 1 || g.empG_Order === 1
                                        );
                                        const sem2Group = reportData?.getgroupdetails?.find(
                                            (g: any) => g.empsG_Order === 2 || g.empG_Order === 2
                                        );

                                        const sem1Sum = sem1Group ? getSemesterTotalSum(sem1Group) : null;
                                        const sem2Sum = sem2Group ? getSemesterTotalSum(sem2Group) : null;

                                        const grandTotalSumObt = (sem1Sum?.obtained ?? 0) + (sem2Sum?.obtained ?? 0);
                                        const grandTotalSumMax = (sem1Sum?.max ?? 0) + (sem2Sum?.max ?? 0);

                                        const yearlyAvgObtSum = Math.round(grandTotalSumObt / 2);
                                        const yearlyAvgMaxSum = Math.round(grandTotalSumMax / 2);

                                        const sem1Percentage =
                                            sem1Sum?.max && sem1Sum.max > 0 ? Math.round((sem1Sum.obtained / sem1Sum.max) * 100) : 0;
                                        const sem2Percentage =
                                            sem2Sum?.max && sem2Sum.max > 0 ? Math.round((sem2Sum.obtained / sem2Sum.max) * 100) : 0;
                                        const grandPercentage =
                                            grandTotalSumMax > 0 ? Math.round((grandTotalSumObt / grandTotalSumMax) * 100) : 0;
                                        const yearlyPercentage =
                                            yearlyAvgMaxSum > 0 ? Math.round((yearlyAvgObtSum / yearlyAvgMaxSum) * 100) : 0;

                                        const getSemesterTotalFromExamWise = (semName: string) => {
                                            const rec = report.student_marks?.find((m: any) => {
                                                const mEmeId = m.EME_Id ?? m.emE_Id;
                                                const mGrp = (
                                                    m.EMPSG_DisplayName ??
                                                    m.empsG_DisplayName ??
                                                    m.EMPSG_GroupName ??
                                                    m.empG_GroupName ??
                                                    ''
                                                )
                                                    ?.trim()
                                                    .toUpperCase();
                                                return Number(mEmeId) === 9800000 && matchTermName(mGrp, semName);
                                            });
                                            if (rec) {
                                                return {
                                                    obtained: rec.obtainedMarks ?? rec.ObtainedMarks ?? 0,
                                                    max: rec.maxmarks ?? rec.maxMarks ?? rec.Maxmarks ?? 0,
                                                    percentage: rec.totalPercentage ?? rec.TotalPercentage ?? 0
                                                };
                                            }
                                            return null;
                                        };

                                        const sem1ExamTotal = getSemesterTotalFromExamWise(sem1Name);
                                        const sem2ExamTotal = getSemesterTotalFromExamWise(sem2Name);

                                        const sem1TotalObtVal = sem1ExamTotal ? Number(sem1ExamTotal.obtained) : (sem1Sum?.obtained ?? 0);
                                        const sem1TotalMaxVal = sem1ExamTotal ? Number(sem1ExamTotal.max) : (sem1Sum?.max ?? 0);

                                        const sem2TotalObtVal = sem2ExamTotal ? Number(sem2ExamTotal.obtained) : (sem2Sum?.obtained ?? 0);
                                        const sem2TotalMaxVal = sem2ExamTotal ? Number(sem2ExamTotal.max) : (sem2Sum?.max ?? 0);

                                        const sem1PercentageVal = sem1ExamTotal ? Number(sem1ExamTotal.percentage) : sem1Percentage;
                                        const sem2PercentageVal = sem2ExamTotal ? Number(sem2ExamTotal.percentage) : sem2Percentage;

                                        // Helper to get Obtained, Highest, and Average marks for a subject in a given semester
                                        const getSubjectSemesterStats = (stu: any, subjId: number, semName: string) => {
                                            const currentStudentId = stu.AMST_Id ?? stu.amsT_Id;

                                            const totalRec = stu.studentmarks?.find((m: any) => {
                                                const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
                                                const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                                                const mGrp = (
                                                    m.EMPSG_DisplayName ??
                                                    m.empsG_DisplayName ??
                                                    m.EMPSG_GroupName ??
                                                    m.empG_GroupName ??
                                                    ''
                                                )
                                                    ?.trim()
                                                    .toUpperCase();
                                                return (
                                                    Number(mSubjId) === Number(subjId) &&
                                                    Number(mEmeId) === 9800000 &&
                                                    matchTermName(mGrp, semName)
                                                );
                                            });

                                            const highestRec = stu.studentmarks?.find((m: any) => {
                                                const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
                                                const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                                                const mGrp = (
                                                    m.EMPSG_DisplayName ??
                                                    m.empsG_DisplayName ??
                                                    m.EMPSG_GroupName ??
                                                    m.empG_GroupName ??
                                                    ''
                                                )
                                                    ?.trim()
                                                    .toUpperCase();
                                                return (
                                                    Number(mSubjId) === Number(subjId) &&
                                                    Number(mEmeId) === 98000012 &&
                                                    matchTermName(mGrp, semName)
                                                );
                                            });

                                            const obtainedVal =
                                                totalRec?.ObtainedMarks ?? totalRec?.obtainedMarks ?? totalRec?.obtainedmarks ?? null;
                                            const obtained = obtainedVal !== null && !isNaN(Number(obtainedVal)) ? Number(obtainedVal) : 0;

                                            let highest = 0;
                                            const highestVal =
                                                highestRec?.ESTMPPS_ClassHighest ??
                                                highestRec?.ESTMPS_ClassHighest ??
                                                highestRec?.estmppS_ClassHighest ??
                                                highestRec?.estmpS_ClassHighest ??
                                                totalRec?.ESTMPPS_ClassHighest ??
                                                totalRec?.ESTMPS_ClassHighest ??
                                                totalRec?.estmppS_ClassHighest ??
                                                totalRec?.estmpS_ClassHighest ??
                                                null;

                                            if (highestVal !== null && !isNaN(Number(highestVal)) && Number(highestVal) > 0) {
                                                highest = Number(highestVal);
                                            } else {
                                                let totalsRec = reportData.getexamwisetotaldetails?.find((t: any) => {
                                                    const tStuId = t.AMST_Id ?? t.amsT_Id;
                                                    const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                                    const tGrp = (
                                                        t.EMPSG_DisplayName ??
                                                        t.empsG_DisplayName ??
                                                        t.EMPSG_GroupName ??
                                                        t.empG_GroupName ??
                                                        ''
                                                    )
                                                        ?.trim()
                                                        .toUpperCase();
                                                    return (
                                                        Number(tStuId) === Number(currentStudentId) &&
                                                        Number(tSubjId) === Number(subjId) &&
                                                        matchTermName(tGrp, semName)
                                                    );
                                                });
                                                if (!totalsRec) {
                                                    totalsRec = reportData.getexamwisetotaldetails?.find((t: any) => {
                                                        const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                                        const tGrp = (
                                                            t.EMPSG_DisplayName ??
                                                            t.empsG_DisplayName ??
                                                            t.EMPSG_GroupName ??
                                                            t.empG_GroupName ??
                                                            ''
                                                        )
                                                            ?.trim()
                                                            .toUpperCase();
                                                        return Number(tSubjId) === Number(subjId) && matchTermName(tGrp, semName);
                                                    });
                                                }
                                                const totalsHighest =
                                                    totalsRec?.ESTMPPS_ClassHighest ??
                                                    totalsRec?.estmppS_ClassHighest ??
                                                    totalsRec?.ESTMPS_ClassHighest ??
                                                    totalsRec?.estmpS_ClassHighest ??
                                                    null;
                                                if (totalsHighest !== null && !isNaN(Number(totalsHighest)) && Number(totalsHighest) > 0) {
                                                    highest = Number(totalsHighest);
                                                } else {
                                                    const allStudentObtained: number[] = [];
                                                    reportData.studentdetails?.forEach((otherStu: any) => {
                                                        const otherTotalRec = otherStu.studentmarks?.find((m: any) => {
                                                            const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                            const mEmeId = m.EME_Id ?? m.emE_Id;
                                                            const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')
                                                                ?.trim()
                                                                .toUpperCase();
                                                            return (
                                                                Number(mSubjId) === Number(subjId) &&
                                                                Number(mEmeId) === 9800000 &&
                                                                matchTermName(mGrp, semName)
                                                            );
                                                        });
                                                        const otherObtained =
                                                            otherTotalRec?.ObtainedMarks ??
                                                            otherTotalRec?.obtainedMarks ??
                                                            otherTotalRec?.obtainedmarks;
                                                        if (
                                                            otherObtained !== null &&
                                                            otherObtained !== undefined &&
                                                            !isNaN(Number(otherObtained))
                                                        ) {
                                                            allStudentObtained.push(Number(otherObtained));
                                                        }
                                                    });
                                                    if (allStudentObtained.length > 0) {
                                                        highest = Math.max(...allStudentObtained);
                                                    } else {
                                                        highest = obtained;
                                                    }
                                                }
                                            }

                                            let average = 0;
                                            const averageVal =
                                                totalRec?.ESTMPPS_SectionAverage ??
                                                totalRec?.ESTMPS_SectionAverage ??
                                                totalRec?.estmppS_SectionAverage ??
                                                totalRec?.estmpS_SectionAverage ??
                                                totalRec?.ESTMPPS_ClassAverage ??
                                                totalRec?.ESTMPS_ClassAverage ??
                                                totalRec?.estmppS_ClassAverage ??
                                                totalRec?.estmpS_ClassAverage ??
                                                highestRec?.ESTMPPS_SectionAverage ??
                                                highestRec?.ESTMPS_SectionAverage ??
                                                highestRec?.estmppS_SectionAverage ??
                                                highestRec?.estmpS_SectionAverage ??
                                                null;

                                            if (averageVal !== null && !isNaN(Number(averageVal)) && Number(averageVal) > 0) {
                                                average = Number(averageVal);
                                            } else {
                                                let totalsRec = reportData.getexamwisetotaldetails?.find((t: any) => {
                                                    const tStuId = t.AMST_Id ?? t.amsT_Id;
                                                    const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                                    const tGrp = (
                                                        t.EMPSG_DisplayName ??
                                                        t.empsG_DisplayName ??
                                                        t.EMPSG_GroupName ??
                                                        t.empG_GroupName ??
                                                        ''
                                                    )
                                                        ?.trim()
                                                        .toUpperCase();
                                                    return (
                                                        Number(tStuId) === Number(currentStudentId) &&
                                                        Number(tSubjId) === Number(subjId) &&
                                                        matchTermName(tGrp, semName)
                                                    );
                                                });
                                                if (!totalsRec) {
                                                    totalsRec = reportData.getexamwisetotaldetails?.find((t: any) => {
                                                        const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                                        const tGrp = (
                                                            t.EMPSG_DisplayName ??
                                                            t.empsG_DisplayName ??
                                                            t.EMPSG_GroupName ??
                                                            t.empG_GroupName ??
                                                            ''
                                                        )
                                                            ?.trim()
                                                            .toUpperCase();
                                                        return Number(tSubjId) === Number(subjId) && matchTermName(tGrp, semName);
                                                    });
                                                }
                                                const totalsAverage =
                                                    totalsRec?.ESTMPPS_SectionAverage ??
                                                    totalsRec?.estmppS_SectionAverage ??
                                                    totalsRec?.ESTMPS_SectionAverage ??
                                                    totalsRec?.estmpS_SectionAverage ??
                                                    null;
                                                if (totalsAverage !== null && !isNaN(Number(totalsAverage)) && Number(totalsAverage) > 0) {
                                                    average = Number(totalsAverage);
                                                } else {
                                                    const allStudentObtained: number[] = [];
                                                    reportData.studentdetails?.forEach((otherStu: any) => {
                                                        const otherTotalRec = otherStu.studentmarks?.find((m: any) => {
                                                            const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                            const mEmeId = m.EME_Id ?? m.emE_Id;
                                                            const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')
                                                                ?.trim()
                                                                .toUpperCase();
                                                            return (
                                                                Number(mSubjId) === Number(subjId) &&
                                                                Number(mEmeId) === 9800000 &&
                                                                matchTermName(mGrp, semName)
                                                            );
                                                        });
                                                        const otherObtained =
                                                            otherTotalRec?.ObtainedMarks ??
                                                            otherTotalRec?.obtainedMarks ??
                                                            otherTotalRec?.obtainedmarks;
                                                        if (
                                                            otherObtained !== null &&
                                                            otherObtained !== undefined &&
                                                            !isNaN(Number(otherObtained))
                                                        ) {
                                                            allStudentObtained.push(Number(otherObtained));
                                                        }
                                                    });
                                                    if (allStudentObtained.length > 0) {
                                                        average = Math.round(
                                                            allStudentObtained.reduce((sum, val) => sum + val, 0) /
                                                                allStudentObtained.length
                                                        );
                                                    } else {
                                                        average = Math.round(highest * 0.82) || obtained;
                                                    }
                                                }
                                            }

                                            return { obtained, highest, average };
                                        };

                                        const scholasticSubjects = applicableSubjects.filter((subj: any) => {
                                            const marksDisplay =
                                                subj.eyceS_MarksDisplayFlg === true ||
                                                subj.eyceS_MarksDisplayFlg === 'true' ||
                                                subj.EYCES_MarksDisplayFlg === true ||
                                                subj.EYCES_MarksDisplayFlg === 'true';
                                            const gradeEntry =
                                                (subj.eyceS_MarksEntryDesc ?? subj.EYCES_MarksEntryDesc ?? '')?.trim().toUpperCase() ===
                                                'GRADE';
                                            return marksDisplay && !gradeEntry;
                                        });

                                        const localChartData =
                                            report.chartData && report.chartData.length > 0
                                                ? report.chartData
                                                : scholasticSubjects
                                                      .map((subj: any) => {
                                                          const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                          const subjectName = subj.ISMS_SubjectName ?? subj.ismS_SubjectName;

                                                          const sem1Stats = getSubjectSemesterStats(report, subjId, sem1Name);
                                                          const sem2Stats = getSubjectSemesterStats(report, subjId, sem2Name);

                                                          const hasSem1 = report.studentmarks?.some((m: any) => {
                                                              const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                              const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')
                                                                  ?.trim()
                                                                  .toUpperCase();
                                                              return (
                                                                  Number(mSubjId) === Number(subjId) &&
                                                                  mGrp === sem1Name.trim().toUpperCase()
                                                              );
                                                          });
                                                          const hasSem2 = report.studentmarks?.some((m: any) => {
                                                              const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                              const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')
                                                                  ?.trim()
                                                                  .toUpperCase();
                                                              return (
                                                                  Number(mSubjId) === Number(subjId) &&
                                                                  mGrp === sem2Name.trim().toUpperCase()
                                                              );
                                                          });

                                                          let obtained = 0;
                                                          let highest = 0;
                                                          let average = 0;

                                                          if (hasSem1 && hasSem2) {
                                                              obtained = Math.round((sem1Stats.obtained + sem2Stats.obtained) / 2);
                                                              highest = Math.round((sem1Stats.highest + sem2Stats.highest) / 2);
                                                              average = Math.round((sem1Stats.average + sem2Stats.average) / 2);
                                                          } else if (hasSem1) {
                                                              obtained = sem1Stats.obtained;
                                                              highest = sem1Stats.highest;
                                                              average = sem1Stats.average;
                                                          } else if (hasSem2) {
                                                              obtained = sem2Stats.obtained;
                                                              highest = sem2Stats.highest;
                                                              average = sem2Stats.average;
                                                          }

                                                          return {
                                                              subject: subjectName,
                                                              highest,
                                                              average,
                                                              obtained
                                                          };
                                                      })
                                                      .filter((item: any) => item.highest > 0 || item.obtained > 0);

                                        return (
                                            <>
                                                <div className='padding-top-5'>
                                                    <table
                                                        className='table-bordered table w-full border-collapse border border-black text-sm'
                                                        style={{ fontFamily: 'system-ui' }}>
                                                        <thead>
                                                            <tr>
                                                                <td
                                                                    rowSpan={2}
                                                                    className='w-[300px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                                    SUBJECTS
                                                                </td>
                                                                {groups.map((grp: any, gIdx: number) => (
                                                                    <td
                                                                        key={gIdx}
                                                                        colSpan={getGrpExams(grp).length || 1}
                                                                        className='border border-black bg-[#d1d5db] p-1 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                                        {grp.empG_DistplayName}
                                                                    </td>
                                                                ))}
                                                                <td
                                                                    rowSpan={2}
                                                                    className='w-[100px] border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                                    Grand Total
                                                                    <br />
                                                                    [200]
                                                                </td>
                                                                <td
                                                                    rowSpan={2}
                                                                    className='w-[150px] border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                                    Yearly Avg
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                                    <th
                                                                        key={eIdx}
                                                                        className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                                        {grpexam.examnamedisplay} <br />
                                                                        {grpexam.examnamedisplay !== 'Highest in Class' &&
                                                                            grpexam.EME_Id !== 98000012 && (
                                                                                <span>[{grpexam.EMPSGE_ForMaxMarkrs}]</span>
                                                                            )}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {applicableSubjects.map((subj: any, sIdx: number) => {
                                                                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                                const isSubjGrouped =
                                                                    subj.GropuFlag === 1 ||
                                                                    subj.GropuFlag === '1' ||
                                                                    subj.GropuFlag === true ||
                                                                    subj.GropuFlag === 'true' ||
                                                                    subj.gropuFlag === 1 ||
                                                                    subj.gropuFlag === '1' ||
                                                                    subj.gropuFlag === true ||
                                                                    subj.gropuFlag === 'true';

                                                                const rowSpanVal = subjRowSpanMap.get(subjId) ?? 1;

                                                                return (
                                                                    <tr key={sIdx}>
                                                                        <td className='break-words border border-black p-1 text-left font-bold'>
                                                                            {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                                        </td>

                                                                        {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                            const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                                            const isHighestCol = Number(grpexam.EME_Id) === 98000012;

                                                                            if (isSubjGrouped && isTotalCol && rowSpanVal === -1)
                                                                                return null;

                                                                            const rs = isSubjGrouped && isTotalCol ? rowSpanVal : 1;

                                                                            return (
                                                                                <td
                                                                                    key={eIdx}
                                                                                    rowSpan={rs}
                                                                                    className='border border-black p-1 text-center font-semibold'>
                                                                                    {getCellValue(subj, grpexam)}
                                                                                </td>
                                                                            );
                                                                        })}

                                                                        {(!isSubjGrouped || rowSpanVal !== -1) && (
                                                                            <td
                                                                                rowSpan={isSubjGrouped ? rowSpanVal : 1}
                                                                                className='border border-black p-1 text-center font-bold'>
                                                                                {(() => {
                                                                                    const gFlag =
                                                                                        subj.GropuFlag === 1 ||
                                                                                        subj.GropuFlag === '1' ||
                                                                                        subj.GropuFlag === true ||
                                                                                        subj.gropuFlag === 1 ||
                                                                                        subj.gropuFlag === '1' ||
                                                                                        subj.gropuFlag === true;
                                                                                    const gradeDisplay =
                                                                                        subj.EYCES_GradeDisplayFlg === 1 ||
                                                                                        subj.EYCES_GradeDisplayFlg === '1' ||
                                                                                        subj.EYCES_GradeDisplayFlg === true ||
                                                                                        subj.eyceS_GradeDisplayFlg === 1 ||
                                                                                        subj.eyceS_GradeDisplayFlg === '1' ||
                                                                                        subj.eyceS_GradeDisplayFlg === true;
                                                                                    const marksDisplay =
                                                                                        subj.EYCES_MarksDisplayFlg === 1 ||
                                                                                        subj.EYCES_MarksDisplayFlg === '1' ||
                                                                                        subj.EYCES_MarksDisplayFlg === true ||
                                                                                        subj.eyceS_MarksDisplayFlg === 1 ||
                                                                                        subj.eyceS_MarksDisplayFlg === '1' ||
                                                                                        subj.eyceS_MarksDisplayFlg === true;
                                                                                    const subCode =
                                                                                        subj.ISMS_SubjectCode ||
                                                                                        subj.ismS_SubjectCode ||
                                                                                        '';

                                                                                    if (gradeDisplay && !marksDisplay) {
                                                                                        return '-';
                                                                                    }

                                                                                    if (gFlag) {
                                                                                        const val =
                                                                                            subj.ESTMPPSG_GroupObtMarks ??
                                                                                            subj.estmppsG_GroupObtMarks ??
                                                                                            subj.GroupMarks ??
                                                                                            subj.groupMarks ??
                                                                                            getGrandTotal(subj).obtained;
                                                                                        return val !== null &&
                                                                                            val !== undefined &&
                                                                                            val !== ''
                                                                                            ? val
                                                                                            : '-';
                                                                                    } else {
                                                                                        const val =
                                                                                            subj.ESTMPPSG_GroupObtMarks ??
                                                                                            subj.estmppsG_GroupObtMarks ??
                                                                                            getGrandTotal(subj).obtained;
                                                                                        if (val === null || val === undefined || val === '')
                                                                                            return '-';
                                                                                        if (val === 'AB') return 'AB';
                                                                                        const maxVal =
                                                                                            subj.EMPS_MaxMarks ??
                                                                                            subj.emps_MaxMarks ??
                                                                                            getGrandTotal(subj).max ??
                                                                                            200;
                                                                                        return subCode === 'SE'
                                                                                            ? `${val} / ${maxVal}`
                                                                                            : val;
                                                                                    }
                                                                                })()}
                                                                            </td>
                                                                        )}

                                                                        {(!isSubjGrouped || rowSpanVal !== -1) && (
                                                                            <td
                                                                                rowSpan={isSubjGrouped ? rowSpanVal : 1}
                                                                                className='border border-black p-1 text-center font-bold'>
                                                                                {(() => {
                                                                                    const gFlag =
                                                                                        subj.GropuFlag === 1 ||
                                                                                        subj.GropuFlag === '1' ||
                                                                                        subj.GropuFlag === true ||
                                                                                        subj.gropuFlag === 1 ||
                                                                                        subj.gropuFlag === '1' ||
                                                                                        subj.gropuFlag === true;
                                                                                    const gradeDisplay =
                                                                                        subj.EYCES_GradeDisplayFlg === 1 ||
                                                                                        subj.EYCES_GradeDisplayFlg === '1' ||
                                                                                        subj.EYCES_GradeDisplayFlg === true ||
                                                                                        subj.eyceS_GradeDisplayFlg === 1 ||
                                                                                        subj.eyceS_GradeDisplayFlg === '1' ||
                                                                                        subj.eyceS_GradeDisplayFlg === true;
                                                                                    const marksDisplay =
                                                                                        subj.EYCES_MarksDisplayFlg === 1 ||
                                                                                        subj.EYCES_MarksDisplayFlg === '1' ||
                                                                                        subj.EYCES_MarksDisplayFlg === true ||
                                                                                        subj.eyceS_MarksDisplayFlg === 1 ||
                                                                                        subj.eyceS_MarksDisplayFlg === '1' ||
                                                                                        subj.eyceS_MarksDisplayFlg === true;
                                                                                    const subCode =
                                                                                        subj.ISMS_SubjectCode ||
                                                                                        subj.ismS_SubjectCode ||
                                                                                        '';

                                                                                    if (gradeDisplay && !marksDisplay) {
                                                                                        return '-';
                                                                                    }

                                                                                    if (gFlag) {
                                                                                        const val =
                                                                                            subj.YeralyGroupObtMarks ??
                                                                                            subj.yeralyGroupObtMarks ??
                                                                                            subj.yearlyGroupObtMarks ??
                                                                                            subj.YearlyGroupObtMarks ??
                                                                                            subj.GroupMarksnew ??
                                                                                            subj.groupMarksnew ??
                                                                                            getYearlyAvg(subj).obtained;
                                                                                        return val !== null &&
                                                                                            val !== undefined &&
                                                                                            val !== ''
                                                                                            ? val
                                                                                            : '-';
                                                                                    } else {
                                                                                        const val =
                                                                                            subj.YeralyGroupObtMarks ??
                                                                                            subj.yeralyGroupObtMarks ??
                                                                                            subj.yearlyGroupObtMarks ??
                                                                                            subj.YearlyGroupObtMarks ??
                                                                                            getYearlyAvg(subj).obtained;
                                                                                        return val !== null &&
                                                                                            val !== undefined &&
                                                                                            val !== ''
                                                                                            ? val
                                                                                            : '-';
                                                                                    }
                                                                                })()}
                                                                            </td>
                                                                        )}
                                                                    </tr>
                                                                );
                                                            })}

                                                            {report.studentsubjects.map((subj: any, sIdx: number) => {
                                                                const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                                                                if (
                                                                    appToResult === true ||
                                                                    appToResult === 'true' ||
                                                                    Number(appToResult) === 1
                                                                )
                                                                    return null;

                                                                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                                return (
                                                                    <tr key={`non-app-${sIdx}`}>
                                                                        <td className='break-words border border-black p-1 text-left font-bold'>
                                                                            {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                                        </td>
                                                                        {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                            const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                                            const isHighestCol = Number(grpexam.EME_Id) === 98000012;
                                                                            const grpName =
                                                                                grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;

                                                                            if (isTotalCol || isHighestCol) {
                                                                                return (
                                                                                    <td
                                                                                        key={eIdx}
                                                                                        className='border border-black p-1 text-center'>
                                                                                        -
                                                                                    </td>
                                                                                );
                                                                            }

                                                                            const rec = getMarkRecord(subjId, grpexam.EME_Id, grpName);
                                                                            return (
                                                                                <td
                                                                                    key={eIdx}
                                                                                    className='border border-black p-1 text-center'>
                                                                                    {rec?.ObtainedMarks ?? rec?.obtainedMarks ?? '-'}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                        <td className='border border-black p-1 text-center'>-</td>
                                                                        <td className='border border-black p-1 text-center'>-</td>
                                                                    </tr>
                                                                );
                                                            })}

                                                            {/* TOTAL Row */}
                                                            <tr>
                                                                <td className='border border-black p-1 text-left font-bold uppercase'>
                                                                    TOTAL
                                                                </td>
                                                                {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                    const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                                    if (isTotalCol) {
                                                                        const grpName =
                                                                            grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;
                                                                        const isSem1 = matchTermName(grpName, sem1Name);
                                                                        const isSem2 = matchTermName(grpName, sem2Name);
                                                                        const valObt = isSem1
                                                                            ? sem1TotalObtVal
                                                                            : isSem2
                                                                              ? sem2TotalObtVal
                                                                              : null;
                                                                        const valMax = isSem1
                                                                            ? sem1TotalMaxVal
                                                                            : isSem2
                                                                              ? sem2TotalMaxVal
                                                                              : null;
                                                                        if (valObt === null || valMax === null || valMax === 0)
                                                                            return (
                                                                                <td
                                                                                    key={eIdx}
                                                                                    className='border border-black p-1 text-center font-bold'>
                                                                                    -
                                                                                </td>
                                                                            );
                                                                        return (
                                                                            <td
                                                                                key={eIdx}
                                                                                className='border border-black p-1 text-center font-bold'>
                                                                                {Math.round(valObt)} / {valMax}
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td
                                                                            key={eIdx}
                                                                            className='border border-black p-1 text-center font-bold'></td>
                                                                    );
                                                                })}
                                                                {(() => {
                                                                    const gradeRow = getStudentGradeListRow(
                                                                        report.AMST_Id || report.amsT_Id
                                                                    );
                                                                    const groupTotal =
                                                                        gradeRow?.GroupMarks_Total ??
                                                                        gradeRow?.groupMarks_Total ??
                                                                        (grandTotalSumObt || '');
                                                                    const maxMarks =
                                                                        gradeRow?.maxmarks ??
                                                                        gradeRow?.maxMarks ??
                                                                        (grandTotalSumMax || '');
                                                                    if (groupTotal === '' || maxMarks === '') {
                                                                        return (
                                                                            <td className='border border-black p-1 text-center font-bold'>
                                                                                -
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td className='border border-black p-1 text-center font-bold'>
                                                                            {Math.round(Number(groupTotal)).toLocaleString('en-US')} /{' '}
                                                                            {maxMarks}
                                                                        </td>
                                                                    );
                                                                })()}
                                                                {(() => {
                                                                    const gradeRow = getStudentGradeListRow(
                                                                        report.AMST_Id || report.amsT_Id
                                                                    );
                                                                    const yearlyTotal =
                                                                        gradeRow?.YearlyMarks_Total ??
                                                                        gradeRow?.yearlyMarks_Total ??
                                                                        (yearlyAvgObtSum || '');
                                                                    const maxMarks =
                                                                        gradeRow?.maxmarks ??
                                                                        gradeRow?.maxMarks ??
                                                                        (grandTotalSumMax || '');
                                                                    if (yearlyTotal === '' || maxMarks === '') {
                                                                        return (
                                                                            <td className='border border-black p-1 text-center font-bold'>
                                                                                -
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td className='border border-black p-1 text-center font-bold'>
                                                                            {Math.round(Number(yearlyTotal))} /{' '}
                                                                            {Math.round(Number(maxMarks) / 2)}
                                                                        </td>
                                                                    );
                                                                })()}
                                                            </tr>

                                                            {/* PERCENTAGE Row */}
                                                            <tr>
                                                                <td className='border border-black p-1 text-left font-bold uppercase'>
                                                                    PERCENTAGE
                                                                </td>
                                                                {reportData.groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                    const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                                    if (isTotalCol) {
                                                                        const grpName =
                                                                            grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;
                                                                        const isSem1 = matchTermName(grpName, sem1Name);
                                                                        const isSem2 = matchTermName(grpName, sem2Name);
                                                                        const valPct = isSem1
                                                                            ? sem1PercentageVal
                                                                            : isSem2
                                                                              ? sem2PercentageVal
                                                                              : null;
                                                                        if (valPct === null)
                                                                            return (
                                                                                <td
                                                                                    key={eIdx}
                                                                                    className='border border-black p-1 text-center font-bold'>
                                                                                    -
                                                                                </td>
                                                                            );
                                                                        return (
                                                                            <td
                                                                                key={eIdx}
                                                                                className='border border-black p-1 text-center font-bold'>
                                                                                {Math.round(valPct)}%
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td
                                                                            key={eIdx}
                                                                            className='border border-black p-1 text-center font-bold'></td>
                                                                    );
                                                                })}
                                                                {(() => {
                                                                    const gradeRow = getStudentGradeListRow(
                                                                        report.AMST_Id || report.amsT_Id
                                                                    );
                                                                    const groupPer =
                                                                        gradeRow?.GroupMarks_PER ?? gradeRow?.groupMarks_PER ?? '';
                                                                    if (groupPer === '') {
                                                                        if (grandTotalSumMax > 0) {
                                                                            const calcPct = (grandTotalSumObt / grandTotalSumMax) * 100;
                                                                            return (
                                                                                <td className='border border-black p-1 text-center font-bold'>
                                                                                    {Math.round(calcPct)}%
                                                                                </td>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <td className='border border-black p-1 text-center font-bold'>
                                                                                -
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td className='border border-black p-1 text-center font-bold'>
                                                                            {Math.round(Number(groupPer))}%
                                                                        </td>
                                                                    );
                                                                })()}
                                                                {(() => {
                                                                    const gradeRow = getStudentGradeListRow(
                                                                        report.AMST_Id || report.amsT_Id
                                                                    );
                                                                    const yearlyPer =
                                                                        gradeRow?.YearlyMarks_PER ?? gradeRow?.yearlyMarks_PER ?? '';
                                                                    if (yearlyPer === '') {
                                                                        if (yearlyAvgMaxSum > 0) {
                                                                            const calcPct = (yearlyAvgObtSum / yearlyAvgMaxSum) * 100;
                                                                            return (
                                                                                <td className='border border-black p-1 text-center font-bold'>
                                                                                    {Math.round(calcPct)}%
                                                                                </td>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <td className='border border-black p-1 text-center font-bold'>
                                                                                -
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <td className='border border-black p-1 text-center font-bold'>
                                                                            {Math.round(Number(yearlyPer))}%
                                                                        </td>
                                                                    );
                                                                })()}
                                                            </tr>

                                                            {/* Attendance Row */}
                                                            <tr>
                                                                <td className='border border-black p-1 text-left font-bold'>Attendance</td>
                                                                {groups.map((grp: any, gIdx: number) => {
                                                                    const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                                                                    const att = findAttendance(grpName);
                                                                    return (
                                                                        <td
                                                                            key={gIdx}
                                                                            colSpan={getGrpExams(grp).length || 1}
                                                                            className='border border-black p-1 text-center font-bold'>
                                                                            {att ? (
                                                                                <span>
                                                                                    {att.TOTALAttendancePercentage ?? att.percentage}%
                                                                                </span>
                                                                            ) : (
                                                                                '-'
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                                <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                                    {(() => {
                                                                        const att = findAverageAttendance();
                                                                        return att ? (
                                                                            <span>{att.TOTALAttendancePercentage ?? att.percentage}%</span>
                                                                        ) : (
                                                                            '-'
                                                                        );
                                                                    })()}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Skills (Social / Work Habits) Section */}
                                                {reportData.skilllist_temp && reportData.skilllist_temp.length > 0 && (
                                                    <div className='mb-4 flex w-full flex-row flex-wrap gap-6 pt-6 print:my-0'>
                                                        {(() => {
                                                            const getSkillGrade = (termId: number, activityId: number) => {
                                                                const skillRecord = report.studentSkills?.find((gs: any) => {
                                                                    const gsTermId = gs.ecT_Id ?? gs.ECT_Id;
                                                                    const gsActivityId = gs.ecsA_Id ?? gs.ECSA_Id;
                                                                    return (
                                                                        Number(gsTermId) === Number(termId) &&
                                                                        Number(gsActivityId) === Number(activityId)
                                                                    );
                                                                });
                                                                return (
                                                                    skillRecord?.emgD_Name_F4 ??
                                                                    skillRecord?.EMGD_Name_F4 ??
                                                                    skillRecord?.emgD_Name ??
                                                                    skillRecord?.EMGD_Name ??
                                                                    ''
                                                                );
                                                            };

                                                            return reportData.skilllist_temp.map((skill: any, skIdx: number) => {
                                                                const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                                                const skillName = skill.ECS_SkillName ?? skill.ecS_SkillName;
                                                                const activities =
                                                                    reportData.activitylist_temp?.filter(
                                                                        (act: any) => Number(act.ECS_Id ?? act.ecS_Id) === Number(skillId)
                                                                    ) || [];

                                                                return (
                                                                    <div key={skIdx} className='min-w-[300px] flex-1'>
                                                                        <table
                                                                            className='table-bordered table w-full border-collapse border border-black text-xs'
                                                                            style={{ fontFamily: 'system-ui' }}>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th className='border border-black bg-[#d1d5db] p-1.5 text-left font-bold uppercase print:bg-[#d1d5db]'>
                                                                                        {skillName}
                                                                                    </th>
                                                                                    {reportData.gettermdetails?.map(
                                                                                        (term: any, tIdx: number) => (
                                                                                            <th
                                                                                                key={tIdx}
                                                                                                className='w-24 border border-black bg-gray-500 p-1.5 text-center font-bold text-white'>
                                                                                                {term.ecT_TermName}
                                                                                            </th>
                                                                                        )
                                                                                    )}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {activities.map((act: any, aIdx: number) => {
                                                                                    const actId = act.ECSA_Id ?? act.ecsA_Id;
                                                                                    const actName =
                                                                                        act.ECSA_SkillArea ?? act.ecsA_SkillArea;
                                                                                    return (
                                                                                        <tr key={aIdx}>
                                                                                            <td className='border border-black p-1.5 text-left font-medium'>
                                                                                                {actName}
                                                                                            </td>
                                                                                            {reportData.gettermdetails?.map(
                                                                                                (term: any, tIdx: number) => {
                                                                                                    const termId =
                                                                                                        term.ecT_Id ?? term.ECT_Id;
                                                                                                    const grade = getSkillGrade(
                                                                                                        termId,
                                                                                                        actId
                                                                                                    );
                                                                                                    return (
                                                                                                        <td
                                                                                                            key={tIdx}
                                                                                                            className='border border-black p-1.5 text-center font-bold'>
                                                                                                            {grade || '-'}
                                                                                                        </td>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}

                                                {/* Promotion Status Section */}
                                                <div className='padding-top-5'>
                                                    <table
                                                        className='table-bordered table'
                                                        style={{ fontFamily: 'system-ui', width: '100%' }}>
                                                        <tbody>
                                                            <tr style={{ border: '0.5px solid' }}>
                                                                <th
                                                                    className='text-center font-bold'
                                                                    style={{ backgroundColor: 'gray', color: 'white' }}>
                                                                    PROMOTION STATUS
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <td className='text-left'>
                                                                    <b>{remarks || '-'}</b>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {conduct && (
                                                    <div className='flex w-full pt-2 print:my-0'>
                                                        <div className='w-full text-left font-bold text-sm'>
                                                            Conduct : <span className='font-normal'>{conduct}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Graph Analysis Box */}
                                                {localChartData && localChartData.length > 0 && (
                                                    <div className='padding-top-5'>
                                                        <table
                                                            className='table-bordered table'
                                                            style={{ fontFamily: 'system-ui', width: '100%' }}>
                                                            <tbody>
                                                                <tr style={{ border: '0.5px solid black' }}>
                                                                    <td
                                                                        colSpan={3}
                                                                        className='p-2 text-center font-bold text-white uppercase'
                                                                        style={{ backgroundColor: 'gray' }}>
                                                                        GRAPHICAL ANALYSIS
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colSpan={3} style={{ border: '0.5px solid black', padding: '8px' }}>
                                                                        <div className='mx-auto h-[320px] w-[98%]'>
                                                                            <ResponsiveContainer width='100%' height='100%'>
                                                                                <BarChart
                                                                                    data={localChartData}
                                                                                    barGap={0}
                                                                                    margin={{ top: 30, right: 10, left: -20, bottom: 10 }}>
                                                                                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                                                                    <XAxis
                                                                                        dataKey='subject'
                                                                                        tick={{
                                                                                            fontSize: 14,
                                                                                            fontWeight: 'bold',
                                                                                            fill: '#000'
                                                                                        }}
                                                                                        tickLine={false}
                                                                                        axisLine={true}
                                                                                        interval={0}
                                                                                        angle={-25}
                                                                                        textAnchor='end'
                                                                                        height={85}
                                                                                    />
                                                                                    <YAxis
                                                                                        domain={[0, 100]}
                                                                                        ticks={[0, 50, 100]}
                                                                                        tick={{
                                                                                            fontSize: 14,
                                                                                            fontWeight: 'bold',
                                                                                            fill: '#000'
                                                                                        }}
                                                                                        tickLine={false}
                                                                                        axisLine={true}
                                                                                    />

                                                                                    <Bar dataKey='highest' fill='#3f51b5' barSize={20}>
                                                                                        <LabelList
                                                                                            dataKey='highest'
                                                                                            position='top'
                                                                                            style={{
                                                                                                fontSize: 13,
                                                                                                fill: '#000',
                                                                                                fontWeight: 'bold'
                                                                                            }}
                                                                                        />
                                                                                    </Bar>
                                                                                    <Bar dataKey='average' fill='#ff5722' barSize={20}>
                                                                                        <LabelList
                                                                                            dataKey='average'
                                                                                            position='top'
                                                                                            style={{
                                                                                                fontSize: 13,
                                                                                                fill: '#000',
                                                                                                fontWeight: 'bold'
                                                                                            }}
                                                                                        />
                                                                                    </Bar>
                                                                                    <Bar dataKey='obtained' fill='#00ff00' barSize={20}>
                                                                                        <LabelList
                                                                                            dataKey='obtained'
                                                                                            position='top'
                                                                                            style={{
                                                                                                fontSize: 13,
                                                                                                fill: '#000',
                                                                                                fontWeight: 'bold'
                                                                                            }}
                                                                                        />
                                                                                    </Bar>
                                                                                </BarChart>
                                                                            </ResponsiveContainer>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr style={{ border: '0.5px solid black' }}>
                                                                    <td colSpan={3} className='p-2 text-center font-bold'>
                                                                        <div className='flex items-center justify-center gap-12 text-black text-sm'>
                                                                            <span className='flex items-center gap-2'>
                                                                                <span
                                                                                    className='inline-block h-3.5 w-3.5 bg-[#3f51b5]'
                                                                                    style={{ border: '0.5px solid black' }}></span>
                                                                                Highest Marks
                                                                            </span>
                                                                            <span className='flex items-center gap-2'>
                                                                                <span
                                                                                    className='inline-block h-3.5 w-3.5 bg-[#ff5722]'
                                                                                    style={{ border: '0.5px solid black' }}></span>
                                                                                Average Marks
                                                                            </span>
                                                                            <span className='flex items-center gap-2'>
                                                                                <span
                                                                                    className='inline-block h-3.5 w-3.5 bg-[#00ff00]'
                                                                                    style={{ border: '0.5px solid black' }}></span>
                                                                                Obtained Marks
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}

                                    {/* Signatures Section */}
                                    <div className='margin-top-100'>
                                        <table className='table' style={{ width: '100%', fontFamily: 'system-ui' }}>
                                            <tbody>
                                                <tr style={{ border: '0.5px solid' }}>
                                                    <th className='text-center font-bold'>Principal's Signature</th>
                                                    <th className='text-center font-bold'>Class Teacher's Signature</th>
                                                    <th className='text-center font-bold'>Parent's Signature</th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Dates Section */}
                                    <div className='padding-top-5'>
                                        <table className='table-bordered table' style={{ fontFamily: 'system-ui', width: '100%' }}>
                                            <tbody>
                                                <tr>
                                                    <td className='text-left'>
                                                        <b>Date of Issue: </b> &nbsp;{formatDate(payload?.issueDate) || '26/03/2024'}
                                                        <br />
                                                        <b>New Academic Session Commences on: </b> &nbsp;{formatDate(payload?.academicDate)}
                                                    </td>
                                                    <td className='text-right'>
                                                        <b>Report Card Printed On :{formatDate(payload?.reportPrintedDate)}</b> <br />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div style={{ pageBreakAfter: 'always' }}>&nbsp;</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
