'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { feeReceiptLogo } from '@/hooks/fees/useReports';
import type { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { FeeIncomeTaxPrint } from './feeIncomeTax_print';

interface FeeIncomeTaxReportProps {
    data: IFeeIncomeTaxReportResult[];
    onClose: () => void;
}

export default function FeeIncomeTaxReport({ data, onClose }: FeeIncomeTaxReportProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const { data: logoData } = feeReceiptLogo();

    const logoUrl = (logoData as any)?.data?.[0]?.asC_Logo_Path || '';

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Fee_Income_Tax_Report'
    });

    if (!data || data.length === 0) return null;

    return (
        <div className='fade-in slide-in-from-bottom-4 mt-8 animate-in space-y-4 duration-500'>
            <Card className='overflow-hidden border-0 shadow-2xl'>
                <div className='flex justify-end border-b bg-gray-50/50 p-4 print:hidden'>
                    <Button
                        variant='default'
                        size='sm'
                        onClick={handlePrint}
                        className='w-40 bg-blue-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700'>
                        <Printer className='mr-2 h-4 w-4' />
                        Print Report
                    </Button>
                </div>
                <CardContent className='p-0'>
                    <FeeIncomeTaxPrint ref={printRef} data={data} logoUrl={logoUrl} />
                </CardContent>
            </Card>
        </div>
    );
}
