'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSMSCConductCertReport } from '@/hooks/admission/sms/reports/useSMSCConductCertificate';
import { ChevronDown, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { PrintComponent } from './_components/print-component';

export default function SMSCConductCertificatePage() {
    const reportMutation = useSMSCConductCertReport();
    const [reportData, setReportData] = useState<any>(null);
    const [certType, setCertType] = useState<'0' | '1'>('1');
    const [logo, setLogo] = useState<string>('');
    const [extraFields, setExtraFields] = useState<any>({});
    const [isFormOpen, setIsFormOpen] = useState(true);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Certificate_${new Date().getTime()}`
    });

    const onFilterSubmit = (data: any) => {
        setCertType(data.Character);
        setExtraFields({
            exmname: data.exmname,
            exmmonth: data.exmmonth,
            stdreg: data.stdreg
        });

        reportMutation.mutate(
            {
                ASMAY_Id: data.asmaY_Id,
                AMCST_SOL: data.optradio,
                AMCO_Id: data.allorindi === 'A' ? 0 : data.amcO_Id || 0,
                AMB_Id: data.allorindi === 'A' ? 0 : data.amB_Id || 0,
                AMSE_Id: data.allorindi === 'A' ? 0 : data.amsE_Id || 0,
                ACMS_Id: data.allorindi === 'A' ? 0 : data.acmS_Id || 0,
                AMCST_Id: data.amcsT_Id,
                allorindid: data.allorindi
            },
            {
                onSuccess: (res: any) => {
                    const details = res.data?.data?.getstudentdetailslist;
                    if (details && details.length > 0) {
                        setReportData(details);
                        setLogo(res.data?.data?.logo || '');
                        setIsFormOpen(false); // Collapse form after success
                        toast.success('Report generated successfully!');
                    } else {
                        toast.error('No record found for selected criteria');
                    }
                },
                onError: () => {
                    toast.error('Failed to generate report. Please try again.');
                }
            }
        );
    };

    const handleReset = () => {
        setReportData(null);
        setIsFormOpen(true);
    };

    return (
        <div className='fade-in flex min-h-screen animate-in flex-col gap-8 bg-slate-50 p-6 duration-700 lg:p-10'>
            {/* Header Section */}
            <div className='flex flex-col justify-between gap-6 transition-all md:flex-row md:items-center'>
                <div className='space-y-1'>
                    <h1 className='font-extrabold text-4xl text-slate-900 tracking-tight drop-shadow-sm'>SMS College Certificates</h1>
                    <p className='font-medium text-slate-500 italic'>
                        Generate and print Study or Conduct certificates for college students.
                    </p>
                </div>
                {reportData && (
                    <Button
                        onClick={handlePrint}
                        className='flex h-14 items-center gap-3 rounded-2xl bg-slate-900 px-8 font-bold text-white shadow-slate-200 shadow-xl transition-all hover:scale-105 hover:bg-black active:scale-95'>
                        <Printer className='h-5 w-5' />
                        Print Certificate
                    </Button>
                )}
            </div>

            {/* Filter Section */}
            <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className='w-full'>
                <Card className='overflow-hidden rounded-[2.5rem] border-none bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-md'>
                    <CardHeader className='flex flex-row items-center justify-between border-slate-100 border-b bg-gradient-to-r from-slate-50 to-white/0 py-6'>
                        <div className='space-y-1'>
                            <CardTitle className='font-black text-slate-800 text-xl tracking-tight'>Search Criteria</CardTitle>
                            <CardDescription className='font-semibold text-slate-400 text-xs uppercase tracking-widest'>
                                Filtering & Generation
                            </CardDescription>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='transform rounded-full transition-all hover:bg-slate-100 active:scale-90'>
                                <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${isFormOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className='p-8 lg:p-12'>
                            <FilterForm onSubmit={onFilterSubmit} onReset={handleReset} />
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Preview Section */}
            {reportData && (
                <div className='slide-in-from-bottom-10 animate-in duration-1000'>
                    <div className='mb-6 flex items-center gap-4 px-4'>
                        <div className='h-8 w-2 rounded-full bg-blue-600' />
                        <h2 className='font-black text-slate-800 text-xl uppercase tracking-widest'>Live Preview</h2>
                        <div className='rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-bold text-[10px] text-slate-400'>
                            CLICK TEXT TO EDIT BEFORE PRINTING
                        </div>
                    </div>
                    <PrintComponent ref={printRef} data={reportData} certType={certType} logo={logo} extraFields={extraFields} />
                </div>
            )}
        </div>
    );
}
