'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ISalarySlipMainItem } from '@/types/staff-portal/salary-slip';
import { format } from 'date-fns';
import { Mail, Phone, Printer, X } from 'lucide-react';
import type React from 'react';

interface SalarySlipViewProps {
    data: ISalarySlipMainItem[];
    onCancel: () => void;
}

const SalarySlipView: React.FC<SalarySlipViewProps> = ({ data, onCancel }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='fade-in slide-in-from-top-4 animate-in space-y-8'>
            {data.map((employee, index) => (
                <div key={index} className='print:m-0 print:p-0'>
                    <Card id={`salary-slip-${index}`} className='print:border-0 print:shadow-none'>
                        <CardHeader className='flex flex-row items-center justify-between print:hidden'>
                            <CardTitle className='text-lg'>Employee Salary Slip</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {/* Header Section */}
                            <div className='space-y-2 border-b pb-6 text-center'>
                                <div className='mb-4 flex justify-center'>
                                    <img
                                        src={employee.institutionDetails.mI_Logo || '/images/logo.png'}
                                        alt='Logo'
                                        className='h-24 w-auto'
                                    />
                                </div>
                                <h2 className='font-bold text-2xl text-primary uppercase'>
                                    Salary Slip: {employee.selectedMonth} {employee.selectedYear}
                                </h2>
                            </div>

                            {/* Info Section */}
                            <div className='grid grid-cols-1 gap-8 py-4 md:grid-cols-2'>
                                <div className='space-y-3'>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Name</span>
                                        <span>
                                            : {employee.currentemployeeDetails.hrmE_EmployeeFirstName}{' '}
                                            {employee.currentemployeeDetails.hrmE_EmployeeMiddleName}{' '}
                                            {employee.currentemployeeDetails.hrmE_EmployeeLastName}
                                        </span>
                                    </div>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Department</span>
                                        <span>: {employee.departmentName}</span>
                                    </div>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Designation</span>
                                        <span>: {employee.designationName}</span>
                                    </div>
                                    {employee.currentemployeeDetails.hrmE_PFApplicableFlag && (
                                        <div className='flex border-b pb-1'>
                                            <span className='w-40 font-semibold'>PF Ac No.</span>
                                            <span>: {employee.currentemployeeDetails.hrmE_UINumber}</span>
                                        </div>
                                    )}
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Bank Name</span>
                                        <span>: {employee.empsaldetail.hreS_BankCode}</span>
                                    </div>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Bank Ac No.</span>
                                        <span>: {employee.empsaldetail.hreS_AccountNo}</span>
                                    </div>
                                </div>

                                <div className='space-y-3'>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Employee Code</span>
                                        <span>: {employee.currentemployeeDetails.hrmE_EmployeeCode}</span>
                                    </div>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Date Of Joining</span>
                                        <span>
                                            :{' '}
                                            {employee.currentemployeeDetails.hrmE_DOJ
                                                ? format(new Date(employee.currentemployeeDetails.hrmE_DOJ), 'dd-MM-yyyy')
                                                : ''}
                                        </span>
                                    </div>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>PAN No.</span>
                                        <span>: {employee.currentemployeeDetails.hrmE_PANCardNo}</span>
                                    </div>
                                    {employee.currentemployeeDetails.hrmE_ESIApplicableFlag && (
                                        <div className='flex border-b pb-1'>
                                            <span className='w-40 font-semibold'>ESI Ac No.</span>
                                            <span>: {employee.currentemployeeDetails.hrmE_ESIAccNo}</span>
                                        </div>
                                    )}
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>Working Days</span>
                                        <span>: {employee.empsaldetail.hreS_WorkingDays}</span>
                                    </div>
                                    <div className='flex border-b pb-1'>
                                        <span className='w-40 font-semibold'>LOP Days</span>
                                        <span>: {employee.empsaldetail.lopdays}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details Table */}
                            <div className='overflow-hidden rounded-md border'>
                                <Table>
                                    <TableHeader className='bg-muted'>
                                        <TableRow>
                                            <TableHead className='border-r font-bold'>Earnings</TableHead>
                                            <TableHead className='border-r text-right font-bold'>Amount</TableHead>
                                            <TableHead className='border-r font-bold'>Deductions</TableHead>
                                            <TableHead className='text-right font-bold'>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employee.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className='border-r'>{item.HRMED_Name}</TableCell>
                                                <TableCell className='border-r text-right font-medium'>
                                                    {item.Amount.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </TableCell>
                                                <TableCell className='border-r'>{item.ds?.HRMED_Name || ''}</TableCell>
                                                <TableCell className='text-right font-medium'>
                                                    {item.ds?.Amount.toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }) || ''}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className='bg-muted/50 font-bold'>
                                            <TableCell className='border-r'>Total</TableCell>
                                            <TableCell className='border-r text-right'>
                                                {employee.totals[0].toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </TableCell>
                                            <TableCell className='border-r'>Total</TableCell>
                                            <TableCell className='text-right'>
                                                {employee.totals[1].toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Net Salary Section */}
                            <div className='space-y-4 pt-4'>
                                <div className='flex gap-4 font-bold text-xl'>
                                    <span>Net Salary:</span>
                                    <span className='text-primary'>
                                        ₹{' '}
                                        {employee.NetSalary.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}{' '}
                                        /-
                                    </span>
                                </div>
                                <div className='text-muted-foreground text-sm uppercase italic'>
                                    Net Salary in Words : {employee.NetAmountInwords}
                                </div>
                            </div>

                            {/* Note Section */}
                            <div className='border-t pt-8 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                NOTE : Signature is not required because it is a computer generated statement.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons (Hidden on Print) */}
                    <div className='mt-8 flex justify-center gap-4 print:hidden'>
                        <Button onClick={handlePrint} className='bg-primary hover:bg-primary/90'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                        <Button variant='secondary'>
                            <Mail className='mr-2 h-4 w-4' />
                            Send Mail
                        </Button>
                        <Button variant='secondary'>
                            <Phone className='mr-2 h-4 w-4' />
                            Send SMS
                        </Button>
                        <Button variant='outline' onClick={onCancel}>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SalarySlipView;
