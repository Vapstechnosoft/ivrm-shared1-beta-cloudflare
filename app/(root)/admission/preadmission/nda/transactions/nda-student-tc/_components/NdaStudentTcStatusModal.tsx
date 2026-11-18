'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Loader2, ShieldCheck, X } from 'lucide-react';

interface NdaStudentTcStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    statusList: any[];
    isLoading?: boolean;
}

export function NdaStudentTcStatusModal({ isOpen, onClose, statusList, isLoading }: NdaStudentTcStatusModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-[800px] overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl'>
                <DialogHeader className='relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white'>
                    <div className='flex items-center gap-5'>
                        <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md'>
                            <ShieldCheck className='h-8 w-8' />
                        </div>
                        <div>
                            <DialogTitle className='font-black text-2xl tracking-tight'>STAFF APPROVAL STATUS</DialogTitle>
                            <p className='font-medium text-indigo-100'>Tracking application progress across departments</p>
                        </div>
                    </div>
                    <Button
                        variant='ghost'
                        onClick={onClose}
                        className='absolute top-6 right-6 h-10 w-10 rounded-full p-0 text-white/80 hover:bg-white/10 hover:text-white'>
                        <X className='h-6 w-6' />
                    </Button>
                </DialogHeader>

                <div className='p-8'>
                    {isLoading ? (
                        <div className='flex h-64 flex-col items-center justify-center gap-4'>
                            <Loader2 className='h-12 w-12 animate-spin text-indigo-600' />
                            <p className='font-bold text-slate-400 text-sm uppercase tracking-widest'>Loading Status...</p>
                        </div>
                    ) : (
                        <div className='overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/30'>
                            <Table>
                                <TableHeader className='bg-indigo-50/50'>
                                    <TableRow className='h-14 border-indigo-100/50 border-b'>
                                        <TableHead className='pl-8 font-black text-indigo-900 text-xs uppercase tracking-widest'>
                                            Approval Name
                                        </TableHead>
                                        <TableHead className='text-center font-black text-indigo-900 text-xs uppercase tracking-widest'>
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statusList?.length > 0 ? (
                                        statusList.map((item, idx) => {
                                            const isApproved = item.ASCAP_Status === 'Approved';
                                            return (
                                                <TableRow
                                                    key={idx}
                                                    className='h-16 border-white/50 border-b transition-colors hover:bg-white'>
                                                    <TableCell className='pl-8 font-bold text-slate-700'>{item.empname}</TableCell>
                                                    <TableCell className='text-center'>
                                                        <div className='flex justify-center'>
                                                            <span
                                                                className={cn(
                                                                    'inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-black text-xs tracking-wide shadow-sm',
                                                                    isApproved
                                                                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                                                                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                                                )}>
                                                                {isApproved ? (
                                                                    <CheckCircle2 className='h-3.5 w-3.5' />
                                                                ) : (
                                                                    <Clock className='h-3.5 w-3.5' />
                                                                )}
                                                                {item.ASCAP_Status}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className='h-32 text-center font-medium text-slate-400 italic'>
                                                No approval tracking data found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className='flex justify-end px-8 pb-8'>
                    <Button
                        onClick={onClose}
                        className='h-11 rounded-full bg-slate-100 px-10 font-bold text-slate-600 transition-all hover:bg-slate-200'>
                        CLOSE VIEW
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
