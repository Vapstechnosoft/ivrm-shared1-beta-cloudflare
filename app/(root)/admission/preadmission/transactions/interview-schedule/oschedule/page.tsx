'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOralTestScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import type { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { FileSpreadsheet, Plus, Printer, Search, X } from 'lucide-react';
import OralTestScheduleForm from './_components/add-form';
import { oralTestScheduleColumns } from './_components/columns';
import ParticipantsModal from './_components/participants-modal';
import StudentListModal from './_components/student-list-modal';
import { parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import React from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function OralTestSchedulePage() {
    return (
        <FormProvider<IOralTestSchedule>>
            <OralTestScheduleContent />
        </FormProvider>
    );
}

function OralTestScheduleContent() {
    const { data: response, isLoading, error, refetch } = useOralTestScheduleDetails() as any;
    const {
        openAddForm,
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        selectedRow,
        isDetailsViewOpen,
        closeDetailsView,
        isMappedviewOpen,
        closeMappedview,
        isToggleFormOpen,
        closeToggleForm
    } = useFormContext<IOralTestSchedule>();

    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [localSearch, setLocalSearch] = React.useState(searchQuery || '');

    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Oral Test Schedule',
        pageStyle: `
          @page { size: portrait; margin: 15mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .overflow-auto { overflow: visible !important; }
            .overflow-hidden { overflow: visible !important; }
            * { color: black !important; }
          }
        `
    });

    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        const parts = time.split(':');
        if (parts.length < 2) return time;
        const hours = Number.parseInt(parts[0]);
        const minutes = Number.parseInt(parts[1]);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${ampm}`;
    };

    const filteredData = React.useMemo(() => {
        if (!response?.oralTestSchedule) return [];
        if (!searchQuery) return response.oralTestSchedule;

        const lowerQuery = searchQuery.toLowerCase();
        return response.oralTestSchedule.filter((item: any) => {
            // Filter by the visible columns in the grid
            return (
                (item.paotS_ScheduleName && String(item.paotS_ScheduleName).toLowerCase().includes(lowerQuery)) ||
                (item.paotS_ScheduleDate && String(item.paotS_ScheduleDate).toLowerCase().includes(lowerQuery)) ||
                (item.paotS_ScheduleTime && String(item.paotS_ScheduleTime).toLowerCase().includes(lowerQuery)) ||
                (item.paotS_ScheduleTimeTo && String(item.paotS_ScheduleTimeTo).toLowerCase().includes(lowerQuery))
            );
        });
    }, [response?.oralTestSchedule, searchQuery]);

    const exportToExcel = () => {
        try {
            if (!filteredData || filteredData.length === 0) {
                toast.error('No records found to export');
                return;
            }

            const excelData = filteredData.map((row: any, index: number) => {
                return {
                    'SL.NO': index + 1,
                    'SCHEDULED NAME': row.paotS_ScheduleName || 'N/A',
                    'CREATED DATE': row.createdDate ? new Date(row.createdDate).toLocaleDateString('en-GB') : 'N/A',
                    'SCHEDULED DATE': row.paotS_ScheduleDate ? new Date(row.paotS_ScheduleDate).toLocaleDateString('en-GB') : 'N/A',
                    'FROM': formatTime(row.paotS_ScheduleTime),
                    'TO': formatTime(row.paotS_ScheduleTimeTo)
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedules');
            XLSX.writeFile(workbook, 'OralTestSchedule.xlsx');
            toast.success('Excel exported successfully');
        } catch (error: any) {
            toast.error('Failed to export excel');
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(localSearch || null), 300);
        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery]);

    const tableProps = useDataTableProps({ oralTestSchedule: filteredData }, { dataKey: 'oralTestSchedule' });

    return (
        <div className='container space-y-4 py-6'>
            <div className='no-print flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='font-bold text-3xl text-blue-800 tracking-tight'>Oral Test/Interaction Schedule</h1>
                    <p className='text-muted-foreground'>Manage and schedule oral tests for preadmission students.</p>
                </div>
                <Button
                    onClick={openAddForm}
                    disabled={isAddFormOpen || isEditFormOpen}
                    className='shadow-lg transition-all hover:shadow-xl'>
                    <Plus className='mr-2 h-4 w-4' /> Add Schedule
                </Button>
            </div>

            {/* Add/Edit Form Section */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Schedule'
                        description='Define a new oral test schedule and assign students.'
                        defaultOpen={true}
                        variant='outline'
                        rightElement={
                            <Button variant='ghost' size='sm' onClick={closeAddForm}>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                        }>
                        <OralTestScheduleForm
                            onSuccess={() => {
                                closeAddForm();
                                refetch();
                            }}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Schedule'
                        description={`Updating schedule: ${selectedRow.paotS_ScheduleName}`}
                        defaultOpen={true}
                        variant='outline'
                        rightElement={
                            <Button variant='ghost' size='sm' onClick={closeEditForm}>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                        }>
                        <OralTestScheduleForm
                            onSuccess={() => {
                                closeEditForm();
                                refetch();
                            }}
                            initialData={selectedRow}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Data Table Section */}
            <CollapsibleSection title='Existing Schedules' defaultOpen={true} className='shadow-md'>
                <div className='flex flex-col'>
                    {/* Toolbar Row 1 */}
                    <div className='no-print flex items-center justify-between border-b bg-slate-50 px-4 py-2'>
                        <span className='font-bold text-blue-800 text-xs uppercase'>Oral Test\\Interaction Scheduled List</span>
                        <div className='flex items-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='onlyScheduled' />
                                <Label htmlFor='onlyScheduled' className='font-bold text-[10px]'>
                                    Only Scheduled List
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='printBrake' defaultChecked />
                                <Label htmlFor='printBrake' className='font-bold text-[10px]'>
                                    Print Page Brake
                                </Label>
                            </div>
                            <div className='flex items-center gap-2 border-l pl-4'>
                                <Button variant='ghost' size='icon' className='h-6 w-6 text-slate-700' onClick={handlePrint}>
                                    <Printer className='h-4 w-4' />
                                </Button>
                                <Button variant='ghost' size='icon' className='h-6 w-6 text-green-700' onClick={exportToExcel}>
                                    <FileSpreadsheet className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar Row 2 */}
                    <div className='no-print flex items-center justify-between border-b bg-white px-4 py-2'>
                        <div className='flex items-center gap-12'>
                            <div className='flex items-center gap-2 font-bold text-[10px] uppercase'>
                                Grid Records :{' '}
                                <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-500 px-1 text-white'>
                                    {filteredData?.length || 0}
                                </span>
                            </div>
                            <div className='flex items-center gap-2 font-bold text-[10px] uppercase'>
                                Scheduled Students:{' '}
                                <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-500 px-1 text-white'>
                                    {filteredData?.reduce((acc: number, curr: any) => acc + (curr.ocount || 0), 0) || 0}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-center gap-8'>
                            <RadioGroup defaultValue='12' className='flex items-center gap-4'>
                                <div className='flex items-center space-x-1.5'>
                                    <RadioGroupItem value='12' id='r1' className='h-3 w-3' />
                                    <Label htmlFor='r1' className='font-bold text-[10px]'>
                                        12 Hours
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-1.5'>
                                    <RadioGroupItem value='24' id='r2' className='h-3 w-3' />
                                    <Label htmlFor='r2' className='font-bold text-[10px]'>
                                        24 Hours
                                    </Label>
                                </div>
                            </RadioGroup>

                            <div className='relative'>
                                <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3 w-3 text-slate-400' />
                                <Input
                                    placeholder='search here...'
                                    className='h-7 w-48 border-slate-300 bg-slate-50 pl-8 text-[10px]'
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div ref={printRef} className='print:block print:w-full print:overflow-visible'>
                        <div className='no-print [&_tbody_tr:nth-child(even)]:bg-slate-50/50 [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th]:border-slate-200 [&_thead_tr_th]:border-r [&_thead_tr_th]:py-3 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-black [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black'>
                            <GenericDataTable<IOralTestSchedule>
                                {...tableProps}
                                columns={oralTestScheduleColumns}
                                isLoading={isLoading}
                                error={error}
                                isSearchRequired={false}
                                noDataTitle='No Schedules Found'
                                noDataDescription='Create your first oral test schedule to see it here.'
                            />
                        </div>
                        
                        <div className='print-only hidden print:block overflow-x-auto'>
                            <table className='w-full border-collapse border border-gray-300 text-center text-[10pt]'>
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>SL. No.</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Scheduled Name</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Created Date</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>Scheduled Date</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>From</th>
                                        <th className='whitespace-nowrap border border-gray-300 bg-gray-50 p-2 font-bold'>To</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(filteredData || []).length > 0 ? (
                                        filteredData.map((row: any, rowIndex: number) => (
                                            <tr key={rowIndex}>
                                                <td className='border border-gray-300 p-2'>{rowIndex + 1}</td>
                                                <td className='border border-gray-300 p-2'>{row.paotS_ScheduleName || 'N/A'}</td>
                                                <td className='border border-gray-300 p-2'>{row.createdDate ? new Date(row.createdDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                                <td className='border border-gray-300 p-2'>{row.paotS_ScheduleDate ? new Date(row.paotS_ScheduleDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                                <td className='border border-gray-300 p-2'>{formatTime(row.paotS_ScheduleTime)}</td>
                                                <td className='border border-gray-300 p-2'>{formatTime(row.paotS_ScheduleTimeTo)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className='border border-gray-300 p-10 text-center font-medium text-muted-foreground'>
                                                No Records Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Modals */}
            {isDetailsViewOpen && selectedRow && (
                <StudentListModal rowData={selectedRow} isOpen={isDetailsViewOpen} onClose={closeDetailsView} />
            )}

            {isMappedviewOpen && selectedRow && (
                <ParticipantsModal rowData={selectedRow} isOpen={isMappedviewOpen} onClose={closeMappedview} />
            )}

            {/* Remarks Modal - reused ToggleForm for this */}
            {isToggleFormOpen && selectedRow && (
                <StudentListModal rowData={selectedRow} isOpen={isToggleFormOpen} onClose={closeToggleForm} isRemarks={true} />
            )}
        </div>
    );
}
