'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BCOEDIIReportViewProps {
    reportData: any[];
    gradeRemarks: any[];
    attendanceWork: any[];
    attendancePresent: any[];
    examName: string;
    academicYear: string;
    classTeacher: string;
    showRemarks: boolean;
    showRank: boolean;
    showLogo: boolean;
    hidePercentage: boolean;
}

export default function BCOEDIIReportView({
    reportData,
    gradeRemarks,
    attendanceWork,
    attendancePresent,
    examName,
    academicYear,
    classTeacher,
    showRemarks,
    showRank,
    showLogo,
    hidePercentage
}: BCOEDIIReportViewProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const getSubjectRemark = (sub: any) => {
        if (sub.emgD_Remarks) return sub.emgD_Remarks;
        if (!gradeRemarks || !Array.isArray(gradeRemarks) || gradeRemarks.length === 0) return '';
        const remarkObj = gradeRemarks.find(
            (r) =>
                Number(r.emgR_Id || r.EMGR_Id) === Number(sub.emgR_Id) &&
                String(r.emgD_Name || r.EMGD_Name) === String(sub.estmpS_ObtainedGrade)
        );
        return remarkObj ? remarkObj.emgD_Remarks || remarkObj.EMGD_Remarks : '';
    };

    const getAttendance = (list: any[], studentId: any) => {
        if (!list || !Array.isArray(list)) return {};
        return list.find((a) => Number(a.studentId ?? a.amsT_Id ?? a.AMST_Id ?? a.amst_Id ?? a.AMST_ID) === Number(studentId)) || {};
    };

    const calculateGrandTotalMin = (subList: any[]) => {
        return subList
            .filter((s) => s.eyceS_AplResultFlg === true || s.eyceS_AplResultFlg === 'true' || s.eyceS_AplResultFlg === 1)
            .reduce((acc, s) => acc + (Number(s.eyceS_MinMarks) || 0), 0);
    };

    return (
        <div className='space-y-6'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #bcoedii-report-print-area,
                    #bcoedii-report-print-area * {
                        visibility: visible !important;
                    }
                    #bcoedii-report-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    .report-card {
                        border: none !important;
                        padding: 0 !important;
                    }
                }

                .bcoedii-report-container {
                    font-family: 'Source Sans Pro', sans-serif;
                    color: black;
                }

                .report-card {
                    background-color: white;
                    margin-bottom: 50px;
                    padding: 20px;
                }

                .table-bordered {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }

                .table-bordered th, .table-bordered td {
                    border: 1px solid black;
                    padding: 4px;
                    text-align: center;
                    font-size: 14px;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
                .margin-top-10 { margin-top: 10px; }
                .margin-top-20 { margin-top: 20px; }
                .margin-top-40 { margin-top: 40px; }
                .margin-top-50 { margin-top: 50px; }
                .margin-bottom-10 { margin-bottom: 10px; }
                .border-bottom { border-bottom: 1px solid black; }
                .border-top { border-top: 1px solid black; display: inline-block; padding-top: 5px; }
                
                .student-info label {
                    font-size: 14px;
                    font-weight: bold;
                }
                .student-info span {
                    font-size: 16px;
                    font-weight: bold;
                }
            `
                }}
            />

            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Reports
                </Button>
            </div>

            <div id='bcoedii-report-print-area' className='bcoedii-report-container'>
                {(reportData || []).map((report, index) => {
                    const workAt = getAttendance(attendanceWork, report.student_id);
                    const presentAt = getAttendance(attendancePresent, report.student_id);
                    console.log('workAt: ', workAt);
                    console.log('presentAt: ', presentAt);
                    const resultSubjects = (report.sub_list || []).filter(
                        (s: any) => s.eyceS_AplResultFlg === true || s.eyceS_AplResultFlg === 'true' || s.eyceS_AplResultFlg === 1
                    );
                    const nonResultSubjects = (report.sub_list || []).filter(
                        (s: any) => s.eyceS_AplResultFlg === false || s.eyceS_AplResultFlg === 'false' || s.eyceS_AplResultFlg === 0
                    );

                    return (
                        <div
                            key={report.student_id || index}
                            className='report-card'
                            style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                            {showLogo && (
                                <div className='mb-4 text-center'>
                                    <img
                                        src='/images/logo.png'
                                        alt='Logo'
                                        style={{ width: '100%', height: '100px', objectFit: 'contain' }}
                                    />
                                </div>
                            )}
                            {!showLogo && <div className='h-12' />}

                            <div className='header margin-bottom-10 text-center'>
                                <h3 className='font-bold text-lg'>
                                    PROGRESS REPORT
                                    <br />
                                    ACADEMIC YEAR {academicYear || ''}
                                    <br />
                                    {examName || ''}
                                </h3>
                            </div>

                            <section className='content'>
                                <div className='student-info margin-bottom-10'>
                                    <div className='grid grid-cols-12 gap-4'>
                                        <div className='col-span-6 space-y-2'>
                                            <div className='flex'>
                                                <label className='w-1/3'>NAME</label>
                                                <span className='flex-1'>: {report.amsT_FirstName || ''}</span>
                                            </div>
                                            <div className='flex'>
                                                <label className='w-1/3 text-xs'>CLASS TEACHER</label>
                                                <span className='flex-1'>: {classTeacher || ''}</span>
                                            </div>
                                        </div>
                                        <div className='col-span-3 space-y-2'>
                                            <div className='flex'>
                                                <label className='w-1/2'>CLASS</label>
                                                <span className='flex-1'>: {report.asmcL_ClassName || ''}</span>
                                            </div>
                                            <div className='flex'>
                                                <label className='w-1/2'>ROLL NO</label>
                                                <span className='flex-1'>: {report.amaY_RollNo || ''}</span>
                                            </div>
                                        </div>
                                        <div className='col-span-3 space-y-2'>
                                            <div className='flex'>
                                                <label className='w-1/2'>SECTION</label>
                                                <span className='flex-1'>: {report.asmC_SectionName || ''}</span>
                                            </div>
                                            <div className='flex'>
                                                <label className='w-1/2'>ADM. NO</label>
                                                <span className='flex-1'>: {report.amsT_AdmNo || ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='margin-top-20'>
                                    <table className='table-bordered'>
                                        <thead>
                                            <tr>
                                                <th className='text-center' rowSpan={2} style={{ width: '300px' }}>
                                                    <b>SUBJECTS</b>
                                                </th>
                                                <th className='text-center' rowSpan={2}>
                                                    <b>MAX MARKS</b>
                                                </th>
                                                <th className='text-center' rowSpan={2}>
                                                    <b>MIN MARKS</b>
                                                </th>
                                                <th className='text-center' colSpan={2}>
                                                    <b>OBTAINED</b>
                                                </th>
                                                <th className='text-center' rowSpan={2} style={{ width: '300px' }}>
                                                    <b>REMARKS</b>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className='text-center'>
                                                    <b>MARKS</b>
                                                </th>
                                                <th className='text-center'>
                                                    <b>GRADE</b>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resultSubjects.map((subj: any) => (
                                                <tr key={subj.ismS_Id}>
                                                    <td className='text-left'>
                                                        <b>{subj.ismS_SubjectName}</b>
                                                    </td>
                                                    <td>{subj.eyceS_MaxMarks || ''}</td>
                                                    <td>{subj.eyceS_MinMarks || ''}</td>
                                                    <td>
                                                        {subj.estmpS_PassFailFlg !== 'AB'
                                                            ? subj.EYCES_MarksDisplayFlg
                                                                ? subj.estmpS_ObtainedMarks
                                                                : ''
                                                            : 'AB'}
                                                    </td>
                                                    <td>
                                                        {subj.estmpS_PassFailFlg !== 'AB'
                                                            ? subj.EYCES_GradeDisplayFlg
                                                                ? subj.estmpS_ObtainedGrade
                                                                : ''
                                                            : ''}
                                                    </td>
                                                    <td>{subj.estmpS_PassFailFlg !== 'AB' ? getSubjectRemark(subj) : ''}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td className='text-left font-bold'>GRAND TOTAL</td>
                                                <td className='font-bold'>{report.estmP_TotalMaxMarks || ''}</td>
                                                <td className='font-bold'>{calculateGrandTotalMin(report.sub_list || [])}</td>
                                                <td className='font-bold'>{report.estmP_TotalObtMarks || ''}</td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            {!hidePercentage && (
                                                <tr>
                                                    <td className='text-left font-bold'>TOTAL PERCENTAGE</td>
                                                    <td colSpan={5} className='text-center font-bold'>
                                                        {report.estmP_Percentage || ''}
                                                    </td>
                                                </tr>
                                            )}
                                            {showRank && (
                                                <tr>
                                                    <td className='text-left font-bold'>RANK IN SECTION</td>
                                                    <td colSpan={5} className='text-center font-bold'>
                                                        {report.estmP_SectionRank && report.estmP_SectionRank !== '0'
                                                            ? report.estmP_SectionRank
                                                            : ''}
                                                    </td>
                                                </tr>
                                            )}
                                            {nonResultSubjects.map((subj: any) => (
                                                <tr key={subj.ismS_Id}>
                                                    <td className='text-left'>
                                                        <b>{subj.ismS_SubjectName}</b>
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td>
                                                        {subj.estmpS_PassFailFlg !== 'AB'
                                                            ? subj.EYCES_GradeDisplayFlg
                                                                ? subj.estmpS_ObtainedGrade
                                                                : ''
                                                            : subj.estmpS_PassFailFlg}
                                                    </td>
                                                    <td>{subj.estmpS_PassFailFlg !== 'AB' ? getSubjectRemark(subj) : ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='margin-top-10'>
                                    <table className='table-bordered'>
                                        <thead>
                                            <tr>
                                                <th colSpan={16} className='text-center font-bold'>
                                                    ATTENDANCE
                                                </th>
                                            </tr>
                                            <tr className='text-center font-bold'>
                                                <td colSpan={2}>MONTH</td>
                                                <td>JUN</td>
                                                <td>JUL</td>
                                                <td>AUG</td>
                                                <td>SEP</td>
                                                <td>OCT</td>
                                                <td>NOV</td>
                                                <td>DEC</td>
                                                <td>JAN</td>
                                                <td>FEB</td>
                                                <td>MAR</td>
                                                <td>APR</td>
                                                <td>MAY</td>
                                                <td>TOTAL</td>
                                                <td>TOTAL%</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={2} className='font-bold'>
                                                    WORKING DAYS
                                                </td>
                                                <td>{workAt.june || ''}</td>
                                                <td>{workAt.july || ''}</td>
                                                <td>{workAt.august || ''}</td>
                                                <td>{workAt.september || ''}</td>
                                                <td>{workAt.october || ''}</td>
                                                <td>{workAt.november || ''}</td>
                                                <td>{workAt.december || ''}</td>
                                                <td>{workAt.january || ''}</td>
                                                <td>{workAt.febrauary || ''}</td>
                                                <td>{workAt.march || ''}</td>
                                                <td>{workAt.april || ''}</td>
                                                <td>{workAt.may || ''}</td>
                                                <td className='font-bold'>{workAt.totalSchoolDays || ''}</td>
                                                <td className='font-bold'>{workAt.total_Percentage || ''}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} className='font-bold'>
                                                    PRESENT DAYS
                                                </td>
                                                <td>{presentAt.june || ''}</td>
                                                <td>{presentAt.july || ''}</td>
                                                <td>{presentAt.august || ''}</td>
                                                <td>{presentAt.september || ''}</td>
                                                <td>{presentAt.october || ''}</td>
                                                <td>{presentAt.november || ''}</td>
                                                <td>{presentAt.december || ''}</td>
                                                <td>{presentAt.january || ''}</td>
                                                <td>{presentAt.febrauary || ''}</td>
                                                <td>{presentAt.march || ''}</td>
                                                <td>{presentAt.april || ''}</td>
                                                <td>{presentAt.may || ''}</td>
                                                <td className='font-bold'>{presentAt.totalWorkingDays || ''}</td>
                                                <td className='font-bold'>{presentAt.total_Percentage || ''}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <table className='margin-top-20 table w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='w-1/3 font-bold'>CLASS TEACHER'S REMARKS</td>
                                            <td className='border-bottom text-center'>{report.estmP_TotalGradeRemark || ''}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className='margin-top-50'>
                                    <table className='table w-full'>
                                        <tbody>
                                            <tr>
                                                <td className='text-left'>
                                                    <span className='border-top font-bold'>PARENT'S SIGNATURE & Date</span>
                                                </td>
                                                <td className='text-center'>
                                                    <span className='border-top font-bold'>CLASS TEACHER'S SIGNATURE & Date</span>
                                                </td>
                                                <td className='text-right'>
                                                    <span className='border-top font-bold'>PRINCIPAL'S SIGNATURE & Date</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
