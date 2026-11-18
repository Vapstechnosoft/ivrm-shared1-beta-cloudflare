'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    data: any;
    date: string;
    onPrint?: () => void;
}

/* ---------- Performance Chart Component ---------- */
function PerformanceChart({
    studentId,
    chartData,
    onChartReady
}: {
    studentId: number;
    chartData?: { subjects: string[]; marks: number[]; highest: number[]; average: number[] };
    onChartReady?: (id: number, dataUrl: string) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current || !chartData || chartData.subjects.length === 0) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const loadChart = async () => {
            const ChartJS = (await import('chart.js/auto')).default;

            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const colorMark = '#8b4513'; // Bronze/Brown
            const colorHighest = '#808000'; // Olive
            const colorAverage = '#008000'; // Green

            // Custom plugin to draw labels on top of bars
            const dataLabelsPlugin = {
                id: 'dataLabels',
                afterDatasetsDraw(chart: any) {
                    const { ctx } = chart;
                    ctx.save();
                    ctx.font = 'bold 9px Arial';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    chart.data.datasets.forEach((dataset: any, i: number) => {
                        chart.getDatasetMeta(i).data.forEach((bar: any, index: number) => {
                            const value = dataset.data[index];
                            if (value !== null && value !== undefined) {
                                ctx.fillText(value, bar.x, bar.y - 2);
                            }
                        });
                    });
                    ctx.restore();
                }
            };

            chartInstanceRef.current = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.subjects,
                    datasets: [
                        {
                            label: 'M.O',
                            data: chartData.marks,
                            backgroundColor: colorMark,
                            borderWidth: 0,
                            barThickness: 15
                        },
                        {
                            label: 'Highest',
                            data: chartData.highest,
                            backgroundColor: colorHighest,
                            borderWidth: 0,
                            barThickness: 15
                        },
                        {
                            label: 'Average',
                            data: chartData.average,
                            backgroundColor: colorAverage,
                            borderWidth: 0,
                            barThickness: 15
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { font: { size: 9, weight: 'bold' }, color: '#000', maxRotation: 45, minRotation: 0 },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { font: { size: 10, weight: 'bold' }, color: '#000', stepSize: 10 }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 10,
                                font: { size: 9, weight: 'bold' },
                                color: '#000'
                            }
                        },
                        tooltip: { enabled: true }
                    },
                    animation: {
                        duration: 500,
                        onComplete: () => {
                            if (onChartReady && canvasRef.current) {
                                onChartReady(studentId, canvasRef.current.toDataURL());
                            }
                        }
                    }
                },
                plugins: [dataLabelsPlugin]
            });
        };
        loadChart();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData, studentId, onChartReady]);

    if (!chartData || chartData.subjects.length === 0) return null;

    return (
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
            <canvas ref={canvasRef} id={`pieChart${studentId}`} style={{ maxWidth: '100%', height: '300px' }} />
        </div>
    );
}

