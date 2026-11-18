'use client';

import { Button } from '@/components/ui/button';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SubSubject {
    EMSS_Id: number;
    EMSS_SubSubjectName: string;
}
interface SubSubjectMark {
    EMSS_Id: number;
    ISMS_Id: number;
    ESTMPSSS_ObtainedMarks: number | null;
    ESTMPSSS_PassFailFlg: string;
}

interface BrsXReportData extends IExamReportCard {
    amaY_RollNo?: any;
    userName?: string;
    _MotherName?: string;
    sub_subject?: SubSubject[];
    sub_subjectmarks?: SubSubjectMark[];
    eyceS_MarksDisplayFlg?: boolean;
    eyceS_GradeDisplayFlg?: boolean;
    eyceS_AplResultFlg?: boolean;
    estmpS_ClassAverage?: number;
    estmpS_ClassHighest?: number;
    remarks?: string;
}

interface Props {
    reportData: BrsXReportData[];
    subjects: ISubject[];
    headerInfo: { cla?: string; sec?: string };
    examName: string;
    examCode: string;
    year: string;
    institution: Institution | IMasterInstitution | null | undefined;
    onPrint?: () => void;
    remarksMap?: Record<number, string>;
    chartDataMap?: Record<number, { subjects: string[]; marks: number[]; highest: number[]; average: number[] }>;
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

            const gradientMark = ctx.createLinearGradient(0, 0, 0, 400);
            gradientMark.addColorStop(0, 'rgba(153, 76, 0, 1)');
            gradientMark.addColorStop(1, 'rgba(153, 76, 0, 1)');
            const gradientHighest = ctx.createLinearGradient(0, 0, 0, 400);
            gradientHighest.addColorStop(0, 'rgba(102, 102, 0, 1)');
            gradientHighest.addColorStop(1, 'rgba(102, 102, 0, 1)');
            const gradientAverage = ctx.createLinearGradient(0, 0, 0, 400);
            gradientAverage.addColorStop(0, 'rgba(0, 153, 0, 1)');
            gradientAverage.addColorStop(1, 'rgba(0, 153, 0, 1)');

            const chart = new ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.subjects.map((s) => (s.length > 12 ? s.split(' ') : s)),
                    datasets: [
                        {
                            label: 'M.O',
                            data: chartData.marks,
                            backgroundColor: gradientMark,
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1
                        },
                        {
                            label: 'Highest',
                            data: chartData.highest,
                            backgroundColor: gradientHighest,
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1
                        },
                        {
                            label: 'Average',
                            data: chartData.average,
                            backgroundColor: gradientAverage,
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { left: 25, right: 40, top: 25, bottom: 50 } },
                    scales: {
                        x: {
                            offset: true,
                            grid: { display: true, color: 'rgba(200,200,200,0.4)' },
                            border: { display: true, color: '#000', width: 3 },
                            ticks: {
                                font: { size: 12, family: 'Arial', weight: 'bold' },
                                color: '#000',
                                maxRotation: 0,
                                minRotation: 0,
                                padding: 10
                            }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { display: true, color: 'rgba(200,200,200,0.4)' },
                            border: { display: true, color: '#000', width: 3 },
                            ticks: { font: { size: 20, family: 'Arial', weight: 'bold' }, color: '#000', stepSize: 10 }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'right',
                            align: 'center',
                            labels: {
                                font: { size: 15, weight: 'bold', family: 'Arial' },
                                usePointStyle: true,
                                pointStyle: 'rect',
                                padding: 30,
                                boxWidth: 12,
                                boxHeight: 12
                            }
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            cornerRadius: 4,
                            displayColors: true
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutBounce',
                        onComplete: () => {
                            if (onChartReady && canvasRef.current) {
                                onChartReady(studentId, canvasRef.current.toDataURL());
                            }
                        }
                    }
                },
                plugins: [
                    {
                        id: 'valueLabels',
                        afterDatasetsDraw(c) {
                            const cx = c.ctx;
                            c.data.datasets.forEach((dataset, di) => {
                                c.getDatasetMeta(di).data.forEach((bar, index) => {
                                    const value = dataset.data[index];
                                    if (value == null) return;
                                    cx.fillStyle = '#000';
                                    cx.font = 'bold 16px Arial';
                                    cx.textAlign = 'center';
                                    cx.textBaseline = 'bottom';
                                    cx.fillText(String(value), bar.x, bar.y - 20);
                                });
                            });
                        }
                    }
                ]
            });

            return () => chart.destroy();
        };
        loadChart();
    }, [chartData, studentId, onChartReady]);

    if (!chartData || chartData.subjects.length === 0) return null;

    return (
        <div style={{ textAlign: 'center' }}>
            <canvas ref={canvasRef} id={`pieChartX${studentId}`} style={{ maxWidth: '100%', height: '400px' }} />
        </div>
    );
}

