'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PS7ReportDisplayProps {
    data: any;
    year: string;
}

export function PS7ReportDisplay({ data, year }: PS7ReportDisplayProps) {
    if (!data || !data.employeeDetails || data.employeeDetails.length === 0) return null;

    const currentYearStr = year || new Date().getFullYear().toString();
    const nextYearNum = Number.parseInt(currentYearStr) + 1;

    const handlePrint = () => {
        window.print();
    };

    const response = data;

    return (
        <>
            <style>
                {`
            @media print {
                body * {
                visibility: hidden;
                }

                #printable-report,
                #printable-report * {
                visibility: visible;
                }

                #printable-report {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                }
            }
            `}
            </style>
            <div id='printable-report'>
                <div className='flex w-full justify-end print:hidden'>
                    <Button onClick={() => handlePrint()} className='mb-4 w-fit' variant='destructive'>
                        Print
                    </Button>
                </div>
                {response?.employeeDetails.map((emp: any, index: number) => {
                    // Filter details for this specific employee
                    const empDetails = response?.details.filter((d: any) => d.hrmE_Id === emp.hrmE_Id);

                    // Calculate totals
                    const totalWages = empDetails.reduce((acc: number, cur: any) => acc + (cur.sumCondition || 0), 0);
                    const totalPension = empDetails.reduce((acc: number, cur: any) => acc + (cur.pensionAmount || 0), 0);

                    return (
                        <div key={emp.hrmE_Id || index}>
                            <Card key={emp.hrmE_Id || index} className='mt-4 border-t-4 border-t-primary bg-white p-8 shadow-md'>
                                <div className='mb-8 space-y-2 text-center'>
                                    <h4 className='font-semibold text-lg'>(For Exempted Established only)</h4>
                                    <h4 className='font-bold text-primary text-xl uppercase tracking-wider'>
                                        The Employees' Pension Scheme, 1995
                                    </h4>
                                    <h4 className='font-semibold tracking-wide'>(Paragraph 19)</h4>
                                    <h4 className='mx-auto mt-6 w-max border-t px-8 pt-4 font-bold text-lg'>
                                        Contribution Card for the member for the year {currentYearStr} To {nextYearNum}
                                    </h4>
                                </div>

                                <div className='mb-10 grid grid-cols-12 gap-4 rounded-lg border bg-muted/10 p-6 text-sm'>
                                    <div className='col-span-5 space-y-3 font-semibold text-muted-foreground'>
                                        <p>(1) Account Number :</p>
                                        <p>(2) Name (in Block Capitals) :</p>
                                        <p>(3) Father's/Husband's Name :</p>
                                        <p>(4) Name & Address of the Established :</p>
                                        <p>(5) Whether Opted to contributed on wages, excess of Rs. :</p>
                                    </div>
                                    <div className='col-span-7 space-y-3 font-bold text-gray-800'>
                                        <p className='text-primary'>{emp.hrmE_PFAccNo || '-'}</p>
                                        <p>{emp.hrmE_EmployeeName || '-'}</p>
                                        <p>{emp.hrmE_FatherName || '-'}</p>
                                        <p>
                                            {emp.mI_Name} {emp.mI_Address1}
                                        </p>
                                        <p>15000.00</p>
                                    </div>
                                </div>

                                <div className='mb-8 overflow-hidden rounded-md border shadow-sm'>
                                    <table className='w-full text-center text-sm'>
                                        <thead className='bg-[#f0f4f8] text-gray-700'>
                                            <tr className='border-b'>
                                                <th className='w-[15%] border-r p-3 font-bold'>Month</th>
                                                <th className='w-[30%] border-r p-3 font-bold'>
                                                    Amount of Wages retaining allownace,
                                                    <br />
                                                    if any & DA includ.Cash value of food <br />
                                                    concession paid during the month
                                                </th>
                                                <th className='w-[20%] border-r p-3 font-bold'>
                                                    Contribution to pension <br /> Fund 8.33%
                                                </th>
                                                <th className='w-[20%] border-r p-3 font-bold'>
                                                    No.of days / period of non <br />
                                                    contributing service
                                                </th>
                                                <th className='w-[15%] p-3 font-bold'>Remarks</th>
                                            </tr>
                                            <tr className='border-b bg-[#e2e8f0]/50 font-semibold text-xs'>
                                                <td className='border-r p-1'>(1)</td>
                                                <td className='border-r p-1'>(2)</td>
                                                <td className='border-r p-1'>(3)</td>
                                                <td className='border-r p-1'>(4)</td>
                                                <td className='p-1'>(5)</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empDetails.length > 0 ? (
                                                empDetails.map((detail: any, i: number) => (
                                                    <tr key={i} className='border-b transition-colors hover:bg-muted/10'>
                                                        <td className='border-r p-2 pl-6 font-medium'>{detail.monthName}</td>
                                                        <td className='border-r p-2'>{detail.sumCondition}</td>
                                                        <td className='border-r p-2'>{detail.pensionAmount}</td>
                                                        <td className='border-r p-2'></td>
                                                        {i === 0 && (
                                                            <td
                                                                className='bg-muted/5 p-2 pl-3 text-left align-top text-muted-foreground text-xs'
                                                                rowSpan={empDetails.length}>
                                                                {emp.hrmE_PensionStoppedDate ? (
                                                                    <>
                                                                        Date Of Leaving{' '}
                                                                        {new Date(emp.hrmE_PensionStoppedDate).toLocaleDateString()}
                                                                        <br />
                                                                        Service
                                                                        <br />
                                                                        Reason of Leaving
                                                                        <br />
                                                                        Service,
                                                                        <br />
                                                                        Date OF Attaining
                                                                        <br />
                                                                        The age of 58 Years <br />
                                                                        For Stoppage Of <br />
                                                                        Contribution
                                                                    </>
                                                                ) : null}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className='bg-muted/5 p-8 text-muted-foreground'>
                                                        No records found for this employee
                                                    </td>
                                                </tr>
                                            )}

                                            {empDetails.length > 0 && (
                                                <tr className='border-slate-300 border-t-2 bg-[#f8fafc] font-extrabold'>
                                                    <td className='border-r p-3 pl-6'>TOTAL</td>
                                                    <td className='border-r p-3 text-lg text-primary'>{totalWages}</td>
                                                    <td className='border-r p-3 text-lg text-primary'>{totalPension}</td>
                                                    <td className='border-r p-3'></td>
                                                    <td className='bg-muted/5 p-3'></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mb-16 space-y-6 rounded-lg border border-blue-100 bg-blue-50/50 p-6 text-justify font-medium text-slate-800 text-sm leading-relaxed'>
                                    <p>
                                        (1) Certificate that the difference between total number of contribution shown under Column (3) of
                                        the above table and that Arrieved at on total wages shows in column (2) at the prescribed rate is
                                        solely due to the rounding off contribution to the nearest Re. under the rules.
                                    </p>
                                    <p>
                                        (2) Certificate that the total amount of contributions indicated under col.(3) i.e.{' '}
                                        <span className='px-1 font-extrabold text-base text-primary'>{totalPension}.00</span> has already
                                        been of remitted in full in account No. 10 (Pension Fund Contribution).
                                    </p>
                                </div>

                                <div className='flex items-end justify-between px-10 pt-12 pb-6'>
                                    <div className='font-semibold text-base text-gray-700'>
                                        Date : <span className='inline-block w-32 border-gray-400 border-b border-dashed'></span>
                                    </div>
                                    <div className='border-gray-800 border-t-2 px-8 pt-3 font-semibold text-base text-gray-800'>
                                        Signature of the Employer (with Official Seal)
                                    </div>
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
