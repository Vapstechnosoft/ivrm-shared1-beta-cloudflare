import React, { useEffect } from 'react';

interface CumulativeSalaryPrintProps {
    reportData: any;
    year: string;
    month: string;
}

export const CumulativeSalaryPrint = React.forwardRef<HTMLDivElement, CumulativeSalaryPrintProps>(({ reportData, year, month }, ref) => {
    if (!reportData) return null;

    const records = reportData.cumulativeSalaryReport || [];
    const earnings = reportData.earningDetails || [];
    const deductions = reportData.dectuionDetails || [];
    const currentDate = new Date();
    useEffect(() => {
        console.log(reportData);
    }, [reportData]);

    const getValue = (record: any, key: string) => {
        if (!record || !key) return 0;
        // Try direct match
        if (record[key] !== undefined) return record[key];
        // Try lowercase
        const lowerKey = key.toLowerCase();
        if (record[lowerKey] !== undefined) return record[lowerKey];
        // Try stripped spaces
        const strippedKey = key.replace(/\s+/g, '');
        if (record[strippedKey] !== undefined) return record[strippedKey];
        // Try lowercase stripped
        if (record[strippedKey.toLowerCase()] !== undefined) return record[strippedKey.toLowerCase()];

        return 0;
    };

    return (
        <div
            ref={ref}
            className='w-full max-w-full bg-white p-8 font-serif text-[14px] text-black leading-relaxed'
            id='cumulative-salary-print-container'>
            {/* Header */}
            <div className='relative mb-4 border-gray-400 border-b-2 pb-4 text-center'>
                <div className='absolute top-0 left-0'>
                    <img src='/assets/tunbridge_logo.png' alt='Logo' className='h-[100px] w-auto' />
                </div>
                <div className='w-full'>
                    <h1 className='font-bold text-3xl text-[#2e57a0] uppercase' style={{ fontFamily: 'sans-serif' }}>
                        Tunbridge High School
                    </h1>
                    <p className='mt-1 text-sm'>86/2 Infantry Road, Bangalore, Karnataka, India 560001</p>
                    <p className='text-sm'>Mail Id: tunbridgehs@gmail.com</p>
                </div>
            </div>

            {/* Report Title */}
            <div className='mt-2 text-center font-bold text-base'>HRMS Module</div>
            <div className='mt-1 mb-6 text-center font-bold text-sm uppercase'>
                Cumulative Salary Report - {month} {year}
            </div>

            {/* Info Box */}
            <div className='mb-6 w-full text-sm'>
                <div className='mb-2 flex justify-between'>
                    <div className='flex w-[48%]'>
                        <span className='w-[150px] font-bold'>Designation:</span>
                        <span className='flex-1 border-black border-b border-dotted'>Implementation Engineer</span>
                    </div>
                    <div className='flex w-[48%]'>
                        <span className='w-[150px] font-bold'>Date:</span>
                        <span className='flex-1 border-black border-b border-dotted'>
                            {currentDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
                <div className='mb-2 flex justify-between'>
                    <div className='flex w-[48%]'>
                        <span className='w-[150px] font-bold'>Name:</span>
                        <span className='flex-1 border-black border-b border-dotted'>&nbsp;</span>
                    </div>
                    <div className='flex w-[48%]'>
                        <span className='w-[150px] font-bold'>Year:</span>
                        <span className='flex-1 border-black border-b border-dotted'>{year}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className='w-full border-collapse border border-black text-[10px]'>
                <thead>
                    <tr className='bg-white'>
                        <th className='w-10 border border-black p-2 text-left'>Sl.No</th>
                        <th className='border border-black p-2 text-left'>Employee Code</th>
                        <th className='border border-black p-2 text-left'>Employee Name</th>
                        <th className='border border-black p-2 text-left'>Designation</th>
                        <th className='border border-black p-2 text-center'>Working Days</th>

                        {/* Dynamic Earnings Headers */}
                        {earnings.map((head: any) => (
                            <th key={`h-earn-${head.hrmeD_Id}`} className='border border-black p-2 text-right'>
                                {head.hrmeD_Name}
                            </th>
                        ))}

                        <th className='border border-black p-2 text-right font-bold'>Gross Pay</th>

                        {/* Dynamic Deductions Headers */}
                        {deductions.map((head: any) => (
                            <th key={`h-ded-${head.hrmeD_Id}`} className='border border-black p-2 text-right'>
                                {head.hrmeD_Name}
                            </th>
                        ))}

                        <th className='border border-black p-2 text-right font-bold'>Total Ded</th>
                        <th className='border border-black p-2 text-right font-bold'>Net Pay</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length > 0 ? (
                        records.map((record: any, index: number) => {
                            // Calculation Logic using getValue
                            const gross = earnings.reduce((sum: number, h: any) => sum + (Number(getValue(record, h.hrmeD_Name)) || 0), 0);
                            const totalDed = deductions.reduce(
                                (sum: number, h: any) => sum + (Number(getValue(record, h.hrmeD_Name)) || 0),
                                0
                            );
                            const netPay = gross - totalDed;

                            return (
                                <tr key={index}>
                                    <td className='border border-black p-2 text-center'>{index + 1}</td>
                                    <td className='border border-black p-2'>{record.hrme_employeecode}</td>
                                    <td className='border border-black p-2'>
                                        {record.hrme_employeefirstname} {record.hrme_employeemiddlename} {record.hrme_employeelastname}
                                    </td>
                                    <td className='border border-black p-2'>{record.hrmdes_designationname}</td>
                                    <td className='border border-black p-2 text-center'>{record.hres_workingdays}</td>

                                    {/* Earnings */}
                                    {earnings.map((head: any) => (
                                        <td key={`v-earn-${head.hrmeD_Id}`} className='border border-black p-2 text-right'>
                                            {getValue(record, head.hrmeD_Name)}
                                        </td>
                                    ))}

                                    <td className='border border-black p-2 text-right font-bold'>{gross.toFixed(2)}</td>

                                    {/* Deductions */}
                                    {deductions.map((head: any) => (
                                        <td key={`v-ded-${head.hrmeD_Id}`} className='border border-black p-2 text-right'>
                                            {getValue(record, head.hrmeD_Name)}
                                        </td>
                                    ))}

                                    <td className='border border-black p-2 text-right font-bold'>{totalDed.toFixed(2)}</td>
                                    <td className='border border-black p-2 text-right font-bold'>{netPay.toFixed(2)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5 + earnings.length + 1 + deductions.length + 2} className='border border-black p-4 text-center'>
                                No Data Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Footer Signatures */}
            <div className='mt-12 grid grid-cols-2 gap-x-12 gap-y-8 font-medium text-xs'>
                <div className='space-y-8'>
                    <div className='w-[80%] border-black border-b'></div>
                    <div>Implementation Engineer</div>
                </div>
                <div className='space-y-8 text-right'>
                    <div className='flex justify-end'>
                        <div className='w-[80%] border-black border-b text-left'>{currentDate.toLocaleDateString('en-GB')}</div>
                    </div>
                    <div>Date</div>
                </div>
                <div className='space-y-8'>
                    <div className='w-[80%] border-black border-b'></div>
                    <div>End User</div>
                </div>
                <div className='space-y-8 text-right'>
                    <div className='flex justify-end'>
                        <div className='w-[80%] border-black border-b'></div>
                    </div>
                    <div>
                        Nodal Officer:
                        <br />
                        Seal
                    </div>
                </div>
            </div>
        </div>
    );
});

CumulativeSalaryPrint.displayName = 'CumulativeSalaryPrint';
