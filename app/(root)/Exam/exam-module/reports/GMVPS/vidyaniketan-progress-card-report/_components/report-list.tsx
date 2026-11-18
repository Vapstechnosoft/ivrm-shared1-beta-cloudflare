import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';

interface VidyaniketanReportViewProps {
    data: any[];
    institution: IMasterInstitution | Institution | null;
}

const VidyaniketanReportView = ({ data, institution }: VidyaniketanReportViewProps) => {
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
            <div className='no-print mb-4 flex justify-end space-x-2'>
                <Button onClick={handleExport} className='w-fit text-white hover:bg-orange-800'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
                <Button onClick={handlePrint} className='w-fit text-white hover:bg-orange-800'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='printable-area' className='min-w-[800px] bg-white p-4 font-sans text-[13px]'>
                {/* School Logo */}
                <img src={institution?.mI_Logo} alt='school-logo' className='mb-4 border-yellow-600 border-b-4' />
                {/* Header Title */}
                <h2 className='mb-6 text-center font-bold text-[#305796] text-lg uppercase'>Kindergarten Achievement Report 2025-2026</h2>

                {/* Student Info Section */}
                <div className='mb-6 flex items-start justify-between font-bold text-[12px]'>
                    <div className='flex gap-20'>
                        <div className='flex flex-col gap-1'>
                            <div className='flex'>
                                <span className='w-32'>Student's Name</span> <span className='text-black'>: ADARSHA S POOJARY</span>
                            </div>
                            <div className='flex'>
                                <span className='w-32'>Class</span> <span className='text-black'>: VI A</span>
                            </div>
                            <div className='flex'>
                                <span className='w-32'>Admn No.</span> <span className='text-black'>: 5016</span>
                            </div>
                            <div className='flex'>
                                <span className='w-32'>DOB</span> <span className='text-black'>: 14/03/2014</span>
                            </div>
                        </div>
                        <div className='flex flex-col gap-[2px]'>
                            <div className='flex'>
                                <span className='w-32'>Father's Name</span> <span className='text-black'>: SATHISH POOJARY</span>
                            </div>
                            <div className='flex'>
                                <span className='w-32'>Mother's Name</span> <span className='text-black'>: LAXMI POOJARY</span>
                            </div>
                            <div className='flex'>
                                <span className='w-32'>Blood Group</span> <span className='text-black'>: O+</span>
                            </div>
                        </div>
                    </div>
                    {/* Picture placeholder */}
                    <div className='h-28 w-24 overflow-hidden border bg-gray-200'>
                        <img
                            src='E:\AI_IVRM\FrontEnd\HRMS\IVRMNext\public\assets\student_academic.png'
                            alt='Student'
                            className='h-full w-full object-cover'
                        />
                    </div>
                </div>

                {/* Subjects Table */}
                <table className='mb-3 w-full border-collapse border border-gray-400 text-center'>
                    <thead>
                        <tr className='border-gray-400 border-b bg-orange-200 font-bold text-black'>
                            <td className='w-1/3 border-gray-400 border-r p-2 text-left'>SUBJECTS</td>
                            <td className='border-gray-400 border-r p-2'>GENERAL KNOWLEDGE TEST-JUNE</td>
                            <td className='w-1/4 p-2'>Internal-1</td>
                        </tr>
                    </thead>
                    <tbody className='bg-red-50 font-bold text-[#4a4a4a] text-[12px]'>
                        {['English', 'Mathematics', 'Social Science', 'Hindi II Language', 'Kannada III Language', 'General Knowledge'].map(
                            (subject, idx) => (
                                <tr key={idx} className='border-gray-400 border-b'>
                                    <td className='border-gray-400 border-r p-2 text-left'>{subject}</td>
                                    <td className='border-gray-400 border-r p-2' />
                                    <td className='p-2' />
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                {/* Attendance */}
                <table className='mb-6 w-full border-collapse border border-gray-400 text-center text-[12px]'>
                    <tbody>
                        <tr>
                            <td className='w-[25%] border-gray-400 border-r bg-red-50 p-2 font-bold text-red-600'>Attendance</td>
                            <td className='w-[37.5%] border-gray-400 border-r p-2 text-black'>Total Working Days : 13</td>
                            <td className='w-[37.5%] p-2 text-black'>Total Present Days : 13</td>
                        </tr>
                    </tbody>
                </table>

                {/* Health Status */}
                <table className='mb-4 w-full border-collapse border border-gray-400 bg-red-50 text-center text-[12px] '>
                    <tbody>
                        <tr className='font-bold text-red-600'>
                            <td colSpan={2} className='border-gray-400 border-b p-2'>
                                Health Status
                            </td>
                        </tr>
                        <tr>
                            <td className='w-1/2 border-gray-400 border-r border-b p-2'>Height (in cm) : 0</td>
                            <td className='w-1/2 border-gray-400 border-b p-2'>Weight (in Kg): 0</td>
                        </tr>
                        <tr>
                            <td className='border-gray-400 border-r border-b p-2'>Vision : ( OD & OS )</td>
                            <td className='border-gray-400 border-b p-2'>6/9&6/9</td>
                        </tr>
                        <tr className='font-bold text-red-600'>
                            <td colSpan={2} className='p-2'>
                                Dental Hygiene: Good
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Activity Grade Scale */}
                <table className='mt-6 w-full border-collapse border border-gray-400 text-center text-[#4a4a4a] text-[12px]'>
                    <tbody>
                        <tr className='bg-red-50 font-bold text-red-600'>
                            <td colSpan={6} className='border-gray-400 border-b p-2'>
                                Activity Grade Scale : Grades are based on a 5 Point Grading Scale as follows
                            </td>
                        </tr>
                        <tr className='bg-[#fcf5f5] font-bold'>
                            <td className='w-1/6 border-gray-400 border-r border-b p-2'>GRADE</td>
                            <td className='border-gray-400 border-r border-b p-2'>A1</td>
                            <td className='border-gray-400 border-r border-b p-2'>A2</td>
                            <td className='border-gray-400 border-r border-b p-2'>B</td>
                            <td className='border-gray-400 border-r border-b p-2'>C</td>
                            <td className='border-gray-400 border-b p-2'>D</td>
                        </tr>
                        <tr className='border-white border-t-2 bg-orange-200 font-bold text-black'>
                            <td className='border-gray-400 border-r p-2'>DESCRIPTION</td>
                            <td className='border-gray-400 border-r p-2'>Outstanding</td>
                            <td className='border-gray-400 border-r p-2'>Excellent</td>
                            <td className='border-gray-400 border-r p-2'>Very Good</td>
                            <td className='border-gray-400 border-r p-2'>Good</td>
                            <td className='p-2'>Scope for improvement</td>
                        </tr>
                    </tbody>
                </table>
                <div className='mt-20 flex justify-between font-bold text-medium'>
                    <p>Principal</p>
                    <p>Institution Seal</p>
                    <div>
                        <p>Class Teacher Signature</p>
                        <p>Date:</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VidyaniketanReportView;
