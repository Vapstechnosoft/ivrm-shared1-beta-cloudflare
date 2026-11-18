'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadFile } from '@/lib/utils';
import type { IHomeWorkAttachment } from '@/types/upload/reports/homework-upload-report';
import { Download, Eye } from 'lucide-react';
import { useState } from 'react';

interface ViewAttachmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    attachments: IHomeWorkAttachment[];
}

export const ViewAttachmentModal = ({ isOpen, onClose, attachments }: ViewAttachmentModalProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getFileType = (url: string) => {
        const path = url.split('?')[0];
        const extension = path.split('.').pop()?.toLowerCase();
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) return 'office';
        return 'other';
    };

    const handlePreview = (url: string) => {
        setPreviewUrl(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle>HomeWork Attachment Details</DialogTitle>
                </DialogHeader>

                <div className='max-h-[60vh] overflow-y-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[60px] text-center'>SL.NO</TableHead>
                                <TableHead className='text-center'>File Name/URL</TableHead>
                                <TableHead className='text-center'>Attachment View</TableHead>
                                <TableHead className='text-center'>Download</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className='text-center'>
                                        No attachments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attachments.map((att, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{att.ihwatT_FileName}</TableCell>
                                        <TableCell className='text-center'>
                                            {att.ihW_Attachment !== 'HyperLink' && (
                                                <Button variant='ghost' size='icon' onClick={() => handlePreview(att.ihwatT_Attachment)}>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => downloadFile(att.ihwatT_Attachment, att.ihwatT_FileName)}>
                                                <Download className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {previewUrl && (
                    <div className='mt-4 border-t pt-4'>
                        <div className='mb-2 flex items-center justify-between'>
                            <h4 className='font-semibold'>Preview</h4>
                            <Button variant='outline' size='sm' onClick={() => setPreviewUrl(null)}>
                                Close Preview
                            </Button>
                        </div>
                        <div className='aspect-video w-full overflow-hidden rounded border'>
                            <iframe
                                src={
                                    getFileType(previewUrl) === 'office'
                                        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
                                        : previewUrl
                                }
                                className='h-full w-full border-none'
                                title='Attachment Preview'
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
