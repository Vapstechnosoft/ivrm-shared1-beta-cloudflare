'use client';

import { Button } from '@/components/ui/button';

export default function NDAReportCardView({ data }: { data: any }) {
    // Extract students from API data or use a dummy student if no data is present
    let report_list: any[] = [];
    const studentSource = data?.examwisedetailsnew || data?.student_list || data?.examwisedetails || [];

    if (studentSource && studentSource.length > 0) {
        studentSource.forEach((dev: any) => {
            if (!report_list.some((emp) => emp.AMST_Id === dev.AMST_Id)) {
                report_list.push(dev);
            }
        });
    }

    // Fallback dummy student
    if (report_list.length === 0) {
        report_list = [
            {
                AMST_Id: 0,
                AMST_FirstName: 'AADYA',
                AMST_MiddleName: '',
                AMST_LastName: 'SHENOY',
                AMST_AdmNo: '2024001',
                ASMCL_ClassName: 'IX',
                ASMC_SectionName: 'A',
                AMST_DOB: '2011-09-18',
                SPCCMH_HouseName: 'Lisette',
                TotalWorkingDays: 44,
                TotalSchoolDays: 47,
                Total_Percentage: 94
            }
        ];
    }

    const examName = data?.examwisemarksprocess?.[0]?.emE_ExamName || 'First Unit Test';
    const classStrength = data?.examwisemarksprocess?.[0]?.classstrength || 120;
    const Sectionstrength = data?.examwisemarksprocess?.[0]?.Sectionstrength || 40;

    const getDummyMarks = () => [
        {
            ROWNUMBER: 1,
            ISMS_SubjectName: 'English Language',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 16,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 19,
            ESTMPS_ClassAverage: 15,
            ESTMPS_SectionAverage: 15,
            ESTMPS_ClassRank: 5,
            ESTMPS_SectionRank: 4,
            Percentile: 62
        },
        {
            ROWNUMBER: 2,
            ISMS_SubjectName: 'English Literature',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 19,
            ESTMPS_ClassHighest: 19,
            ESTMPS_SectionHighest: 19,
            ESTMPS_ClassAverage: 16,
            ESTMPS_SectionAverage: 16,
            ESTMPS_ClassRank: 1,
            ESTMPS_SectionRank: 1,
            Percentile: 95
        },
        {
            ROWNUMBER: 3,
            ISMS_SubjectName: 'Hindi 2',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 18,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 13,
            ESTMPS_SectionAverage: 13,
            ESTMPS_ClassRank: 3,
            ESTMPS_SectionRank: 3,
            Percentile: 86
        },
        {
            ROWNUMBER: 4,
            ISMS_SubjectName: 'Mathematics',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 18,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 14,
            ESTMPS_SectionAverage: 15,
            ESTMPS_ClassRank: 3,
            ESTMPS_SectionRank: 3,
            Percentile: 73
        },
        {
            ROWNUMBER: 5,
            ISMS_SubjectName: 'Physics',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 19,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 16,
            ESTMPS_SectionAverage: 16,
            ESTMPS_ClassRank: 2,
            ESTMPS_SectionRank: 2,
            Percentile: 77
        },
        {
            ROWNUMBER: 6,
            ISMS_SubjectName: 'Chemistry',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 19,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 15,
            ESTMPS_SectionAverage: 16,
            ESTMPS_ClassRank: 2,
            ESTMPS_SectionRank: 2,
            Percentile: 82
        },
        {
            ROWNUMBER: 7,
            ISMS_SubjectName: 'Biology',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 18,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 16,
            ESTMPS_SectionAverage: 16,
            ESTMPS_ClassRank: 3,
            ESTMPS_SectionRank: 3,
            Percentile: 57
        },
        {
            ROWNUMBER: 8,
            ISMS_SubjectName: 'History & Civics',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 20,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 16,
            ESTMPS_SectionAverage: 17,
            ESTMPS_ClassRank: 1,
            ESTMPS_SectionRank: 1,
            Percentile: 91
        },
        {
            ROWNUMBER: 9,
            ISMS_SubjectName: 'Geography',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 20,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 18,
            ESTMPS_SectionAverage: 18,
            ESTMPS_ClassRank: 1,
            ESTMPS_SectionRank: 1,
            Percentile: 87
        },
        {
            ROWNUMBER: 10,
            ISMS_SubjectName: 'Computer Applications',
            EYCES_MaxMarks: 20,
            EYCES_MinMarks: 8,
            ESTMPS_ObtainedMarks: 20,
            ESTMPS_ClassHighest: 20,
            ESTMPS_SectionHighest: 20,
            ESTMPS_ClassAverage: 16,
            ESTMPS_SectionAverage: 17,
            ESTMPS_ClassRank: 1,
            ESTMPS_SectionRank: 1,
            Percentile: 88
        }
    ];

    const dummyPerformance = [
        { exam: 'First Unit Test', marks: ['16/20', '19/20', '18/20', '18/20', '19/20', '19/20', '18/20', '20/20', '20/20', '20/20'] },
        { exam: 'Second Unit Test', marks: ['17/20', '17/20', '18/20', '12/20', '18/20', '19/20', '19/20', '20/20', '18/20', '19/20'] },
        {
            exam: 'Final Term Examination',
            marks: ['88/100', '91/100', '85/100', '86/100', '88/100', '94/100', '86/100', '94/100', '96/100', '95/100']
        },
        {
            exam: 'Mid Term Examination',
            marks: ['83/100', '93/100', '72/100', '93/100', '93/100', '94/100', '79/100', '97/100', '93/100', '91/100']
        }
    ];

    const subjectsShort = ['ENG. LANG.', 'ENG. LIT.', 'HINDI', 'MATHS', 'PHYSICS', 'CHEM', 'BIOLOGY', 'HISTORY', 'GEO', 'CTA'];

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <link href='https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap' rel='stylesheet' />
            <style>{`
                @media print {
                    @page { size: A4; margin: 10mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; }
                    #nda-print-area, #nda-print-area * { visibility: visible !important; }
                    #nda-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #nda-print-area {
                    font-family: Arial, sans-serif;
                    font-size: 11px;
                    line-height: 1.2;
                    color: #000;
                    width: 100%;
                }
                .school-name {
                    font-family: 'Great Vibes', cursive;
                    font-size: 48px;
                    color: #000;
                    margin: 0;
                    padding: 0;
                }
                .school-address {
                    font-size: 14px;
                    font-weight: 500;
                }
                .tablecustom {
                    width: 100%;
                    border-collapse: collapse !important;
                    border: 1.5px solid black !important;
                }
                .tablecustom td, .tablecustom th {
                    border: 1px solid black !important;
                    padding: 4px 2px;
                    text-align: center;
                }
                .text-bold { font-weight: bold; }
                .text-left { text-align: left !important; padding-left: 5px !important; }
                .bg-light { background-color: #fff; }
                .header-info-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1.5px solid black;
                    margin-bottom: 5px;
                }
                .header-info-table td {
                    padding: 2px 5px;
                    border: none;
                    font-size: 11px;
                }
            `}</style>

            <div id='nda-print-area'>
                {report_list.map((report, index) => {
                    const studentMarks = getDummyMarks();
                    return (
                        <div
                            key={report.AMST_Id}
                            className={index < report_list.length - 1 ? 'page-break' : ''}
                            style={{ padding: '20px' }}>
                            {/* School Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                <div style={{ marginRight: '20px' }}>
                                    <div
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            border: '1px solid black',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                        <img
                                            src='/images/logo.png'
                                            alt='Logo'
                                            style={{ width: '80%', height: '80%', borderRadius: '50%' }}
                                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100')}
                                        />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h1 className='school-name'>Notre Dame Academy</h1>
                                    <p className='school-address'>Notre Dame Nagar, Choodasandra, Huskur Post.</p>
                                    <p className='school-address'>Bangalore - 560099. Phone: 9535006836</p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    marginBottom: '5px',
                                    fontWeight: 'bold',
                                    fontSize: '13px'
                                }}>
                                <div className='text-center'>{examName}</div>
                                <div style={{ position: 'absolute', right: 0 }}>2025-2026</div>
                            </div>

                            <table className='header-info-table'>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '120px' }}>Name</td>
                                        <td style={{ width: '250px' }}>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.AMST_FirstName || ''} {report.AMST_LastName || ''}
                                            </span>
                                        </td>
                                        <td style={{ width: '150px' }}>Standard Strength</td>
                                        <td>: {classStrength || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Class & Division</td>
                                        <td>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.ASMCL_ClassName || ''} {report.ASMC_SectionName || ''}
                                            </span>
                                        </td>
                                        <td>Division Strength</td>
                                        <td>: {Sectionstrength || ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Date of Birth</td>
                                        <td>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.AMST_DOB
                                                    ? new Date(report.AMST_DOB)
                                                          .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                          .replace(/ /g, '-')
                                                    : ''}
                                            </span>
                                        </td>
                                        <td>Attendance</td>
                                        <td>
                                            : {report.TotalWorkingDays || '0'}/{report.TotalSchoolDays || '0'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Student House</td>
                                        <td>
                                            : <span className='text-bold'>{report.SPCCMH_HouseName || ''}</span>
                                        </td>
                                        <td>Attendance %</td>
                                        <td>: {report.Total_Percentage ? Math.round(report.Total_Percentage) : '0'}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className='tablecustom'>
                                <thead>
                                    <tr className='bg-light text-bold'>
                                        <th rowSpan={2} style={{ width: '35px' }}>
                                            Sl.No
                                        </th>
                                        <th rowSpan={2} style={{ width: '220px' }}>
                                            Subjects
                                        </th>
                                        <th colSpan={3}>Marks</th>
                                        <th colSpan={2}>Highest</th>
                                        <th colSpan={2}>Average</th>
                                        <th colSpan={2}>Position</th>
                                        <th rowSpan={2} style={{ width: '70px' }}>
                                            Percentile
                                        </th>
                                        <th rowSpan={2} style={{ width: '100px' }}>
                                            Remarks
                                        </th>
                                    </tr>
                                    <tr className='bg-light text-bold'>
                                        <th style={{ width: '35px' }}>Max</th>
                                        <th style={{ width: '35px' }}>Min</th>
                                        <th style={{ width: '45px' }}>Obtained</th>
                                        <th style={{ width: '35px' }}>Std.</th>
                                        <th style={{ width: '35px' }}>Div.</th>
                                        <th style={{ width: '35px' }}>Std.</th>
                                        <th style={{ width: '35px' }}>Div.</th>
                                        <th style={{ width: '35px' }}>Std.</th>
                                        <th style={{ width: '35px' }}>Div.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentMarks.map((m, i) => (
                                        <tr key={i} style={{ height: '22px' }}>
                                            <td className='text-bold'>{m.ROWNUMBER}</td>
                                            <td className='text-left text-bold' style={{ fontSize: '11px' }}>
                                                {m.ISMS_SubjectName}
                                            </td>
                                            <td>{m.EYCES_MaxMarks}</td>
                                            <td>{m.EYCES_MinMarks}</td>
                                            <td className='text-bold'>{m.ESTMPS_ObtainedMarks}</td>
                                            <td>{m.ESTMPS_ClassHighest}</td>
                                            <td>{m.ESTMPS_SectionHighest}</td>
                                            <td>{m.ESTMPS_ClassAverage}</td>
                                            <td>{m.ESTMPS_SectionAverage}</td>
                                            <td>{m.ESTMPS_ClassRank}</td>
                                            <td>{m.ESTMPS_SectionRank}</td>
                                            <td>{m.Percentile}</td>
                                            <td></td>
                                        </tr>
                                    ))}
                                    <tr className='text-bold' style={{ height: '30px' }}>
                                        <td colSpan={2} className='text-right' style={{ paddingRight: '15px' }}>
                                            TOTAL
                                        </td>
                                        <td>200</td>
                                        <td>80</td>
                                        <td className='text-bold'>187</td>
                                        <td colSpan={8} className='text-left' style={{ paddingLeft: '20px' }}>
                                            Percentage : 94 &emsp;&emsp;&emsp; Std.Position : 9 &emsp;&emsp;&emsp; Div.Position : 5
                                        </td>
                                    </tr>
                                    {/* Bottom blank area within table - spanned to remove internal lines */}
                                    <tr style={{ height: '120px' }}>
                                        <td colSpan={13}></td>
                                    </tr>
                                </tbody>
                            </table>

                            <div
                                style={{
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    marginTop: '15px',
                                    marginBottom: '5px'
                                }}>
                                PERFORMANCE OF THE YEAR
                            </div>
                            <table className='tablecustom'>
                                <thead>
                                    <tr className='text-bold' style={{ height: '35px' }}>
                                        <th style={{ width: '35px' }}>Sl.No</th>
                                        <th style={{ width: '140px' }}>Examination</th>
                                        {subjectsShort.map((s, i) => (
                                            <th key={i} style={{ fontSize: '8px', padding: '1px' }}>
                                                {s}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dummyPerformance.map((p, i) => (
                                        <tr key={i} style={{ height: '20px' }}>
                                            <td>{i + 1}</td>
                                            <td className='text-left'>{p.exam}</td>
                                            {p.marks.map((m, j) => (
                                                <td key={j} style={{ fontSize: '9px' }}>
                                                    {m}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '5px', border: '1px solid black', padding: '5px', height: '50px', fontSize: '10px' }}>
                                <span className='text-bold'>Teacher&apos;s Remarks :</span>
                            </div>

                            <div
                                style={{
                                    marginTop: '10px',
                                    border: '1px solid black',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    paddingBottom: '10px'
                                }}>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>CLASS TEACHER</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>PRINCIPAL</div>
                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>PARENT</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
