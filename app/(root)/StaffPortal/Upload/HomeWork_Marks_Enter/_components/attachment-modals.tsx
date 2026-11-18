'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ExternalLink, Info } from 'lucide-react';

interface StaffAttachmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: any[];
}

export function StaffAttachmentModal({ isOpen, onClose, attachments }: StaffAttachmentModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='font-black text-blue-800 text-xs uppercase'>HomeWork Attachment Details</DialogTitle>
                </DialogHeader>
                <div className='overflow-hidden rounded-md border bg-white'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-slate-100 hover:bg-slate-100'>
                                <TableHead className='w-[50px] p-2 text-center font-black text-slate-700 text-xs uppercase'>SL</TableHead>
                                <TableHead className='p-2 font-black text-slate-700 text-xs uppercase'>File Name / URL</TableHead>
                                <TableHead className='p-2 text-center font-black text-slate-700 text-xs uppercase'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.length > 0 ? (
                                attachments.map((att, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='p-2 text-center font-bold text-[11px] text-slate-500'>{index + 1}</TableCell>
                                        <TableCell className='p-2 font-medium text-[11px] text-slate-600'>
                                            {att.ihwatT_FileName || 'View Document'}
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <div className='flex justify-center gap-2'>
                                                <Button
                                                    size='sm'
                                                    variant='ghost'
                                                    className='h-7 px-2 text-blue-600 hover:bg-blue-50'
                                                    asChild>
                                                    <a href={att.ihwatT_Attachment} target='_blank' rel='noopener noreferrer'>
                                                        <ExternalLink className='mr-1 h-3.5 w-3.5' />
                                                        VIEW
                                                    </a>
                                                </Button>
                                                {att.ihW_Attachment !== 'HyperLink' && (
                                                    <Button
                                                        size='sm'
                                                        variant='ghost'
                                                        className='h-7 px-2 text-slate-600 hover:bg-slate-50'
                                                        asChild>
                                                        <a href={att.ihwatT_Attachment} download={att.ihwatT_FileName}>
                                                            <Download className='mr-1 h-3.5 w-3.5' />
                                                            SAVE
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className='p-4 text-center font-bold text-[11px] text-slate-400 italic'>
                                        No attachments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='mt-2 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2'>
                    <Info className='mt-0.5 h-4 w-4 text-amber-600' />
                    <p className='font-bold text-[10px] text-amber-700 uppercase italic'>
                        Note: Documents (DOCX, XLSX, PPTX) may require downloading if your browser doesn't support direct preview.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface StudentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    uploads: any[];
}

export function StudentUploadModal({ isOpen, onClose, uploads }: StudentUploadModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle className='font-black font-black text-green-800 text-xs uppercase'>
                        Student Upload Homework Details
                    </DialogTitle>
                </DialogHeader>
                <div className='overflow-hidden rounded-md border bg-white'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-slate-100 hover:bg-slate-100'>
                                <TableHead className='w-[50px] p-2 text-center font-black text-slate-700 text-xs uppercase'>SL</TableHead>
                                <TableHead className='p-2 font-black text-slate-700 text-xs uppercase'>Student File</TableHead>
                                <TableHead className='p-2 text-center font-black text-slate-700 text-xs uppercase'>Action</TableHead>
                                <TableHead className='p-2 font-black text-slate-700 text-xs uppercase'>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploads.length > 0 ? (
                                uploads.map((up, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='p-2 text-center font-bold text-[11px] text-slate-500'>{index + 1}</TableCell>
                                        <TableCell className='p-2'>
                                            <div className='flex flex-col'>
                                                <span className='font-bold text-[11px] text-slate-600 uppercase'>
                                                    {up.ihwupL_FileName || 'Student-Work.pdf'}
                                                </span>
                                                <span className='font-medium text-[9px] text-slate-400'>{up.ihwupL_Date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='p-2 text-center'>
                                            <div className='flex justify-center gap-2'>
                                                <Button
                                                    size='sm'
                                                    variant='ghost'
                                                    className='h-7 px-2 text-green-600 hover:bg-green-50'
                                                    asChild>
                                                    <a href={up.ihwupL_Attachment} target='_blank' rel='noopener noreferrer'>
                                                        <ExternalLink className='mr-1 h-3.5 w-3.5' />
                                                        VIEW
                                                    </a>
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    variant='ghost'
                                                    className='h-7 px-2 text-slate-600 hover:bg-slate-50'
                                                    asChild>
                                                    <a href={up.ihwupL_Attachment} download={up.ihwupL_FileName}>
                                                        <Download className='mr-1 h-3.5 w-3.5' />
                                                        SAVE
                                                    </a>
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className='min-w-[150px] p-2'>
                                            <p className='text-[11px] text-slate-600 italic'>
                                                {up.ihwuplatT_StaffRemarks || 'No remarks provided'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className='p-4 text-center font-bold text-[11px] text-slate-400 italic'>
                                        No student uploads found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
