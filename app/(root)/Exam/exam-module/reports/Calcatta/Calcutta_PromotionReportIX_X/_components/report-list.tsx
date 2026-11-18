'use client';

import { Button } from '@/components/ui/button';
import { getCalcuttaPromotionReportI_IX } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report-ix';
import { Download, Loader2, Printer } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';
import CalcuttaPromotionReportForm from './report-form';

export default function CalcuttaPromotionReportIX_XList() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [payload, setPayload] = useState<any>(null);

    const handleGenerate = async (data: any) => {
        try {
            setLoading(true);
            setPayload(data);
            const result = await getCalcuttaPromotionReportI_IX(data);
            console.log('Calcutta Promotion Report IX_X response:', result);
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
                max: Number(rec.maxMarks ?? rec.maxmarks ?? rec.EMPS_MaxMarks ?? 100)
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
                return appToResult === true || appToResult === 'true' || Number(appToResult) === 1;
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

                rows.push({
                    'Student Name': '',
                    Class: '',
                    Section: '',
                    'Roll No': '',
                    'Scholar No': '',
                    Subject: subj.ISMS_SubjectName || subj.ismS_SubjectName,
                    [sem1Name.toUpperCase()]: isGradeOnly ? '-' : (sem1MarksObj?.obtained ?? '-'),
                    [`Total [100] (${sem1Name})`]: isGradeOnly
                        ? getSubjectSemesterGrade(student, subjId, sem1Name)
                        : (sem1GroupObj.obtained ?? '-'),
                    [sem2Name.toUpperCase()]: isGradeOnly ? '-' : (sem2MarksObj?.obtained ?? '-'),
                    [`Total [100] (${sem2Name})`]: isGradeOnly
                        ? getSubjectSemesterGrade(student, subjId, sem2Name)
                        : (sem2GroupObj.obtained ?? '-'),
                    'Grand Total [200]': isGradeOnly ? '-' : (grandObt ?? '-'),
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
        XLSX.writeFile(workbook, `Calcutta_PromotionReport_IX_X.xlsx`);
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
                        <Button onClick={handleExport} variant='outline' className='inline-flex items-center gap-2'>
                            <Download className='h-4 w-4' />
                            Export Excel
                        </Button>
                        <Button onClick={handlePrint} className='inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90'>
                            <Printer className='h-4 w-4' />
                            Print
                        </Button>
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
                                    width: 100% !important;
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

                        {reportData.studentdetails.map((student: any, index: number) => {
                            const studentName =
                                student.studentname ??
                                student.studentName ??
                                `${student.amsT_FirstName ?? student.AMST_FirstName ?? ''} ${student.amsT_MiddleName ?? student.AMST_MiddleName ?? ''} ${student.amsT_LastName ?? student.AMST_LastName ?? ''}`.trim();
                            const admNo = student.admno ?? student.admNo ?? student.amsT_AdmNo ?? student.AMST_AdmNo ?? '';
                            const className =
                                student.classname ?? student.className ?? student.asmcL_ClassName ?? student.ASMCL_ClassName ?? '';
                            const sectionName =
                                student.sectionname ?? student.sectionName ?? student.asmC_SectionName ?? student.ASMC_SectionName ?? '';
                            const rollNo = student.rollno ?? student.rollNo ?? student.amaY_RollNo ?? student.AMAY_RollNo ?? '';
                            const photoName = student.AMST_Photoname ?? student.amsT_Photoname ?? student.AMST_Photoname ?? '';

                            const studentId = student.AMST_Id || student.amsT_Id;

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
                                student.remarks ??
                                '-';
                            const conduct =
                                remarksObj?.eprD_PromotionName ?? remarksObj?.eprd_PromotionName ?? remarksObj?.eprd_promotionname ?? '';

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

                            const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                                const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                                return appToResult === true || appToResult === 'true' || Number(appToResult) === 1;
                            });

                            // Helper to get Obtained, Highest, and Average marks for a subject in a given semester
                            const getSubjectSemesterStats = (stu: any, subjId: number, semName: string) => {
                                const currentStudentId = stu.AMST_Id ?? stu.amsT_Id;

                                // 1. Find the semester total record (EME_Id = 9800000)
                                const totalRec = stu.studentmarks?.find((m: any) => {
                                    const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
                                    const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                                    const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '')
                                        ?.trim()
                                        .toUpperCase();
                                    return (
                                        Number(mSubjId) === Number(subjId) &&
                                        Number(mEmeId) === 9800000 &&
                                        mGrp === semName.trim().toUpperCase()
                                    );
                                });

                                // 2. Find the class highest record (EME_Id = 98000012)
                                const highestRec = stu.studentmarks?.find((m: any) => {
                                    const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
                                    const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                                    const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '')
                                        ?.trim()
                                        .toUpperCase();
                                    return (
                                        Number(mSubjId) === Number(subjId) &&
                                        Number(mEmeId) === 98000012 &&
                                        mGrp === semName.trim().toUpperCase()
                                    );
                                });

                                // Extract Obtained Marks
                                const obtainedVal = totalRec?.ObtainedMarks ?? totalRec?.obtainedMarks ?? totalRec?.obtainedmarks ?? null;
                                const obtained = obtainedVal !== null && !isNaN(Number(obtainedVal)) ? Number(obtainedVal) : 0;

                                // Extract Class Highest (NEVER read ObtainedMarks from highestRec/totalRec as that contains student's own marks!)
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
                                    // Fallback 1: Read from getexamwisetotaldetails
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
                                            tGrp === semName.trim().toUpperCase()
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
                                            return Number(tSubjId) === Number(subjId) && tGrp === semName.trim().toUpperCase();
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
                                        // Fallback 2: Calculate from other students loaded in reportData
                                        const allStudentObtained: number[] = [];
                                        reportData.studentdetails?.forEach((otherStu: any) => {
                                            const otherTotalRec = otherStu.studentmarks?.find((m: any) => {
                                                const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                const mEmeId = m.EME_Id ?? m.emE_Id;
                                                const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                                return (
                                                    Number(mSubjId) === Number(subjId) &&
                                                    Number(mEmeId) === 9800000 &&
                                                    mGrp === semName.trim().toUpperCase()
                                                );
                                            });
                                            const otherObtained =
                                                otherTotalRec?.ObtainedMarks ??
                                                otherTotalRec?.obtainedMarks ??
                                                otherTotalRec?.obtainedmarks;
                                            if (otherObtained !== null && otherObtained !== undefined && !isNaN(Number(otherObtained))) {
                                                allStudentObtained.push(Number(otherObtained));
                                            }
                                        });
                                        if (allStudentObtained.length > 0) {
                                            highest = Math.max(...allStudentObtained);
                                        } else {
                                            // Last resort: fallback to student's own obtained marks
                                            highest = obtained;
                                        }
                                    }
                                }

                                // Extract Section Average
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
                                    // Fallback 1: Read from getexamwisetotaldetails
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
                                            tGrp === semName.trim().toUpperCase()
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
                                            return Number(tSubjId) === Number(subjId) && tGrp === semName.trim().toUpperCase();
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
                                        // Fallback 2: Calculate from other students loaded in reportData
                                        const allStudentObtained: number[] = [];
                                        reportData.studentdetails?.forEach((otherStu: any) => {
                                            const otherTotalRec = otherStu.studentmarks?.find((m: any) => {
                                                const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                const mEmeId = m.EME_Id ?? m.emE_Id;
                                                const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                                return (
                                                    Number(mSubjId) === Number(subjId) &&
                                                    Number(mEmeId) === 9800000 &&
                                                    mGrp === semName.trim().toUpperCase()
                                                );
                                            });
                                            const otherObtained =
                                                otherTotalRec?.ObtainedMarks ??
                                                otherTotalRec?.obtainedMarks ??
                                                otherTotalRec?.obtainedmarks;
                                            if (otherObtained !== null && otherObtained !== undefined && !isNaN(Number(otherObtained))) {
                                                allStudentObtained.push(Number(otherObtained));
                                            }
                                        });
                                        if (allStudentObtained.length > 0) {
                                            average = Math.round(
                                                allStudentObtained.reduce((sum, val) => sum + val, 0) / allStudentObtained.length
                                            );
                                        } else {
                                            // Last resort: fallback to a percentage of highest or obtained
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
                                    (subj.eyceS_MarksEntryDesc ?? subj.EYCES_MarksEntryDesc ?? '')?.trim().toUpperCase() === 'GRADE';
                                return marksDisplay && !gradeEntry;
                            });

                            const localChartData =
                                student.chartData && student.chartData.length > 0
                                    ? student.chartData
                                    : scholasticSubjects
                                          .map((subj: any) => {
                                              const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                              const subjectName = subj.ISMS_SubjectName ?? subj.ismS_SubjectName;

                                              const sem1Stats = getSubjectSemesterStats(student, subjId, sem1Name);
                                              const sem2Stats = getSubjectSemesterStats(student, subjId, sem2Name);

                                              // Check which semesters actually have marks to avoid false averaging
                                              const hasSem1 = student.studentmarks?.some((m: any) => {
                                                  const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                  const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                                  return Number(mSubjId) === Number(subjId) && mGrp === sem1Name.trim().toUpperCase();
                                              });
                                              const hasSem2 = student.studentmarks?.some((m: any) => {
                                                  const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                                  const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                                  return Number(mSubjId) === Number(subjId) && mGrp === sem2Name.trim().toUpperCase();
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

                            // Scholastic Calculations for TOTAL row

                            let sem1TotalObt = 0;
                            let sem1TotalMax = 0;
                            let sem2TotalObt = 0;
                            let sem2TotalMax = 0;

                            scholasticSubjects.forEach((subj: any) => {
                                const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                const rowSpan = subjRowSpanMap.get(subjId);
                                if (rowSpan !== undefined && rowSpan === -1) {
                                    return; // Skip non-first grouped subjects to avoid double-counting
                                }

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

                            const matchTermName = (termA: string, termB: string) => {
                                const a = (termA ?? '').trim().toUpperCase();
                                const b = (termB ?? '').trim().toUpperCase();
                                if (a === b) return true;
                                if (a === 'SEMESTER 1' && (b === 'SEMESTER I' || b === 'SEMESTER-I' || b === 'SEMESTER_I')) return true;
                                if (a === 'SEMESTER 2' && (b === 'SEMESTER II' || b === 'SEMESTER-II' || b === 'SEMESTER_II')) return true;
                                if (a === 'SEMESTER I' && (b === 'SEMESTER 1' || b === 'SEMESTER-1' || b === 'SEMESTER_1')) return true;
                                if (a === 'SEMESTER II' && (b === 'SEMESTER 2' || b === 'SEMESTER-2' || b === 'SEMESTER_2')) return true;
                                return false;
                            };

                            const getSemesterTotalFromExamWise = (semName: string) => {
                                const rec = student.student_marks?.find((m: any) => {
                                    const mEmeId = m.EME_Id ?? m.emE_Id;
                                    const mGrp = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '')
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

                            const sem1TotalObtVal = sem1TotalObt;
                            const sem1TotalMaxVal = sem1TotalMax;

                            const sem2TotalObtVal = sem2TotalObt;
                            const sem2TotalMaxVal = sem2TotalMax;

                            const sem1PercentageVal = sem1TotalMaxVal > 0 ? Math.round((sem1TotalObtVal / sem1TotalMaxVal) * 100) : 0;
                            const sem2PercentageVal = sem2TotalMaxVal > 0 ? Math.round((sem2TotalObtVal / sem2TotalMaxVal) * 100) : 0;

                            const grandTotalObtVal = sem1TotalObtVal + sem2TotalObtVal;
                            const grandTotalMaxVal = sem1TotalMaxVal + sem2TotalMaxVal;
                            const grandPercentageVal = grandTotalMaxVal > 0 ? Math.round((grandTotalObtVal / grandTotalMaxVal) * 100) : 0;

                            const yearlyAvgObtVal = Math.round(grandTotalObtVal / 2);
                            const yearlyAvgMaxVal = Math.round(grandTotalMaxVal / 2);
                            const yearlyPercentageVal = yearlyAvgMaxVal > 0 ? Math.round((yearlyAvgObtVal / yearlyAvgMaxVal) * 100) : 0;

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
                                                    (payload?.academicYearStr || payload?.ASMAY_Year || '') +
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
                                                    <td
                                                        colSpan={2}
                                                        className='border border-black bg-[#d1d5db] p-1 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                        {sem1Name}
                                                    </td>
                                                    <td
                                                        colSpan={2}
                                                        className='border border-black bg-[#d1d5db] p-1 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                        {sem2Name}
                                                    </td>
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
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        {sem1Name} <br /> [100]
                                                    </th>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        Total <br /> [100]
                                                    </th>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        {sem2Name} <br /> [100]
                                                    </th>
                                                    <th className='w-[150px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                        Total <br /> [100]
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Applicable Subjects */}
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
                                                    const sem1GroupObj = getSemesterGroupTotal(
                                                        student,
                                                        groupMap,
                                                        subj,
                                                        sem1Name,
                                                        sem1RealExamId
                                                    );
                                                    const sem2MarksObj = getSubjectSemesterMarks(student, subjId, sem2Name, sem2RealExamId);
                                                    const sem2GroupObj = getSemesterGroupTotal(
                                                        student,
                                                        groupMap,
                                                        subj,
                                                        sem2Name,
                                                        sem2RealExamId
                                                    );

                                                    let grandObt: number | string | null = null;
                                                    let grandMax = 0;
                                                    if (sem1GroupObj.obtained !== null || sem2GroupObj.obtained !== null) {
                                                        if (
                                                            typeof sem1GroupObj.obtained === 'number' ||
                                                            typeof sem2GroupObj.obtained === 'number'
                                                        ) {
                                                            grandObt =
                                                                (Number(sem1GroupObj.obtained) || 0) + (Number(sem2GroupObj.obtained) || 0);
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

                                                    return (
                                                        <tr key={sIdx}>
                                                            {/* Column 1: Subject Name */}
                                                            <td className='break-words border border-black p-1 text-left font-bold'>
                                                                {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                            </td>

                                                            {/* Column 2: SEMESTER I Subject Total */}
                                                            <td className='border border-black p-1 text-center'>
                                                                {isGradeOnly ? '-' : (sem1MarksObj?.obtained ?? '-')}
                                                            </td>

                                                            {/* Column 3: SEMESTER I Group Total */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly
                                                                        ? getSubjectSemesterGrade(student, subjId, sem1Name)
                                                                        : (sem1GroupObj.obtained ?? '-')}
                                                                </td>
                                                            )}

                                                            {/* Column 4: SEMESTER II Subject Total */}
                                                            <td className='border border-black p-1 text-center'>
                                                                {isGradeOnly ? '-' : (sem2MarksObj?.obtained ?? '-')}
                                                            </td>

                                                            {/* Column 5: SEMESTER II Group Total */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly
                                                                        ? getSubjectSemesterGrade(student, subjId, sem2Name)
                                                                        : (sem2GroupObj.obtained ?? '-')}
                                                                </td>
                                                            )}

                                                            {/* Column 6: Grand Total */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly ? '-' : (grandObt ?? '-')}
                                                                </td>
                                                            )}

                                                            {/* Column 7: Yearly Avg */}
                                                            {(!isSubjGrouped || rowSpanVal > 0) && (
                                                                <td
                                                                    rowSpan={rowSpanVal > 0 ? rowSpanVal : 1}
                                                                    className='border border-black p-1 text-center font-bold'>
                                                                    {isGradeOnly ? '-' : (yearlyAvgObt ?? '-')}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}

                                                {/* Non-Applicable Subjects */}
                                                {student.studentsubjects.map((subj: any, sIdx: number) => {
                                                    const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                                                    if (appToResult === true || appToResult === 'true' || Number(appToResult) === 1)
                                                        return null;

                                                    const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                                    const sem1Marks = getSubjectSemesterMarks(student, subjId, sem1Name, sem1RealExamId);
                                                    const sem2Marks = getSubjectSemesterMarks(student, subjId, sem2Name, sem2RealExamId);

                                                    return (
                                                        <tr key={`non-app-${sIdx}`}>
                                                            <td className='break-words border border-black p-1 text-left font-bold'>
                                                                {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                            </td>
                                                            <td className='border border-black p-1 text-center'>
                                                                {sem1Marks?.obtained ?? '-'}
                                                            </td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                            <td className='border border-black p-1 text-center'>
                                                                {sem2Marks?.obtained ?? '-'}
                                                            </td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                            <td className='border border-black p-1 text-center'>-</td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* TOTAL Row */}
                                                <tr>
                                                    <td className='border border-black p-1 text-left font-bold uppercase'>TOTAL</td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {sem1TotalMaxVal > 0 ? `${Math.round(sem1TotalObtVal)}/${sem1TotalMaxVal}` : '-'}
                                                    </td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {sem2TotalMaxVal > 0 ? `${Math.round(sem2TotalObtVal)}/${sem2TotalMaxVal}` : '-'}
                                                    </td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {grandTotalMaxVal > 0
                                                            ? `${Math.round(grandTotalObtVal).toLocaleString('en-US')}/${grandTotalMaxVal}`
                                                            : '-'}
                                                    </td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {yearlyAvgMaxVal > 0
                                                            ? `${Math.round(yearlyAvgObtVal)}/ ${Math.round(yearlyAvgMaxVal)}`
                                                            : '-'}
                                                    </td>
                                                </tr>

                                                {/* PERCENTAGE Row */}
                                                <tr>
                                                    <td className='border border-black p-1 text-left font-bold uppercase'>PERCENTAGE</td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {sem1TotalMaxVal > 0 ? `${Math.round(sem1PercentageVal)} %` : '-'}
                                                    </td>
                                                    <td className='border border-black bg-gray-50 p-1 text-center font-bold'></td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {sem2TotalMaxVal > 0 ? `${Math.round(sem2PercentageVal)} %` : '-'}
                                                    </td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {grandTotalMaxVal > 0 ? `${Math.round(grandPercentageVal)}%` : '-'}
                                                    </td>
                                                    <td className='border border-black p-1 text-center font-bold'>
                                                        {yearlyAvgMaxVal > 0 ? `${Math.round(yearlyPercentageVal)}%` : '-'}
                                                    </td>
                                                </tr>

                                                {/* Attendance Row */}
                                                <tr>
                                                    <td className='border border-black p-1 text-left font-bold'>Attendance</td>
                                                    <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                        {(() => {
                                                            const att = student.attendance?.find(
                                                                (a: any) => a.term?.trim().toUpperCase() === sem1Name.trim().toUpperCase()
                                                            );
                                                            return att?.percentage !== undefined &&
                                                                att?.percentage !== null &&
                                                                att?.percentage !== ''
                                                                ? `${att.percentage}%`
                                                                : '-';
                                                        })()}
                                                    </td>
                                                    <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                        {(() => {
                                                            const att = student.attendance?.find(
                                                                (a: any) => a.term?.trim().toUpperCase() === sem2Name.trim().toUpperCase()
                                                            );
                                                            return att?.percentage !== undefined &&
                                                                att?.percentage !== null &&
                                                                att?.percentage !== ''
                                                                ? `${att.percentage}%`
                                                                : '-';
                                                        })()}
                                                    </td>
                                                    <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                        {(() => {
                                                            const att = student.attendance?.find(
                                                                (a: any) => a.term?.trim().toUpperCase() === 'ATT_AVERAGE'
                                                            );
                                                            return att?.percentage !== undefined &&
                                                                att?.percentage !== null &&
                                                                att?.percentage !== ''
                                                                ? `${att.percentage}%`
                                                                : '-';
                                                        })()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Suggestion Box */}
                                    <div className='padding-top-5'>
                                        <table
                                            className='table-bordered table w-full border-collapse border-[1.5px] border-black font-bold text-[12px]'
                                            style={{ fontFamily: 'system-ui' }}>
                                            <tbody>
                                                <tr style={{ border: '0.5px solid black' }}>
                                                    <td
                                                        className='border-black border-b p-1 text-center font-bold text-white uppercase'
                                                        style={{ backgroundColor: 'gray' }}>
                                                        PROMOTION STATUS
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className='border border-black p-2 text-left font-bold uppercase'>
                                                        Suggestion : {student.suggestions?.[0] || ''}
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
                                            <table className='table-bordered table' style={{ fontFamily: 'system-ui', width: '100%' }}>
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
                                                                            tick={{ fontSize: 14, fontWeight: 'bold', fill: '#000' }}
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
                                                                            tick={{ fontSize: 14, fontWeight: 'bold', fill: '#000' }}
                                                                            tickLine={false}
                                                                            axisLine={true}
                                                                        />

                                                                        <Bar dataKey='highest' fill='#3f51b5' barSize={20}>
                                                                            <LabelList
                                                                                dataKey='highest'
                                                                                position='top'
                                                                                style={{ fontSize: 13, fill: '#000', fontWeight: 'bold' }}
                                                                            />
                                                                        </Bar>
                                                                        <Bar dataKey='average' fill='#ff5722' barSize={20}>
                                                                            <LabelList
                                                                                dataKey='average'
                                                                                position='top'
                                                                                style={{ fontSize: 13, fill: '#000', fontWeight: 'bold' }}
                                                                            />
                                                                        </Bar>
                                                                        <Bar dataKey='obtained' fill='#00ff00' barSize={20}>
                                                                            <LabelList
                                                                                dataKey='obtained'
                                                                                position='top'
                                                                                style={{ fontSize: 13, fill: '#000', fontWeight: 'bold' }}
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

                                    {/* Signatures Section */}
                                    <div className='margin-top-100 print:margin-top-100'>
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
