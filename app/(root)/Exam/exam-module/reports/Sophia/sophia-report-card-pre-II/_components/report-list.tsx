import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';
import { dummyPersonalAndSocialHabits, dummyScholasticAreas, dummyStudentInfo, dummyStudyHabits } from './mockData';

interface SophiaProgressReportPreIIViewProps {
    data?: any[];
    institution?: IMasterInstitution | Institution | null;
}

const SophiaProgressReportPreIIView = ({ data, institution }: SophiaProgressReportPreIIViewProps) => {
    const handleExport = () => {};
    const handlePrint = () => {
        window.print();
    };

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
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-6 py-3'>
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

            <div id='printable-area' className='min-w-[1000px] bg-white px-6 font-sans text-[12px] text-gray-800'>
                <div className='mb-1 flex justify-end font-medium '>
                    <div className='font-bold text-gray-600 text-sm'>2025-2026</div>
                </div>

                <div className='mb-6 flex justify-between border-gray-400 border-t border-b py-4 font-bold text-gray-800 text-sm'>
                    {/* LEFT SIDE */}
                    <div className='flex w-1/2 flex-col gap-1'>
                        <div className='flex'>
                            <span className='w-[150px]'>Name</span>
                            <span>
                                : <span className='font-bold text-gray-600 uppercase'>{dummyStudentInfo.name}</span>
                            </span>
                        </div>

                        <div className='flex'>
                            <span className='w-[150px]'>Class & Div</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.classDiv}</span>
                            </span>
                        </div>

                        <div className='flex'>
                            <span className='w-[150px]'>Date of Birth</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.dob}</span>
                            </span>
                        </div>

                        <div className='flex'>
                            <span className='w-[150px]'>Student House</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.house}</span>
                            </span>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className='flex w-1/2 flex-col items-start gap-1 pl-8'>
                        <div className='flex'>
                            <span className='w-[180px]'>Standard Strength</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.stdStrength}</span>
                            </span>
                        </div>

                        <div className='flex'>
                            <span className='w-[180px]'>Division Strength</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.divStrength}</span>
                            </span>
                        </div>

                        <div className='flex'>
                            <span className='w-[180px]'>Attendance</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.attendance}</span>
                            </span>
                        </div>

                        <div className='flex'>
                            <span className='w-[180px]'>Attendance %</span>
                            <span>
                                : <span className='font-bold text-gray-600'>{dummyStudentInfo.attendancePercentage}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className='my-4 text-center font-bold text-lg'>PERFORMANCE OF THE YEAR 2025 - 2026</div>
                <table className='w-full text-center font-bold text-[13px]'>
                    <thead>
                        <tr>
                            <td className='w-16 border border-gray-400 p-2 text-center'>Sl. No</td>
                            <td className='w-[400px] border border-gray-400 p-2 text-center'>Subjects</td>
                            <td className='w-48 border border-gray-400 p-2 text-center text-[11px]'>Term I</td>
                            <td className='w-48 border border-gray-400 p-2 text-center text-[11px]'>Term II</td>
                            <td className='w-48 border border-gray-400 p-2 text-center text-[11px]'>Term III</td>
                        </tr>
                    </thead>
                    <tbody>
                        {/* SCHOLASTIC AREAS */}
                        <tr>
                            <td
                                colSpan={5}
                                className=' border-gray-400 pt-8 pb-2 text-left font-extrabold text-[11px] text-gray-700 uppercase tracking-widest'>
                                SCHOLASTIC AREAS
                            </td>
                            <td className='w-1 border-none' />
                        </tr>

                        {dummyScholasticAreas.map((area, idx) => (
                            <React.Fragment key={idx}>
                                <tr className=''>
                                    <td
                                        className={`border border-gray-400 p-2 text-center font-bold text-gray-700 ${area.subSubjects ? 'pt-2 align-top' : ''}`}>
                                        {area.id}
                                    </td>
                                    <td
                                        className={`border border-gray-400 p-2 pl-4 text-left font-extrabold text-gray-800 ${area.subSubjects ? 'pt-2 align-top' : ''}`}>
                                        {area.subject}
                                    </td>
                                    <td
                                        className={`border border-gray-400 p-2 text-center font-bold text-gray-800 ${area.subSubjects ? 'pt-2 align-top' : ''}`}>
                                        {area.term1 || ''}
                                    </td>
                                    <td
                                        className={`border border-gray-400 p-2 text-center font-bold text-gray-800 ${area.subSubjects ? 'pt-2 align-top' : ''}`}>
                                        {area.term2 || ''}
                                    </td>
                                    <td
                                        className={`border border-gray-400 p-2 text-center font-bold text-gray-800 ${area.subSubjects ? 'pt-2 align-top' : ''}`}>
                                        {area.term3 || ''}
                                    </td>
                                    <td className='w-1 border-none' />
                                </tr>
                                {area.subSubjects?.map((sub, i) => (
                                    <tr key={i} className=''>
                                        <td className='border border-gray-400' />
                                        <td className='border border-gray-400 p-2 pl-12 text-left font-semibold text-gray-600'>
                                            {sub.name}
                                        </td>
                                        <td className='border border-gray-400 p-2 text-center font-bold text-gray-700'>
                                            {sub.term1 || ''}
                                        </td>
                                        <td className='border border-gray-400 p-2 text-center font-bold text-gray-700'>
                                            {sub.term2 || ''}
                                        </td>
                                        <td className='border border-gray-400 p-2 text-center font-bold text-gray-700'>
                                            {sub.term3 || ''}
                                        </td>
                                        <td className='w-1 border-none' />
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}

                        {/* STUDY HABITS */}
                        <tr>
                            <td colSpan={5} className='border-none pt-8 pb-2 text-left '>
                                <span className='font-extrabold text-[12px] text-gray-800 uppercase tracking-widest '>STUDY HABITS</span>
                            </td>
                            <td className='w-1 border-none' />
                        </tr>
                        {dummyStudyHabits.map((area, idx) => (
                            <tr key={idx} className=''>
                                <td className='border border-gray-400 p-2 text-center font-bold text-gray-700'>{area.id}</td>
                                <td className='border border-gray-400 p-2 pl-4 text-left font-extrabold text-gray-800'>{area.subject}</td>
                                <td className='border border-gray-400 p-2 text-center font-bold text-gray-800'>{area.term1 || ''}</td>
                                <td className='border border-gray-400 p-2 text-center font-bold text-gray-800'>{area.term2 || ''}</td>
                                <td className='border border-gray-400 p-2 text-center font-bold text-gray-800'>{area.term3 || ''}</td>
                                <td className='w-1 border-none' />
                            </tr>
                        ))}

                        {/* PERSONAL AND SOCIAL HABITS */}
                        <tr>
                            <td colSpan={5} className='border-none pt-8 pb-2 text-left '>
                                <span className='font-extrabold text-[12px] text-gray-800 uppercase tracking-widest '>
                                    PERSONAL AND SOCIAL HABITS
                                </span>
                            </td>
                            <td className='w-1 border-none' />
                        </tr>
                        {dummyPersonalAndSocialHabits.map((area, idx) => (
                            <React.Fragment key={idx}>
                                <tr className={idx === dummyPersonalAndSocialHabits.length - 1 ? 'border-gray-400 border-b' : ''}>
                                    <td className='border border-gray-400 p-2 text-center font-bold text-gray-700'>{area.id}</td>
                                    <td className='border border-gray-400 p-2 pl-4 text-left font-extrabold text-gray-800'>
                                        {area.subject}
                                    </td>
                                    <td className='border border-gray-400 p-2 text-center font-bold text-gray-800'>{area.term1 || ''}</td>
                                    <td className='border border-gray-400 p-2 text-center font-bold text-gray-800'>{area.term2 || ''}</td>
                                    <td className='border border-gray-400 p-2 text-center font-bold text-gray-800'>{area.term3 || ''}</td>
                                    <td className='w-1 border-none' />
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Remarks and Signatures inside one big border block based on the mock */}
                <div className='mt-8 border border-gray-400 p-8 text-sm'>Teacher's Remarks :</div>
                <div className='mr-1 flex min-h-[80px] pb-2 text-center font-bold text-[12px]'>
                    <div className='flex flex-1 items-end justify-center pt-12 pb-2'>
                        <span className='text-[11px] text-gray-500 uppercase tracking-widest'>CLASS TEACHER</span>
                    </div>
                    <div className='flex flex-1 items-end justify-center pt-12 pb-2'>
                        <span className='text-[11px] text-gray-500 uppercase tracking-widest'>PRINCIPAL</span>
                    </div>
                    <div className='flex flex-1 items-end justify-center pt-12 pb-2'>
                        <span className='text-[11px] text-gray-500 uppercase tracking-widest'>PARENT</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SophiaProgressReportPreIIView;
