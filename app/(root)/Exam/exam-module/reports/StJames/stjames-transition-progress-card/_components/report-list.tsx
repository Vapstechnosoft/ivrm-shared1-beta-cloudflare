'use client';

import { Printer } from 'lucide-react';

interface StJamesTransitionReportListProps {
    data: any;
    institution: any;
}

export default function StJamesTransitionReportList({ data, institution }: StJamesTransitionReportListProps) {
    const handlePrint = () => {
        window.print();
    };

    if (!data) return null;

    const { getstudentdetails = [], year = '', exam = '', displayattendance = false, readmit = false, clastechname = '' } = data;

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
                    .stjames-report { padding: 40px; border: none !important; box-shadow: none !important; }
                }
                .stjames-report {
                    font-family: 'Times New Roman', serif;
                    color: black;
                }
                .border-bottom {
                    border-bottom: 1px solid #000;
                }
                .border-top {
                    border-top: 1px solid #000;
                }
                .borderdiv {
                    border: 1px solid black;
                    width: 30%;
                    min-height: 95px;
                    padding: 10px;
                    margin-left: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .link {
                    text-transform: lowercase;
                    display: inline-block;
                }
                .link::first-line {
                    text-transform: capitalize;
                }
                .table-bordered {
                    width: 100%;
                    border-collapse: collapse;
                }
                .table-bordered th, .table-bordered td {
                    border: 1px solid black;
                    padding: 8px;
                }
                .width-200 {
                    width: 200px;
                }
                .width-1 {
                    width: 1px;
                }
            `}</style>

            <div id='Baldwin' className='bg-white'>
                {getstudentdetails.map((report: any, index: number) => (
                    <div
                        key={index}
                        className={`stjames-report ${index > 0 ? 'page-break' : ''} mx-auto mb-10 max-w-[1000px] border border-gray-200 p-10 shadow-lg`}>
                        <div className='mb-8 text-center'>
                            <h3 className='font-bold text-xl uppercase'>
                                {exam || 'FINAL'} EXAMINATION REPORT CARD {year || '2023-2024'}
                            </h3>
                        </div>

                        <div className='mb-6 grid grid-cols-1 gap-4 font-bold text-sm md:grid-cols-12'>
                            <div className='space-y-2 md:col-span-5'>
                                <div>
                                    NAME : <span className='uppercase'>{report.studentname}</span>
                                </div>
                                <div>
                                    DOB : <span>{report.dob}</span>
                                </div>
                                <div className='flex gap-1'>
                                    <span>CLASS TEACHER :</span>
                                    <span className='link lowercase first-letter:capitalize'>{clastechname || 'Class Teacher'}</span>
                                </div>
                            </div>
                            <div className='space-y-2 md:col-span-4'>
                                <div>
                                    CLASS : <span>{report.asmcL_ClassName}</span>
                                </div>
                                <div>
                                    ROLL NO. : <span>{report.amaY_RollNo}</span>
                                </div>
                            </div>
                            <div className='space-y-2 md:col-span-3'>
                                <div>
                                    SECTION : <span>{report.asmC_SectionName}</span>
                                </div>
                                <div>
                                    ADM.NO. : <span>{report.amsT_AdmNo}</span>
                                </div>
                            </div>
                        </div>

                        <div className='mb-6'>
                            <table className='table-bordered text-sm'>
                                <thead>
                                    <tr>
                                        <th className='text-center'>SUBJECTS</th>
                                        <th className='text-center'>GRADE OBTAINED</th>
                                        <th className='text-center'>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.stdmarks?.map((subj: any, sIdx: number) => (
                                        <tr key={sIdx}>
                                            <td
                                                className={`text-left ${subj.Displaymarks === 0 ? 'font-bold' : ''}`}
                                                style={{ paddingLeft: '10px' }}>
                                                {subj.Display_Name} {subj.Displaymarks === 0 ? ' : ' : ''}
                                            </td>
                                            <td className='text-center font-bold'>
                                                {subj.Displaymarks === 1 && (subj.PassFailFlg === 'AB' ? 'AB' : subj.Grade)}
                                            </td>
                                            <td className='text-center' style={{ paddingLeft: '10px' }}>
                                                {subj.Displaymarks === 1 && (subj.PassFailFlg === 'AB' ? 'AB' : subj.GRADEREMAKS)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {displayattendance && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={3} className='p-2 text-center font-bold'>
                                                NO.OF WORKING DAYS : {report.TOTALWORKINGDAYS}{' '}
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NO.OF DAYS PRESENT : {report.PRESENTDAYS}
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </div>

                        <div className='mb-10 flex flex-wrap gap-4 md:flex-nowrap'>
                            <div className='flex-1 space-y-6 font-bold text-sm'>
                                <div className='flex items-end gap-2'>
                                    <span className='whitespace-nowrap'>NEXT TERM BEGINS ON :</span>
                                    <div className='min-w-[100px] flex-1 border-bottom'>&nbsp;</div>
                                    <span>AT</span>
                                    <div className='w-24 border-bottom'>&nbsp;</div>
                                </div>
                                <div className='flex items-start gap-2'>
                                    <span className='whitespace-nowrap'>CLASS TEACHER'S REMARKS:</span>
                                    <div className='min-h-[20px] flex-1 border-bottom font-normal italic'>{report.remaks}</div>
                                </div>
                            </div>
                            {readmit && (
                                <div className='borderdiv font-bold text-sm'>
                                    <div className='text-center'>
                                        Promotion
                                        <br />
                                        <br />
                                        Granted / Refused
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='mt-16'>
                            <div className='grid grid-cols-4 gap-4 text-center'>
                                <div className='space-y-6'>
                                    <div className='h-6'></div>
                                    <div className='border-top pt-1 font-bold text-[10px]'>PARENT'S SIGNATURE</div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='link h-6 font-bold text-sm lowercase first-letter:capitalize'>{clastechname}</div>
                                    <div className='border-top pt-1 font-bold text-[10px]'>CLASS TEACHER'S SIGNATURE</div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='h-6 font-bold text-sm'>Mrs. B. Mathew</div>
                                    <div className='border-top pt-1 font-bold text-[10px]'>JUNIOR HEAD'S SIGNATURE</div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='h-6 font-bold text-sm'>Dr.T.H.Ireland</div>
                                    <div className='border-top pt-1 font-bold text-[10px]'>PRINCIPAL'S SIGNATURE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
