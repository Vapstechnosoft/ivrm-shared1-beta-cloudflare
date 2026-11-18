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

    const students = data?.student_list || [];
    const exam_list = data?.exam_list || [];
    const temp_headers = data?.temp_headers || [];
    const exam_process_details = data?.exam_process_details || [];
    const stud_work_attendence = data?.work_attendence || [];
    const stud_present_attendence = data?.present_attendence || [];
    const promotion_student_marks = data?.promotion_student_marks || [];
    const promotion_main_marks = data?.promotion_main_marks || [];

    if (students.length === 0) {
        return (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-700 shadow-sm'>
                No student data found for the selected criteria.
            </div>
        );
    }

    const getExamProcess = (studentId: number, examId: number) => {
        if (!exam_process_details || !Array.isArray(exam_process_details)) return undefined;
        return exam_process_details.find((e: any) => e && (e.amsT_Id === studentId || e.AMST_Id === studentId) && e.emE_Id === examId);
    };

    const getAttendance = (studentId: number, list: any[]) => {
        if (!list || !Array.isArray(list)) return {};
        return list.find((a: any) => a && a.studentId === studentId) || {};
    };

    const getPromMarks = (studentId: number, subjectId: number) => {
        if (!promotion_student_marks || !Array.isArray(promotion_student_marks)) return undefined;
        return promotion_student_marks.find(
            (m: any) => m && (m.amsT_Id === studentId || m.AMST_Id === studentId) && m.ismS_Id === subjectId
        );
    };

    const getPromMain = (studentId: number) => {
        if (!promotion_main_marks || !Array.isArray(promotion_main_marks)) return undefined;
        return promotion_main_marks.find((m: any) => m && (m.amsT_Id === studentId || m.AMST_Id === studentId));
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-end gap-2 pt-4 pb-4'>
                <Button onClick={handlePrint} className='bg-primary text-white'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <div ref={reportRef} className='report-container bg-white p-4 font-sans text-[#1a1a1a]'>
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
                            font-family: sans-serif !important;
                        }
                        @page { size: portrait; margin: 10mm; }
                        .page-break { page-break-after: always; }
                    }
                    .report-container { font-family: sans-serif; }
                    .baldwin-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; border: 1.5px solid black; }
                    .baldwin-table th, .baldwin-table td { border: 1px solid black; padding: 4px 6px; text-align: center; }
                    .baldwin-table th { background-color: #f8f9fa !important; font-weight: bold; }
                    .header-section { text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }
                    .student-info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; font-size: 12px; }
                    .info-item { display: flex; gap: 5px; }
                    .info-label { font-weight: bold; min-width: 80px; text-transform: uppercase; }
                    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 40px; padding: 0 20px; }
                    .footer-item { text-align: center; }
                    .signature-line { border-top: 1px solid black; margin-bottom: 5px; width: 100%; }
                    .remarks-section { margin-top: 20px; display: flex; border-bottom: 1px solid black; padding-bottom: 5px; }
                    .attendance-table { margin-top: 15px; border: 1.5px solid black; width: 100%; border-collapse: collapse; font-size: 12px; }
                    .attendance-table th, .attendance-table td { border: 1px solid black; padding: 3px; text-align: center; }
                `
                    }}
                />

                {students.map((stud: any, index: number) => (
                    <div key={stud.amsT_Id} className={`report-page ${index !== students.length - 1 ? 'page-break' : ''} mb-20`}>
                        {/* Header */}
                        <div className='header-section'>
                            <div className='mb-2 flex items-center justify-center gap-4'>
                                {/* {params.left_logo && data.masterinstitution?.mI_Logo && (
                                    <img src={data.masterinstitution.mI_Logo} alt="Logo" className='h-20 w-auto' />
                                )} */}
                                <div className='text-center'>
                                    {/* <h1 className='text-2xl font-black tracking-tight text-red-700'>{data.masterinstitution?.mI_Name}</h1>
                                    <p className='text-xs font-bold'>{data.masterinstitution?.mI_Address1}</p> */}
                                    <h2 className='mt-2 inline-block bg-black px-4 py-1 font-bold text-lg text-white'>PROGRESS REPORT</h2>
                                    <p className='mt-1 font-bold text-sm'>ACADEMIC YEAR : {data.selected_academicYear}</p>
                                </div>
                                {/* {params.right_logo && data.masterinstitution?.mI_Logo && (
                                    <img src={data.masterinstitution.mI_Logo} alt="Logo" className='h-20 w-auto' />
                                )} */}
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className='student-info-grid'>
                            <div className='space-y-1'>
                                <div className='info-item'>
                                    <span className='info-label'>NAME</span>: <span>{stud.amsT_FirstName}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>TEACHER</span>: <span>{data.Class_Teacher_Name}</span>
                                </div>
                            </div>
                            <div className='space-y-1'>
                                <div className='info-item'>
                                    <span className='info-label'>CLASS</span>: <span>{data.selected_class}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>D.O.B</span>:{' '}
                                    <span>{stud.amsT_DOB ? format(new Date(stud.amsT_DOB), 'dd/MMM/yyyy').toUpperCase() : ''}</span>
                                </div>
                            </div>
                            <div className='space-y-1'>
                                <div className='info-item'>
                                    <span className='info-label'>SECTION</span>: <span>{data.selected_section}</span>
                                </div>
                                <div className='info-item'>
                                    <span className='info-label'>ADM. NO</span>: <span>{stud.amsT_AdmNo}</span>
                                </div>
                            </div>
                        </div>

                        {/* Marks Table Variant P */}
                        {data.ExmConfig_PromotionFlag && data.EMP_MarksPerFlg === 'P' && (
                            <table className='baldwin-table'>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className='w-[180px]'>
                                            SUBJECTS
                                        </th>
                                        {exam_list.map(
                                            (exm: any) => !exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.emE_ExamName}</th>
                                        )}
                                        {temp_headers.map(
                                            (hdr: any, i: number) =>
                                                hdr.flag !== 'F' && (
                                                    <th key={i} rowSpan={2}>
                                                        {hdr.Per_val}%
                                                    </th>
                                                )
                                        )}
                                        {exam_list.map((exm: any) => exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.emE_ExamName}</th>)}
                                        {temp_headers.map(
                                            (hdr: any, i: number) =>
                                                hdr.flag === 'F' &&
                                                !hdr.equal_flag && (
                                                    <th key={i} rowSpan={2}>
                                                        {hdr.Per_val}%
                                                    </th>
                                                )
                                        )}
                                        <th>TOTAL</th>
                                        <th rowSpan={2} className='w-[300px]'>
                                            REMARKS
                                        </th>
                                    </tr>
                                    <tr>
                                        {exam_list.map((exm: any) => !exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.marks}</th>)}
                                        {exam_list.map((exm: any) => exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.marks}</th>)}
                                        <th>{data.total_max_sub_marks}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stud.final_subj_marks
                                        .filter((s: any) => s.sub_details.flag)
                                        .map((sub: any, i: number) => (
                                            <tr key={i}>
                                                <td className='text-left font-bold'>{sub.sub_details.ismS_SubjectName}</td>
                                                {sub.subj_marks_details.map((m: any, mi: number) => (
                                                    <td key={mi} className='font-bold'>
                                                        {m.estmpS_ObtainedMarks}
                                                    </td>
                                                ))}
                                                <td className='font-bold'>{sub.sub_details.estmppS_ObtainedMarks}</td>
                                                <td className='text-left text-xs'>{sub.sub_details.estmppS_Remarks}</td>
                                            </tr>
                                        ))}
                                    <tr className='bg-gray-50 font-bold'>
                                        <td className='text-left'>TOTAL</td>
                                        {exam_list.map(
                                            (exm: any) =>
                                                !exm.emE_FinalExamFlag && (
                                                    <td key={exm.emE_Id}>
                                                        {getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_TotalObtMarks}
                                                    </td>
                                                )
                                        )}
                                        {temp_headers.map(
                                            (hdr: any, i: number) =>
                                                hdr.flag !== 'F' && <td key={i}>{stud.stu_Total_Array_Grp?.[0]?.total_s_o}</td>
                                        )}
                                        {exam_list.map(
                                            (exm: any) =>
                                                exm.emE_FinalExamFlag && (
                                                    <td key={exm.emE_Id}>
                                                        {getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_TotalObtMarks}
                                                    </td>
                                                )
                                        )}
                                        {temp_headers.map(
                                            (hdr: any, i: number) =>
                                                hdr.flag === 'F' &&
                                                !hdr.equal_flag && <td key={i}>{stud.stu_Total_Array_Grp?.[0]?.total_s_f}</td>
                                        )}
                                        <td>{stud.stu_Total_total_grp}</td>
                                        <td></td>
                                    </tr>
                                    <tr className='font-bold'>
                                        <td className='text-left'>PERCENTAGE</td>
                                        {exam_list.map(
                                            (exm: any) =>
                                                !exm.emE_FinalExamFlag && (
                                                    <td key={exm.emE_Id}>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_Percentage}%</td>
                                                )
                                        )}
                                        {temp_headers.map((hdr: any, i: number) => hdr.flag !== 'F' && <td key={i}></td>)}
                                        {exam_list.map(
                                            (exm: any) =>
                                                exm.emE_FinalExamFlag && (
                                                    <td key={exm.emE_Id}>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_Percentage}%</td>
                                                )
                                        )}
                                        {temp_headers.map(
                                            (hdr: any, i: number) => hdr.flag === 'F' && !hdr.equal_flag && <td key={i}></td>
                                        )}
                                        <td>{stud.total_percentage}%</td>
                                        <td></td>
                                    </tr>
                                    {!params.dontShowRank && (
                                        <>
                                            <tr className='font-bold'>
                                                <td className='text-left'>RANK IN SECTION</td>
                                                {exam_list.map(
                                                    (exm: any) =>
                                                        !exm.emE_FinalExamFlag && (
                                                            <td key={exm.emE_Id}>
                                                                {getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_SectionRank}
                                                            </td>
                                                        )
                                                )}
                                                {temp_headers.map((hdr: any, i: number) => hdr.flag !== 'F' && <td key={i}></td>)}
                                                {exam_list.map(
                                                    (exm: any) =>
                                                        exm.emE_FinalExamFlag && (
                                                            <td key={exm.emE_Id}>
                                                                {getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_SectionRank}
                                                            </td>
                                                        )
                                                )}
                                                {temp_headers.map(
                                                    (hdr: any, i: number) => hdr.flag === 'F' && !hdr.equal_flag && <td key={i}></td>
                                                )}
                                                <td></td>
                                                <td></td>
                                            </tr>
                                            <tr className='font-bold'>
                                                <td className='text-left'>RANK IN CLASS</td>
                                                {exam_list.map(
                                                    (exm: any) =>
                                                        !exm.emE_FinalExamFlag && (
                                                            <td key={exm.emE_Id}>
                                                                {getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_ClassRank}
                                                            </td>
                                                        )
                                                )}
                                                {temp_headers.map((hdr: any, i: number) => hdr.flag !== 'F' && <td key={i}></td>)}
                                                {exam_list.map(
                                                    (exm: any) =>
                                                        exm.emE_FinalExamFlag && (
                                                            <td key={exm.emE_Id}>
                                                                {getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_ClassRank}
                                                            </td>
                                                        )
                                                )}
                                                {temp_headers.map(
                                                    (hdr: any, i: number) => hdr.flag === 'F' && !hdr.equal_flag && <td key={i}></td>
                                                )}
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        </>
                                    )}
                                    {/* Grade Subjects */}
                                    {stud.final_subj_marks
                                        .filter((s: any) => !s.sub_details.flag)
                                        .map((sub: any, i: number) => (
                                            <tr key={i}>
                                                <td className='text-left font-bold'>{sub.sub_details.ismS_SubjectName}</td>
                                                {sub.subj_marks_details.map((m: any, mi: number) => (
                                                    <td key={mi} className='font-bold'>
                                                        {m.estmpS_ObtainedGrade}
                                                    </td>
                                                ))}
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}

                        {/* Variant F or T */}
                        {data.ExmConfig_PromotionFlag && (data.EMP_MarksPerFlg === 'F' || data.EMP_MarksPerFlg === 'T') && (
                            <table className='baldwin-table'>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className='w-[180px]'>
                                            SUBJECTS
                                        </th>
                                        {exam_list.map(
                                            (exm: any) => !exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.emE_ExamName}</th>
                                        )}
                                        {exam_list.map((exm: any) => exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.emE_ExamName}</th>)}
                                        <th>TOTAL</th>
                                        <th rowSpan={2} className='w-[300px]'>
                                            REMARKS
                                        </th>
                                    </tr>
                                    <tr>
                                        {exam_list.map((exm: any) => !exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.marks}</th>)}
                                        {exam_list.map((exm: any) => exm.emE_FinalExamFlag && <th key={exm.emE_Id}>{exm.marks}</th>)}
                                        <th>
                                            {data.EMP_MarksPerFlg === 'T'
                                                ? data.total_max_sub_marks
                                                : 'Note:Remarks are based on Final Exam Marks'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stud.stu_subjects
                                        .filter((s: any) => s.flag)
                                        .map((sub: any, i: number) => {
                                            const promMarks = getPromMarks(stud.amsT_Id, sub.ismS_Id);
                                            return (
                                                <tr key={i}>
                                                    <td className='text-left font-bold'>{sub.ismS_SubjectName}</td>
                                                    {exam_list.map((exm: any) => (
                                                        <td key={exm.emE_Id} className='font-bold'>
                                                            {
                                                                stud.stu_student_marks.find(
                                                                    (m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id
                                                                )?.estmpS_ObtainedMarks
                                                            }
                                                        </td>
                                                    ))}
                                                    <td className='font-bold'>{promMarks?.estmppS_ObtainedMarks}</td>
                                                    <td className='text-left text-xs'>{promMarks?.estmppS_Remarks}</td>
                                                </tr>
                                            );
                                        })}
                                    <tr className='bg-gray-50 font-bold'>
                                        <td className='text-left'>TOTAL</td>
                                        {exam_list.map((exm: any) => (
                                            <td key={exm.emE_Id}>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_TotalObtMarks}</td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr className='font-bold'>
                                        <td className='text-left'>PERCENTAGE</td>
                                        {exam_list.map((exm: any) => (
                                            <td key={exm.emE_Id}>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_Percentage}%</td>
                                        ))}
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    {!params.dontShowRank && (
                                        <tr className='font-bold'>
                                            <td className='text-left'>RANK IN SECTION</td>
                                            {exam_list.map((exm: any) => (
                                                <td key={exm.emE_Id}>{getExamProcess(stud.amsT_Id, exm.emE_Id)?.estmP_SectionRank}</td>
                                            ))}
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    )}
                                    {/* Grade Subjects */}
                                    {stud.stu_subjects
                                        .filter((s: any) => !s.flag)
                                        .map((sub: any, i: number) => (
                                            <tr key={i}>
                                                <td className='text-left font-bold'>{sub.ismS_SubjectName}</td>
                                                {exam_list.map((exm: any) => (
                                                    <td key={exm.emE_Id} className='font-bold'>
                                                        {
                                                            stud.stu_student_marks.find(
                                                                (m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id
                                                            )?.estmpS_ObtainedGrade
                                                        }
                                                    </td>
                                                ))}
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}

                        {/* Attendance Table */}
                        <table className='attendance-table'>
                            <thead>
                                <tr>
                                    <th colSpan={15} className='bg-gray-100 uppercase'>
                                        ATTENDANCE
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={2}>MONTH</th>
                                    <th>JUN</th>
                                    <th>JUL</th>
                                    <th>AUG</th>
                                    <th>SEP</th>
                                    <th>OCT</th>
                                    <th>NOV</th>
                                    <th>DEC</th>
                                    <th>JAN</th>
                                    <th>FEB</th>
                                    <th>MAR</th>
                                    <th>APR</th>
                                    <th>TOTAL</th>
                                    <th>TOTAL%</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2} className='font-bold'>
                                        WORKING DAYS
                                    </td>
                                    {[
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
                                    ].map((m) => (
                                        <td key={m}>{getAttendance(stud.amsT_Id, stud_work_attendence)[m]}</td>
                                    ))}
                                    <td className='font-bold'>
                                        {getAttendance(stud.amsT_Id, stud_work_attendence).TotalWorkingDays || params.workingDays}
                                    </td>
                                    <td className='font-bold'>{getAttendance(stud.amsT_Id, stud_work_attendence).Total_Percentage}%</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className='font-bold'>
                                        PRESENT DAYS
                                    </td>
                                    {[
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
                                    ].map((m) => (
                                        <td key={m}>{getAttendance(stud.amsT_Id, stud_present_attendence)[m]}</td>
                                    ))}
                                    <td className='font-bold'>
                                        {getAttendance(stud.amsT_Id, stud_present_attendence).TotalPresentDays || params.presentDays}
                                    </td>
                                    <td className='font-bold'>{getAttendance(stud.amsT_Id, stud_present_attendence).Total_Percentage}%</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Remarks */}
                        <div className='remarks-section'>
                            <span className='mr-2 whitespace-nowrap font-black uppercase'>CLASS TEACHER'S REMARKS :</span>
                            <div className='flex-1 italic'>Promoted to Std X. Excellent performance in Mathematics and Science.</div>
                        </div>

                        {/* Footer */}
                        <div className='footer-grid'>
                            <div className='footer-item'>
                                <div className='h-12'></div>
                                <div className='signature-line'></div>
                                <p className='font-black text-[10px] uppercase'>PARENT'S SIGNATURE</p>
                            </div>
                            <div className='footer-item'>
                                <div className='h-12'></div>
                                <div className='signature-line'></div>
                                <p className='font-black text-[10px] uppercase'>CLASS TEACHER'S SIGNATURE</p>
                            </div>
                            <div className='footer-item'>
                                <div className='h-12'></div>
                                <div className='signature-line'></div>
                                <p className='font-black text-[10px] uppercase'>PRINCIPAL'S SIGNATURE</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
