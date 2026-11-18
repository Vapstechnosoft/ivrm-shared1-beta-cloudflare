'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const students = data?.student_list || data?.studentdetails || [];
    const termwiseexamlistnewtemp = data?.termwiseexamlistnewtemp || [];
    const termlistnew = data?.termlistnew || [];

    const handlePrint = () => {
        window.print();
    };

    if (students.length === 0) {
        return (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-700 shadow-sm'>
                No student data found for the selected criteria.
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-end gap-2 pt-4 pb-4'>
                <Button onClick={handlePrint} className='bg-primary text-white shadow-md'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <div ref={reportRef} className='report-container bg-white p-4 font-serif text-[#1a1a1a]'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .report-container, .report-container * { visibility: visible; }
                        .report-container { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            padding: 0 !important; 
                        }
                        @page { size: portrait; margin: 10mm; }
                        .page-break { page-break-after: always; }
                    }
                    .ix-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; border: 1.5px solid black; }
                    .ix-table th, .ix-table td { border: 1px solid black; padding: 4px 6px; text-align: center; }
                    .header-section { text-align: center; margin-bottom: 20px; }
                    .student-info-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; margin-bottom: 15px; font-size: 11px; }
                    .info-item { display: flex; gap: 5px; margin-bottom: 4px; }
                    .info-label { font-weight: bold; min-width: 100px; }
                    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 60px; }
                    .signature-box { border-top: 1.5px solid black; text-align: center; padding-top: 5px; font-weight: bold; font-size: 11px; }
                    .attendance-table { width: 100%; margin-top: 20px; font-size: 12px; }
                    .remarks-row { border-bottom: 1px solid black; height: 25px; margin-top: 5px; }
                `
                    }}
                />

                {students.map((report: any, index: number) => (
                    <div key={report.AMST_Id} className={`report-page ${index !== students.length - 1 ? 'page-break' : ''} mb-20`}>
                        {/* Header */}
                        <div className='header-section'>
                            <h2 className='font-bold text-lg'>PROGRESS REPORT</h2>
                            <h3 className='font-bold text-md'>ACADEMIC YEAR {data.yearname || data.Year_Name}</h3>
                        </div>

                        {/* Student Details */}
                        <div className='student-info-grid'>
                            <div>
                                <div className='info-item'>
                                    <span className='info-label'>NAME</span>: <span className='font-bold'>{report.studentname}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>DOB</span>: <span className='font-bold'>{report.dob}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>CLASS TEACHER</span>:{' '}
                                    <span className='font-bold'>{data.clastechname || data.Class_Teacher_Name}</span>
                                </div>
                            </div>
                            <div>
                                <div className='info-item'>
                                    <span className='info-label'>CLASS</span>: <span className='font-bold'>{report.classname}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>ROLL NO</span>: <span className='font-bold'>{report.rollno}</span>
                                </div>
                            </div>
                            <div>
                                <div className='info-item'>
                                    <span className='info-label'>SECTION</span>: <span className='font-bold'>{report.sectionname}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>ADM. NO</span>: <span className='font-bold'>{report.admno}</span>
                                </div>
                            </div>
                        </div>

                        {/* Marks Table */}
                        <table className='ix-table'>
                            <thead>
                                <tr>
                                    <th rowSpan={2} style={{ width: '40px' }}>
                                        SL.NO
                                    </th>
                                    <th rowSpan={2} style={{ width: '180px' }} className='text-left'>
                                        SUBJECT
                                    </th>
                                    {termlistnew.map((term: any, i: number) => (
                                        <th key={i} colSpan={term.termwiseexamlist.length} className='text-center uppercase'>
                                            {term.ecT_TermName}
                                        </th>
                                    ))}
                                    <th rowSpan={2} style={{ width: '80px' }} className='bg-gray-100 font-black'>
                                        FINAL CUMULATIVE
                                    </th>
                                </tr>
                                <tr>
                                    {termwiseexamlistnewtemp.map((exam: any, i: number) => (
                                        <th key={i} className='text-[8px] leading-tight'>
                                            {exam.emE_ExamName} <br /> {exam.ecteX_MarksPercentValue}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Academic Subjects */}
                            {report.subjectgroup?.map((subgrp: any, gi: number) => (
                                <tbody key={gi}>
                                    {subgrp.subgrplist
                                        ?.filter((s: any) => s.EYCES_AplResultFlg)
                                        .map((subj: any, si: number) => (
                                            <tr key={si}>
                                                {si === 0 && (
                                                    <td
                                                        rowSpan={
                                                            subgrp.subgrplist.filter((s: any) => s.EYCES_AplResultFlg).length +
                                                            (gi === report.subjectgroup.length - 1 ? 1 : 0)
                                                        }
                                                        className='font-bold'>
                                                        {subgrp.snocountd}
                                                    </td>
                                                )}
                                                <td className='text-left font-bold uppercase'>{subj.ISMS_SubjectName}</td>
                                                {termwiseexamlistnewtemp.map((exam: any, ei: number) => (
                                                    <td key={ei}>
                                                        {(() => {
                                                            const m = report.markslist?.find(
                                                                (ml: any) =>
                                                                    ml.subjectid === subj.ISMS_Id &&
                                                                    ml.termid === exam.ecT_Id &&
                                                                    ml.examid === exam.emE_Id
                                                            );
                                                            if (!m) return '';
                                                            return exam.emE_ExamName === 'GRADE' ? m.grade : m.marksobtained;
                                                        })()}
                                                    </td>
                                                ))}
                                                {si === 0 && (
                                                    <td
                                                        rowSpan={
                                                            subgrp.subgrplist.filter((s: any) => s.EYCES_AplResultFlg).length +
                                                            (gi === report.subjectgroup.length - 1 ? 1 : 0)
                                                        }
                                                        className='font-black text-xs'>
                                                        {subgrp.obtmarks}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            ))}

                            {/* Grand Total Row */}
                            <tbody>
                                <tr className='bg-gray-50 font-black'>
                                    <td colSpan={2} className='text-left'>
                                        GRAND TOTAL
                                    </td>
                                    {termwiseexamlistnewtemp.map((exam: any, ei: number) => (
                                        <td key={ei}>
                                            {(() => {
                                                const m = report.markstotal?.find(
                                                    (mt: any) => mt.termid === exam.ecT_Id && mt.examid === exam.emE_Id
                                                );
                                                if (!m) return '';
                                                return exam.emE_ExamName === 'GRADE' ? m.grade : m.marksobtained;
                                            })()}
                                        </td>
                                    ))}
                                    <td>{report.obtmarks}</td>
                                </tr>
                            </tbody>

                            {/* Co-Scholastic Subjects */}
                            {report.subjectgroup?.map((subgrp: any, gi: number) => (
                                <tbody key={`co-${gi}`}>
                                    {subgrp.subgrplist
                                        ?.filter((s: any) => !s.EYCES_AplResultFlg)
                                        .map((subj: any, si: number) => (
                                            <tr key={si} className='text-gray-600'>
                                                {si === 0 && (
                                                    <td
                                                        rowSpan={subgrp.subgrplist.filter((s: any) => !s.EYCES_AplResultFlg).length}
                                                        className='font-bold'>
                                                        {subgrp.snocountd}
                                                    </td>
                                                )}
                                                <td className='text-left font-bold uppercase'>{subj.ISMS_SubjectName}</td>
                                                {termwiseexamlistnewtemp.map((exam: any, ei: number) => (
                                                    <td key={ei}>
                                                        {(() => {
                                                            const m = report.markslist?.find(
                                                                (ml: any) =>
                                                                    ml.subjectid === subj.ISMS_Id &&
                                                                    ml.termid === exam.ecT_Id &&
                                                                    ml.examid === exam.emE_Id
                                                            );
                                                            if (!m) return '';
                                                            return exam.emE_ExamName === 'GRADE' || exam.emE_ExamName === 'TOTAL'
                                                                ? '--'
                                                                : m.grade;
                                                        })()}
                                                    </td>
                                                ))}
                                                {si === 0 && (
                                                    <td
                                                        rowSpan={subgrp.subgrplist.filter((s: any) => !s.EYCES_AplResultFlg).length}
                                                        className='font-black'>
                                                        --
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            ))}
                        </table>

                        {/* Attendance & Stats */}
                        <div className='mt-6 space-y-2 font-bold'>
                            <div>NO. OF WORKING DAYS : {report.workingdays}</div>
                            <div>NO. OF DAYS PRESENT : {report.presentdays}</div>
                        </div>

                        {/* Remarks */}
                        <div className='mt-6'>
                            <div className='mb-1 font-bold'>CLASS TEACHER'S REMARKS</div>
                            <div className='remarks-row'></div>
                        </div>

                        {/* Footer */}
                        <div className='footer-grid'>
                            <div className='signature-box'>PARENT'S SIGNATURE</div>
                            <div className='signature-box'>CLASS TEACHER'S SIGNATURE</div>
                            <div className='signature-box'>PRINCIPAL'S SIGNATURE</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
