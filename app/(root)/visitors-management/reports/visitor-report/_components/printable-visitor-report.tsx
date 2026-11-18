'use client';

import type { VisitorReportRecord } from '../types';

interface PrintableVisitorReportProps {
    data: VisitorReportRecord[];
    dateSubtitle?: string;
    searchSubtitle?: string;
}

export default function PrintableVisitorReport({ data, dateSubtitle, searchSubtitle }: PrintableVisitorReportProps) {
    const today = new Date().toLocaleDateString('en-GB');

    const getVisitorName = (item: VisitorReportRecord) => item.amvM_Name || item.VMMV_VisitorName || '-';

    const getContactNo = (item: VisitorReportRecord) => item.amvM_Contact_No || item.VMMV_VisitorContactNo || '-';

    const getEmailId = (item: VisitorReportRecord) => item.amvM_Emailid || item.VMMV_VisitorEmailid || '-';

    const getDate = (item: VisitorReportRecord) => {
        const rawDate = item.date_Visit || item.Date_Visit || item.VMMV_MeetingDateTime;
        if (!rawDate) return '-';
        try {
            return new Date(rawDate).toLocaleDateString('en-GB');
        } catch {
            return String(rawDate);
        }
    };

    const getInTime = (item: VisitorReportRecord) => item.time_Visit || item.Time_Visit || item.VMMV_EntryDateTime || '-';

    const getOutTime = (item: VisitorReportRecord) => item.amvM_Out_Time || item.VMMV_ExitDateTime || '-';

    const getLocation = (item: VisitorReportRecord) => item.VMMV_MeetingLocation || item.amvM_Address || '-';

    const getStatus = (item: VisitorReportRecord) => item.amvM_Status || item.VMMV_CkeckedInOutStatus || '-';

    const getPurpose = (item: VisitorReportRecord) => item.amvM_Purpose || item.VMMV_MeetingPurpose || '-';

    return (
        <div id='visitor-report-printable-section' className='hidden bg-white p-8 font-sans text-black print:block'>
            {/* Header */}
            <div className='mb-6 border-b pb-4 text-center'>
                <h1 className='font-bold text-2xl uppercase tracking-wider'>VISITORS REPORT</h1>
                {searchSubtitle && <p className='mt-1 font-medium text-gray-700 text-xs'>{searchSubtitle}</p>}
                {dateSubtitle && <p className='mt-0.5 font-medium text-gray-600 text-xs'>{dateSubtitle}</p>}
                <p className='mt-1 text-gray-500 text-xs'>Generated on: {today}</p>
            </div>

            {/* Table */}
            <table className='w-full border-collapse border border-gray-400 text-center text-xs'>
                <thead>
                    <tr className='bg-gray-100 font-semibold'>
                        <th className='border border-gray-400 p-2'>SL. No.</th>
                        <th className='border border-gray-400 p-2 text-left'>Visitor Name</th>
                        <th className='border border-gray-400 p-2'>Contact No</th>
                        <th className='border border-gray-400 p-2 text-left'>Email Id</th>
                        <th className='border border-gray-400 p-2'>Date</th>
                        <th className='border border-gray-400 p-2'>In Time</th>
                        <th className='border border-gray-400 p-2'>Out Time</th>
                        <th className='border border-gray-400 p-2'>Location</th>
                        <th className='border border-gray-400 p-2'>Status</th>
                        <th className='border border-gray-400 p-2 text-left'>Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={`print-visitor-${idx}`} className='even:bg-gray-50'>
                            <td className='border border-gray-400 p-1.5'>{idx + 1}</td>
                            <td className='border border-gray-400 p-1.5 text-left font-medium'>{getVisitorName(row)}</td>
                            <td className='border border-gray-400 p-1.5 font-mono'>{getContactNo(row)}</td>
                            <td className='border border-gray-400 p-1.5 text-left'>{getEmailId(row)}</td>
                            <td className='whitespace-nowrap border border-gray-400 p-1.5'>{getDate(row)}</td>
                            <td className='whitespace-nowrap border border-gray-400 p-1.5'>{getInTime(row)}</td>
                            <td className='whitespace-nowrap border border-gray-400 p-1.5'>{getOutTime(row)}</td>
                            <td className='border border-gray-400 p-1.5'>{getLocation(row)}</td>
                            <td className='border border-gray-400 p-1.5'>{getStatus(row)}</td>
                            <td className='border border-gray-400 p-1.5 text-left'>{getPurpose(row)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer */}
            <div className='mt-8 flex justify-between border-t pt-4 text-gray-500 text-xs'>
                <div>Total Records: {data.length}</div>
                <div>Principal / Authorized Signatory</div>
            </div>
        </div>
    );
}
