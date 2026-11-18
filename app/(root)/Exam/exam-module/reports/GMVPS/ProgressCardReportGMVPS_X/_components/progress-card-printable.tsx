'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    reportData: any[];
    saveList: any[];
    extraData: any;
    institution: any;
    examName: string;
    examCode: string;
    year: string;
}

/* ---------- Performance Chart Component ---------- */
function PerformanceChart({
    studentId,
    saveList,
    extraData,
    onChartReady
}: {
    studentId: number;
    saveList: any[];
    extraData: any;
    onChartReady?: (id: number, dataUrl: string) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const studentMarks = saveList.filter(
            (m) =>
                (m.amsT_Id ?? m.AMST_Id ?? m.studentId) === studentId && (m.eyceS_AplResultFlg === true || m.eyceS_AplResultFlg === 'true')
        );
        if (studentMarks.length === 0) return;

        const labels = studentMarks.map((m) => m.ismS_SubjectName || m.ISMS_SubjectName || m.subjectName);
        const studentScores = studentMarks.map((m) => m.estmpS_ObtainedMarks ?? m.obtainedMarks ?? m.ObtainedMarks ?? 0);
        const classAverages = studentMarks.map(
            (m) => m.estmpS_ClassAverage ?? m.classAverage ?? m.class_average ?? m.classAverageMarks ?? 0
        );

        const loadChart = async () => {
            const ChartJS = (await import('chart.js/auto')).default;

            const chart = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Student Score',
                            data: studentScores,
                            backgroundColor: 'rgba(236,102,32,255)',
                            borderColor: 'black',
                            borderWidth: 1
                        },
                        {
                            label: 'Class Average',
                            data: classAverages,
                            backgroundColor: 'rgba(3,157,217,255)',
                            borderColor: 'black',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { font: { weight: 'bold' } }
                        },
                        x: {
                            ticks: {
                                maxRotation: 30,
                                minRotation: 30,
                                font: { weight: 'bold', size: 10 }
                            }
                        }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true }
                    },
                    animation: {
                        duration: 1000,
                        onComplete: () => {
                            if (onChartReady && canvasRef.current) {
                                onChartReady(studentId, canvasRef.current.toDataURL());
                            }
                        }
                    }
                }
            });

            return () => chart.destroy();
        };
        loadChart();
    }, [studentId, saveList, extraData, onChartReady]);

    return (
        <div className='chart-container-screen' style={{ width: '500px', height: '300px', margin: '0 auto' }}>
            <canvas ref={canvasRef} id={`pieChart${studentId}`} />
        </div>
    );
}

