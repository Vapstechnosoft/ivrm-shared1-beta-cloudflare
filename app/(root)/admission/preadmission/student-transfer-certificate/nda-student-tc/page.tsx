'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useNdaStudentTcApprovalStatus,
    useNdaStudentTcInitialData,
    useNdaStudentTcPdf,
    useNdaStudentTcSave,
    useNdaStudentTcSearch
} from '@/hooks/admission/preadmission/useNdaStudentTc';
import { CheckCircle2, ClipboardList, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { FilterForm } from './_components/FilterForm';
import { NdaStudentTcApplicationGrid } from './_components/NdaStudentTcApplicationGrid';
import { NdaStudentTcDetailsTable } from './_components/NdaStudentTcDetailsTable';
import { NdaStudentTcPdfDialog } from './_components/NdaStudentTcPdfDialog';

export default function NdaStudentTcPage() {
    const { data: initialData, refetch: refetchInitial } = useNdaStudentTcInitialData();
    const searchMutation = useNdaStudentTcSearch();
    const saveMutation = useNdaStudentTcSave();
    const pdfMutation = useNdaStudentTcPdf();
    const statusMutation = useNdaStudentTcApprovalStatus();

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchPayload, setSearchPayload] = useState<any>(null);
    const [pdfData, setPdfData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const handleSearch = async (formData: any) => {
        try {
            toast.loading('Searching students...', { id: 'search-tc' });
            const payload = {
                ASMAY_Id: Number(formData.academic_year),
                ASMCL_Id: Number(formData.classname),
                ASMS_Id: Number(formData.sectionname)
            };
            setSearchPayload(payload);
            const response = (await searchMutation.mutateAsync(payload)) as any;
            const data = response?.data || response;
            const studentList = Array.isArray(data) ? data : data.ndastudentlistsearch || [];
            if (studentList.length > 0) {
                setSearchResults(studentList);
                toast.success('Students found', { id: 'search-tc' });
            } else {
                setSearchResults([]);
                toast.error('No records found for the selected criteria', { id: 'search-tc' });
            }
        } catch (error) {
            toast.error('Search failed', { id: 'search-tc' });
        }
    };

    const handleSave = async (selectedStudents: any[]) => {
        const confirm = await Swal.fire({
            title: 'Submit TC Requests?',
            text: `You are applying for ${selectedStudents.length} student(s).`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Yes, Request',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        try {
            toast.loading('Submitting requests...', { id: 'save-tc' });

            // Map settings to lowercase 'imn_' prefix as requested
            const rawSettings = (initialData as any)?.data?.admTransNumSetting?.[0] || (initialData as any)?.admTransNumSetting?.[0] || {};
            const transformedSettings: any = {};
            for (const key in rawSettings) {
                // Change imN_... to imn_...
                const newKey = key.startsWith('imN_') ? key.replace('imN_', 'imn_') : key;
                transformedSettings[newKey] = rawSettings[key];
            }
            // Ensure asmay_Id is present in settings (capital I)
            if (searchPayload?.ASMAY_Id) {
                transformedSettings.asmay_Id = searchPayload.ASMAY_Id;
            }

            // Map student data to requested casing (capital I in _Id)
            const mappedStudents = selectedStudents.map((s) => ({
                amst_Id: s.AMST_Id,
                asmay_Id: searchPayload?.ASMAY_Id,
                asmcl_Id: searchPayload?.ASMCL_Id,
                asms_Id: searchPayload?.ASMS_Id,
                astc_Remarks: s.ASTC_Remarks
            }));

            const payload = {
                studentTCdata: mappedStudents,
                transnumconfigsettings: transformedSettings,
                tcflagexists: ''
            };

            const response = (await saveMutation.mutateAsync(payload)) as any;
            const data = response?.data || response;
            if (data.returnval === true) {
                toast.success('Requests saved successfully', { id: 'save-tc' });
                setSearchResults([]);
                refetchInitial(); // Update the approved list
            } else {
                toast.error('Failed to save requests', { id: 'save-tc' });
            }
        } catch (error) {
            toast.error('Submission failed', { id: 'search-tc' });
        }
    };

    const handleViewPdf = async (student: any) => {
        setIsPdfOpen(true);
        setPdfData([]);
        try {
            const response = (await pdfMutation.mutateAsync({ AMST_Id: student.AMST_Id })) as any;
            const data = response?.data || response;
            const pdfList = Array.isArray(data) ? data : data.studenttcpdf || [];
            setPdfData(pdfList);
        } catch (error) {
            toast.error('Failed to load certificate');
            setIsPdfOpen(false);
        }
    };

    const handleViewStatus = async (student: any) => {
        setIsStatusOpen(true);
        setStatusData([]);
        try {
            const response = (await statusMutation.mutateAsync({ AMST_Id: student.AMST_Id, ASMAY_Id: searchPayload?.ASMAY_Id })) as any;
            const data = response?.data || response;
            const statusList = Array.isArray(data) ? data : data.studentapprovedpendingdetails || [];
            setStatusData(statusList);
        } catch (error) {
            toast.error('Failed to load status');
            setIsStatusOpen(false);
        }
    };

    return (
        <div className='fade-in container mx-auto animate-in space-y-12 p-6 duration-700'>
            {/* Header Section */}
            <div className='group relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-10 text-white shadow-2xl'>
                <div className='relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row'>
                    <div className='max-w-xl'>
                        <div className='mb-4 flex items-center gap-3'>
                            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-black text-xs'>TC</span>
                            <span className='font-black text-xs uppercase tracking-[0.3em] opacity-60'>Preadmission Services</span>
                        </div>
                        <h1 className='mb-4 font-black text-5xl uppercase italic leading-tight tracking-tight'>Student TC Apply</h1>
                        <p className='inline-block rounded-2xl border border-white/5 bg-black/5 p-4 font-bold text-indigo-100 opacity-80 backdrop-blur-sm'>
                            Official portal for Transfer Certificate applications and records management.
                        </p>
                    </div>
                </div>
                <div className='pointer-events-none absolute top-0 right-0 p-16 opacity-10 transition-all duration-3000 group-hover:rotate-12 group-hover:scale-125'>
                    <FileText className='h-72 w-72' />
                </div>
            </div>

            {/* Filter Section */}
            <CollapsibleSection
                title='Academic Search Filters'
                description='Target specific classes to find eligible students.'
                defaultOpen={true}
                className='overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl ring-1 ring-slate-100'>
                <div className='bg-slate-50/50 p-4 backdrop-blur-md'>
                    <FilterForm onSearch={handleSearch} onReset={() => setSearchResults([])} />
                </div>
            </CollapsibleSection>

            {/* Application Grid */}
            {searchResults.length > 0 && (
                <div className='slide-in-from-bottom-20 animate-in space-y-6 duration-1000'>
                    <div className='flex items-center gap-4 rounded-[2rem] border border-indigo-100 bg-indigo-50/50 px-6 py-4 shadow-sm backdrop-blur-md'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-indigo-100 shadow-lg'>
                            <ClipboardList className='h-5 w-5' />
                        </div>
                        <div>
                            <h3 className='font-black text-indigo-950 text-xl uppercase italic tracking-tighter'>New Application Batch</h3>
                            <p className='font-bold text-indigo-600 text-sm opacity-60'>
                                Ready to process {searchResults.length} student records.
                            </p>
                        </div>
                    </div>
                    <NdaStudentTcApplicationGrid students={searchResults} onSave={handleSave} isSaving={saveMutation.isPending} />
                </div>
            )}

            {/* Approved Details Table */}
            <Card className='group relative overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl ring-1 ring-slate-100'>
                <div className='absolute top-0 left-0 h-full w-1 bg-indigo-600' />
                <CardContent className='p-0'>
                    <NdaStudentTcDetailsTable
                        data={(initialData as any)?.data?.studenttcapprovedlist || (initialData as any)?.studenttcapprovedlist || []}
                        onViewPdf={handleViewPdf}
                        onViewStatus={handleViewStatus}
                    />
                </CardContent>
            </Card>

            {/* PDF Modal */}
            <NdaStudentTcPdfDialog open={isPdfOpen} onOpenChange={setIsPdfOpen} pdfData={pdfData} isLoading={pdfMutation.isPending} />

            {/* Approval Status Modal */}
            <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                <DialogContent className='zoom-in-95 max-w-2xl animate-in overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl'>
                    <DialogHeader className='relative bg-slate-900 p-8 text-white'>
                        <DialogTitle className='font-black text-2xl uppercase italic tracking-tight'>Staff Approval Status</DialogTitle>
                        <DialogClose asChild>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute top-8 right-8 rounded-full text-white/50 hover:text-white'>
                                <X className='h-6 w-6' />
                            </Button>
                        </DialogClose>
                    </DialogHeader>
                    <div className='bg-slate-50 p-8'>
                        {statusMutation.isPending ? (
                            <div className='flex flex-col items-center justify-center space-y-4 p-12'>
                                <Loader2 className='h-12 w-12 animate-spin text-indigo-600' />
                                <p className='font-bold text-slate-400 text-xs uppercase tracking-widest'>Querying Workflow Sync...</p>
                            </div>
                        ) : statusData.length > 0 ? (
                            <div className='space-y-4'>
                                {statusData.map((s, i) => (
                                    <div
                                        key={i}
                                        className='group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:bg-slate-50'>
                                        <div className='flex items-center gap-4'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'>
                                                {i + 1}
                                            </div>
                                            <span className='font-bold text-slate-700'>{s.empname}</span>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <span
                                                className={`rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest ${
                                                    s.ASCAP_Status === 'Approved'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {s.ASCAP_Status}
                                            </span>
                                            {s.ASCAP_Status === 'Approved' && <CheckCircle2 className='h-5 w-5 text-emerald-500' />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='p-12 text-center opacity-30'>
                                <FileText className='mx-auto mb-2 h-12 w-12' />
                                <p className='font-bold'>No approval workflow detected for this student.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M18 6 6 18' />
            <path d='m6 6 12 12' />
        </svg>
    );
}
