'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadFile } from '@/lib/utils';
import type { INoticeBoardAttachment } from '@/types/upload/reports/noticeboard-report';
import { Ban, Download, Eye, X } from 'lucide-react';
import { useState } from 'react';

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: INoticeBoardAttachment[];
}

export function AttachmentViewModal({ isOpen, onClose, attachments }: AttachmentViewModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const getFileType = (url: string) => {
        try {
            const path = url.split('?')[0];
            const extension = path.split('.').pop()?.toLowerCase() || '';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
            if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
            if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
            if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) return 'office';
            return extension;
        } catch (error) {
            return 'unknown';
        }
    };

    const handlePreview = (url: string, fileName: string) => {
        const type = getFileType(url);
        setPreviewUrl(url);
        setPreviewType(type);
        setPreviewName(fileName);
    };

    const closePreview = () => {
        setPreviewUrl(null);
        setPreviewType(null);
        setPreviewName(null);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className='flex max-h-[80vh] max-w-4xl flex-col overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle className='font-bold text-xl uppercase tracking-tight'>Notice Board Attachments</DialogTitle>
                    </DialogHeader>
                    <div className='flex-1 overflow-auto py-4'>
                        <div className='rounded-md border'>
                            <Table>
                                <TableHeader className='bg-slate-50'>
                                    <TableRow>
                                        <TableHead className='w-[50px] text-center'>SL NO</TableHead>
                                        <TableHead>File Name/URL</TableHead>
                                        <TableHead className='w-32 text-center'>View/Click</TableHead>
                                        <TableHead className='w-24 text-center'>Download</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((attachment, index) => {
                                        const isHyperlink = attachment.intB_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className='text-center'>{index + 1}</TableCell>
                                                <TableCell className='max-w-xs truncate font-medium' title={attachment.intbfL_FileName}>
                                                    {attachment.intbfL_FileName}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isHyperlink ? (
                                                        <a
                                                            href={attachment.intbfL_FilePath}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='font-bold text-primary text-xs hover:underline'>
                                                            Click Here
                                                        </a>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() =>
                                                                handlePreview(attachment.intbfL_FilePath, attachment.intbfL_FileName)
                                                            }
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
                                                                downloadFile(attachment.intbfL_FilePath, attachment.intbfL_FileName)
                                                            }
                                                            className='h-9 w-9 rounded-md p-0 text-primary hover:bg-accent hover:text-accent-foreground'>
                                                            <Download className='mx-auto h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {attachments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className='py-4 text-center'>
                                                No attachments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className='flex items-center justify-between border-t pt-4'>
                        <p className='text-muted-foreground text-xs'>
                            <span className='mr-1 font-bold text-primary italic'>Info:</span> Document preview (PDF, Word, Excel) is now
                            enabled.
                        </p>
                        <Button variant='outline' onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
                <DialogContent className='flex h-[90vh] max-w-5xl flex-col overflow-hidden border-none bg-slate-900 p-0 shadow-2xl'>
                    <DialogHeader className='flex flex-row items-center justify-between space-y-0 border-b bg-white p-4'>
                        <DialogTitle className='truncate pr-8 font-bold text-slate-800'>{previewName}</DialogTitle>
                        <Button variant='ghost' size='icon' onClick={closePreview} className='rounded-full'>
                            <X className='h-4 w-4' />
                        </Button>
                    </DialogHeader>
                    <div className='flex flex-1 items-center justify-center overflow-hidden bg-slate-900 p-4'>
                        {previewType === 'image' ? (
                            <img src={previewUrl!} alt='Preview' className='max-h-full max-w-full object-contain shadow-2xl' />
                        ) : previewType === 'video' ? (
                            <video src={previewUrl!} controls className='max-h-full max-w-full shadow-2xl'>
                                Your browser does not support the video tag.
                            </video>
                        ) : previewType === 'audio' ? (
                            <audio src={previewUrl!} controls className='w-full max-w-md rounded-full bg-white p-2'>
                                Your browser does not support the audio element.
                            </audio>
                        ) : previewType === 'office' ? (
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl!)}`}
                                className='h-full w-full rounded border-none bg-white shadow-2xl'
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
