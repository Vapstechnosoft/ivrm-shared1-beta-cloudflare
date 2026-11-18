'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSignage } from '@/hooks/digital-signage/useSignage';
import type { ColumnDef } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Loader2, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Interfaces for our data
interface MediaItem {
    mediaId: number;
    name: string;
    mediaType: string;
    fileName: string;
    fileSizeFormatted: string;
    width: number;
    height: number;
    orientation: string;
    createdDt: string;
}

interface ScheduleItem {
    eventId: number;
    campaign: string;
    displayGroupList: string;
    eventTypeName: string;
    displayFromDt: string;
    displayToDt: string;
    createdOn: string;
}

interface DisplayItem {
    displayId: number;
    display: string;
    clientType: string;
    statusDescription: string;
    lastAccessed: string;
}

export default function UploadAndSchedule() {
    const { useLibrary, deleteMedia, useSchedule, deleteSchedule, useDisplays, requestScreenshot, uploadAndSchedule } = useSignage();

    // Form States
    const [file, setFile] = useState<File | null>(null);
    const [startDt, setStartDt] = useState('');
    const [endDt, setEndDt] = useState('');
    const [displayId, setDisplayId] = useState('');

    // Pagination States
    const [libraryPage, setLibraryPage] = useState(1);
    const [schedulePage, setSchedulePage] = useState(1);
    const [displaysPage, setDisplaysPage] = useState(1);

    // Modal / Dialog States
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<{ mediaId: number; name: string } | null>(null);
    const [isForceDeleteOpen, setIsForceDeleteOpen] = useState(false);
    const [mediaToForceDelete, setMediaToForceDelete] = useState<{ mediaId: number; name: string } | null>(null);

    // Fetch Data
    const { data: libraryRes, isLoading: isLibraryLoading } = useLibrary(libraryPage, displayId ? Number.parseInt(displayId) : undefined);
    const { data: scheduleRes, isLoading: isScheduleLoading } = useSchedule(
        schedulePage,
        displayId ? Number.parseInt(displayId) : undefined
    );
    const { data: displaysRes, isLoading: isDisplaysLoading } = useDisplays(displaysPage);

    const mediaData: MediaItem[] = Array.isArray(libraryRes?.data) ? libraryRes.data : [];
    const scheduleData: ScheduleItem[] = Array.isArray(scheduleRes?.data) ? scheduleRes.data : [];
    const displayData: DisplayItem[] = Array.isArray(displaysRes?.data) ? displaysRes.data : [];

    // Automatically select the first available display when loaded
    useEffect(() => {
        if (displayData.length > 0 && !displayId) {
            setDisplayId(displayData[0].displayId.toString());
        }
    }, [displayData, displayId]);

    // Column Definitions
    const mediaColumns: ColumnDef<MediaItem>[] = [
        { accessorKey: 'mediaId', header: 'ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'mediaType', header: 'Type' },
        {
            accessorKey: 'fileName',
            header: 'File',
            cell: ({ row }) => <span className='inline-block max-w-[150px] truncate'>{row.original.fileName}</span>
        },
        { accessorKey: 'fileSizeFormatted', header: 'Size' },
        { accessorKey: 'width', header: 'Width' },
        { accessorKey: 'height', header: 'Height' },
        { accessorKey: 'orientation', header: 'Orientation' },
        { accessorKey: 'createdDt', header: 'Created' },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    variant='destructive'
                    size='sm'
                    className='h-8 px-2'
                    disabled={deleteMedia.isPending}
                    onClick={() => {
                        setMediaToDelete({ mediaId: row.original.mediaId, name: row.original.name });
                        setIsConfirmOpen(true);
                    }}>
                    <Trash2 className='h-4 w-4' />
                </Button>
            )
        }
    ];

    const scheduleColumns: ColumnDef<ScheduleItem>[] = [
        { accessorKey: 'eventId', header: 'ID' },
        { accessorKey: 'campaign', header: 'Campaign' },
        { accessorKey: 'displayGroupList', header: 'Display' },
        { accessorKey: 'eventTypeName', header: 'Type' },
        { accessorKey: 'displayFromDt', header: 'From' },
        { accessorKey: 'displayToDt', header: 'To' },
        { accessorKey: 'createdOn', header: 'Created' },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    variant='destructive'
                    size='sm'
                    className='h-8 px-2'
                    disabled={deleteSchedule.isPending}
                    onClick={() => deleteSchedule.mutate(row.original.eventId)}>
                    <Trash2 className='h-4 w-4' />
                </Button>
            )
        }
    ];

    const displayColumns: ColumnDef<DisplayItem>[] = [
        { accessorKey: 'displayId', header: 'ID' },
        { accessorKey: 'display', header: 'Display' },
        { accessorKey: 'clientType', header: 'Client' },
        { accessorKey: 'statusDescription', header: 'Status' },
        { accessorKey: 'lastAccessed', header: 'Last Access' },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    variant='default'
                    size='sm'
                    className='h-8 bg-blue-600 px-2 hover:bg-blue-700'
                    disabled={requestScreenshot.isPending}
                    onClick={() => requestScreenshot.mutate(row.original.displayId)}>
                    <RefreshCw className='mr-1 h-4 w-4' /> Request Shot
                </Button>
            )
        }
    ];

    const handleUpload = async () => {
        console.log('Form State Values:', { file, startDt, endDt, displayId });

        if (!file) {
            toast.error('Please select a media file to upload');
            return;
        }
        if (!startDt) {
            toast.error('Please specify a start date & time');
            return;
        }
        if (!endDt) {
            toast.error('Please specify an end date & time');
            return;
        }
        if (!displayId) {
            toast.error('Please select a target display');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('start_date', startDt);
        formData.append('end_date', endDt);
        formData.append('display_id', displayId);

        uploadAndSchedule.mutate(formData, {
            onSuccess: () => {
                // Clear form
                setFile(null);
                setStartDt('');
                setEndDt('');
                setDisplayId('');
                const fileInput = document.getElementById('media-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (!mediaToDelete) return;

        deleteMedia.mutate(
            { mediaId: mediaToDelete.mediaId },
            {
                onSuccess: (res) => {
                    setIsConfirmOpen(false);
                    if (!res.success) {
                        const isInUseError = res.message?.includes('422') || res.message?.includes('in use');
                        if (isInUseError) {
                            // Open force delete prompt
                            setMediaToForceDelete({ mediaId: mediaToDelete.mediaId, name: mediaToDelete.name });
                            setIsForceDeleteOpen(true);
                        }
                    }
                    setMediaToDelete(null);
                }
            }
        );
    };

    const handleForceDeleteConfirm = () => {
        if (!mediaToForceDelete) return;

        deleteMedia.mutate(
            { mediaId: mediaToForceDelete.mediaId, forceDelete: true },
            {
                onSuccess: () => {
                    setIsForceDeleteOpen(false);
                    setMediaToForceDelete(null);
                }
            }
        );
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='flex flex-col gap-2'>
                <h1 className='font-bold text-3xl text-orange-600 tracking-tight'>Signage Management</h1>
                <p className='text-muted-foreground'>Use this form to upload and schedule media in one request.</p>
            </motion.div>

            <div className='grid gap-6 lg:grid-cols-12'>
                {/* Left Sidebar: Upload Form */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='space-y-6 lg:col-span-4'>
                    <Card className='sticky top-6 border-orange-100 shadow-lg'>
                        <CardHeader className='border-orange-100 border-b bg-orange-50/50'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Upload className='h-5 w-5' /> Upload Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6 p-6'>
                            <div className='space-y-2'>
                                <Label htmlFor='media-file' className='font-bold'>
                                    Media File
                                </Label>
                                <div className='flex w-full items-center justify-center'>
                                    <label
                                        htmlFor='media-file'
                                        className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-orange-200 border-dashed bg-orange-50/30 transition-colors hover:bg-orange-50'>
                                        <div className='flex flex-col items-center justify-center px-4 pt-5 pb-6 text-center'>
                                            <Upload className='mb-3 h-8 w-8 text-orange-500' />
                                            {file ? (
                                                <p className='mb-2 max-w-full truncate font-bold text-green-700 text-sm'>{file.name}</p>
                                            ) : (
                                                <>
                                                    <p className='mb-2 text-orange-700 text-sm'>
                                                        <span className='font-semibold'>Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className='text-orange-600/60 text-xs'>PNG, JPG or MP4 (MAX. 500MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id='media-file'
                                            type='file'
                                            className='hidden'
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='start-dt' className='font-bold'>
                                        Start Date & Time
                                    </Label>
                                    <Input
                                        id='start-dt'
                                        type='datetime-local'
                                        className='focus-visible:ring-orange-500'
                                        value={startDt}
                                        onChange={(e) => setStartDt(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='end-dt' className='font-bold'>
                                        End Date & Time
                                    </Label>
                                    <Input
                                        id='end-dt'
                                        type='datetime-local'
                                        className='focus-visible:ring-orange-500'
                                        value={endDt}
                                        onChange={(e) => setEndDt(e.target.value)}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='display-id' className='font-bold text-orange-900'>
                                        Target Display
                                    </Label>
                                    <Select value={displayId} onValueChange={setDisplayId} disabled={isDisplaysLoading}>
                                        <SelectTrigger id='display-id' className='border-orange-200 focus:ring-orange-500'>
                                            <SelectValue placeholder={isDisplaysLoading ? 'Loading displays...' : 'Select a Display'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {displayData.map((item) => (
                                                <SelectItem key={item.displayId} value={item.displayId.toString()}>
                                                    {item.display || `Display ${item.displayId}`}
                                                </SelectItem>
                                            ))}
                                            {displayData.length === 0 && !isDisplaysLoading && (
                                                <SelectItem value='none' disabled>
                                                    No displays found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                className='w-full bg-[#1e6355] py-6 font-bold text-white shadow-lg hover:bg-[#154d42]'
                                onClick={handleUpload}
                                disabled={uploadAndSchedule.isPending}>
                                {uploadAndSchedule.isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Processing...
                                    </>
                                ) : (
                                    'Upload and Schedule'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Content: Tables */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='space-y-8 lg:col-span-8'>
                    {/* Media Table */}
                    <Card className='border-orange-100 shadow-md'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='text-orange-900'>Media Table</CardTitle>
                                <Button variant='outline' size='sm' className='h-8 border-orange-200 text-orange-600'>
                                    <Plus className='mr-1 h-4 w-4' /> Add Media
                                </Button>
                            </div>
                            <CardDescription>Manage uploaded media assets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable
                                data={mediaData}
                                columns={mediaColumns}
                                isLoading={isLibraryLoading}
                                isSearchRequired={false}
                                isPaginationRequired={true}
                                totalItems={mediaData.length}
                                onPageChange={(page) => setLibraryPage(page)}
                                maxHeight='400px'
                                scrollable={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Schedule Table */}
                    <Card className='border-orange-100 shadow-md'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-orange-900'>Schedule Table</CardTitle>
                            <CardDescription>Currently active and upcoming broadcast events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable
                                data={scheduleData}
                                columns={scheduleColumns}
                                isLoading={isScheduleLoading}
                                isSearchRequired={false}
                                isPaginationRequired={true}
                                totalItems={scheduleData.length}
                                onPageChange={(page) => setSchedulePage(page)}
                            />
                        </CardContent>
                    </Card>

                    {/* Display Table */}
                    <Card className='border-orange-100 shadow-md'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='text-orange-900'>Display Table</CardTitle>
                            <CardDescription>Connected signage devices status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable
                                data={displayData}
                                columns={displayColumns}
                                isLoading={isDisplaysLoading}
                                isSearchRequired={false}
                                isPaginationRequired={true}
                                totalItems={displayData.length}
                                onPageChange={(page) => setDisplaysPage(page)}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Standard Delete Confirmation */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the media asset{' '}
                            <span className='font-semibold text-foreground'>"{mediaToDelete?.name}"</span> from the Xibo CMS library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMediaToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                            Yes, Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Force Delete Confirmation (Library Item In Use) */}
            <AlertDialog open={isForceDeleteOpen} onOpenChange={setIsForceDeleteOpen}>
                <AlertDialogContent className='border-orange-200'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-orange-600'>Library Item In Use</AlertDialogTitle>
                        <AlertDialogDescription className='space-y-2'>
                            <p>
                                The media asset <span className='font-semibold text-foreground'>"{mediaToForceDelete?.name}"</span> is
                                currently active or scheduled in layout broadcasts.
                            </p>
                            <p className='font-medium text-destructive'>
                                Force deleting this media will permanently remove it from all active schedules, playlists, and layouts. This
                                cannot be undone.
                            </p>
                            <p>Do you want to proceed with a force delete?</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMediaToForceDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleForceDeleteConfirm} className='bg-orange-600 text-white hover:bg-orange-700'>
                            Yes, Force Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
