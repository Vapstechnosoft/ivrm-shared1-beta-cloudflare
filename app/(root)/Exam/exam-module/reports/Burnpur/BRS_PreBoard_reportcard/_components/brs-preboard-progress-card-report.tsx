'use client';

import { Button } from '@/components/ui/button';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import { useEffect, useRef } from 'react';

// Attempt to use Chart.js if available
import Chart from 'chart.js/auto';

interface SubSubject {
    EMSS_Id: number;
    EMSS_SubSubjectName: string;
}

interface SubSubjectMark {
    EMSS_Id: number;
    ISMS_Id: number;
    ESTMPSSS_ObtainedMarks: number | null;
    ESTMPSSS_PassFailFlg: string;
    EYCESSS_MarksEntryMax?: number;
}

interface BrsReportData extends IExamReportCard {
    amaY_RollNo?: any;
    userName?: string; // House
    _MotherName?: string;
    sub_subject?: SubSubject[];
    sub_subjectmarks?: SubSubjectMark[];
    eyceS_MarksDisplayFlg?: boolean;
    eyceS_GradeDisplayFlg?: boolean;
    eyceS_AplResultFlg?: boolean;
    estmpS_ClassAverage?: number;
    ESTMPS_ClassHighest?: number;
    spccmH_HouseName?: string; // Often misused for grade in legacy HTML
}

interface Props {
    reportData: BrsReportData[];
    subjects: ISubject[];
    headerInfo: {
        cla?: string;
        sec?: string;
    };
    examName: string;
    examCode: string;
    year: string;
    institution: Institution | IMasterInstitution | null | undefined;
    onPrint?: () => void;
}

