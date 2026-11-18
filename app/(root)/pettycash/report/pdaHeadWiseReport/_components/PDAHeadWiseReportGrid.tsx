import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import React from 'react';

interface PDAHeadWiseReportGridProps {
    reportData: any;
}

export function PDAHeadWiseReportGrid({ reportData }: PDAHeadWiseReportGridProps) {
    if (!reportData || !reportData.employees || reportData.employees.length === 0) {
        return null;
    }

    return (
        <Card className='mt-6'>
            <CardHeader>
                <CardTitle>Report Grid View</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='overflow-x-auto'>
                    <Table id='printSectionId' className='border'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='border text-center'>SLNO</TableHead>
                                <TableHead className='border text-center'>Adm.No</TableHead>
                                <TableHead className='border text-center'>Student Name</TableHead>
                                <TableHead className='border text-center'>Class & Section</TableHead>
                                <TableHead className='border text-center'>PDA Expenditure Head</TableHead>
                                <TableHead className='border text-center'>Transaction No</TableHead>
                                <TableHead className='border text-center'>Transaction Date</TableHead>
                                <TableHead className='border text-center'>Remarks</TableHead>
                                <TableHead className='border text-center'>Amount</TableHead>
                                <TableHead className='border text-center'>Total Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.employees.map((user: any, index: number) => {
                                const rowSpan = user.headwisereport.length + 1;
                                return (
                                    <React.Fragment key={user.AMST_Id}>
                                        <TableRow>
                                            <TableCell className='border text-center' rowSpan={rowSpan}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='border text-center' rowSpan={rowSpan}>
                                                {user.AMST_AdmNo}
                                            </TableCell>
                                            <TableCell className='border text-center' rowSpan={rowSpan}>
                                                {user.AMST_FirstName}
                                            </TableCell>
                                            <TableCell className='border text-center' rowSpan={rowSpan}>
                                                {user.ASMCL_ClassName}-{user.ASMC_SectionName}
                                            </TableCell>
                                        </TableRow>
                                        {user.headwisereport.map((head: any) => (
                                            <TableRow key={`${user.AMST_Id}-${head.PDAMH_Id}`}>
                                                <TableCell className='border'>{head.PDAMH_HeadName}</TableCell>
                                                <TableCell className='border p-0'>
                                                    <table className='w-full'>
                                                        <tbody>
                                                            {head.transactions.map((t: any, i: number) => (
                                                                <tr
                                                                    key={i}
                                                                    className={i !== head.transactions.length - 1 ? 'border-b' : ''}>
                                                                    <td className='p-2'>{t.PDAE_TransactionNo}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </TableCell>
                                                <TableCell className='border p-0'>
                                                    <table className='w-full'>
                                                        <tbody>
                                                            {head.transactions.map((t: any, i: number) => (
                                                                <tr
                                                                    key={i}
                                                                    className={i !== head.transactions.length - 1 ? 'border-b' : ''}>
                                                                    <td className='p-2'>
                                                                        {t.PDAE_Date ? format(new Date(t.PDAE_Date), 'dd/MM/yyyy') : ''}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </TableCell>
                                                <TableCell className='border p-0'>
                                                    <table className='w-full'>
                                                        <tbody>
                                                            {head.transactions.map((t: any, i: number) => (
                                                                <tr
                                                                    key={i}
                                                                    className={i !== head.transactions.length - 1 ? 'border-b' : ''}>
                                                                    <td className='p-2'>{t.PDAE_Remarks}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </TableCell>
                                                <TableCell className='border p-0'>
                                                    <table className='w-full text-right'>
                                                        <tbody>
                                                            {head.transactions.map((t: any, i: number) => (
                                                                <tr
                                                                    key={i}
                                                                    className={i !== head.transactions.length - 1 ? 'border-b' : ''}>
                                                                    <td className='p-2'>{t.PDAE_TotAmount}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </TableCell>
                                                <TableCell className='border text-right'>{head.TotalAmount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                            <TableRow>
                                <TableCell colSpan={8} className='border text-right font-bold'>
                                    Total
                                </TableCell>
                                <TableCell className='border text-right font-bold'>{reportData.d_Amount}</TableCell>
                                <TableCell className='border text-right font-bold'>{reportData.d_total_Amount}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
