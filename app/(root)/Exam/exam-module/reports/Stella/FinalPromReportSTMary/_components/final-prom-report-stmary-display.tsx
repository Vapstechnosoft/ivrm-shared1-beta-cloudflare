'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useCallback } from 'react';

interface Props {
    data: any;
    date: string;
    remarks: string;
    onPrint?: () => void;
}

export default function FinalPromReportSTMaryDisplay({ data, date, remarks, onPrint }: Props) {
    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseactiviteslist = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        gettermdetails = [],
        getstudentwiseattendancedetails = [],
        getsubjects = [], // This contains getgrandtotal based on the old JS
        getstudentwisetermwisedetails = [] // this contains overall totals in old JS (studentwisemarks)
    } = data;

    const groupwiseexamlist: any[] = [];
    getgroupdetails.forEach((dd: any) => {
        const temp: any[] = [];
        let counttotal = 0;
        getgroupexamdetails.forEach((d: any) => {
            if (dd.empG_DistplayName === d.empG_DistplayName) {
                counttotal += d.empsgE_ForMaxMarkrs;
                const examItem = {
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName
                };
                temp.push(examItem);
                groupwiseexamlist.push(examItem);
            }
        });

        const totalItem = {
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total'
        };

        const gradeItem = {
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800001,
            EME_ExamName: 'Grade',
            EME_ExamOrder: 9800001,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Grade'
        };

        temp.push(totalItem);
        temp.push(gradeItem);

        groupwiseexamlist.push(totalItem);
        groupwiseexamlist.push(gradeItem);

        dd.groupewiseexam = temp;
    });

    const handlePrintClick = useCallback(() => {
        setTimeout(() => {
            if (onPrint) onPrint();
            else window.print();
        }, 300);
    }, [onPrint]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    return (
        <>
            <style jsx global>{`
                .nds-report { font-family: sans-serif; color: black; }
                .nds-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .nds-table th, .nds-table td { border: 1px solid black; padding: 5px; text-align: center; }
                .nds-text-left { text-align: left !important; }
                .nds-text-center { text-align: center !important; }
                .nds-text-right { text-align: right !important; }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * { visibility: hidden; }
                    #nds-print-area, #nds-print-area * { visibility: visible; }
                    #nds-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .nds-card { page-break-before: always; border: 1px solid black !important; margin-bottom: 20px !important; }
                    .nds-card:first-child { page-break-before: auto; }
                }
            `}</style>

            <div className='no-print my-4 flex justify-end'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All
                </Button>
            </div>

            <div id='nds-print-area' className='nds-report'>
                {getstudentdetails.map((report: any) => {
                    const studentMarks = getstudentmarksdetails.filter(
                        (m: any) => m.amsT_Id === report.amsT_Id || m.AMST_Id === report.amsT_Id
                    );
                    const studentSubjects = getstudentwisesubjectlist.filter(
                        (s: any) => s.amsT_Id === report.amsT_Id || s.AMST_Id === report.amsT_Id
                    );

                    // Group Activity list into report.activity_main_list format
                    const activityListTemp: any[] = [];
                    const stdActivities = getstudentwiseactiviteslist.filter(
                        (a: any) => a.amsT_Id === report.amsT_Id || a.AMST_Id === report.amsT_Id
                    );
                    stdActivities.forEach((act: any) => {
                        if (!activityListTemp.find((x) => x.ECACTA_SkillArea === act.ECACTA_SkillArea)) {
                            activityListTemp.push({ ECACTA_SkillArea: act.ECACTA_SkillArea });
                        }
                    });

                    activityListTemp.forEach((act: any) => {
                        const scores: any[] = [];
                        gettermdetails.forEach((term: any) => {
                            const found = stdActivities.find(
                                (dd: any) => dd.ECACTA_SkillArea === act.ECACTA_SkillArea && dd.ECT_Id === term.ecT_Id
                            );
                            if (found) {
                                scores.push({ EMGD_Name: found.EMGD_Name, ecT_Id: term.ecT_Id });
                            }
                        });
                        act.activity_score_details = scores;
                    });

                    const studentAttendance = getstudentwiseattendancedetails.filter(
                        (a: any) => a.amsT_Id === report.amsT_Id || a.AMST_Id === report.amsT_Id
                    );
                    const totalAttendance = studentAttendance.length > 0 ? studentAttendance[0] : {};

                    const studentTotals = getstudentwisetermwisedetails.find(
                        (t: any) => t.AMST_Id === report.amsT_Id || t.amsT_Id === report.amsT_Id
                    );

                    return (
                        <div key={report.amsT_Id} id={`std_${report.amsT_Id}`} className='nds-card p-[10px]'>
                            <div className='reportbody'>
                                {/* Header */}
                                <div className='mb-[10px] text-center'>
                                    <h4 className='m-0'>
                                        <img
                                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/dc2282b9-2f6b-4761-abf1-074570f0103e.jpg'
                                            className='w-full'
                                            alt='Header'
                                        />
                                    </h4>
                                </div>

                                <div className='w-full text-center'>
                                    <h3
                                        style={{
                                            color: 'royalblue',
                                            fontWeight: 'bold',
                                            fontSize: '20px',
                                            wordWrap: 'break-word',
                                            margin: '15px 0'
                                        }}>
                                        PROGRESS REPORT 2025-26
                                    </h3>
                                </div>

                                <div className='w-full'>
                                    <table className='w-full'>
                                        <tbody>
                                            <tr>
                                                <td style={{ border: '1px solid black' }} className='py-[5px] text-center font-bold'>
                                                    Student Details
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='text-left' style={{ border: '1px solid black', borderTop: 'none' }}>
                                                    <div className='flex w-full' style={{ lineHeight: 2, fontSize: '18px' }}>
                                                        <div className='grid w-[60%] grid-cols-[30%_70%] gap-x-2 pl-[1%]'>
                                                            <div>Name</div>
                                                            <div>: {report.studentName || report.studentname}</div>

                                                            <div>Class</div>
                                                            <div>
                                                                : {report.className || report.classname} /{' '}
                                                                {report.sectionName || report.sectionname}
                                                            </div>

                                                            <div>SATS NO</div>
                                                            <div>: {report.amsT_BPLCardNo || report.amsT_BPLCardNo || ''}</div>

                                                            <div>Date of Birth</div>
                                                            <div>: {report.dob || report.dob}</div>
                                                        </div>
                                                        <div className='grid w-[40%] grid-cols-[40%_60%] gap-x-2'>
                                                            <div>Admission No</div>
                                                            <div>: {report.admissionNo || report.admno}</div>

                                                            <div>Father&apos;s Name</div>
                                                            <div>: {report.fatherName || report.fathername}</div>

                                                            <div>Mother&apos;s Name</div>
                                                            <div>: {report.motherName || report.mothername}</div>

                                                            <div>Roll No</div>
                                                            <div>: {report.rollNo || report.rollno}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mt-[10px] w-full'>
                                    <table className='nds-table'>
                                        <thead>
                                            <tr>
                                                <th
                                                    colSpan={100}
                                                    className='text-center'
                                                    style={{ fontSize: '20px', wordWrap: 'break-word' }}>
                                                    <strong>ACADEMIC PERFORMANCE OF THE STUDENT - PART-A</strong>
                                                </th>
                                            </tr>
                                            <tr>
                                                <td className='text-left' style={{ width: '100px' }}>
                                                    <b></b>
                                                </td>
                                                {getgroupdetails.map((grp: any, gIdx: number) => (
                                                    <td key={gIdx} colSpan={grp.groupewiseexam.length}>
                                                        <b>{grp.empG_DistplayName}</b>
                                                    </td>
                                                ))}
                                                <td colSpan={getgroupdetails.length}>
                                                    <b>Grand Total</b>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className='w-[100px] text-center'>
                                                    <b>Subject Name</b>
                                                </th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className='whitespace-nowrap text-center'>
                                                        <b>{grpexam.examnamedisplay}</b>
                                                        <br />
                                                        <span>
                                                            <b>{grpexam.EMPSGE_ForMaxMarkrs === 0 ? 25 : grpexam.EMPSGE_ForMaxMarkrs}</b>
                                                        </span>
                                                    </th>
                                                ))}
                                                <th className='text-center' rowSpan={2}>
                                                    <b>Total Marks(100)</b>
                                                </th>
                                                <th className='text-center' rowSpan={2}>
                                                    <b>Total Grade</b>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects
                                                .filter(
                                                    (subj: any) =>
                                                        subj.EMPS_AppToResultFlg !== false &&
                                                        subj.EMPS_AppToResultFlg !== 0 &&
                                                        subj.empS_AppToResultFlg !== false &&
                                                        subj.empS_AppToResultFlg !== 0
                                                )
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='nds-text-left' style={{ wordWrap: 'break-word' }}>
                                                            <b>{subj.ISMS_SubjectName || subj.subjectName}</b>
                                                        </td>
                                                        {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                            const mrks = studentMarks.find(
                                                                (m: any) =>
                                                                    (m.ISMS_Id === subj.ISMS_Id ||
                                                                        m.ismS_SubjectName === subj.subjectName ||
                                                                        m.ismS_SubjectName === subj.ISMS_SubjectName) &&
                                                                    (m.EME_Id === grpexam.EME_Id || m.emE_Id === grpexam.EME_Id) &&
                                                                    (m.EMPSG_DisplayName === grpexam.EMPG_DistplayName ||
                                                                        m.empsG_DisplayName === grpexam.EMPG_DistplayName)
                                                            );
                                                            return (
                                                                <td key={eIdx} className='nds-text-center'>
                                                                    {mrks && (
                                                                        <>
                                                                            {['AB', 'M', 'L'].includes(
                                                                                mrks.PassFailFlag || mrks.passFailFlag
                                                                            ) ? (
                                                                                <span style={{ fontSize: '16px' }}>
                                                                                    <b>{mrks.PassFailFlag || mrks.passFailFlag}</b>
                                                                                    {(mrks.ObtainedMarks > 0 || mrks.obtainedMarks > 0) &&
                                                                                        grpexam.EME_ExamName !== 'Grade' &&
                                                                                        ` (${mrks.ObtainedMarks || mrks.obtainedMarks})`}
                                                                                </span>
                                                                            ) : grpexam.EME_ExamName !== 'Grade' ? (
                                                                                <span style={{ fontSize: '16px' }}>
                                                                                    <b>{mrks.ObtainedMarks ?? mrks.obtainedMarks}</b>
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ fontSize: '16px' }}>
                                                                                    <b>{mrks.ObtainedGrade ?? mrks.obtainedGrade}</b>
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className='nds-text-center'>
                                                            <b>
                                                                {subj.ESTMPPS_ObtainedMarks || subj.subjectObtainedMarks
                                                                    ? Number(
                                                                          subj.ESTMPPS_ObtainedMarks || subj.subjectObtainedMarks
                                                                      ).toFixed(0)
                                                                    : ''}
                                                            </b>
                                                        </td>
                                                        <td className='nds-text-center'>
                                                            <b>{subj.ESTMPPS_ObtainedGrade || subj.subjectGrade}</b>
                                                        </td>
                                                    </tr>
                                                ))}

                                            <tr>
                                                <td className='nds-text-left'>
                                                    <b>Total</b>
                                                </td>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                    // This total logic aligns with the HTML angular code
                                                    const isMarksObtained = grpexam.EME_Id === 9800000;
                                                    const isGrade = grpexam.EME_Id === 9800001;

                                                    const mrks = getsubjects.find((m: any) => {
                                                        const amstMatch = m.AMST_Id === report.amsT_Id || m.amsT_Id === report.amsT_Id;
                                                        if (!amstMatch) return false;

                                                        const mEMEId = m.EME_Id ?? m.emE_Id;
                                                        const mDispName = m.EMPSG_DisplayName ?? m.empsG_DisplayName;

                                                        if (!isMarksObtained && !isGrade) {
                                                            return mEMEId === grpexam.EME_Id && mEMEId !== 900000 && mEMEId !== 900001;
                                                        }
                                                        if (isMarksObtained) {
                                                            return mEMEId === 900000 && mDispName === grpexam.EMPG_DistplayName;
                                                        }
                                                        if (isGrade) {
                                                            return mEMEId === 900001 && mDispName === grpexam.EMPG_DistplayName;
                                                        }
                                                        return false;
                                                    });

                                                    return (
                                                        <td key={eIdx} className='nds-text-center'>
                                                            {mrks && (
                                                                <b>
                                                                    {isGrade
                                                                        ? mrks.GRADE || mrks.ObtainedGrade || mrks.obtainedGrade
                                                                        : (mrks.ObtainedMarks ?? mrks.obtainedMarks)}
                                                                </b>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className='nds-text-center'></td>
                                                <td className='nds-text-center'></td>
                                            </tr>

                                            {studentSubjects
                                                .filter(
                                                    (subj: any) =>
                                                        subj.EMPS_AppToResultFlg === false ||
                                                        subj.EMPS_AppToResultFlg === 0 ||
                                                        subj.empS_AppToResultFlg === false ||
                                                        subj.empS_AppToResultFlg === 0
                                                )
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={`nonapp-${sIdx}`}>
                                                        <td className='nds-text-left' style={{ wordWrap: 'break-word' }}>
                                                            <b>{subj.ISMS_SubjectName || subj.subjectName}</b>
                                                        </td>
                                                        {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                            const mrks = studentMarks.find(
                                                                (m: any) =>
                                                                    (m.ISMS_Id === subj.ISMS_Id ||
                                                                        m.ismS_SubjectName === subj.subjectName ||
                                                                        m.ismS_SubjectName === subj.ISMS_SubjectName) &&
                                                                    (m.EME_Id === grpexam.EME_Id || m.emE_Id === grpexam.EME_Id) &&
                                                                    (m.EMPSG_DisplayName === grpexam.EMPG_DistplayName ||
                                                                        m.empsG_DisplayName === grpexam.EMPG_DistplayName)
                                                            );
                                                            return (
                                                                <td key={eIdx} className='nds-text-center'>
                                                                    {mrks && (
                                                                        <>
                                                                            {['AB', 'M', 'L'].includes(
                                                                                mrks.PassFailFlag || mrks.passFailFlag
                                                                            ) ? (
                                                                                <span style={{ fontSize: '16px' }}>
                                                                                    <b>{mrks.PassFailFlag || mrks.passFailFlag}</b>
                                                                                    {(mrks.ObtainedGrade || mrks.obtainedGrade) &&
                                                                                        ` (${mrks.ObtainedGrade || mrks.obtainedGrade})`}
                                                                                </span>
                                                                            ) : grpexam.EME_ExamName !== 'Grade' &&
                                                                              grpexam.EME_Id !== 9800000 ? (
                                                                                <span style={{ fontSize: '16px' }}>
                                                                                    <b>{mrks.ObtainedGrade || mrks.obtainedGrade}</b>
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ fontSize: '16px' }}>&nbsp;</span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className='nds-text-center'></td>
                                                        <td className='nds-text-center'></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Overall Marks / Percentage / Grade */}
                                {studentTotals && (
                                    <div className='mt-[10px] flex w-full'>
                                        <div className='w-[33%] pr-[5px]'>
                                            <table className='nds-table m-0'>
                                                <tbody>
                                                    <tr>
                                                        <th style={{ width: '114px' }}>Overall Marks</th>
                                                        <th>{studentTotals.TotalMarks}</th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className='w-[33%] px-[5px]'>
                                            <table className='nds-table m-0'>
                                                <tbody>
                                                    <tr>
                                                        <th style={{ width: '114px' }}>Percentage</th>
                                                        <th>{studentTotals.Percentage} %</th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className='w-[33%] pl-[5px]'>
                                            <table className='nds-table m-0'>
                                                <tbody>
                                                    <tr>
                                                        <th style={{ width: '114px' }}>Grade</th>
                                                        <th>{studentTotals.ESTMPPSG_GroupObtGrade}</th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className='mt-[10px] w-full pl-[3%]'>
                                    <p>
                                        <b>
                                            Note: If any box in front of a completed test is left blank, it indicates that the student was
                                            absent for that particular test.
                                        </b>
                                    </p>
                                </div>

                                <div className='mt-[60px] flex w-full'>
                                    <div className='w-1/2'>
                                        <strong className='ml-[68px] block text-left'>Signature of the Headmistress</strong>
                                    </div>
                                    <div className='w-1/2 text-right'>
                                        <strong className='block pr-[68px] text-right'>Signature of the Class Teacher</strong>
                                    </div>
                                </div>

                                <div className='mt-[20px] flex w-full'>
                                    <div className='w-[50%]'>
                                        <table className='nds-table'>
                                            <thead>
                                                <tr>
                                                    <th colSpan={100} className='text-center' style={{ fontSize: '20px' }}>
                                                        <strong>PART-B</strong>
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <td className='text-center' style={{ width: '200px' }}>
                                                        Description
                                                    </td>
                                                    {gettermdetails.map((cos: any, cIdx: number) => (
                                                        <td key={cIdx} className='text-center'>
                                                            {cos.ecT_TermName}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activityListTemp.map((subjco: any, aIdx: number) => (
                                                    <tr key={aIdx}>
                                                        <td className='nds-text-left' style={{ wordWrap: 'break-word' }}>
                                                            <b>{subjco.ECACTA_SkillArea}</b>
                                                        </td>
                                                        {gettermdetails.map((cos: any, cIdx: number) => {
                                                            const sc = subjco.activity_score_details.find(
                                                                (s: any) => s.ecT_Id === cos.ecT_Id
                                                            );
                                                            return (
                                                                <td key={cIdx} className='nds-text-center'>
                                                                    <b>{sc ? sc.EMGD_Name : ''}</b>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td className='nds-text-left'>
                                                        <b>No.Of Working Days</b>
                                                    </td>
                                                    <td colSpan={2} className='nds-text-center'>
                                                        <b>{totalAttendance.TOTALWORKINGDAYS || ''}</b>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className='nds-text-left'>
                                                        <b>No.Of Present Days</b>
                                                    </td>
                                                    <td colSpan={2} className='nds-text-center'>
                                                        <b>{totalAttendance.PRESENTDAYS || ''}</b>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='w-[5%]' />

                                    <div className='w-[45%]'>
                                        <table className='nds-table'>
                                            <thead>
                                                <tr>
                                                    <th colSpan={4} style={{ fontWeight: 'bold' }}>
                                                        Grading System
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th colSpan={2}>PART - A</th>
                                                    <th colSpan={2}>PART - B</th>
                                                </tr>
                                                <tr>
                                                    <th>Marks range</th>
                                                    <th>Grade</th>
                                                    <th>Description</th>
                                                    <th>Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>90 - 100</td>
                                                    <td>A+</td>
                                                    <td>Excellent</td>
                                                    <td>A</td>
                                                </tr>
                                                <tr>
                                                    <td>70 - 89</td>
                                                    <td>A</td>
                                                    <td>Good</td>
                                                    <td>B</td>
                                                </tr>
                                                <tr>
                                                    <td>50 - 69</td>
                                                    <td>B+</td>
                                                    <td>Satisfactory</td>
                                                    <td>C</td>
                                                </tr>
                                                <tr>
                                                    <td>30 - 49</td>
                                                    <td>B</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Below 30</td>
                                                    <td>C</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className='mt-[20px] w-full text-center'>
                                    <p>
                                        <span>
                                            You are promoted to std{' '}
                                            <b>
                                                <u>{remarks}</u>
                                            </b>{' '}
                                            Congratulations!
                                        </span>
                                    </p>
                                </div>
                                <div className='w-full text-center'>
                                    <p>
                                        <span>School re-opens on {formatDate(date) ? formatDate(date) : '__________________________'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
