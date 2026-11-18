'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { InputText } from '@/components/ui/extension/input-text';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable as ViewGenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import {
    useMasterLibraryEditData,
    useMasterLibraryMapping,
    useMasterLibrarySaveClassMapping
} from '@/hooks/library/useMasterLibraryMapping';
import { getMasterLibraryList, toggleDeactivateClassData, toggleMasterLibrary } from '@/server/library/masters/master_library';
import { Eye, Save, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function LibraryMapClassTab({
    selectedLibraryId,
    setSelectedLibraryId,
    onNextTab
}: {
    selectedLibraryId?: string;
    setSelectedLibraryId?: (id: string) => void;
    onNextTab?: () => void;
}) {
    const { libraries, classes: fetchedClasses, isLoading: isLibLoading, refetchAll } = useMasterLibraryMapping();
    const { fetchEditClass, isFetchingClass } = useMasterLibraryEditData();
    const saveMapping = useMasterLibrarySaveClassMapping();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLibrary, setSelectedLibrary] = useState<string>(selectedLibraryId || '');
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewLibraryData, setViewLibraryData] = useState<any>(null);
    const [mappedClassesInPopup, setMappedClassesInPopup] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPopupLoading, setIsPopupLoading] = useState(false);
    const [shouldNext, setShouldNext] = useState(false);

    useEffect(() => {
        if (selectedLibraryId) {
            setSelectedLibrary(selectedLibraryId);
        }
    }, [selectedLibraryId]);

    const handleLibraryChange = (val: string) => {
        setSelectedLibrary(val);
        setSelectedLibraryId?.(val);
    };

    // Toggle Modal State
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [toggleData, setToggleData] = useState<any>(null);
    const [isToggling, setIsToggling] = useState(false);

    const classes = (fetchedClasses || []).map((c: any) => ({
        id: c.asmcL_Id || c.ASMCL_Id || c.asmcl_id,
        name: c.asmcL_ClassName || c.asmC_ClassName || c.className || c.asmcl_classname || ''
    }));

    const filteredClasses = classes.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async (andNext = false) => {
        if (!selectedLibrary) {
            toast.error('Please select a library');
            return;
        }
        if (selectedClasses.length === 0) {
            toast.error('Please select at least one class');
            return;
        }

        setIsSaving(true);
        const payload = {
            LMAL_Id: Number(selectedLibrary),
            classlst: selectedClasses.map((id: any) => ({
                ASMCL_Id: Number(id)
            }))
        };

        try {
            const response: any = await saveMapping.mutateAsync(payload);
            if (response.returnval || response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Mapping saved successfully!');
                handleCancel();
                refetchAll();
                if (andNext && onNextTab) {
                    onNextTab();
                }
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        } catch (error) {
            toast.error('An error occurred while saving');
        } finally {
            setIsSaving(false);
            setShouldNext(false);
        }
    };

    const handleCancel = () => {
        setSelectedLibrary('');
        setSelectedClasses([]);
        setSearchTerm('');
    };

    const toggleClass = (id: number) => {
        setSelectedClasses((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const openToggleDialog = (libData: any) => {
        setToggleData(libData);
        setIsToggleModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!toggleData) return;
        setIsToggling(true);
        try {
            const response: any = await toggleMasterLibrary(Number(toggleData.lmaL_Id));
            if (response.returnval || response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Status updated successfully');
                refetchAll();
                setIsToggleModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred while toggling status');
        } finally {
            setIsToggling(false);
        }
    };

    const tableProps = useDataTableProps({
        data: libraries.map((lib: any, index: number) => ({
            ...lib,
            slNo: index + 1,
            libraryName: lib.lmaL_LibraryName
        }))
    });

    const viewColumns = [
        {
            accessorKey: 'slNo',
            header: 'SL No',
            cell: ({ row }: any) => <div>{row.index + 1}</div>,
            size: 80
        },
        {
            accessorKey: 'libraryName',
            header: 'Library Name',
            cell: ({ row }: any) => {
                const item = row.original;
                return <div>{item.lmaL_LibraryName || item.libraryName || '---'}</div>;
            }
        },
        {
            accessorKey: 'className',
            header: 'Class Name',
            cell: ({ row }: any) => {
                const item = row.original;
                return <div>{item.asmcL_ClassName || item.className || 'N/A'}</div>;
            }
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }: any) => {
                const item = row.original;
                const isActive = item.llC_ActiveFlag || item.llc_ActiveFlag || item.activeFlag || false;
                return (
                    <Button
                        variant='link'
                        className={`${isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} h-auto p-0 font-bold text-xs uppercase tracking-tighter`}
                        onClick={() => handleDeactivateClass(item)}>
                        {isActive ? 'De-Activate' : 'Activate'}
                    </Button>
                );
            }
        }
    ];

    const handleViewClasses = async (libData: any) => {
        setViewLibraryData(libData);
        setMappedClassesInPopup([]);
        setIsViewModalOpen(true);
        setIsPopupLoading(true);
        try {
            const [response, masterResponse]: [any, any] = await Promise.all([fetchEditClass(libData.lmaL_Id), getMasterLibraryList()]);

            const masterData = masterResponse?.data || masterResponse;
            const masterClasses = masterData?.classlist || masterData?.classList || [];
            const masterLibraries = masterData?.liballdata || masterData?.list || masterData?.librylist || [];

            const rawData = response?.data || response;
            const mappedData = Array.isArray(rawData)
                ? rawData
                : response?.data?.lib_class_list ||
                  response?.lib_class_list ||
                  response?.data?.mapped_list ||
                  response?.mapped_list ||
                  response?.data?.mappedclass ||
                  response?.mappedclass ||
                  response?.data?.editlist ||
                  response?.editlist ||
                  response?.data?.listclassdetails ||
                  response?.listclassdetails ||
                  response?.data?.classlist ||
                  response?.classlist ||
                  [];

            const enhancedData = mappedData.map((item: any) => {
                const libId = item.lmaL_Id || item.lmal_id || libData.lmaL_Id;
                const classId = item.asmcL_Id || item.asmC_Id || item.classId || item.id || item.asmcl_id;

                const matchedLib = masterLibraries.find((l: any) => Number(l.lmaL_Id) === Number(libId));
                const matchedClass = masterClasses.find(
                    (c: any) => Number(c.asmcL_Id || c.asmC_Id || c.classId || c.id) === Number(classId)
                );

                return {
                    ...item,
                    lmaL_LibraryName:
                        item.lmaL_LibraryName || item.libraryName || matchedLib?.lmaL_LibraryName || libData.lmaL_LibraryName || '---',
                    libraryName:
                        item.lmaL_LibraryName || item.libraryName || matchedLib?.lmaL_LibraryName || libData.lmaL_LibraryName || '---',
                    asmcL_ClassName:
                        item.asmcL_ClassName || item.className || matchedClass?.asmcL_ClassName || matchedClass?.className || 'N/A',
                    className: item.asmcL_ClassName || item.className || matchedClass?.asmcL_ClassName || matchedClass?.className || 'N/A'
                };
            });

            setMappedClassesInPopup(enhancedData);
        } catch (error) {
            console.error('Error fetching mapped classes:', error);
            toast.error('Failed to fetch mapped classes');
        } finally {
            setIsPopupLoading(false);
        }
    };

    const handleDeactivateClass = async (item: any) => {
        const LLC_Id = item.llC_Id || item.LLC_Id || item.llc_id || 0;
        const ASMCL_Id = item.asmcL_Id || item.ASMCL_Id || item.asmcl_id || 0;
        const LMAL_Id = viewLibraryData?.lmaL_Id || 0;

        if (!LLC_Id) {
            toast.error('Invalid mapping ID for deactivation');
            return;
        }

        try {
            const response: any = await toggleDeactivateClassData({
                llC_Id: Number(LLC_Id),
                lmaL_Id: Number(LMAL_Id),
                asmcL_Id: Number(ASMCL_Id)
            });

            if (response.returnval || response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Class status updated successfully');
                // Refresh modal data
                setIsPopupLoading(true);
                try {
                    const [refreshResponse, masterResponse]: [any, any] = await Promise.all([
                        fetchEditClass(LMAL_Id),
                        getMasterLibraryList()
                    ]);

                    const masterData = masterResponse?.data || masterResponse;
                    const masterClasses = masterData?.classlist || masterData?.classList || [];
                    const masterLibraries = masterData?.liballdata || masterData?.list || masterData?.librylist || [];

                    const rawRefreshData = refreshResponse?.data || refreshResponse;
                    const mappedData = Array.isArray(rawRefreshData)
                        ? rawRefreshData
                        : refreshResponse?.data?.lib_class_list ||
                          refreshResponse?.lib_class_list ||
                          refreshResponse?.data?.mapped_list ||
                          refreshResponse?.mapped_list ||
                          refreshResponse?.data?.mappedclass ||
                          refreshResponse?.mappedclass ||
                          refreshResponse?.data?.editlist ||
                          refreshResponse?.editlist ||
                          refreshResponse?.data?.listclassdetails ||
                          refreshResponse?.listclassdetails ||
                          refreshResponse?.data?.classlist ||
                          refreshResponse?.classlist ||
                          [];

                    const enhancedData = mappedData.map((item: any) => {
                        const libId = item.lmaL_Id || item.lmal_id || LMAL_Id;
                        const classId = item.asmcL_Id || item.asmC_Id || item.classId || item.id || item.asmcl_id;

                        const matchedLib = masterLibraries.find((l: any) => Number(l.lmaL_Id) === Number(libId));
                        const matchedClass = masterClasses.find(
                            (c: any) => Number(c.asmcL_Id || c.asmC_Id || c.classId || c.id) === Number(classId)
                        );

                        return {
                            ...item,
                            lmaL_LibraryName:
                                item.lmaL_LibraryName ||
                                item.libraryName ||
                                matchedLib?.lmaL_LibraryName ||
                                viewLibraryData?.libraryName ||
                                '---',
                            libraryName:
                                item.lmaL_LibraryName ||
                                item.libraryName ||
                                matchedLib?.lmaL_LibraryName ||
                                viewLibraryData?.libraryName ||
                                '---',
                            asmcL_ClassName:
                                item.asmcL_ClassName || item.className || matchedClass?.asmcL_ClassName || matchedClass?.className || 'N/A',
                            className:
                                item.asmcL_ClassName || item.className || matchedClass?.asmcL_ClassName || matchedClass?.className || 'N/A'
                        };
                    });

                    setMappedClassesInPopup(enhancedData);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsPopupLoading(false);
                }
                refetchAll();
            } else {
                toast.error(response.message || 'Failed to update class status');
            }
        } catch (error) {
            toast.error('An error occurred while updating class status');
        }
    };

    const handleEdit = async (libData: any) => {
        setSelectedLibrary(libData.lmaL_Id.toString());
        setSelectedClasses([]); // Clear first
        try {
            const response: any = await fetchEditClass(libData.lmaL_Id);
            const rawData = response?.data || response;
            const mappedData = Array.isArray(rawData)
                ? rawData
                : response?.data?.lib_class_list ||
                  response?.lib_class_list ||
                  response?.data?.mapped_list ||
                  response?.mapped_list ||
                  response?.data?.mappedclass ||
                  response?.mappedclass ||
                  response?.data?.editlist ||
                  response?.editlist ||
                  response?.data?.listclassdetails ||
                  response?.listclassdetails ||
                  response?.data?.classlist ||
                  response?.classlist ||
                  [];

            const ids = mappedData.map((m: any) => m.asmcL_Id || m.ASMCL_Id || m.asmcl_id).filter(Boolean);
            setSelectedClasses(ids);

            if (ids.length > 0) {
                toast.success('Mapping details loaded for editing');
            } else {
                toast.info('No existing mapping found for this library');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error('Failed to fetch details for editing');
        }
    };

    return (
        <div className='space-y-4'>
            <div className='mx-auto max-w-3xl'>
                <CollapsibleSection title='MASTER LIBRARY' defaultOpen variant='outline' size='md' className='shadow-lg duration-300'>
                    {/* ... (Form Content Same) ... */}
                    <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right font-medium text-sm'>
                                    Library Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select key={selectedLibrary} value={selectedLibrary} onValueChange={handleLibraryChange}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Library--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(libraries || []).map((lib: any) => (
                                                <SelectItem
                                                    key={lib.lmaL_Id || `lib-${Math.random()}`}
                                                    value={lib.lmaL_Id?.toString() || ''}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <div className='flex items-start gap-4'>
                                <label className='mt-2 min-w-[100px] text-right font-medium text-sm'>
                                    Class Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='max-h-[150px] flex-1 space-y-1 overflow-y-auto rounded-md border bg-white p-2 shadow-inner'>
                                    <div className='relative mb-2'>
                                        <Search className='absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                        <InputText
                                            placeholder='search here...'
                                            className='h-8 pl-8 text-xs'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className='flex items-center space-x-2 border-b p-1 pb-1'>
                                        <Checkbox
                                            id='all'
                                            checked={classes.length > 0 && selectedClasses.length === classes.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedClasses(classes.map((c: any) => c.id));
                                                else setSelectedClasses([]);
                                            }}
                                        />
                                        <label htmlFor='all' className='cursor-pointer font-medium text-xs'>
                                            All
                                        </label>
                                    </div>
                                    {filteredClasses.length > 0 ? (
                                        filteredClasses.map((cls: any) => (
                                            <div key={cls.id} className='flex items-center space-x-2 rounded p-1 hover:bg-muted/50'>
                                                <Checkbox
                                                    id={`cls-${cls.id}`}
                                                    checked={selectedClasses.includes(cls.id)}
                                                    onCheckedChange={() => toggleClass(cls.id)}
                                                />
                                                <label htmlFor={`cls-${cls.id}`} className='cursor-pointer text-xs'>
                                                    {cls.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='p-4 text-center text-muted-foreground text-xs italic'>No classes found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-4 flex justify-center gap-3 border-t pt-4'>
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className='h-8 bg-[#4251b1] px-6 text-xs hover:bg-[#35418e]'>
                            <Save className='mr-2 h-3.5 w-3.5' />
                            {isSaving && !shouldNext ? 'SAVING...' : 'SAVE'}
                        </Button>
                        <Button
                            onClick={() => {
                                setShouldNext(true);
                                handleSave(true);
                            }}
                            disabled={isSaving}
                            className='h-8 bg-[#4251b1] px-6 text-xs hover:bg-[#35418e]'>
                            <Save className='mr-2 h-3.5 w-3.5' />
                            {isSaving && shouldNext ? 'SAVING...' : 'SAVE & NEXT'}
                        </Button>
                        <Button onClick={handleCancel} variant='destructive' className='h-8 px-6 text-xs'>
                            <X className='mr-2 h-3.5 w-3.5' />
                            CANCEL
                        </Button>
                    </div>
                </CollapsibleSection>
            </div>

            <CollapsibleSection title='CLASS DETAILS' defaultOpen variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    isLoading={isLibLoading}
                    columns={[
                        { accessorKey: 'slNo', header: 'Sl.No.', size: 80 },
                        { accessorKey: 'libraryName', header: 'Library Name' },
                        {
                            accessorKey: 'viewClass',
                            header: 'View Class',
                            cell: ({ row }) => (
                                <Button
                                    variant='link'
                                    className='flex h-auto items-center gap-2 p-0 font-medium text-blue-600'
                                    onClick={() => handleViewClasses(row.original)}>
                                    <Eye className='h-4 w-4' />
                                    @View Classes
                                </Button>
                            )
                        },
                        {
                            id: 'actions',
                            header: 'Action',
                            size: 150,
                            cell: ({ row }) => (
                                <ActionButtons
                                    rowData={row.original}
                                    buttons={{ edit: true, toggle: true }}
                                    onEdit={handleEdit}
                                    onToggle={() => openToggleDialog(row.original)}
                                    toggleConditionKey='lmaL_ActiveFlag'
                                />
                            )
                        }
                    ]}
                    columnPinning={{ right: ['actions'] }}
                    noDataTitle='No Records Found'
                />
            </CollapsibleSection>

            {/* View Mapped Classes Modal (Same) */}
            {/* View Mapped Classes Modal */}
            {isViewModalOpen && (
                <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
                    <div className='relative mx-auto flex max-h-[80vh] w-[80%] flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl'>
                        {/* Header */}
                        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='space-y-1'>
                                <Heading
                                    title={`Library Class Mapping - ${viewLibraryData?.libraryName}`}
                                    description={`View all mapped classes for "${viewLibraryData?.libraryName}"`}
                                />
                            </div>
                            <div className='flex gap-2'>
                                <Button
                                    type='button'
                                    onClick={() => setIsViewModalOpen(false)}
                                    variant='ghost'
                                    size='sm'
                                    className='right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                            </div>
                        </div>

                        <div className='flex-1 overflow-y-auto'>
                            <ViewGenericDataTable
                                data={mappedClassesInPopup}
                                totalItems={mappedClassesInPopup.length}
                                columns={viewColumns}
                                isLoading={isPopupLoading}
                                noDataTitle='No Mapped Classes Found'
                                noDataDescription='No classes are mapped for this library.'
                                errorTitle='Error Loading Details'
                                showViewOptions={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog for Toggle */}
            <AdaptiveDialog title='Toggle Library Status' isOpen={isToggleModalOpen} onClose={() => setIsToggleModalOpen(false)}>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p className='text-slate-600 text-sm'>
                        Are you sure you want to {toggleData?.lmaL_ActiveFlag ? 'deactivate' : 'activate'} record{' '}
                        <strong>{toggleData?.libraryName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button
                        variant='secondary'
                        onClick={() => setIsToggleModalOpen(false)}
                        type='button'
                        className='h-9 px-6 text-xs'
                        disabled={isToggling}>
                        CANCEL
                    </Button>
                    <Button
                        onClick={confirmToggleStatus}
                        variant={toggleData?.lmaL_ActiveFlag ? 'destructive' : 'default'}
                        className='h-9 px-6 text-xs'
                        isLoading={isToggling}
                        disabled={isToggling}>
                        {toggleData?.lmaL_ActiveFlag ? 'DEACTIVATE' : 'ACTIVATE'}
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </div>
    );
}
