'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import React, { useMemo } from 'react';

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
    const asmC_SectionName = stuDetails.asmC_SectionName || sectionNameVal || '';
    const amaY_RollNo = stuDetails.amaY_RollNo || '';
    const amsT_RegistrationNo = stuDetails.amsT_RegistrationNo || '';
    const amsT_Photoname = stuDetails.amsT_Photoname || '';

    // Address info
    const amsT_FatherName = stuDetails.amsT_FatherName || stuDetails.amsT_MotherName || '';
    const amsT_PerStreet = stuDetails.amsT_PerStreet || '';
    const amsT_PerArea = stuDetails.amsT_PerArea || '';
    const amsT_PerCity = stuDetails.amsT_PerCity || '';
    const ivrmmS_Name = stuDetails.ivrmmS_Name || '';
    const ivrmmC_CountryName = stuDetails.ivrmmC_CountryName || '';
    const amsT_PerPincode = stuDetails.amsT_PerPincode || '';
    const amsT_EmailId = stuDetails.amsT_EmailId || '';
    const amsT_DOB = stuDetails.amsT_DOB || '';
    const asmaY_Year = stuDetails.asmaY_Year || academicYearName || '';

    const exm_sub_mrks_list = data?.subjectMarks || data?.eam_sub_mrks_list || data?.exm_sub_mrks_list || [];
    const examwiseremarks = data?.examRemarks || data?.examwiseremarks || [];
    const grade_detailslist = data?.gradeDetails || data?.grade_detailslist || data?.grade_list || [];
    const exmtpr = data?.exmtpr || data?.savelist || [];

    const halfyearattworking = data?.halfyearattworking || '';
    const fullyearattworking = data?.fullyearattworking || '';
    const halfyearattpresent = data?.halfyearattpresent || '';
    const fullyearattpresent = data?.fullyearattpresent || '';

    // Extract dynamic list of exams and subjects
    const { exam_list, subject_list, total_subwise } = useMemo(() => {
        const exams: any[] = [];
        const subjects: any[] = [];
        let overalltotalmax = 0;

        exm_sub_mrks_list.forEach((st: any) => {
            if (st.emeid && st.examname && !exams.some((ex) => ex.emE_Id === st.emeid)) {
                overalltotalmax += Number(st.maxmarks || 0);
                exams.push({ emE_Id: st.emeid, emE_ExamName: st.examname, maxmarks: st.maxmarks });
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

        const totalSubwise: any[] = [];
        subjectsWithSub.forEach((subj) => {
            const total_ssubj_marks: any[] = [];
            subj.subsubjects.forEach((ssubj: any) => {
                let Ssubj_marks = 0;
                let Ssubj_mxmmarks = 0;
                exm_sub_mrks_list.forEach((marks: any) => {
                    if (marks.subid === subj.ISMS_Id && marks.ssubj === ssubj.EMSS_Id) {
                        if (marks.flag === true || marks.flag === 'true') {
                            Ssubj_marks += Number(marks.obtainmarks || 0);
                            Ssubj_mxmmarks += Number(marks.maxmarks || 0);
                        }
                    }
                });
                total_ssubj_marks.push({
                    EMSS_Id: ssubj.EMSS_Id,
                    SubSbuject: ssubj.SubSbuject,
                    total_ss: Ssubj_marks,
                    subsbmaxmrk: Ssubj_mxmmarks
                });
            });
            totalSubwise.push({ ISMS_Id: subj.ISMS_Id, Ssubj_total: total_ssubj_marks });
        });

        return {
            exam_list: exams,
            subject_list: subjectsWithSub,
            total_subwise: totalSubwise
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
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid black !important;
                        padding: 3px 4px !important;
                        font-size: 10px !important;
                    }
                    .table-print td {
                        padding: 3px 4px !important;
                        font-size: 10px !important;
                    }
                    .report-title-section h1 { font-size: 26px !important; margin: 0 !important; }
                    .report-title-section h4 { font-size: 11px !important; margin: 0 !important; }
                    .report-logo { height: 60px !important; }
                    .report-student-photo { width: 90px !important; height: 100px !important; }
                    .section-header { font-size: 12px !important; padding-bottom: 2px !important; margin-bottom: 4px !important; }
                    h2 { margin: 4px 0 !important; }
                    .remarks-section { font-size: 10px !important; }
                    .p-8 { padding: 0 !important; }
                }
                .table-print { width: 100%; border-collapse: collapse; font-size: 11px; }
                .table-bordered th, .table-bordered td { border: 1px solid #ddd; padding: 4px; font-size: 11px; }
                `
                }}
            />

            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='bg-primary text-white'>
                    <Printer className='mr-2 h-4 w-4' /> Print Report
                </Button>
            </div>

            <div className='printable-area rounded-lg border border-gray-200 bg-white p-4 text-black shadow-sm md:p-8 print:border-none print:shadow-none'>
                {/* SINGLE PAGE CONTAINER */}
                <div className='mx-auto flex w-full max-w-4xl flex-col gap-3'>
                    {/* Header */}
                    <div className='report-title-section relative space-y-1 text-center'>
                        <div className='header text-center'>
                            <h1
                                style={{
                                    fontFamily: "'Monotype Corsiva', 'Apple Chancery', cursive, serif",
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#1a365d',
                                    lineHeight: '1.1'
                                }}>
                                Hutchings High School & Junior College
                            </h1>
                            <h4 style={{ fontSize: '13px', fontStyle: 'italic', color: '#555' }}>
                                (Affiliated to the Council for the Indian School Certificate Examination, New Delhi)
                            </h4>
                        </div>
                        <div className='relative z-10 my-1 flex justify-center'>
                            <img
                                src='/images/Clients/Hutchings/ProgressReports/hhlogo.png'
                                className='report-logo h-[70px] w-auto object-contain'
                                alt='Hutchings Logo'
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/tunbridge_logo.png';
                                }}
                            />
                        </div>
                        <div className='font-medium text-gray-800 text-xs'>
                            7, Phayre Road, Pune - 411 040. Tel.: 020-26352764 | website : www.hutchingsschoolpune.in
                        </div>
                    </div>

                    <div className='mt-2 text-center'>
                        <h2 className='font-bold text-base uppercase tracking-wide'>
                            REPORT CARD - STANDARD {asmcL_ClassName} ({asmaY_Year})
                        </h2>
                    </div>

                    {/* Student Info & Photo Row */}
                    <div className='flex flex-row items-start justify-between gap-4'>
                        <div className='w-full flex-1'>
                            <table className='table-print table-bordered w-full'>
                                <tbody>
                                    <tr>
                                        <td className='w-[15%] font-semibold'>Student Name</td>
                                        <td className='w-[35%] font-bold'>{stuname}</td>
                                        <td className='w-[15%] font-semibold'>Roll No</td>
                                        <td className='w-[35%] font-bold'>{amaY_RollNo}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Standard</td>
                                        <td className='font-bold'>{asmcL_ClassName}</td>
                                        <td className='font-semibold'>Division</td>
                                        <td className='font-bold'>{asmC_SectionName}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Date of Birth</td>
                                        <td className='font-bold'>{formatDateVal(amsT_DOB)}</td>
                                        <td className='font-semibold'>Reg. No</td>
                                        <td className='font-bold'>{amsT_RegistrationNo}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Guardian's Name</td>
                                        <td className='font-bold'>{amsT_FatherName}</td>
                                        <td className='font-semibold'>Email Id</td>
                                        <td className='font-bold'>{amsT_EmailId}</td>
                                    </tr>
                                    <tr>
                                        <td className='font-semibold'>Address</td>
                                        <td colSpan={3} className='font-medium text-[10px]'>
                                            {[
                                                amsT_PerStreet,
                                                amsT_PerArea,
                                                amsT_PerCity,
                                                ivrmmS_Name,
                                                ivrmmC_CountryName,
                                                amsT_PerPincode ? `Pincode-${amsT_PerPincode}` : ''
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className='flex-shrink-0'>
                            {amsT_Photoname ? (
                                <img
                                    src={amsT_Photoname}
                                    alt='Student'
                                    className='report-student-photo h-[120px] w-[110px] border border-gray-300 bg-white object-cover'
                                />
                            ) : (
                                <div className='report-student-photo flex h-[120px] w-[110px] items-center justify-center border border-gray-300 border-dashed bg-gray-50 text-[10px] text-gray-400'>
                                    No Photo
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Record */}
                    <div className='mt-2'>
                        <div className='mb-2 text-center'>
                            <h3 className='section-header inline-block border-gray-800 border-b-2 px-4 font-bold text-sm'>
                                ACADEMIC RECORD
                            </h3>
                        </div>

                        <table className='table-print table-bordered w-full'>
                            <thead>
                                <tr className='bg-gray-50'>
                                    <th colSpan={2} className='text-center'>
                                        <b>SUBJECT</b>
                                    </th>
                                    {exam_list.map((role: any, idx: number) => (
                                        <th key={idx} className='whitespace-nowrap text-center'>
                                            <b>
                                                {role.emE_ExamName} <br /> ({role.maxmarks})
                                            </b>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            {/* Render Subjects with flag=true */}
                            <tbody>
                                {subject_list
                                    .filter((s: any) => s.flag === true || s.flag === 'true')
                                    .map((subj: any, sIdx: number) => (
                                        <React.Fragment key={sIdx}>
                                            <tr>
                                                <td
                                                    rowSpan={(subj.subsubjects?.length || 0) + 2}
                                                    colSpan={subj.subsubjects?.length === 0 ? 2 : 1}
                                                    className='align-middle font-bold'>
                                                    {subj.subjectname}
                                                </td>
                                            </tr>
                                            {subj.subsubjects?.map((ssubj: any, ssIdx: number) => (
                                                <tr key={ssIdx}>
                                                    {ssubj.EMSS_Id !== '0' && (
                                                        <td className='font-semibold text-[10px]'>{ssubj.SubSbuject}</td>
                                                    )}
                                                    {exam_list.map((y: any, eIdx: number) => {
                                                        const marks = exm_sub_mrks_list.find(
                                                            (m: any) =>
                                                                m.emeid === y.emE_Id &&
                                                                m.subid === subj.ISMS_Id &&
                                                                m.ssubj === ssubj.EMSS_Id
                                                        );
                                                        return (
                                                            <td key={eIdx} className='text-center'>
                                                                {marks &&
                                                                    (marks.PassFailFlg === 'AB' ||
                                                                    marks.PassFailFlg === 'M' ||
                                                                    marks.PassFailFlg === 'L' ? (
                                                                        <span>
                                                                            {marks.PassFailFlg}({marks.obtainmarks})
                                                                        </span>
                                                                    ) : (
                                                                        <span>{marks.obtainmarks}</span>
                                                                    ))}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                            <tr>
                                                {subj.subsubjects?.length > 0 && <td className='font-bold text-[10px]'>Total</td>}
                                                {exam_list.map((y: any, eIdx: number) => {
                                                    const marks = exm_sub_mrks_list.find(
                                                        (m: any) =>
                                                            m.emeid === y.emE_Id &&
                                                            m.subid === subj.ISMS_Id &&
                                                            (!m.ssubj || m.ssubj === '') &&
                                                            (!m.SubsubjectName || m.SubsubjectName === '')
                                                    );
                                                    return (
                                                        <td key={eIdx} className='text-center font-bold'>
                                                            {marks &&
                                                                (marks.PassFailFlg === 'AB' ||
                                                                marks.PassFailFlg === 'M' ||
                                                                marks.PassFailFlg === 'L' ? (
                                                                    <span>
                                                                        {marks.PassFailFlg}({marks.obtainmarks})
                                                                    </span>
                                                                ) : (
                                                                    <span>{marks.obtainmarks}</span>
                                                                ))}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </React.Fragment>
                                    ))}
                            </tbody>
                            {/* Render Subjects with flag=false */}
                            <tbody>
                                {subject_list
                                    .filter((s: any) => s.flag === false || s.flag === 'false')
                                    .map((subj: any, sIdx: number) => (
                                        <React.Fragment key={sIdx}>
                                            <tr>
                                                <td
                                                    rowSpan={(subj.subsubjects?.length || 0) + 2}
                                                    colSpan={subj.subsubjects?.length === 0 ? 2 : 1}
                                                    className='align-middle font-bold'>
                                                    {subj.subjectname}
                                                </td>
                                            </tr>
                                            {subj.subsubjects?.map((ssubj: any, ssIdx: number) => (
                                                <tr key={ssIdx}>
                                                    <td className='font-semibold text-[10px]'>{ssubj.SubSbuject}</td>
                                                    {exam_list.map((y: any, eIdx: number) => {
                                                        const marks = exm_sub_mrks_list.find(
                                                            (m: any) =>
                                                                m.emeid === y.emE_Id &&
                                                                m.subid === subj.ISMS_Id &&
                                                                m.ssubj === ssubj.EMSS_Id
                                                        );
                                                        return (
                                                            <td key={eIdx} className='text-center'>
                                                                {marks &&
                                                                    (marks.PassFailFlg === 'AB' ||
                                                                    marks.PassFailFlg === 'M' ||
                                                                    marks.PassFailFlg === 'L' ? (
                                                                        <span>{marks.PassFailFlg}</span>
                                                                    ) : (
                                                                        <span>{marks.ObtainedGrade}</span>
                                                                    ))}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                            <tr>
                                                {subj.subsubjects?.length > 0 && <td></td>}
                                                {exam_list.map((y: any, eIdx: number) => {
                                                    const marks = exm_sub_mrks_list.find(
                                                        (m: any) =>
                                                            m.emeid === y.emE_Id &&
                                                            m.subid === subj.ISMS_Id &&
                                                            (!m.ssubj || m.ssubj === '') &&
                                                            (!m.SubsubjectName || m.SubsubjectName === '')
                                                    );
                                                    return (
                                                        <td key={eIdx} className='text-center font-bold'>
                                                            {marks && (
                                                                <>
                                                                    {marks.PassFailFlg !== 'AB' &&
                                                                        marks.PassFailFlg !== 'M' &&
                                                                        marks.PassFailFlg !== 'L' &&
                                                                        marks.Marksdispaly === '1' && <span>{marks.obtainmarks}</span>}
                                                                    {marks.PassFailFlg !== 'AB' &&
                                                                        marks.PassFailFlg !== 'M' &&
                                                                        marks.PassFailFlg !== 'L' &&
                                                                        marks.Gradedisplay === '1' && <span>{marks.ObtainedGrade}</span>}
                                                                    {(marks.PassFailFlg === 'AB' ||
                                                                        marks.PassFailFlg === 'M' ||
                                                                        marks.PassFailFlg === 'L') && <span>{marks.PassFailFlg}</span>}
                                                                </>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </React.Fragment>
                                    ))}
                            </tbody>
                            <tfoot>
                                <tr className='bg-gray-50'>
                                    <td colSpan={2} className='font-bold'>
                                        Total / %
                                    </td>
                                    {exam_list.map((key: any, eIdx: number) => {
                                        const mm = exmtpr.find((m: any) => m.emE_Id === key.emE_Id);
                                        return (
                                            <td key={eIdx} className='text-center'>
                                                <b>
                                                    {mm?.estmP_TotalObtMarks} / {mm?.estmP_Percentage}%
                                                </b>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr className='bg-gray-50'>
                                    <td colSpan={2} className='font-bold'>
                                        Rank / Grade
                                    </td>
                                    {exam_list.map((key: any, eIdx: number) => {
                                        const mm = exmtpr.find((m: any) => m.emE_Id === key.emE_Id && m.emE_FinalExamFlag === 0);
                                        const mg = exmtpr.find((m: any) => m.emE_Id === key.emE_Id);
                                        return (
                                            <td key={eIdx} className='text-center'>
                                                <b>
                                                    {mm?.estmP_SectionRank || '-'} / {mg?.estmP_TotalGrade || '-'}
                                                </b>
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td colSpan={2} className='h-8 align-bottom font-bold'>
                                        Teacher's Sign
                                    </td>
                                    {exam_list.map((_: any, eIdx: number) => (
                                        <td key={eIdx}></td>
                                    ))}
                                </tr>
                                <tr>
                                    <td colSpan={2} className='h-8 align-bottom font-bold'>
                                        Parent's/Guardian's Sign
                                    </td>
                                    {exam_list.map((_: any, eIdx: number) => (
                                        <td key={eIdx}></td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>

                        {/* Remarks Section */}
                        {examwiseremarks.length > 0 && (
                            <div className='remarks-section mt-2 flex flex-row flex-wrap gap-2'>
                                {examwiseremarks.map((remarks: any, rIdx: number) => (
                                    <div key={rIdx} className='min-w-[200px] flex-1 border border-gray-300 p-2 text-[10px]'>
                                        <div className='mb-1 font-bold text-gray-700 uppercase'>{remarks.emE_ExamName} Remarks:</div>
                                        <div className='mb-3 font-semibold text-blue-900 italic'>{remarks.emeR_Remarks || 'None'}</div>
                                        <div className='border-gray-200 border-t pt-2 text-right font-bold'>Principal's Sign</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Row: Attendance & Grades */}
                    <div className='mt-1 flex flex-row items-start justify-between gap-4'>
                        <div className='w-2/5'>
                            <div className='mb-1 text-center'>
                                <h3 className='section-header inline-block border-gray-800 border-b-2 px-4 font-bold text-sm'>
                                    ATTENDANCE
                                </h3>
                            </div>
                            <table className='table-print table-bordered'>
                                <thead>
                                    <tr className='bg-gray-50'>
                                        <th className='text-center'>
                                            <b>HALF YEARLY</b>
                                        </th>
                                        <th className='text-center'>
                                            <b>FINAL</b>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            Working Days: <b>{halfyearattworking}</b>
                                        </td>
                                        <td>
                                            Working Days: <b>{fullyearattworking}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Days Present: <b>{halfyearattpresent}</b>
                                        </td>
                                        <td>
                                            Days Present: <b>{fullyearattpresent}</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='w-3/5'>
                            <div className='mb-1 text-center'>
                                <h3 className='section-header inline-block border-gray-800 border-b-2 px-4 font-bold text-sm'>GRADES</h3>
                            </div>
                            <table className='table-print table-bordered'>
                                <tbody>
                                    {grade_detailslist
                                        .reduce((result: any[], value: any, index: number, array: any[]) => {
                                            if (index % 2 === 0) result.push(array.slice(index, index + 2));
                                            return result;
                                        }, [])
                                        .map((pair: any[], pIdx: number) => (
                                            <tr key={pIdx}>
                                                {pair.map((gg: any, gIdx: number) => (
                                                    <React.Fragment key={gIdx}>
                                                        <td className='w-[15%] text-center font-bold'>{gg.emgD_Name}</td>
                                                        <td className='w-[25%] text-center font-semibold text-[9px] uppercase'>
                                                            {gg.emgD_Remarks}
                                                        </td>
                                                        <td className='w-[10%] text-center text-[10px]'>
                                                            {gg.emgD_From}-{gg.emgD_To}
                                                        </td>
                                                    </React.Fragment>
                                                ))}
                                                {pair.length === 1 && <td colSpan={3}></td>}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
