'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function NDAReportCardItoXIITermView({ data: initialData }: { data: any }) {
    let data = initialData;
    const handlePrint = () => {
        window.print();
    };

    // Extract students from API data
    let report_list: any[] = [];
    const studentSource = data?.examwisedetailsnew || data?.student_list || data?.examwisedetails || [];

    if (studentSource && studentSource.length > 0) {
        studentSource.forEach((dev: any) => {
            if (!report_list.some((emp) => emp.AMST_Id === dev.AMST_Id)) {
                report_list.push(dev);
            }
        });
    }

    // Fallback dummy data if no API data
    if (report_list.length === 0) {
        const dummyMarks = [
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'SCHOLASTIC',
                SUBJECTGROUP: 'GROUPNAME',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: '',
                EYCES_MinMarks: '',
                ESTMPS_ObtainedMarks: '',
                ROWNUMBER: 0
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'English Language',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 85,
                ESTMPS_ClassHighest: 92,
                ESTMPS_SectionHighest: 90,
                ESTMPS_ClassAverage: 75,
                ESTMPS_SectionAverage: 78,
                ESTMPS_ClassRank: 5,
                ESTMPS_SectionRank: 2,
                Percentile: '88',
                ROWNUMBER: 1
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'English Literature',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 91,
                ESTMPS_ClassHighest: 95,
                ESTMPS_SectionHighest: 93,
                ESTMPS_ClassAverage: 72,
                ESTMPS_SectionAverage: 75,
                ESTMPS_ClassRank: 3,
                ESTMPS_SectionRank: 1,
                Percentile: '92',
                ROWNUMBER: 2
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Hindi',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 78,
                ESTMPS_ClassHighest: 88,
                ESTMPS_SectionHighest: 85,
                ESTMPS_ClassAverage: 65,
                ESTMPS_SectionAverage: 68,
                ESTMPS_ClassRank: 8,
                ESTMPS_SectionRank: 4,
                Percentile: '73',
                ROWNUMBER: 3
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Mathematics',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 95,
                ESTMPS_ClassHighest: 100,
                ESTMPS_SectionHighest: 98,
                ESTMPS_ClassAverage: 70,
                ESTMPS_SectionAverage: 72,
                ESTMPS_ClassRank: 1,
                ESTMPS_SectionRank: 1,
                Percentile: '99',
                ROWNUMBER: 4
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Physics',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 88,
                ESTMPS_ClassHighest: 92,
                ESTMPS_SectionHighest: 90,
                ESTMPS_ClassAverage: 68,
                ESTMPS_SectionAverage: 70,
                ESTMPS_ClassRank: 4,
                ESTMPS_SectionRank: 2,
                Percentile: '85',
                ROWNUMBER: 5
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Chemistry',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 82,
                ESTMPS_ClassHighest: 90,
                ESTMPS_SectionHighest: 88,
                ESTMPS_ClassAverage: 66,
                ESTMPS_SectionAverage: 69,
                ESTMPS_ClassRank: 6,
                ESTMPS_SectionRank: 3,
                Percentile: '78',
                ROWNUMBER: 6
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Biology',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 90,
                ESTMPS_ClassHighest: 95,
                ESTMPS_SectionHighest: 92,
                ESTMPS_ClassAverage: 74,
                ESTMPS_SectionAverage: 76,
                ESTMPS_ClassRank: 3,
                ESTMPS_SectionRank: 2,
                Percentile: '90',
                ROWNUMBER: 7
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'History & Civics',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 86,
                ESTMPS_ClassHighest: 94,
                ESTMPS_SectionHighest: 91,
                ESTMPS_ClassAverage: 71,
                ESTMPS_SectionAverage: 73,
                ESTMPS_ClassRank: 5,
                ESTMPS_SectionRank: 3,
                Percentile: '82',
                ROWNUMBER: 8
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Geography',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 92,
                ESTMPS_ClassHighest: 96,
                ESTMPS_SectionHighest: 94,
                ESTMPS_ClassAverage: 76,
                ESTMPS_SectionAverage: 78,
                ESTMPS_ClassRank: 2,
                ESTMPS_SectionRank: 1,
                Percentile: '94',
                ROWNUMBER: 9
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Computer',
                SUBJECTGROUP: 'SUB',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 100,
                EYCES_MinMarks: 35,
                ESTMPS_ObtainedMarks: 94,
                ESTMPS_ClassHighest: 98,
                ESTMPS_SectionHighest: 96,
                ESTMPS_ClassAverage: 78,
                ESTMPS_SectionAverage: 80,
                ESTMPS_ClassRank: 2,
                ESTMPS_SectionRank: 1,
                Percentile: '96',
                ROWNUMBER: 10
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Aggregate Average',
                SUBJECTGROUP: 'AVERAGE',
                EYCES_AplFResultFlg: true,
                EYCES_MaxMarks: 1000,
                EYCES_MinMarks: 350,
                ESTMPS_ObtainedMarks: 881,
                ROWNUMBER: 0
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Art Education',
                EYCES_AplFResultFlg: false,
                EYCES_MaxMarks: '',
                EYCES_MinMarks: '',
                ESTMPS_ObtainedGrade: 'A',
                EYCES_MarksDisplayFlg: false
            },
            {
                AMST_Id: 1,
                ISMS_SubjectName: 'Physical Education',
                EYCES_AplFResultFlg: false,
                EYCES_MaxMarks: '',
                EYCES_MinMarks: '',
                ESTMPS_ObtainedGrade: 'A+',
                EYCES_MarksDisplayFlg: false
            }
        ];
        report_list = [
            {
                AMST_Id: 1,
                AMST_FirstName: 'AADYA',
                AMST_MiddleName: '',
                AMST_LastName: 'SHENOY',
                ASMCL_ClassName: 'IX',
                ASMC_SectionName: 'A',
                AMST_DOB: '2011-09-18',
                SPCCMH_HouseName: 'Lisette',
                TotalWorkingDays: 44,
                TotalSchoolDays: 47,
                Total_Percentage: 94,
                ESTMP_Result: 'Pass',
                TotalMarksList: dummyMarks
            }
        ];
        // Set dummy row numbers
        let c = 1;
        report_list[0].TotalMarksList.forEach((m: any) => {
            if (m.EYCES_AplFResultFlg && m.SUBJECTGROUP !== 'GROUPNAME' && m.SUBJECTGROUP !== 'AVERAGE') m.rowNo1 = c++;
        });
        data = {
            ...data,
            examwisemarksprocess: [{ emE_ExamName: 'First Unit Test', classstrength: 120, Sectionstrength: 40 }],
            studentwise_total: [{ AMST_Id: 1, MaxMarks_Total: 1000, MinMarks_Total: 350, ObtainedMarks_Total: 881, Percentage: 88.1 }],
            examwisemarksprocess1: [
                {
                    AMST_Id: 1,
                    EME_ExamName: 'First Unit Test',
                    TTMSUAB_Abbreviation: 'ENG',
                    ESTMPS_ObtainedMarks: 85,
                    ESTMPS_MaxMarks: 100
                },
                {
                    AMST_Id: 1,
                    EME_ExamName: 'First Unit Test',
                    TTMSUAB_Abbreviation: 'MATH',
                    ESTMPS_ObtainedMarks: 95,
                    ESTMPS_MaxMarks: 100
                },
                {
                    AMST_Id: 1,
                    EME_ExamName: 'First Unit Test',
                    TTMSUAB_Abbreviation: 'SCI',
                    ESTMPS_ObtainedMarks: 88,
                    ESTMPS_MaxMarks: 100
                },
                {
                    AMST_Id: 1,
                    EME_ExamName: 'Second Unit Test',
                    TTMSUAB_Abbreviation: 'ENG',
                    ESTMPS_ObtainedMarks: 90,
                    ESTMPS_MaxMarks: 100
                },
                {
                    AMST_Id: 1,
                    EME_ExamName: 'Second Unit Test',
                    TTMSUAB_Abbreviation: 'MATH',
                    ESTMPS_ObtainedMarks: 92,
                    ESTMPS_MaxMarks: 100
                },
                {
                    AMST_Id: 1,
                    EME_ExamName: 'Second Unit Test',
                    TTMSUAB_Abbreviation: 'SCI',
                    ESTMPS_ObtainedMarks: 86,
                    ESTMPS_MaxMarks: 100
                },
                { AMST_Id: 1, EME_ExamName: 'Mid Term', TTMSUAB_Abbreviation: 'ENG', ESTMPS_ObtainedMarks: 88, ESTMPS_MaxMarks: 100 },
                { AMST_Id: 1, EME_ExamName: 'Mid Term', TTMSUAB_Abbreviation: 'MATH', ESTMPS_ObtainedMarks: 97, ESTMPS_MaxMarks: 100 },
                { AMST_Id: 1, EME_ExamName: 'Mid Term', TTMSUAB_Abbreviation: 'SCI', ESTMPS_ObtainedMarks: 91, ESTMPS_MaxMarks: 100 }
            ]
        };
    }

    // Process students to include their marks list (when data comes from API)
    report_list.forEach((stu) => {
        if (!stu.TotalMarksList) {
            stu.TotalMarksList = (data?.examwisedetailsnew || []).filter((mar: any) => mar.AMST_Id === stu.AMST_Id);
            let counter = 1;
            stu.TotalMarksList.forEach((marks: any) => {
                if (marks.EYCES_AplFResultFlg === true && marks.SUBJECTGROUP !== 'GROUPNAME' && marks.SUBJECTGROUP !== 'AVERAGE') {
                    marks.rowNo1 = counter++;
                } else {
                    marks.rowNo1 = null;
                }
            });
        }
    });

    const examName = data?.examwisemarksprocess?.[0]?.emE_ExamName || 'First Unit Test';
    const classStrength = data?.examwisemarksprocess?.[0]?.classstrength || 120;
    const Sectionstrength = data?.examwisemarksprocess?.[0]?.Sectionstrength || 40;

    // Unique subjects and exams for the performance grid
    const getSubjects = (amstId: number) => {
        const subjectSet = new Set<string>();
        (data?.examwisemarksprocess1 || []).forEach((entry: any) => {
            if (entry.AMST_Id === amstId) {
                subjectSet.add(entry.TTMSUAB_Abbreviation);
            }
        });
        return Array.from(subjectSet);
    };

    const getExams = (amstId: number) => {
        const examSet = new Set<string>();
        (data?.examwisemarksprocess1 || []).forEach((entry: any) => {
            if (entry.AMST_Id === amstId) {
                examSet.add(entry.EME_ExamName);
            }
        });
        return Array.from(examSet);
    };

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    html, body { 
                        visibility: hidden !important; 
                        background: #ffffff !important; 
                        background-color: #ffffff !important; 
                    }
                    #nda-print-area, #nda-print-area * { 
                        visibility: visible !important; 
                        background-color: #ffffff !important; 
                    }
                    #nda-print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        background: #ffffff !important; 
                    }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                }
                .reportbody {
                    padding: 10px 20px;
                    font-family: Arial, sans-serif;
                    background-color: #fff;
                }
                .school-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    margin-bottom: 5px;
                    padding-top: 5px;
                }
                .school-logo {
                    width: 80px;
                    height: 80px;
                    position: absolute;
                    left: 20px;
                }
                .school-details {
                    text-align: center;
                    flex: 1;
                }
                .school-name {
                    font-family: "Times New Roman", Times, serif;
                    font-size: 36px;
                    font-style: italic;
                    font-weight: bold;
                    margin: 0;
                    line-height: 1.1;
                }
                .school-address {
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.2;
                }
                .exam-year-header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    margin-top: 5px;
                    font-weight: bold;
                    font-size: 13px;
                    border-top: 1px solid transparent;
                }
                .tablecustom {
                    width: 100%;
                    border-collapse: collapse !important;
                }
                /* Default style: left/right borders only */
                .tablecustom > tbody > tr > td {
                    border-left: 1px solid black !important;
                    border-right: 1px solid black !important;
                    border-top: none !important;
                    border-bottom: none !important;
                    padding: 2px 4px;
                    font-size: 11px;
                }
                /* Headers and Total row get full borders */
                .tablecustom > thead.table-bordered > tr > th,
                .tablecustom > tbody.table-bordered > tr > td {
                    border: 1px solid black !important;
                    font-size: 11px;
                }
                .performance-table {
                    width: 100%;
                    border: 1px solid black;
                    border-collapse: collapse;
                    text-align: center;
                    font-size: 11px;
                }
                .performance-table th, .performance-table td {
                    border: 1px solid black;
                    padding: 2px;
                }
                .text-bold { font-weight: bold; }
                .text-left { text-align: left !important; padding-left: 5px !important; }
                .text-right { text-align: right !important; padding-right: 5px !important; }
                .text-center { text-align: center !important; }
            `}</style>

            <div className='no-print flex justify-end pt-4 pr-4 pb-4'>
                <Button onClick={handlePrint} size='sm' className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='nda-print-area'>
                {report_list.map((report, index) => (
                    <div key={report.AMST_Id} className={index < report_list.length - 1 ? 'page-break reportbody' : 'reportbody'}>
                        {/* ── HEADER ── */}
                        <div className='school-header'>
                            <img
                                src='/images/logo.png'
                                alt='Logo'
                                className='school-logo'
                                onError={(e: any) => (e.target.src = 'https://vaps-ivrm.s3.ap-south-1.amazonaws.com/notre_dame_logo.png')}
                            />
                            <div className='school-details'>
                                <h1 className='school-name'>Notre Dame Academy</h1>
                                <p className='school-address'>Notre Dame Nagar, Choodasandra, Huskur Post.</p>
                                <p className='school-address'>Bangalore - 560099. Phone: 9535006836</p>
                            </div>
                        </div>

                        <div className='exam-year-header'>
                            <div style={{ flex: 1, textAlign: 'center', marginLeft: '20%' }}>{examName}</div>
                            <div style={{ position: 'absolute', right: 0 }}>2025-2026</div>
                        </div>

                        {/* ── STUDENT INFO BOX ── */}
                        <div style={{ border: '1px solid black', marginTop: '5px', padding: '5px' }}>
                            <div style={{ display: 'flex', width: '100%', fontSize: '11px', lineHeight: '1.4' }}>
                                <div style={{ width: '55%' }}>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '120px' }}>Name</div>
                                        <div>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.AMST_FirstName} {report.AMST_MiddleName || ''} {report.AMST_LastName || ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '120px' }}>Class & Division</div>
                                        <div>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.ASMCL_ClassName} {report.ASMC_SectionName}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '120px' }}>Date of Birth</div>
                                        <div>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.AMST_DOB
                                                    ? new Date(report.AMST_DOB)
                                                          .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                          .replace(/ /g, '-')
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '120px' }}>Student House</div>
                                        <div>
                                            : <span className='text-bold'>{report.SPCCMH_HouseName || ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ width: '45%' }}>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '150px' }}>Standard Strength</div>
                                        <div>
                                            : <span className='text-bold'>{classStrength}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '150px' }}>Division Strength</div>
                                        <div>
                                            : <span className='text-bold'>{Sectionstrength}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '150px' }}>Attendance</div>
                                        <div>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.TotalWorkingDays}/{report.TotalSchoolDays}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ width: '150px' }}>Attendance %</div>
                                        <div>
                                            :{' '}
                                            <span className='text-bold'>
                                                {report.Total_Percentage ? Math.round(report.Total_Percentage) : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── MARKS TABLE ── */}
                        <table className='tablecustom' style={{ marginTop: '5px' }}>
                            <thead className='table-bordered'>
                                <tr>
                                    <th rowSpan={2} style={{ width: '30px' }}>
                                        SL.No
                                    </th>
                                    <th rowSpan={2} style={{ width: '220px' }}>
                                        Subjects
                                    </th>
                                    <th colSpan={3}>Marks</th>
                                    <th colSpan={2}>Highest</th>
                                    <th colSpan={2}>Average</th>
                                    <th colSpan={2}>Position</th>
                                    <th rowSpan={2} style={{ width: '80px' }}>
                                        Percentile
                                    </th>
                                    <th rowSpan={2} style={{ width: '100px' }}>
                                        Remarks
                                    </th>
                                </tr>
                                <tr>
                                    <th style={{ width: '35px' }}>Max</th>
                                    <th style={{ width: '35px' }}>Min</th>
                                    <th style={{ width: '35px' }}>Obtained</th>
                                    <th style={{ width: '35px' }}>Std.</th>
                                    <th style={{ width: '35px' }}>Div.</th>
                                    <th style={{ width: '35px' }}>Std.</th>
                                    <th style={{ width: '35px' }}>Div.</th>
                                    <th style={{ width: '35px' }}>Std.</th>
                                    <th style={{ width: '35px' }}>Div.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.TotalMarksList.filter(
                                    (m: any) => m.EYCES_AplFResultFlg === true && m.SUBJECTGROUP !== 'AVERAGE'
                                ).map((marks: any, i: number) => (
                                    <tr key={i} style={{ height: '22px' }}>
                                        <td className='text-center text-bold'>{marks.ROWNUMBER || i + 1}</td>
                                        <td className='text-left text-bold'>
                                            {marks.SUBJECTGROUP === 'GROUPNAME' ? (
                                                marks.ISMS_SubjectName
                                            ) : (
                                                <span>&nbsp;{marks.ISMS_SubjectName}</span>
                                            )}
                                        </td>
                                        <td className='text-center'>{marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MaxMarks : ''}</td>
                                        <td className='text-center'>{marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.EYCES_MinMarks : ''}</td>
                                        <td className='text-center text-bold'>
                                            {marks.SUBJECTGROUP !== 'GROUPNAME'
                                                ? marks.ESTMPS_PassFailFlg === 'AB'
                                                    ? 'AB'
                                                    : marks.ESTMPS_ObtainedMarks
                                                : ''}
                                        </td>
                                        <td className='text-center'>
                                            {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.ESTMPS_ClassHighest : ''}
                                        </td>
                                        <td className='text-center'>
                                            {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.ESTMPS_SectionHighest : ''}
                                        </td>
                                        <td className='text-center'>
                                            {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.ESTMPS_ClassAverage
                                                ? Math.round(marks.ESTMPS_ClassAverage)
                                                : ''}
                                        </td>
                                        <td className='text-center'>
                                            {marks.SUBJECTGROUP !== 'GROUPNAME' && marks.ESTMPS_SectionAverage
                                                ? Math.round(marks.ESTMPS_SectionAverage)
                                                : ''}
                                        </td>
                                        <td className='text-center'>{marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.ESTMPS_ClassRank : ''}</td>
                                        <td className='text-center'>
                                            {marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.ESTMPS_SectionRank : ''}
                                        </td>
                                        <td className='text-center'>{marks.SUBJECTGROUP !== 'GROUPNAME' ? marks.Percentile : ''}</td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                            {/* Filler rows with lines (above total) */}
                            <tbody>
                                <tr style={{ height: '100px' }}>
                                    {Array(13)
                                        .fill(0)
                                        .map((_, idx) => (
                                            <td key={idx}></td>
                                        ))}
                                </tr>
                            </tbody>

                            {/* TOTAL Row */}
                            <tbody className='table-bordered'>
                                <tr style={{ height: '30px' }}>
                                    <td colSpan={2} className='text-right text-bold'>
                                        TOTAL
                                    </td>
                                    <td className='text-center text-bold'>
                                        {data?.studentwise_total?.find((p: any) => p.AMST_Id === report.AMST_Id)?.MaxMarks_Total}
                                    </td>
                                    <td className='text-center text-bold'>
                                        {data?.studentwise_total?.find((p: any) => p.AMST_Id === report.AMST_Id)?.MinMarks_Total}
                                    </td>
                                    <td className='text-center text-bold'>
                                        {data?.studentwise_total?.find((p: any) => p.AMST_Id === report.AMST_Id)?.ObtainedMarks_Total}
                                    </td>
                                    <td colSpan={8} className='text-left' style={{ fontSize: '10px' }}>
                                        &nbsp;&nbsp; Percentage :{' '}
                                        <span className='text-bold'>
                                            {data?.studentwise_total?.find((p: any) => p.AMST_Id === report.AMST_Id)?.Percentage
                                                ? Math.round(
                                                      data?.studentwise_total?.find((p: any) => p.AMST_Id === report.AMST_Id)?.Percentage
                                                  )
                                                : ''}
                                        </span>
                                        &emsp;&emsp; Std.Position :{' '}
                                        <span className='text-bold'>{report.TotalMarksList?.[0]?.ESTMP_ClassRank}</span>
                                        &emsp;&emsp; Div.Position :{' '}
                                        <span className='text-bold'>{report.TotalMarksList?.[0]?.ESTMP_SectionRank}</span>
                                    </td>
                                </tr>
                            </tbody>

                            {/* Blank Area BELOW Total (Merged) */}
                            <tbody>
                                <tr style={{ height: '80px' }}>
                                    <td
                                        colSpan={13}
                                        style={{
                                            borderLeft: '1px solid black',
                                            borderRight: '1px solid black',
                                            borderBottom: '1px solid black'
                                        }}></td>
                                </tr>
                            </tbody>
                        </table>

                        {/* ── PERFORMANCE GRID ── */}
                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '10px', marginBottom: '5px' }}>
                            PERFORMANCE OF THE YEAR
                        </div>
                        <table className='performance-table'>
                            <thead>
                                <tr className='text-bold'>
                                    <th style={{ width: '40px' }}>Sl.No</th>
                                    <th style={{ width: '180px' }}>Examination</th>
                                    {getSubjects(report.AMST_Id).map((s, i) => (
                                        <th key={i} style={{ fontSize: '9px' }}>
                                            {s.substring(0, 5).toUpperCase()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {getExams(report.AMST_Id).map((exam, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td className='text-left'>{exam}</td>
                                        {getSubjects(report.AMST_Id).map((sub, j) => {
                                            const mark = (data?.examwisemarksprocess1 || []).find(
                                                (m: any) =>
                                                    m.AMST_Id === report.AMST_Id &&
                                                    m.EME_ExamName === exam &&
                                                    m.TTMSUAB_Abbreviation === sub
                                            );
                                            return <td key={j}>{mark ? `${mark.ESTMPS_ObtainedMarks}/${mark.ESTMPS_MaxMarks}` : ''}</td>;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ── FOOTER ── */}
                        <div style={{ border: '1px solid black', borderTop: 'none', padding: '5px', fontSize: '11px' }}>
                            <div>
                                Teacher&apos;s Remarks : <span className='text-bold'>{report.remarks || ''}</span>
                            </div>
                            <div
                                style={{
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    padding: '0 50px 10px 50px'
                                }}>
                                <div className='text-bold'>CLASS TEACHER</div>
                                <div className='text-bold'>PRINCIPAL</div>
                                <div className='text-bold'>PARENT</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