/* ---------- Main Printable Component ---------- */
export default function ProgressCardPrintView({ reportData, saveList, extraData, institution, examName, examCode, year }: Props) {
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            const months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ];
            return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <style jsx global>{`
                .gmvps-report {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                    background: white;
                }
                .gmvps-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .gmvps-table th, .gmvps-table td {
                    border: 1px solid black;
                    padding: 4px 8px;
                    text-align: center;
                    font-size: 14px;
                }
                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                .margin-top-10 { margin-top: 10px; }
                .margin-top-15 { margin-top: 15px; }
                .margin-top-100 { margin-top: 100px; }

                @media print {
                    /* Completely hide non-printed elements so they occupy 0px space */
                    header, footer, nav, form, section:has(form),
                    [class*="navigation"], [class*="navbar"], [class*="footer"], 
                    [class*="stability"], [class*="chatbot"], [class*="Toaster"],
                    .no-print { 
                        display: none !important; 
                    }
                    
                    body { 
                        background: white !important; 
                        -webkit-print-color-adjust: exact;
                        visibility: hidden !important;
                    }
                    
                    /* Reset flex and layout wrapper margins/paddings on print */
                    html, body, main, 
                    body :has(#print-area),
                    div[class*="flex"], 
                    div[class*="min-h-screen"],
                    .flex-1 {
                        margin: 0 !important;
                        padding: 0 !important;
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                        box-shadow: none !important;
                        transform: none !important;
                        gap: 0 !important;
                    }
                    
                    #print-area,
                    #print-area * {
                        visibility: visible !important;
                    }
                    
                    #print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    .page-break { 
                        page-break-before: always !important; 
                        break-before: page !important;
                    }
                    
                    @page { 
                        size: A4 portrait; 
                        margin: 15mm 10mm 15mm 10mm; 
                    }
                    canvas, .chart-container-screen { display: none !important; }
                    .print-chart-image { display: block !important; }
                }
            `}</style>

            <div id='print-area' className='gmvps-report'>
                {reportData.map((report, idx) => {
                    const studentID = report.amsT_Id ?? report.AMST_Id ?? report.studentId;
                    const studentMarks = saveList.filter(
                        (m) =>
                            (m.amsT_Id ?? m.AMST_Id ?? m.studentId) === studentID &&
                            (m.eyceS_AplResultFlg === true || m.eyceS_AplResultFlg === 'true')
                    );
                    const healthData = (extraData.exammastername || []).find(
                        (h: any) => (h.AMST_Id ?? h.amsT_Id ?? h.studentId) === studentID
                    );
                    const workAttend = (extraData.work_attendence || []).find(
                        (a: any) => (a.AMST_Id ?? a.amsT_Id ?? a.studentId) === studentID
                    );
                    const presentAttend = (extraData.present_attendence || []).find(
                        (a: any) => (a.AMST_Id ?? a.amsT_Id ?? a.studentId) === studentID
                    );

                    return (
                        <div key={studentID} className={idx > 0 ? 'page-break' : ''}>
                            {/* Header Image */}
                            <div className='text-center'>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg'
                                    alt='Header'
                                    style={{ width: '99%', marginBottom: '10px' }}
                                />
                            </div>

                            {/* Student Info Section */}
                            <div className='flex' style={{ padding: '0 15px' }}>
                                <div style={{ flex: 3 }}>
                                    <div className='flex py-1'>
                                        <div style={{ width: '150px' }} className='font-bold'>
                                            Name
                                        </div>
                                        <div style={{ width: '20px' }}>:</div>
                                        <div className='font-bold'>{report.amsT_FirstName || report.studentName || report.studentname}</div>
                                    </div>
                                    <div className='flex py-1'>
                                        <div style={{ width: '150px' }} className='font-bold'>
                                            Admission No
                                        </div>
                                        <div style={{ width: '20px' }}>:</div>
                                        <div className='font-bold'>
                                            {report.amsT_AdmNo || report.admissionNo || report.admNo || report.admno}
                                        </div>
                                    </div>
                                    <div className='flex py-1'>
                                        <div style={{ width: '150px' }} className='font-bold'>
                                            Class & Section
                                        </div>
                                        <div style={{ width: '20px' }}>:</div>
                                        <div className='font-bold'>
                                            {report.asmcL_ClassName || report.className || ''} -{' '}
                                            {report.asmC_SectionName || report.sectionName || ''}
                                        </div>
                                    </div>
                                    <div className='flex py-1'>
                                        <div style={{ width: '150px' }} className='font-bold'>
                                            Date of Birth
                                        </div>
                                        <div style={{ width: '20px' }}>:</div>
                                        <div className='font-bold'>{formatDate(report.amsT_DOB || report.dob)}</div>
                                    </div>
                                    <div className='flex py-1'>
                                        <div style={{ width: '150px' }} className='font-bold'>
                                            Mother's Name
                                        </div>
                                        <div style={{ width: '20px' }}>:</div>
                                        <div className='font-bold'>{report.amsT_MotherName || report.motherName || report.mothername}</div>
                                    </div>
                                    <div className='flex py-1'>
                                        <div style={{ width: '150px' }} className='font-bold'>
                                            Father's Name
                                        </div>
                                        <div style={{ width: '20px' }}>:</div>
                                        <div className='font-bold'>{report.amsT_FatherName || report.fatherName || report.fathername}</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }} className='text-right'>
                                    <img
                                        src={report.amsT_Photoname || report.photo || '/placeholder-user.png'}
                                        alt='Student'
                                        style={{ width: '140px', height: '140px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>

                            {/* Exam Name Banner */}
                            <div className='margin-top-10 text-center'>
                                <h3 className='font-bold' style={{ fontSize: '20px', textTransform: 'uppercase' }}>
                                    {examName} - {year}
                                </h3>
                            </div>

                            {/* Marks Table */}
                            <div className='margin-top-10' style={{ padding: '0 15px' }}>
                                <table className='gmvps-table'>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} style={{ width: '50px' }}>
                                                SL No
                                            </th>
                                            <th colSpan={2} rowSpan={2}>
                                                SUBJECT
                                            </th>
                                            <th colSpan={3}>{examName}</th>
                                        </tr>
                                        <tr>
                                            <th>MAXIMUM MARK</th>
                                            <th>MARKS OBTAINED</th>
                                            <th>GRADE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentMarks.map((mark, mIdx) => (
                                            <tr key={mark.ismS_Id ?? mark.ISMS_Id ?? mIdx}>
                                                <td>{mIdx + 1}</td>
                                                <td colSpan={2} className='text-left font-bold'>
                                                    {mark.ismS_SubjectName ?? mark.subjectName ?? mark.ISMS_SubjectName}
                                                </td>
                                                <td>{mark.maxMarks ?? mark.MaxMarks ?? mark.estmpS_MaxMarks ?? mark.Max_Marks ?? 0}</td>
                                                <td>
                                                    {mark.passFailFlag === 'AB' ||
                                                    mark.PassFailFlag === 'AB' ||
                                                    mark.estmpS_PassFailFlg === 'AB'
                                                        ? (mark.ismS_SubjectCode || mark.subjectCode || '') === 'SE'
                                                            ? '-'
                                                            : 'AB'
                                                        : (mark.obtainedMarks ?? mark.ObtainedMarks ?? mark.estmpS_ObtainedMarks ?? '-')}
                                                </td>
                                                <td>
                                                    {mark.passFailFlag === 'AB' ||
                                                    mark.PassFailFlag === 'AB' ||
                                                    mark.estmpS_PassFailFlg === 'AB'
                                                        ? 'AB'
                                                        : (mark.obtainedGrade ??
                                                          mark.ObtainedGrade ??
                                                          mark.estmpS_ObtainedGrade ??
                                                          mark.grade ??
                                                          '-')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Scholastic Grading Scale */}
                            <div className='margin-top-15' style={{ padding: '0 15px' }}>
                                <h4 className='text-center font-bold'>
                                    <u>SCHOLASTIC GRADING SCALE</u>
                                </h4>
                                <table className='gmvps-table margin-top-10'>
                                    <thead>
                                        <tr className='font-bold'>
                                            <th>Grade</th>
                                            <th>A1</th>
                                            <th>A2</th>
                                            <th>B1</th>
                                            <th>B2</th>
                                            <th>C1</th>
                                            <th>C2</th>
                                            <th>D</th>
                                            <th>E</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='font-bold'>Mark</td>
                                            <td>91-100</td>
                                            <td>81-90</td>
                                            <td>71-80</td>
                                            <td>61-70</td>
                                            <td>51-60</td>
                                            <td>41-50</td>
                                            <td>33-40</td>
                                            <td>0-32</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Performance Index Graph */}
                            <div className='margin-top-10' style={{ padding: '0 15px' }}>
                                <h4 className='text-center font-bold'>
                                    <u>STUDENT PERFORMANCE INDEX</u>
                                </h4>
                                <div className='margin-top-10 text-center'>
                                    <div className='inline-block'>
                                        <PerformanceChart
                                            studentId={studentID}
                                            saveList={saveList}
                                            extraData={extraData}
                                            onChartReady={handleChartReady}
                                        />
                                        {chartImages[studentID] && (
                                            <img
                                                className='print-chart-image'
                                                src={chartImages[studentID]}
                                                alt='Chart'
                                                style={{
                                                    display: 'none',
                                                    width: '500px',
                                                    height: '300px',
                                                    margin: '0 auto',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Page Break for co-scholastic if needed or just keep going */}
                            <div className='page-break-before' style={{ padding: '20px 15px' }}>
                                <div className='text-center'>
                                    <h4 className='font-bold'>
                                        <u>CO-SCHOLASTIC ACTIVITIES</u>
                                    </h4>
                                </div>
                                {(report.activity_main_list_area || []).map((acti: any) => (
                                    <div key={acti.ECACT_Id} className='margin-top-10'>
                                        <h4 className='text-center font-bold'>{acti.ECACT_SkillName}</h4>
                                        <table className='gmvps-table margin-top-10'>
                                            <thead>
                                                <tr style={{ backgroundColor: '#BABABA' }}>
                                                    <th className='text-left'>Particulars</th>
                                                    <th>Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(extraData.getstudentwiseactiviteslist || [])
                                                    .filter(
                                                        (g: any) =>
                                                            (g.AMST_Id ?? g.amsT_Id ?? g.studentId) === studentID &&
                                                            acti.ECACT_Id === g.ECACT_Id
                                                    )
                                                    .map((grade: any, gIdx: number) => (
                                                        <tr key={gIdx}>
                                                            <td className='text-left font-bold'>{grade.ECACTA_SkillArea}</td>
                                                            <td>{grade.EMGD_Name}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                {/* Health Status */}
                                <div className='margin-top-15 text-center'>
                                    <h4 className='font-bold'>
                                        <u>Health Status</u>
                                    </h4>
                                    <table className='gmvps-table margin-top-10'>
                                        <thead>
                                            <tr>
                                                <th>Height (in cm)</th>
                                                <th>Weight (in Kg)</th>
                                                <th>Blood Group</th>
                                                <th>Dental Hygiene</th>
                                                <th>Vision (Right & Left)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{healthData?.SPCCSHW_Height ?? report.height ?? report.SPCCSHW_Height ?? '-'}</td>
                                                <td>{healthData?.SPCCSHW_Weight ?? report.weight ?? report.SPCCSHW_Weight ?? '-'}</td>
                                                <td>
                                                    {healthData?.AMST_BloodGroup ??
                                                        report.bloodGroup ??
                                                        report.bloodgroup ??
                                                        report.AMST_BloodGroup ??
                                                        '-'}
                                                </td>
                                                <td>
                                                    {healthData?.HMDNHY_DentalHygiene ??
                                                        report.dentalHygiene ??
                                                        report.dentalhygiene ??
                                                        report.HMDNHY_DentalHygiene ??
                                                        '-'}
                                                </td>
                                                <td>
                                                    {healthData?.HMVSN_VisionHygiene ??
                                                        report.visionHygiene ??
                                                        report.visionhygiene ??
                                                        report.HMVSN_VisionHygiene ??
                                                        '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Attendance Details */}
                                <div className='margin-top-15'>
                                    <h4 className='text-center font-bold'>
                                        <u>ATTENDANCE DETAILS</u>
                                    </h4>
                                    <table className='gmvps-table margin-top-10'>
                                        <tbody>
                                            <tr>
                                                <td style={{ backgroundColor: '#BABABA', width: '25%' }} className='font-bold'>
                                                    Total number of
                                                    <br />
                                                    working days
                                                </td>
                                                <td style={{ width: '8%' }} className='font-bold'>
                                                    {workAttend?.TotalSchoolDays ??
                                                        presentAttend?.totalSchoolDays ??
                                                        workAttend?.totalSchoolDays ??
                                                        workAttend?.TotalWorkingDays ??
                                                        ''}
                                                </td>
                                                <td style={{ backgroundColor: '#BABABA', width: '25%' }} className='font-bold'>
                                                    Number of days
                                                    <br />
                                                    attended
                                                </td>
                                                <td style={{ width: '8%' }} className='font-bold'>
                                                    {presentAttend?.TotalPresentDays ??
                                                        presentAttend?.totalWorkingDays ??
                                                        presentAttend?.totalPresentDays ??
                                                        ''}
                                                </td>
                                                <td style={{ backgroundColor: '#BABABA', width: '25%' }} className='font-bold'>
                                                    Attendance
                                                    <br />
                                                    Percentage
                                                </td>
                                                <td style={{ width: '9%' }} className='font-bold'>
                                                    {presentAttend?.Total_Percentage || ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures */}
                                <div className='margin-top-100 flex justify-between' style={{ padding: '0 15px' }}>
                                    <div className='text-left'>
                                        <img
                                            src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/7ca4aa81-6797-481d-aa9e-c2ae85080ed8.jpg'
                                            alt='Principal Signature'
                                            style={{ width: '150px' }}
                                        />
                                    </div>
                                    <div className='text-center'></div>
                                    <div className='text-right' style={{ width: '150px' }}></div>
                                </div>
                                <div className='margin-top-10 flex justify-between font-bold' style={{ padding: '0 15px' }}>
                                    <div className='text-left' style={{ width: '200px' }}>
                                        Principal’s Signature
                                    </div>
                                    <div className='text-center' style={{ width: '200px' }}>
                                        Institution Seal
                                    </div>
                                    <div className='text-right' style={{ width: '200px' }}>
                                        {extraData.classTeachers?.[idx]?.hrmE_EmployeeFirstName && (
                                            <p className='mb-1 text-center font-bold uppercase italic underline'>
                                                {extraData.classTeachers[idx].hrmE_EmployeeFirstName}
                                            </p>
                                        )}
                                        <p className='text-center'>Class Teacher’s Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
