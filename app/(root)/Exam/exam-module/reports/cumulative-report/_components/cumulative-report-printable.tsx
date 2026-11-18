import type { ICumulativeReport, IMasterInstitution, IReportHeader, ISubject, Institution } from '@/types/exam/exam-module/report';
import Image from 'next/image';

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
        applicable: boolean;
        nonapplicable: boolean;
        readmit: boolean;
        grdaeDisply: boolean;
        marksdisplay: boolean;
        gradecolm: boolean;
        status: boolean;
    };
}

export default function CumulativeReportPrintView({
    reportData,
    institution,
    subjects,
    headerInfo,
    fontSize: _fontSize,
    columnFlags
}: CumulativeReportPrintViewProps) {
    // Separate applicable and non-applicable subjects dynamically (matching Grid View)
    const applicableSubjects = columnFlags.applicable ? subjects.filter((s) => s.eyceS_AplResultFlg !== false) : [];
    const nonApplicableSubjects = columnFlags.nonapplicable ? subjects.filter((s) => s.eyceS_AplResultFlg === false) : [];

    const finalApplicableSubjects =
        applicableSubjects.length > 0 ? applicableSubjects : columnFlags.applicable && !columnFlags.nonapplicable ? subjects : [];

    // Helper to get subject header text
    const getSubjectHeaderName = (subj: ISubject) => {
        const name = subj.ismS_SubjectName || '';
        const showMarks = columnFlags.marksdisplay;
        const showGrade = columnFlags.grdaeDisply;

        if (showMarks && showGrade) {
            return `${name} (M | G)`;
        }
        if (showMarks) {
            return `${name} (M)`;
        }
        if (showGrade) {
            return `${name} (G)`;
        }
        return name;
    };

    // Helper for rendering cell marks/grades in print view
    const renderPrintMarkContent = (subj: ISubject, student: ICumulativeReport) => {
        const mark = student.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
        if (!mark) return '-';
        if (mark.estmpS_PassFailFlg === 'AB') {
            return 'AB';
        }

        const showMarks = columnFlags.marksdisplay;
        const showGrade = columnFlags.grdaeDisply;

        const marksVal = mark.estmpS_ObtainedMarks;
        const gradeVal = mark.estmpS_ObtainedGrade;

        if (showMarks && showGrade) {
            if (marksVal != null && gradeVal) {
                return `${marksVal} | ${gradeVal}`;
            }
            return marksVal ?? gradeVal ?? '-';
        }
        if (showMarks) {
            return marksVal ?? '-';
        }
        if (showGrade) {
            return gradeVal ?? '-';
        }
        return marksVal ?? gradeVal ?? '-';
    };

    const getTotalMaxMarks = (student: ICumulativeReport) => {
        if (student.estmP_Result === 'AB') return '';
        if (student.estmP_TotalMaxMarks != null && Number(student.estmP_TotalMaxMarks) > 0) {
            return student.estmP_TotalMaxMarks;
        }
        const validMax = student.sub_list?.reduce((acc, sub: any) => {
            const m = Number(sub.estmpS_MaxMarks ?? subjects.find((s) => s.ismS_Id === sub.ismS_Id)?.estmpS_MaxMarks);
            return acc + (!isNaN(m) && m > 0 ? m : 0);
        }, 0) ?? 0;
        if (validMax > 0) return validMax;

        const subjectsMax = subjects
            .filter((s) => s.eyceS_AplResultFlg !== false)
            .reduce((acc, s) => acc + (Number(s.estmpS_MaxMarks) || 0), 0);
        if (subjectsMax > 0) return subjectsMax;

        return (student.estmP_TotalMaxMarks != null && student.estmP_TotalMaxMarks !== 0 && student.estmP_TotalMaxMarks !== '0')
            ? student.estmP_TotalMaxMarks
            : '-';
    };

    const getTotalObtMarks = (student: ICumulativeReport) => {
        if (student.estmP_Result === 'AB') return '';
        if (student.estmP_TotalObtMarks != null && Number(student.estmP_TotalObtMarks) > 0) {
            return student.estmP_TotalObtMarks;
        }
        let hasMarks = false;
        const validObt = student.sub_list?.reduce((acc, sub: any) => {
            if (sub.estmpS_PassFailFlg === 'AB') return acc;
            const m = Number(sub.estmpS_ObtainedMarks);
            if (!isNaN(m)) {
                hasMarks = true;
                return acc + m;
            }
            return acc;
        }, 0) ?? 0;
        if (hasMarks) return validObt;
        return (student.estmP_TotalObtMarks != null && student.estmP_TotalObtMarks !== 0 && student.estmP_TotalObtMarks !== '0') ? student.estmP_TotalObtMarks : '-';
    };

    const schoolName = headerInfo.mI_Name || institution?.mI_Name || "BALDWIN BOYS' HIGH SCHOOL";

    return (
        <>
            {/* PRINT STYLES */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0.6cm;
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
                        width: 100% !important;
                        background: #fff !important;
                        color: #000 !important;
                    }

                    .screen-only,
                    .no-print {
                        display: none !important;
                    }

                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 10px !important;
                        table-layout: auto !important;
                    }

                    .print-table {
                        border: 1px solid #000 !important;
                    }

                    .print-table th,
                    .print-table td {
                        border: 1px solid #333 !important;
                        padding: 4px 3px !important;
                        text-align: center !important;
                        vertical-align: middle !important;
                        font-size: 10px !important;
                        line-height: 1.2 !important;
                    }

                    .print-table th {
                        background-color: #f2f2f2 !important;
                        font-weight: 700 !important;
                        text-transform: uppercase !important;
                        color: #000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-header-title {
                        font-size: 16px !important;
                        font-weight: 800 !important;
                        text-align: center !important;
                        text-transform: uppercase !important;
                        margin-bottom: 2px !important;
                        color: #000 !important;
                    }

                    .print-header-subtitle {
                        font-size: 12px !important;
                        font-weight: 700 !important;
                        text-align: center !important;
                        text-transform: uppercase !important;
                        margin-bottom: 6px !important;
                        color: #000 !important;
                    }

                    .print-meta-grid {
                        display: flex !important;
                        justify-content: center !important;
                        gap: 20px !important;
                        font-size: 10px !important;
                        font-weight: 600 !important;
                        text-transform: uppercase !important;
                        margin-bottom: 10px !important;
                        border-bottom: 1px solid #ccc !important;
                        padding-bottom: 6px !important;
                    }

                    .student-name-col {
                        text-align: left !important;
                        padding-left: 6px !important;
                        font-weight: 600 !important;
                        white-space: nowrap !important;
                    }
                }

                @media screen {
                    #printable-report {
                        display: none !important;
                    }
                }
            `}</style>

            {/* PRINTABLE CONTENT */}
            <div id='printable-report' className='w-full'>
                {/* HEADER */}
                <div className='mb-3 text-center'>
                    {institution?.mI_Logo ? (
                        <div className='mb-2 flex justify-center'>
                            <Image
                                src={institution.mI_Logo}
                                alt='Institution Logo'
                                width={600}
                                height={100}
                                className='h-14 max-w-full object-contain'
                                unoptimized
                                priority
                            />
                        </div>
                    ) : null}

                    <div className='print-header-title'>{schoolName}</div>
                    <div className='print-header-subtitle'>CLASS WISE CUMULATIVE REPORT</div>

                    <div className='print-meta-grid'>
                        <div>
                            <span>ACADEMIC YEAR : </span>
                            <strong>{headerInfo.yr || '-'}</strong>
                        </div>
                        <div>
                            <span>CLASS &amp; SEC : </span>
                            <strong>
                                {headerInfo.cla || '-'} {headerInfo.sec ? `- ${headerInfo.sec}` : ''}
                            </strong>
                        </div>
                        <div>
                            <span>EXAM : </span>
                            <strong>{headerInfo.exmmid || '-'}</strong>
                        </div>
                    </div>
                </div>

                {/* MAIN TABLE - EXACT MATCH TO GRID VIEW */}
                <table className='print-table w-full border-collapse'>
                    <thead>
                        <tr>
                            <th style={{ width: '35px' }}>SL NO</th>
                            <th className='student-name-col'>STUDENT NAME</th>
                            {columnFlags.admno && <th>ADM NO</th>}
                            {columnFlags.regno && <th>REG NO</th>}
                            {columnFlags.rollno && <th>ROLL NO</th>}

                            {/* Applicable Subject Columns */}
                            {finalApplicableSubjects.map((subj) => (
                                <th key={subj.ismS_Id}>{getSubjectHeaderName(subj)}</th>
                            ))}

                            {/* Total Columns */}
                            <th>TOTAL</th>
                            <th>OBTAINED</th>
                            {columnFlags.readmit && <th>PERCENTAGE</th>}
                            {columnFlags.gradecolm && <th>OVER ALL GRADE</th>}
                            {columnFlags.sectionrank && <th>SECTION RANK</th>}
                            {columnFlags.classrank && <th>CLASS RANK</th>}
                            {!columnFlags.attendancedispaly && (
                                <>
                                    <th>CLASS HELD</th>
                                    <th>ATTENDANCE</th>
                                </>
                            )}
                            {columnFlags.status && <th>STATUS</th>}

                            {/* Non-applicable Subject Columns */}
                            {nonApplicableSubjects.map((subj) => (
                                <th key={subj.ismS_Id}>{getSubjectHeaderName(subj)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((student, idx) => {
                            const isAbsent = student.estmP_Result === 'AB';

                            return (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td className='student-name-col'>{student.amsT_FirstName}</td>

                                    {columnFlags.admno && <td>{student.amsT_AdmNo ?? '-'}</td>}
                                    {columnFlags.regno && <td>{student.amsT_RegistrationNo ?? '-'}</td>}
                                    {columnFlags.rollno && <td>{student.amaY_RollNo ?? '-'}</td>}

                                    {/* Applicable Subjects Marks */}
                                    {finalApplicableSubjects.map((subj) => (
                                        <td key={subj.ismS_Id}>{renderPrintMarkContent(subj, student)}</td>
                                    ))}

                                    {/* Totals & Ranks */}
                                    <td>{isAbsent ? '' : getTotalMaxMarks(student)}</td>
                                    <td>{isAbsent ? '' : getTotalObtMarks(student)}</td>
                                    {columnFlags.readmit && (
                                        <td>{isAbsent ? '-' : student.estmP_Percentage ? `${student.estmP_Percentage}` : '-'}</td>
                                    )}
                                    {columnFlags.gradecolm && <td>{isAbsent ? '' : (student.estmP_TotalGrade ?? '-')}</td>}
                                    {columnFlags.sectionrank && (
                                        <td>
                                            {isAbsent || student.estmP_SectionRank === '0' || student.estmP_SectionRank === 0
                                                ? ''
                                                : (student.estmP_SectionRank ?? '-')}
                                        </td>
                                    )}
                                    {columnFlags.classrank && (
                                        <td>
                                            {isAbsent || student.estmP_ClassRank === '0' || student.estmP_ClassRank === 0
                                                ? ''
                                                : (student.estmP_ClassRank ?? '-')}
                                        </td>
                                    )}
                                    {!columnFlags.attendancedispaly && (
                                        <>
                                            <td>{student.classheld ?? '-'}</td>
                                            <td>{student.classatt ?? '-'}</td>
                                        </>
                                    )}
                                    {columnFlags.status && <td>{student.estmP_Result ?? '-'}</td>}

                                    {/* Non-applicable Subjects Marks */}
                                    {nonApplicableSubjects.map((subj) => (
                                        <td key={subj.ismS_Id}>{renderPrintMarkContent(subj, student)}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
