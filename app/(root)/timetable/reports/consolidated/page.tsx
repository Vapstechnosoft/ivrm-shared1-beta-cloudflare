'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getConsolidatedReport, getConsolidatedReportDetails } from '@/server/timetable/reports/consolidated';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import ConsolidatedForm from './_components/consolidated-form';
import ConsolidatedReportGrid from './_components/consolidated-report-grid';

export default function ConsolidatedReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [fullReportResponse, setFullReportResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<string>('');
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await getConsolidatedReportDetails({});
                console.log('Consolidated Report Details Response:', response);
                if (response?.success && response.data) {
                    console.log('Consolidated Report Details Data Keys:', Object.keys(response.data));
                    setInitialData(response.data);
                }
            } catch (error) {
                console.error('Error fetching consolidated report details:', error);
            }
        };
        fetchDetails();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Consolidated_Report_${reportType || 'Report'}`,
        pageStyle: `
            @page {
                size: landscape;
                margin: 8mm;
            }
            @media print {
                html, body {
                    visibility: visible !important;
                    background: #fff !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .printable-content,
                .printable-content * {
                    visibility: visible !important;
                }
                .no-print {
                    display: none !important;
                }
                .overflow-x-auto {
                    overflow: visible !important;
                }
                .sticky {
                    position: static !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    page-break-inside: auto;
                }
                thead {
                    display: table-header-group !important;
                }
                tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                }
                th, td {
                    border: 1px solid #666 !important;
                    padding: 4px 6px !important;
                    font-size: 8pt !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                th {
                    background-color: #6b21a8 !important;
                    color: #fff !important;
                }
            }
        `
    });

    const handleFormSubmit = async (payload: any) => {
        console.log('Report Payload:', payload);

        if (payload.CLEAR) {
            setReportData([]);
            setFullReportResponse(null);
            return;
        }

        setLoading(true);
        setReportType(payload.TYPE);

        try {
            const response: any = await getConsolidatedReport(payload);

            console.log('Consolidated Report Response:', response);

            if (response?.success) {
                const actualData = response.data || response;

                setFullReportResponse(actualData);

                const data =
                    actualData.finaltable || actualData.griddata || actualData.reportdata || (Array.isArray(actualData) ? actualData : []);

                setReportData(data);

                if (!data || data.length === 0) {
                    toast.info(actualData?.message);
                }
            } else {
                toast.error(response?.message);
            }
        } catch (error: any) {
            console.error(error?.message);
            toast.error(error?.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Consolidated Report' defaultOpen={true}>
                <ConsolidatedForm initialData={initialData} onSubmit={handleFormSubmit} />
            </CollapsibleSection>

            {loading && (
                <div className='flex items-center justify-center p-12'>
                    <RefreshCw className='h-8 w-8 animate-spin text-purple-600' />
                    <span className='ml-3 font-medium text-lg text-purple-800'>Processing Report Data...</span>
                </div>
            )}

            {reportData.length > 0 && !loading && (
                <CollapsibleSection title={`${reportType.replace('_', ' ')} Consolidated Report`} defaultOpen={true}>
                    <div className='printable-content p-2 print:p-4' ref={componentRef}>
                        <ConsolidatedReportGrid
                            reportData={reportData}
                            fullResponse={fullReportResponse}
                            onPrint={handlePrint}
                            reportType={reportType}
                            initialData={initialData}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
