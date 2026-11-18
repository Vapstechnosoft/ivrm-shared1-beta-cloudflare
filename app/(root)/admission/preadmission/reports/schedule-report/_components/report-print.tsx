'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';

interface ReportPrintProps {
    data: IScheduleReportList[];
    logo?: string;
}

/**
 * Standard Schedule Report print component.
 */
export default function ScheduleReportPrint({ data, logo }: ReportPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className='printable-content bg-white p-8 print:px-12 print:pt-12' style={{ color: 'black', background: 'white' }}>
            <div className='mb-6 text-center'>
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
                <h1 className='font-bold text-2xl uppercase underline' style={{ color: 'black' }}>
                    SCHEDULE REPORT
                </h1>
            </div>

            <table className='w-full border-collapse border border-black text-[10px]' style={{ border: '1px solid black' }}>
                <thead>
                    <tr className='bg-gray-100 font-bold'>
                        <th className='border border-black p-2 text-center' style={{ border: '1px solid black' }}>
                            SL.No
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            Name
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            RegNo
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            Class
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            Gender
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            Schedule Date
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            From
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            To
                        </th>
                        <th className='border border-black p-2 text-left' style={{ border: '1px solid black' }}>
                            Remarks
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index} className='break-inside-avoid'>
                            <td className='border border-black p-2 text-center' style={{ border: '1px solid black' }}>
                                {index + 1}
                            </td>
                            <td className='border border-black p-2' style={{ border: '1px solid black' }}>
                                {user.name}
                            </td>
                            <td className='border border-black p-2' style={{ border: '1px solid black' }}>
                                {user.regno}
                            </td>
                            <td className='border border-black p-2' style={{ border: '1px solid black' }}>
                                {user.class}
                            </td>
                            <td className='border border-black p-2' style={{ border: '1px solid black' }}>
                                {user.gender}
                            </td>
                            <td className='border border-black p-2' style={{ border: '1px solid black' }}>
                                {user.ScheduleDate || user.scheduledate
                                    ? format(new Date(user.ScheduleDate || user.scheduledate || ''), 'dd.MM.yyyy')
                                    : ''}
                            </td>
                            <td className='border border-black p-2 text-center' style={{ border: '1px solid black' }}>
                                {user.ScheduleTime || user.scheduletime || ''}
                            </td>
                            <td className='border border-black p-2 text-center' style={{ border: '1px solid black' }}>
                                {user.ScheduleTimeTo || user.scheduletimeto || ''}
                            </td>
                            <td className='border border-black p-2' style={{ border: '1px solid black' }}>
                                {user.PAOTS_Remarks || user.remarks || ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='mt-8 text-center text-xs italic'>
                <span>Printed on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</span>
            </div>
        </div>
    );
}
