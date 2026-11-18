'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/extension/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { get_candiadate_report } from '@/server/hrms/recruitment/reports/interviewReport';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CandidateReportForm from './_components/report-form';

interface Candidate {
    id: number;
    hrcD_FirstName: string;
    hrcD_MiddleName?: string;
    hrcD_LastName: string;
    hrcD_EmailId: string;
    hrcD_MobileNo: string;
    hrcD_ExpFrom?: string;
    hrcD_CurrentCompany?: string;
    hrcD_RefCode?: string;
    hrcD_LastCTC?: string;
    hrcD_ExpectedCTC?: string;
    hrcD_Resume?: string;
}
export default function CandidateReportPage() {
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async (_filters: { institution: string; candidateId: string }) => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await getCandidateReport(filters);
            // setSelectedCandidate(response.data);
            // Mock data for now
            console.log(_filters, 'filters');

            const payload = {
                HRCD_Id: Number(_filters.candidateId)
            };
            const response = await get_candiadate_report(payload);
            if (response?.data?.candidateDetails?.length > 0 && response?.success) {
                setSelectedCandidate(response?.data?.candidateDetails[0]);
                toast.success(response.message || 'Report generated successfully');
            } else {
                setSelectedCandidate(null);
            }
        } catch (_error: any) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedCandidate(null);
    };

    return (
        <FormProvider<any>>
            <CandidateReportPageContent
                selectedCandidate={selectedCandidate}
                isLoading={isLoading}
                onGenerateReport={handleGenerateReport}
                onClear={handleClear}
            />
        </FormProvider>
    );
}
function CandidateReportPageContent({
    selectedCandidate,
    isLoading,
    onGenerateReport,
    onClear
}: {
    selectedCandidate: Candidate | null;
    isLoading: boolean;
    onGenerateReport: (filters: { institution: string; candidateId: string }) => void;
    onClear: () => void;
}) {
    const handlePrint = () => {
        window.print();
    };
    return (
        <>
            <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #printable-content, #printable-content * {
                    visibility: visible;
                }
                #printable-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        `}</style>
            <div className='min-h-screen'>
                <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                    {/* Report Form - Above Details */}
                    <CollapsibleSection
                        title='Candidate Report Generation'
                        description='Select institution and candidate to generate report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg duration-300'>
                        <CandidateReportForm onGenerateReport={onGenerateReport} onClear={onClear} isLoading={isLoading} />
                    </CollapsibleSection>
                    {/* Candidate Details View */}
                    {selectedCandidate && (
                        <CollapsibleSection
                            title='Candidate Details View'
                            description='View detailed candidate information'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                            rightElement={
                                <Button type='button' variant='outline' onClick={handlePrint} className='bg-destructive text-white'>
                                    <Printer className='mr-2 h-4 w-4 ' />
                                    PRINT
                                </Button>
                            }>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-3' id='printable-content'>
                                {/* Left: Candidate Profile */}
                                <div className='space-y-4 md:col-span-2'>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className='text-sm'>CANDIDATE PROFILE</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='grid grid-cols-2 gap-4 text-sm'>
                                                <div className='font-medium'>Candidate Name:</div>
                                                <div>
                                                    {`${selectedCandidate.hrcD_FirstName} ${selectedCandidate.hrcD_MiddleName || ''} ${selectedCandidate.hrcD_LastName}`.trim()}
                                                </div>
                                                <div className='font-medium'>Mobile No:</div>
                                                <div>{selectedCandidate.hrcD_MobileNo}</div>
                                                <div className='font-medium'>Email Id:</div>
                                                <div>{selectedCandidate.hrcD_EmailId}</div>
                                                <div className='font-medium'>Experience (Year):</div>
                                                <div>{selectedCandidate.hrcD_ExpFrom || '-'}</div>
                                                <div className='font-medium'>Current Company:</div>
                                                <div>{selectedCandidate.hrcD_CurrentCompany || '-'}</div>
                                                <div className='font-medium'>Reference Code:</div>
                                                <div>{selectedCandidate.hrcD_RefCode || '-'}</div>
                                                <div className='font-medium'>Last CTC:</div>
                                                <div>{selectedCandidate.hrcD_LastCTC || '-'}</div>
                                                <div className='font-medium'>Expected CTC:</div>
                                                <div>{selectedCandidate.hrcD_ExpectedCTC || '-'}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Right: Resume Display */}
                                <div className='flex flex-col items-center justify-start gap-3'>
                                    <div className='flex h-48 w-full items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-gray-50'>
                                        <div className='text-center'>
                                            <div className='mx-auto mb-2 h-12 w-12 text-gray-400'>
                                                <svg
                                                    fill='none'
                                                    stroke='currentColor'
                                                    strokeWidth='1.5'
                                                    viewBox='0 0 24 24'
                                                    xmlns='http://www.w3.org/2000/svg'>
                                                    <path
                                                        d='M2.25 15.75v-1.5A2.25 2.25 0 014.5 12h15a2.25 2.25 0 012.25 2.25v1.5M2.25 15.75h19.5M2.25 15.75l-1-5.25A2.25 2.25 0 015.25 8h13.5A2.25 2.25 0 0120.75 10.5l-1 5.25'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                            <p className='text-gray-500 text-xs'>Resume Preview</p>
                                        </div>
                                    </div>
                                    {selectedCandidate.hrcD_Resume ? (
                                        <a
                                            className='font-medium text-primary text-sm hover:underline'
                                            href={selectedCandidate.hrcD_Resume}
                                            target='_blank'
                                            rel='noreferrer'
                                            download>
                                            Download Resume
                                        </a>
                                    ) : (
                                        <p className='text-gray-500 text-xs'>No Resume Available</p>
                                    )}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </>
    );
}
