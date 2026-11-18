'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function SopiaExamReportVtoVIIIView({ data }: { data: any }) {
    if (!data || !data.getstudentdetails || data.getstudentdetails.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground'>
                No data available to display.
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const institution = data.getinstitution?.[0] || {};
    const students = data.getstudentdetails || [];
    const scholasticData = data.getstudentwisesubjectlist || [];
    const performanceMarks = data.getstudentmarksdetails || [];
    const remarksData = data.getpromotionremarksdetails || [];
    const classTeacherData = data.clstchname || [];

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; background-color: #ffffff !important; }
                    #sopia-print-area, #sopia-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #sopia-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #sopia-print-area {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 13px;
                    line-height: 1.4;
                    color: #000;
                    width: 100%;
                    box-sizing: border-box;
                }
                #sopia-print-area table {
                    border-collapse: collapse !important;
                    width: 100%;
                }
                .soph-tablecustom > tbody.table-bordered > tr > td,
                .soph-tablecustom > tbody.table-bordered > tr > th {
                    border: 1px solid black !important;
                }
                .soph-tablecustom > tbody > tr > td {
                    border-left: 0.5px solid grey !important;
                    border-right: 0.3px solid grey !important;
                    border-top: none !important;
                    border-bottom: none !important;
                    padding: 2px 4px;
                }
                .soph-tablecustom > tbody:first-of-type > tr:first-child > td {
                    border-top: 1px solid black !important;
                }
                .soph-tablecustom > tbody:last-of-type > tr:last-child > td {
                    border-bottom: 0.3px solid grey !important;
                }
            `}</style>

            <div className='no-print flex justify-end pt-2 pr-4 pb-1'>
                <Button onClick={handlePrint} size='sm' className='flex w-auto items-center gap-1 px-3 py-1 text-xs'>
                    <Printer className='h-3 w-3' /> Print
                </Button>
            </div>

            <div id='sopia-print-area'>
                {students.map((student: any, index: number) => (
                    <div
                        key={student.amsT_Id}
                        className={index < students.length - 1 ? 'page-break' : ''}
                        style={{ padding: '10px 20px', marginTop: '40px' }}>
                        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '4px' }}>
                            {institution.mI_Logo && (
                                <img
                                    src={institution.mI_Logo}
                                    alt='School Logo'
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        top: '-60px',
                                        maxHeight: '100px'
                                    }}
                                />
                            )}
                            <br />
                            <br />
                            <br />
                            <br />
                            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{institution.mI_Name}</div>
                            <div style={{ fontSize: '14px' }}>
                                {institution.mI_Address1}, {institution.mI_Address2}, {institution.ivrmmcT_Name} - {institution.mI_Pincode}
                            </div>
                            <div style={{ fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>REPORT CARD</div>
                            <div style={{ position: 'absolute', top: 50, right: 0 }}>2025-2026</div>
                        </div>

                        <table style={{ border: '0.5px solid grey', borderCollapse: 'collapse', width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ border: '0.5px solid grey', padding: '4px 6px', verticalAlign: 'top' }}>
                                        <div style={{ display: 'flex', width: '100%' }}>
                                            <div style={{ width: '58%' }}>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '35%' }}>Name</div>
                                                    <div style={{ marginLeft: '-5%' }}>: {student.studentName}</div>
                                                </div>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '35%' }}>Class &amp; Division</div>
                                                    <div style={{ marginLeft: '-5%' }}>
                                                        : {student.className} {student.sectionName}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '35%' }}>Date of Birth</div>
                                                    <div style={{ marginLeft: '-5%' }}>: {student.dob}</div>
                                                </div>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '35%' }}>Admission No</div>
                                                    <div style={{ marginLeft: '-5%' }}>: {student.admissionNo}</div>
                                                </div>
                                            </div>
                                            <div style={{ width: '42%' }}>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '60%' }}>Standard Strength</div>
                                                    <div>: {student.classstrength || '-'}</div>
                                                </div>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '60%' }}>Division Strength</div>
                                                    <div>: {student.Sectionstrength || '-'}</div>
                                                </div>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '60%' }}>Attendance</div>
                                                    <div>
                                                        : {student.presentDays || '-'}/{student.totalWorkingDays || '-'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', lineHeight: '1.6' }}>
                                                    <div style={{ width: '60%' }}>Attendance %</div>
                                                    <div>: {student.attendancePercentage || '-'}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className='soph-tablecustom' style={{ width: '100%', marginTop: '0' }}>
                            <tbody className='table-bordered'>
                                <tr>
                                    <td rowSpan={2} width='20' style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>
                                        Sl.No
                                    </td>
                                    <td width='400' rowSpan={2} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>
                                        Subjects
                                    </td>
                                    <td colSpan={3} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>
                                        Marks
                                    </td>
                                    <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        Highest
                                    </td>
                                    <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        Average
                                    </td>
                                    <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        Position
                                    </td>
                                    <td width='180' rowSpan={2} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>
                                        Percentile
                                    </td>
                                    <td width='180' rowSpan={2} style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>
                                        Remarks
                                    </td>
                                </tr>
                                <tr>
                                    {['Max', 'Min', 'Obtained', 'Std.', 'Div.', 'Std.', 'Div.', 'Std.', 'Div.'].map((h, i) => (
                                        <td key={i} width='70' style={{ textAlign: 'center', height: '40px', fontWeight: 'bold' }}>
                                            {h}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>

                            {scholasticData
                                .filter((s: any) => s.amsT_Id === student.amsT_Id && s.subjectMaxMarks > 0)
                                .map((r: any, rIdx: number) => (
                                    <tbody key={rIdx}>
                                        <tr style={{ lineHeight: '0.5em', height: '1em' }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <b>{rIdx + 1}</b>
                                            </td>
                                            <td style={{ textAlign: 'left' }}>
                                                <b>{r.subjectName}</b>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{r.subjectMaxMarks}</td>
                                            <td style={{ textAlign: 'center' }}>{r.subjectMinMarks || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <b>{r.subjectObtainedMarks}</b>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{r.stdHighest || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{r.divHighest || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{r.stdAverage || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{r.divAverage || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{r.stdPosition || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{r.divPosition || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>{r.subjectPercentage}</td>
                                            <td style={{ textAlign: 'center' }}>{r.subjectGrade}</td>
                                        </tr>
                                    </tbody>
                                ))}

                            <tbody>
                                <tr style={{ height: '40px' }}>
                                    <td>&nbsp;</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <b>TOTAL</b>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{student.overallMaxMarks || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>-</td>
                                    <td style={{ textAlign: 'center' }}>{student.overallObtainedMarks || '-'}</td>
                                    <td colSpan={8}>
                                        &nbsp;&nbsp; Percentage : {student.overallPercentage || '-'}
                                        &emsp;&nbsp;&nbsp;&nbsp; Std.Position :{student.overallStdPosition || '-'}
                                        &emsp;&nbsp;&nbsp; Div.Position : {student.overallDivPosition || '-'}
                                    </td>
                                </tr>
                            </tbody>

                            <tbody style={{ borderLeft: '1px solid grey' }}>
                                {scholasticData
                                    .filter((s: any) => s.amsT_Id === student.amsT_Id && (s.subjectMaxMarks === 0 || !s.subjectMaxMarks))
                                    .map((r: any, rIdx: number) => (
                                        <tr key={rIdx} style={{ borderLeft: '1px solid grey' }}>
                                            <td style={{ textAlign: 'center' }}>{rIdx + 1}</td>
                                            <td style={{ borderRight: '1px solid grey', textAlign: 'left' }}>{r.subjectName}</td>
                                            <td style={{ borderRight: '1px solid grey', textAlign: 'center' }}>&nbsp;</td>
                                            <td style={{ borderRight: '1px solid grey', textAlign: 'center' }}>&nbsp;</td>
                                            <td style={{ borderRight: '1px solid grey', textAlign: 'center' }}>{r.subjectGrade}</td>
                                            <td style={{ borderRight: '1px solid grey' }} colSpan={8}>
                                                &nbsp;
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '6px' }}>
                            <table style={{ border: '0.5px solid grey', width: '100%' }}>
                                <tbody>
                                    <tr style={{ height: '60px', verticalAlign: 'top' }}>
                                        <td style={{ padding: '4px 6px' }}>
                                            Teacher&apos;s Remarks :{' '}
                                            <strong>{remarksData.find((r: any) => r.amsT_Id === student.amsT_Id)?.remarks || ''}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ border: '0.5px solid grey', borderTop: 'none', borderCollapse: 'collapse', width: '100%' }}>
                                <tbody>
                                    <tr style={{ height: '60px' }}>
                                        <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%' }}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {classTeacherData[0]?.hrmE_EmployeeFirstName || 'CLASS TEACHER'}
                                            </div>
                                            <div>CLASS TEACHER</div>
                                        </td>
                                        <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%' }}>PRINCIPAL</td>
                                        <td style={{ verticalAlign: 'bottom', textAlign: 'center', width: '33.33%' }}>PARENT</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
