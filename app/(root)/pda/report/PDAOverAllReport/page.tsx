'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePDAOverAllReport, getPDAOverAllLoadData } from '@/server/pda/report/pda-overall-report';
import type { IPDAOverAllReportRequest, IPDAOverAllReportRow } from '@/types/pda/report/pda-overall-report';
import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PDAOverAllReportForm from './_components/PDAOverAllReportForm';
import PDAOverAllReportGrid from './_components/PDAOverAllReportGrid';
import PDAOverAllReportPrint from './_components/PDAOverAllReportPrint';

export default function PDAOverAllReportPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [loadData, setLoadData] = useState<any>(null);
    const [reportDetails, setReportDetails] = useState<IPDAOverAllReportRow[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    const [printData, setPrintData] = useState<IPDAOverAllReportRow[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getPDAOverAllLoadData();
                if (response.success && response.data) {
                    setLoadData(response.data);
                } else {
                    toast.error('Failed to load initial data');
                }
            } catch (error) {
                console.error('Error fetching load data:', error);
                toast.error('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleFormSubmit = async (filters: IPDAOverAllReportRequest) => {
        setGenerating(true);
        setShowGrid(false);
        try {
            const response = await generatePDAOverAllReport(filters);
            if (response.success && response.data?.headwise?.$values) {
                const data = response.data.headwise.$values;
                if (data.length > 0) {
                    setReportDetails(data);
                    setShowGrid(true);
                    toast.success(`Found ${data.length} records`);
                } else {
                    toast.error('No records found for the selected criteria');
                    setReportDetails([]);
                }
            } else {
                toast.error('No Record Found');
                setReportDetails([]);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const handlePrint = (selectedRecords: IPDAOverAllReportRow[]) => {
        setPrintData(selectedRecords);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    const printTotals = React.useMemo(() => {
        return printData.reduce(
            (acc, row) => ({
                opening: acc.opening + (row.Opening_Balance || 0),
                wallet: acc.wallet + (row.Wallet_Amount || 0),
                spent: acc.spent + (row.Spent_Amount || 0),
                balance: acc.balance + (row.Balance_Amount || 0)
            }),
            { opening: 0, wallet: 0, spent: 0, balance: 0 }
        );
    }, [printData]);

    if (loading) {
        return (
            <div className='flex h-[400px] flex-col items-center justify-center gap-4'>
                <Loader2 className='h-10 w-10 animate-spin text-primary' />
                <p className='animate-pulse font-medium text-gray-500'>Loading report configurations...</p>
            </div>
        );
    }

    return (
        <div className='container mx-auto max-w-7xl space-y-10 p-6'>
            <div className='slide-in-from-left-4 flex animate-in items-center gap-4 duration-500'></div>

            <Card className='fade-in zoom-in-95 animate-in overflow-hidden border-none bg-white/60 shadow-2xl backdrop-blur-md duration-700'>
                <CardHeader className='border-b bg-gray-50/50 px-8 py-6'>
                    <CardTitle className='flex items-center gap-2 font-bold text-gray-800 text-xl'>
                        <span className='h-2 w-2 animate-pulse rounded-full bg-primary'></span>
                        Report Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-8'>
                    <PDAOverAllReportForm onSubmit={handleFormSubmit} onReset={() => window.location.reload()} />
                </CardContent>
            </Card>

            {generating && (
                <div className='fade-in flex animate-in flex-col items-center justify-center gap-4 py-20 duration-300'>
                    <div className='relative'>
                        <Loader2 className='h-12 w-12 animate-spin text-primary' />
                        <div className='absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-primary/20'></div>
                    </div>
                    <p className='font-semibold text-gray-700 text-lg'>Processing records, please wait...</p>
                </div>
            )}

            {showGrid && !generating && (
                <Card className='slide-in-from-bottom-8 animate-in border-none bg-white shadow-2xl duration-700'>
                    <CardHeader className='flex flex-row items-center justify-between border-b bg-gray-50/50 px-8 py-6'>
                        <CardTitle className='flex items-center gap-2 font-bold text-gray-800 text-xl'>
                            <span className='h-2 w-2 rounded-full bg-indigo-500'></span>
                            Report Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <PDAOverAllReportGrid data={reportDetails} onPrint={handlePrint} />
                    </CardContent>
                </Card>
            )}

            {/* Print View Component */}
            {isPrinting && <PDAOverAllReportPrint data={printData} totals={printTotals} />}
        </div>
    );
}
