'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BCOEDIReportViewProps {
    reportData: any[];
    gradeRemarks: any[];
    attendanceWork: any[];
    attendancePresent: any[];
    examName: string;
    academicYear: string;
    classTeacher: string;
    showRemarks: boolean;
    showRank: boolean;
}

export default function BCOEDIReportView({
    reportData,
    gradeRemarks,
    attendanceWork,
    attendancePresent,
    examName,
    academicYear,
    classTeacher,
    showRemarks,
    showRank
}: BCOEDIReportViewProps) {
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
        return list.find((a) => Number(a.AMST_Id || a.amsT_Id) === Number(studentId)) || {};
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
                    #bcoedi-report-print-area,
                    #bcoedi-report-print-area * {
                        visibility: visible !important;
                    }
                    #bcoedi-report-print-area {
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

                .bcoedi-report-container {
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
                    padding: 8px;
                    text-align: center;
                    font-size: 14px;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
                .margin-top-20 { margin-top: 20px; }
                .margin-top-40 { margin-top: 40px; }
                .margin-bottom-10 { margin-bottom: 10px; }
                .border-bottom { border-bottom: 1px solid black; }
                .border-top { border-top: 1px solid black; display: inline-block; padding-top: 5px; }
                
                .student-info {
                    margin-bottom: 20px;
                }
                .student-info .row {
                    display: flex;
                    margin-bottom: 5px;
                }
                .student-info label {
                    font-size: 14px;
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

            <div id='bcoedi-report-print-area' className='bcoedi-report-container'>
                {(reportData || []).map((report, index) => {
                    const workAt = getAttendance(attendanceWork, report.student_id);
                    const presentAt = getAttendance(attendancePresent, report.student_id);

                    return (
                        <div
                            key={report.student_id || index}
                            className='report-card'
                            style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                            <div className='border border-black p-4'>
                                <div className='header margin-bottom-10 text-center'>
                                    <h3 className='font-bold text-xl'>
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
                                            <div className='col-span-5 space-y-2'>
                                                <div className='flex'>
                                                    <label className='w-1/2'>NAME</label>
                                                    <span className='flex-1'>: {report.amsT_FirstName || ''}</span>
                                                </div>
                                                <div className='flex'>
                                                    <label className='w-1/2'>CLASS TEACHER</label>
                                                    <span className='flex-1'>: {classTeacher || ''}</span>
                                                </div>
                                            </div>
                                            <div className='col-span-4 space-y-2'>
                                                <div className='flex'>
                                                    <label className='w-1/3'>CLASS</label>
                                                    <span className='flex-1'>: {report.asmcL_ClassName || ''}</span>
                                                </div>
                                                <div className='flex'>
                                                    <label className='w-1/3'>ROLL NO</label>
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
                                                    <th className='text-center' style={{ width: '50px' }}>
                                                        <b>SUBJECTS</b>
                                                    </th>
                                                    <th className='text-center' style={{ width: '20px' }}>
                                                        <b>GRADE OBTAINED</b>
                                                    </th>
                                                    <th className='text-center' style={{ width: '20px' }}>
                                                        <b>REMARKS</b>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(report.sub_list || []).map((subj: any) => (
                                                    <tr key={subj.ismS_Id}>
                                                        <td className='text-left' style={{ paddingLeft: '5px' }}>
                                                            {subj.ismS_SubjectName}
                                                        </td>
                                                        <td style={{ fontSize: '16px' }}>
                                                            {subj.estmpS_PassFailFlg !== 'AB'
                                                                ? subj.EYCES_GradeDisplayFlg
                                                                    ? subj.estmpS_ObtainedGrade
                                                                    : ''
                                                                : 'AB'}
                                                        </td>
                                                        <td style={{ fontSize: '16px' }}>
                                                            {subj.estmpS_PassFailFlg !== 'AB' ? getSubjectRemark(subj) : ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={3} className='p-2 text-left'>
                                                        <b>
                                                            NO. OF WORKING DAYS :{' '}
                                                            {report.TotalSchoolDays || workAt.TotalSchoolDays || report.classheld || 0}
                                                            &nbsp;&nbsp;&nbsp;&nbsp; NO. OF DAYS PRESENT :{' '}
                                                            {report.TotalPresentDays || presentAt.TotalPresentDays || report.classatt || 0}
                                                        </b>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <table className='margin-top-40 table w-full'>
                                        <tbody>
                                            <tr>
                                                <td className='w-1/3'>CLASS TEACHER'S REMARKS:</td>
                                                <td className='border-bottom text-center'></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className='padding-10 margin-top-40'>
                                        <table className='table w-full'>
                                            <tbody>
                                                <tr>
                                                    <td className='text-left'>
                                                        <span className='border-top'>PARENT'S SIGNATURE</span>
                                                    </td>
                                                    <td className='text-center'>
                                                        <span className='border-top'>CLASS TEACHER'S SIGNATURE</span>
                                                    </td>
                                                    <td className='text-right'>
                                                        <span className='border-top'>PRINCIPAL'S SIGNATURE</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
