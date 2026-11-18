'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import { Ban, Download, Eye, X } from 'lucide-react';

interface DetailsViewProps {
    rowData: IClassWorkDetails;
    onClose: () => void;
}

export default function DetailsView({ rowData, onClose }: DetailsViewProps) {
    // Combine both arrays if they exist, otherwise use the single file/att from rowData
    const fileAttachments =
        rowData.icW_FilePath_Array ||
        (rowData.icW_FilePath ? [{ icW_FilePath: rowData.icW_FilePath, fileName: rowData.icW_Attachment || 'File' }] : []);
    const urlAttachments =
        rowData.icW_Attachment_Array ||
        (rowData.icW_Attachment?.startsWith('http') ? [{ icW_FilePath: rowData.icW_Attachment, fileName: rowData.icW_Attachment }] : []);

    const allAttachments = [...fileAttachments, ...urlAttachments];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl overflow-hidden border-none p-0 transition-all duration-200'>
                {/* Header with custom blue background */}
                <DialogHeader className='relative flex flex-row items-center justify-between space-y-0 bg-[#005596] p-4 text-white'>
                    <DialogTitle className='font-bold text-sm uppercase tracking-wider'>CLASSWORK ATTACHMENT DETAILS</DialogTitle>
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 rounded p-1 transition-colors hover:bg-white/20'
                        aria-label='Close'>
                        <X className='h-5 w-5 text-white' />
                    </button>
                </DialogHeader>

                <div className='space-y-6 bg-white p-4'>
                    {/* Table Section */}
                    <div className='overflow-hidden rounded-sm border border-slate-200 shadow-sm'>
                        <table className='w-full border-collapse'>
                            <thead>
                                <tr className='bg-[#005596] text-white'>
                                    <th className='w-16 border border-white/20 p-2.5 text-center font-bold text-xs uppercase'>SLNO</th>
                                    <th className='border border-white/20 p-2.5 text-left font-bold text-xs uppercase'>File Name/URL</th>
                                    <th className='w-28 border border-white/20 p-2.5 text-center font-bold text-xs uppercase'>
                                        View/Click
                                    </th>
                                    <th className='w-28 border border-white/20 p-2.5 text-center font-bold text-xs uppercase'>Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAttachments.length > 0 ? (
                                    allAttachments.map((item, index) => {
                                        const isUrl = item.icW_FilePath.startsWith('http');
                                        return (
                                            <tr key={index} className='border-slate-200 border-b transition-colors hover:bg-slate-50'>
                                                <td className='border border-slate-200 p-2.5 text-center font-medium text-sm'>
                                                    {index + 1}
                                                </td>
                                                <td className='max-w-md truncate border border-slate-200 p-2.5 text-sm'>
                                                    {item.fileName || item.icW_FilePath}
                                                </td>
                                                <td className='border border-slate-200 p-2.5 text-center'>
                                                    {isUrl ? (
                                                        <a
                                                            href={item.icW_FilePath}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='font-bold text-blue-600 text-xs uppercase hover:underline'>
                                                            Click Here
                                                        </a>
                                                    ) : (
                                                        <button
                                                            onClick={() => window.open(item.icW_FilePath, '_blank')}
                                                            className='flex w-full items-center justify-center p-1 text-blue-600 hover:text-blue-800'
                                                            title='View'>
                                                            <Eye className='h-4 w-4' />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className='border border-slate-200 p-2.5 text-center'>
                                                    {!isUrl ? (
                                                        <a
                                                            href={item.icW_FilePath}
                                                            download={item.fileName}
                                                            className='flex w-full items-center justify-center p-1 text-blue-600 hover:text-blue-800'
                                                            title='Download'>
                                                            <Download className='h-4 w-4' />
                                                        </a>
                                                    ) : (
                                                        <div className='flex justify-center'>
                                                            <Ban className='h-4 w-4 text-slate-300' />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className='p-8 text-center text-slate-400 text-sm italic'>
                                            No attachments found for this classwork.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Section */}
                    <div className='space-y-4 pt-2'>
                        <p className='font-bold text-[#931d22] text-xs italic'>Note : Excel, ppt and Document Can't View. only Download</p>

                        <div className='flex justify-end pt-2'>
                            <Button
                                onClick={onClose}
                                className='h-8 rounded-sm border border-slate-300 bg-white px-8 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 active:scale-95'>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
