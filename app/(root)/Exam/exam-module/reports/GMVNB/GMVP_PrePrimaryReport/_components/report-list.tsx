'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const students = data?.getstudentdetails || [];
    const examList = data?.examlist_new || [];
    const activityTemp = data?.activity_temp || [];
    const { year, Reopen_Date, headerbg, marksbg, color } = data;

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
                <Button onClick={handlePrint} className='bg-primary text-white'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <div ref={reportRef} className='report-container bg-white p-4 text-[#1a1a1a]' style={{ fontFamily: 'system-ui, sans-serif' }}>
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
                        .page-break { page-break-before: always; }
                        .margin-top-100 { margin-top: 100px; }
                        .margin-top-15 { margin-top: 15px; }
                    }
                    .custom-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
                    .custom-table th, .custom-table td { border: 1px solid black; padding: 6px; }
                    .student-info-grid { display: grid; grid-template-columns: 80% 20%; gap: 15px; margin-bottom: 15px; font-size: 13px; }
                    .info-subgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .info-item { display: flex; gap: 5px; }
                    .info-label { font-weight: bold; width: 120px; }
                    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 80px; align-items: end; }
                `
                    }}
                />

                {students.map((report: any, index: number) => (
                    <div key={report.AMST_Id} className={`report-page ${index !== 0 ? 'page-break' : ''} mb-20`}>
                        {/* Header */}
                        <div className='mb-4'>
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/35f336e8-28d7-4fbe-94f6-4fdfd733ecf6.jpg'
                                className='h-auto w-full'
                                alt='Header'
                            />
                        </div>
                        <div className='mb-6 text-center'>
                            <h4 className='font-bold text-lg'>KINDERGARTEN ACHIEVEMENT REPORT {year}</h4>
                        </div>

                        {/* Student Details */}
                        <div className='student-info-grid'>
                            <div className='info-subgrid'>
                                <div className='space-y-2'>
                                    <div className='info-item'>
                                        <span className='info-label'>Student's Name</span>: <b>{report.studentname}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>Class</span>:{' '}
                                        <b>
                                            {report.classname} {report.sectionname}
                                        </b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>Admn No.</span>: <b>{report.admno}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>DOB</span>:{' '}
                                        <b>{report.dob ? format(new Date(report.dob), 'dd-MMM-yyyy') : ''}</b>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <div className='info-item'>
                                        <span className='info-label'>Father's Name</span>: <b>{report.fathername}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>Mother's Name</span>: <b>{report.mothername}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>Blood Group</span>: <b>{report.AMST_BloodGroup}</b>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                {report.photoname && (
                                    <img
                                        src={report.photoname}
                                        alt='Student'
                                        style={{ width: '100px', height: '100px', border: '1px solid black', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className='mt-5'>
                            <table className='custom-table'>
                                <thead>
                                    <tr style={{ backgroundColor: headerbg, color: color }}>
                                        <th className='text-left' rowSpan={2}>
                                            SUBJECTS
                                        </th>
                                        {examList.map((exm: any) => (
                                            <th key={exm.emE_Id} className='text-center'>
                                                {exm.emE_ExamName}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                {report.subjects?.map(
                                    (subj: any, i: number) =>
                                        subj.EYCES_AplResultFlg && (
                                            <tbody key={i} style={{ backgroundColor: marksbg }}>
                                                <tr>
                                                    <td className='text-left font-bold' colSpan={examList.length + 1}>
                                                        {subj.ISMS_SubjectName}
                                                    </td>
                                                </tr>
                                                {subj.subexam_list?.map((sub_sub: any, j: number) => (
                                                    <tr key={j}>
                                                        <td className='pl-6'>{sub_sub.EMSS_SubSubjectName}</td>
                                                        {examList.map((exm: any) => {
                                                            const mark = report.obtaioned_subject_wisemarks?.find(
                                                                (m: any) =>
                                                                    (m.EME_id ?? m.EME_Id ?? m.eme_Id) === exm.emE_Id &&
                                                                    (m.ISMS_Id ?? m.isms_Id) === (subj.ISMS_Id ?? subj.isms_Id) &&
                                                                    (m.EMSS_Id ?? m.emss_Id) === (sub_sub.EMSS_Id ?? sub_sub.emss_Id)
                                                            );
                                                            let displayMark = '-';
                                                            if (mark) {
                                                                if (mark.ESTMPSSS_PassFailFlg === 'AB') {
                                                                    displayMark = sub_sub.EYCES_GradeDisplayFlg
                                                                        ? '-'
                                                                        : mark.ESTMPSSS_PassFailFlg;
                                                                } else {
                                                                    if (sub_sub.EYCES_MarksDisplayFlg && !sub_sub.EYCES_GradeDisplayFlg)
                                                                        displayMark = mark.ESTMPSSS_ObtainedMarks;
                                                                    if (!sub_sub.EYCES_MarksDisplayFlg && sub_sub.EYCES_GradeDisplayFlg)
                                                                        displayMark = mark.ESTMPSSS_ObtainedGrade;
                                                                }
                                                            }
                                                            return (
                                                                <td key={exm.emE_Id} className='text-center font-medium'>
                                                                    {displayMark}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        )
                                )}
                                {activityTemp
                                    .filter((act: any) => act.ECACT_SkillName !== 'Specific Participation')
                                    .map((main_act: any, i: number) => (
                                        <tbody key={`act-${i}`} style={{ backgroundColor: marksbg }}>
                                            <tr>
                                                <td
                                                    className='text-left font-bold'
                                                    colSpan={examList.length + 1}
                                                    dangerouslySetInnerHTML={{
                                                        __html: main_act.ECACT_SkillName?.split('/').join('<br/>')
                                                    }}></td>
                                            </tr>
                                            {report.ECACTA_SkillArea_temp?.filter((act: any) => act.ECACT_Id === main_act.ECACT_Id).map(
                                                (act: any, j: number) => (
                                                    <tr key={j}>
                                                        <td className='pl-6'>{act.ECACTA_SkillArea}</td>
                                                        {examList.map((exm: any) => {
                                                            const score =
                                                                report.activity_mian_stu_wise?.find(
                                                                    (s: any) =>
                                                                        (s.EME_Id ?? s.EME_id ?? s.eme_Id) === exm.emE_Id &&
                                                                        (s.ECACTA_Id ?? s.ecacta_Id) === (act.ECACTA_Id ?? act.ecacta_Id)
                                                                )?.ECSACTT_Score || '-';
                                                            return (
                                                                <td key={exm.emE_Id} className='text-center font-medium'>
                                                                    {score}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    ))}
                            </table>
                        </div>

                        {/* Attendance Table */}
                        <div className='mt-4'>
                            <table className='custom-table'>
                                <tbody>
                                    <tr>
                                        <td style={{ backgroundColor: marksbg }} className='w-1/3 text-center font-bold'>
                                            Attendance
                                        </td>
                                        <td className='w-1/3'>Total Working Days : {report.totalWorkingDays}</td>
                                        <td className='w-1/3'>Total Present Days : {report.totalPresentDays}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Health Status Table */}
                        <div className='mt-4'>
                            <table className='custom-table'>
                                <tbody>
                                    <tr>
                                        <td colSpan={2} style={{ backgroundColor: marksbg }} className='text-center font-bold'>
                                            Health Status
                                        </td>
                                    </tr>
                                    <tr style={{ backgroundColor: marksbg }}>
                                        <td className='w-1/2'>Height (in cm) : {report.SPCCSHW_Height}</td>
                                        <td className='w-1/2'>Weight (in Kg): {report.SPCCSHW_Weight}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: marksbg }}>
                                        <td>Vision : ( OD & OS )</td>
                                        <td>{report.HMVSN_VisionHygiene}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} style={{ backgroundColor: marksbg }} className='text-center font-bold'>
                                            Dental Hygiene: {report.HMDNHY_DentalHygiene}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Activity Grade Scale Table */}
                        <div className='mt-4'>
                            <table className='custom-table text-center'>
                                <tbody>
                                    <tr style={{ backgroundColor: marksbg }}>
                                        <td colSpan={6}>Activity Grade Scale : Grades are based on a 5 Point Grading Scale as follows</td>
                                    </tr>
                                    <tr style={{ backgroundColor: marksbg }} className='font-bold'>
                                        <td>GRADE</td>
                                        <td>A1</td>
                                        <td>A2</td>
                                        <td>B</td>
                                        <td>C</td>
                                        <td>D</td>
                                    </tr>
                                    <tr style={{ backgroundColor: headerbg, color: color }} className='font-bold'>
                                        <td>DESCRIPTION</td>
                                        <td>Outstanding</td>
                                        <td>Excellent</td>
                                        <td>Very Good</td>
                                        <td>Good</td>
                                        <td>Scope for improvement</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className='footer-grid margin-top-100'>
                            <div className='flex flex-col gap-1 text-left'>
                                <img
                                    style={{ width: '150px' }}
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/7ca4aa81-6797-481d-aa9e-c2ae85080ed8.jpg'
                                    alt='Signature'
                                />
                                <strong>Principal’s Signature</strong>
                            </div>
                            <div className='text-center'>
                                <strong>Institution Seal</strong>
                            </div>
                            <div className='text-right'>
                                <strong>Class Teacher’s Signature</strong>
                                <br />
                                <b>Date: {Reopen_Date ? format(new Date(Reopen_Date), 'dd/MM/yyyy') : ''}</b>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
