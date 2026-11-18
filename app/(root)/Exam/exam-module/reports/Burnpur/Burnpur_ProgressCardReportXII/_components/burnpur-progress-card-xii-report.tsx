'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

    useEffect(() => {
        if (!canvasRef.current || !chartData || chartData.subjects.length === 0) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const loadChart = async () => {
            const ChartJS = (await import('chart.js/auto')).default;

            const chart = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.subjects,
                    datasets: [
                        {
                            label: 'M.O',
                            data: chartData.marks,
                            backgroundColor: 'rgba(160, 82, 45, 1)',
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1
                        },
                        {
                            label: 'Highest',
                            data: chartData.highest,
                            backgroundColor: 'rgba(255, 215, 0, 1)',
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1
                        },
                        {
                            label: 'Average',
                            data: chartData.average,
                            backgroundColor: 'rgba(124, 252, 0, 1)',
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { font: { size: 10 }, stepSize: 25 }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
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
    }, [chartData, studentId, onChartReady]);

    if (!chartData || chartData.subjects.length === 0) return null;

    return (
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
            <canvas ref={canvasRef} id={`pieChartXII${studentId}`} style={{ maxWidth: '100%', height: '300px' }} />
        </div>
    );
}

export default function BurnpurProgressCardXIIReport({ data, date, onPrint }: Props) {
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseactiviteslist = [],
        getexammaxmarks = [],
        gettermexamdetails = [],
        clstchname = []
    } = data;

    // Extract unique exams from marks details to build headers
    const groupwiseexamlist = Array.from(new Set(getstudentmarksdetails.map((m: any) => m.emE_Id)))
        .map((id) => {
            const m = getstudentmarksdetails.find((x: any) => x.emE_Id === id);
            return {
                EME_Id: id,
                EME_ExamName: m.emE_ExamName,
                EME_ExamOrder: m.emE_ExamOrder || 0
            };
        })
        .sort((a, b) => a.EME_ExamOrder - b.EME_ExamOrder);

    console.log('groupwiseexamlist: ', groupwiseexamlist);
    // Special columns
    const totalColId = 9800000;
    const gradeColId = 9800001;
    const highestColId = 9800002;

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    const handlePrintClick = useCallback(() => {
        getstudentdetails.forEach((stu: any) => {
            const canvas = document.getElementById(`pieChartXII${stu.amsT_Id}`) as HTMLCanvasElement;
            if (canvas) {
                setChartImages((prev) => ({ ...prev, [stu.amsT_Id]: canvas.toDataURL() }));
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
        return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    return (
        <>
            <style jsx global>{`
                .burnpur-xii-report { font-family: sans-serif; color: black; }
                .burnpur-xii-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .burnpur-xii-table th, .burnpur-xii-table td { border: 1px solid black; padding: 5px; text-align: center; }
                .burnpur-xii-banner { background-color: #f3cb04 !important; color: black !important; padding: 10px; text-align: center; font-weight: bold; }
                .burnpur-xii-card { border: 15px solid #f3cb04; padding: 20px; margin-bottom: 50px; background: white; }
                .burnpur-xii-no-border { border: none !important; }
                .burnpur-xii-text-left { text-align: left !important; }
                .burnpur-xii-chart-image { display: none; }
                
                @media print {
                    body * { visibility: hidden; }
                    #burnpur-xii-print-area, #burnpur-xii-print-area * { visibility: visible; }
                    #burnpur-xii-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .burnpur-xii-card { border: 15px solid #f3cb04 !important; page-break-after: always; }
                    .burnpur-xii-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .burnpur-xii-chart-canvas { display: none; }
                    .burnpur-xii-chart-image { display: block !important; maxWidth: 100%; height: auto; }
                }
            `}</style>

            <div className='no-print my-4 flex justify-end'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All
                </Button>
            </div>

            <div id='burnpur-xii-print-area' className='burnpur-xii-report'>
                {getstudentdetails.map((stu: any, idx: number) => {
                    const studentMarks = getstudentmarksdetails.filter((m: any) => m.amsT_Id === stu.amsT_Id || m.AMST_Id === stu.amsT_Id);
                    const studentSubjects = getstudentwisesubjectlist.filter(
                        (s: any) => s.amsT_Id === stu.amsT_Id || s.AMST_Id === stu.amsT_Id
                    );
                    const studentActivities = getstudentwiseactiviteslist.filter(
                        (a: any) => a.amsT_Id === stu.amsT_Id || a.AMST_Id === stu.amsT_Id
                    );

                    const overall = getexammaxmarks.find((m: any) => m.amsT_Id === stu.amsT_Id) || {};
                    console.log('studentSubjects: ', studentSubjects);
                    console.log('studentMarks: ', studentMarks);
                    // Chart data - use scholastic subjects with marks
                    const chartData = {
                        subjects: studentSubjects.map((s: any) => s.subjectName || s.ismS_SubjectName),
                        marks: studentSubjects.map((s: any) => s.subjectObtainedMarks || s.obtainedMarks),
                        highest: studentSubjects.map((s: any) => s.subjectClassHighest || s.obtainedHighest || 0),
                        average: studentSubjects.map((s: any) => s.subjectClassAverage || s.obtainedAverage || 0)
                    };

                    return (
                        <div key={stu.amsT_Id} className='burnpur-xii-card'>
                            {/* Header Images */}
                            <div className='text-center'>
                                <img
                                    src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/551c9ec7-4251-4a99-9b91-f96a751dab18.jpg'
                                    style={{ width: '87%', margin: '0 auto' }}
                                    alt='Header'
                                />
                            </div>

                            <div className='mt-4 flex justify-center'>
                                <div className='burnpur-xii-banner' style={{ width: '30%' }}>
                                    PROGRESS REPORT
                                </div>
                            </div>

                            <div className='mt-2'>
                                <div className='burnpur-xii-banner' style={{ width: '100%' }}>
                                    ACADEMIC YEAR (2025-2026)
                                </div>
                            </div>

                            {/* Student Basic Info */}
                            <table className='burnpur-xii-table burnpur-xii-no-border'>
                                <tbody>
                                    <tr>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>Name : {stu.studentName || stu.studentname}</b>
                                        </td>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>
                                                Class & Section : {stu.className || stu.classname} - {stu.sectionName || stu.sectionname}
                                            </b>
                                        </td>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>Roll No : {stu.rollNo || stu.rollno || stu.amaY_RollNo}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>Mother&apos;s Name : {stu.motherName || stu.mothername || '-'}</b>
                                        </td>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>House : {stu.SPCCMH_HouseName || stu.city || '-'}</b>
                                        </td>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>Admn. No. : {stu.admissionNo || stu.admno}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>Father&apos;s Name : {stu.fatherName || stu.fathername || '-'}</b>
                                        </td>
                                        <td className='burnpur-xii-no-border burnpur-xii-text-left'>
                                            <b>Date of Birth : {stu.dob}</b>
                                        </td>
                                        <td className='burnpur-xii-no-border'></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Scholastic Areas Table */}
                            <table className='burnpur-xii-table'>
                                <thead>
                                    <tr>
                                        <th colSpan={groupwiseexamlist.length + 9} className='burnpur-xii-banner burnpur-xii-text-left'>
                                            ACADEMIC PERFORMANCE - SCHOLASTIC
                                        </th>
                                    </tr>
                                    <tr className='burnpur-xii-banner'>
                                        <th rowSpan={2}>SUBJECTS</th>
                                        <th colSpan={groupwiseexamlist.length}>Maximum Marks</th>
                                        <th colSpan={groupwiseexamlist.length}>Marks Obtained</th>
                                        <th rowSpan={2}>TOTAL 100</th>
                                        <th rowSpan={2}>GRADES</th>
                                        <th rowSpan={2}>Highest Mark</th>
                                    </tr>
                                    <tr className='burnpur-xii-banner'>
                                        {groupwiseexamlist.map((e) => (
                                            <th key={`max-${e.EME_Id}`}>{e.EME_ExamName}</th>
                                        ))}
                                        {groupwiseexamlist.map((e) => (
                                            <th key={`obt-${e.EME_Id}`}>{e.EME_ExamName}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentSubjects.map((subj: any) => (
                                        <tr key={subj.ismS_Id || subj.subjectName}>
                                            <td className='burnpur-xii-text-left'>
                                                <b>{subj.subjectName || subj.ismS_SubjectName}</b>
                                            </td>
                                            {/* Max Marks */}
                                            {groupwiseexamlist.map((e) => {
                                                const m = studentMarks.find(
                                                    (m: any) =>
                                                        (m.ismS_Id === subj.ismS_Id || m.ismS_SubjectName === subj.subjectName) &&
                                                        m.emE_Id === e.EME_Id
                                                );
                                                return (
                                                    <td key={`max-val-${subj.ismS_Id}-${e.EME_Id}`}>
                                                        {m?.eyceS_MaxMarks || m?.maxMarks || '-'}
                                                    </td>
                                                );
                                            })}
                                            {/* Obtained Marks */}
                                            {groupwiseexamlist.map((e) => {
                                                const m = studentMarks.find(
                                                    (m: any) =>
                                                        (m.ismS_Id === subj.ismS_Id || m.ismS_SubjectName === subj.subjectName) &&
                                                        m.emE_Id === e.EME_Id
                                                );
                                                return (
                                                    <td key={`obt-val-${subj.ismS_Id}-${e.EME_Id}`}>
                                                        {m?.passFailFlag === 'AB' || m?.passFailFlag === 'M' || m?.passFailFlag === 'L'
                                                            ? m.passFailFlag
                                                            : (m?.obtainedMarks ?? '-')}
                                                    </td>
                                                );
                                            })}
                                            {/* Total 100 */}
                                            <td>{subj.subjectObtainedMarks || subj.obtainedMarks || '-'}</td>
                                            {/* Grades */}
                                            <td>
                                                <b>{subj.subjectGrade || subj.obtainedGrade || '-'}</b>
                                            </td>
                                            {/* Highest Mark */}
                                            <td>{subj.subjectClassHighest || subj.obtainedHighest || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Co-Scholastic and Chart */}
                            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                                {/* Co-Scholastic */}
                                <div>
                                    <table className='burnpur-xii-table'>
                                        <thead>
                                            <tr className='burnpur-xii-banner'>
                                                <th className='burnpur-xii-text-left' style={{ width: '70%' }}>
                                                    CO-SCHOLASTIC AREAS
                                                </th>
                                                <th>GRADES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentActivities.map((act: any, aIdx: number) => (
                                                <tr key={aIdx}>
                                                    <td className='burnpur-xii-text-left'>&nbsp;{act.skillArea || act.ECACTA_SkillArea}</td>
                                                    <td>{act.skillGrade || act.GradeBand}</td>
                                                </tr>
                                            ))}
                                            {/* Placeholders for same height as chart */}
                                            {[...Array(Math.max(0, 10 - studentActivities.length))].map((_, i) => (
                                                <tr key={`empty-${i}`} style={{ height: '30px' }}>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Chart */}
                                <div className='flex flex-col border border-black'>
                                    <div className='h-8 p-2 text-center'></div>
                                    <div className='flex-1 p-4'>
                                        <div className='burnpur-xii-chart-canvas'>
                                            <PerformanceChart
                                                studentId={stu.amsT_Id}
                                                chartData={chartData}
                                                onChartReady={handleChartReady}
                                            />
                                        </div>
                                        {chartImages[stu.amsT_Id] && (
                                            <img src={chartImages[stu.amsT_Id]} className='burnpur-xii-chart-image' alt='Chart' />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className='mt-4'>
                                <div className='burnpur-xii-banner burnpur-xii-text-left'>REMARKS BY CLASS TEACHER</div>
                                <div className='min-h-[60px] border border-black p-4'>
                                    <b>{overall.overallResult || '-'}</b>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div
                                className='mt-4 flex items-center border-black border-t-2 border-b-2 py-4 text-center'
                                style={{ width: '100%', minHeight: '150px' }}>
                                <div style={{ width: '20%', textAlign: 'left', marginTop: '7%' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        <b>&nbsp;Date :</b> {formatDate(date)}
                                    </span>
                                </div>
                                <div style={{ width: '20%', marginTop: '7%' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        <b>Class Teacher</b>
                                    </span>
                                </div>
                                <div style={{ width: '20%' }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/d2192018-7b22-466e-808e-b9943751ca13.png'
                                        alt='Seal'
                                        style={{ width: '250px', margin: '0 auto' }}
                                    />
                                </div>
                                <div style={{ width: '20%', marginTop: '2%' }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/8ff47850-8524-423c-92a7-30c37099e292.png'
                                        style={{ width: '60%', margin: '0 auto', transform: 'rotate(10deg)' }}
                                        alt='Principal Sign'
                                    />
                                    <span style={{ fontSize: '18px' }}>
                                        <b>Director & Principal</b>
                                    </span>
                                </div>
                                <div style={{ width: '20%', marginTop: '7%' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        <b>Parent</b>
                                    </span>
                                </div>
                            </div>

                            {/* Grading Table */}
                            <table
                                className='burnpur-xii-table mt-10'
                                style={{ width: '100%', borderLeft: 'none', borderRight: 'none', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th colSpan={2} className='text-center' style={{ border: '1px solid black', padding: '6px 10px' }}>
                                            Grading Scale of Scholastic and Co-scholastic Areas
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td
                                            className='burnpur-xii-text-left'
                                            style={{ border: '1px solid black', borderRight: 'none', padding: '10px' }}>
                                            A1 : Top 1/8th of the passed candidates
                                            <br />
                                            A2 : Next 1/8th of the passed candidates
                                            <br />
                                            B1 : Next 1/8th of the passed candidates
                                            <br />
                                            B2 : Next 1/8th of the passed candidates
                                        </td>
                                        <td className='burnpur-xii-text-left' style={{ border: '1px solid black', padding: '10px' }}>
                                            C1 : Next 1/8th of the passed candidates
                                            <br />
                                            C2 : Next 1/8th of the passed candidates
                                            <br />
                                            D1 : Next 1/8th of the passed candidates
                                            <br />
                                            D2 : Next 1/8th of the passed candidates
                                            <br />E : Essential Repeat
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
