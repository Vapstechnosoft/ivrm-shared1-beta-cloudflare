'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useMemo } from 'react';

interface ReportListProps {
    data: any;
    academicYearName: string;
    classNameVal: string;
    sectionNameVal: string;
    reOpenDate: Date | null;
}

export const ReportList = ({ data, academicYearName, classNameVal, sectionNameVal, reOpenDate }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    const student = data.stu_details?.[0] || data.studentDetails?.[0] || {};

    const exm_sub_mrks_list =
        data.eam_sub_mrks_list || data.exm_sub_mrks_list || data.subjectMarks || data.savelist || data.savelisttot || [];
    const Present_attendence = data.attendance || data.present_attendence || data.Present_attendence || [];
    const examwiseremarks = data.examRemarks || data.examwiseremarks || [];
    const grade_detailslist = data.gradeDetails || data.grade_detailslist || data.grade_details || [];
    const exmtpr = data?.exmtpr || data?.savelisttot || data?.savelist || data?.stu_details || [];

    const stuname = student.stuname || '';
    const asmcL_ClassName = student.asmcL_ClassName || classNameVal || '';
    const asmC_SectionName = student.asmC_SectionName || sectionNameVal || '';
    const amaY_RollNo = student.amaY_RollNo || '';
    const amsT_RegistrationNo = student.amsT_RegistrationNo || '';
    const amsT_FatherName = student.amsT_FatherName || student.amsT_MotherName || '';

    const street = student.amsT_PerStreet || '';
    const area = student.amsT_PerArea || '';
    const city = student.amsT_PerCity || '';
    const state = student.ivrmmS_Name || '';
    const country = student.ivrmmC_CountryName || '';
    const pincode = student.amsT_PerPincode || '';
    const amsT_DOB = student.amsT_DOB || '';
    const amsT_EmailId = student.amsT_EmailId || '';
    const AMST_Photoname = student.amsT_Photoname || '';

    const EPRD_PromotionName =
        data.eprD_PromotionName || data.EPRD_PromotionName || student.eprD_PromotionName || student.EPRD_PromotionName || '';
    const EPRD_ClassPromoted =
        data.eprD_ClassPromoted || data.EPRD_ClassPromoted || student.eprD_ClassPromoted || student.EPRD_ClassPromoted || '';

    const { exam_list, subject_list, grandTotal, percentage, rank, grade } = useMemo(() => {
        const exams: any[] = [];
        const subjects: any[] = [];
        let total = 0;

        exm_sub_mrks_list.forEach((st: any) => {
            const emeId = st.emeid || st.emE_Id || st.EME_Id;
            const examName = st.examname || st.emE_ExamName || st.EME_ExamName;

            if (emeId && examName && !exams.some((ex) => ex.emE_Id === emeId)) {
                exams.push({ emE_Id: emeId, emE_ExamName: examName });
            }

            const subId = st.subid || st.ismS_Id || st.ISMS_Id;
            const subName = st.subjectname || st.ismS_SubjectName || st.ISMS_SubjectName || st.subjectName;

            if (subId && subName && !subjects.some((sub) => sub.ISMS_Id === subId)) {
                const marksForSub = exm_sub_mrks_list.filter((m: any) => (m.subid || m.ismS_Id || m.ISMS_Id) === subId);
                const grandT = marksForSub.reduce((acc: number, curr: any) => {
                    const mark = curr.obtainmarks || curr.estmpS_ObtainedMarks || curr.estmS_ObtainedMarks || curr.obtainMarks || 0;
                    return acc + Number(mark);
                }, 0);

                subjects.push({
                    ISMS_Id: subId,
                    subjectname: subName,
                    grandTotal: grandT,
                    average: grandT,
                    flag: st.flag || false
                });
                total += grandT;
            }
        });

        const subjectsWithSub = subjects.map((subj) => {
            const subsubjects: any[] = [];
            exm_sub_mrks_list.forEach((main: any) => {
                const mainSubId = main.subid || main.ismS_Id || main.ISMS_Id;
                const mainSsubj = main.ssubj || main.emsS_Id || main.EMSS_Id;
                const mainSubName = main.SubsubjectName || main.emsS_SubSubjectName || main.EMSS_SubSubjectName;

                if (mainSubId === subj.ISMS_Id && mainSsubj && mainSubName) {
                    if (!subsubjects.some((ssub) => ssub.EMSS_Id === mainSsubj)) {
                        const marksForSubSub = exm_sub_mrks_list.filter(
                            (m: any) =>
                                (m.subid || m.ismS_Id || m.ISMS_Id) === subj.ISMS_Id && (m.ssubj || m.emsS_Id || m.EMSS_Id) === mainSsubj
                        );
                        const ssGrandT = marksForSubSub.reduce((acc: number, curr: any) => {
                            const mark = curr.obtainmarks || curr.estmpS_ObtainedMarks || curr.estmS_ObtainedMarks || curr.obtainMarks || 0;
                            return acc + Number(mark);
                        }, 0);

                        subsubjects.push({
                            EMSS_Id: mainSsubj,
                            SubSbuject: mainSubName,
                            grandTotal: ssGrandT,
                            average: ssGrandT
                        });
                    }
                }
            });
            return {
                ...subj,
                subsubjects
            };
        });

        const rnk = data.stu_details?.[0]?.estmP_SectionRank || '';
        const grd = data.stu_details?.[0]?.estmP_TotalGrade || '';
        const perc = data.stu_details?.[0]?.estmP_Percentage || 0;

        return {
            exam_list: exams,
            subject_list: subjectsWithSub,
            grandTotal: total,
            percentage: perc,
            rank: rnk,
            grade: grd
        };
    }, [exm_sub_mrks_list, data]);

    const formatDateVal = (dateStr: any) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return String(dateStr);
            return format(date, 'dd/MM/yyyy');
        } catch {
            return String(dateStr);
        }
    };

    const promotedStatus = EPRD_PromotionName
        ? `${EPRD_PromotionName.toUpperCase()} ${EPRD_ClassPromoted.toUpperCase()}`
        : data.promotedStatus || 'PROMOTED';

    return (
        <div className='w-full space-y-4'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #hhs-iiv-print-area,
                    #hhs-iiv-print-area * {
                        visibility: visible !important;
                    }
                    #hhs-iiv-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Page Break Handling */
                    tr, .page-break-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid black !important;
                        padding: 3px 4px !important;
                        font-size: 10px !important;
                    }
                    .table td {
                        padding: 3px 4px !important;
                        font-size: 10px !important;
                    }
                    h1.Monotype { font-size: 26px !important; margin: 0 !important; line-height: 1 !important; }
                    h4 { font-size: 11px !important; margin: 0 !important; }
                    .report-logo { height: 60px !important; }
                    .report-student-photo { width: 90px !important; height: 100px !important; }
                    .box { padding: 2px 10px !important; font-size: 12px !important; }
                    .box1 { padding: 4px !important; margin-top: 4px !important; }
                    .grade-box { padding: 4px !important; }
                    .ProgressReport-HH { padding: 0 !important; border: none !important; margin-bottom: 0 !important; }
                    .ProgressReport-HH section { padding: 0 !important; border: none !important; margin-bottom: 0 !important; }
                }
                .ProgressReport-HH {
                    background: #fff;
                    font-family: 'Times New Roman', Times, serif;
                    color: #000;
                    margin: 0 auto;
                    max-width: 900px;
                }
                .ProgressReport-HH section {
                    padding: 20px;
                    border: 1px solid #ccc;
                    margin-bottom: 15px;
                    background: #fff;
                }
                .ProgressReport-HH .Monotype {
                    font-family: 'Monotype Corsiva', 'Apple Chancery', cursive, serif;
                    font-size: 32px;
                    font-weight: bold;
                    color: #1a365d;
                    line-height: 1.1;
                }
                .ProgressReport-HH h4 {
                    font-size: 13px;
                    font-style: italic;
                    color: #555;
                    margin-top: 2px;
                }
                .ProgressReport-HH table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ProgressReport-HH td, .ProgressReport-HH th {
                    padding: 4px 6px;
                }
                .ProgressReport-HH .table-bordered {
                    border: 1px solid #000;
                }
                .ProgressReport-HH .table-bordered th, .ProgressReport-HH .table-bordered td {
                    border: 1px solid #000;
                }
                .ProgressReport-HH .box {
                    border: 1.5px solid #000;
                    padding: 4px 15px;
                    font-size: 14px;
                    font-weight: bold;
                    display: inline-block;
                }
                .ProgressReport-HH .box1 {
                    border: 1px solid #000;
                    padding: 6px;
                    margin-top: 4px;
                }
                .ProgressReport-HH .grade-box {
                    border: 1px solid #000;
                    padding: 8px;
                }
                `
                }}
            />

            {/* Print trigger bar */}
            <div className='no-print flex justify-end rounded-lg border-b bg-gray-50 p-2'>
                <Button onClick={handlePrint} className='flex items-center gap-2 bg-primary text-white'>
                    <Printer className='h-4 w-4' />
                    Print Report
                </Button>
            </div>

            {/* Report view container */}
            <div id='hhs-iiv-print-area' className='ProgressReport-HH print:!border-none print:!shadow-none'>
                <section className='!p-4 print:!p-0 print:!border-none'>
                    <div className='flex w-full flex-col gap-2'>
                        {/* Header */}
                        <div className='image space-y-2 text-center'>
                            <div className='header text-center'>
                                <h1 className='Monotype'>Hutchings High School & Junior College</h1>
                                <h4>(Affiliated to the Council for the Indian School Certificate Examination, New Delhi)</h4>
                            </div>

                            <div className='flex justify-center py-1'>
                                <img
                                    src='/images/Clients/Hutchings/ProgressReports/hhlogo.png'
                                    alt='Hutchings Logo'
                                    className='report-logo h-[70px] w-auto object-contain'
                                    onError={(e) => {
                                        e.currentTarget.src = '/assets/tunbridge_logo.png';
                                    }}
                                />
                            </div>

                            <div className='space-y-1'>
                                <h3 className='m-0 font-bold text-base tracking-wider'>ACADEMIC YEAR</h3>
                                <div className='mt-0'>
                                    <span className='box'>{academicYearName || '2025-2026'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Student Info & Photo */}
                        <div className='my-2 flex flex-row items-center justify-between gap-4 px-4'>
                            <div className='flex-1'>
                                <table className='table-bordered table'>
                                    <tbody>
                                        <tr>
                                            <td className='w-1/3 font-semibold text-sm'>My Name is / NAME:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{stuname}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>I Study in Class / STANDARD:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{asmcL_ClassName}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>Division:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{asmC_SectionName}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>Roll No:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{amaY_RollNo}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>Reg.No:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{amsT_RegistrationNo}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>I was born on / D.O.B:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{formatDateVal(amsT_DOB)}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>Guardian's Name (Father/Mother):</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{amsT_FatherName}</td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>Address:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>
                                                {[street, area, city, state, country, pincode ? `Pincode-${pincode}` : '']
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-semibold text-sm'>Email Id:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{amsT_EmailId}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='flex-shrink-0'>
                                {AMST_Photoname ? (
                                    <img
                                        src={AMST_Photoname}
                                        alt='Student'
                                        className='report-student-photo h-[120px] w-[110px] border border-gray-300 bg-white object-cover'
                                    />
                                ) : (
                                    <div className='report-student-photo flex h-[120px] w-[110px] items-center justify-center border-2 border-gray-300 border-dashed bg-gray-50 text-[10px] text-gray-400'>
                                        No Photo
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='text-center font-medium text-[10px] text-gray-500'>
                            7, Phayre Road, Pune-411040. Tel.: 020-26352764 | website: www.hutchingsschoolpune.in
                        </div>

                        {/* Academic Record Table */}
                        <div className='mt-2'>
                            <table className='table-bordered w-full text-[10px]'>
                                <thead>
                                    <tr className='bg-gray-50'>
                                        <th className='w-1/3 py-1 text-left text-center font-bold'>SUBJECT</th>
                                        {exam_list.map((exam) => (
                                            <th key={exam.emE_Id} className='py-1 text-center font-bold'>
                                                {exam.emE_ExamName}
                                            </th>
                                        ))}
                                        <th className='py-1 text-center font-bold'>Grand Total</th>
                                        <th className='py-1 text-center font-bold'>
                                            Average
                                            <br />
                                            (100)
                                        </th>
                                    </tr>
                                </thead>
                                {subject_list.map((subj, index) => {
                                    if (!subj.subsubjects || subj.subsubjects.length === 0) {
                                        return (
                                            <tbody key={subj.ISMS_Id}>
                                                <tr>
                                                    <td className='border-black border-b bg-gray-50/50 px-2 py-1 text-left align-middle font-semibold'>
                                                        {subj.subjectname}
                                                    </td>
                                                    {exam_list.map((y) => {
                                                        const marks = exm_sub_mrks_list.find((m: any) => {
                                                            const mEmeId = m.emeid || m.emE_Id || m.EME_Id;
                                                            const mSubId = m.subid || m.ismS_Id || m.ISMS_Id;
                                                            return (
                                                                Number(mEmeId) === Number(y.emE_Id) &&
                                                                Number(mSubId) === Number(subj.ISMS_Id)
                                                            );
                                                        });

                                                        if (!marks)
                                                            return (
                                                                <td
                                                                    key={y.emE_Id}
                                                                    className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'></td>
                                                            );

                                                        const passFail = marks.PassFailFlg || marks.passFailFlg || '';
                                                        const isAbnormal = ['AB', 'M', 'L'].includes(passFail);
                                                        const obtainedGrade =
                                                            marks.ObtainedGrade ||
                                                            marks.obtainedGrade ||
                                                            marks.estmpS_ObtainedGrade ||
                                                            marks.obtainmarks ||
                                                            marks.estmpS_ObtainedMarks ||
                                                            '';

                                                        return (
                                                            <td
                                                                key={y.emE_Id}
                                                                className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                                {isAbnormal ? (
                                                                    <span>
                                                                        {passFail} {obtainedGrade ? `(${obtainedGrade})` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span>{obtainedGrade}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                        {subj.grandTotal}
                                                    </td>
                                                    <td className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                        {subj.average}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        );
                                    }

                                    return (
                                        <tbody key={subj.ISMS_Id}>
                                            {subj.subsubjects.map((ssubj: any, ssIdx: number) => (
                                                <tr key={ssubj.EMSS_Id}>
                                                    <td className='border-black border-b bg-white px-2 py-1 pl-6 text-left align-middle font-semibold'>
                                                        {ssubj.SubSbuject}
                                                    </td>
                                                    {exam_list.map((y) => {
                                                        const marks = exm_sub_mrks_list.find((m: any) => {
                                                            const mEmeId = m.emeid || m.emE_Id || m.EME_Id;
                                                            const mSubId = m.subid || m.ismS_Id || m.ISMS_Id;
                                                            const mSsubjId = m.ssubj || m.emsS_Id || m.EMSS_Id;
                                                            return (
                                                                Number(mEmeId) === Number(y.emE_Id) &&
                                                                Number(mSubId) === Number(subj.ISMS_Id) &&
                                                                Number(mSsubjId) === Number(ssubj.EMSS_Id)
                                                            );
                                                        });

                                                        if (!marks)
                                                            return (
                                                                <td
                                                                    key={y.emE_Id}
                                                                    className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'></td>
                                                            );

                                                        const passFail = marks.PassFailFlg || marks.passFailFlg || '';
                                                        const isAbnormal = ['AB', 'M', 'L'].includes(passFail);
                                                        const obtainedGrade =
                                                            marks.ObtainedGrade ||
                                                            marks.obtainedGrade ||
                                                            marks.estmpS_ObtainedGrade ||
                                                            marks.obtainmarks ||
                                                            marks.estmpS_ObtainedMarks ||
                                                            '';

                                                        return (
                                                            <td
                                                                key={y.emE_Id}
                                                                className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                                {isAbnormal ? (
                                                                    <span>
                                                                        {passFail} {obtainedGrade ? `(${obtainedGrade})` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span>{obtainedGrade}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                        {ssubj.grandTotal}
                                                    </td>
                                                    <td className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                        {ssubj.average}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    );
                                })}
                                <tfoot>
                                    <tr className='bg-gray-50/50 font-bold'>
                                        <td className='px-2 py-1 text-left'>Total</td>
                                        {exam_list.map((y) => {
                                            const tpr = exmtpr.find(
                                                (t: any) => Number(t.emeid || t.emE_Id || t.EME_Id) === Number(y.emE_Id)
                                            );
                                            return (
                                                <td key={y.emE_Id} className='text-center font-bold text-gray-800'>
                                                    {tpr ? tpr.estmP_TotalObtMarks || tpr.ESTMP_TotalObtMarks || '' : ''}
                                                </td>
                                            );
                                        })}
                                        <td className='text-center font-bold text-gray-800'></td>
                                        <td className='text-center font-bold text-gray-800'></td>
                                    </tr>
                                    <tr className='bg-gray-50/50 font-bold'>
                                        <td className='px-2 py-1 text-left'>Percentage</td>
                                        {exam_list.map((y) => {
                                            const tpr = exmtpr.find(
                                                (t: any) => Number(t.emeid || t.emE_Id || t.EME_Id) === Number(y.emE_Id)
                                            );
                                            return (
                                                <td key={y.emE_Id} className='text-center font-bold text-gray-800'>
                                                    {tpr ? tpr.estmP_Percentage || tpr.ESTMP_Percentage || '' : ''}
                                                </td>
                                            );
                                        })}
                                        <td className='text-center font-bold text-gray-800'></td>
                                        <td className='text-center font-bold text-gray-800'></td>
                                    </tr>
                                    <tr className='font-bold'>
                                        <td className='px-2 py-1 text-left'>Rank</td>
                                        {exam_list.map((y) => {
                                            const tpr = exmtpr.find(
                                                (t: any) => Number(t.emeid || t.emE_Id || t.EME_Id) === Number(y.emE_Id)
                                            );
                                            return (
                                                <td key={y.emE_Id} className='text-center font-bold text-gray-800'>
                                                    {tpr ? tpr.estmP_SectionRank || tpr.ESTMP_SectionRank || '' : ''}
                                                </td>
                                            );
                                        })}
                                        <td className='text-center font-bold text-gray-800'></td>
                                        <td className='text-center font-bold text-gray-800'></td>
                                    </tr>
                                    <tr className='font-bold'>
                                        <td className='px-2 py-1 text-left'>Grade</td>
                                        {exam_list.map((y) => {
                                            const tpr = exmtpr.find(
                                                (t: any) => Number(t.emeid || t.emE_Id || t.EME_Id) === Number(y.emE_Id)
                                            );
                                            return (
                                                <td key={y.emE_Id} className='text-center font-bold text-gray-800'>
                                                    {tpr ? tpr.estmP_TotalGrade || tpr.ESTMP_TotalGrade || '' : ''}
                                                </td>
                                            );
                                        })}
                                        <td className='text-center font-bold text-gray-800'></td>
                                        <td className='text-center font-bold text-gray-800'></td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1.5 text-left font-semibold'>Teacher's Sign</td>
                                        {exam_list.map((y) => (
                                            <td key={y.emE_Id}></td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td className='px-2 py-1.5 text-left font-semibold'>Parent's/Guardian's Sign</td>
                                        {exam_list.map((y) => (
                                            <td key={y.emE_Id}></td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Internal Assessment Table */}
                        <div className='page-break-avoid mt-2'>
                            <div className='border border-black bg-gray-100 p-1 text-center font-bold text-xs uppercase'>
                                INTERNAL ASSESSMENT (IA)
                            </div>
                            <table className='table-bordered w-full text-[9px]'>
                                <thead>
                                    <tr className='bg-gray-50'>
                                        <th className='w-[40%] px-2 py-1 text-left font-bold'>SUBJECT</th>
                                        <th className='py-1'></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        'English Language',
                                        'English Literature',
                                        'Hindi',
                                        'Mathematics',
                                        'Computer Science',
                                        'Environmental Science'
                                    ].map((ia, idx) => (
                                        <tr key={idx}>
                                            <td className='px-2 py-1 text-left font-bold'>{ia}</td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Traits & Co-Curricular */}
                        <div className='page-break-avoid mt-2 flex flex-row justify-between gap-4'>
                            <div className='w-1/2'>
                                <div className='border border-black bg-gray-100 p-1 text-center font-bold text-xs uppercase'>
                                    PERSONALITY & SOCIAL TRAITS
                                </div>
                                <table className='table-bordered w-full text-[9px]'>
                                    <tbody>
                                        <tr>
                                            <td className='w-[40%] px-2 py-1 text-left font-bold'>Personality</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='w-1/2'>
                                <div className='border border-black bg-gray-100 p-1 text-center font-bold text-xs uppercase'>
                                    CO-CURRICULAR ACTIVITIES
                                </div>
                                <table className='table-bordered w-full text-[9px]'>
                                    <tbody>
                                        <tr>
                                            <td className='w-[40%] px-2 py-1 text-left font-bold'>Co Curricular</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer Data (Attendance, Remarks, Grades) */}
                        <div className='page-break-avoid mt-2 flex flex-row justify-between gap-4'>
                            {/* Left Side: Attendance & Remarks & Promotion */}
                            <div className='flex w-1/2 flex-col gap-2'>
                                {/* Attendance */}
                                <table className='table-bordered w-full text-[10px]'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='w-[40%] px-2 py-1 text-left font-bold'>Attendance</th>
                                            {exam_list.map((exam) => (
                                                <th key={exam.emE_Id} className='py-1 text-center font-bold'>
                                                    {exam.emE_ExamName}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='px-2 py-1 text-left font-medium'>Total No. of working days</td>
                                            {exam_list.map((exam) => {
                                                const att = Present_attendence.find(
                                                    (dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id || dd.emE_Id)
                                                );
                                                return (
                                                    <td key={exam.emE_Id} className='py-1 text-center font-semibold text-gray-700'>
                                                        {att ? att.TOTALWORKINGDAYS || att.totalworkingdays || '' : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        <tr>
                                            <td className='px-2 py-1 text-left font-medium'>Total No. of Days Present</td>
                                            {exam_list.map((exam) => {
                                                const att = Present_attendence.find(
                                                    (dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id || dd.emE_Id)
                                                );
                                                return (
                                                    <td key={exam.emE_Id} className='py-1 text-center font-semibold text-gray-700'>
                                                        {att ? att.PRESENTDAYS || att.presentdays || '' : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Promotion & Reopen */}
                                <div className='box1 w-full rounded-sm border-2 border-black text-[10px]'>
                                    <table className='table w-full'>
                                        <tbody>
                                            <tr className='border-black border-b'>
                                                <td className='w-1/2 border-black border-r px-2 py-1 font-bold'>PROMOTED / DETAINED</td>
                                                <td className='px-2 py-1 font-bold text-blue-900'>{promotedStatus}</td>
                                            </tr>
                                            <tr>
                                                <td className='border-black border-r px-2 py-1 font-bold'>SCHOOL RE-OPENS ON</td>
                                                <td className='px-2 py-1 font-bold text-blue-900'>
                                                    {reOpenDate ? format(new Date(reOpenDate), 'dd-MM-yyyy') : ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks */}
                                <div className='flex w-full flex-row flex-wrap gap-2'>
                                    {examwiseremarks.map((remark: any, i: number) => (
                                        <div key={i} className='box1 min-w-[120px] flex-1 rounded-sm border border-black'>
                                            <div className='mb-1 border-gray-200 border-b pb-1 font-bold text-[9px] text-gray-800 uppercase'>
                                                REMARKS
                                            </div>
                                            <div className='pb-4 font-semibold text-[10px] text-blue-900'>{remark.emeR_Remarks}</div>
                                            <div className='border-gray-200 border-t pt-2 text-right font-medium text-[9px] text-gray-600 italic'>
                                                Principal's Sign
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Grades */}
                            <div className='w-1/2'>
                                <div className='grade-box rounded-md text-[10px]'>
                                    <table className='table w-full'>
                                        <tbody>
                                            {grade_detailslist.map((gg: any, idx: number) => (
                                                <tr key={idx} className='border-gray-100 border-b last:border-b-0'>
                                                    <td className='w-[25%] py-1 text-left font-bold'>{gg.emgD_Name}</td>
                                                    <td className='w-[10%] py-1 text-center text-gray-400'>---</td>
                                                    <td className='w-[40%] py-1 text-left font-semibold'>
                                                        {String(gg.emgD_Remarks || '').toUpperCase()}
                                                    </td>
                                                    <td className='w-[10%] py-1 text-center text-gray-400'>---</td>
                                                    <td className='w-[15%] py-1 text-left text-gray-700'>
                                                        {gg.emgD_From}-{gg.emgD_To}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
