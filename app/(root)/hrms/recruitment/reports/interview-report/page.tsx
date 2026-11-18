'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { generateInterviewReport } from '@/server/hrms/recruitment/reports/interviewReport';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { interviewReportColumns } from './_components/columns';
import { printInterviewReport } from './_components/interview-report-print';
import InterviewReportForm from './_components/report-form';

export default function InterviewReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleGenerateReport = async (data: any) => {
        setIsLoading(true);
        setError(null);
        setReportData([]);
        setHasSearched(true);
        try {
            const payload = {
                type: data.status || 'All',
                round: data.interviewRound || 'All',
                hrcmG_Id: 1,
                fromdate: new Date(data.fromDate).toISOString(),
                todate: new Date(data.toDate).toISOString()
            };

            const response = await generateInterviewReport(payload as any);
            console.log('Report response', response);
            if (response.success && response.data?.length > 0) {
                toast.success('Report generated successfully');
                const rawData = response.data || [];
                const mappedData = rawData.map((item: any, index: number) => ({
                    id: item.hrcisC_Id || index,
                    candidateName: item.hrcD_FullName || '',
                    interviewRound: item.hrcisC_InterviewRounds || '',
                    interviewerName: [item.hrmE_EmployeeFirstName, item.hrmE_EmployeeMiddleName, item.hrmE_EmployeeLastName]
                        .filter(Boolean)
                        .join(' '),
                    interviewDate: item.hrcisC_InterviewDateTime || '',
                    interviewVenue: item.hrcisC_InterviewVenue || '',
                    interviewFeedback: item.hrciS_InterviewFeedBack || '',
                    candidateStatus: item.hrciS_CandidateStatus || '-'
                }));
                setReportData(mappedData);
            } else if (response.data?.length === 0) {
                toast.warning('No data found for the selected filters');
            } else {
                setError(response.message || 'Failed to fetch report data');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };
    const response = { data: reportData, totalItems: reportData.length, isLoading, error, hasSearched };
    return (
        <FormProvider<any>>
            <InterviewReportPageContent response={response} onGenerateReport={handleGenerateReport} />
        </FormProvider>
    );
}
function InterviewReportPageContent({
    response,
    onGenerateReport
}: {
    response: any;
    onGenerateReport: (filters: any) => void;
}) {
    const tableProps = useDataTableProps(response);

    const handleExportToExcel = () => {
        if (!response.data || response.data.length === 0) {
            toast.error('No data to export');
            return;
        }
        try {
            const ws = XLSX.utils.json_to_sheet(response.data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Interview Reports');
            XLSX.writeFile(wb, 'Interview_Report.xlsx');
            toast.success('Exported to Excel successfully');
        } catch (error) {
            toast.error('Failed to export to Excel');
        }
    };
    const handlePrint = () => {
        if (!response.data || response.data.length === 0) {
            toast.error('No data to print');
            return;
        }
        printInterviewReport(response.data);
    };
    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                {/* Report Form - Above Table */}
                <CollapsibleSection
                    title='Interview Report'
                    description='Filter and generate interview reports'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='shadow-lg duration-300'>
                    <InterviewReportForm onGenerateReport={onGenerateReport} />
                </CollapsibleSection>
                {/* Data Table Section */}
                {response.hasSearched && response.data?.length > 0 && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        rightElement={
                            <div className='flex gap-2'>
                                <Button variant='outline' size='sm' onClick={handleExportToExcel}>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                                    Excel
                                </Button>
                                <Button variant='outline' size='sm' onClick={handlePrint}>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                            </div>
                        }>
                        <GenericDataTable<any>
                            {...tableProps}
                            columns={interviewReportColumns}
                            isLoading={response.isLoading}
                            error={response.error}
                            showViewOptions={false}
                            loadingMessage='Loading interview report...'
                            noDataTitle='No Interview Reports Found'
                            noDataDescription='Select filters and click REPORT to generate interview data'
                            errorTitle='Error Loading Interview Reports'
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
