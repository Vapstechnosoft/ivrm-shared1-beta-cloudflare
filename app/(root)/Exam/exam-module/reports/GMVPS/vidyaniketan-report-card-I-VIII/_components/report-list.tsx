import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import * as XLSX from 'xlsx';

interface VidyaniketanReportViewProps {
    data: any[];
    institution: IMasterInstitution | Institution | null;
}

const VidyaniketanReportView = ({ data, institution }: VidyaniketanReportViewProps) => {
    const handleExport = () => {
        const table = document.getElementById('printable-area');
        if (table) {
            const wb = XLSX.utils.table_to_book(table);
            XLSX.writeFile(wb, 'Vidyaniketan_Progress_Card_Report.xlsx');
        }
    };
    const handlePrint = () => {
        window.print();
    };

    const barChartData = [
        { subject: 'English', score: 75 },
        { subject: 'Hindi', score: 93 },
        { subject: 'Kannada', score: 83 },
        { subject: 'Mathematics', score: 75.5 },
        { subject: 'Science', score: 80 },
        { subject: 'Social Science', score: 55.5 }
    ];

    return (
        <div>
            <style>
                {`
            @media print {
                @page { margin: 10mm; }
                body {
                    visibility: hidden;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                #printable-area, #printable-area * {
                    visibility: visible;
                }
                #printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
            `}
            </style>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExport}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
            </div>

            <div id='printable-area' className='min-w-[800px] bg-white p-4 font-sans text-[13px]'>
                {/* Header Title */}
                <img src={institution?.mI_Logo} alt='Institution Logo' />
                <h2 className='mb-6 text-center font-bold text-sky-800 text-xl uppercase'>ACHIEVEMENT RECORD 2025-2026</h2>

                {/* Student Info Section */}
                <div className='mb-6 flex items-start justify-between font-bold text-[13px] text-sky-800'>
                    <div className='flex w-3/4 flex-col gap-2'>
                        <div className='flex'>
                            <span className='w-48 text-black'>Name of the Student</span> <span className='w-4 text-black'>:</span>{' '}
                            <span className='text-black uppercase'>AAHAN N H</span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 text-black'>Admission Number</span> <span className='w-4 text-black'>:</span>{' '}
                            <span className='text-black'>6859</span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 text-black'>Class & Section</span> <span className='w-4 text-black'>:</span>{' '}
                            <span className='text-black uppercase'>IV A</span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 text-black'>Date of Birth</span> <span className='w-4 text-black'>:</span>{' '}
                            <span className='text-black'>21/12/2016</span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 text-black'>Mother's Name</span> <span className='w-4 text-black'>:</span>{' '}
                            <span className='text-black uppercase'>LAVANYA K H</span>
                        </div>
                        <div className='flex'>
                            <span className='w-48 text-black'>Father's Name</span> <span className='w-4 text-black'>:</span>{' '}
                            <span className='text-black uppercase'>HARSHITH N J</span>
                        </div>
                    </div>
                    {/* Picture placeholder */}
                    <div className='h-[140px] w-[120px] overflow-hidden border-2 border-sky-800 bg-blue-500' />
                </div>

                {/* Scholastic Report Header */}
                <h3 className='mb-2 text-center font-bold text-lg text-sky-800 uppercase'>SCHOLASTIC REPORT</h3>

                {/* Scholastic Areas Table */}
                <table className='mb-8 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <thead>
                        <tr>
                            <td className='border border-gray-300 bg-gray-400 p-2 text-left font-bold text-black'>Scholastic Areas(A)</td>
                            <td colSpan={4} className='border border-gray-300 bg-gray-400 p-2 font-bold text-black uppercase'>
                                MIDTERM EXAMINATION
                            </td>
                        </tr>
                        <tr className='border border-gray-300 bg-gray-400'>
                            <td className='border border-gray-300 p-2 text-center font-bold text-black'>Subject Name</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Internal-1 (20)</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>MIDTERM EXAMINATION (80)</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Total (100)</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Grade</td>
                        </tr>
                    </thead>
                    <tbody className='text-black'>
                        {[
                            {
                                name: 'English',
                                int1: '17',
                                mid: '58',
                                total: '75',
                                grade: 'B1'
                            },
                            {
                                name: 'Hindi',
                                int1: '18',
                                mid: '75',
                                total: '93',
                                grade: 'A1'
                            },
                            {
                                name: 'Kannada',
                                int1: '19',
                                mid: '64',
                                total: '83',
                                grade: 'A2'
                            },
                            {
                                name: 'Mathematics',
                                int1: '18',
                                mid: '57.5',
                                total: '75.5',
                                grade: 'B1'
                            },
                            {
                                name: 'Science',
                                int1: '17',
                                mid: '63',
                                total: '80',
                                grade: 'A2'
                            },
                            {
                                name: 'Social Science',
                                int1: '17',
                                mid: '38.5',
                                total: '55.5',
                                grade: 'C1'
                            }
                        ].map((subject, idx) => (
                            <tr key={idx} className='border border-gray-300'>
                                <td className='border border-gray-300 p-2 text-left'>{subject.name}</td>
                                <td className='border border-gray-300 p-2'>{subject.int1}</td>
                                <td className='border border-gray-300 p-2'>{subject.mid}</td>
                                <td className='border border-gray-300 p-2'>{subject.total}</td>
                                <td className='border border-gray-300 p-2 font-bold'>{subject.grade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Scholastic Grading Scale Header */}
                <h4 className='mb-2 text-center font-bold text-[14px] text-sky-800 uppercase underline'>SCHOLASTIC GRADING SCALE</h4>

                {/* Scholastic Grading Scale Table */}
                <table className='mb-8 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <tbody>
                        <tr className='border border-gray-300'>
                            <td className='w-1/8 border border-gray-300 bg-gray-400 p-2 font-bold text-black'>Grade</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>A1</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>A2</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>B1</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>B2</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>C1</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>C2</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>D</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>E</td>
                        </tr>
                        <tr className='border border-gray-300 text-black'>
                            <td className='border border-gray-300 bg-gray-400 p-2 font-bold'>Mark</td>
                            <td className='border border-gray-300 p-2'>91-100</td>
                            <td className='border border-gray-300 p-2'>81-90</td>
                            <td className='border border-gray-300 p-2'>71-80</td>
                            <td className='border border-gray-300 p-2'>61-70</td>
                            <td className='border border-gray-300 p-2'>51-60</td>
                            <td className='border border-gray-300 p-2'>41-50</td>
                            <td className='border border-gray-300 p-2'>33-40</td>
                            <td className='border border-gray-300 p-2'>0-32</td>
                        </tr>
                    </tbody>
                </table>

                {/* Chart Header */}
                <h4 className='mb-4 text-center font-bold text-[14px] text-sky-800 uppercase underline'>STUDENT PERFORMANCE ANALYSIS</h4>

                {/* Chart Area */}
                <div className='mx-auto mb-8 h-[300px] w-[1000px] border border-gray-200 pt-6 '>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart
                            data={barChartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 0,
                                bottom: 25
                            }}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                            <XAxis dataKey='subject' tick={{ fontSize: 10 }} tickLine={false} axisLine={true} interval={0} />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={true}
                                domain={[0, 100]}
                                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                                }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey='score' fill='#22c55e' barSize={40} name='MIDTERM EXAMINATION' stroke='#16a34a' strokeWidth={1} />
                            <Legend verticalAlign='top' height={36} iconType='rect' wrapperStyle={{ fontSize: '10px', top: -10 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Co-Scholastic Header */}
                <h4 className='mt-6 mb-1 text-center font-bold text-[14px] text-sky-800 uppercase underline'>CO-SCHOLASTIC ACTIVITIES</h4>
                <h5 className='mb-4 text-center font-bold text-[13px] text-sky-800 uppercase'>(3 POINT [A-C] GRADING SCALE)</h5>

                {/* Co-Scholastic Table */}
                <table className='mb-6 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <thead>
                        <tr className='border border-gray-300 bg-gray-400'>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Particulars</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>MIDTERM EXAMINATION</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>ANNUAL EXAMINATION</td>
                        </tr>
                    </thead>
                    <tbody className='text-black'>
                        {[
                            { name: 'Yoga', mid: 'A', ann: 'A' },
                            { name: 'General Knowledge', mid: 'B', ann: 'B' },
                            { name: 'Physical Education', mid: 'A', ann: 'A' }
                        ].map((subject, idx) => (
                            <tr key={idx} className='border border-gray-300'>
                                <td className='w-1/3 border border-gray-300 p-2 text-left'>{subject.name}</td>
                                <td className='w-1/3 border border-gray-300 p-2'>{subject.mid}</td>
                                <td className='w-1/3 border border-gray-300 p-2'>{subject.ann}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Discipline Header */}
                <h4 className='mt-6 mb-2 text-center font-bold text-[14px] text-sky-800 uppercase'>
                    DISCIPLINE (5 POINT [A-E] GRADING SCALE)
                </h4>

                {/* Discipline Table */}
                <table className='mb-8 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <thead>
                        <tr className='border border-gray-300 bg-gray-400'>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Particulars</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>MIDTERM EXAMINATION</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>ANNUAL EXAMINATION</td>
                        </tr>
                    </thead>
                    <tbody className='text-black'>
                        <tr className='border border-gray-300'>
                            <td className='w-1/3 border border-gray-300 p-2 text-left'>Discipline</td>
                            <td className='w-1/3 border border-gray-300 p-2'>A</td>
                            <td className='w-1/3 border border-gray-300 p-2'>A</td>
                        </tr>
                    </tbody>
                </table>

                {/* Health Status Header */}
                <h4 className='mt-6 mb-2 text-center font-bold text-[14px] text-sky-800 uppercase underline'>HEALTH STATUS</h4>

                {/* Health Status Table */}
                <table className='mb-8 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <thead>
                        <tr className='border border-gray-300 bg-gray-400'>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Height (in cm)</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Weight (in kg)</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Blood Group</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Dental Hygiene</td>
                            <td className='border border-gray-300 p-2 font-bold text-black'>Vision ( Right & Left )</td>
                        </tr>
                    </thead>
                    <tbody className='text-black'>
                        <tr className='border border-gray-300'>
                            <td className='border border-gray-300 p-2'>140</td>
                            <td className='border border-gray-300 p-2'>43</td>
                            <td className='border border-gray-300 p-2'>O+</td>
                            <td className='border border-gray-300 p-2'>Fair</td>
                            <td className='border border-gray-300 p-2'>6/6 & 6/6</td>
                        </tr>
                    </tbody>
                </table>

                {/* Attendance Header */}
                <h4 className='mt-6 mb-2 text-center font-bold text-[14px] text-sky-800 uppercase underline'>ATTENDANCE DETAILS</h4>

                {/* Attendance Table */}
                <table className='mb-8 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <tbody className='text-black'>
                        <tr className='border border-gray-300'>
                            <td className='w-1/4 border border-gray-300 bg-gray-400 p-2 font-bold'>
                                Total number of
                                <br />
                                working days
                            </td>
                            <td className='w-1/12 border border-gray-300 p-2 font-bold'>191</td>
                            <td className='w-1/4 border border-gray-300 bg-gray-400 p-2 font-bold'>
                                Number of days
                                <br />
                                attended
                            </td>
                            <td className='w-1/12 border border-gray-300 p-2 font-bold'>190</td>
                            <td className='w-1/4 border border-gray-300 bg-gray-400 p-2 font-bold'>
                                Attendance
                                <br />
                                Percentage
                            </td>
                            <td className='w-1/12 border border-gray-300 p-2 font-bold'>99.48</td>
                        </tr>
                    </tbody>
                </table>

                {/* Results */}
                <table className='mb-12 w-full border-collapse border border-gray-300 text-center text-[12px]'>
                    <tbody className='text-black'>
                        <tr className='h-8 border border-gray-300'>
                            <td className='w-[80px] border border-gray-300 bg-gray-400 p-2 text-left font-bold'>RESULTS</td>
                            <td className='w-full border border-gray-300 p-2' />
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className='mt-16 flex items-end justify-between font-bold text-[12px] text-black'>
                    <p>Principal's Signature</p>
                    <p>Institution Seal</p>
                    <p>Class Teacher's Signature</p>
                </div>
            </div>
        </div>
    );
};

export default VidyaniketanReportView;
