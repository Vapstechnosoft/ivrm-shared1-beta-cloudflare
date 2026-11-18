'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Printer, X } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { NdaTcPrint } from '../../../reports/nda-transfer-certificate/_components/NdaTcPrint';

interface NdaStudentTcPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    isLoading?: boolean;
}

export function NdaStudentTcPrintModal({ isOpen, onClose, data, isLoading }: NdaStudentTcPrintModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `NDA_TC_${data?.lblstdname || 'Student'}`
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='flex h-[90vh] max-w-[90vw] flex-col overflow-hidden rounded-[2rem] border-none bg-slate-50 p-4 shadow-2xl md:max-w-[1000px] md:p-8'>
                <DialogHeader className='mb-6 flex flex-row items-center justify-between px-4'>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-indigo-100 shadow-lg'>
                            <Printer className='h-6 w-6' />
                        </div>
                        <div>
                            <DialogTitle className='font-black text-2xl text-slate-800 tracking-tight'>
                                TRANSFER CERTIFICATE PREVIEW
                            </DialogTitle>
                            <p className='font-medium text-slate-500 text-sm'>Official documentation for {data?.lblstdname}</p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <Button
                            onClick={() => handlePrint()}
                            disabled={isLoading || !data}
                            className='h-12 rounded-full bg-indigo-600 px-8 font-bold text-white shadow-indigo-100 shadow-xl transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                            <Printer className='mr-2 h-5 w-5' /> PRINT TC
                        </Button>
                        <Button
                            variant='outline'
                            onClick={onClose}
                            className='h-12 w-12 rounded-full border-slate-200 p-0 text-slate-500 shadow-sm hover:bg-white'>
                            <X className='h-5 w-5' />
                        </Button>
                    </div>
                </DialogHeader>

                <div className='custom-scrollbar flex flex-1 justify-center overflow-auto rounded-[2rem] border-2 border-slate-300 border-dashed bg-slate-200/50 p-8 shadow-inner'>
                    {isLoading ? (
                        <div className='flex h-full flex-col items-center justify-center gap-4 text-slate-400'>
                            <Loader2 className='h-16 w-16 animate-spin text-indigo-500' />
                            <p className='animate-pulse font-bold text-xs uppercase tracking-[0.2em]'>Preparing Document...</p>
                        </div>
                    ) : data ? (
                        <div className='origin-top bg-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-500'>
                            <NdaTcPrint ref={printRef} data={data} issuedDate={new Date()} />
                        </div>
                    ) : (
                        <div className='flex h-full items-center justify-center font-medium text-slate-400 italic'>
                            No data available for preview.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
