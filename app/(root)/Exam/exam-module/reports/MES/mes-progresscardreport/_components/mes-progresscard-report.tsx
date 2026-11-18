'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';

/* ---------- Performance Chart Component ---------- */
function PerformanceChart({ studentId, chartData, onChartReady }: {
    studentId: number;
    chartData?: { subjects: string[]; marks: number[] };
    onChartReady?: (id: number, dataUrl: string) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !chartData || chartData.subjects.length === 0) return;
        const canvas = canvasRef.current;
        let chartInstance: any = null;
        let isCancelled = false;

        const loadChart = async () => {
            const ChartJS = (await import('chart.js/auto')).default;
            if (isCancelled) return;

            const existing = ChartJS.getChart(canvas);
            if (existing) {
                existing.destroy();
            }

            chartInstance = new ChartJS(canvas, {
                type: 'bar',
                data: {
                    labels: chartData.subjects,
                    datasets: [{
                        label: 'Marks Obtained',
                        data: chartData.marks,
                        backgroundColor: 'rgba(30, 144, 255, 0.6)',
                        borderColor: 'rgba(30, 144, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { font: { size: 10 } }
                        },
                        x: {
                            ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    animation: {
                        duration: 300,
                        onComplete: () => {
                            if (onChartReady && canvasRef.current && !isCancelled) {
                                onChartReady(studentId, canvasRef.current.toDataURL());
                            }
                        }
                    }
                }
            });
        };

        loadChart();

        return () => {
            isCancelled = true;
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [chartData, studentId, onChartReady]);

    if (!chartData || chartData.subjects.length === 0) return null;

    return (
        <div style={{ height: '200px', width: '100%' }}>
            <canvas ref={canvasRef} id={`pieChartMES${studentId}`} />
        </div>
    );
}

interface MESProgressCardReportProps {
    reportData: any[];
    saveList: any[];
    workAttendance: any[];
    presentAttendance: any[];
    promotionRemarks: any[];
    examName: string;
    examCode: string;
    year: string;
    institution?: IMasterInstitution | Institution | null;
}

export default function MESProgressCardReport({
    reportData,
    saveList,
    workAttendance,
    presentAttendance,
    promotionRemarks,
    examName,
    examCode,
    year,
    institution
}: MESProgressCardReportProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    if (!reportData || reportData.length === 0) return null;

    return (
        <div className="space-y-6">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

                .mes-report-container {
                    font-family: 'Roboto', sans-serif !important;
                    color: black;
                }

                .mes-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0.5rem;
                }

                .mes-table th, .mes-table td {
                    border: 1px solid #000;
                    padding: 6px;
                    text-align: center;
                    font-size: 12px;
                }

                .mes-header-bg {
                    background-color: #f0f7ff !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .mes-info-label {
                    font-weight: 700;
                    color: #1a365d;
                }

                .mes-card {
                    border: 10px solid #1a365d;
                    background: white;
                    margin-bottom: 40px;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    body * { visibility: hidden !important; }
                    #mes-print-area, #mes-print-area * { visibility: visible !important; }
                    #mes-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    .mes-page-break { page-break-after: always !important; }
                    
                    .mes-card {
                        border: 10px solid #1a365d !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        margin-bottom: 0 !important;
                    }
                    .mes-header-bg {
                        background-color: #f0f7ff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className="flex justify-end mb-4 no-print">
                <Button onClick={() => handlePrint()} className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print All Progress Cards
                </Button>
            </div>

            <div id="mes-print-area" ref={printRef} className="mes-report-container">
                {reportData.map((report, index) => {
                    const studentId = report.amsT_Id ?? report.AMST_Id;
                    const studentMarks = saveList.filter(m => {
                        const mStuId = m.amsT_Id ?? m.AMST_Id;
                        return Boolean(mStuId && mStuId === studentId);
                    });
                    const scholasticMarks = studentMarks.filter(m => (m.eyceS_AplResultFlg ?? m.EYCES_AplResultFlg) !== false);
                    const coScholasticMarks = studentMarks.filter(m => (m.eyceS_AplResultFlg ?? m.EYCES_AplResultFlg) === false);

                    const chartData = {
                        subjects: scholasticMarks.map(m => m.ismS_SubjectName || m.ISMS_SubjectName || ''),
                        marks: scholasticMarks.map(m => m.estmpS_ObtainedMarks ?? m.ESTMPS_ObtainedMarks ?? 0)
                    };

                    return (
                        <div key={report.amsT_Id} className="mes-card p-8 shadow-sm mx-auto" style={{ width: '210mm', minHeight: '290mm' }}>

                            {/* Header Image */}
                            <div className="text-center mb-6">
                                <img
                                    src="https://vapsclg.blob.core.windows.net/files/78/ISM_Attachments/bdb3c5ea-581f-46bd-9516-d391b5a2b53e.jpg"
                                    alt="School Header"
                                    className="w-full h-auto max-h-32 object-contain mx-auto"
                                />
                            </div>

                            {/* Report Title */}
                            <div className="text-center mb-6">
                                <div className="inline-block bg-blue-900 text-white px-8 py-2 rounded-sm mb-2">
                                    <h2 className="text-xl font-bold tracking-widest uppercase">PROGRESS REPORT CARD</h2>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">{examName || report.emE_ExamName} - ({year})</h3>
                            </div>

                            {/* Student Info Table */}
                            <table className="mes-table" style={{ border: 'none', marginBottom: '1.5rem' }}>
                                <tbody style={{ border: 'none' }}>
                                    <tr style={{ border: 'none' }}>
                                        <td style={{ border: 'none', textAlign: 'left', width: '33%' }}>
                                            <span className="mes-info-label">Name :</span> {report.amsT_FirstName || report.AMST_FirstName}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left', width: '33%' }}>
                                            <span className="mes-info-label">Class :</span> {report.asmcL_ClassName || report.ASMCL_ClassName}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left', width: '33%' }}>
                                            <span className="mes-info-label">Roll No :</span> {report.amaY_RollNo ?? report.AMAY_RollNo ?? '-'}
                                        </td>
                                    </tr>
                                    <tr style={{ border: 'none' }}>
                                        <td style={{ border: 'none', textAlign: 'left' }}>
                                            <span className="mes-info-label">Adm No :</span> {report.amsT_AdmNo || report.AMST_AdmNo}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left' }}>
                                            <span className="mes-info-label">Section :</span> {report.asmC_SectionName || report.ASMC_SectionName}
                                        </td>
                                        <td style={{ border: 'none', textAlign: 'left' }}>
                                            <span className="mes-info-label">Attendance :</span>
                                            {(() => {
                                                const workAtt = workAttendance.find(att => (att.AMST_Id ?? att.amsT_Id) === report.amsT_Id);
                                                const presAtt = presentAttendance.find(att => (att.AMST_Id ?? att.amsT_Id) === report.amsT_Id);
                                                const presDays = presAtt ? (presAtt.TotalPresentDays ?? presAtt.totalPresentDays ?? presAtt.presentDays ?? 0) : null;
                                                const workDays = workAtt ? (workAtt.TotalWorkingDays ?? workAtt.totalWorkingDays ?? workAtt.workingDays ?? 0) : null;
                                                return presDays !== null && workDays !== null ? ` ${presDays} / ${workDays}` : ' -';
                                            })()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Scholastic Table */}
                            <div className="mb-8">
                                <table className="mes-table">
                                    <thead>
                                        <tr className="mes-header-bg">
                                            <th className="w-12">SL</th>
                                            <th className="text-left px-4">SCHOLASTIC SUBJECTS</th>
                                            <th className="w-20">MAX</th>
                                            <th className="w-20">MIN</th>
                                            <th className="w-20">OBTAINED</th>
                                            <th className="w-16">GRADE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scholasticMarks.map((marks, mIndex) => (
                                            <tr key={mIndex}>
                                                <td>{mIndex + 1}</td>
                                                <td className="text-left px-4 font-medium">{marks.ismS_SubjectName || marks.ISMS_SubjectName || marks.subjectName || '-'}</td>
                                                <td>{marks.eyceS_MaxMarks ?? marks.EYCES_MaxMarks ?? marks.estmpS_MaxMarks ?? marks.ESTMPS_MaxMarks ?? 0}</td>
                                                <td>{marks.eyceS_MinMarks ?? marks.EYCES_MinMarks ?? marks.estmpS_MinMarks ?? marks.ESTMPS_MinMarks ?? 0}</td>
                                                <td className="font-bold">
                                                    {marks.estmpS_PassFailFlg === 'AB' || marks.ESTMPS_PassFailFlg === 'AB'
                                                        ? 'AB'
                                                        : (marks.eyceS_MarksDisplayFlg !== false
                                                            ? (marks.estmpS_ObtainedMarks ?? marks.ESTMPS_ObtainedMarks ?? '-')
                                                            : '-')}
                                                </td>
                                                <td className="font-bold">
                                                    {marks.estmpS_PassFailFlg === 'AB' || marks.ESTMPS_PassFailFlg === 'AB'
                                                        ? 'AB'
                                                        : (marks.estmpS_ObtainedGrade || marks.ESTMPS_ObtainedGrade || '-')}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="mes-header-bg font-bold">
                                            <td colSpan={2} className="text-right px-4 uppercase">GRAND TOTAL</td>
                                            <td>{report.estmP_TotalMaxMarks ?? report.ESTMP_TotalMaxMarks ?? 0}</td>
                                            <td>{report.estmP_MinMarks ?? report.ESTMP_MinMarks ?? 0}</td>
                                            <td>{report.estmP_TotalObtMarks ?? report.ESTMP_TotalObtMarks ?? 0}</td>
                                            <td>{report.estmP_TotalGrade || report.ESTMP_TotalGrade || '-'}</td>
                                        </tr>
                                        <tr className="mes-header-bg font-bold">
                                            <td colSpan={2} className="text-right px-4 uppercase">PERCENTAGE</td>
                                            <td colSpan={4} className="text-center">{report.estmP_Percentage ?? report.ESTMP_Percentage ?? 0}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Co-Scholastic & Chart Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <div className="bg-blue-900 text-white text-center py-1 mb-1 font-bold text-xs uppercase">Co-Scholastic Performance</div>
                                    <table className="mes-table">
                                        <thead>
                                            <tr className="mes-header-bg">
                                                <th className="text-left px-4">Subject</th>
                                                <th className="w-20">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coScholasticMarks.map((marks, mIndex) => (
                                                <tr key={mIndex}>
                                                    <td className="text-left px-4">{marks.ismS_SubjectName}</td>
                                                    <td className="font-bold">{marks.estmpS_ObtainedGrade}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col border border-gray-300 p-2 rounded">
                                    <div className="bg-blue-900 text-white text-center py-1 mb-2 font-bold text-xs uppercase">Subject Analysis</div>
                                    <div className="flex-1 min-h-[150px] relative">
                                        {/* Canvas for screen */}
                                        <div className="no-print">
                                            <PerformanceChart
                                                studentId={report.amsT_Id}
                                                chartData={chartData}
                                                onChartReady={handleChartReady}
                                            />
                                        </div>
                                        {/* Image for print */}
                                        {chartImages[report.amsT_Id] && (
                                            <img
                                                src={chartImages[report.amsT_Id]}
                                                alt="Performance Analysis"
                                                className="hidden print:block w-full h-auto object-contain"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="mb-8">
                                <div className="bg-blue-900 text-white px-4 py-1 font-bold text-xs uppercase inline-block mb-2">Class Teacher's Remarks</div>
                                <div className="border-b-2 border-dotted border-gray-400 pb-2 italic text-sm">
                                    {promotionRemarks.find(p => p.amsT_Id === report.amsT_Id)?.emeR_Remarks || 'Satisfactory progress shown in all subjects.'}
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-3 gap-8 text-center mt-12 mb-8">
                                <div className="pt-2 border-t border-black">
                                    <p className="text-xs font-bold uppercase">Class Teacher</p>
                                </div>
                                <div className="pt-2 border-t border-black">
                                    <p className="text-xs font-bold uppercase">Principal</p>
                                </div>
                                <div className="pt-2 border-t border-black">
                                    <p className="text-xs font-bold uppercase">Parent</p>
                                </div>
                            </div>

                            {/* Grading Scale */}
                            <div className="mt-auto pt-4">
                                <table className="mes-table" style={{ fontSize: '10px', width: '80%', margin: '0 auto' }}>
                                    <thead>
                                        <tr className="mes-header-bg">
                                            <th colSpan={8}>ACADEMIC GRADING SCALE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="font-bold mes-header-bg">Grade</td>
                                            <td>A+</td><td>A</td><td>B+</td><td>B</td><td>C+</td><td>C</td><td>D</td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold mes-header-bg">Range</td>
                                            <td>91-100</td><td>81-90</td><td>71-80</td><td>61-70</td><td>51-60</td><td>41-50</td><td>0-40</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {index < reportData.length - 1 && <div className="mes-page-break" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
