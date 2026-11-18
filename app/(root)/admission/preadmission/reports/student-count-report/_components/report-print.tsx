'use client';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import { format, isValid } from 'date-fns';

interface ReportPrintProps {
    data: IMasterStudentCountReportList[];
    reportType: string;
    academicYear?: string;
    fromDate?: string;
    toDate?: string;
    rangeType: string;
    logo?: string;
}

import { formatDate, getStudentName } from './columns';

export default function StudentCountReportPrint({ data, reportType, academicYear, fromDate, toDate, rangeType, logo }: ReportPrintProps) {
    const reportNames: Record<string, string> = {
        '1': 'Registered list',
        '2': 'Registered but not filled application form',
        '3': 'Registered and filled application form',
        '4': 'Registration payment done list (Application datewise)',
        '5': 'Transferred student (Admission Confirm)',
        '6': 'Registration payment not done list',
        '7': 'Registration payment done list (Payment datewise)',
        '8': 'Sibling students list (Paid Students)',
        '9': 'Partial/Admission payment done list'
    };

    const title = reportNames[reportType] || 'Total Count Report';

    let dateRange = '';
    if (rangeType === 'between' && fromDate && toDate) {
        const d1 = new Date(fromDate);
        const d2 = new Date(toDate);
        if (isValid(d1) && isValid(d2)) {
            dateRange = ` (${format(d1, 'dd-MM-yyyy')} To ${format(d2, 'dd-MM-yyyy')})`;
        }
    } else if (academicYear) {
        dateRange = ` - ${academicYear}`;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className='p-8 text-center' style={{ color: 'black', background: 'white' }}>
                <h1 className='mb-4 font-bold text-2xl uppercase underline'>{title}</h1>
                <p>No records found for the selected criteria. (Data: {data ? 'Empty Array' : 'Null/Undefined'})</p>
            </div>
        );
    }

    return (
        <div
            className='printable-content bg-white p-8 print:px-0 print:pt-12'
            style={{ color: 'black', minHeight: '100%', background: 'white' }}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page {
                        margin: 1.5cm 1cm 1cm 1cm;
                    }
                }
            `
                }}
            />
            <div className='mb-6 text-center'>
                {logo && <img src={logo} alt='Logo' className='mx-auto mb-2 max-h-24' />}
                <h1 className='font-bold text-2xl uppercase underline' style={{ color: 'black' }}>
                    {title}
                    {dateRange}
                </h1>
            </div>

            <table className='w-full border-collapse border border-black text-xs' style={{ border: '1px solid black' }}>
                <thead>
                    <tr className='bg-gray-100'>
                        <th className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                            SL.NO
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            STUDENT NAME
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            EMAIL-ID
                        </th>
                        <th className='border border-black p-1 text-left' style={{ border: '1px solid black' }}>
                            MOBILE NUMBER
                        </th>
                        <th className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                            REG DATE
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        return (
                            <tr key={index} className='break-inside-avoid'>
                                <td className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                                    {index + 1}
                                </td>
                                <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                    {getStudentName(row)}
                                </td>
                                <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                    {row.EmailID || 'N/A'}
                                </td>
                                <td className='border border-black p-1' style={{ border: '1px solid black' }}>
                                    {row.Mobileno || 'N/A'}
                                </td>
                                <td className='border border-black p-1 text-center' style={{ border: '1px solid black' }}>
                                    {formatDate(row.RegDate)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className='mt-8 flex justify-between text-[10px] italic' style={{ color: 'black' }}>
                <span>Printed on: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</span>
                <span>Generated by System</span>
            </div>
        </div>
    );
}
