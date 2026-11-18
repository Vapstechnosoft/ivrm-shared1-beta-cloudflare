'use client';

import { Button } from '@/components/ui/button';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { useReactToPrint } from 'react-to-print';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportViewProps {
    data: any; // Using any to handle both response types
    params: any;
}

const ReportView = ({ data, params }: ReportViewProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Promotion_Report_Card'
    });

    if (!data || !data.getstudentdetails || data.getstudentdetails.length === 0) {
        return <div className='p-4 text-center'>No data available to display.</div>;
    }

    const institution = data.getinstitution?.[0] || {};
    const students = data.getstudentdetails || [];
    const teacherData = data.clstchname?.[0] || {};

    // Helper to get property by name (case-insensitive)
    const getProp = (obj: any, propName: string) => {
        if (!obj) return '';
        const key = Object.keys(obj).find((k) => k.toLowerCase() === propName.toLowerCase());
        return key ? obj[key] : '';
    };

    return (
        <div className='mx-auto flex w-[1400px] flex-col'>
            <div className='-mt-12 relative z-10 mb-4 flex justify-end pr-0'>
                <Button
                    onClick={() => handlePrint()}
                    className='h-8 w-24 rounded bg-blue-600 text-white text-xs shadow-sm hover:bg-blue-700'>
                    <Printer className='mr-1 h-3 w-3' /> Print
                </Button>
            </div>

            <div ref={componentRef} className='print-area rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                {students.map((student: any, index: number) => {
                    const studentId = getProp(student, 'AMST_Id');

                    // Filter marks for this student from getstudentwisesubjectlist
                    const studentMarks = (data.getstudentwisesubjectlist || []).filter((m: any) => getProp(m, 'AMST_Id') === studentId);

                    // If empty, try to get all marks (if only one student)
                    const activeMarks = studentMarks.length > 0 ? studentMarks : data.getstudentwisesubjectlist || [];

                    // Overall summary for this student
                    const overall =
                        (data.getexammaxmarks || []).find((o: any) => getProp(o, 'AMST_Id') === studentId) ||
                        data.getexammaxmarks?.[0] ||
                        {};

                    // Prepare Chart Data
                    // Try getpromotionremarksdetails first for class average, fallback to student marks
                    const remarksSource = (data.getpromotionremarksdetails || []).filter((r: any) => getProp(r, 'AMST_Id') === studentId);

                    const chartSource = remarksSource.length > 0 ? remarksSource : activeMarks;

                    const chartLabels = chartSource.map((r: any) => getProp(r, 'subjectName') || getProp(r, 'ESTM_SubjectName'));
                    const chartMarks = chartSource.map(
                        (r: any) => getProp(r, 'subjectObtainedMarks') || getProp(r, 'ESTMPS_ObtainedMarks')
                    );
                    const chartAvg = chartSource.map((r: any) => getProp(r, 'ESTMPS_ClassAverage') || 0);

                    const chartData = {
                        labels: chartLabels,
                        datasets: [
                            {
                                label: 'Student Marks',
                                data: chartMarks,
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Class Average',
                                data: chartAvg,
                                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            }
                        ]
                    };

                    const chartOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 0 // Disable animation for print reliability
                        },
                        plugins: {
                            legend: {
                                position: 'top' as const,
                                labels: { font: { size: 10 } }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { font: { size: 8 } }
                            },
                            x: {
                                ticks: { font: { size: 8 }, autoSkip: false, maxRotation: 45 }
                            }
                        }
                    };

                    const studentName =
                        getProp(student, 'studentName') ||
                        `${getProp(student, 'AMST_FirstName')} ${getProp(student, 'AMST_LastName')}`.trim();

                    return (
                        <div
                            key={studentId || index}
                            className='report-card relative mx-auto mb-10 w-full overflow-hidden border-2 border-black bg-white p-10 shadow-lg'
                            style={{ minHeight: '290mm', pageBreakAfter: 'always' }}>
                            {/* Header */}
                            <div className='mb-6 border-black border-b-2 pb-4 text-center'>
                                <div className='mb-4 flex items-start justify-between'>
                                    <div className='w-32'>
                                        {institution.mI_Logo && <img src={institution.mI_Logo} alt='Logo' className='h-auto w-full' />}
                                    </div>
                                    <div className='flex-1 px-8'>
                                        <h1 className='font-bold text-3xl uppercase tracking-tight'>{institution.mI_Name}</h1>
                                        <p className='text-gray-700 text-sm italic'>
                                            {institution.mI_Address1} {institution.mI_Address2} {institution.mI_Address3}{' '}
                                            {institution.ivrmmcT_Name} - {institution.mI_Pincode}
                                        </p>
                                        <p className='mt-2 font-bold text-base text-blue-900 uppercase'>
                                            Affiliation No: {institution.mI_Affiliation || 'N/A'}
                                        </p>
                                    </div>
                                    <div className='w-32'></div>
                                </div>
                                <div className='border-black border-t-2 bg-gray-100 py-2'>
                                    <h2 className='font-bold text-xl tracking-widest'>PROGRESS REPORT CARD</h2>
                                    <p className='font-semibold text-lg'>ACADEMIC SESSION: {params.ASMA_Year || ''}</p>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className='mb-8 grid grid-cols-2 gap-x-12 gap-y-3 border-black border-b-2 pb-4 font-bold text-sm'>
                                <div className='flex gap-4'>
                                    <span>NAME:</span>{' '}
                                    <span className='flex-1 border-black border-b-2 border-dotted text-base uppercase'>{studentName}</span>
                                </div>
                                <div className='flex gap-4'>
                                    <span>CLASS & SEC:</span>{' '}
                                    <span className='flex-1 border-black border-b-2 border-dotted text-base uppercase'>
                                        {getProp(student, 'className')} - {getProp(student, 'sectionName')}
                                    </span>
                                </div>
                                <div className='flex gap-4'>
                                    <span>ROLL NO:</span>{' '}
                                    <span className='flex-1 border-black border-b-2 border-dotted text-base'>
                                        {getProp(student, 'AMAY_RollNo') || 'N/A'}
                                    </span>
                                </div>
                                <div className='flex gap-4'>
                                    <span>ADM. NO:</span>{' '}
                                    <span className='flex-1 border-black border-b-2 border-dotted text-base uppercase'>
                                        {getProp(student, 'admissionNo')}
                                    </span>
                                </div>
                                <div className='flex gap-4'>
                                    <span>FATHER'S NAME:</span>{' '}
                                    <span className='flex-1 border-black border-b-2 border-dotted text-base uppercase'>
                                        {getProp(student, 'AMST_FatherName') || 'N/A'}
                                    </span>
                                </div>
                                <div className='flex gap-4'>
                                    <span>MOTHER'S NAME:</span>{' '}
                                    <span className='flex-1 border-black border-b-2 border-dotted text-base uppercase'>
                                        {getProp(student, 'AMST_MotherName') || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <div className='mb-8'>
                                <table className='w-full border-collapse border-2 border-black text-sm'>
                                    <thead>
                                        <tr className='bg-gray-200'>
                                            <th className='border-2 border-black p-3 text-left font-black'>SUBJECT NAME</th>
                                            <th className='w-32 border-2 border-black p-3 text-center font-black'>MAX MARKS</th>
                                            <th className='w-32 border-2 border-black p-3 text-center font-black'>OBT. MARKS</th>
                                            <th className='w-32 border-2 border-black p-3 text-center font-black'>GRADE</th>
                                            <th className='w-40 border-2 border-black p-3 text-center font-black'>REMARKS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeMarks.map((mark: any, mIdx: number) => (
                                            <tr key={mIdx} className='transition-colors hover:bg-gray-50'>
                                                <td className='border border-black p-3 font-bold text-base uppercase'>
                                                    {getProp(mark, 'subjectName')}
                                                </td>
                                                <td className='border border-black p-3 text-center text-base'>
                                                    {getProp(mark, 'subjectMaxMarks')}
                                                </td>
                                                <td className='border border-black p-3 text-center font-black text-lg'>
                                                    {getProp(mark, 'subjectObtainedMarks')}
                                                </td>
                                                <td className='border border-black p-3 text-center font-bold text-base'>
                                                    {getProp(mark, 'subjectGrade')}
                                                </td>
                                                <td className='border border-black p-3 text-center text-sm italic'>
                                                    {getProp(mark, 'subjectGrade') === 'F' ? 'Re-test' : ''}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className='bg-gray-100 font-black'>
                                            <td className='border-2 border-black p-3 text-right text-lg'>GRAND TOTAL</td>
                                            <td className='border-2 border-black p-3 text-center text-lg'>
                                                {getProp(overall, 'overallMaxMarks')}
                                            </td>
                                            <td className='border-2 border-black p-3 text-center text-blue-800 text-xl'>
                                                {getProp(overall, 'overallObtainedMarks')}
                                            </td>
                                            <td className='border-2 border-black p-3 text-center text-lg'>
                                                {getProp(overall, 'totalGrade')}
                                            </td>
                                            <td className='border-2 border-black p-3 text-center text-lg'>
                                                {getProp(overall, 'overallPercentage')}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Chart */}
                            <div className='mb-8 border-2 border-black bg-white p-4 shadow-inner' style={{ height: '350px' }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>

                            {/* Summary Section */}
                            <div className='mb-8 grid grid-cols-2 gap-8'>
                                <div className='rounded-sm border-2 border-black p-4'>
                                    <p className='mb-3 border-black border-b-2 font-black text-blue-900 text-xs uppercase tracking-wider'>
                                        Result / Promotion Status
                                    </p>
                                    <p className='py-2 font-black text-green-700 text-lg uppercase'>
                                        {getProp(overall, 'overallResult') || 'N/A'}
                                    </p>
                                </div>
                                <div className='rounded-sm border-2 border-black p-4'>
                                    <p className='mb-3 border-black border-b-2 font-black text-blue-900 text-xs uppercase tracking-wider'>
                                        Attendance
                                    </p>
                                    <p className='py-2 font-black text-lg'>
                                        {getProp(student, 'presentDays') || '0'} / {getProp(student, 'totalWorkingDays') || '0'} Days{' '}
                                        <span className='font-normal text-sm'>({getProp(student, 'attendancePercentage') || '0'}%)</span>
                                    </p>
                                </div>
                            </div>

                            {/* Teacher/Principal Remarks */}
                            <div className='mb-12 rounded-sm border-2 border-black p-4'>
                                <p className='mb-3 border-black border-b-2 font-black text-blue-900 text-xs uppercase tracking-wider'>
                                    Class Teacher's Remarks
                                </p>
                                <p className='min-h-[50px] py-2 font-medium text-base text-gray-800 italic'>
                                    "{getProp(student, 'skillRemarks') || 'N/A'}"
                                </p>
                            </div>

                            {/* Signatures */}
                            <div className='mt-auto flex items-end justify-between px-4 pt-10'>
                                <div className='w-60 text-center'>
                                    <p className='mb-12 font-black text-gray-800 text-sm uppercase'>
                                        {getProp(teacherData, 'hrmE_EmployeeFirstName') || 'Class Teacher'}
                                    </p>
                                    <div className='border-black border-t-2 pt-2'>
                                        <p className='font-black text-[10px] uppercase tracking-widest'>Class Teacher</p>
                                    </div>
                                </div>
                                <div className='w-60 text-center'>
                                    <div className='mb-4 h-16'></div>
                                    <div className='border-black border-t-2 pt-2'>
                                        <p className='font-black text-[10px] uppercase tracking-widest'>Principal</p>
                                    </div>
                                </div>
                                <div className='w-60 text-center'>
                                    <div className='mb-4 h-16'></div>
                                    <div className='border-black border-t-2 pt-2'>
                                        <p className='font-black text-[10px] uppercase tracking-widest'>Parent's Signature</p>
                                    </div>
                                </div>
                            </div>

                            {/* Page Info */}
                            <div className='absolute right-4 bottom-2 text-[8px] text-gray-400'>
                                Generated on: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        visibility: hidden !important;
                        background: white !important;
                    }
                    .print-area, .print-area * {
                        visibility: visible !important;
                    }
                    .print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .report-card {
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: 2px solid black !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        page-break-after: always !important;
                        display: flex !important;
                        flex-direction: column !important;
                        padding: 10mm !important; /* Reset padding for print */
                    }
                    .report-card * {
                        font-size: 10pt !important; /* Standardize font size for print */
                    }
                    .report-card h1 { font-size: 18pt !important; }
                    .report-card h2 { font-size: 14pt !important; }
                    .no-print {
                        display: none !important;
                    }
                    canvas {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Aggressive font colors for black & white printers */
                    h1, h2, p, span, td, th {
                        color: black !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReportView;
