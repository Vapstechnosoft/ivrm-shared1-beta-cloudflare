'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePDAReport, getPDAReportLoadData } from '@/server/pda/report/pda-report';
import type { IPDAAdmStudent, IPDAReportRequest, IPDAReportResponse, IPDAReportRow } from '@/types/pda/report/pda-report';
import { FileText, Loader2, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import PDAReportForm from './_components/PDAReportForm';
import PDAReportPrint from './_components/PDAReportPrint';

export interface IGroupedReport {
    stu_id: number;
    conces: number;
    paid: number;
    tot: number;
    final: number;
    stu_rpt: IPDAReportRow[];
    donation: IPDAReportRow[];
    fees: IPDAReportRow[];
    other: IPDAReportRow[];
    donationtotal: number;
    feestotal: number;
    othertotal: number;
    studentInfo?: IPDAAdmStudent;
}

export default function PDAReportPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [loadData, setLoadData] = useState<any>(null);
    const [reportResponse, setReportResponse] = useState<IPDAReportResponse | null>(null);
    const [filters, setFilters] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getPDAReportLoadData();
                if (response.success && response.data) {
                    setLoadData(response.data);
                }
            } catch (error) {
                console.error('Error fetching load data:', error);
                toast.error('Failed to load initial configurations');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleFormSubmit = async (data: IPDAReportRequest & { format1: boolean }) => {
        setGenerating(true);
        setReportResponse(null);
        setFilters(data);
        try {
            const response = await generatePDAReport(data);
            if (response.success && response.data?.headwise?.$values) {
                if (response.data.headwise.$values.length > 0) {
                    setReportResponse(response.data);
                    toast.success('Report generated successfully');
                } else {
                    toast.error('No Record Found');
                }
            } else {
                toast.error('No Record Found');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const groupedReport: IGroupedReport[] = useMemo(() => {
        if (!reportResponse) return [];

        const headwise = reportResponse.headwise?.$values || [];
        const paidList = reportResponse.searcharray?.$values || [];
        const admStudents = reportResponse.admsudentslist?.$values || [];

        const studentIds = Array.from(new Set(headwise.map((h) => h.AMST_Id)));

        return studentIds.map((stuId) => {
            const stuRpt = headwise.filter((h) => h.AMST_Id === stuId);
            const paidRecord = paidList.find((p) => p.amst_Id === stuId);
            const admInfo = admStudents.find((a) => a.amst_Id === stuId);

            const fees = stuRpt.filter(
                (h) => h.PDAMH_HeadName === 'EDN ESTABLISHMENT and ADMINISTRATION FEE' || h.PDAMH_HeadName === 'BOARDING CHARGES'
            );
            const donation = stuRpt.filter(
                (h) =>
                    h.PDAMH_HeadName === 'STAFF SALARY FUND' ||
                    h.PDAMH_HeadName === 'DEVELOPMENT FUND' ||
                    h.PDAMH_HeadName === 'BUILDING FUND'
            );
            const other = stuRpt.filter((h) => !fees.includes(h) && !donation.includes(h));

            const feestotal = fees.reduce((sum, h) => sum + h.PDAEH_Amount, 0);
            const donationtotal = donation.reduce((sum, h) => sum + h.PDAEH_Amount, 0);
            const othertotal = other.reduce((sum, h) => sum + h.PDAEH_Amount, 0);
            const tot = stuRpt.reduce((sum, h) => sum + h.PDAEH_Amount, 0);

            const paid = paidRecord?.fsS_PaidAmount || 0;
            const conces = paidRecord?.fsS_CurrentYrCharges || 0;

            return {
                stu_id: stuId,
                conces,
                paid,
                tot,
                final: Math.abs(paid - tot),
                stu_rpt: stuRpt,
                donation,
                fees,
                other,
                donationtotal,
                feestotal,
                othertotal,
                studentInfo: admInfo
            };
        });
    }, [reportResponse]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className='flex h-[400px] flex-col items-center justify-center gap-4'>
                <Loader2 className='h-10 w-10 animate-spin text-primary' />
                <p className='font-medium text-gray-500'>Loading report configurations...</p>
            </div>
        );
    }

    return (
        <div className='container mx-auto max-w-7xl space-y-10 p-6'>
            <Card className='fade-in zoom-in-95 animate-in overflow-hidden border-none bg-white/60 shadow-2xl backdrop-blur-md duration-700'>
                <CardHeader className='border-b bg-gray-50/50 px-8 py-6'>
                    <CardTitle className='flex items-center gap-2 font-bold text-gray-800 text-xl'>
                        <span className='h-2 w-2 animate-pulse rounded-full bg-primary'></span>
                        Statement Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent className='p-8'>
                    <PDAReportForm onSubmit={handleFormSubmit} onReset={() => window.location.reload()} />
                </CardContent>
            </Card>

            {generating && (
                <div className='flex flex-col items-center justify-center gap-4 py-20'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='font-semibold text-gray-700 text-lg'>Fetching records...</p>
                </div>
            )}

            {groupedReport.length > 0 && !generating && (
                <div className='slide-in-from-bottom-8 animate-in space-y-6 duration-700'>
                    <div className='flex justify-center'>
                        <Button
                            onClick={handlePrint}
                            className='h-12 rounded-xl bg-indigo-600 px-12 shadow-indigo-200 shadow-xl transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                            <Printer className='mr-2 h-5 w-5' />
                            Print Statement
                        </Button>
                    </div>

                    <div className='relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl'>
                        <div className='pointer-events-none absolute top-0 right-0 p-4 opacity-5'>
                            <FileText size={200} />
                        </div>

                        <div className='relative z-10 space-y-8'>
                            <div className='flex items-center justify-between border-b pb-6'>
                                <h3 className='font-bold text-2xl text-gray-800'>Preview</h3>
                                <div className='rounded-full bg-green-50 px-4 py-2 font-bold text-green-700 text-sm'>
                                    {groupedReport.length} Students Grouped
                                </div>
                            </div>

                            <p className='text-gray-500 italic'>
                                Scroll down to see the print-optimized view or click "Print Statement" to generate the official document.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print View */}
            {(isPrinting || groupedReport.length > 0) && (
                <div className={isPrinting ? 'block' : 'hidden'}>
                    <PDAReportPrint
                        reportData={groupedReport}
                        filters={filters}
                        year={loadData?.fillyear?.$values.find((y: any) => y.asmaY_Id === filters?.ASMAY_Id)?.asmaY_Year}
                    />
                </div>
            )}
        </div>
    );
}