/* ---------- Main Report Component ---------- */
export default function BrsProgressCardXReport({
    reportData,
    subjects,
    examName,
    year,
    onPrint,
    remarksMap = {},
    chartDataMap = {}
}: Props) {
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } catch {
            return 'N/A';
        }
    };

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const todayFormatted = `${String(today.getDate()).padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`;

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    const handlePrintClick = useCallback(() => {
        reportData.forEach((report) => {
            const canvas = document.getElementById(`pieChartX${report.amsT_Id}`) as HTMLCanvasElement;
            if (canvas) {
                const dataUrl = canvas.toDataURL();
                setChartImages((prev) => ({ ...prev, [report.amsT_Id]: dataUrl }));
            }
        });
        setTimeout(() => {
            if (onPrint) onPrint();
        }, 300);
    }, [reportData, onPrint]);

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

                .brsx-report-container {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                }
                .brsx-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0.5rem;
                }
                .brsx-table th,
                .brsx-table td {
                    border: 1px solid black;
                    padding: 5px 8px;
                    text-align: center;
                    font-size: 14px;
                }
                .brsx-info-table td {
                    border: none;
                    padding: 3px 6px;
                    font-size: 14px;
                    font-weight: bold;
                }
                .brsx-goldenrod-banner {
                    background-color: #f3cb04;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                }
                .brsx-card-border {
                    border: 15px solid #f3cb04;
                    margin-bottom: 60px;
                    background: white;
                }
                .brsx-marks-header {
                    background-color: #f3cb04 !important;
                    color: black !important;
                }
                .brsx-remarks-header {
                    background-color: #f3cb04 !important;
                    color: black !important;
                }

                @media print {
                    body * { visibility: hidden !important; }
                    #brsx-print-area,
                    #brsx-print-area * { visibility: visible !important; }
                    #brsx-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    .brsx-page-break { page-break-after: always !important; }
                    @page {
                        size: A4 portrait;
                        margin: 1mm;
                    }
                    .brsx-goldenrod-banner {
                        background-color: #f3cb04 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brsx-card-border {
                        border: 15px solid #f3cb04 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brsx-marks-header {
                        background-color: #f3cb04 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brsx-remarks-header {
                        background-color: #f3cb04 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brsx-chart-canvas { display: none !important; }
                    .brsx-chart-image { display: block !important; }
                }
            `}</style>

            {/* Print Button */}
            <div className='no-print my-4 flex justify-end'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='brsx-print-area' className='brsx-report-container'>
                {reportData.map((report, index) => {
                    const subSubjects: SubSubject[] = report.sub_subject || [];
                    const subSubjectMarks: SubSubjectMark[] = report.sub_subjectmarks || [];
                    const studentRemarks = remarksMap[report.amsT_Id] || '';
                    const studentChartData = chartDataMap[report.amsT_Id];
                    const chartImageSrc = chartImages[report.amsT_Id];

                    return (
                        <div key={`${report.amsT_Id}-${index}`} className='brsx-card-border' style={{ padding: '16px' }}>
                            {/* ---------- School Header Image ---------- */}
                            <div style={{ width: '100%', textAlign: 'center', marginBottom: '8px' }}>
                                <img
                                    src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/df29b5da-6128-4106-a3c9-7b89bd1009af.jpg'
                                    alt='School Header'
                                    style={{ width: '98%', marginLeft: '1%', height: 'auto' }}
                                />
                            </div>
                            <br />

                            {/* ---------- PROGRESS REPORT Banner ---------- */}
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <div className='brsx-goldenrod-banner' style={{ width: '23%', marginLeft: '38%', height: '37px' }}>
                                    <h3 style={{ color: 'black', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>PROGRESS REPORT</h3>
                                </div>
                            </div>

                            {/* ---------- Exam Name + Year Banner ---------- */}
                            <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                                <div className='brsx-goldenrod-banner' style={{ width: '100%', height: '46px' }}>
                                    <h3 style={{ color: 'black', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                                        {examName}({year})
                                    </h3>
                                </div>
                            </div>

                            {/* ---------- Student Info ---------- */}
                            <table className='brsx-info-table brsx-table' style={{ border: 'none', marginTop: '10px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ textAlign: 'left', width: '34%' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;<b>Name : {report.amsT_FirstName}</b>
                                        </td>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            <b>
                                                Class &amp; Section : {report.asmcL_ClassName}/{report.asmC_SectionName}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            <b>Admn. No. : {report.amsT_AdmNo}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>
                                                &nbsp;&nbsp;&nbsp;&nbsp;Mother&apos;s Name :{' '}
                                                {report.amsT_MotherName || (report as any)._MotherName || 'N/A'}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>Date of Birth : {formatDate(report.amsT_DOB)}</b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>Roll No : {report.amaY_RollNo || 'N/A'}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>&nbsp;&nbsp;&nbsp;&nbsp;Father&apos;s Name : {report.amsT_FatherName}</b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>House : {(report as any).userName || 'N/A'}</b>
                                        </td>
                                        <td />
                                    </tr>
                                </tbody>
                            </table>

                            {/* ---------- Marks Table ---------- */}
                            <table className='brsx-table' style={{ marginTop: '10px', fontFamily: 'Arial, sans-serif' }}>
                                <thead>
                                    <tr className='brsx-marks-header' style={{ height: '50px' }}>
                                        <td
                                            style={{
                                                textAlign: 'left',
                                                fontWeight: 'bold',
                                                fontSize: '18px',
                                                padding: '10px',
                                                borderLeft: 'none',
                                                borderRight: 'none'
                                            }}>
                                            <b>SUBJECTS</b>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                            <b>Max Mark</b>
                                        </td>
                                        {subSubjects.map((sub) => (
                                            <td
                                                key={sub.EMSS_Id}
                                                style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', padding: '10px' }}>
                                                <b>{sub.EMSS_SubSubjectName}</b>
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', padding: '10px' }}>
                                            <b>Mark Obtained</b>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', padding: '10px' }}>
                                            <b>Grade</b>
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.sub_list
                                        ?.filter((mark) => {
                                            const subj = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                            return subj?.eyceS_AplResultFlg !== false;
                                        })
                                        .map((mark) => {
                                            const subj = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                            const showMarks = subj?.eyceS_MarksDisplayFlg !== false;
                                            const showGrade = subj?.eyceS_GradeDisplayFlg !== false;
                                            const isAbsent = mark.estmpS_PassFailFlg === 'AB';

                                            return (
                                                <tr key={mark.ismS_Id} style={{ backgroundColor: 'white', color: 'black' }}>
                                                    <td style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '18px' }}>
                                                        <b>{subj?.ismS_SubjectName || 'N/A'}</b>
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '18px',
                                                            border: '1px solid black'
                                                        }}>
                                                        <b>{mark.estmpS_MaxMarks}</b>
                                                    </td>
                                                    {subSubjects.map((sub) => {
                                                        const ssm = subSubjectMarks.find(
                                                            (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === mark.ismS_Id
                                                        );
                                                        return (
                                                            <td
                                                                key={sub.EMSS_Id}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '18px',
                                                                    border: '1px solid black'
                                                                }}>
                                                                {ssm?.ESTMPSSS_PassFailFlg === 'AB' ? (
                                                                    <b>AB</b>
                                                                ) : showMarks ? (
                                                                    <b>{ssm?.ESTMPSSS_ObtainedMarks ?? '-'}</b>
                                                                ) : (
                                                                    <b>-</b>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td
                                                        style={{
                                                            textAlign: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '18px',
                                                            border: '1px solid black',
                                                            padding: '10px'
                                                        }}>
                                                        {isAbsent ? (
                                                            <b>AB</b>
                                                        ) : showMarks ? (
                                                            <b>{mark.estmpS_ObtainedMarks ?? '-'}</b>
                                                        ) : (
                                                            <b>-</b>
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            textAlign: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '18px',
                                                            border: '1px solid black',
                                                            padding: '10px'
                                                        }}>
                                                        {isAbsent ? (
                                                            <b>AB</b>
                                                        ) : showGrade ? (
                                                            <b>{mark.estmpS_ObtainedGrade || '-'}</b>
                                                        ) : (
                                                            <b>-</b>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>

                            {/* ---------- PERFORMANCE ANALYSIS ---------- */}
                            <div
                                style={{
                                    border: '1px solid black',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    borderBottom: 'none',
                                    padding: '10px'
                                }}>
                                <div style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '22px', marginBottom: '10px' }}>
                                    PERFORMANCE ANALYSIS
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div className='brsx-chart-canvas'>
                                        <PerformanceChart
                                            studentId={report.amsT_Id}
                                            chartData={studentChartData}
                                            onChartReady={handleChartReady}
                                        />
                                    </div>
                                    {chartImageSrc && (
                                        <img
                                            className='brsx-chart-image'
                                            src={chartImageSrc}
                                            alt='Performance Analysis'
                                            style={{ display: 'none', maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* ---------- REMARKS BY CLASS TEACHER ---------- */}
                            <div style={{ width: '100%', marginTop: '10px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                                    <thead>
                                        <tr>
                                            <th
                                                className='brsx-remarks-header'
                                                style={{ textAlign: 'left', fontSize: '18px', padding: '8px', width: '34%' }}>
                                                <b>REMARKS BY CLASS TEACHER</b>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td
                                                colSpan={2}
                                                style={{ padding: '15px', fontSize: '16px', verticalAlign: 'top', textAlign: 'left' }}>
                                                <b>{studentRemarks || ''}</b>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <hr />
                            </div>

                            {/* ---------- Signatures ---------- */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    marginTop: '10px'
                                }}>
                                <div style={{ flex: 1, textAlign: 'left', marginTop: '1%' }}>
                                    <span style={{ fontSize: '16px' }}>
                                        &nbsp;<b>Date : {todayFormatted}</b>
                                    </span>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', marginTop: '1%' }}>
                                    <span style={{ fontSize: '16px' }}>
                                        <b>Class Teacher</b>
                                    </span>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/14abfc5e-3e03-4eb9-a5e7-c2725944cc3d.png'
                                        alt='Seal'
                                        style={{ width: '128px', height: '157px', objectFit: 'contain' }}
                                    />
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/8ff47850-8524-423c-92a7-30c37099e292.png'
                                        alt='Director Signature'
                                        style={{ width: '152px', height: 'auto', transform: 'rotate(7deg)', marginTop: '-15%' }}
                                    />
                                    <br />
                                    <span style={{ fontSize: '16px' }}>
                                        <b>Director &amp; Principal</b>
                                    </span>
                                </div>
                            </div>

                            {/* ---------- GRADING SCALE (Two-column: 1/8th of passed candidates) ---------- */}
                            <div style={{ textAlign: 'center' }}>
                                <table
                                    style={{
                                        width: '80%',
                                        margin: '0 auto',
                                        borderCollapse: 'collapse',
                                        border: '1px solid #999',
                                        fontSize: '14px'
                                    }}>
                                    <thead>
                                        <tr>
                                            <th
                                                colSpan={2}
                                                style={{
                                                    textAlign: 'center',
                                                    fontSize: '16px',
                                                    border: '1px solid #999',
                                                    padding: '8px',
                                                    fontWeight: 'bold'
                                                }}>
                                                GRADING SCALE
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {/* Left Column: A1 - B2 */}
                                            <td
                                                style={{
                                                    border: '1px solid #999',
                                                    padding: '12px',
                                                    verticalAlign: 'top',
                                                    width: '50%',
                                                    textAlign: 'center'
                                                }}>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>A1</b> : Top 1/8th of the passed candidates
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>A2</b> : Next 1/8th of the passed candidates
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>B1</b> : Next 1/8th of the passed candidates
                                                </div>
                                                <div>
                                                    <b>B2</b> : Next 1/8th of the passed candidates
                                                </div>
                                            </td>
                                            {/* Right Column: C1 - E */}
                                            <td
                                                style={{
                                                    border: '1px solid #999',
                                                    padding: '12px',
                                                    verticalAlign: 'top',
                                                    width: '50%',
                                                    textAlign: 'center'
                                                }}>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>C1</b> : Next 1/8th of the passed candidates
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>C2</b> : Next 1/8th of the passed candidates
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>D1</b> : Next 1/8th of the passed candidates
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b>D2</b> : Next 1/8th of the passed candidates
                                                </div>
                                                <div>
                                                    <b>E</b> : Essential Repeat
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <br />
                                <br />
                                <br />
                            </div>

                            {/* Page break between students */}
                            {index < reportData.length - 1 && <div className='brsx-page-break' />}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
