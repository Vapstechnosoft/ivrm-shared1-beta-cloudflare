'use client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
// Triggering TS Server re-evaluation
import { useMemo } from 'react';

interface ReportListProps {
    data: any;
    academicYearName: string;
    classNameVal: string;
    sectionNameVal: string;
    reOpenDate: Date | null;
}

export const ReportList = ({ data, academicYearName, classNameVal, sectionNameVal, reOpenDate }: ReportListProps) => {
    const stuDetails = data?.studentDetails?.[0] || data?.stu_details?.[0] || {};
    const stuname = stuDetails.stuname || '';
    const asmcL_ClassName = stuDetails.asmcL_ClassName || classNameVal || '';
    const amsT_DOB = stuDetails.amsT_DOB || '';
    const AMST_Photoname = stuDetails.amsT_Photoname || '';

    const exm_sub_mrks_list = data?.subjectMarks || data?.eam_sub_mrks_list || data?.exm_sub_mrks_list || [];
    const Present_attendence = data?.attendance || data?.present_attendence || data?.Present_attendence || [];
    const examwiseremarks = data?.examRemarks || data?.examwiseremarks || [];
    const grade_detailslist = data?.gradeDetails || data?.grade_detailslist || data?.grade_details || [];

    const EPRD_PromotionName =
        data?.eprD_PromotionName || data?.EPRD_PromotionName || stuDetails.eprD_PromotionName || stuDetails.EPRD_PromotionName || '';
    const EPRD_ClassPromoted =
        data?.eprD_ClassPromoted || data?.EPRD_ClassPromoted || stuDetails.eprD_ClassPromoted || stuDetails.EPRD_ClassPromoted || '';

    // Extract dynamic list of exams and subjects
    const { exam_list, subject_list } = useMemo(() => {
        const exams: any[] = [];
        const subjects: any[] = [];

        exm_sub_mrks_list.forEach((st: any) => {
            if (st.emeid && st.examname && !exams.some((ex) => ex.emE_Id === st.emeid)) {
                exams.push({ emE_Id: st.emeid, emE_ExamName: st.examname });
            }

            if (st.subid && st.subjectname && !subjects.some((sub) => sub.ISMS_Id === st.subid)) {
                subjects.push({
                    ISMS_Id: st.subid,
                    subjectname: st.subjectname,
                    flag: st.flag
                });
            }
        });

        const subjectsWithSub = subjects.map((subj) => {
            const subsubjects: any[] = [];
            exm_sub_mrks_list.forEach((main: any) => {
                if (main.subid === subj.ISMS_Id && main.ssubj && main.SubsubjectName) {
                    if (!subsubjects.some((ssub) => ssub.EMSS_Id === main.ssubj)) {
                        subsubjects.push({
                            EMSS_Id: main.ssubj,
                            SubSbuject: main.SubsubjectName
                        });
                    }
                }
            });
            return {
                ...subj,
                subsubjects
            };
        });

        return {
            exam_list: exams,
            subject_list: subjectsWithSub
        };
    }, [exm_sub_mrks_list]);

    const handlePrint = () => {
        window.print();
    };

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
                    #hhs-report-preparatory-print-area,
                    #hhs-report-preparatory-print-area * {
                        visibility: visible !important;
                    }
                    #hhs-report-preparatory-print-area {
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
                    .ProgressReport-HH03 section { padding: 0 !important; border: none !important; margin-bottom: 0 !important; }
                }
                .ProgressReport-HH03 {
                    background: #fff;
                    font-family: 'Times New Roman', Times, serif;
                    color: #000;
                    margin: 0 auto;
                    max-width: 900px;
                }
                .ProgressReport-HH03 section {
                    padding: 20px;
                    border: 1px solid #ccc;
                    margin-bottom: 15px;
                    background: #fff;
                }
                .ProgressReport-HH03 .Monotype {
                    font-family: 'Monotype Corsiva', 'Apple Chancery', cursive, serif;
                    font-size: 32px;
                    font-weight: bold;
                    color: #1a365d;
                    line-height: 1.1;
                }
                .ProgressReport-HH03 h4 {
                    font-size: 13px;
                    font-style: italic;
                    color: #555;
                    margin-top: 2px;
                }
                .ProgressReport-HH03 table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ProgressReport-HH03 td, .ProgressReport-HH03 th {
                    padding: 4px 6px;
                }
                .ProgressReport-HH03 .table-bordered {
                    border: 1px solid #000;
                }
                .ProgressReport-HH03 .table-bordered th, .ProgressReport-HH03 .table-bordered td {
                    border: 1px solid #000;
                }
                .ProgressReport-HH03 .border-bottom {
                    border-bottom: 1px solid #000;
                }
                .ProgressReport-HH03 .box {
                    border: 1.5px solid #000;
                    padding: 4px 15px;
                    font-size: 14px;
                    font-weight: bold;
                    display: inline-block;
                }
                .ProgressReport-HH03 .box1 {
                    border: 1px solid #000;
                    padding: 6px;
                    margin-top: 4px;
                }
                .ProgressReport-HH03 .grade-box {
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
            <div id='hhs-report-preparatory-print-area' className='ProgressReport-HH03 print:!border-none print:!shadow-none'>
                {/* SINGLE PAGE CONTAINER */}
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
                                        e.currentTarget.src = '/assets/tunbridge_logo.png'; // safe fallback
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
                                            <td className='font-semibold text-sm'>I was born on / D.O.B:</td>
                                            <td className='px-2 font-bold text-blue-900 text-sm'>{formatDateVal(amsT_DOB)}</td>
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
                            <table className='table-bordered w-full text-xs'>
                                <thead>
                                    <tr className='bg-gray-50'>
                                        <th colSpan={2} className='py-1 text-center font-bold' style={{ width: '35%' }}>
                                            SUBJECT
                                        </th>
                                        {exam_list.map((exam) => (
                                            <th
                                                key={exam.emE_Id}
                                                className='py-1 text-center font-bold'
                                                style={{ width: `${65 / exam_list.length}%` }}>
                                                {exam.emE_ExamName}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                {subject_list.map((subj, index) => {
                                    if (!subj.subsubjects || subj.subsubjects.length === 0) {
                                        return (
                                            <tbody key={subj.ISMS_Id}>
                                                <tr>
                                                    <td
                                                        colSpan={2}
                                                        className='border-black border-r border-b bg-gray-50/50 px-2 py-1 align-middle font-semibold'>
                                                        {subj.subjectname}
                                                    </td>
                                                    {exam_list.map((y) => {
                                                        const marks = exm_sub_mrks_list.find(
                                                            (m: any) =>
                                                                Number(m.emeid) === Number(y.emE_Id) &&
                                                                Number(m.subid) === Number(subj.ISMS_Id)
                                                        );
                                                        if (!marks)
                                                            return (
                                                                <td
                                                                    key={y.emE_Id}
                                                                    className='border-black border-r border-b bg-white text-center align-middle'></td>
                                                            );

                                                        const isAbnormal = ['AB', 'M', 'L'].includes(marks.PassFailFlg);
                                                        return (
                                                            <td
                                                                key={y.emE_Id}
                                                                className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                                {isAbnormal ? (
                                                                    <span>
                                                                        {marks.PassFailFlg}{' '}
                                                                        {marks.ObtainedGrade ? `(${marks.ObtainedGrade})` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span>{marks.ObtainedGrade}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        );
                                    }

                                    return (
                                        <tbody key={subj.ISMS_Id}>
                                            {subj.subsubjects.map((ssubj: any, ssIdx: number) => (
                                                <tr key={ssubj.EMSS_Id}>
                                                    {ssIdx === 0 && (
                                                        <td
                                                            className='border-black border-r border-b bg-gray-50/50 px-2 py-1 align-middle font-semibold'
                                                            rowSpan={subj.subsubjects.length}>
                                                            {subj.subjectname}
                                                        </td>
                                                    )}
                                                    <td className='border-black border-r border-b bg-white px-2 py-1 align-middle'>
                                                        {ssubj.SubSbuject}
                                                    </td>
                                                    {exam_list.map((y) => {
                                                        const marks = exm_sub_mrks_list.find(
                                                            (m: any) =>
                                                                Number(m.emeid) === Number(y.emE_Id) &&
                                                                Number(m.subid) === Number(subj.ISMS_Id) &&
                                                                Number(m.ssubj) === Number(ssubj.EMSS_Id)
                                                        );
                                                        if (!marks)
                                                            return (
                                                                <td
                                                                    key={y.emE_Id}
                                                                    className='border-black border-r border-b bg-white text-center align-middle'></td>
                                                            );

                                                        const isAbnormal = ['AB', 'M', 'L'].includes(marks.PassFailFlg);
                                                        return (
                                                            <td
                                                                key={y.emE_Id}
                                                                className='border-black border-r border-b bg-white text-center align-middle font-bold text-gray-800'>
                                                                {isAbnormal ? (
                                                                    <span>
                                                                        {marks.PassFailFlg}{' '}
                                                                        {marks.ObtainedGrade ? `(${marks.ObtainedGrade})` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span>{marks.ObtainedGrade}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    );
                                })}

                                <tfoot>
                                    <tr>
                                        <td colSpan={2} className='border-black border-r px-2 py-1.5 font-semibold'>
                                            Teacher's Sign
                                        </td>
                                        {exam_list.map((key) => (
                                            <td key={key.emE_Id} className='border-black border-r'></td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className='border-black border-r px-2 py-1.5 font-semibold'>
                                            Parent's/Guardian's Sign
                                        </td>
                                        {exam_list.map((key) => (
                                            <td key={key.emE_Id} className='border-black border-r'></td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer Data (Attendance, Remarks, Grades) */}
                        <div className='mt-2 flex flex-row justify-between gap-4'>
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
                                                const att = Present_attendence.find((dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id));
                                                return (
                                                    <td key={exam.emE_Id} className='py-1 text-center font-semibold text-gray-700'>
                                                        {att ? att.TOTALWORKINGDAYS : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        <tr>
                                            <td className='px-2 py-1 text-left font-medium'>Total No. of Days Present</td>
                                            {exam_list.map((exam) => {
                                                const att = Present_attendence.find((dd: any) => Number(exam.emE_Id) === Number(dd.EME_Id));
                                                return (
                                                    <td key={exam.emE_Id} className='py-1 text-center font-semibold text-gray-700'>
                                                        {att ? att.PRESENTDAYS : ''}
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
                                                <td className='px-2 py-1 font-bold text-blue-900'>
                                                    {EPRD_PromotionName
                                                        ? `${EPRD_PromotionName.toUpperCase()} ${EPRD_ClassPromoted.toUpperCase()}`
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='border-black border-r px-2 py-1 font-bold'>SCHOOL RE-OPENS ON</td>
                                                <td className='px-2 py-1 font-bold text-blue-900'>
                                                    {reOpenDate ? format(new Date(reOpenDate), 'dd-MM-yyyy') : 'N/A'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks */}
                                <div className='flex w-full flex-row flex-wrap gap-2'>
                                    {examwiseremarks.map((remarks: any, i: number) => (
                                        <div key={i} className='box1 min-w-[120px] flex-1 rounded-sm border border-black'>
                                            <div className='mb-1 border-gray-200 border-b pb-1 font-bold text-[9px] text-gray-800 uppercase'>
                                                REMARKS: {remarks.emE_ExamName}
                                            </div>
                                            <div className='pb-4 font-semibold text-[10px] text-blue-900'>{remarks.emeR_Remarks}</div>
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
