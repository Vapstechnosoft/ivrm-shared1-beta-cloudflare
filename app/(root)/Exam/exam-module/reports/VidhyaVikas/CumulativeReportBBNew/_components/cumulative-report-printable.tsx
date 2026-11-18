import type { ICumulativeReport, IMasterInstitution, IReportHeader, ISubject, Institution } from '@/types/exam/exam-module/report';
import Image from 'next/image';
import React from 'react';
interface CumulativeReportPrintViewProps {
    reportData: ICumulativeReport[];
    institution: Institution | IMasterInstitution;
    subjects: ISubject[];
    headerInfo: Partial<IReportHeader>;
    fontSize: 'small' | 'medium' | 'large';
    columnFlags: {
        admno: boolean;
        regno: boolean;
        rollno: boolean;
        classrank: boolean;
        sectionrank: boolean;
        attendancedispaly: boolean;
    };
}

const fontSizeMap = {
    small: '10px',
    medium: '11px',
    large: '12px'
};

export default function CumulativeReportPrintView({
    reportData,
    institution,
    subjects,
    headerInfo,
    fontSize,
    columnFlags
}: CumulativeReportPrintViewProps) {
    const fontSizeValue = fontSizeMap[fontSize];

    // Separate applicable and non-applicable subjects
    const applicableSubjects = subjects.filter((s) => s.eyceS_AplResultFlg);
    const nonApplicableSubjects = subjects.filter((s) => !s.eyceS_AplResultFlg);

    return (
        <>
            {/* PRINT STYLES - NO BOLD ANYWHERE */}
            <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }

          body * {
            visibility: hidden !important;
          }
          #printable-report,
          #printable-report * {
            visibility: visible !important;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .screen-only,
          .no-print {
            display: none !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: ${fontSizeValue} !important;
          }

          .table-bordered {
            border: 0.5px solid #000 !important;
          }

          .table-bordered > thead > tr > th,
          .table-bordered > tbody > tr > td {
            border: 0.5px solid #000 !important;
            padding: 4px !important;
            text-align: center !important;
            vertical-align: middle !important;
            font-weight: normal !important; /* ← No bold */
          }

          .table-bordered > thead > tr > th {
            background: #fff !important;
            color: #000 !important;
            font-size: 12px !important;
            font-weight: normal !important;
          }

          .text-center {
            text-align: center !important;
          }
          .text-left {
            text-align: left !important;
          }
          .text-uppercase {
            text-transform: uppercase !important;
          }

          h3,
          h5 {
            margin: 2px 0 !important;
          }

          .student-name {
            text-align: left !important;
            padding-left: 8px !important;
          }

          .evs-cell {
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 2px 4px;
          }

          b,
          strong {
            font-weight: normal !important;
          }

          a {
            color: #000 !important;
            text-decoration: none !important;
          }
        }

        @media screen {
          #printable-report {
            display: none !important;
          }
        }
      `}</style>

            {/* PRINTABLE CONTENT */}
            <div id='printable-report' className='col-sm-12'>
                <div id='Baldwin' className='CumulativeReport'>
                    {/* HEADER */}
                    {/* <table style={{ width: '100%', marginBottom: '10px' }}>
                        <tbody>
                            <tr>
                                <td colSpan={applicableSubjects.length * 2 + 10} className='text-center'>
                                    <h3 style={{ margin: '2px 0', fontSize: '18px' }}>
                                        {institution.mI_Name || 'Vidya Vikasa Vidya Samsthe (R)'}
                                    </h3>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={applicableSubjects.length * 2 + 10} className='text-center'>
                                    <h5 style={{ margin: '2px 0', fontSize: '15px' }}>CLASS WISE CUMULATIVE REPORT</h5>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={applicableSubjects.length * 2 + 10}
                                    className='text-center text-uppercase'
                                    style={{ fontSize: fontSizeValue }}>
                                    <span>
                                        <strong className='font-bold'>ACADEMIC YEAR :</strong> {headerInfo.yr}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={applicableSubjects.length * 2 + 10}
                                    className='text-center text-uppercase'
                                    style={{ fontSize: fontSizeValue }}>
                                    <span>
                                        <strong className='font-bold'>CLASS & SEC :</strong> {headerInfo.cla} - {headerInfo.sec}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={applicableSubjects.length * 2 + 10}
                                    className='text-center text-uppercase'
                                    style={{ fontSize: fontSizeValue }}>
                                    <span>
                                        <strong className='font-bold'>Exam :</strong> {headerInfo.exmmid}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table> */}
                    <div className='mb-8 border-gray-400 border-b-2 pb-6 text-center'>
                        {institution.mI_Logo ? (
                            <div className='mb-6 flex justify-center'>
                                <Image
                                    src={institution.mI_Logo}
                                    alt='Institution Logo'
                                    width={1000}
                                    height={250}
                                    className='h-auto max-w-full object-contain'
                                    unoptimized
                                    priority
                                />
                            </div>
                        ) : (
                            <div className='h-32'>
                                <h3 className='font-bold text-3xl leading-tight'>{institution.mI_Name}</h3>
                            </div>
                        )}
                        <h4 className='mt-3 font-semibold text-xl'>Cumulative REPORT</h4>
                    </div>

                    {/* MAIN TABLE */}
                    <table className='table-bordered table-condensed table' style={{ fontSize: fontSizeValue }} border={1}>
                        <thead>
                            <tr>
                                <th rowSpan={2}>#</th>
                                <th rowSpan={2} className='student-name text-left'>
                                    Student Name
                                </th>
                                {columnFlags.admno && <th rowSpan={2}>Adm No</th>}
                                {columnFlags.regno && <th rowSpan={2}>Reg No</th>}
                                {columnFlags.rollno && <th rowSpan={2}>Roll No</th>}

                                {applicableSubjects.map((subj) => (
                                    <th key={subj.ismS_Id} colSpan={2}>
                                        {subj.ismS_SubjectName}
                                    </th>
                                ))}

                                {applicableSubjects.length > 0 && (
                                    <>
                                        <th rowSpan={2}>Total</th>
                                        <th rowSpan={2}>Obtained</th>
                                        <th rowSpan={2} style={{ width: '5%' }}>
                                            %
                                        </th>
                                        <th rowSpan={2}>Grade</th>
                                    </>
                                )}

                                {nonApplicableSubjects.map((subj) => (
                                    <th key={subj.ismS_Id} colSpan={2}>
                                        {subj.ismS_SubjectName}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                {applicableSubjects.map((subj) => (
                                    <React.Fragment key={subj.ismS_Id}>
                                        <th>Marks</th>
                                        <th>Grade</th>
                                    </React.Fragment>
                                ))}
                                {nonApplicableSubjects.map((subj) => (
                                    <React.Fragment key={subj.ismS_Id}>
                                        <th>Marks</th>
                                        <th>Grade</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((student, index) => {
                                const isAbsent = student.estmP_Result === 'AB';

                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className='student-name text-left'>{student.amsT_FirstName}</td>

                                        {columnFlags.admno && <td>{student.amsT_AdmNo ?? '-'}</td>}
                                        {columnFlags.regno && <td>{student.amsT_RegistrationNo ?? '-'}</td>}
                                        {columnFlags.rollno && <td>{student.amaY_RollNo ?? '-'}</td>}

                                        {/* Applicable Subjects */}
                                        {applicableSubjects.map((subj) => {
                                            const mark = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                                            const isAB = mark?.estmpS_PassFailFlg === 'AB';

                                            if (isAB) {
                                                return (
                                                    <td key={subj.ismS_Id} colSpan={2} style={{ padding: '2px' }}>
                                                        AB
                                                    </td>
                                                );
                                            }

                                            return (
                                                <React.Fragment key={subj.ismS_Id}>
                                                    <td style={{ padding: '2px' }}>
                                                        {mark?.estmpS_ObtainedMarks != null ? mark.estmpS_ObtainedMarks : '-'}
                                                    </td>
                                                    <td style={{ padding: '2px' }}>{mark?.estmpS_ObtainedGrade ?? '-'}</td>
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* Total Columns - NO BOLD */}
                                        {applicableSubjects.length > 0 && (
                                            <>
                                                <td>{isAbsent ? '' : (student.estmP_TotalMaxMarks ?? '-')}</td>
                                                <td>{isAbsent ? '' : (student.estmP_TotalObtMarks ?? '-')}</td>
                                                <td>{isAbsent ? '' : `${Number(student.estmP_Percentage ?? 0).toFixed(1)}%`}</td>
                                                <td>{isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}</td>
                                            </>
                                        )}

                                        {/* Non-applicable subjects */}
                                        {nonApplicableSubjects.map((subj) => {
                                            const mark = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
                                            const isAB = mark?.estmpS_PassFailFlg === 'AB';

                                            if (isAB) {
                                                return (
                                                    <td
                                                        key={subj.ismS_Id}
                                                        colSpan={2}
                                                        style={{ padding: '2px', textAlign: 'center', color: 'red' }}>
                                                        AB
                                                    </td>
                                                );
                                            }

                                            return (
                                                <React.Fragment key={subj.ismS_Id}>
                                                    <td style={{ padding: '2px', textAlign: 'center' }}>
                                                        {mark?.estmpS_ObtainedMarks != null ? mark.estmpS_ObtainedMarks : '-'}
                                                    </td>
                                                    <td style={{ padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
                                                        {mark?.estmpS_ObtainedGrade ?? '-'}
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
