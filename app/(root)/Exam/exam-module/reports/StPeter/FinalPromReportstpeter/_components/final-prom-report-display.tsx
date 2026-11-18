'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
    data: any;
    date: string;
    exmname: string;
    logo: boolean;
    academicYear: string;
    className: string;
    sectionName: string;
    studentsCount: number;
    onPrint?: () => void;
}

function PerformanceChart({
    studentId,
    chartData,
    onChartReady
}: {
    studentId: number;
    chartData?: { subjects: string[]; marks: number[]; average: number[] };
    onChartReady?: (id: number, dataUrl: string) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current || !chartData || chartData.subjects.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let isMounted = true;

        const loadChart = async () => {
            const ChartJS = (await import('chart.js/auto')).default;
            if (!isMounted) return;

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const existingChart = ChartJS.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            chartRef.current = new ChartJS(canvas, {
                type: 'bar',
                data: {
                    labels: chartData.subjects,
                    datasets: [
                        {
                            label: 'Marks Obtained',
                            data: chartData.marks,
                            backgroundColor: 'rgb(63,81,181)',
                            borderColor: 'black',
                            borderWidth: 1
                        },
                        {
                            label: 'Average Marks',
                            data: chartData.average,
                            backgroundColor: 'rgb(255,87,34)',
                            borderColor: 'black',
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { maxRotation: 70, minRotation: 70 }
                        },
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true }
                    },
                    animation: {
                        duration: 1,
                        onComplete: () => {
                            if (onChartReady && canvas) {
                                onChartReady(studentId, canvas.toDataURL());
                            }
                        }
                    }
                }
            });
        };

        loadChart();

        return () => {
            isMounted = false;
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [chartData, studentId, onChartReady]);

    if (!chartData || chartData.subjects.length === 0) return null;

    return (
        <div className='relative h-[250px] w-full'>
            <canvas ref={canvasRef} id={`pieChart${studentId}`} className='h-[250px] max-w-full' />
        </div>
    );
}

