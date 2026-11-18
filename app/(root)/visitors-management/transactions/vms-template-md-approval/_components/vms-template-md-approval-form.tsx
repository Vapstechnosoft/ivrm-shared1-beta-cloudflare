'use client';

import { type StatusFilterType, useVMSTemplateMDApproval } from '@/hooks/visitors-management/use-vms-template-md-approval';
import type { VMSTemplateUploadDTO } from '@/types/visitors-management/vms-template-upload-types';
import { useState } from 'react';
import Swal from 'sweetalert2';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import {
    ArrowUpDown,
    Calendar as CalendarIcon,
    CheckCircle2,
    CheckSquare,
    Download,
    Eye,
    FileCode,
    FileImage,
    List,
    Search,
    User,
    X,
    XCircle
} from 'lucide-react';

export default function VMSTemplateMDApprovalForm() {
    const {
        gridData,
        filteredGrid,
        selectedStatusFilter,
        isLoading,
        showApprovalForm,
        ismmT_TemplateName,
        ismmT_TemplateType,
        ismmT_Description,
        ismmT_FilePath,
        ismmT_SubmittedBy,
        ismmT_SubmittedDate,
        ismmT_Status,
        setIsmmT_Status,
        ismmT_MDRemarks,
        setIsmmT_MDRemarks,
        handleFilterClick,
        reviewTemplate,
        saveMDDecision,
        clearForm
    } = useVMSTemplateMDApproval();

    const [searchValue, setSearchValue] = useState('');

    // Sorting State
    const [sortKey, setSortKey] = useState<keyof VMSTemplateUploadDTO>('ismmT_Id');
    const [sortReverse, setSortReverse] = useState(true);

    // Preview Modals State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileType, setPreviewFileType] = useState<'image' | 'pdf' | null>(null);

    // ---------------------------------------------------------
    // PREVIEW FILE ($scope.showmodaldetailscheck)
    // ---------------------------------------------------------
    const openPreview = (filepath?: string) => {
        if (!filepath) {
            Swal.fire('Warning', 'No file uploaded to view.', 'warning');
            return;
        }

        const filename = filepath.toString();
        const nameArray = filename.split('.');
        const ext = nameArray[nameArray.length - 1].toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext) || filepath.includes('placeholder')) {
            setPreviewFileType('image');
            setPreviewUrl(filepath);
        } else if (['pdf', 'txt'].includes(ext) || filepath.includes('pdf')) {
            setPreviewFileType('pdf');
            setPreviewUrl(filepath);
        } else {
            window.open(filepath, '_blank');
        }
    };

    // ---------------------------------------------------------
    // DOWNLOAD FILE ($scope.downloadFile)
    // ---------------------------------------------------------
    const handleDownload = (filepath?: string) => {
        if (!filepath) {
            Swal.fire('Warning', 'No file available to download.', 'warning');
            return;
        }
        const a = document.createElement('a');
        a.href = filepath;
        a.target = '_blank';
        a.download = filepath.substring(filepath.lastIndexOf('/') + 1) || 'template_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ---------------------------------------------------------
    // SORTING & FILTERING
    // ---------------------------------------------------------
    const handleSort = (key: keyof VMSTemplateUploadDTO) => {
        if (sortKey === key) {
            setSortReverse(!sortReverse);
        } else {
            setSortKey(key);
            setSortReverse(false);
        }
    };

    const finalGrid = filteredGrid
        .filter((item) => {
            const term = searchValue.toLowerCase();
            return (
                item.ismmT_TemplateName.toLowerCase().includes(term) ||
                item.ismmT_TemplateType.toLowerCase().includes(term) ||
                item.ismmT_Description.toLowerCase().includes(term) ||
                (item.ismmT_SubmittedBy || '').toLowerCase().includes(term) ||
                (item.ismmT_Status || '').toLowerCase().includes(term)
            );
        })
        .sort((a, b) => {
            const valA = a[sortKey] ?? '';
            const valB = b[sortKey] ?? '';
            if (valA < valB) return sortReverse ? 1 : -1;
            if (valA > valB) return sortReverse ? -1 : 1;
            return 0;
        });

    return (
        <div className='space-y-6'>
            {/* 1. MD TEMPLATE REVIEW & APPROVAL FORM CARD */}
            {showApprovalForm && (
                <Card className='fade-in animate-in border-t-4 border-t-indigo-700 shadow-md duration-300'>
                    <CardHeader
                        style={{ backgroundColor: '#3f51b5' }}
                        className='flex flex-row items-center justify-between rounded-t-md px-5 py-3 text-white'>
                        <CardTitle className='flex items-center gap-2 font-bold text-base text-white'>
                            <CheckSquare className='h-5 w-5 text-white' />
                            MD PORTAL - REVIEW & APPROVE TEMPLATE REQUEST
                        </CardTitle>
                        <Button variant='ghost' size='sm' onClick={clearForm} className='h-auto p-1 text-white hover:bg-indigo-600'>
                            <X className='h-5 w-5 text-white' />
                        </Button>
                    </CardHeader>

                    <CardContent style={{ backgroundColor: '#f9fbfd' }} className='space-y-6 pt-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* LEFT COLUMN: TEMPLATE METADATA (READONLY) */}
                            <div className='space-y-4'>
                                {/* Template Name */}
                                <div className='grid grid-cols-12 items-center'>
                                    <span className='col-span-4 font-semibold text-gray-700 text-sm'>Template Name :</span>
                                    <div className='col-span-8 font-bold text-base' style={{ color: '#1a237e' }}>
                                        {ismmT_TemplateName}
                                    </div>
                                </div>

                                {/* Template Type */}
                                <div className='grid grid-cols-12 items-center'>
                                    <span className='col-span-4 font-semibold text-gray-700 text-sm'>Template Type :</span>
                                    <div className='col-span-8'>
                                        <Badge variant='outline' className='border-sky-300 bg-sky-50 px-2 py-0.5 text-sky-700 text-xs'>
                                            {ismmT_TemplateType}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Submitted By */}
                                <div className='grid grid-cols-12 items-center'>
                                    <span className='col-span-4 font-semibold text-gray-700 text-sm'>Submitted By :</span>
                                    <div className='col-span-8 flex items-center gap-1 font-semibold text-gray-800 text-sm'>
                                        <User className='h-4 w-4 text-gray-500' /> {ismmT_SubmittedBy}
                                    </div>
                                </div>

                                {/* Submitted Date */}
                                <div className='grid grid-cols-12 items-center'>
                                    <span className='col-span-4 font-semibold text-gray-700 text-sm'>Submitted Date :</span>
                                    <div className='col-span-8 flex items-center gap-1 font-semibold text-gray-800 text-sm'>
                                        <CalendarIcon className='h-4 w-4 text-gray-500' /> {ismmT_SubmittedDate || '-'}
                                    </div>
                                </div>

                                {/* Uploaded File */}
                                <div className='grid grid-cols-12 items-center'>
                                    <span className='col-span-4 font-semibold text-gray-700 text-sm'>Uploaded File :</span>
                                    <div className='col-span-8 flex items-center gap-2'>
                                        {ismmT_FilePath ? (
                                            <>
                                                <Button
                                                    type='button'
                                                    size='sm'
                                                    className='h-7 gap-1 bg-cyan-600 bg-info px-3 text-white text-xs hover:bg-cyan-700'
                                                    onClick={() => openPreview(ismmT_FilePath)}>
                                                    <Eye className='h-3.5 w-3.5' /> View File
                                                </Button>
                                                <Button
                                                    type='button'
                                                    size='sm'
                                                    className='h-7 gap-1 bg-emerald-600 px-3 text-white text-xs hover:bg-emerald-700'
                                                    onClick={() => handleDownload(ismmT_FilePath)}>
                                                    <Download className='h-3.5 w-3.5' /> Download
                                                </Button>
                                            </>
                                        ) : (
                                            <span className='text-muted-foreground text-sm'>No File Uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: DESCRIPTION & DECISION FORM */}
                            <div className='space-y-4'>
                                {/* Description */}
                                <div className='grid grid-cols-12 items-start'>
                                    <span className='col-span-4 pt-1 font-semibold text-gray-700 text-sm'>Description :</span>
                                    <div className='col-span-8'>
                                        <div className='min-h-[60px] rounded-md border bg-white p-3 text-gray-800 text-sm'>
                                            {ismmT_Description}
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Status Buttons */}
                                <div className='grid grid-cols-12 items-center'>
                                    <span className='col-span-4 font-semibold text-gray-700 text-sm'>
                                        Approval Status :<span className='text-red-500'>*</span>
                                    </span>
                                    <div className='col-span-8 flex items-center gap-3'>
                                        <Button
                                            type='button'
                                            variant={ismmT_Status === 'Approved' ? 'default' : 'outline'}
                                            className={
                                                ismmT_Status === 'Approved'
                                                    ? 'gap-1.5 bg-emerald-600 font-semibold text-white hover:bg-emerald-700'
                                                    : 'gap-1.5 font-semibold text-gray-700'
                                            }
                                            onClick={() => setIsmmT_Status('Approved')}>
                                            <CheckCircle2 className='h-4 w-4' /> Approve
                                        </Button>

                                        <Button
                                            type='button'
                                            variant={ismmT_Status === 'Rejected' ? 'default' : 'outline'}
                                            className={
                                                ismmT_Status === 'Rejected'
                                                    ? 'gap-1.5 bg-rose-600 font-semibold text-white hover:bg-rose-700'
                                                    : 'gap-1.5 font-semibold text-gray-700'
                                            }
                                            onClick={() => setIsmmT_Status('Rejected')}>
                                            <XCircle className='h-4 w-4' /> Reject
                                        </Button>
                                    </div>
                                </div>

                                {/* MD Remarks (Mandatory) */}
                                <div className='grid grid-cols-12 items-start'>
                                    <span className='col-span-4 pt-2 font-semibold text-gray-700 text-sm'>
                                        MD Remarks :<span className='text-red-500'>*</span>
                                    </span>
                                    <div className='col-span-8 space-y-1'>
                                        <Textarea
                                            rows={3}
                                            placeholder='Enter mandatory approval/rejection remarks...'
                                            value={ismmT_MDRemarks}
                                            onChange={(e) => setIsmmT_MDRemarks(e.target.value)}
                                            className='border-gray-300 bg-white'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='my-4 border-gray-200' />

                        {/* ACTION BUTTONS */}
                        <div className='flex items-center justify-center gap-4 pt-1'>
                            <Button
                                type='button'
                                style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                                className='gap-2 px-6 py-2 font-semibold text-white hover:opacity-90'
                                onClick={saveMDDecision}>
                                <CheckSquare className='h-4 w-4' /> UPDATE DECISION
                            </Button>

                            <Button
                                type='button'
                                style={{ backgroundColor: '#ff5722', borderColor: '#ff5722' }}
                                className='gap-2 px-6 py-2 font-semibold text-white hover:opacity-90'
                                onClick={clearForm}>
                                <X className='h-4 w-4' /> CANCEL
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. SUBMITTED TEMPLATES APPROVAL LIST GRID */}
            <Card className='border-t-4 border-t-blue-600 shadow-md'>
                <CardHeader className='flex flex-col gap-4 border-b bg-slate-50 py-4 md:flex-row md:items-center md:justify-between'>
                    <CardTitle className='flex items-center gap-2 font-bold text-blue-700 text-lg'>
                        <List className='h-5 w-5 text-blue-600' />
                        SUBMITTED TEMPLATES APPROVAL LIST
                    </CardTitle>

                    {/* SEARCH BOX */}
                    <div className='relative w-full sm:w-72'>
                        <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search Here...'
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className='bg-white pl-9'
                        />
                    </div>
                </CardHeader>

                <CardContent className='space-y-4 pt-6'>
                    {/* STATUS FILTER BUTTONS & TOTAL RECORDS */}
                    <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                        <div className='flex items-center gap-2'>
                            <span className='font-semibold text-gray-700 text-sm'>Filter Status :</span>
                            <div className='flex items-center gap-1 rounded-md border bg-gray-100 p-1'>
                                {(['All', 'Pending', 'Approved', 'Rejected'] as StatusFilterType[]).map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={selectedStatusFilter === filter ? 'default' : 'ghost'}
                                        size='sm'
                                        className={
                                            selectedStatusFilter === filter
                                                ? filter === 'Pending'
                                                    ? 'h-7 bg-amber-500 font-semibold text-white text-xs hover:bg-amber-600'
                                                    : filter === 'Approved'
                                                      ? 'h-7 bg-emerald-600 font-semibold text-white text-xs hover:bg-emerald-700'
                                                      : filter === 'Rejected'
                                                        ? 'h-7 bg-rose-600 font-semibold text-white text-xs hover:bg-rose-700'
                                                        : 'h-7 bg-blue-600 font-semibold text-white text-xs hover:bg-blue-700'
                                                : 'h-7 text-gray-700 text-xs hover:bg-gray-200'
                                        }
                                        onClick={() => handleFilterClick(filter)}>
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className='font-semibold text-sm'>
                            Total Records :{' '}
                            <Badge variant='secondary' className='ml-1 bg-gray-200 text-gray-800 text-sm'>
                                {finalGrid.length}
                            </Badge>
                        </div>
                    </div>

                    {/* GRID TABLE */}
                    <div className='overflow-x-auto rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-slate-100 font-bold'>
                                    <TableHead className='w-12 text-center'>S.No</TableHead>
                                    <TableHead className='cursor-pointer' onClick={() => handleSort('ismmT_TemplateName')}>
                                        <div className='flex items-center gap-1'>
                                            Template Name <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    <TableHead className='cursor-pointer' onClick={() => handleSort('ismmT_TemplateType')}>
                                        <div className='flex items-center gap-1'>
                                            Template Type <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Submitted By</TableHead>
                                    <TableHead className='cursor-pointer text-center' onClick={() => handleSort('ismmT_SubmittedDate')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            Submitted Date <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    <TableHead className='cursor-pointer text-center' onClick={() => handleSort('ismmT_Status')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            Status <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    <TableHead>MD Remarks</TableHead>
                                    <TableHead className='text-center'>View / Download</TableHead>
                                    <TableHead className='text-center'>MD Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className='py-6 text-center text-muted-foreground'>
                                            Loading Submitted Templates...
                                        </TableCell>
                                    </TableRow>
                                ) : finalGrid.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className='py-6 text-center text-muted-foreground'>
                                            No Submitted Templates Found for Selected Filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    finalGrid.map((row, idx) => (
                                        <TableRow key={row.ismmT_Id}>
                                            <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                            <TableCell className='font-semibold text-gray-900'>{row.ismmT_TemplateName}</TableCell>
                                            <TableCell>
                                                <Badge variant='outline' className='border-sky-300 bg-sky-50 text-sky-700'>
                                                    {row.ismmT_TemplateType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='max-w-xs truncate'>{row.ismmT_Description}</TableCell>
                                            <TableCell>{row.ismmT_SubmittedBy}</TableCell>
                                            <TableCell className='text-center'>{row.ismmT_SubmittedDate || '-'}</TableCell>
                                            <TableCell className='text-center'>
                                                {row.ismmT_Status === 'Pending' && (
                                                    <Badge className='bg-amber-500 text-white hover:bg-amber-600'>Pending</Badge>
                                                )}
                                                {row.ismmT_Status === 'Approved' && (
                                                    <Badge className='bg-emerald-600 text-white hover:bg-emerald-700'>Approved</Badge>
                                                )}
                                                {row.ismmT_Status === 'Rejected' && (
                                                    <Badge className='bg-rose-600 text-white hover:bg-rose-700'>Rejected</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className='text-gray-600 italic'>{row.ismmT_MDRemarks || '-'}</TableCell>
                                            <TableCell className='text-center'>
                                                {row.ismmT_FilePath ? (
                                                    <div className='flex items-center justify-center gap-3'>
                                                        <button
                                                            type='button'
                                                            onClick={() => openPreview(row.ismmT_FilePath)}
                                                            className='text-cyan-600 hover:text-cyan-800'
                                                            title='View File'>
                                                            <Eye className='h-5 w-5' />
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleDownload(row.ismmT_FilePath)}
                                                            className='text-emerald-600 hover:text-emerald-800'
                                                            title='Download File'>
                                                            <Download className='h-5 w-5' />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className='text-gray-400'>-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Button
                                                    size='sm'
                                                    className='h-7 gap-1 bg-blue-600 text-white text-xs hover:bg-blue-700'
                                                    onClick={() => reviewTemplate(row)}>
                                                    <Pencil className='h-3.5 w-3.5' /> Review / Approve
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* PREVIEW MODAL */}
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2 text-blue-700'>
                            {previewFileType === 'image' ? <FileImage className='h-5 w-5' /> : <FileCode className='h-5 w-5' />}
                            Document File Preview
                        </DialogTitle>
                    </DialogHeader>

                    <div className='flex items-center justify-center rounded-md bg-gray-50 p-4'>
                        {previewFileType === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl || ''} alt='File Preview' className='max-h-[450px] rounded border object-contain' />
                        ) : (
                            <iframe src={previewUrl || ''} className='h-[480px] w-full rounded border' title='Document Preview' />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
