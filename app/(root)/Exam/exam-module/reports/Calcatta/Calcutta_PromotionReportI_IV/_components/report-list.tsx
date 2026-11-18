'use client';

import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CalcuttaPromotionReportViewProps {
    data: any;
    institution: IMasterInstitution | Institution | null;
    examwisetotal?: any[]; // Array of highest in class records
}

const CalcuttaPromotionReportView = ({ data, institution, examwisetotal }: CalcuttaPromotionReportViewProps) => {
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

    const { getgroupdetails = [], groupwiseexamlist = [], studentdetails = [], skilllist_temp = [] } = data;
    const EMPG_GroupName = data.EMPG_GroupName || data.empG_GroupName;

    return (
        <div className='flex flex-col gap-4'>
            <div className='mb-4 flex justify-end gap-2 print:hidden'>
                <Button onClick={handleExport} variant='outline' className='inline-flex items-center gap-2'>
                    <FileSpreadsheet className='h-4 w-4' />
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
                    const dob = student.amsT_DOB ? new Date(student.amsT_DOB).toLocaleDateString('en-GB') : '';

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
                            groupSubjs.sort((a: any, b: any) => (a.grporder ?? 0) - (b.grporder ?? 0));
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

                    const getSubjectSemesterTotal = (subj: any, grpName: string) => {
                        const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                        const realGrp = getgroupdetails.find((g: any) =>
                            matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                        ) || { empG_DistplayName: grpName };
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
                        return { obtained: hasMarks ? (allAbsent ? 'AB' : totalObt) : null, max: totalMax };
                    };

                    const getSubjectSemesterHighest = (subj: any, grpName: string) => {
                        const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                        const realGrp = getgroupdetails.find((g: any) =>
                            matchTermName(g.empG_DistplayName ?? g.EMPG_DistplayName ?? '', grpName)
                        ) || { empG_DistplayName: grpName };
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

                    const getGroupSemesterTotal = (groupName: string, grpName: string) => {
                        const subjsInGroup = groupMap[groupName.trim()] || [];
                        let sumObt = 0;
                        let sumMax = 0;
                        let count = 0;
                        subjsInGroup.forEach((s: any) => {
                            const tot = getSubjectSemesterTotal(s, grpName);
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

                    const getSemesterTotalSum = (grpName: string) => {
                        let sumObt = 0;
                        let sumMax = 0;
                        let hasMarks = false;
                        applicableSubjects.forEach((subj: any) => {
                            const subjId = subj.ISMS_Id || subj.ismS_Id;
                            const rowSpan = subjRowSpanMap.get(subjId);
                            if (rowSpan !== undefined && rowSpan === -1) return;
                            const anyRec = student.studentmarks?.find((m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subjId));
                            if (anyRec) {
                                const marksDisplay =
                                    anyRec.EYCES_MarksDisplayFlg === true ||
                                    anyRec.EYCES_MarksDisplayFlg === 1 ||
                                    anyRec.EYCES_MarksDisplayFlg === 'true' ||
                                    anyRec.eyceS_MarksDisplayFlg === true ||
                                    anyRec.eyceS_MarksDisplayFlg === 1 ||
                                    anyRec.eyceS_MarksDisplayFlg === 'true';
                                const gradeDisplay =
                                    anyRec.EYCES_GradeDisplayFlg === true ||
                                    anyRec.EYCES_GradeDisplayFlg === 1 ||
                                    anyRec.EYCES_GradeDisplayFlg === 'true' ||
                                    anyRec.eyceS_GradeDisplayFlg === true ||
                                    anyRec.eyceS_GradeDisplayFlg === 1 ||
                                    anyRec.eyceS_GradeDisplayFlg === 'true';
                                const isGradeOnly = gradeDisplay && !marksDisplay;
                                if (isGradeOnly) return;
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
                            if (isGrouped && groupName) {
                                const tot = getGroupSemesterTotal(groupName, grpName);
                                if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                    sumObt += tot.obtained;
                                    sumMax += tot.max;
                                    hasMarks = true;
                                }
                            } else {
                                const tot = getSubjectSemesterTotal(subj, grpName);
                                if (tot.obtained !== null && typeof tot.obtained === 'number') {
                                    sumObt += tot.obtained;
                                    sumMax += tot.max;
                                    hasMarks = true;
                                }
                            }
                        });
                        return hasMarks ? { obtained: sumObt, max: sumMax } : null;
                    };

                    const scholasticSubjects = applicableSubjects.filter((subj: any) => {
                        const anyRec = student.studentmarks?.find(
                            (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subj.ISMS_Id ?? subj.ismS_Id)
                        );
                        if (anyRec) {
                            const marksDisplay =
                                anyRec.EYCES_MarksDisplayFlg === true ||
                                anyRec.EYCES_MarksDisplayFlg === 1 ||
                                anyRec.EYCES_MarksDisplayFlg === 'true' ||
                                anyRec.eyceS_MarksDisplayFlg === true ||
                                anyRec.eyceS_MarksDisplayFlg === 1 ||
                                anyRec.eyceS_MarksDisplayFlg === 'true';
                            const gradeDisplay =
                                anyRec.EYCES_GradeDisplayFlg === true ||
                                anyRec.EYCES_GradeDisplayFlg === 1 ||
                                anyRec.EYCES_GradeDisplayFlg === 'true' ||
                                anyRec.eyceS_GradeDisplayFlg === true ||
                                anyRec.eyceS_GradeDisplayFlg === 1 ||
                                anyRec.eyceS_GradeDisplayFlg === 'true';
                            return marksDisplay || !gradeDisplay;
                        }
                        return true;
                    });

                    const localChartData =
                        student.chartData && student.chartData.length > 0
                            ? student.chartData
                            : scholasticSubjects.map((subj: any) => {
                                  const subjId = subj.ISMS_Id ?? subj.ismS_Id;
                                  const subjectName = subj.ISMS_SubjectName ?? subj.ismS_SubjectName;

                                  const totalRec = student.studentmarks?.find((m: any) => {
                                      const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                      const mEmeId = m.EME_Id ?? m.emE_Id;
                                      const mGrpName = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                      const targetGrpName = (EMPG_GroupName ?? '')?.trim().toUpperCase();
                                      return (
                                          Number(mSubjId) === Number(subjId) &&
                                          Number(mEmeId) === 9800000 &&
                                          matchTermName(mGrpName, targetGrpName)
                                      );
                                  });

                                  const highestRec = student.studentmarks?.find((m: any) => {
                                      const mSubjId = m.ISMS_Id ?? m.ismS_Id;
                                      const mEmeId = m.EME_Id ?? m.emE_Id;
                                      const mGrpName = (m.EMPSG_DisplayName ?? m.empsG_DisplayName ?? '')?.trim().toUpperCase();
                                      const targetGrpName = (EMPG_GroupName ?? '')?.trim().toUpperCase();
                                      return (
                                          Number(mSubjId) === Number(subjId) &&
                                          Number(mEmeId) === 98000012 &&
                                          matchTermName(mGrpName, targetGrpName)
                                      );
                                  });

                                  let obtained = 0;
                                  if (totalRec) {
                                      const passFail = totalRec.PassFailFlag ?? totalRec.passFailFlag;
                                      const isAbsent = ['AB', 'M', 'L'].includes(passFail);
                                      if (!isAbsent) {
                                          const isGroupFlag =
                                              totalRec.GropuFlag === true ||
                                              totalRec.GropuFlag === 1 ||
                                              totalRec.GropuFlag === 'true' ||
                                              totalRec.gropuFlag === true ||
                                              totalRec.gropuFlag === 1 ||
                                              totalRec.gropuFlag === 'true';
                                          obtained = isGroupFlag
                                              ? Number(totalRec.GroupMarks ?? totalRec.groupMarks ?? 0)
                                              : Number(totalRec.ObtainedMarks ?? totalRec.obtainedMarks ?? 0);
                                      }
                                  }

                                  let highest = obtained;
                                  if (highestRec) {
                                      const hVal =
                                          highestRec.ESTMPPS_ClassHighest ??
                                          highestRec.estmppS_ClassHighest ??
                                          highestRec.ESTMPS_ClassHighest ??
                                          highestRec.estmpS_ClassHighest;
                                      if (hVal !== undefined && hVal !== null && !isNaN(Number(hVal)) && Number(hVal) > 0) {
                                          highest = Number(hVal);
                                      }
                                  } else if (totalRec) {
                                      const hVal =
                                          totalRec.ESTMPPS_ClassHighest ??
                                          totalRec.estmppS_ClassHighest ??
                                          totalRec.ESTMPS_ClassHighest ??
                                          totalRec.estmpS_ClassHighest;
                                      if (hVal !== undefined && hVal !== null && !isNaN(Number(hVal)) && Number(hVal) > 0) {
                                          highest = Number(hVal);
                                      }
                                  }

                                  let average = Math.round(highest * 0.82) || obtained;
                                  if (totalRec) {
                                      const avgVal =
                                          totalRec.ESTMPPS_SectionAverage ??
                                          totalRec.ESTMPS_SectionAverage ??
                                          totalRec.estmppS_SectionAverage ??
                                          totalRec.estmpS_SectionAverage ??
                                          totalRec.ESTMPPS_ClassAverage ??
                                          totalRec.ESTMPS_ClassAverage ??
                                          totalRec.estmppS_ClassAverage ??
                                          totalRec.estmpS_ClassAverage;
                                      if (avgVal !== undefined && avgVal !== null && !isNaN(Number(avgVal)) && Number(avgVal) > 0) {
                                          average = Number(avgVal);
                                      }
                                  }

                                  return {
                                      subject: subjectName,
                                      obtained,
                                      highest,
                                      average
                                  };
                              });

                    const getCellValue = (subj: any, exam: any) => {
                        const subjId = subj.ISMS_Id || subj.ismS_Id;
                        const examId = exam.EME_Id;
                        const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                        const isME = (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'ME';
                        const isSE = (subj.ISMS_SubjectCode || subj.ismS_SubjectCode) === 'SE';
                        const anyRec = student.studentmarks?.find((m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === Number(subjId));
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
                        const mr = getMarkRecord(subjId, examId, grpName);
                        const passFail = mr?.PassFailFlag ?? mr?.passFailFlag;
                        const isAbsent = ['AB', 'M', 'L'].includes(passFail || '');

                        if (examId !== 9800000 && examId !== 98000012) {
                            if (!mr) return '';
                            if (isAbsent) return gradeDisplay && isME ? '-' : 'AB';
                            if (isGradeOnly) return '-';
                            const obtainedMarks = mr.ObtainedMarks ?? mr.obtainedMarks ?? 0;
                            const maxmarks = mr.maxmarks ?? mr.maxMarks ?? mr.max_marks ?? 0;
                            if (isME && obtainedMarks !== 0) return '-';
                            return isSE ? `${obtainedMarks} / ${maxmarks}` : obtainedMarks;
                        }

                        if (examId === 9800000) {
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
                                const tot = getGroupSemesterTotal(groupName, grpName);
                                if (tot.obtained === null) return '';
                                if (tot.obtained.toString() === 'AB') return 'AB';
                                return isSE ? `${tot.obtained} / ${tot.max}` : tot.obtained;
                            }
                            if (isGradeOnly) {
                                if (!mr) return '-';
                                return mr.ObtainedGrade ?? mr.obtainedGrade ?? '-';
                            }
                            const semTotal = getSubjectSemesterTotal(subj, grpName);
                            if (semTotal.obtained === null) return '';
                            if (semTotal.obtained === 'AB') return 'AB';
                            return isSE ? `${semTotal.obtained} / ${semTotal.max}` : semTotal.obtained;
                        }

                        // 3. If it's the Highest Column (98000012)
                        if (examId === 98000012) {
                            if (isGradeOnly) {
                                if (!mr) return '-';
                                return mr.ESTMPPS_ObtainedGrade ?? mr.estmppS_ObtainedGrade ?? mr.ObtainedGrade ?? mr.obtainedGrade ?? '-';
                            }

                            // Use examwisetotal prop to get highest value
                            if (student.examwisetotal && Array.isArray(student.examwisetotal)) {
                                const highestRec = student.examwisetotal.find((rec: any) => {
                                    const recSubjId = rec.ismS_Id;
                                    const recExamId = rec.emE_Id ?? rec.EME_Id;
                                    const recGrpName = rec.empsG_GroupName ?? '';
                                    return (
                                        Number(recSubjId) === Number(subjId) &&
                                        Number(recExamId) === 98000012 &&
                                        matchTermName(recGrpName, grpName)
                                    );
                                });
                                if (highestRec) {
                                    const hVal = highestRec.estmppS_ClassHighest;
                                    if (hVal !== undefined && hVal !== null && !isNaN(Number(hVal))) {
                                        return Number(hVal);
                                    }
                                }
                            }
                            // Fallback to existing calculation if not found
                            const semHighest = getSubjectSemesterHighest(subj, grpName);
                            return semHighest !== '' ? semHighest : '';
                        }

                        return '';
                    };

                    return (
                        <div
                            key={student.amsT_Id || index}
                            className='page-break mx-auto w-[98%] max-w-[98%] bg-white p-4 pt-16 font-sans text-black'>
                            <table
                                className='mb-2 w-full table-fixed border-collapse border border-black'
                                style={{ fontFamily: 'system-ui' }}>
                                <caption className='relative top-4 caption-top text-center'>
                                    <span className='border border-black bg-white px-8 py-1 font-semibold text-[23px] uppercase tracking-wide'>
                                        ACADEMIC SESSION{' '}
                                        {student.asmaY_Year ||
                                            data.ASMAY_Year ||
                                            (institution as any)?.asmaY_Year ||
                                            data.getinstitution?.[0]?.asmaY_Year ||
                                            ''}
                                    </span>
                                </caption>
                                <tbody>
                                    <tr>
                                        <td className='w-full border border-black p-4'>
                                            <div className='flex w-full'>
                                                <div className='flex-1 space-y-2'>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 pt-6 text-[14px]'>
                                                        <div className='font-bold'>Student's Name</div>
                                                        <div className='uppercase'>
                                                            : {student.amsT_FirstName || student.studentname || ''}
                                                        </div>
                                                    </div>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                        <div className='font-bold'>Scholar No.</div>
                                                        <div>: {student.amsT_AdmNo || student.admno || ''}</div>
                                                    </div>
                                                    <div className='grid grid-cols-[120px_1fr] items-center gap-2 text-[14px]'>
                                                        <div className='font-bold'>Total Students</div>
                                                        <div>: {studentdetails.length}</div>
                                                    </div>
                                                </div>
                                                <div className='flex flex-1'>
                                                    <div className='flex-1 space-y-2'>
                                                        <div className='grid grid-cols-[80px_1fr] items-center gap-2 pt-6 text-[14px]'>
                                                            <div className='font-bold'>Class & Sec</div>
                                                            <div className='uppercase'>
                                                                : {student.classname || student.asmcL_ClassName || ''} -{' '}
                                                                {student.sectionname || student.asmC_SectionName || ''}
                                                            </div>
                                                        </div>
                                                        <div className='grid grid-cols-[80px_1fr] items-center gap-2 text-[14px]'>
                                                            <div className='font-bold'>Roll No</div>
                                                            <div>: {student.amaY_RollNo || student.rollno || 1}</div>
                                                        </div>
                                                    </div>
                                                    <div className='ml-auto flex w-[100px] items-center justify-center text-right'>
                                                        {student.amsT_Photoname || student.student_photo ? (
                                                            <div className='relative h-[100px] w-[100px] border border-gray-300'>
                                                                <img
                                                                    src={student.amsT_Photoname || student.student_photo}
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

                            {/* Main Split Table */}
                            <table className='mb-2 w-full border-collapse border-[1.5px] border-black text-[12px]'>
                                <tbody>
                                    <tr>
                                        {/* Left section: Subjects */}
                                        <td className='w-[60%] border-black border-r p-0 align-top'>
                                            <table className='w-full border-collapse'>
                                                <thead>
                                                    <tr>
                                                        <th rowSpan={2} className='border-black border-r border-b p-1 text-left'>
                                                            SUBJECTS
                                                        </th>
                                                        {getgroupdetails?.map((grp: any, idx: number) => (
                                                            <th
                                                                key={idx}
                                                                colSpan={grp.groupewiseexam?.length || 1}
                                                                className='border-black border-b bg-gray-500 p-1 text-center font-bold text-[12px] text-white uppercase'>
                                                                {EMPG_GroupName || grp.empG_DistplayName}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        {groupwiseexamlist?.map((exam: any, idx: number) => (
                                                            <th
                                                                key={idx}
                                                                className='whitespace-pre-wrap border-black border-b border-l p-1 text-center leading-tight'>
                                                                {exam.examnamedisplay}
                                                                {exam.EMPSGE_ForMaxMarkrs ? `\n[${exam.EMPSGE_ForMaxMarkrs}]` : ''}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {applicableSubjects.map((subj: any, sIdx: number) => {
                                                        const subjId = subj.ISMS_Id || subj.ismS_Id;
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
                                                                <td className='border-black border-r border-b p-1 text-left'>
                                                                    {subj.ISMS_SubjectName || subj.ismS_SubjectName}
                                                                </td>
                                                                {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                                    const examId = Number(exam.EME_Id);
                                                                    const isTotalCol = examId === 9800000;
                                                                    const isHighestCol = examId === 98000012;

                                                                    if (isSubjGrouped && isTotalCol && rowSpanVal === -1) return null;

                                                                    const rs = isSubjGrouped && isTotalCol ? rowSpanVal : 1;
                                                                    const cellValue = getCellValue(subj, exam);

                                                                    return (
                                                                        <td
                                                                            key={eIdx}
                                                                            rowSpan={rs}
                                                                            className='border-black border-b border-l p-1 text-center font-semibold'>
                                                                            {cellValue}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}

                                                    {/* TOTAL row */}
                                                    <tr>
                                                        <td className='border-black border-r border-b p-1 text-left font-bold uppercase'>
                                                            TOTAL
                                                        </td>
                                                        {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                            const isTotalCol = Number(exam.EME_Id) === 9800000;
                                                            let totalValue = '';
                                                            if (isTotalCol) {
                                                                const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                                                                const semSum = getSemesterTotalSum(grpName);
                                                                if (semSum) {
                                                                    totalValue = `${semSum.obtained} / ${semSum.max}`;
                                                                } else {
                                                                    totalValue = '-';
                                                                }
                                                            }
                                                            return (
                                                                <td
                                                                    key={eIdx}
                                                                    className='border-black border-b border-l p-1 text-center font-bold'>
                                                                    {totalValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>

                                                    {/* Percentage row */}
                                                    <tr>
                                                        <td className='border-black border-r border-b p-1 text-left font-bold uppercase'>
                                                            PERCENTAGE
                                                        </td>
                                                        {groupwiseexamlist?.map((exam: any, eIdx: number) => {
                                                            const isTotalCol = Number(exam.EME_Id) === 9800000;
                                                            let percValue = '';
                                                            if (isTotalCol) {
                                                                const grpName = exam.EMPG_DistplayName || exam.empG_DistplayName;
                                                                const semSum = getSemesterTotalSum(grpName);
                                                                if (semSum && semSum.max > 0) {
                                                                    percValue = `${((semSum.obtained / semSum.max) * 100).toFixed(2)}%`;
                                                                } else {
                                                                    percValue = '-';
                                                                }
                                                            }
                                                            return (
                                                                <td
                                                                    key={eIdx}
                                                                    className='border-black border-b border-l p-1 text-center font-bold'>
                                                                    {percValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>

                                                    {/* Attendance row */}
                                                    <tr>
                                                        <td className='border-black border-r p-1 text-left font-bold uppercase'>
                                                            Attendance
                                                        </td>
                                                        {getgroupdetails?.map((grp: any, gIdx: number) => {
                                                            const grpName = grp.empG_DistplayName ?? grp.EMPG_DistplayName;
                                                            const att = student.attendance?.find((a: any) => {
                                                                const aTerm = a.EMPSG_DisplayName ?? a.term ?? '';
                                                                return matchTermName(aTerm, grpName);
                                                            });
                                                            const attVal = att?.TOTALAttendancePercentage ?? att?.percentage;
                                                            const attText =
                                                                attVal !== undefined && attVal !== null && attVal !== ''
                                                                    ? `${attVal}%`
                                                                    : '-';
                                                            return (
                                                                <td
                                                                    key={gIdx}
                                                                    colSpan={grp.groupewiseexam?.length || 1}
                                                                    className='border-black border-l p-1 text-center font-bold'>
                                                                    {attText}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>

                                        {/* Right section: Skills */}
                                        <td className='w-[40%] p-0 align-top'>
                                            <table className='w-full border-collapse'>
                                                <thead>
                                                    <tr>
                                                        <th className='border-black border-r border-b p-1'>&nbsp;</th>
                                                        <th className='w-20 border-black border-b bg-gray-500 p-1 text-center font-bold text-[12px] text-white uppercase'>
                                                            {EMPG_GroupName || 'SEMESTER 1'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const selectedTerm = EMPG_GroupName ? EMPG_GroupName.trim().toUpperCase() : '';
                                                        const termToFilter = selectedTerm || 'SEMESTER 1';

                                                        // Filter student skills for the selected term
                                                        const termFilteredSkills =
                                                            student.studentSkills?.filter((s: any) => {
                                                                const termName = (s.ecT_TermName || s.ECT_TermName)?.trim().toUpperCase();
                                                                return termName === termToFilter;
                                                            }) || [];

                                                        // Get unique active skill IDs/Names that are actually present for this term
                                                        const activeSkillIds = new Set(
                                                            termFilteredSkills.map((s: any) => s.ECS_Id ?? s.ecS_Id)
                                                        );

                                                        // Filter skill list headings
                                                        const filteredSkillHeadings =
                                                            skilllist_temp?.filter((skill: any) => {
                                                                const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                                                return activeSkillIds.has(skillId);
                                                            }) || [];

                                                        return filteredSkillHeadings.map((skill: any) => {
                                                            const skillId = skill.ECS_Id ?? skill.ecS_Id;
                                                            const skillName = skill.ecS_SkillName || skill.ECS_SkillName;

                                                            // Sub-skills for this specific heading
                                                            const subSkills = termFilteredSkills.filter(
                                                                (s: any) => (s.ECS_Id ?? s.ecS_Id) === skillId
                                                            );

                                                            return (
                                                                <React.Fragment key={skillId}>
                                                                    <tr>
                                                                        <td
                                                                            colSpan={2}
                                                                            className='border-black border-b p-1 text-center font-bold text-[12px] uppercase'>
                                                                            {skillName}
                                                                        </td>
                                                                    </tr>
                                                                    {subSkills.map((sct: any, sIdx: number) => {
                                                                        const skillArea = sct.ecsA_SkillArea || sct.ECSA_SkillArea;
                                                                        const grade =
                                                                            sct.emgD_Name_F4 ||
                                                                            sct.EMGD_Name_F4 ||
                                                                            sct.emgD_Name ||
                                                                            sct.EMGD_Name;
                                                                        return (
                                                                            <tr key={sIdx}>
                                                                                <td className='border-black border-r border-b p-1 font-semibold text-[11px]'>
                                                                                    {skillArea}
                                                                                </td>
                                                                                <td className='border-black border-b p-1 text-center font-bold'>
                                                                                    {grade}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </React.Fragment>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Suggestion Box */}
                            <table className='mb-2 w-full border-collapse border-[1.5px] border-black font-bold text-[12px]'>
                                <tbody>
                                    <tr>
                                        <td className='border-black border-b bg-gray-100 p-1 text-center uppercase'>
                                            {EMPG_GroupName || 'SEMESTER 1'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left uppercase'>Suggestion : {student.suggestions[0] || ''}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Graph Analysis Box */}
                            {localChartData && localChartData.length > 0 && (
                                <table className='mb-8 w-full border-collapse border-[1.5px] border-black font-bold text-[12px]'>
                                    <tbody>
                                        <tr>
                                            <td colSpan={3} className='border-black border-b bg-gray-100 p-1 text-center uppercase'>
                                                GRAPHICAL ANALYSIS
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3} className='border-black border-b p-2'>
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
                                            <td colSpan={3} className='border border-black p-2 text-center font-bold'>
                                                <div className='flex items-center justify-center gap-12 font-bold text-black text-sm'>
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
                            )}

                            {/* Signatures Box */}
                            <table className='w-full border-collapse border-[1.5px] border-black text-center font-bold text-[13px]'>
                                <tbody>
                                    <tr>
                                        <td className='w-1/3 border-black border-r p-2'>Principal's Signature</td>
                                        <td className='w-1/3 border-black border-r p-2'>Class Teacher's Signature</td>
                                        <td className='w-1/3 p-2'>Parent's Signature</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Issue Date */}
                            <div className='mt-2 font-bold text-[13px]'>Date of issue : {new Date().toLocaleDateString('en-GB')}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalcuttaPromotionReportView;
