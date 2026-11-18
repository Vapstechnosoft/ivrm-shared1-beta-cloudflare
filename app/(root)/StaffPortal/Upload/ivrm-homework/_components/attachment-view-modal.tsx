'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ExternalLink, Eye, FileText, Music } from 'lucide-react';
import { useState } from 'react';

interface Attachment {
    ihwatT_FileName: string;
    ihwatT_Attachment: string;
    ihW_Attachment?: string;
    ihW_Id?: number;
}

interface AttachmentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: Attachment[];
    title?: string;
}

export default function AttachmentViewModal({
    isOpen,
    onClose,
    attachments,
    title = 'Homework Attachment Details'
}: AttachmentViewModalProps) {
    const [previewItem, setPreviewItem] = useState<Attachment | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
        if (['mp4', 'wmv', 'mov', 'avi'].includes(ext || '')) return 'video';
        if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'audio';
        if (ext === 'pdf') return 'pdf';
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) return 'doc';
        return 'other';
    };

    const handlePreview = (item: Attachment) => {
        const type = getFileType(item.ihwatT_Attachment);
        if (type === 'doc') {
            window.open(item.ihwatT_Attachment, '_blank');
            return;
        }
        setPreviewItem(item);
        setIsPreviewOpen(true);
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle className='font-bold text-blue-700'>{title}</DialogTitle>
                    </DialogHeader>

                    <div className='mt-4'>
                        <Table>
                            <TableHeader className='bg-blue-50'>
                                <TableRow>
                                    <TableHead className='w-12 text-center'>SL NO</TableHead>
                                    <TableHead>File Name / URL</TableHead>
                                    <TableHead className='text-center'>View / Click</TableHead>
                                    <TableHead className='text-center'>Download</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attachments.length > 0 ? (
                                    attachments.map((item, index) => {
                                        const isLink = item.ihW_Attachment === 'HyperLink';
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className='text-center'>{index + 1}</TableCell>
                                                <TableCell className='max-w-xs truncate'>{item.ihwatT_FileName}</TableCell>
                                                <TableCell className='text-center'>
                                                    {isLink ? (
                                                        <a
                                                            href={item.ihwatT_Attachment}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            className='flex items-center justify-center gap-1 text-blue-600 hover:underline'>
                                                            Click Here <ExternalLink className='h-3 w-3' />
                                                        </a>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handlePreview(item)}
                                                            className='text-blue-600 hover:text-blue-800'>
                                                            <Eye className='mr-1 h-4 w-4' /> View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {isLink ? (
                                                        <span className='text-gray-400'>---</span>
                                                    ) : (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handleDownload(item.ihwatT_Attachment, item.ihwatT_FileName)}
                                                            className='text-blue-600 hover:text-blue-800'>
                                                            <Download className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className='py-8 text-center text-gray-500'>
                                            No attachments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='mt-6 border-t pt-4 text-gray-600 text-xs italic'>
                        <span className='font-bold text-red-500'>Note:</span> Excel, PPT, and Word documents cannot be viewed online. They
                        will be downloaded or opened in a new tab.
                    </div>
                </DialogContent>
            </Dialog>

            {/* In-browser Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className='flex h-[85vh] max-w-5xl flex-col border-none bg-slate-900 p-2'>
                    <DialogHeader className='flex flex-row items-center justify-between border-white/10 border-b p-4'>
                        <DialogTitle className='truncate pr-8 text-white'>{previewItem?.ihwatT_FileName}</DialogTitle>
                    </DialogHeader>

                    <div className='relative flex flex-1 items-center justify-center overflow-hidden'>
                        {previewItem && (
                            <>
                                {getFileType(previewItem.ihwatT_Attachment) === 'image' && (
                                    <div className='flex h-full w-full items-center justify-center bg-checkered p-4'>
                                        <img
                                            src={previewItem.ihwatT_Attachment}
                                            alt={previewItem.ihwatT_FileName}
                                            className='max-h-full max-w-full rounded-sm object-contain shadow-2xl'
                                        />
                                    </div>
                                )}

                                {getFileType(previewItem.ihwatT_Attachment) === 'video' && (
                                    <div className='aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl'>
                                        <video controls autoPlay className='h-full w-full' key={previewItem.ihwatT_Attachment}>
                                            <source src={previewItem.ihwatT_Attachment} type='video/mp4' />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}

                                {getFileType(previewItem.ihwatT_Attachment) === 'audio' && (
                                    <div className='flex flex-col items-center gap-6 rounded-3xl border border-white/20 bg-white/10 p-12 shadow-2xl backdrop-blur-md'>
                                        <div className='flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-blue-500'>
                                            <Music className='h-12 w-12 text-white' />
                                        </div>
                                        <audio controls autoPlay className='w-80 shadow-lg' key={previewItem.ihwatT_Attachment}>
                                            <source src={previewItem.ihwatT_Attachment} type='audio/mpeg' />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                {getFileType(previewItem.ihwatT_Attachment) === 'pdf' && (
                                    <iframe
                                        src={`${previewItem.ihwatT_Attachment}#toolbar=0`}
                                        className='h-full w-full rounded-sm'
                                        title='PDF Preview'
                                    />
                                )}

                                {getFileType(previewItem.ihwatT_Attachment) === 'other' && (
                                    <div className='flex flex-col items-center gap-4 text-white'>
                                        <FileText className='h-20 w-20 text-blue-400' />
                                        <p className='text-lg'>Preview not supported for this file type.</p>
                                        <Button asChild>
                                            <a href={previewItem.ihwatT_Attachment} download>
                                                <Download className='mr-2 h-4 w-4' /> Download to View
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className='flex justify-end gap-2 border-white/10 border-t p-4'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsPreviewOpen(false)}
                            className='border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white'>
                            Close Preview
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
