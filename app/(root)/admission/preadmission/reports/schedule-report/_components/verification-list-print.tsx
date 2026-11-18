'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';

interface VerificationListPrintProps {
    data: IScheduleReportList[];
    logo?: string;
    academicYear?: string;
    scheduleName?: string;
    scheduleTime?: string;
    scheduleDate?: string;
}

/**
 * Verification List print component.
 */
export default function VerificationListPrint({
    data,
    logo,
    academicYear,
    scheduleName,
    scheduleTime,
    scheduleDate
}: VerificationListPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className='printable-content bg-white p-8 print:px-12' style={{ color: 'black', background: 'white' }}>
            <div className='mb-4 text-center'>
                {logo && logo.trim() !== '' && (
                    <img
                        src={logo}
                        alt='Logo'
                        className='mx-auto mb-2 max-h-24'
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                )}
            </div>

            <div className='mb-4 flex flex-row items-center justify-between border-black border-b-2 pb-2 font-bold text-[10px]'>
                <div>Academic Year: {academicYear || 'N/A'}</div>
                <div>
                    Session: {scheduleName || 'N/A'} AT {scheduleTime || 'N/A'}
                </div>
                <div>Date: {scheduleDate ? format(new Date(scheduleDate), 'dd/MM/yyyy') : 'N/A'}</div>
            </div>

            <h2 className='mb-6 text-center font-bold text-xl uppercase'>VERIFICATION LIST</h2>

            <table className='w-full border-collapse border border-black text-[9px]' style={{ border: '1px solid black' }}>
                <thead>
                    <tr className='bg-gray-100 font-bold'>
                        <th className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                            SL.No
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Prospectus No
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Category
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Student Name
                        </th>
                        <th className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                            Age
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Medium
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Syllabus
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Place
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            Remarks
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index} className='break-inside-avoid'>
                            <td className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                                {index + 1}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.regno}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.Category}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.name}
                            </td>
                            <td className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                                {user.age}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.Medium}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.Syllabus}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.place}
                            </td>
                            <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                {user.PAOTS_Remarks || user.remarks || ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
