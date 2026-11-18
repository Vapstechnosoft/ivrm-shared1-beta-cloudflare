'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportListProps {
    reportData: any;
    reportParams: any;
}

export const ReportList = ({ reportData, reportParams }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        examlist = [],
        subjectlist = [],
        student_list = [],
        process_examdetails = [],
        work_attendence = [],
        present_attendence = [],
        exmConfig_PromotionFlag,
        emP_MarksPerFlg,
        temp_headers = [],
        promotion_stumarks = [],
        promotion_mainmarks = [],
        yearName = reportParams?.yearName || '',
        className = reportParams?.className || '',
        sectionName = reportParams?.sectionName || '',
        classteacher = []
    } = reportData ?? {};

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `BCEHS_Final_Promotion_Report_${yearName}_${className}`
    });

    const handleExcel = () => {
        const table = printRef.current?.querySelector('table');
        if (!table) return;
        const wb = XLSX.utils.table_to_book(table, { sheet: 'Report' });
        XLSX.writeFile(wb, `BCEHS_Promotion_Report_${yearName}.xlsx`);
    };

    if (!student_list || student_list.length === 0) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    const classTeacherName = classteacher?.[0]?.hrmE_EmployeeFirstName || '';

    // Data binding helpers from BBHS
    const getExamProcess = (studentId: number, examId: number) => {
        if (!process_examdetails) return undefined;
        return process_examdetails.find(
            (e: any) => String(e.amsT_Id || e.AMST_Id) === String(studentId) && String(e.emE_Id) === String(examId)
        );
    };

    const getAttendance = (studentId: number, list: any[]) => {
        if (!list) return {};
        const att = list.find((a: any) => String(a.studentId) === String(studentId)) || {};
        // Make keys case-insensitive by building a lowercase-keyed object
        const lowerAtt: any = {};
        for (const k of Object.keys(att)) {
            lowerAtt[k.toLowerCase()] = att[k];
        }
        return lowerAtt;
    };

    const getPromMarks = (studentId: number, subjectId: number) => {
        if (!promotion_stumarks) return undefined;
        return promotion_stumarks.find(
            (m: any) => String(m.amsT_Id || m.AMST_Id) === String(studentId) && String(m.ismS_Id || m.ISMS_Id) === String(subjectId)
        );
    };

    const getPromMain = (studentId: number) => {
        if (!promotion_mainmarks) return undefined;
        return promotion_mainmarks.find((m: any) => String(m.amsT_Id || m.AMST_Id) === String(studentId));
    };

    const renderFormat1 = () => (
        <div className='space-y-10'>
            {student_list.map((stud: any, sIdx: number) => {
                const totalArraySLength = 0;
                const rowSpanVal = subjectlist.length - totalArraySLength + 3;

                return (
                    <div key={stud.amsT_Id} className='page-break-after-always' style={{ pageBreakAfter: 'always', paddingBottom: '30px' }}>
                        <div className='mb-4 text-center font-bold'>
                            <h4 className='text-[18px]'>
                                PROGRESS REPORT
                                <br />
                                ACADEMIC YEAR : {yearName}
                            </h4>
                        </div>

                        <div className='mb-4 flex w-full text-[14px]'>
                            <div className='w-5/12'>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>NAME</div>
                                    <div className='w-8/12 font-bold uppercase'>: {stud.amsT_FirstName}</div>
                                </div>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>Class Teacher</div>
                                    <div className='w-8/12 font-bold uppercase'>: {classTeacherName}</div>
                                </div>
                            </div>
                            <div className='w-3/12'>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>CLASS</div>
                                    <div className='w-8/12 font-bold uppercase'>: {className}</div>
                                </div>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>D.O.B</div>
                                    <div className='w-8/12 font-bold uppercase'>
                                        :{' '}
                                        {stud.amsT_DOB
                                            ? new Date(stud.amsT_DOB)
                                                  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                  .replace(/ /g, '/')
                                            : ''}
                                    </div>
                                </div>
                            </div>
                            <div className='w-4/12'>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>SECTION</div>
                                    <div className='w-8/12 font-bold uppercase'>: {sectionName}</div>
                                </div>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>ADM. NO</div>
                                    <div className='w-8/12 font-bold uppercase'>: {stud.amsT_AdmNo}</div>
                                </div>
                            </div>
                        </div>

                        <table className='mb-4 w-full border-collapse border border-black text-center text-[12px]'>
                            <thead>
                                <tr className='bg-white'>
                                    <th rowSpan={2} className='w-[150px] border border-black p-1'>
                                        <b>Subjects</b>
                                    </th>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.emE_ExamName}</b>
                                                </th>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag !== 'F' && (
                                                <th key={idx} rowSpan={2} className='border border-black p-1'>
                                                    <b>{hdr.Per_val} %</b>
                                                </th>
                                            )
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.emE_ExamName}</b>
                                                </th>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag === 'F' &&
                                            !hdr.equal_flag && (
                                                <th key={idx} rowSpan={2} className='border border-black p-1'>
                                                    <b>{hdr.Per_val} %</b>
                                                </th>
                                            )
                                    )}
                                    <th className='border border-black p-1'>
                                        <b>TOTAL</b>
                                    </th>
                                    <th className='w-[300px] border border-black p-1'>
                                        <b>REMARKS</b>
                                    </th>
                                </tr>
                                <tr className='bg-white'>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.marks}</b>
                                                </th>
                                            )
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.marks}</b>
                                                </th>
                                            )
                                    )}
                                    <th className='border border-black p-1'>
                                        <b>100%</b>
                                    </th>
                                    <th className='border border-black p-1'>
                                        <b>Note:Remarks are based on Total Marks</b>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stud.final_subj_marks?.map(
                                    (sub: any, subIdx: number) =>
                                        sub.sub_details.flag && (
                                            <tr key={subIdx}>
                                                <td className='border border-black p-1 text-left'>{sub.sub_details.ismS_SubjectName}</td>
                                                {sub.subj_marks_details?.map((marks: any, mIdx: number) => (
                                                    <td key={mIdx} className='border border-black p-1'>
                                                        {marks.estmpS_ObtainedMarks}
                                                    </td>
                                                ))}
                                                <td className='border border-black p-1'>{sub.sub_details.estmppS_ObtainedMarks}</td>
                                                <td className='border border-black p-1'>{sub.sub_details.estmppS_Remarks}</td>
                                            </tr>
                                        )
                                )}
                                <tr>
                                    <td className='border border-black p-1 text-left'>
                                        <b>TOTAL</b>
                                    </td>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <td key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_TotalObtMarks}</b>
                                                </td>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag !== 'F' && (
                                                <td key={idx} className='border border-black p-1'>
                                                    <b>
                                                        {stud.stu_Total_Array_Grp?.[0]?.total_s_o
                                                            ? Math.round(stud.stu_Total_Array_Grp[0].total_s_o)
                                                            : ''}
                                                    </b>
                                                </td>
                                            )
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <td key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_TotalObtMarks}</b>
                                                </td>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag === 'F' &&
                                            !hdr.equal_flag && (
                                                <td key={idx} className='border border-black p-1'>
                                                    <b>
                                                        {stud.stu_Total_Array_Grp?.[0]?.total_s_f
                                                            ? Math.round(stud.stu_Total_Array_Grp[0].total_s_f)
                                                            : ''}
                                                    </b>
                                                </td>
                                            )
                                    )}
                                    <td className='border border-black p-1'>
                                        <b>{stud.stu_Total_total_grp ? Math.round(stud.stu_Total_total_grp) : ''}</b>
                                    </td>
                                    <td rowSpan={rowSpanVal > 0 ? rowSpanVal : 3} className='border border-black p-1 text-left align-top'>
                                        <b>Teacher's Remarks :</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border border-black p-1 text-left'>
                                        <b>PERCENTAGE</b>
                                    </td>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <td key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_Percentage}%</b>
                                                </td>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag !== 'F' && <td key={idx} className='border border-black p-1'></td>
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <td key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_Percentage}%</b>
                                                </td>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag === 'F' && !hdr.equal_flag && <td key={idx} className='border border-black p-1'></td>
                                    )}
                                    <td className='border border-black p-1'>
                                        <b>{stud.total_percentage}%</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border border-black p-1 text-left'>
                                        <b>RANK IN SECTION</b>
                                    </td>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <td key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_SectionRank}</b>
                                                </td>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag !== 'F' && <td key={idx} className='border border-black p-1'></td>
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <td key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_SectionRank}</b>
                                                </td>
                                            )
                                    )}
                                    {temp_headers.map(
                                        (hdr: any, idx: number) =>
                                            hdr.flag === 'F' && !hdr.equal_flag && <td key={idx} className='border border-black p-1'></td>
                                    )}
                                    <td className='border border-black p-1'></td>
                                </tr>
                                {stud.final_subj_marks?.map(
                                    (sub: any, subIdx: number) =>
                                        !sub.sub_details.flag && (
                                            <tr key={subIdx}>
                                                <td className='border border-black p-1 text-left'>{sub.sub_details.ismS_SubjectName}</td>
                                                {sub.subj_marks_details?.map((marks: any, mIdx: number) => (
                                                    <td key={mIdx} className='border border-black p-1'>
                                                        {marks.estmpS_ObtainedGrade}
                                                    </td>
                                                ))}
                                                <td className='border border-black p-1'></td>
                                            </tr>
                                        )
                                )}
                            </tbody>
                        </table>

                        <table className='mb-4 w-full border-collapse border border-black text-center text-[12px]'>
                            <tbody>
                                <tr>
                                    <td className='p-4 text-right'>
                                        <b>
                                            Class Teacher's Signature
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Principal's Signature&nbsp;&nbsp;&nbsp;&nbsp;
                                        </b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className='w-full border-collapse border border-black text-center text-[12px]'>
                            <thead>
                                <tr className='border-t-0 bg-white'>
                                    <th colSpan={16} className='border border-black border-t-0 p-1'>
                                        <b>ATTENDANCE</b>
                                    </th>
                                </tr>
                                <tr>
                                    <th className='border border-black p-1 text-center' colSpan={2}>
                                        <b>MONTH</b>
                                    </th>
                                    {['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'TOTAL', 'TOTAL%'].map(
                                        (m) => (
                                            <th key={m} className='border border-black p-1 text-center'>
                                                <b>{m}</b>
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='border border-black p-1' colSpan={2}>
                                        <b>WORKING DAYS</b>
                                    </td>
                                    {(() => {
                                        const att = getAttendance(stud.amsT_Id, work_attendence);
                                        return [
                                            'june',
                                            'july',
                                            'august',
                                            'september',
                                            'october',
                                            'november',
                                            'december',
                                            'january',
                                            'febrauary',
                                            'march',
                                            'april'
                                        ].map((k) => (
                                            <td key={k} className='border border-black p-1'>
                                                {att[k] || 0}
                                            </td>
                                        ));
                                    })()}
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, work_attendence).totalworkingdays || 0}</b>
                                    </td>
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, work_attendence).total_percentage || 0}%</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border border-black p-1' colSpan={2}>
                                        <b>PRESENT DAYS</b>
                                    </td>
                                    {(() => {
                                        const att = getAttendance(stud.amsT_Id, present_attendence);
                                        return [
                                            'june',
                                            'july',
                                            'august',
                                            'september',
                                            'october',
                                            'november',
                                            'december',
                                            'january',
                                            'febrauary',
                                            'march',
                                            'april'
                                        ].map((k) => (
                                            <td key={k} className='border border-black p-1'>
                                                {att[k] || 0}
                                            </td>
                                        ));
                                    })()}
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, present_attendence).totalpresentdays || 0}</b>
                                    </td>
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, present_attendence).total_percentage || 0}%</b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );

    const renderFormat2 = () => (
        <div className='space-y-10'>
            {student_list.map((stud: any, sIdx: number) => {
                const totalArraySLength = 0;
                const rowSpanVal = subjectlist.length - totalArraySLength + 3;

                return (
                    <div key={stud.amsT_Id} className='page-break-after-always' style={{ pageBreakAfter: 'always', paddingBottom: '30px' }}>
                        <div className='mb-4 text-center font-bold'>
                            <h4 className='text-[18px]'>
                                PROGRESS REPORT
                                <br />
                                ACADEMIC YEAR : {yearName}
                            </h4>
                        </div>

                        <div className='mb-4 flex w-full text-[14px]'>
                            <div className='w-5/12'>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>NAME</div>
                                    <div className='w-8/12 font-bold uppercase'>: {stud.amsT_FirstName}</div>
                                </div>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>Class Teacher</div>
                                    <div className='w-8/12 font-bold uppercase'>: {classTeacherName}</div>
                                </div>
                            </div>
                            <div className='w-3/12'>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>CLASS</div>
                                    <div className='w-8/12 font-bold uppercase'>: {className}</div>
                                </div>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>D.O.B</div>
                                    <div className='w-8/12 font-bold uppercase'>
                                        :{' '}
                                        {stud.amsT_DOB
                                            ? new Date(stud.amsT_DOB)
                                                  .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                  .replace(/ /g, '/')
                                            : ''}
                                    </div>
                                </div>
                            </div>
                            <div className='w-4/12'>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>SECTION</div>
                                    <div className='w-8/12 font-bold uppercase'>: {sectionName}</div>
                                </div>
                                <div className='mb-1 flex'>
                                    <div className='w-4/12 font-bold uppercase'>ADM. NO</div>
                                    <div className='w-8/12 font-bold uppercase'>: {stud.amsT_AdmNo}</div>
                                </div>
                            </div>
                        </div>

                        <table className='mb-4 w-full border-collapse border border-black text-center text-[12px]'>
                            <thead>
                                <tr className='bg-white'>
                                    <th rowSpan={2} className='w-[150px] border border-black p-1'>
                                        <b>Subjects</b>
                                    </th>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.emE_ExamName}</b>
                                                </th>
                                            )
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.emE_ExamName}</b>
                                                </th>
                                            )
                                    )}
                                    <th className='border border-black p-1'>
                                        <b>TOTAL</b>
                                    </th>
                                    <th className='w-[300px] border border-black p-1'>
                                        <b>REMARKS</b>
                                    </th>
                                </tr>
                                <tr className='bg-white'>
                                    {examlist.map(
                                        (exm: any) =>
                                            !exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.marks}</b>
                                                </th>
                                            )
                                    )}
                                    {examlist.map(
                                        (exm: any) =>
                                            exm.emE_FinalExamFlag && (
                                                <th key={exm.emE_Id} className='border border-black p-1'>
                                                    <b>{exm.marks}</b>
                                                </th>
                                            )
                                    )}
                                    <th className='border border-black p-1'>
                                        <b>{emP_MarksPerFlg === 'T' ? reportData.total_max_sub_marks : ''}</b>
                                        {emP_MarksPerFlg === 'F' &&
                                            examlist.map((exm: any) => exm.emE_FinalExamFlag && <span key={exm.emE_Id}>{exm.marks}</span>)}
                                    </th>
                                    <th className='border border-black p-1'>
                                        <b>Note:Remarks are based on Total Marks</b>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stud.stu_subjects?.map(
                                    (sub: any, subIdx: number) =>
                                        sub.flag && (
                                            <tr key={subIdx}>
                                                <td className='border border-black p-1 text-left'>{sub.ismS_SubjectName}</td>
                                                {examlist.map((exm: any) => {
                                                    const marks = stud.stu_student_marks?.find(
                                                        (m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id
                                                    );
                                                    const isSpecial = marks && ['AB', 'M', 'L'].includes(marks.estmpS_PassFailFlg);
                                                    return (
                                                        <td key={exm.emE_Id} className='border border-black p-1'>
                                                            {isSpecial ? (
                                                                <label>{marks.estmpS_PassFailFlg}</label>
                                                            ) : (
                                                                <label>{marks?.estmpS_ObtainedMarks}</label>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className='border border-black p-1'>
                                                    <span>{getPromMarks(stud.amsT_Id, sub.ismS_Id)?.estmppS_ObtainedMarks}</span>
                                                </td>
                                                <td className='border border-black p-1'>
                                                    <span>{getPromMarks(stud.amsT_Id, sub.ismS_Id)?.estmppS_Remarks}</span>
                                                </td>
                                            </tr>
                                        )
                                )}
                                <tr>
                                    <td className='border border-black p-1 text-left'>
                                        <b>TOTAL</b>
                                    </td>
                                    {examlist.map((exm: any) => (
                                        <td key={exm.emE_Id} className='border border-black p-1'>
                                            <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_TotalObtMarks}</b>
                                        </td>
                                    ))}
                                    <td className='border border-black p-1'>
                                        <b>{getPromMain(stud.amsT_Id)?.estmpP_TotalObtMarks}</b>
                                    </td>
                                    <td rowSpan={rowSpanVal > 0 ? rowSpanVal : 3} className='border border-black p-1 text-left align-top'>
                                        <b>Teacher's Remarks :</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border border-black p-1 text-left'>
                                        <b>PERCENTAGE</b>
                                    </td>
                                    {examlist.map((exm: any) => (
                                        <td key={exm.emE_Id} className='border border-black p-1'>
                                            <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_Percentage}%</b>
                                        </td>
                                    ))}
                                    <td className='border border-black p-1'>
                                        <b>{getPromMain(stud.amsT_Id)?.estmpP_Percentage}%</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border border-black p-1 text-left'>
                                        <b>RANK IN SECTION</b>
                                    </td>
                                    {examlist.map((exm: any) => (
                                        <td key={exm.emE_Id} className='border border-black p-1'>
                                            <b>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_SectionRank}</b>
                                        </td>
                                    ))}
                                    <td className='border border-black p-1'></td>
                                </tr>
                                {stud.stu_subjects?.map(
                                    (sub: any, subIdx: number) =>
                                        !sub.flag && (
                                            <tr key={subIdx}>
                                                <td className='border border-black p-1 text-left'>{sub.ismS_SubjectName}</td>
                                                {examlist.map((exm: any) => {
                                                    const marks = stud.stu_student_marks?.find(
                                                        (m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id
                                                    );
                                                    const isSpecial = marks && ['AB', 'M', 'L'].includes(marks.estmpS_PassFailFlg);
                                                    return (
                                                        <td key={exm.emE_Id} className='border border-black p-1'>
                                                            {isSpecial ? (
                                                                <label>{marks.estmpS_PassFailFlg}</label>
                                                            ) : (
                                                                <label>{marks?.estmpS_ObtainedGrade}</label>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className='border border-black p-1'></td>
                                            </tr>
                                        )
                                )}
                            </tbody>
                        </table>

                        <table className='mb-4 w-full border-collapse border border-black text-center text-[12px]'>
                            <tbody>
                                <tr>
                                    <td className='p-4 text-right'>
                                        <b>
                                            Class Teacher's Signature
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            Principal's Signature&nbsp;&nbsp;&nbsp;&nbsp;
                                        </b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className='w-full border-collapse border border-black text-center text-[12px]'>
                            <thead>
                                <tr className='border-t-0 bg-white'>
                                    <th colSpan={16} className='border border-black border-t-0 p-1'>
                                        <b>ATTENDANCE</b>
                                    </th>
                                </tr>
                                <tr>
                                    <th className='border border-black p-1 text-center' colSpan={2}>
                                        <b>MONTH</b>
                                    </th>
                                    {['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'TOTAL', 'TOTAL%'].map(
                                        (m) => (
                                            <th key={m} className='border border-black p-1 text-center'>
                                                <b>{m}</b>
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='border border-black p-1' colSpan={2}>
                                        <b>WORKING DAYS</b>
                                    </td>
                                    {(() => {
                                        const att = getAttendance(stud.amsT_Id, work_attendence);
                                        return [
                                            'june',
                                            'july',
                                            'august',
                                            'september',
                                            'october',
                                            'november',
                                            'december',
                                            'january',
                                            'febrauary',
                                            'march',
                                            'april'
                                        ].map((k) => (
                                            <td key={k} className='border border-black p-1'>
                                                {att[k] || 0}
                                            </td>
                                        ));
                                    })()}
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, work_attendence).totalworkingdays || 0}</b>
                                    </td>
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, work_attendence).total_percentage || 0}%</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border border-black p-1' colSpan={2}>
                                        <b>PRESENT DAYS</b>
                                    </td>
                                    {(() => {
                                        const att = getAttendance(stud.amsT_Id, present_attendence);
                                        return [
                                            'june',
                                            'july',
                                            'august',
                                            'september',
                                            'october',
                                            'november',
                                            'december',
                                            'january',
                                            'febrauary',
                                            'march',
                                            'april'
                                        ].map((k) => (
                                            <td key={k} className='border border-black p-1'>
                                                {att[k] || 0}
                                            </td>
                                        ));
                                    })()}
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, present_attendence).totalpresentdays || 0}</b>
                                    </td>
                                    <td className='border border-black p-1'>
                                        <b>{getAttendance(stud.amsT_Id, present_attendence).total_percentage || 0}%</b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Card className='mt-6 font-sans text-black'>
            <div className='no-print flex items-center justify-between border-b px-6 py-3'>
                <h3 className='font-semibold text-lg'>Promotion Report</h3>
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={handleExcel} className='flex items-center gap-2'>
                        <FileDown className='h-4 w-4' /> Excel
                    </Button>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <CardContent className='p-6'>
                <div ref={printRef} className='overflow-auto bg-white'>
                    {emP_MarksPerFlg === 'P' ? renderFormat1() : renderFormat2()}
                </div>
            </CardContent>
        </Card>
    );
};
