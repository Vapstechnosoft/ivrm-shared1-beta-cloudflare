'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';

interface ReportListProps {
    data: any;
    academicYear: string;
}

export const ReportList = ({ data, academicYear }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        getstudentdetails = [],
        getstudentwiseskillslist = [],
        getstudentwiseactiviteslist = [],
        gettermdetails = [],
        getpromotionremarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentmarksdetails = [],
        gettermexamdetails = [],
        getinstitution = []
    } = data;

    const generateddate = new Date();

    // Replicating AngularJS data transformation logic
    const reports = useMemo(() => {
        if (!getstudentdetails) return [];

        return getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            // STUDENT WISE SKILL LIST
            const skill_main_list: any[] = [];
            getstudentwiseskillslist.forEach((dd: any) => {
                if (studentId === (dd.AMST_Id || dd.amsT_Id)) {
                    if (!skill_main_list.some((s) => s.ECS_SkillName === dd.ECS_SkillName)) {
                        skill_main_list.push({ ECS_SkillName: dd.ECS_SkillName });
                    }
                }
            });

            skill_main_list.forEach((skill) => {
                const skill_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    const termId = term.ecT_Id || term.ECT_Id;
                    getstudentwiseskillslist.forEach((dd: any) => {
                        if (
                            (dd.AMST_Id || dd.amsT_Id) === studentId &&
                            skill.ECS_SkillName === dd.ECS_SkillName &&
                            termId === (dd.ECT_Id || dd.ecT_Id)
                        ) {
                            skill_score_details.push({ scoregrade: dd.EMGD_Name, ecT_Id: termId });
                        }
                    });
                });
                skill.skill_score_details = skill_score_details;
            });

            // Student Wise Activities List
            const activity_main_list: any[] = [];
            getstudentwiseactiviteslist.forEach((act: any) => {
                if ((act.AMST_Id || act.amsT_Id) === studentId) {
                    if (!activity_main_list.some((a) => a.ECACTA_SkillArea === act.ECACTA_SkillArea)) {
                        activity_main_list.push({ ECACTA_SkillArea: act.ECACTA_SkillArea });
                    }
                }
            });

            activity_main_list.forEach((act) => {
                const activity_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    const termId = term.ecT_Id || term.ECT_Id;
                    getstudentwiseactiviteslist.forEach((dd: any) => {
                        if (
                            studentId === (dd.AMST_Id || dd.amsT_Id) &&
                            act.ECACTA_SkillArea === dd.ECACTA_SkillArea &&
                            termId === (dd.ECT_Id || dd.ecT_Id)
                        ) {
                            activity_score_details.push({ EMGD_Name: dd.EMGD_Name, ecT_Id: termId });
                        }
                    });
                });
                act.activity_score_details = activity_score_details;
            });

            // Co-Scholastic Subjects (subjects with Max Marks 50 or empty grade in summary)
            const subject_main_list: any[] = [];
            getstudentwisesubjectlist.forEach((subj: any) => {
                if ((subj.AMST_Id || subj.amsT_Id) === studentId && (subj.subjectMaxMarks === 50 || subj.subjectGrade === '')) {
                    if (!subject_main_list.some((s) => s.subjectName === subj.subjectName)) {
                        subject_main_list.push({ subjectName: subj.subjectName });
                    }
                }
            });

            subject_main_list.forEach((subj) => {
                const subject_score_details: any[] = [];
                gettermdetails.forEach((term: any) => {
                    const termId = term.ecT_Id || term.ECT_Id;
                    const termExams = gettermexamdetails
                        .filter((te: any) => (te.ecT_Id || te.ECT_Id) === termId)
                        .map((te: any) => te.emE_Id || te.EME_Id);

                    const marks = getstudentmarksdetails.filter(
                        (m: any) =>
                            (m.AMST_Id || m.amsT_Id) === studentId &&
                            (m.ISMS_SubjectName || m.ismS_SubjectName || m.subjectName) === subj.subjectName &&
                            termExams.includes(m.emE_Id || m.EME_Id)
                    );

                    if (marks.length > 0) {
                        const grade = marks[marks.length - 1].obtainedGrade || marks[marks.length - 1].obtainedgrade || '';
                        subject_score_details.push({ scoregrade: grade, ecT_Id: termId });
                    }
                });
                subj.subject_score_details = subject_score_details;
            });

            // Promotion Remarks
            const remarks_detail = getpromotionremarksdetails.find((d: any) => (d.amsT_Id || d.AMST_Id) === studentId);

            return {
                ...stu,
                skill_main_list,
                activity_main_list,
                subject_main_list,
                remarks: remarks_detail?.eprD_Remarks || '',
                promotedclass: remarks_detail?.eprD_ClassPromoted || ''
            };
        });
    }, [getstudentdetails, getstudentwiseskillslist, getstudentwiseactiviteslist, gettermdetails, getpromotionremarksdetails]);

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        const popupWinindow = window.open('', '_blank', 'width=1000,height=800');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>NDS Co-Scholastic Report</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">
                        <style>
                            @page { size: portrait; margin: 5mm; }
                            body { font-family: 'Times New Roman', Times, serif; font-size: 14px; }
                            .pagelayout { border: 1px solid black !important; padding: 10px !important; margin-bottom: 20px; page-break-after: always; }
                            .text-bold { font-weight: bold; }
                            .margin-top-5 { margin-top: 5px; }
                            .margin-top-10 { margin-top: 10px; }
                            .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td { border: 1px solid black !important; padding: 4px; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .img-responsive { display: block; max-width: 100%; height: auto; }
                            @media print {
                                .no-print { display: none; }
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        ${innerContents}
                    </body>
                </html>
            `);
            popupWinindow.document.close();
        }
    };

    if (reports.length === 0) return null;

    return (
        <div className='space-y-6'>
            <style>{`
                #HHS02 .row { display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; }
                #HHS02 .col-xs-6 { width: 50%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .col-xs-4 { width: 33.3333%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .col-xs-8 { width: 66.6667%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .col-sm-12 { width: 100%; padding: 0 15px; box-sizing: border-box; }
                #HHS02 .text-bold { font-weight: bold; }
                #HHS02 .text-center { text-align: center; }
                #HHS02 .text-left { text-align: left; }
                #HHS02 .margin-top-5 { margin-top: 5px; }
                #HHS02 .margin-top-10 { margin-top: 10px; }
                #HHS02 .table-bordered { width: 100%; border-collapse: collapse; margin-top: 10px; }
                #HHS02 .table-bordered td { border: 1px solid black !important; padding: 5px; }
                #HHS02 .img-responsive { max-width: 100%; height: auto; }
                #HHS02 .pagelayout { border: 1px solid black !important; padding: 10px; margin-bottom: 20px; background: white; }
                @media print {
                    .no-print { display: none; }
                }
            `}</style>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='bg-primary shadow-lg hover:bg-primary/90'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print Reports
                </Button>
            </div>

            <div ref={printRef} id='HHS02' className='bg-white p-4'>
                {reports.map((report: any, index: number) => (
                    <div key={index} className='pagelayout bg-white' style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                        <div className='row margin-top-5'>
                            <div className='col-sm-12'>
                                <img src={getinstitution[0]?.mI_Logo} className='img-responsive' style={{ width: '100%' }} alt='Header' />
                            </div>
                        </div>
                        <h4 className='margin-top-10 text-center font-bold'>
                            Report Card for Co-Scholastic Areas (Class {report.className || report.classname} Academic Session :{' '}
                            {academicYear})
                        </h4>

                        <div className='row margin-top-10'>
                            <div className='col-sm-12'>
                                <div className='row'>
                                    <div className='col-xs-6'>
                                        <div className='row'>
                                            <div className='col-xs-4 text-bold'>Roll No.</div>
                                            <div className='col-xs-8'>: {report.rollNo || report.rollno || report.AMAY_RollNo || ''}</div>
                                        </div>
                                    </div>
                                    <div className='col-xs-6'>
                                        <div className='row'>
                                            <div className='col-xs-4 text-bold'>Student's Name</div>
                                            <div className='col-xs-8'>
                                                : {(report.studentName || report.studentname || '')?.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-xs-6'>
                                        <div className='row'>
                                            <div className='col-xs-4 text-bold'>Mother's Name</div>
                                            <div className='col-xs-8'>
                                                : {(report.motherName || report.mothername || '')?.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-xs-6'>
                                        <div className='row'>
                                            <div className='col-xs-4 text-bold'>Date Of Birth</div>
                                            <div className='col-xs-8'>: {report.dob || ''}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-xs-6'>
                                        <div className='row'>
                                            <div className='col-xs-4 text-bold'>Father's Name</div>
                                            <div className='col-xs-8'>
                                                : {(report.fatherName || report.fathername || '')?.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='row margin-top-10'>
                            <div className='col-sm-12'>
                                <table className='table-bordered table'>
                                    <thead>
                                        <tr>
                                            <td className='text-left text-bold' style={{ width: '70%' }}>
                                                Co-Scholastic Areas : {'{on 5- Point(A-E) grading scale}'}
                                            </td>
                                            {gettermdetails.length > 0 ? (
                                                gettermdetails.map((term: any, tIdx: number) => (
                                                    <td key={tIdx} className='text-center text-bold'>
                                                        Grade
                                                    </td>
                                                ))
                                            ) : (
                                                <td className='text-center text-bold'>Grade</td>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.subject_main_list && report.subject_main_list.length > 0
                                            ? report.subject_main_list.map((sub: any, sIdx: number) => (
                                                  <tr key={`subj-${sIdx}`}>
                                                      <td className='text-left' style={{ wordWrap: 'break-word' }}>
                                                          <b>{sub.subjectName}</b>
                                                      </td>
                                                      {gettermdetails.length > 0 ? (
                                                          gettermdetails.map((cos: any, tIdx: number) => (
                                                              <td key={tIdx} className='text-center'>
                                                                  {sub.subject_score_details
                                                                      .filter((sc: any) => sc.ecT_Id === cos.ecT_Id)
                                                                      .map((sc: any, scIdx: number) => (
                                                                          <b key={scIdx}>{sc.scoregrade}</b>
                                                                      ))}
                                                              </td>
                                                          ))
                                                      ) : (
                                                          <td className='text-center'></td>
                                                      )}
                                                  </tr>
                                              ))
                                            : null}
                                        {report.subject_main_list && report.subject_main_list.length > 0 && (
                                            <tr>
                                                <td colSpan={(gettermdetails.length || 1) + 1}>&nbsp;</td>
                                            </tr>
                                        )}
                                        {report.skill_main_list && report.skill_main_list.length > 0
                                            ? report.skill_main_list.map((subjco: any, sIdx: number) => (
                                                  <tr key={`skill-${sIdx}`}>
                                                      <td className='text-left' style={{ wordWrap: 'break-word' }}>
                                                          <b>{subjco.ECS_SkillName}</b>
                                                      </td>
                                                      {gettermdetails.length > 0 ? (
                                                          gettermdetails.map((cos: any, tIdx: number) => (
                                                              <td key={tIdx} className='text-center'>
                                                                  {subjco.skill_score_details
                                                                      .filter((sc: any) => sc.ecT_Id === cos.ecT_Id)
                                                                      .map((sc: any, scIdx: number) => (
                                                                          <b key={scIdx}>{sc.scoregrade}</b>
                                                                      ))}
                                                              </td>
                                                          ))
                                                      ) : (
                                                          <td className='text-center'></td>
                                                      )}
                                                  </tr>
                                              ))
                                            : null}
                                        {report.skill_main_list && report.skill_main_list.length > 0 && (
                                            <tr>
                                                <td colSpan={(gettermdetails.length || 1) + 1}>&nbsp;</td>
                                            </tr>
                                        )}
                                        {report.activity_main_list && report.activity_main_list.length > 0
                                            ? report.activity_main_list.map((subjco: any, aIdx: number) => (
                                                  <tr key={`act-${aIdx}`}>
                                                      <td className='text-left' style={{ wordWrap: 'break-word' }}>
                                                          <b>{subjco.ECACTA_SkillArea}</b>
                                                      </td>
                                                      {gettermdetails.length > 0 ? (
                                                          gettermdetails.map((cos: any, tIdx: number) => (
                                                              <td key={tIdx} className='text-center'>
                                                                  {subjco.activity_score_details
                                                                      .filter((sc: any) => sc.ecT_Id === cos.ecT_Id)
                                                                      .map((sc: any, scIdx: number) => (
                                                                          <b key={scIdx}>{sc.EMGD_Name}</b>
                                                                      ))}
                                                              </td>
                                                          ))
                                                      ) : (
                                                          <td className='text-center'></td>
                                                      )}
                                                  </tr>
                                              ))
                                            : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className='row margin-top-10' style={{ marginTop: '40px' }}>
                            <div className='col-sm-12'>
                                <div className='row'>
                                    <div className='col-xs-4 text-center'>
                                        <label className='control-label'>
                                            <b>Date : {format(generateddate, 'dd/MM/yyyy')}</b>
                                        </label>
                                    </div>
                                    <div className='col-xs-4 text-center'>
                                        <label className='control-label'>
                                            <b>Sig of Teacher</b>
                                        </label>
                                    </div>
                                    <div className='col-xs-4 text-center'>
                                        <label className='control-label'>
                                            <b>Sign of Principal</b>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
