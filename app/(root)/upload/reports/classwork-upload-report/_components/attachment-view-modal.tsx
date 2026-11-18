'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadFile } from '@/lib/utils';
import type { IClassWorkAttachment } from '@/types/upload/reports/classwork-upload-report';
import { Ban, Download, Eye, X } from 'lucide-react';
import { useState } from 'react';

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: IClassWorkAttachment[];
}

export function AttachmentViewModal({ isOpen, onClose, attachments }: AttachmentViewModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);

    const getFileType = (url: string) => {
        try {
            const path = url.split('?')[0];
            const extension = path.split('.').pop()?.toLowerCase() || '';
            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
            if (['mp4', 'webm'].includes(extension)) return 'video';
            if (['mp3', 'wav'].includes(extension)) return 'audio';
            if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) return 'office';
            return extension;
        } catch (error) {
            return 'unknown';
        }
    };

    const handlePreview = (url: string) => {
        let type = getFileType(url);
        // Fail-safe: Force office viewer for any URL that looks like a PDF
        if (url.split('?')[0].toLowerCase().endsWith('.pdf')) {
            type = 'office';
        }
        setPreviewUrl(url);
        setPreviewType(type || 'unknown');
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2 font-black text-slate-800 text-xl uppercase tracking-tight'>
                            CLASSWORK ATTACHMENT DETAILS
                        </DialogTitle>
                    </DialogHeader>

                    <div className='flex-1 overflow-auto py-4'>
                        <div className='overflow-hidden rounded-xl border border-slate-100 shadow-sm'>
                            <Table>
                                <TableHeader className='bg-slate-900'>
                                    <TableRow className='hover:bg-transparent'>
                                        <TableHead className='w-16 text-center font-bold text-[10px] text-white uppercase tracking-widest'>
                                            SLNO
                                        </TableHead>
                                        <TableHead className='font-bold text-[10px] text-white uppercase tracking-widest'>
                                            File Name/URL
                                        </TableHead>
                                        <TableHead className='w-32 text-center font-bold text-[10px] text-white uppercase tracking-widest'>
                                            View
                                        </TableHead>
                                        <TableHead className='w-24 text-center font-bold text-[10px] text-white uppercase tracking-widest'>
                                            Download
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((attachment, index) => {
                                        const isHyperlink = attachment.icW_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index} className='transition-colors hover:bg-slate-50'>
                                                <TableCell className='text-center font-medium text-slate-500'>{index + 1}</TableCell>
                                                <TableCell
                                                    className='max-w-xs truncate font-semibold text-slate-700'
                                                    title={attachment.icwatT_FileName}>
                                                    {attachment.icwatT_FileName}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isHyperlink ? (
                                                        <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-widest opacity-30'>
                                                            ---
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handlePreview(attachment.icwatT_Attachment)}
                                                            className='mx-auto flex items-center gap-1 text-primary transition-all hover:bg-primary/10 hover:text-primary'>
                                                            <Eye className='h-4 w-4' /> View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isHyperlink ? (
                                                        <Ban className='mx-auto h-4 w-4 text-slate-300' />
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() =>
                                                                downloadFile(attachment.icwatT_Attachment, attachment.icwatT_FileName)
                                                            }
                                                            className='h-8 w-8 rounded-full p-0 text-primary transition-transform hover:scale-110 hover:bg-primary/5'>
                                                            <Download className='mx-auto h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className='flex flex-col items-center justify-between gap-4 border-t pt-4 md:flex-row'>
                        <div className='flex items-center gap-2 text-sm'>
                            <span className='rounded bg-primary/5 px-2 py-0.5 font-black text-[10px] text-primary uppercase tracking-wider'>
                                Info :
                            </span>
                            <span className='font-medium text-muted-foreground text-xs italic'>
                                Document preview (PDF, Word, Excel) is now enabled. For other files, use download.
                            </span>
                        </div>
                        <Button
                            variant='outline'
                            onClick={onClose}
                            className='h-9 rounded-full border-slate-200 px-6 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50'>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Media Preview Dialog */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
                <DialogContent className='flex h-[85vh] max-w-5xl flex-col overflow-hidden rounded-2xl border-none p-0 shadow-2xl'>
                    <DialogHeader className='flex flex-row items-center justify-between border-b bg-white p-4'>
                        <DialogTitle className='font-black text-slate-800 uppercase tracking-tight'>Media Preview</DialogTitle>
                        <Button variant='ghost' size='icon' onClick={() => setPreviewUrl(null)} className='rounded-full hover:bg-slate-100'>
                            <X className='h-4 w-4' />
                        </Button>
                    </DialogHeader>
                    <div className='flex flex-1 items-center justify-center bg-slate-900 p-4'>
                        {previewType === 'image' ? (
                            <img
                                src={previewUrl!}
                                alt='Preview'
                                className='zoom-in max-h-full max-w-full animate-in object-contain shadow-2xl duration-300'
                            />
                        ) : previewType === 'video' ? (
                            <video src={previewUrl!} controls className='max-h-full max-w-full rounded-lg shadow-2xl'>
                                Your browser does not support the video tag.
                            </video>
                        ) : previewType === 'audio' ? (
                            <audio src={previewUrl!} controls className='w-full max-w-md'>
                                Your browser does not support the audio tag.
                            </audio>
                        ) : previewType === 'office' ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                                className='h-full w-full rounded-lg border-none bg-white shadow-2xl'
                                title='Document Preview'
                            />
                        ) : (
                            <div className='slide-in-from-bottom max-w-md animate-in rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-2xl duration-500'>
                                <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50'>
                                    <Ban className='h-10 w-10 text-slate-300' />
                                </div>
                                <h3 className='mb-3 font-black text-slate-800 text-xl uppercase tracking-tight'>Preview Not Available</h3>
                                <p className='mb-8 font-medium text-muted-foreground text-sm'>
                                    This file type ({previewType}) cannot be previewed online. Please download to view.
                                </p>
                                <Button
                                    asChild
                                    className='h-12 rounded-full px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'>
                                    <a href={previewUrl!} download className='flex items-center gap-2'>
                                        <Download className='h-4 w-4' /> Download File
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