export default function FinalPromReportDisplay({
    data,
    date,
    exmname,
    logo,
    academicYear,
    className,
    sectionName,
    studentsCount,
    onPrint
}: Props) {
    const [chartImages, setChartImages] = useState<Record<number, string>>({});

    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseskillslist = [],
        getstudentwiseactiviteslist = [],
        getstudent_examwisemarks = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        gettermdetails = [],
        getallgrade = [],
        gettermlist = [],
        present_attendence = [],
        getpromotionremarksdetails = []
    } = data;

    // Build groupwiseexamlist like original JS
    const groupwiseexamlist: any[] = [];
    const getgroupdetails_computed = getgroupdetails.map((dd: any) => {
        const temp: any[] = [];
        let counttotal = 0;
        getgroupexamdetails.forEach((d: any) => {
            if (dd.empG_DistplayName === d.empG_DistplayName) {
                counttotal += d.empsgE_ForMaxMarkrs;
                temp.push({
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName // Use code or name as fallback
                });

                groupwiseexamlist.push({
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName
                });
            }
        });

        temp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total'
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total'
        });

        return { ...dd, empsG_MarksValue: counttotal, groupewiseexam: temp };
    });

    const handleChartReady = useCallback((id: number, dataUrl: string) => {
        setChartImages((prev) => ({ ...prev, [id]: dataUrl }));
    }, []);

    const handlePrintClick = useCallback(() => {
        getstudentdetails.forEach((stu: any) => {
            const canvas = document.getElementById(`pieChart${stu.amsT_Id}`) as HTMLCanvasElement;
            if (canvas) {
                setChartImages((prev) => ({ ...prev, [stu.amsT_Id]: canvas.toDataURL() }));
            }
        });
        setTimeout(() => {
            if (onPrint) onPrint();
            else window.print();
        }, 300);
    }, [getstudentdetails, onPrint]);

    return (
        <>
            <style jsx global>{`
                .prom-report { font-family: system-ui, sans-serif; color: black; }
                .prom-table { width: 100%; border-collapse: collapse; background-color: transparent !important; }
                .prom-table th, .prom-table td { border: 0.5px solid #727272 !important; padding: 5px; }
                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .chart-image { display: none; }
                .width-250 { width: 250px; }
                .width-50 { width: 50px; }
                .watermark-bg {
                    background-image: url('https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/38284ed8-f9d6-47e6-bdb0-9da0e125defd.jpg');
                    background-size: 300px 250px !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    border: none;
                }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .page-break { page-break-before: always !important; }
                    .chart-canvas { display: none; }
                    .chart-image { display: block !important; width: 98% !important; object-fit: contain !important; height: 230px !important; }
                }
            `}</style>

            <div className='no-print my-4 flex justify-end'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All
                </Button>
            </div>

            <div id='print-area' className='prom-report'>
                {getstudentdetails.map((report: any, index: number) => {
                    const studentMarks = getstudentmarksdetails.filter((m: any) => m.amsT_Id === report.amsT_Id);
                    const studentSubjects = getstudentwisesubjectlist.filter((s: any) => s.amsT_Id === report.amsT_Id);
                    const studentActivities = getstudentwiseactiviteslist.filter((a: any) => a.amsT_Id === report.amsT_Id);
                    const studentAttendance = present_attendence.find((a: any) => a.amsT_Id === report.amsT_Id);
                    const remarksDetails = getpromotionremarksdetails.find((r: any) => r.amsT_Id === report.amsT_Id);

                    // Group skills by ECACTA_SkillArea
                    const uniqueActivities = Array.from(new Set(studentActivities.map((a: any) => a.ECACTA_SkillArea)));

                    // Chart data
                    const chartSubjects = studentSubjects;
                    const chartData = {
                        subjects: chartSubjects.map((s: any) => s.subjectName),
                        marks: chartSubjects.map((s: any) => s.subjectObtainedMarks || 0),
                        average: chartSubjects.map((s: any) => s.subjectPercentage || 0)
                    };

                    return (
                        <div key={report.amsT_Id} className={index > 0 ? 'page-break' : ''}>
                            {logo ? (
                                <div className='col-sm-12' style={{ textAlign: 'center', margin: '10px 0' }}>
                                    <img
                                        src='https://kusumadata.blob.core.windows.net/files/20/ISM_Attachments/1d090996-9909-403b-aed1-4a45291e3797.jpg'
                                        style={{ width: '100%', height: 'auto' }}
                                        alt='Logo'
                                    />
                                </div>
                            ) : (
                                <div className='col-sm-12' style={{ marginTop: '130px' }}>
                                    &nbsp;
                                </div>
                            )}

                            <div className='pagelayout'>
                                <table className='prom-table watermark-bg'>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: 'none' }}>
                                                <table className='prom-table' style={{ border: 'none' }}>
                                                    <tbody>
                                                        <tr>
                                                            <th
                                                                colSpan={4}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    width: '100%',
                                                                    fontSize: '18px',
                                                                    border: 'none'
                                                                }}>
                                                                <span>
                                                                    {exmname} REPORT CARD {academicYear}
                                                                </span>
                                                            </th>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{ fontSize: '12px', border: 'none' }}
                                                                className='text-left'
                                                                width='80%'>
                                                                <div className='flex'>
                                                                    <div className='w-[10%]'>&nbsp;</div>
                                                                    <div className='w-[90%]'>
                                                                        <b>NAME &nbsp;:&nbsp;{report.studentName?.toUpperCase()}</b>
                                                                    </div>
                                                                </div>
                                                                <div className='flex'>
                                                                    <div className='w-[10%]'>&nbsp;</div>
                                                                    <div className='w-[90%]'>
                                                                        <b>
                                                                            CLASS &nbsp;:&nbsp;{className}-{sectionName?.toUpperCase()}
                                                                        </b>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td
                                                                width='20%'
                                                                style={{ fontSize: '12px', border: 'none', verticalAlign: 'top' }}>
                                                                <b>NO. IN CLASS&nbsp;:&nbsp;{studentsCount}</b>
                                                            </td>
                                                            <td
                                                                width='20%'
                                                                style={{ fontSize: '12px', border: 'none', verticalAlign: 'top' }}>
                                                                <b>
                                                                    ATTENDANCE&nbsp;:{' '}
                                                                    {studentAttendance
                                                                        ? `${Number(studentAttendance.ATTENDANCEPERCENTAGE).toFixed(0)}%`
                                                                        : ''}
                                                                </b>
                                                            </td>
                                                            <td
                                                                width='20%'
                                                                style={{ fontSize: '12px', border: 'none', verticalAlign: 'top' }}>
                                                                <b>STUDENT&apos;S ID&nbsp;:&nbsp;{report.admissionNo}</b>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th
                                                                colSpan={4}
                                                                style={{
                                                                    textAlign: 'center',
                                                                    fontSize: '13px',
                                                                    border: 'none',
                                                                    paddingTop: '10px'
                                                                }}>
                                                                <b>STATEMENT OF MARKS</b>
                                                            </th>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table className='prom-table mt-2'>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ fontSize: '13px' }} className='width-250'>
                                                                SUBJECTS
                                                            </th>
                                                            {getgroupdetails_computed.map((grp: any, idx: number) => (
                                                                <th
                                                                    key={idx}
                                                                    style={{ fontSize: '13px' }}
                                                                    colSpan={grp.groupewiseexam.length}>
                                                                    <span>{grp.empG_DistplayName}</span>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                        <tr>
                                                            <th style={{ borderBottom: '0.5px solid #727272 !important' }}></th>
                                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                                <th
                                                                    key={eIdx}
                                                                    style={{ fontSize: '13px', textAlign: 'center', width: '70px' }}>
                                                                    {grpexam.examnamedisplay !== 'Total' &&
                                                                        grpexam.examnamedisplay !== 'AVG' &&
                                                                        gettermlist
                                                                            .filter((m: any) => grpexam.EME_Id === m.EME_Id)
                                                                            .map((maxmarks: any, mIdx: number) => (
                                                                                <span key={mIdx}>
                                                                                    {maxmarks.ROWNUMBER === 1
                                                                                        ? maxmarks.EYCES_MarksEntryMax
                                                                                        : `/${maxmarks.EYCES_MarksEntryMax}`}
                                                                                </span>
                                                                            ))}
                                                                    {grpexam.examnamedisplay === 'Total' &&
                                                                        grpexam.examnamedisplay !== 'AVG' &&
                                                                        grpexam.examnamedisplay !== 'Marks Obtained' && (
                                                                            <span>{grpexam.EMPSGE_ForMaxMarkrs}</span>
                                                                        )}
                                                                    {grpexam.examnamedisplay === 'AVG' &&
                                                                        grpexam.examnamedisplay !== 'Total' &&
                                                                        grpexam.examnamedisplay !== 'Marks Obtained' && (
                                                                            <span>{grpexam.examnamedisplay}</span>
                                                                        )}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentSubjects.map((subj: any, sIdx: number) => (
                                                            <tr key={sIdx}>
                                                                <td
                                                                    style={{ fontSize: '12px', wordWrap: 'break-word' }}
                                                                    className='text-left'>
                                                                    <span style={{ fontWeight: 600 }}>
                                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.subjectName}
                                                                    </span>
                                                                </td>
                                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                    const mrks = studentMarks.find(
                                                                        (m: any) =>
                                                                            subj.subjectName === m.ismS_SubjectName &&
                                                                            grpexam.EME_Id === m.emE_Id &&
                                                                            m.empsG_DisplayName === grpexam.EMPG_DistplayName
                                                                    );
                                                                    return (
                                                                        <td
                                                                            key={eIdx}
                                                                            style={{ fontSize: '12px' }}
                                                                            className='width-50 text-center'>
                                                                            {mrks && (
                                                                                <>
                                                                                    {['AB', 'M', 'L'].includes(mrks.passFailFlag) && (
                                                                                        <span>{mrks.passFailFlag}</span>
                                                                                    )}
                                                                                    {mrks.obtainedMarks >= 0 &&
                                                                                        !['AB', 'M', 'L'].includes(mrks.passFailFlag) &&
                                                                                        grpexam.EME_ExamName !== 'AVG' &&
                                                                                        mrks.eyceS_MarksDisplayFlg === 'true' && (
                                                                                            <span>{mrks.obtainedMarks}</span>
                                                                                        )}
                                                                                    {mrks.obtainedMarks >= 0 &&
                                                                                        !['AB', 'M', 'L'].includes(mrks.passFailFlag) &&
                                                                                        grpexam.EME_ExamName !== 'AVG' &&
                                                                                        mrks.eyceS_GradeDisplayFlg === 'true' && (
                                                                                            <span>{mrks.obtainedGrade}</span>
                                                                                        )}
                                                                                    {!['AB', 'M', 'L'].includes(mrks.passFailFlag) &&
                                                                                        grpexam.EME_ExamName === 'AVG' &&
                                                                                        mrks.eyceS_MarksDisplayFlg === 'true' && (
                                                                                            <b>{mrks.obtainedMarks}</b>
                                                                                        )}
                                                                                    {!['AB', 'M', 'L'].includes(mrks.passFailFlag) &&
                                                                                        grpexam.EME_ExamName === 'AVG' &&
                                                                                        mrks.eyceS_GradeDisplayFlg === 'true' && (
                                                                                            <b>{mrks.obtainedGrade}</b>
                                                                                        )}
                                                                                </>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td style={{ fontSize: '12px' }} className='text-left'>
                                                                <span style={{ fontWeight: 700 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOTAL</span>
                                                            </td>
                                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                const mrks = getstudent_examwisemarks.find(
                                                                    (m: any) =>
                                                                        grpexam.EME_Id === m.emE_Id &&
                                                                        m.empsG_DisplayName === grpexam.EMPG_DistplayName &&
                                                                        grpexam.EME_Id === 9800000 &&
                                                                        m.amsT_Id === report.amsT_Id
                                                                );
                                                                return (
                                                                    <td key={eIdx} style={{ fontSize: '12px' }} className='text-center'>
                                                                        {mrks && (
                                                                            <span style={{ fontWeight: 700 }}>
                                                                                {mrks.obtainedMarks ||
                                                                                    mrks.ESTMPP_TotalObtMarks ||
                                                                                    mrks.TotalMarks}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td style={{ fontSize: '12px' }} className='text-left'>
                                                                <span style={{ fontWeight: 700 }}>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PERCENTAGE
                                                                </span>
                                                            </td>
                                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                const mrks = getstudent_examwisemarks.find(
                                                                    (m: any) =>
                                                                        grpexam.EME_Id === m.emE_Id &&
                                                                        m.empsG_DisplayName === grpexam.EMPG_DistplayName &&
                                                                        grpexam.EME_Id === 9800000 &&
                                                                        m.amsT_Id === report.amsT_Id
                                                                );
                                                                return (
                                                                    <td key={eIdx} style={{ fontSize: '12px' }} className='text-center'>
                                                                        {mrks && (
                                                                            <span style={{ fontWeight: 700 }}>
                                                                                {Number(
                                                                                    mrks.totalPercentage ||
                                                                                        mrks.TotalPercentage ||
                                                                                        mrks.ESTMPP_Percentage ||
                                                                                        0
                                                                                ).toFixed(0)}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                        <tr>
                                                            <td style={{ fontSize: '12px' }} className='text-left'>
                                                                <span style={{ fontWeight: 700 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RANK</span>
                                                            </td>
                                                            {groupwiseexamlist.map((grpexam: any, eIdx: number) => {
                                                                const mrks = getstudent_examwisemarks.find(
                                                                    (m: any) =>
                                                                        grpexam.EME_Id === m.emE_Id &&
                                                                        m.empsG_DisplayName === grpexam.EMPG_DistplayName &&
                                                                        grpexam.EME_Id === 9800000 &&
                                                                        m.amsT_Id === report.amsT_Id
                                                                );
                                                                return (
                                                                    <td key={eIdx} style={{ fontSize: '12px' }} className='text-center'>
                                                                        {mrks && (
                                                                            <span style={{ fontWeight: 700 }}>
                                                                                {mrks.estmpP_SectionRank ||
                                                                                    mrks.ESTMPP_SectionRank ||
                                                                                    mrks.SectionRank}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <div className='mt-2 flex w-full gap-2'>
                                                    {/* Personality Profile */}
                                                    <div className='w-[60%]'>
                                                        <table className='prom-table'>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ fontSize: '10px', fontWeight: 500 }} className='text-left'>
                                                                        &nbsp;&nbsp;&nbsp;PERSONALITY PROFILE
                                                                    </th>
                                                                    <th style={{ fontSize: '13px' }}>First Term</th>
                                                                    <th style={{ fontSize: '13px' }}>Second Term</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {[
                                                                    'IS SELF-MOTIVATED AND COMPLETES TASK',
                                                                    'WORKS WELL WITH MINIMUM DIRECTION',
                                                                    'ORIGINATES IDEAS BUT NEEDS CONSTANT GUIDANCE',
                                                                    'CONTRIBUTES READILY',
                                                                    'SOMETIMES TAKES PART',
                                                                    'EASILY DISTRACTED',
                                                                    'VERY CAREFUL WORKER',
                                                                    'USUALLY NEAT',
                                                                    'ACCEPTS RESPONSIBILITY FOR LEARNING'
                                                                ].map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td style={{ fontSize: '11px', textAlign: 'left' }}>
                                                                            &middot; &nbsp;{item}
                                                                        </td>
                                                                        <td className='text-center'>
                                                                            <input type='checkbox' readOnly />
                                                                        </td>
                                                                        <td className='text-center'>
                                                                            <input type='checkbox' readOnly />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {(getallgrade?.length || 0) <= 1 && (
                                                                    <tr>
                                                                        <td style={{ fontSize: '11px' }}>&nbsp;</td>
                                                                        <td>&nbsp;</td>
                                                                        <td>&nbsp;</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Performance Analysis Chart */}
                                                    <div className='w-[40%]'>
                                                        <table className='prom-table h-full'>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ fontSize: '13px', borderLeft: '0px !important' }}>
                                                                        PERFORMANCE ANALYSIS(TOTAL)
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            borderLeft: 'none !important',
                                                                            borderBottom: '0px !important',
                                                                            height: '252px',
                                                                            position: 'relative'
                                                                        }}>
                                                                        <div className='chart-canvas'>
                                                                            <PerformanceChart
                                                                                studentId={report.amsT_Id}
                                                                                chartData={chartData}
                                                                                onChartReady={handleChartReady}
                                                                            />
                                                                        </div>
                                                                        {chartImages[report.amsT_Id] && (
                                                                            <img
                                                                                src={chartImages[report.amsT_Id]}
                                                                                className='chart-image'
                                                                                alt='Chart'
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className='mt-2 w-full'>
                                                    <table className='prom-table'>
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        width: '183px',
                                                                        borderRight: 'none !important',
                                                                        fontSize: '12px',
                                                                        height: '70px',
                                                                        padding: '10px'
                                                                    }}
                                                                    className='text-left'>
                                                                    <span>REMARKS :</span>
                                                                </td>
                                                                <td style={{ verticalAlign: 'top', padding: '10px' }}>
                                                                    <span>{remarksDetails?.remarks || ''}</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <table className='prom-table mt-4' style={{ border: 'none' }}>
                                                        <tbody>
                                                            <tr>
                                                                <th
                                                                    style={{
                                                                        height: '70px',
                                                                        fontSize: '12px',
                                                                        verticalAlign: 'bottom',
                                                                        border: 'none'
                                                                    }}
                                                                    className='width-250'>
                                                                    <span>DATE</span>
                                                                </th>
                                                                <th
                                                                    style={{
                                                                        height: '70px',
                                                                        fontSize: '12px',
                                                                        verticalAlign: 'bottom',
                                                                        border: 'none'
                                                                    }}
                                                                    className='width-250'>
                                                                    <span>PRINCIPAL&apos;S SIGNATURE</span>
                                                                </th>
                                                                <th
                                                                    style={{
                                                                        height: '70px',
                                                                        fontSize: '12px',
                                                                        verticalAlign: 'bottom',
                                                                        border: 'none'
                                                                    }}
                                                                    className='width-250'>
                                                                    <span>CLASS TEACHER&apos;S SIGNATURE</span>
                                                                </th>
                                                                <th
                                                                    style={{
                                                                        height: '70px',
                                                                        fontSize: '12px',
                                                                        verticalAlign: 'bottom',
                                                                        border: 'none'
                                                                    }}
                                                                    className='width-250'>
                                                                    <span>PARENT&apos;S SIGNATURE</span>
                                                                </th>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
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
