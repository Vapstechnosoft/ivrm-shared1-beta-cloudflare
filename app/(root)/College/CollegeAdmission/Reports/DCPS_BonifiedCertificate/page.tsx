'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDCPSBonafideReport } from '@/hooks/college/useDCPSBonafideCertificate';
import type { DCPSBonafideCertificateFormData } from '@/schemas/college/dcps-bonafide-certificate.schema';
import { ChevronDown, FileCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { CertificatePrint } from './_components/certificate-print';
import { FilterForm } from './_components/filter-form';

export default function DCPSBonafideCertificatePage() {
    const reportMutation = useDCPSBonafideReport();

    const [isFormOpen, setIsFormOpen] = useState(true);
    const [studentData, setStudentData] = useState<any>(null);
    const [logo, setLogo] = useState<string>('');
    const [formData, setFormData] = useState<DCPSBonafideCertificateFormData | null>(null);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `DCPS_Bonafide_Certificate_${studentData?.admno || Date.now()}`,
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 0;
            }
            @media print {
                html, body {
                    visibility: visible !important;
                    background: #fff !important;
                    color: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .printable-content,
                .printable-content *,
                .print-container,
                .print-container *,
                .dcps-certificate-wrapper,
                .dcps-certificate-wrapper * {
                    visibility: visible !important;
                }
                .no-print {
                    display: none !important;
                }
            }
        `
    });

    const handleFilterSubmit = (values: DCPSBonafideCertificateFormData) => {
        setFormData(values);

        const payload = {
            ASMAY_Id: values.asmaY_Id,
            AMCST_SOL: values.optradio,
            AMCO_Id: values.allorindi === 'A' ? 0 : values.amcO_Id || 0,
            AMB_Id: values.allorindi === 'A' ? 0 : values.amB_Id || 0,
            AMSE_Id: values.allorindi === 'A' ? 0 : values.amsE_Id || 0,
            ACMS_Id: values.allorindi === 'A' ? 0 : values.acmS_Id || 0,
            AMCST_Id: values.amcsT_Id,
            allorindid: values.allorindi
        };

        reportMutation.mutate(payload, {
            onSuccess: (res: any) => {
                const data = res?.data?.data || res?.data || res;
                const detailsList =
                    data?.getstudentlist || data?.getstudentdetailslist || res?.getstudentlist || res?.getstudentdetailslist || [];

                if (Array.isArray(detailsList) && detailsList.length > 0) {
                    setStudentData(detailsList[0]);
                    setLogo(data?.logo || res?.logo || '');
                    setIsFormOpen(true); // Keep form open always so user can access Print and parameters
                    toast.success('Certificate generated successfully!');
                } else {
                    toast.error('Record not found for selected criteria');
                    setStudentData(null);
                }
            },
            onError: (err: any) => {
                console.error('Report error:', err);
                toast.error('Failed to generate report. Please try again.');
                setStudentData(null);
            }
        });
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className='fade-in flex min-h-screen animate-in flex-col gap-6 bg-slate-50/60 p-4 duration-500 sm:p-6 lg:p-8'>
            {/* Top Page Header */}
            <div className='flex flex-col gap-4 border-slate-200/80 border-b pb-5'>
                <div className='space-y-1'>
                    <h1 className='font-extrabold text-2xl text-slate-900 tracking-tight sm:text-3xl'>Study Certificate Report</h1>
                    <p className='text-slate-500 text-sm'>Generate and print DCPS Bonafide certificates for college students.</p>
                </div>
            </div>

            {/* Filter Section Card */}
            <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className='w-full'>
                <Card className='rounded-2xl border border-slate-200/90 bg-white/95 shadow-md backdrop-blur'>
                    <CardHeader className='flex flex-row items-center justify-between border-slate-100 border-b px-6 py-4'>
                        <div className='space-y-0.5'>
                            <CardTitle className='flex items-center gap-2 font-bold text-lg text-slate-800'>
                                <FileCheck className='h-5 w-5 text-primary' />
                                Study Certificate Report
                            </CardTitle>
                            <CardDescription className='text-slate-500 text-xs'>
                                Select parameters to search student and generate bonafide certificate
                            </CardDescription>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-9 w-9 rounded-full p-0 hover:bg-slate-100'>
                                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className='p-6 sm:p-8'>
                            <FilterForm
                                onSubmit={handleFilterSubmit}
                                onReset={handleReset}
                                onPrint={() => handlePrint()}
                                isReportLoaded={!!studentData}
                                isGenerating={reportMutation.isPending}
                            />
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Certificate Preview Section */}
            {studentData && formData && (
                <div className='slide-in-from-bottom-6 animate-in space-y-4 duration-500'>
                    {/* Certificate Card */}
                    <Card className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/50 p-4 shadow-inner sm:p-8'>
                        <CertificatePrint
                            ref={printRef}
                            student={studentData}
                            studentStatus={formData.optradio}
                            logo={logo}
                            date={formData.date}
                            hallTicketNo={formData.exmname || undefined}
                            purpose={formData.purpose || undefined}
                        />
                    </Card>
                </div>
            )}
        </div>
    );
}