export default function BrsPreBoardProgressCardReport({
    reportData,
    subjects,
    examName,
    examCode,
    year,
    institution,
    headerInfo,
    onPrint
}: Props) {
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        } catch {
            return 'N/A';
        }
    };

    const today = new Date();
    const todayFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Chart.js initialization reference
    const chartRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
    const chartInstances = useRef<{ [key: number]: Chart | null }>({});

    useEffect(() => {
        reportData.forEach((report) => {
            const canvas = chartRefs.current[report.amsT_Id];
            if (!canvas) return;

            const applicableSubjects =
                report.sub_list?.filter((mark) => {
                    const subj = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                    return subj?.eyceS_AplResultFlg !== false;
                }) || [];

            const labels: (string | string[])[] = [];
            const moData: number[] = [];
            const highestData: number[] = [];
            const averageData: number[] = [];

            applicableSubjects.forEach((mark) => {
                const subj = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                const subjectName = subj?.ismS_SubjectName || '';

                // Wrapping subject names if too long, matching old logic
                if (subjectName.length > 12) {
                    const words = subjectName.split(' ');
                    if (words.length > 1) {
                        labels.push(words);
                    } else {
                        labels.push(subjectName.match(/.{1,12}/g) as string[]);
                    }
                } else {
                    labels.push(subjectName);
                }

                // Marks and calculations
                const marksObtained = mark.estmpS_ObtainedMarks || 0;
                // Since this data is often nested differently, we fallback to mark's own data
                const highest = (mark as any).ESTMPS_ClassHighest || 0;
                const average = (mark as any).estmpS_ClassAverage || 0;

                moData.push(marksObtained);
                highestData.push(highest);
                averageData.push(average);
            });

            // Destroy old chart if exists
            if (chartInstances.current[report.amsT_Id]) {
                chartInstances.current[report.amsT_Id]?.destroy();
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Gradients as per legacy
            const gradientMark = ctx.createLinearGradient(0, 0, 0, 400);
            gradientMark.addColorStop(0, 'rgba(153, 76, 0)');
            gradientMark.addColorStop(1, 'rgba(153, 76, 0)');
            const gradientHighest = ctx.createLinearGradient(0, 0, 0, 400);
            gradientHighest.addColorStop(0, 'rgba(102, 102, 0)');
            gradientHighest.addColorStop(1, 'rgba(102, 102, 0)');
            const gradientAverage = ctx.createLinearGradient(0, 0, 0, 400);
            gradientAverage.addColorStop(0, 'rgba(0, 153, 0)');
            gradientAverage.addColorStop(1, 'rgba(0, 153, 0)');

            chartInstances.current[report.amsT_Id] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'M.O',
                            data: moData,
                            backgroundColor: gradientMark,
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1,
                            borderRadius: 0
                        },
                        {
                            label: 'Highest',
                            data: highestData,
                            backgroundColor: gradientHighest,
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1,
                            borderRadius: 0
                        },
                        {
                            label: 'Average',
                            data: averageData,
                            backgroundColor: gradientAverage,
                            borderColor: 'rgba(0,0,0,0.6)',
                            borderWidth: 1,
                            borderRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { left: 25, right: 40, top: 40, bottom: 50 }
                    },
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
                            ticks: {
                                font: { size: 20, family: 'Arial', weight: 'bold' },
                                color: '#000',
                                stepSize: 10
                            }
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
                    animation: { duration: 1000, easing: 'easeOutBounce' as any }
                },
                plugins: [
                    {
                        id: 'valueLabels',
                        afterDatasetsDraw: (chart) => {
                            const ctx = chart.ctx;
                            chart.data.datasets.forEach((dataset, di) => {
                                chart.getDatasetMeta(di).data.forEach((bar, index) => {
                                    const value = dataset.data[index];
                                    if (value == null) return;
                                    const x = bar.x;
                                    const y = bar.y - 20;
                                    ctx.fillStyle = '#000';
                                    ctx.font = 'bold 16px Arial';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'bottom';
                                    ctx.fillText(String(value), x, y);
                                });
                            });
                        }
                    }
                ]
            });
        });

        // Cleanup
        return () => {
            Object.values(chartInstances.current).forEach((chart) => {
                if (chart) chart.destroy();
            });
            chartInstances.current = {};
        };
    }, [reportData, subjects]);

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

                .brs-report-container {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                }

                .brs-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0.5rem;
                }

                .brs-table th,
                .brs-table td {
                    border: 1px solid black;
                    padding: 5px 8px;
                    text-align: center;
                    font-size: 14px;
                }

                .brs-info-table td {
                    border: none;
                    padding: 3px 6px;
                    font-size: 14px;
                    font-weight: bold;
                }

                .brs-goldenrod-banner {
                    background-color: #f3cb04; /* Matches original html */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                }

                .brs-card-border {
                    border: 15px solid GoldenRod;
                    margin-bottom: 60px;
                    background: white;
                }

                .brs-grading-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    border-left: none !important;
                    border-right: none !important;
                }

                .brs-grading-table th,
                .brs-grading-table td {
                    border: 1px solid black;
                    padding: 6px 10px;
                    vertical-align: top;
                    border-left: none !important;
                }
                
                .brs-grading-table th {
                    text-align: center;
                    border-left: none !important;
                    border-right: none !important;
                }
                .brs-grading-table td:last-child {
                    border-right: none !important;
                }

                @media print {
                    body * { visibility: hidden !important; }
                    #brs-print-area,
                    #brs-print-area * { visibility: visible !important; }
                    #brs-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    .brs-page-break { page-break-after: always !important; }
                    @page {
                        size: A4 portrait;
                        margin: 1mm;
                    }
                    .brs-goldenrod-banner {
                        background-color: #f3cb04 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brs-card-border {
                        border: 15px solid GoldenRod !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brs-marks-header {
                        background-color: #f3cb04 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            {/* Print Button */}
            <div className='no-print my-4 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='brs-print-area' className='brs-report-container'>
                {reportData.map((report, index) => {
                    const subSubjects: SubSubject[] = report.sub_subject || [];
                    const subSubjectMarks: SubSubjectMark[] = report.sub_subjectmarks || [];

                    // Specific subjects filtering based on original design
                    const thWtSubjects = subSubjects.filter((sub) => sub.EMSS_SubSubjectName === 'TH/WT');
                    const prIaSubjects = subSubjects.filter((sub) => sub.EMSS_SubSubjectName === 'PR/IA');

                    // Note on institution image: using hardcoded 71 (Burnpur) matching original legacy HTML unless mi_id is available
                    const mi_id = (institution as any)?.mI_Id || 71;
                    const logoUrl =
                        mi_id === 73
                            ? 'https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/26565e13-679e-412f-80a0-01310794f69b.jpg'
                            : mi_id === 74
                              ? 'https://vapsclg.blob.core.windows.net/files/71/NoticeUpload/1ef7ee36-1cc4-43dc-af76-a8236837767a.jpg'
                              : 'https://vapsclg.blob.core.windows.net/files/71/NoticeUpload/0d76d873-a586-4fee-ad26-c579ee7276f6.jpg';

                    return (
                        <div key={`${report.amsT_Id}-${index}`} className='brs-card-border p-4'>
                            {/* School Header Image */}
                            <div style={{ width: '100%', textAlign: 'center', marginBottom: '8px' }}>
                                <img src={logoUrl} alt='School Header' style={{ width: '98%', marginLeft: '1%', height: 'auto' }} />
                            </div>

                            <br />

                            {/* PROGRESS REPORT Banner */}
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <div className='brs-goldenrod-banner' style={{ width: '23%', marginLeft: '38%', height: '37px' }}>
                                    <h3 style={{ color: 'black', margin: 0, fontWeight: 'bold', fontSize: '18px' }}>PROGRESS REPORT</h3>
                                </div>
                            </div>

                            {/* Exam Name + Session Banner */}
                            <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                                <div className='brs-goldenrod-banner' style={{ width: '100%', height: '46px' }}>
                                    <h3 style={{ color: 'black', margin: 0, fontWeight: 'bold', fontSize: '18px' }}>
                                        {examName}({year})
                                    </h3>
                                </div>
                            </div>

                            {/* Student Info Table */}
                            <table className='brs-info-table brs-table' style={{ border: 'none', marginTop: '30px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;<b>Name&nbsp;&nbsp;&nbsp;&nbsp;: {report.amsT_FirstName}</b>
                                        </td>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            <b>
                                                Class & Section&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {report.asmcL_ClassName} -{' '}
                                                {report.asmC_SectionName}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            <b>
                                                Roll No&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {report.amaY_RollNo || 'N/A'}
                                            </b>
                                        </td>
                                    </tr>
                                    <tr style={{ height: '10px' }} />
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>
                                                &nbsp;&nbsp;&nbsp;&nbsp;Mother's Name&nbsp;&nbsp;&nbsp;&nbsp;:{' '}
                                                {report.amsT_MotherName || (report as any)._MotherName || 'N/A'}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>
                                                &nbsp;&nbsp;&nbsp;&nbsp;House&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{' '}
                                                {(report as any).userName || 'N/A'}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>&nbsp;&nbsp;&nbsp;&nbsp;Admn. No.&nbsp;&nbsp;&nbsp;&nbsp;: {report.amsT_AdmNo}</b>
                                        </td>
                                    </tr>
                                    <tr style={{ height: '10px' }} />
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>
                                            <b> &nbsp;&nbsp;&nbsp;&nbsp;Father's Name&nbsp;&nbsp;&nbsp;&nbsp;: {report.amsT_FatherName}</b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>
                                                &nbsp;&nbsp;&nbsp;&nbsp;Date of
                                                Birth&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{' '}
                                                {formatDate(report.amsT_DOB)}
                                            </b>
                                        </td>
                                        <td />
                                    </tr>
                                </tbody>
                            </table>

                            {/* Marks Table */}
                            <table className='brs-table' style={{ marginTop: '10px', borderLeft: 'none', borderRight: 'none' }}>
                                <thead>
                                    <tr>
                                        <td style={{ backgroundColor: '#f3cb04', color: 'black', border: 'none' }} />
                                        <td
                                            style={{
                                                backgroundColor: '#f3cb04',
                                                color: 'black',
                                                borderRight: 'none',
                                                borderTop: 'none',
                                                borderBottom: '1px solid black',
                                                borderLeft: '1px solid black'
                                            }}
                                            colSpan={thWtSubjects.length * 2 + prIaSubjects.length * 2 + 5}>
                                            <b>{examName}</b>
                                        </td>
                                    </tr>
                                </thead>
                                <thead style={{ borderLeft: 'none', borderRight: 'none' }}>
                                    <tr>
                                        <th
                                            style={{
                                                backgroundColor: '#f3cb04',
                                                color: 'black',
                                                textAlign: 'left',
                                                fontSize: '18px',
                                                borderLeft: 'none',
                                                borderRight: 'none',
                                                borderTop: 'none',
                                                width: '33%'
                                            }}>
                                            <b>SUBJECTS</b>
                                        </th>

                                        {/* TH/WT Max Mark */}
                                        {thWtSubjects.map((sub) => (
                                            <th
                                                key={`thwt-max-${sub.EMSS_Id}`}
                                                style={{ backgroundColor: '#f3cb04', color: 'black', textAlign: 'center' }}>
                                                <b>
                                                    {sub.EMSS_SubSubjectName} <br />
                                                    Max Mark
                                                </b>
                                            </th>
                                        ))}

                                        {/* TH/WT Marks Obtained */}
                                        {thWtSubjects.map((sub) => (
                                            <th
                                                key={`thwt-obt-${sub.EMSS_Id}`}
                                                style={{ backgroundColor: '#f3cb04', color: 'black', textAlign: 'center' }}>
                                                <b>
                                                    {sub.EMSS_SubSubjectName} <br />
                                                    Marks
                                                    <br />
                                                    Obtained
                                                </b>
                                            </th>
                                        ))}

                                        {/* PR/IA Max Mark */}
                                        {prIaSubjects.map((sub) => (
                                            <th
                                                key={`pria-max-${sub.EMSS_Id}`}
                                                style={{ backgroundColor: '#f3cb04', color: 'black', textAlign: 'center' }}>
                                                <b>
                                                    {sub.EMSS_SubSubjectName} <br />
                                                    Max Mark
                                                </b>
                                            </th>
                                        ))}

                                        {/* PR/IA Marks Obtained */}
                                        {prIaSubjects.map((sub) => (
                                            <th
                                                key={`pria-obt-${sub.EMSS_Id}`}
                                                style={{ backgroundColor: '#f3cb04', color: 'black', textAlign: 'center' }}>
                                                <b>
                                                    {sub.EMSS_SubSubjectName} <br />
                                                    Marks
                                                    <br />
                                                    Obtained
                                                </b>
                                            </th>
                                        ))}

                                        <th style={{ backgroundColor: '#f3cb04', color: 'black', textAlign: 'center' }}>
                                            <strong>
                                                TOTAL
                                                <br />
                                                100
                                            </strong>
                                        </th>

                                        <th style={{ backgroundColor: '#f3cb04', color: 'black', textAlign: 'center' }}>
                                            <strong>GRADES</strong>
                                        </th>

                                        <th
                                            style={{
                                                backgroundColor: '#f3cb04',
                                                color: 'black',
                                                textAlign: 'center',
                                                borderRight: 'none'
                                            }}>
                                            <strong>
                                                Highest
                                                <br />
                                                Mark
                                            </strong>
                                        </th>
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
                                            const isAbsent = mark.estmpS_PassFailFlg === 'AB';

                                            return (
                                                <tr key={mark.ismS_Id} style={{ backgroundColor: 'white', color: 'black' }}>
                                                    <td
                                                        style={{
                                                            textAlign: 'left',
                                                            fontWeight: 'bold',
                                                            fontSize: '18px',
                                                            borderLeft: 'none',
                                                            borderTop: 'none',
                                                            borderBottom: 'none'
                                                        }}>
                                                        {subj?.ismS_SubjectName || 'N/A'}
                                                    </td>

                                                    {/* TH/WT Max Mark */}
                                                    {thWtSubjects.map((sub) => {
                                                        const ssm = subSubjectMarks.find(
                                                            (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === mark.ismS_Id
                                                        );
                                                        return (
                                                            <td
                                                                key={`thwt-max-val-${sub.EMSS_Id}`}
                                                                style={{ borderTop: 'none', borderBottom: 'none' }}>
                                                                {ssm?.EYCESSS_MarksEntryMax ?? ''}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* TH/WT Marks Obtained */}
                                                    {thWtSubjects.map((sub) => {
                                                        const ssm = subSubjectMarks.find(
                                                            (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === mark.ismS_Id
                                                        );
                                                        return (
                                                            <td
                                                                key={`thwt-obt-val-${sub.EMSS_Id}`}
                                                                style={{ borderTop: 'none', borderBottom: 'none' }}>
                                                                {ssm?.ESTMPSSS_PassFailFlg === 'AB'
                                                                    ? 'AB'
                                                                    : showMarks
                                                                      ? (ssm?.ESTMPSSS_ObtainedMarks ?? '')
                                                                      : ''}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* PR/IA Max Mark */}
                                                    {prIaSubjects.map((sub) => {
                                                        const ssm = subSubjectMarks.find(
                                                            (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === mark.ismS_Id
                                                        );
                                                        return (
                                                            <td
                                                                key={`pria-max-val-${sub.EMSS_Id}`}
                                                                style={{ borderTop: 'none', borderBottom: 'none' }}>
                                                                {ssm?.EYCESSS_MarksEntryMax ?? ''}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* PR/IA Marks Obtained */}
                                                    {prIaSubjects.map((sub) => {
                                                        const ssm = subSubjectMarks.find(
                                                            (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === mark.ismS_Id
                                                        );
                                                        return (
                                                            <td
                                                                key={`pria-obt-val-${sub.EMSS_Id}`}
                                                                style={{ borderTop: 'none', borderBottom: 'none' }}>
                                                                {ssm?.ESTMPSSS_PassFailFlg === 'AB'
                                                                    ? 'AB'
                                                                    : showMarks
                                                                      ? (ssm?.ESTMPSSS_ObtainedMarks ?? '')
                                                                      : ''}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Total */}
                                                    <td style={{ borderTop: 'none', borderBottom: 'none' }}>
                                                        <span className='dataincrease'>
                                                            {mark.estmpS_ObtainedMarks != null ? Math.round(mark.estmpS_ObtainedMarks) : ''}
                                                            {/* Assuming sub exam name could be shown if exist, ignoring as it's missing in Next model */}
                                                        </span>
                                                    </td>

                                                    {/* Grades (Often mapped to House in legacy HTML, falling back to estmpS_ObtainedGrade for correctness) */}
                                                    <td style={{ borderTop: 'none', borderBottom: 'none' }}>
                                                        {mark.estmpS_ObtainedGrade || report.spccmH_HouseName || ''}
                                                    </td>

                                                    {/* Highest Mark */}
                                                    <td style={{ borderTop: 'none', borderBottom: 'none', borderRight: 'none' }}>
                                                        {(mark as any).ESTMPS_ClassHighest || ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '10%' }}>
                                <div
                                    style={{
                                        border: '1px solid black',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderBottom: 'none',
                                        borderTop: 'none',
                                        padding: '10px'
                                    }}>
                                    {/* Graph */}
                                    <div style={{ textAlign: 'center' }}>
                                        <canvas
                                            ref={(el) => {
                                                chartRefs.current[report.amsT_Id] = el;
                                            }}
                                            id={`pieChart${report.amsT_Id}`}
                                            style={{ maxWidth: '100%', height: '400px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remarks Box */}
                            <div
                                style={{
                                    fontSize: '20px',
                                    backgroundColor: '#f3cb04',
                                    color: 'black',
                                    textAlign: 'left',
                                    padding: '5px',
                                    marginTop: '20px'
                                }}>
                                <strong>REMARKS</strong>
                            </div>

                            <div
                                style={{
                                    padding: '10px 0',
                                    fontSize: '14px',
                                    border: '1px solid black',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    borderTop: 'none'
                                }}>
                                <span style={{ border: 'none' }}>
                                    <br />
                                    <br />
                                    <br />
                                </span>
                            </div>

                            {/* Signatures Section */}
                            <div
                                style={{
                                    borderTop: '2px solid black',
                                    borderBottom: '2px solid black',
                                    padding: '10px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    marginTop: '20px'
                                }}>
                                {/* Date & Place */}
                                <div style={{ flex: 3, textAlign: 'left', marginTop: '10%' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        <b>&nbsp;Place : {mi_id === 73 ? 'Asansol' : 'Burnpur'}</b>
                                    </span>
                                    <br />
                                    <span style={{ fontSize: '18px' }}>
                                        <b>&nbsp;Date : </b>
                                    </span>
                                    <b>{todayFormatted}</b>
                                </div>

                                {/* Class Teacher */}
                                <div style={{ flex: 3, marginTop: '10%' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        <b>Class Teacher</b>
                                    </span>
                                </div>

                                {/* Signature Seal Image */}
                                <div style={{ flex: 3 }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/14abfc5e-3e03-4eb9-a5e7-c2725944cc3d.png'
                                        alt='Seal'
                                        style={{ width: '123px', height: 'auto', margin: '0 auto' }}
                                    />
                                </div>

                                {/* Director & Principal */}
                                <div style={{ flex: 4, textAlign: 'center', marginTop: '6%' }}>
                                    <div>
                                        <img
                                            style={{
                                                width: '61%',
                                                transform: 'rotate(10deg)',
                                                transformOrigin: 'center',
                                                margin: '0 auto'
                                            }}
                                            src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/8ff47850-8524-423c-92a7-30c37099e292.png'
                                            alt='Director & Principal Signature'
                                        />
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Director & Principal</div>
                                </div>

                                {/* Parent */}
                                <div style={{ flex: 4, marginTop: '10%' }}>
                                    <span style={{ fontSize: '18px' }}>
                                        <b>Parent</b>
                                    </span>
                                </div>
                            </div>

                            <br />
                            <br />

                            {/* Grading Table */}
                            <table className='brs-grading-table'>
                                <tbody>
                                    <tr>
                                        <th colSpan={2}>
                                            <b>CLASS ({report.asmcL_ClassName})</b>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td>
                                            A1 : Top 1/8th of the passed candidates
                                            <br />
                                            A2 : Next 1/8th of the passed candidates
                                            <br />
                                            B1 : Next 1/8th of the passed candidates
                                            <br />
                                            B2 : Next 1/8th of the passed candidates
                                        </td>
                                        <td>
                                            C1 : Next 1/8th of the passed candidates
                                            <br />
                                            C2 : Next 1/8th of the passed candidates
                                            <br />
                                            D1 : Next 1/8th of the passed candidates
                                            <br />
                                            D2 : Next 1/8th of the passed candidates
                                            <br />E : Essential Repeat
                                            <br />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Page Break between students */}
                            {index < reportData.length - 1 && <div className='brs-page-break' />}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
