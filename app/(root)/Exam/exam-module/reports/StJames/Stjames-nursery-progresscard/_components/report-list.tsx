'use client';

import { Printer } from 'lucide-react';

interface StJamesNurseryReportListProps {
    data: any;
    institution: any;
}

export default function StJamesNurseryReportList({ data, institution }: StJamesNurseryReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    const { getstudentdetails = [], year = '', exam = '', displayattendance = false, readmit = false } = data;

    const students = getstudentdetails;

    return (
        <div className='mt-8 space-y-8'>
            <div className='no-print flex justify-end gap-2 px-4'>
                <button
                    onClick={handlePrint}
                    className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white shadow-md transition-all hover:bg-blue-700'>
                    <Printer className='h-4 w-4' /> Print
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; background: white; }
                    .page-break { page-break-before: always; }
                    .stjames-report { padding: 40px; }
                }
                .stjames-report {
                    font-family: 'Times New Roman', serif;
                    color: black;
                }
                .borderdiv {
                    border: 1px solid black;
                    padding: 10px;
                    text-align: center;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .link { text-transform: lowercase; display: inline-block; }
                .link::first-line { text-transform: capitalize; }
                table { width: 100%; border-collapse: collapse; }
                .table-bordered th, .table-bordered td { border: 1px solid black; padding: 8px; }
            `}</style>

            <div id='print-area' className='bg-white'>
                {students.map((report: any, index: number) => (
                    <div
                        key={index}
                        className={`stjames-report ${index > 0 ? 'page-break' : ''} mx-auto mb-10 max-w-[1000px] border border-gray-200 p-10 shadow-lg`}>
                        <div className='mb-8 text-center'>
                            <h2 className='font-bold text-2xl uppercase underline underline-offset-8'>
                                {exam || 'FINAL'} EXAMINATION REPORT CARD {year || '2023-24'}
                            </h2>
                        </div>

                        <div className='mb-8 grid grid-cols-3 gap-8 text-sm'>
                            <div className='space-y-4 font-bold'>
                                <div>
                                    NAME : <span className='uppercase'>{report.studentname}</span>
                                </div>
                                <div>
                                    DOB : <span>{report.dob}</span>
                                </div>
                                <div>
                                    CLASS TEACHER : <span className='link'>{data.clastechname || 'Class Teacher'}</span>
                                </div>
                            </div>
                            <div className='space-y-4 font-bold'>
                                <div>
                                    CLASS : <span>{report.asmcL_ClassName}</span>
                                </div>
                                <div>
                                    ROLL NO. : <span>{report.amaY_RollNo}</span>
                                </div>
                            </div>
                            <div className='space-y-4 font-bold'>
                                <div>
                                    SECTION : <span>{report.asmC_SectionName}</span>
                                </div>
                                <div>
                                    ADM.NO. : <span>{report.amsT_AdmNo}</span>
                                </div>
                            </div>
                        </div>

                        <div className='mb-8'>
                            <table className='table-bordered text-sm'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='text-center uppercase'>Subjects</th>
                                        <th className='text-center uppercase'>Grade Obtained</th>
                                        <th className='text-center uppercase'>Remarks</th>
                                    </tr>
                                </thead>
                                {report.subjectlist?.map((subj: any, sIdx: number) => (
                                    <tbody key={sIdx}>
                                        <tr className='bg-gray-100'>
                                            <td className='pl-4 text-left font-bold' colSpan={3}>
                                                {subj.ISMS_SubjectName}
                                            </td>
                                        </tr>
                                        {subj.subsubjectlist?.map((subjd: any, dIdx: number) => (
                                            <tr key={dIdx}>
                                                <td className='pl-8 text-left font-semibold italic'>{subjd.EMSS_SubSubjectName}</td>
                                                <td className='text-center font-bold'>
                                                    {subjd.studentmarks?.[0]?.PassFailFlg === 'AB'
                                                        ? 'AB'
                                                        : subjd.studentmarks?.[0]?.ObtainedGrade}
                                                </td>
                                                <td className='pl-4 text-left'>{subjd.studentmarks?.[0]?.GRADEREMAKS}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ))}
                                {displayattendance && (
                                    <tfoot>
                                        <tr className='bg-gray-50 font-bold'>
                                            <td colSpan={3} className='p-4 text-center'>
                                                NO.OF WORKING DAYS : {report.TOTALWORKINGDAYS} &nbsp;&nbsp;&nbsp;&nbsp; NO.OF DAYS PRESENT :{' '}
                                                {report.PRESENTDAYS}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        <div className='mb-16 grid grid-cols-1 gap-8 md:grid-cols-12'>
                            <div className={`${readmit ? 'md:col-span-8' : 'md:col-span-12'} space-y-8 font-bold text-sm`}>
                                <div className='flex items-end gap-2'>
                                    <span>NEXT TERM BEGINS ON :</span>
                                    <div className='min-w-[150px] flex-1 border-black border-b'>&nbsp;</div>
                                    <span>AT</span>
                                    <div className='w-24 border-black border-b'>&nbsp;</div>
                                </div>
                                <div className='flex items-start gap-2'>
                                    <span className='whitespace-nowrap'>CLASS TEACHER'S REMARKS:</span>
                                    <div className='min-h-[20px] flex-1 border-black border-b font-normal italic'>
                                        {report.remaks || <>&nbsp;</>}
                                    </div>
                                </div>
                            </div>
                            {readmit && (
                                <div className='md:col-span-4'>
                                    <div className='borderdiv font-bold'>
                                        <div className='mb-2'>Promotion</div>
                                        <div>Granted / Refused</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='mt-20'>
                            <div className='grid grid-cols-4 gap-4 text-center font-bold text-[10px] uppercase'>
                                <div className='space-y-4'>
                                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                    <div className='h-8'></div>
                                    <div className='border-black border-t pt-1'>Parent's Signature</div>
                                </div>
                                <div className='space-y-4'>
                                    <div className='link h-8 text-sm capitalize'>{data.clastechname || 'Class Teacher'}</div>
                                    <div className='border-black border-t pt-1'>Class Teacher's Signature</div>
                                </div>
                                <div className='space-y-4'>
                                    <div className='h-8'>Mrs. B. Mathew</div>
                                    <div className='border-black border-t pt-1'>Junior Head's Signature</div>
                                </div>
                                <div className='space-y-4'>
                                    <div className='h-8'>Dr.T.H.Ireland</div>
                                    <div className='border-black border-t pt-1'>Principal's Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
