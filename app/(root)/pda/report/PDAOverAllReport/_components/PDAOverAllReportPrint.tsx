'use client';
import type { IPDAOverAllReportRow } from '@/types/pda/report/pda-overall-report';

interface PDAOverAllReportPrintProps {
    data: IPDAOverAllReportRow[];
    totals: {
        opening: number;
        wallet: number;
        spent: number;
        balance: number;
    };
}

export default function PDAOverAllReportPrint({ data, totals }: PDAOverAllReportPrintProps) {
    return (
        <div id='print-pda-overall' className='hidden bg-white p-8 print:block'>
            <div className='mb-8 space-y-2 text-center'>
                <h1 className='font-bold text-2xl uppercase tracking-wider'>PDA OverAll Report</h1>
                <div className='mx-auto h-1 w-32 bg-gray-800'></div>
            </div>

            <table className='w-full border-collapse border border-gray-400 text-sm'>
                <thead>
                    <tr className='bg-gray-100'>
                        <th className='w-12 border border-gray-400 p-2 text-center'>SL.NO</th>
                        <th className='border border-gray-400 p-2 text-left'>Student Name</th>
                        <th className='border border-gray-400 p-2 text-left'>Admission No</th>
                        <th className='border border-gray-400 p-2 text-left'>Class : Section</th>
                        <th className='border border-gray-400 p-2 text-right'>Opening Bal</th>
                        <th className='border border-gray-400 p-2 text-right'>Wallet Amt</th>
                        <th className='border border-gray-400 p-2 text-right'>Spent Amt</th>
                        <th className='border border-gray-400 p-2 text-right'>Balance Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td className='border border-gray-400 p-2 text-center'>{index + 1}</td>
                            <td className='border border-gray-400 p-2'>{row.StudentName}</td>
                            <td className='border border-gray-400 p-2'>{row.AMST_AdmNo}</td>
                            <td className='border border-gray-400 p-2'>
                                {row.ASMCL_ClassName} : {row.ASMC_SectionName}
                            </td>
                            <td className='border border-gray-400 p-2 text-right'>
                                {row.Opening_Balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className='border border-gray-400 p-2 text-right'>
                                {row.Wallet_Amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className='border border-gray-400 p-2 text-right'>
                                {row.Spent_Amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className='border border-gray-400 p-2 text-right font-bold'>
                                {row.Balance_Amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className='bg-gray-50 font-bold'>
                        <td colSpan={4} className='border border-gray-400 p-2 text-right'>
                            Total:
                        </td>
                        <td className='border border-gray-400 p-2 text-right'>
                            {totals.opening.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className='border border-gray-400 p-2 text-right'>
                            {totals.wallet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className='border border-gray-400 p-2 text-right'>
                            {totals.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className='border border-gray-400 p-2 text-right'>
                            {totals.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className='mt-12 flex justify-between text-gray-500 text-xs'>
                <p>Printed on: {new Date().toLocaleString()}</p>
                <p>Authorized Signature</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #print-pda-overall, #print-pda-overall * {
                        visibility: visible;
                    }
                    #print-pda-overall {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
