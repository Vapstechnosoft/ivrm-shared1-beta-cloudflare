'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FileText, Loader2, Printer, X } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface NdaStudentTcPdfDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfData: any[]; // Legacy uses an array 'studenttcpdf'
    isLoading?: boolean;
}

export function NdaStudentTcPdfDialog({ open, onOpenChange, pdfData, isLoading }: NdaStudentTcPdfDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `TC_Report_${pdfData?.[0]?.studentname || 'Student'}`
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='zoom-in-95 flex h-[90vh] max-w-5xl animate-in flex-col overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl duration-500'>
                <DialogHeader className='relative bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white'>
                    <div className='relative z-10 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md'>
                                <FileText className='h-6 w-6' />
                            </div>
                            <div>
                                <DialogTitle className='mb-1 font-black text-2xl uppercase leading-none tracking-tight'>
                                    Transfer Certificate Preview
                                </DialogTitle>
                                <p className='font-bold text-[10px] text-indigo-100/70 uppercase leading-none tracking-widest'>
                                    Official Document System | NDA Format
                                </p>
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <Button
                                onClick={() => handlePrint()}
                                disabled={isLoading || !pdfData?.length}
                                className='h-10 rounded-full bg-white px-6 font-black text-indigo-600 shadow-lg transition-all hover:bg-white/90 hover:shadow-white/20'>
                                <Printer className='mr-2 h-4 w-4' /> PRINT PDF
                            </Button>
                            <DialogClose asChild>
                                <Button variant='ghost' size='icon' className='h-10 w-10 rounded-full text-white hover:bg-white/20'>
                                    <X className='h-6 w-6' />
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogHeader>

                <div className='scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent flex-1 overflow-y-auto bg-slate-100/50 p-6 md:p-12'>
                    {isLoading ? (
                        <div className='flex h-full flex-col items-center justify-center space-y-4 opacity-50'>
                            <Loader2 className='h-16 w-16 animate-spin text-indigo-600' />
                            <p className='font-black text-slate-400 text-sm uppercase tracking-widest'>Synchronizing Records...</p>
                        </div>
                    ) : pdfData?.length > 0 ? (
                        <div className='flex justify-center'>
                            <div className='overflow-hidden rounded-sm bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 transition-all'>
                                <div
                                    ref={printRef}
                                    className='print-area bg-white p-[25.4mm] font-serif text-slate-900 leading-relaxed'
                                    style={{ width: '210mm', minHeight: '297mm' }}>
                                    <style jsx global>{`
                                        @media print {
                                            .print-area {
                                                padding: 0 !important;
                                                margin: 0 !important;
                                            }
                                            @page {
                                                size: A4;
                                                margin: 0;
                                            }
                                        }
                                    `}</style>

                                    {pdfData.map((report, idx) => (
                                        <div key={idx} className={idx > 0 ? 'page-break-before-always' : ''}>
                                            <div className='mt-32'>
                                                <h1 className='mb-12 text-center font-black text-3xl uppercase tracking-widest'>
                                                    <span className='border-black border-b-2 pb-1'>Transfer Certificate</span>
                                                </h1>

                                                <div className='mb-2 flex items-center justify-between border-black/10 border-b px-6 pb-4'>
                                                    <p className='font-bold text-xl'>
                                                        Admission Number: <span className='font-black text-2xl'>{report.amsT_AdmNo}</span>
                                                    </p>
                                                    <p className='font-bold text-xl'>
                                                        Sl. No: <span className='font-black text-2xl'>{report.astC_TCNO || '—'}</span>
                                                    </p>
                                                </div>

                                                <div className='space-y-6 pt-6 text-[18px]'>
                                                    <GridRow index={1} label='Name of Pupil' value={report.studentname} />
                                                    <GridRow index={2} label="Father's Name" value={report.amsT_FatherName} />
                                                    <GridRow index={3} label="Mother's Name" value={report.amsT_MotherName} />
                                                    <GridRow
                                                        index={4}
                                                        label='Religion/Caste'
                                                        value={`${report.religion} / ${report.caste}`}
                                                    />
                                                    <GridRow index={5} label='Nationality' value={report.nationality} />
                                                    <GridRow
                                                        index={6}
                                                        label='Date of Birth'
                                                        value={report.amsT_DOB ? format(new Date(report.amsT_DOB), 'dd-MMM-yyyy') : ''}
                                                    />
                                                    <GridRow index={7} label='School Last Attended' value={report.last_school || 'N/A'} />
                                                    <GridRow
                                                        index={8}
                                                        label='Date Of Admission'
                                                        value={report.amsT_Date ? format(new Date(report.amsT_Date), 'dd-MMM-yyyy') : ''}
                                                    />
                                                    <GridRow index={9} label='Conduct' value={report.conduct || 'Good'} />
                                                    <GridRow
                                                        index={10}
                                                        label='Date Of Leaving'
                                                        value={report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : ''}
                                                    />
                                                    <GridRow
                                                        index={11}
                                                        label='Studying In'
                                                        value={`${report.Last_Class_Studied} ${report.asmC_SectionName}`}
                                                    />
                                                    {report.astC_Remarks && (
                                                        <GridRow
                                                            index={12}
                                                            label='Remarks'
                                                            value={report.astC_Remarks}
                                                            className='italic'
                                                        />
                                                    )}
                                                </div>

                                                <div className='mt-16 space-y-8 border-black/5 border-y px-6 py-8'>
                                                    <div className='flex items-center justify-between text-xl'>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='font-bold opacity-60'>PEN No. :</span>
                                                            <span className='border-black border-b px-4 pb-1 font-black'>
                                                                {report.AMST_PENNo || '—'}
                                                            </span>
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='font-bold opacity-60'>SATS No. :</span>
                                                            <span className='border-black border-b px-4 pb-1 font-black text-2xl tracking-widest'>
                                                                {report.govtno || '—'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className='mt-12 pt-6 text-center font-serif text-xl italic opacity-80'>
                                                        "Certified that the above-mentioned information is in accordance with the school
                                                        register."
                                                    </p>

                                                    <div className='mt-20 flex items-end justify-between px-4 pt-16'>
                                                        <div className='text-xl'>
                                                            <p className='mb-1 font-bold text-[11px] uppercase tracking-widest opacity-60'>
                                                                Generation Date
                                                            </p>
                                                            <p className='border-black/20 border-b-2 pb-1 font-black text-2xl'>
                                                                {format(new Date(), 'dd-MMM-yyyy')}
                                                            </p>
                                                        </div>
                                                        <div className='text-center'>
                                                            <div className='mb-2 w-48 border-black border-b-2' />
                                                            <p className='font-black text-2xl tracking-widest'>PRINCIPAL</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex h-full flex-col items-center justify-center space-y-4 opacity-50'>
                            <FileText className='h-16 w-16' />
                            <p className='text-center font-black text-slate-400 text-sm uppercase tracking-widest'>
                                Data mismatch detected.
                                <br />
                                Could not compile official certificate.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function GridRow({ index, label, value, className }: { index: number; label: string; value: string; className?: string }) {
    return (
        <div className='grid grid-cols-[36px_22px_220px_1fr] items-baseline'>
            <div />
            <div className='font-bold text-slate-400'>{index}</div>
            <div className='font-medium text-slate-600 italic'>{label}</div>
            <div className={cn('border-black/40 border-b border-dashed pb-0.5 font-black', className)}>
                {' '}
                :&nbsp;&nbsp;&nbsp;&nbsp;{value || '—'}
            </div>
        </div>
    );
}
