'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadFile } from '@/lib/utils';
import type { IHomeWorkAttachment } from '@/types/upload/reports/homework-upload-report';
import { Ban, Download, Eye, X } from 'lucide-react';
import { useState } from 'react';

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: IHomeWorkAttachment[];
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
                <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2 font-bold text-xl'>HOMEWORK ATTACHMENT DETAILS</DialogTitle>
                    </DialogHeader>

                    <div className='flex-1 overflow-auto py-4'>
                        <div className='rounded-md border'>
                            <Table>
                                <TableHeader className='bg-slate-50'>
                                    <TableRow>
                                        <TableHead className='w-16 text-center'>SLNO</TableHead>
                                        <TableHead>File Name/URL</TableHead>
                                        <TableHead className='w-32 text-center'>Attachment View</TableHead>
                                        <TableHead className='w-24 text-center'>Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((attachment, index) => {
                                        const isHyperlink = attachment.ihW_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className='text-center'>{index + 1}</TableCell>
                                                <TableCell className='max-w-xs truncate font-medium' title={attachment.ihwatT_FileName}>
                                                    {attachment.ihwatT_FileName}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isHyperlink ? (
                                                        <span className='text-muted-foreground text-xs'>---</span>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handlePreview(attachment.ihwatT_Attachment)}
                                                            className='mx-auto flex items-center gap-1 text-primary hover:bg-primary/10 hover:text-primary'>
                                                            <Eye className='h-4 w-4' /> View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isHyperlink ? (
                                                        <Ban className='mx-auto h-4 w-4 text-muted-foreground' />
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() =>
                                                                downloadFile(attachment.ihwatT_Attachment, attachment.ihwatT_FileName)
                                                            }
                                                            className='h-8 w-8 rounded-full p-0 text-primary hover:bg-primary/5'>
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

                    <div className='flex items-center justify-between border-t pt-4'>
                        <div className='flex items-center gap-2 text-sm'>
                            <span className='font-bold text-primary'>Info :</span>
                            <span className='text-muted-foreground italic'>
                                Document preview (PDF, Word, Excel) is now enabled. For other files, use download.
                            </span>
                        </div>
                        <Button variant='outline' onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Media Preview Dialog */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
                <DialogContent className='flex h-[85vh] max-w-5xl flex-col overflow-hidden p-0'>
                    <DialogHeader className='flex flex-row items-center justify-between border-b p-4'>
                        <DialogTitle>Media Preview</DialogTitle>
                        <Button variant='ghost' size='icon' onClick={() => setPreviewUrl(null)}>
                            <X className='h-4 w-4' />
                        </Button>
                    </DialogHeader>
                    <div className='flex flex-1 items-center justify-center bg-slate-900 p-4'>
                        {previewType === 'image' ? (
                            <img src={previewUrl!} alt='Preview' className='max-h-full max-w-full object-contain shadow-2xl' />
                        ) : previewType === 'video' ? (
                            <video src={previewUrl!} controls className='max-h-full max-w-full shadow-2xl'>
                                Your browser does not support the video tag.
                            </video>
                        ) : previewType === 'audio' ? (
                            <audio src={previewUrl!} controls className='w-full max-w-md'>
                                Your browser does not support the audio tag.
                            </audio>
                        ) : previewType === 'office' ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                                className='h-full w-full rounded border-none bg-white shadow-2xl'
                                title='Document Preview'
                            />
                        ) : (
                            <div className='rounded-lg border bg-white p-8 text-center shadow-sm'>
                                <Ban className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                                <h3 className='mb-2 font-semibold text-lg'>Preview Not Available</h3>
                                <p className='mb-4 text-muted-foreground'>This file type ({previewType}) cannot be previewed online.</p>
                                <Button asChild>
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
