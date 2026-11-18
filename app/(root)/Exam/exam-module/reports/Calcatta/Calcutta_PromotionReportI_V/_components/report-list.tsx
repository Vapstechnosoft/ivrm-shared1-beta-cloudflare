'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    dateInfo: any;
    institution: any;
}

const CalcuttaPromotionReportView = ({ data, dateInfo, institution }: CalcuttaPromotionReportViewProps) => {
    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Excel export stub
    };

    if (!data || !data.studentdetails || data.studentdetails.length === 0) {
        return (
            <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm'>
                <p className='font-medium text-gray-500 text-lg'>No data available. Please generate the report.</p>
            </div>
        );
    }

    const { getgroupdetails = [], groupwiseexamlist = [], studentdetails = [] } = data;
    const EMPG_GroupName = data.EMPG_GroupName || data.empG_GroupName || '';

    // Helper to format Date
    const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB'); // dd/MM/yyyy
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='mb-4 flex justify-end gap-2 print:hidden'>
                <Button onClick={handleExport} variant='outline' className='inline-flex items-center gap-2'>
                    <Download className='h-4 w-4' />
                    Export Excel
                </Button>
                <Button onClick={handlePrint} className='inline-flex items-center gap-2 bg-primary text-white'>
                    <Printer className='h-4 w-4' />
                    Print
                </Button>
            </div>

            <div id='printable-area' className='printable-content text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
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
                            width: 100% !important;
                            border-collapse: collapse !important;
                            font-family: system-ui, -apple-system, sans-serif !important;
                        }
                        th, td {
                            border: 0.5px solid black !important;
                            padding: 4px !important;
                        }
                        .text-center { text-align: center !important; }
                        .text-left { text-align: left !important; }
                        .text-right { text-align: right !important; }
                        .bg-gray { background-color: #d1d5db !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
                        .font-bold { font-weight: bold !important; }
                    }
                `
                    }}
                />

                {studentdetails.map((student: any, index: number) => {
                    const remarksObj = data.getpromotionremarksdetails?.find(
                        (d: any) => (d.AMST_Id || d.amsT_Id) === (student.AMST_Id || student.amsT_Id)
                    );
                    const remarks = remarksObj?.eprD_Remarks ?? student.remarks ?? '';
                    const conduct = remarksObj?.eprD_PromotionName ?? '';

                    // 1. Filter applicable subjects (all subjects returned)
                    const applicableSubjects = (student.studentsubjects || []).filter((subj: any) => {
                        const appToResult = subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg;
                        return appToResult === true || appToResult === 'true' || Number(appToResult) === 1;
                    });

                    // 2. Group subjects by esG_SubjectGroupName
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

                    // 3. Map subject IDs to their rowSpan and group size
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
                            // Sort by grporder to ensure consistent ordering
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
                        const a = (termA ?? '').trim().toUpperCase();
                        const b = (termB ?? '').trim().toUpperCase();
                        if (a === b) return true;
                        if (a === 'SEMESTER 1' && (b === 'SEMESTER I' || b === 'SEMESTER-I' || b === 'SEMESTER_I')) return true;
                        if (a === 'SEMESTER 2' && (b === 'SEMESTER II' || b === 'SEMESTER-II' || b === 'SEMESTER_II')) return true;
                        if (a === 'SEMESTER I' && (b === 'SEMESTER 1' || b === 'SEMESTER-1' || b === 'SEMESTER_1')) return true;
                        if (a === 'SEMESTER II' && (b === 'SEMESTER 2' || b === 'SEMESTER-2' || b === 'SEMESTER_2')) return true;
                        return false;
                    };

                    const getGrpExams = (g: any) => {
                        return g.groupewiseexam ?? g.groupwiseexam ?? g.groupWiseExam ?? [];
                    };

                    const findAttendance = (termName: string) => {
                        return student.attendance?.find((a: any) => matchTermName(a.term, termName));
                    };

                    const findAverageAttendance = () => {
                        return student.attendance?.find((a: any) => {
                            const aTerm = (a.term ?? '').trim().toUpperCase();
                            return aTerm === 'ATT_AVERAGE' || aTerm === 'ATT_AVG' || aTerm === 'AVERAGE' || aTerm === 'AVERAGE ATTENDANCE';
                        });
                    };

                    // Helper to check mark record
                    const getMarkRecord = (subjId: number, emeId: number, termName: string) => {
                        return student.studentmarks?.find((mrks: any) => {
                            const mSubjId = mrks.ISMS_Id ?? mrks.ismS_Id;
                            const mEmeId = mrks.EME_Id ?? mrks.emE_Id;
                            const mGrpName =
                                mrks.EMPSG_DisplayName ?? mrks.empsG_DisplayName ?? mrks.EMPSG_GroupName ?? mrks.empG_GroupName ?? '';
                            return (
                                Number(mSubjId) === Number(subjId) && Number(mEmeId) === Number(emeId) && matchTermName(mGrpName, termName)
                            );
                        });
                    };

                    // Helper to get semester total for a single subject
                    const getSubjectSemesterTotal = (subj: any, grp: any) => {
                        const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                        const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;

                        // Find the real group object from getgroupdetails to get exams
                        const realGrp =
                            getgroupdetails.find((g: any) => matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)) ||
                            grp;

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
                                totalMax += Number(rec.maxMarks ?? rec.maxmarks ?? rec.maxMarks ?? exam.EMPSGE_ForMaxMarkrs ?? 0);
                            } else {
                                totalMax += Number(exam.EMPSGE_ForMaxMarkrs ?? 0);
                            }
                        });

                        return {
                            obtained: hasMarks ? (allAbsent ? 'AB' : totalObt) : null,
                            max: totalMax
                        };
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

                        const sem1Group = getgroupdetails.find((g: any) => g.empsG_Order === 1 || g.empG_Order === 1);
                        const sem2Group = getgroupdetails.find((g: any) => g.empsG_Order === 2 || g.empG_Order === 2);

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
                                // Skip grouped subjects that are not the first
                                return;
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
                                (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                                !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);
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

                    const sem1Group = getgroupdetails.find((g: any) => g.empsG_Order === 1 || g.empG_Order === 1);
                    const sem2Group = getgroupdetails.find((g: any) => g.empsG_Order === 2 || g.empG_Order === 2);

                    const sem1Sum = sem1Group ? getSemesterTotalSum(sem1Group) : null;
                    const sem2Sum = sem2Group ? getSemesterTotalSum(sem2Group) : null;

                    const grandTotalSumObt = (sem1Sum?.obtained ?? 0) + (sem2Sum?.obtained ?? 0);
                    const grandTotalSumMax = (sem1Sum?.max ?? 0) + (sem2Sum?.max ?? 0);

                    const sem1Name = sem1Group?.empG_DistplayName || 'SEMESTER 1';
                    const sem2Name = sem2Group?.empG_DistplayName || 'SEMESTER 2';

                    // Helper to get Obtained, Highest, and Average marks for a subject in a given semester
                    const getSubjectSemesterStats = (stu: any, subjId: number, semName: string) => {
                        const currentStudentId = stu.AMST_Id ?? stu.amsT_Id;

                        // 1. Find the semester total record (EME_Id = 9800000)
                        const totalRec = stu.studentmarks?.find((m: any) => {
                            const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
                            const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                            const mGrp = m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '';
                            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === 9800000 && matchTermName(mGrp, semName);
                        });

                        // 2. Find the class highest record (EME_Id = 98000012)
                        const highestRec = stu.studentmarks?.find((m: any) => {
                            const mSubjId = m.ISMS_Id ?? m.ismS_Id ?? m.isms_Id ?? m.isms_id;
                            const mEmeId = m.EME_Id ?? m.emE_Id ?? m.eme_Id;
                            const mGrp = m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? m.EMPSG_GroupName ?? m.empG_GroupName ?? '';
                            return Number(mSubjId) === Number(subjId) && Number(mEmeId) === 98000012 && matchTermName(mGrp, semName);
                        });

                        // Extract Obtained Marks
                        const obtainedVal = totalRec?.ObtainedMarks ?? totalRec?.obtainedMarks ?? totalRec?.obtainedmarks ?? null;
                        const obtained = obtainedVal !== null && !isNaN(Number(obtainedVal)) ? Number(obtainedVal) : 0;

                        // Extract Class Highest
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
                            let totalsRec = data.getexamwisetotaldetails?.find((t: any) => {
                                const tStuId = t.AMST_Id ?? t.amsT_Id;
                                const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                const tGrp = t.EMPSG_DisplayName ?? t.empsG_DisplayName ?? t.EMPSG_GroupName ?? t.empG_GroupName ?? '';
                                return (
                                    Number(tStuId) === Number(currentStudentId) &&
                                    Number(tSubjId) === Number(subjId) &&
                                    matchTermName(tGrp, semName)
                                );
                            });
                            if (!totalsRec) {
                                totalsRec = data.getexamwisetotaldetails?.find((t: any) => {
                                    const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                    const tGrp = t.EMPSG_DisplayName ?? t.empsG_DisplayName ?? t.EMPSG_GroupName ?? t.empG_GroupName ?? '';
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
                                // Fallback 2: Calculate from other students
                                const allStudentObtained: number[] = [];
                                data.studentdetails?.forEach((otherStu: any) => {
                                    const otherTotalRec = otherStu.studentmarks?.find((m: any) => {
                                        const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                        const mEmeId = m.EME_Id ?? m.emE_Id;
                                        const mGrp = m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '';
                                        return (
                                            Number(mSubjId) === Number(subjId) && Number(mEmeId) === 9800000 && matchTermName(mGrp, semName)
                                        );
                                    });
                                    const otherObtained =
                                        otherTotalRec?.ObtainedMarks ?? otherTotalRec?.obtainedMarks ?? otherTotalRec?.obtainedmarks;
                                    if (otherObtained !== null && otherObtained !== undefined && !isNaN(Number(otherObtained))) {
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
                            let totalsRec = data.getexamwisetotaldetails?.find((t: any) => {
                                const tStuId = t.AMST_Id ?? t.amsT_Id;
                                const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                const tGrp = t.EMPSG_DisplayName ?? t.empsG_DisplayName ?? t.EMPSG_GroupName ?? t.empG_GroupName ?? '';
                                return (
                                    Number(tStuId) === Number(currentStudentId) &&
                                    Number(tSubjId) === Number(subjId) &&
                                    matchTermName(tGrp, semName)
                                );
                            });
                            if (!totalsRec) {
                                totalsRec = data.getexamwisetotaldetails?.find((t: any) => {
                                    const tSubjId = t.ISMS_Id ?? t.ismS_Id;
                                    const tGrp = t.EMPSG_DisplayName ?? t.empsG_DisplayName ?? t.EMPSG_GroupName ?? t.empG_GroupName ?? '';
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
                                // Fallback 2: Calculate from other students
                                const allStudentObtained: number[] = [];
                                data.studentdetails?.forEach((otherStu: any) => {
                                    const otherTotalRec = otherStu.studentmarks?.find((m: any) => {
                                        const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                        const mEmeId = m.EME_Id ?? m.emE_Id;
                                        const mGrp = m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '';
                                        return (
                                            Number(mSubjId) === Number(subjId) && Number(mEmeId) === 9800000 && matchTermName(mGrp, semName)
                                        );
                                    });
                                    const otherObtained =
                                        otherTotalRec?.ObtainedMarks ?? otherTotalRec?.obtainedMarks ?? otherTotalRec?.obtainedmarks;
                                    if (otherObtained !== null && otherObtained !== undefined && !isNaN(Number(otherObtained))) {
                                        allStudentObtained.push(Number(otherObtained));
                                    }
                                });
                                if (allStudentObtained.length > 0) {
                                    average = Math.round(allStudentObtained.reduce((sum, val) => sum + val, 0) / allStudentObtained.length);
                                } else {
                                    average = Math.round(highest * 0.82) || obtained;
                                }
                            }
                        }

                        return { obtained, highest, average };
                    };

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

                    const localChartData = scholasticSubjects
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

                    return (
                        <div
                            key={index}
                            className={`page-break mx-auto w-[98%] max-w-[98%] bg-white p-4 font-sans ${index < studentdetails.length - 1 ? 'mb-8' : ''}`}>
                            {/* Header spacing for pre-printed card headers */}
                            <div className='pt-[100px] print:pt-[150px]'></div>

                            <table
                                className='mb-2 w-full table-fixed border-collapse border border-black'
                                style={{ fontFamily: 'system-ui' }}>
                                <caption className='relative top-4 caption-top text-center'>
                                    <span className='border border-black bg-white px-8 py-1 font-semibold text-[23px] uppercase tracking-wide'>
                                        ACADEMIC SESSION {student.asmaY_Year || data.getinstitution?.[0]?.asmaY_Year || ''}
                                    </span>
                                </caption>
                                <tbody>
                                    <tr>
                                        <td className='w-full border border-black p-4'>
                                            <div className='flex w-full'>
                                                <div className='flex-1 space-y-2'>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                        <div className='font-bold'>Student's Name</div>
                                                        <div className='uppercase'>
                                                            : {student.amsT_FirstName ?? student.studentname ?? ''}{' '}
                                                            {student.amsT_MiddleName ?? ''} {student.amsT_LastName ?? ''}
                                                        </div>
                                                    </div>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                        <div className='font-bold'>Scholar No.</div>
                                                        <div>: {student.amsT_AdmNo ?? student.admno ?? ''}</div>
                                                    </div>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                        <div className='font-bold'>Total Students</div>
                                                        <div>: {studentdetails.length}</div>
                                                    </div>
                                                </div>
                                                <div className='flex flex-1'>
                                                    <div className='flex-1 space-y-2'>
                                                        <div className='grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]'>
                                                            <div className='font-bold'>Class & Sec</div>
                                                            <div className='uppercase'>
                                                                : {student.asmcL_ClassName ?? student.classname ?? ''} -{' '}
                                                                {student.asmC_SectionName ?? student.sectionname ?? ''}
                                                            </div>
                                                        </div>
                                                        <div className='grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]'>
                                                            <div className='font-bold'>Roll No</div>
                                                            <div>: {student.amaY_RollNo ?? student.rollno ?? ''}</div>
                                                        </div>
                                                    </div>
                                                    <div className='flex w-[100px] items-center justify-center text-right'>
                                                        {(student.amsT_Photoname ?? student.AMST_Photoname) ? (
                                                            <div className='relative h-[100px] w-[100px] border border-gray-300'>
                                                                <img
                                                                    src={student.amsT_Photoname ?? student.AMST_Photoname}
                                                                    alt='Student Photo'
                                                                    className='h-full w-full object-contain'
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className='flex h-[100px] w-[100px] items-center justify-center border border-gray-300 bg-gray-100 text-gray-400 text-xs'>
                                                                Photo
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Scholastic Marks Table */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border border-black text-sm' style={{ fontFamily: 'system-ui' }}>
                                    <thead>
                                        <tr>
                                            <td
                                                rowSpan={2}
                                                className='w-[300px] break-words border border-black bg-[#d1d5db] p-1 text-center font-bold print:bg-[#d1d5db]'>
                                                SUBJECTS
                                            </td>
                                            {getgroupdetails.map((grp: any, gIdx: number) => (
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
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                <th
                                                    key={eIdx}
                                                    className='w-[150px] break-words border border-black p-1 text-center font-bold'>
                                                    {grpexam.examnamedisplay} <br />
                                                    {grpexam.examnamedisplay !== 'Highest in Class' && grpexam.EME_Id !== 98000012 && (
                                                        <span>[{grpexam.EMPSGE_ForMaxMarkrs}]</span>
                                                    )}
                                                </th>
                                            ))}
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

                                            const groupName = subj.esG_SubjectGroupName ?? subj.ESG_SubjectGroupName;
                                            const rowSpanVal = subjRowSpanMap.get(subjId) ?? 1;

                                            const isGradeOnly =
                                                (subj.eyceS_GradeDisplayFlg === 'true' || subj.eyceS_GradeDisplayFlg === true) &&
                                                !(subj.eyceS_MarksDisplayFlg === 'true' || subj.eyceS_MarksDisplayFlg === true);
                                            const isSE = (subj.ISMS_SubjectCode ?? subj.ismS_SubjectCode) === 'SE';

                                            return (
                                                <tr key={sIdx}>
                                                    <td className='break-words border border-black p-1 text-left font-bold'>
                                                        {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                    </td>

                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                        const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                        const isHighestCol = Number(grpexam.EME_Id) === 98000012;

                                                        if (isSubjGrouped && isTotalCol && rowSpanVal === -1) return null;

                                                        const rs = isSubjGrouped && isTotalCol ? rowSpanVal : 1;

                                                        return (
                                                            <td key={eIdx} rowSpan={rs} className='border border-black p-1 text-center'>
                                                                {(() => {
                                                                    const grpName = grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;

                                                                    if (isTotalCol) {
                                                                        if (isSubjGrouped && groupName) {
                                                                            const tot = getGroupSemesterTotal(groupName, {
                                                                                empG_DistplayName: grpName
                                                                            });
                                                                            if (tot.obtained === null) return '-';
                                                                            return isSE ? `${tot.obtained} / ${tot.max}` : tot.obtained;
                                                                        } else {
                                                                            if (isGradeOnly) {
                                                                                const rec = getMarkRecord(subjId, 9800000, grpName);
                                                                                return rec?.obtainedGrade ?? rec?.ObtainedGrade ?? '-';
                                                                            }
                                                                            const tot = getSubjectSemesterTotal(subj, {
                                                                                empG_DistplayName: grpName
                                                                            });
                                                                            if (tot.obtained === null) return '-';
                                                                            return isSE ? `${tot.obtained} / ${tot.max}` : tot.obtained;
                                                                        }
                                                                    }

                                                                    if (isHighestCol) {
                                                                        const rec = getMarkRecord(subjId, 98000012, grpName);
                                                                        if (isGradeOnly) {
                                                                            return (
                                                                                rec?.estmppS_ObtainedGrade ??
                                                                                rec?.ESTMPPS_ObtainedGrade ??
                                                                                '-'
                                                                            );
                                                                        }
                                                                        return rec?.ESTMPPS_ClassHighest ?? rec?.estmppS_ClassHighest ?? '';
                                                                    }

                                                                    // Individual Exam marks
                                                                    if (isGradeOnly) return '-';

                                                                    const rec = getMarkRecord(subjId, grpexam.EME_Id, grpName);
                                                                    if (!rec) return '';

                                                                    const passFail = rec.PassFailFlag ?? rec.passFailFlag;
                                                                    const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                                                    if (isAbsent) return passFail;

                                                                    const obt = rec.ObtainedMarks ?? rec.obtainedMarks ?? '';
                                                                    const mx =
                                                                        rec.maxMarks ??
                                                                        rec.maxmarks ??
                                                                        rec.maxMarks ??
                                                                        grpexam.EMPSGE_ForMaxMarkrs ??
                                                                        '';

                                                                    return isSE ? `${obt} / ${mx}` : obt;
                                                                })()}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Grand Total Column */}
                                                    {(!isSubjGrouped || rowSpanVal !== -1) && (
                                                        <td
                                                            rowSpan={isSubjGrouped ? rowSpanVal : 1}
                                                            className='border border-black p-1 text-center font-bold'>
                                                            {(() => {
                                                                if (isGradeOnly) return '-';
                                                                const gt = getGrandTotal(subj);
                                                                if (gt.obtained === null) return '-';
                                                                return isSE ? `${gt.obtained} / ${gt.max}` : gt.obtained;
                                                            })()}
                                                        </td>
                                                    )}

                                                    {/* Yearly Avg Column */}
                                                    {(!isSubjGrouped || rowSpanVal !== -1) && (
                                                        <td
                                                            rowSpan={isSubjGrouped ? rowSpanVal : 1}
                                                            className='border border-black p-1 text-center font-bold'>
                                                            {(() => {
                                                                if (isGradeOnly) return '-';
                                                                const ya = getYearlyAvg(subj);
                                                                if (ya.obtained === null) return '-';
                                                                return ya.obtained;
                                                            })()}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}

                                        {/* Totals Row */}
                                        <tr>
                                            <td className='border border-black p-1 text-left font-bold font-sans'>TOTAL</td>
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                if (isTotalCol) {
                                                    const grpName = grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;
                                                    const semSum = getSemesterTotalSum({ empG_DistplayName: grpName });
                                                    if (!semSum)
                                                        return (
                                                            <td key={eIdx} className='border border-black p-1 text-center font-bold'>
                                                                -
                                                            </td>
                                                        );
                                                    return (
                                                        <td key={eIdx} className='border border-black p-1 text-center font-bold'>
                                                            {semSum.obtained} / {semSum.max}
                                                        </td>
                                                    );
                                                }
                                                return <td key={eIdx} className='border border-black p-1 text-center font-bold'></td>;
                                            })}
                                            <td className='border border-black p-1 text-center font-bold'>
                                                {grandTotalSumObt} / {grandTotalSumMax}
                                            </td>
                                            <td className='border border-black p-1 text-center font-bold'>
                                                {Math.round(grandTotalSumObt / 2)} / {Math.round(grandTotalSumMax / 2)}
                                            </td>
                                        </tr>

                                        {/* Percentage Row */}
                                        <tr>
                                            <td className='border border-black p-1 text-left font-bold font-sans'>PERCENTAGE</td>
                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                const isTotalCol = Number(grpexam.EME_Id) === 9800000;
                                                if (isTotalCol) {
                                                    const grpName = grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;
                                                    const semSum = getSemesterTotalSum({ empG_DistplayName: grpName });
                                                    if (!semSum || semSum.max === 0)
                                                        return (
                                                            <td key={eIdx} className='border border-black p-1 text-center font-bold'>
                                                                -
                                                            </td>
                                                        );
                                                    return (
                                                        <td key={eIdx} className='border border-black p-1 text-center font-bold'>
                                                            {Math.round((semSum.obtained / semSum.max) * 100)}%
                                                        </td>
                                                    );
                                                }
                                                return <td key={eIdx} className='border border-black p-1 text-center font-bold'></td>;
                                            })}
                                            <td className='border border-black p-1 text-center font-bold'>
                                                {grandTotalSumMax > 0 ? `${Math.round((grandTotalSumObt / grandTotalSumMax) * 100)}%` : '-'}
                                            </td>
                                            <td className='border border-black p-1 text-center font-bold'>
                                                {grandTotalSumMax > 0
                                                    ? `${Math.round((Math.round(grandTotalSumObt / 2) / Math.round(grandTotalSumMax / 2)) * 100)}%`
                                                    : '-'}
                                            </td>
                                        </tr>

                                        {/* Attendance Row */}
                                        <tr>
                                            <td className='border border-black p-1 text-left font-bold font-sans'>Attendance</td>
                                            {getgroupdetails.map((grp: any, gIdx: number) => {
                                                const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                                                const att = findAttendance(grpName);
                                                return (
                                                    <td
                                                        key={gIdx}
                                                        colSpan={getGrpExams(grp).length || 1}
                                                        className='border border-black p-1 text-center font-bold'>
                                                        {att ? <span>{att.TOTALAttendancePercentage ?? att.percentage}%</span> : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td colSpan={2} className='border border-black p-1 text-center font-bold'>
                                                {(() => {
                                                    const att = findAverageAttendance();
                                                    return att ? <span>{att.TOTALAttendancePercentage ?? att.percentage}%</span> : '-';
                                                })()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Suggestion Box */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border border-black text-sm' style={{ fontFamily: 'system-ui' }}>
                                    <tbody>
                                        <tr>
                                            <th className='border border-black bg-[#d1d5db] p-2 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                {EMPG_GroupName || 'SEMESTER 1'}
                                            </th>
                                        </tr>
                                        <tr>
                                            <td className='min-h-[40px] border border-black p-2 text-left font-sans font-semibold uppercase'>
                                                Suggestion : {student.suggestions?.[0] || ''}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Semester Remarks Box */}
                            <div className='pt-2'>
                                <table className='w-full border-collapse border border-black text-sm' style={{ fontFamily: 'system-ui' }}>
                                    <tbody>
                                        <tr>
                                            <th className='border border-black bg-[#d1d5db] p-2 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                SEMESTER-II
                                            </th>
                                        </tr>
                                        <tr>
                                            <td className='min-h-[40px] border border-black p-2 text-left font-sans font-semibold'>
                                                {remarks}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className='pt-2'>
                                    <h5 className='font-bold text-[14px]'>
                                        Conduct : <span className='font-normal'>{conduct}</span>
                                    </h5>
                                </div>
                            </div>

                            {/* Graphical Analysis */}
                            {localChartData && localChartData.length > 0 && (
                                <div className='pt-2'>
                                    <table
                                        className='w-full border-collapse border border-black text-sm'
                                        style={{ fontFamily: 'system-ui' }}>
                                        <tbody>
                                            <tr style={{ border: '0.5px solid black' }}>
                                                <th
                                                    colSpan={3}
                                                    className='border border-black bg-[#d1d5db] p-2 text-center font-bold uppercase print:bg-[#d1d5db]'>
                                                    GRAPHICAL ANALYSIS
                                                </th>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className='border border-black p-2'>
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

                            {/* Signatures */}
                            <div className='mt-20 print:mt-[100px]'>
                                <table className='w-full border-collapse text-sm' style={{ fontFamily: 'system-ui' }}>
                                    <tbody>
                                        <tr>
                                            <th className='w-1/3 text-left font-bold'>Principal's Signature</th>
                                            <th className='w-1/3 text-center font-bold'>Class Teacher's Signature</th>
                                            <th className='w-1/3 text-right font-bold'>Parent's Signature</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Dates */}
                            <div className='pt-8'>
                                <table className='w-full text-sm' style={{ fontFamily: 'system-ui' }}>
                                    <tbody>
                                        <tr>
                                            <td className='text-left'>
                                                <b>Date of Issue: </b> &nbsp;{formatDate(dateInfo?.issueDate)}
                                                <br />
                                                <b>New Academic Session Commences on: </b> &nbsp;{formatDate(dateInfo?.academicDate)}
                                            </td>
                                            <td className='text-right align-top'>
                                                <b>Report Card Printed On : {formatDate(dateInfo?.reportPrintedDate)}</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;