export default function BurnpurProgressCardReport({ data, date, onPrint }: Props) {
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseactiviteslist = [],
        getexammaxmarks = [],
        getinstitution = [],
        getpromotionremarksdetails = [],
        work_attendence = [],
        present_attendence = [],
        getgroupdetails = [],
        getgroupexamdetails = []
    } = data;

    const MI_id = getinstitution?.[0]?.mI_Id || getinstitution?.[0]?.MI_Id;

    // Logic from legacy JS to group exams
    const groupwiseexamlist = useMemo(() => {
        const list: any[] = [];
        getgroupexamdetails.forEach((d: any) => {
            if (d.empS_AppToResultFlg === true || d.EMPS_AppToResultFlg === true) {
                list.push({
                    EME_Id: d.emE_Id || d.EME_Id,
                    EME_ExamName: d.emE_ExamName || d.EME_ExamName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs || d.EMPSGE_ForMaxMarkrs,
                    EME_Marks: 'Marks'
                });
            }
        });
        list.push({ EME_Id: 9800000, EME_ExamName: 'Marks Obtained', EME_Marks: 'Total' });
        list.push({ EME_Id: 9800001, EME_ExamName: 'Grades', EME_Marks: 'Grade' });
        return list;
    }, [getgroupexamdetails]);

    const groupwiseexamlist_temp = useMemo(() => {
        const list: any[] = [];
        getgroupexamdetails.forEach((d: any) => {
            if (d.empS_AppToResultFlg === false || d.EMPS_AppToResultFlg === false) {
                list.push({
                    EME_Id: d.emE_Id || d.EME_Id,
                    EME_ExamName: d.emE_ExamName || d.EME_ExamName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs || d.EMPSGE_ForMaxMarkrs,
                    EME_Marks: 'Marks'
                });
            }
        });
        list.push({ EME_Id: 9800000, EME_ExamName: 'Marks Obtained', EME_Marks: 'Total' });
        list.push({ EME_Id: 9800001, EME_ExamName: 'Grades', EME_Marks: 'Grade' });
        return list;
    }, [getgroupexamdetails]);

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => {
            if (prev[id] === dataUrl) return prev;
            return { ...prev, [id]: dataUrl };
        });
    }, []);

    const handlePrintClick = useCallback(() => {
        getstudentdetails.forEach((stu: any) => {
            const amstId = stu.amsT_Id || stu.AMST_Id;
            const canvas = document.getElementById(`pieChart${amstId}`) as HTMLCanvasElement;
            if (canvas) {
                setChartImages((prev) => {
                    const dataUrl = canvas.toDataURL();
                    if (prev[amstId] === dataUrl) return prev;
                    return { ...prev, [amstId]: dataUrl };
                });
            }
        });
        setTimeout(() => {
            if (onPrint) onPrint();
            else window.print();
        }, 300);
    }, [getstudentdetails, onPrint]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    };

    const studentsChartData = useMemo(() => {
        const dataMap: Record<number, any> = {};
        getstudentdetails.forEach((stu: any) => {
            const amstId = stu.amsT_Id || stu.AMST_Id;
            const studentSubjects = getstudentwisesubjectlist.filter((s: any) => (s.amsT_Id || s.AMST_Id) === amstId);
            dataMap[amstId] = {
                subjects: studentSubjects.map((s: any) => s.subjectName || s.ismS_SubjectName),
                marks: studentSubjects.map((s: any) => s.obtainedMarks || s.ESTMPPS_ObtainedMarks || 0),
                highest: studentSubjects.map((s: any) => s.classHighest || s.ESTMPPS_ClassHighest || 0),
                average: studentSubjects.map((s: any) => s.classAverage || s.ESTMPPS_ClassAverage || 0)
            };
        });
        return dataMap;
    }, [getstudentdetails, getstudentwisesubjectlist]);

    return (
        <>
            <style jsx global>{`
                .burnpur-report { font-family: 'Source Sans Pro', sans-serif; color: black; line-height: 1.4; }
                .burnpur-table { width: 100%; border-collapse: collapse; margin-bottom: 0px; }
                .burnpur-table th, .burnpur-table td { border: 1px solid black; padding: 4px; text-align: center; font-size: 14px; }
                .burnpur-banner { background-color: #f3cb04 !important; color: black !important; font-weight: bold; text-align: center; }
                .burnpur-card { border: 15px solid #f3cb04 !important; padding: 20px; margin-bottom: 80px; background: white; }
                .burnpur-no-border { border: none !important; }
                .burnpur-text-left { text-align: left !important; }
                .burnpur-text-center { text-align: center !important; }
                .burnpur-chart-image { display: none; }
                
                @media print {
                    body * { visibility: hidden; }
                    #burnpur-print-area, #burnpur-print-area * { visibility: visible; }
                    #burnpur-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .burnpur-card { border: 15px solid #f3cb04 !important; page-break-after: always; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .burnpur-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .burnpur-chart-canvas { display: none; }
                    .burnpur-chart-image { display: block !important; max-width: 100%; height: auto; }
                }
            `}</style>

            <div className='no-print my-4 flex justify-end'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print
                </Button>
            </div>

            <div id='burnpur-print-area' className='burnpur-report'>
                {getstudentdetails.map((stu: any) => {
                    const amstId = stu.amsT_Id || stu.AMST_Id;
                    const studentMarks = getstudentmarksdetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === amstId);
                    const studentSubjects = getstudentwisesubjectlist.filter((s: any) => (s.amsT_Id || s.AMST_Id) === amstId);

                    console.log('studentSubjects', studentSubjects);
                    const studentActivities = getstudentwiseactiviteslist.filter((a: any) => (a.amsT_Id || a.AMST_Id) === amstId);

                    const attWork = work_attendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === amstId);
                    const attPres = present_attendence.find((a: any) => (a.amsT_Id || a.AMST_Id) === amstId);
                    const remarks = getpromotionremarksdetails.find((r: any) => (r.amsT_Id || r.AMST_Id) === amstId);

                    return (
                        <div key={amstId} className='burnpur-card'>
                            {/* Header Images */}
                            <div className='text-center'>
                                <img
                                    src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/551c9ec7-4251-4a99-9b91-f96a751dab18.jpg'
                                    style={{ width: '87%', margin: '0 auto' }}
                                    alt='Header'
                                />
                            </div>

                            <div className='mt-4 flex justify-center'>
                                <div
                                    className='burnpur-banner'
                                    style={{
                                        width: '30%',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                    <b>PROGRESS REPORT</b>
                                </div>
                            </div>

                            {/* Header Banner */}
                            <div className='mt-2'>
                                <div
                                    className='burnpur-banner'
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px'
                                    }}>
                                    <h3 style={{ margin: 0 }}>
                                        <b>
                                            HALF-YEARLY : {new Date(date).getFullYear()}-{new Date(date).getFullYear() + 1}
                                        </b>
                                    </h3>
                                </div>
                            </div>

                            {/* Student Info Table */}
                            <table
                                className='burnpur-table burnpur-no-border mt-4'
                                style={{ width: '100%', lineHeight: '2.2', border: '1px solid black' }}>
                                <tbody>
                                    <tr className='burnpur-no-border'>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>Name : {stu.studentName || stu.studentname}</b>
                                        </td>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>
                                                Class & Section : {stu.className || stu.classname} - {stu.sectionName || stu.sectionname}
                                            </b>
                                        </td>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>Admn. No. : {stu.admissionNo || stu.admno}</b>
                                        </td>
                                    </tr>
                                    <tr className='burnpur-no-border'>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>Mother&apos;s Name : {stu.motherName || stu.mothername}</b>
                                        </td>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>
                                                Date of Birth :{' '}
                                                {stu.dob
                                                    ? stu.dob.includes('/')
                                                        ? stu.dob
                                                        : new Date(stu.dob).toLocaleDateString('en-GB')
                                                    : ''}
                                            </b>
                                        </td>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>Roll No : {stu.rollNo || stu.rollno}</b>
                                        </td>
                                    </tr>
                                    <tr className='burnpur-no-border'>
                                        <td className='burnpur-no-border burnpur-text-left p-2'>
                                            <b>Father&apos;s Name : {stu.fatherName || stu.fathername}</b>
                                        </td>
                                        <td className='burnpur-no-border burnpur-text-left p-2' colSpan={2}>
                                            <b>House : {stu.SPCCMH_HouseName || stu.house || '-'}</b>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Scholastic Areas - Group 1 */}
                            <div className='mt-4'>
                                <table className='burnpur-table'>
                                    <thead>
                                        <tr>
                                            <th
                                                className='burnpur-banner burnpur-text-left'
                                                style={{ fontSize: '16px' }}
                                                colSpan={groupwiseexamlist.length + 1}>
                                                ACADEMIC PERFORMANCE - SCHOLASTIC AREAS (HALF YEARLY)
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className='burnpur-banner burnpur-text-left' style={{ width: '31%' }}>
                                                SUBJECTS
                                            </th>
                                            {groupwiseexamlist.map((exam: any, eIdx: number) => (
                                                <th key={eIdx} className='burnpur-banner' style={{ width: '12%' }}>
                                                    {exam.EME_ExamName}
                                                    <br />
                                                    {exam.EME_Id !== 9800000 && exam.EME_Id !== 9800001
                                                        ? exam.EMPSGE_ForMaxMarkrs
                                                            ? `(${exam.EMPSGE_ForMaxMarkrs})`
                                                            : ''
                                                        : exam.EME_Id === 9800000
                                                          ? '(100)'
                                                          : ''}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSubjects
                                            .filter((s: any) => s.empS_AppToResultFlg === true || s.EMPS_AppToResultFlg === true)
                                            .map((subj: any, sIdx: number) => (
                                                <tr key={sIdx}>
                                                    <td className='burnpur-text-left'>
                                                        &nbsp;<b>{subj.subjectName || subj.ISMS_SubjectName}</b>
                                                    </td>
                                                    {groupwiseexamlist.map((exam: any, eIdx: number) => {
                                                        if (exam.EME_Id === 9800000) {
                                                            return (
                                                                <td key={eIdx}>
                                                                    <b>{subj.subjectObtainedMarks || subj.ESTMPPS_ObtainedMarks}</b>
                                                                </td>
                                                            );
                                                        }
                                                        if (exam.EME_Id === 9800001) {
                                                            return (
                                                                <td key={eIdx}>
                                                                    <b>{subj.subjectGrade || subj.ESTMPPS_ObtainedGrade}</b>
                                                                </td>
                                                            );
                                                        }
                                                        const mark = studentMarks.find(
                                                            (m: any) =>
                                                                (m.ismS_Id || m.ISMS_Id) === (subj.ismS_Id || subj.ISMS_Id) &&
                                                                (m.emE_Id || m.EME_Id) === exam.EME_Id
                                                        );
                                                        return (
                                                            <td key={eIdx}>
                                                                {mark ? (
                                                                    mark.PassFailFlag === 'AB' ||
                                                                    mark.passFailFlag === 'AB' ||
                                                                    mark.PassFailFlag === 'M' ||
                                                                    mark.PassFailFlag === 'L' ? (
                                                                        mark.PassFailFlag || mark.passFailFlag
                                                                    ) : exam.EME_Marks === 'Grade' ? (
                                                                        <b>{mark.obtainedGrade || mark.ObtainedGrade}</b>
                                                                    ) : (
                                                                        <b>{mark.obtainedMarks || mark.ObtainedMarks}</b>
                                                                    )
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Scholastic Areas - Group 2 */}
                            {studentSubjects.some((s: any) => s.empS_AppToResultFlg === false || s.EMPS_AppToResultFlg === false) && (
                                <div className='mt-4'>
                                    <table className='burnpur-table'>
                                        <thead>
                                            <tr>
                                                <th className='burnpur-banner burnpur-text-left' style={{ width: '64%' }}>
                                                    SUBJECTS
                                                </th>
                                                <th className='burnpur-banner' style={{ width: '18%' }}>
                                                    Marks Obtained
                                                    <br />
                                                    (100)
                                                </th>
                                                <th className='burnpur-banner' style={{ width: '18%' }}>
                                                    Grades
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects
                                                .filter((s: any) => s.empS_AppToResultFlg === false || s.EMPS_AppToResultFlg === false)
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='burnpur-text-left'>
                                                            &nbsp;<b>{subj.subjectName || subj.ISMS_SubjectName}</b>
                                                        </td>
                                                        <td>
                                                            <b>{subj.subjectObtainedMarks || subj.ESTMPPS_ObtainedMarks}</b>
                                                        </td>
                                                        <td>
                                                            <b>{subj.subjectGrade || subj.ESTMPPS_ObtainedGrade}</b>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Co-Scholastic and Performance Analysis */}
                            <div className='mt-4 flex' style={{ minHeight: '350px' }}>
                                {/* Co-Scholastic (Left) */}
                                <div style={{ width: '48%', border: '1px solid black' }}>
                                    <table className='burnpur-table' style={{ height: '100%', border: 'none' }}>
                                        <thead>
                                            <tr className='burnpur-banner'>
                                                <th className='burnpur-text-left p-2' style={{ width: '70%', fontSize: '16px' }}>
                                                    <b>CO-SCHOLASTIC AREAS (HALF YEARLY)</b>
                                                </th>
                                                <th className='p-2' style={{ fontSize: '16px' }}>
                                                    <b>GRADES</b>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentActivities.map((act: any, aIdx: number) => (
                                                <tr key={aIdx} style={{ border: 'none' }}>
                                                    <td className='burnpur-text-left p-2' style={{ border: 'none' }}>
                                                        &nbsp;<b>{act.ECACTA_SkillArea || act.skillArea}</b>
                                                    </td>
                                                    <td className='p-2' style={{ border: 'none' }}>
                                                        <b>{act.EMGD_Name || act.skillGrade}</b>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Padding rows */}
                                            {[...Array(Math.max(0, 8 - studentActivities.length))].map((_, i) => (
                                                <tr key={i} style={{ border: 'none' }}>
                                                    <td style={{ border: 'none' }}>&nbsp;</td>
                                                    <td style={{ border: 'none' }}>&nbsp;</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ width: '4%' }}></div>

                                {/* Performance Analysis (Right) */}
                                <div style={{ width: '48%', border: '1px solid black' }}>
                                    <div className='burnpur-banner burnpur-text-left p-2' style={{ fontSize: '16px' }}>
                                        PERFORMANCE ANALYSIS
                                    </div>
                                    <div className='p-2'>
                                        <div className='burnpur-chart-canvas'>
                                            <PerformanceChart
                                                studentId={amstId}
                                                chartData={studentsChartData[amstId]}
                                                onChartReady={handleChartReady}
                                            />
                                        </div>
                                        {chartImages[amstId] && (
                                            <img src={chartImages[amstId]} className='burnpur-chart-image' alt='Chart' />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Attendance and Remarks */}
                            <div className='mt-4'>
                                <table className='burnpur-table'>
                                    <tbody>
                                        <tr>
                                            <td className='burnpur-banner burnpur-text-left p-2' style={{ width: '25%' }}>
                                                <b>ATTENDANCE</b>
                                            </td>
                                            <td className='burnpur-text-left p-2' style={{ width: '75%' }}>
                                                <b>
                                                    &nbsp;{attPres?.TotalPresentDays || 0}/{attWork?.TotalSchoolDays || 0}
                                                </b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='burnpur-banner burnpur-text-left p-2'>
                                                <b>REMARKS</b>
                                            </td>
                                            <td className='burnpur-text-left p-2'>&nbsp;{remarks?.ecterE_Remarks || ''}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures */}
                            <div className='mt-10 flex items-end justify-between' style={{ minHeight: '120px' }}>
                                <div className='text-center' style={{ width: '30%' }}>
                                    <div className='mb-4'>
                                        <b>Date: {formatDate(date)}</b>
                                    </div>
                                    <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                        <b>Class Teacher</b>
                                    </div>
                                </div>
                                <div className='text-center' style={{ width: '30%' }}>
                                    {MI_id === 73 ? (
                                        <img
                                            src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/d2192018-7b22-466e-808e-b9943751ca13.png'
                                            alt='Stamp'
                                            style={{ width: '150px' }}
                                        />
                                    ) : (
                                        <div style={{ height: '80px' }}></div>
                                    )}
                                    <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                        <b>School Seal</b>
                                    </div>
                                </div>
                                <div className='text-center' style={{ width: '30%' }}>
                                    <div style={{ height: '80px' }}></div>
                                    <div style={{ borderTop: '1px solid black', paddingTop: '5px' }}>
                                        <b>Principal</b>
                                    </div>
                                </div>
                            </div>

                            {/* Grading Scales */}
                            <div className='mt-10'>
                                <table className='burnpur-table'>
                                    <thead>
                                        <tr className='burnpur-banner'>
                                            <th colSpan={4}>Co-Scholastic Grade Scale</th>
                                            <th colSpan={2}>Scholastic Grade Scale</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            {
                                                g: 'A',
                                                art: 'Exemplary',
                                                pts: '4.1 - 5.0',
                                                hpe: 'Outstanding',
                                                range: '91 - 100',
                                                sGrade: 'A1'
                                            },
                                            {
                                                g: 'B',
                                                art: 'Proficient',
                                                pts: '3.1 - 4.0',
                                                hpe: 'Very Good',
                                                range: '81 - 90',
                                                sGrade: 'A2'
                                            },
                                            { g: 'C', art: 'Developing', pts: '2.1 - 3.0', hpe: 'Good', range: '71 - 80', sGrade: 'B1' },
                                            { g: 'D', art: 'Emerging', pts: '1.1 - 2.0', hpe: 'Fair', range: '61 - 70', sGrade: 'B2' },
                                            {
                                                g: 'E',
                                                art: 'Beginner',
                                                pts: '0.1 - 1.0',
                                                hpe: 'Needs Improvement',
                                                range: '51 - 60',
                                                sGrade: 'C1'
                                            }
                                        ].map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td>
                                                    <b>{row.g}</b>
                                                </td>
                                                <td>{row.art}</td>
                                                <td>{row.pts}</td>
                                                <td>{row.hpe}</td>
                                                <td>{row.range}</td>
                                                <td>
                                                    <b>{row.sGrade}</b>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={4} rowSpan={3}></td>
                                            <td>41 - 50</td>
                                            <td>
                                                <b>C2</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>33 - 40</td>
                                            <td>
                                                <b>D</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>32 & Below</td>
                                            <td>
                                                <b>E</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
