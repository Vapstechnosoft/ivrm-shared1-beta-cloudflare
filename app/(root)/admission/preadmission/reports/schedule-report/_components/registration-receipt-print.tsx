'use client';
import type { IScheduleReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';

interface RegistrationReceiptPrintProps {
    data: IScheduleReportList[];
    logo?: string;
}

/**
 * Registration Receipt / Admission Test Intimation print component.
 * Each student starts on a new page.
 */
export default function RegistrationReceiptPrint({ data, logo }: RegistrationReceiptPrintProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className='printable-content bg-white' style={{ color: 'black', background: 'white' }}>
            {data.map((user, index) => (
                <div
                    key={index}
                    className='mb-2 flex flex-col overflow-hidden border-gray-200 border-b-2 p-4 text-xs print:mb-0 print:break-after-page print:border-none print:px-6'>
                    <div className='mb-2 text-center'>
                        {logo && logo.trim() !== '' && (
                            <img
                                src={logo}
                                alt='Logo'
                                className='mx-auto mb-1 max-h-12'
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        )}
                        <h4 className='mt-1 border-black border-y py-1 font-bold text-base uppercase'>
                            REGISTRATION RECEIPT / ADMISSION TEST INTIMATION
                        </h4>
                    </div>

                    <div className='mb-2 flex justify-end'>
                        <div className='flex items-center gap-2 font-bold text-[10px]'>
                            <span>Date :</span>
                            <span className='min-w-[80px] border-black border-b text-center'>
                                {user.ScheduleDate || user.scheduledate
                                    ? format(new Date(user.ScheduleDate || user.scheduledate || ''), 'dd.MM.yyyy')
                                    : ''}
                            </span>
                        </div>
                    </div>

                    <div className='mb-1 text-sm'>Sir/Madam,</div>

                    <div className='mb-2 flex flex-row items-center gap-2 text-sm'>
                        <div className='w-12'></div>
                        <div className='shrink-0'>Refer your Application No.</div>
                        <div className='flex-1 border-black border-b border-dotted px-1 font-bold'>{user.regno}</div>
                    </div>

                    <div className='mb-2 flex flex-row items-center gap-2 text-sm'>
                        <div className='w-4'>1.</div>
                        <div className='shrink-0'>Kindly bring Chi.</div>
                        <div className='flex-1 border-black border-b border-dotted px-1 font-bold'>{user.name}</div>
                    </div>

                    <div className='mb-4 flex flex-row items-center gap-2 text-sm'>
                        <div className='w-4'></div>
                        <div className='shrink-0'>for the Admission Test on</div>
                        <div className='flex-1 border-black border-b border-dotted px-1 font-bold'>
                            {user.ScheduleDate || user.scheduledate
                                ? format(new Date(user.ScheduleDate || user.scheduledate || ''), 'dd-MM-yyyy')
                                : ''}{' '}
                            from {user.ScheduleTime || user.scheduletime} to {user.ScheduleTimeTo || user.scheduletimeto}
                        </div>
                    </div>

                    <div className='mb-4 space-y-2 text-justify text-xs leading-tight'>
                        <p>
                            along with a copy of the 7th standard Annual Examination Marks card (if not already submitted). If 7th std.
                            results are yet to be declared, a copy of the Preparatory Examination / 6th Std. Annual Examination marks cards
                            is to be submitted.
                        </p>
                        <div className='flex gap-2'>
                            <span className='font-bold'>2.</span>
                            <p>
                                If your ward has obtained certificates(s) in any of the co-curricular activities like sports, dramatics,
                                signing, writing/speaking competitions, please bring them along on the day of the Admission Test.
                            </p>
                        </div>
                    </div>

                    <div className='mb-4 flex flex-row items-start justify-between gap-6'>
                        <div className='w-[220px] rounded border border-black bg-gray-50 p-3'>
                            <h4 className='mb-2 text-center font-bold text-sm underline'>REGISTRATION RECEIPT</h4>
                            <table className='w-full text-xs'>
                                <tbody>
                                    <tr className='border-gray-100 border-b'>
                                        <td className='py-1 font-semibold'>Pros.No</td>
                                        <td className='py-1'>: {user.regno}</td>
                                    </tr>
                                    <tr className='border-gray-100 border-b'>
                                        <td className='py-1 font-semibold'>Place</td>
                                        <td className='py-1'>: {user.PASR_PerCity}</td>
                                    </tr>
                                    <tr className='border-gray-100 border-b'>
                                        <td className='py-1 font-semibold'>Amount</td>
                                        <td className='py-1'>: Rs.300/-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='max-w-[180px] flex-1 text-center'>
                            <div className='mb-1 text-sm italic'>Yours Faithfully,</div>
                            <div className='mb-1 flex h-12 items-center justify-center overflow-hidden rounded border border-gray-300 border-dashed'>
                                {/* Signature image removed - file not found on server */}
                            </div>
                            <div className='font-bold text-base uppercase tracking-tight'>Correspondent</div>
                        </div>
                    </div>

                    <div className='mb-4 border-2 border-black border-double bg-gray-100 p-2 text-center font-bold text-sm uppercase italic'>
                        THIS LETTER MUST BE PRODUCED AT THE TIME OF THE TEST
                    </div>

                    <div className='mb-4 flex justify-end'>
                        <div className='w-[250px] space-y-0.5 text-xs'>
                            <h5 className='mb-0.5 font-bold text-sm underline'>To</h5>
                            <div className='font-bold text-sm'>
                                {user.name} ({user.class}) ({user.regno})
                            </div>
                            <div className='font-semibold text-gray-800'>S/O {user.fathername}</div>
                            <div>DOB: {user.PASR_DOB ? format(new Date(user.PASR_DOB), 'dd/MM/yyyy') : 'N/A'}</div>
                            <div>Email: {user.PASR_emailId}</div>
                            <div>Phone No: {user.PASR_MobileNo}</div>
                            <div className='text-[10px] italic'>
                                {user.PASR_PerStreet}, {user.PASR_PerArea}, {user.PASR_PerCity} - {user.PASR_PerPincode}
                            </div>
                        </div>
                    </div>

                    <div className='mt-auto border-black border-t pt-2'>
                        <h5 className='mb-0.5 font-bold text-sm'>From</h5>
                        <div className='font-extrabold text-base uppercase tracking-tighter'>SRI RAMAKRISHNA VIDYASHALA</div>
                        <div className='font-semibold text-gray-700 text-xs'>Residential Composite Pre-University College</div>
                        <div className='text-[10px] text-gray-600'>Yadavagiri, MYSURU - 570 020.</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
