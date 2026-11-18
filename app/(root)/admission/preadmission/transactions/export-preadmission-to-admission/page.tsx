'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useExportPreadmissionStudentList, usePreadmissionClassDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { exportPreadmissionToAdmission } from '@/server/admission/preadmission/transactions/export_preadmission';
import type { IPreadmissionApplicationList } from '@/types/admission/preadmission/transactions';
import { CheckSquare, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { exportPreadmissionToAdmissionColumns } from './_components/columns';
import { ExportPreadmissionToAdmissionDialog } from './_components/export-preadmission-to-admission-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ExportPreadmissionToAdmissionPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const tableRef = useRef<DataTableRef>(null);

    const handleResetSelection = () => {
        tableRef.current?.resetSelection();
    };

    // Dropdowns
    const { data: academicYearData, isLoading: isAcademicYearLoading } = useAcademicYearDropdown();
    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown();

    // Form State
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);

    // Search State
    const [searchAcademicYearId, setSearchAcademicYearId] = useState<number | null>(null);
    const [searchClassId, setSearchClassId] = useState<number | null>(null);
    const [isSearched, setIsSearched] = useState(false);

    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<IPreadmissionApplicationList[]>([]);

    // Automatically select the first academic year if available
    useEffect(() => {
        if (academicYearData?.data && academicYearData.data.length > 0 && !academicYearId) {
            setAcademicYearId(academicYearData.data[0].asmaY_Id);
        }
    }, [academicYearData, academicYearId]);

    const {
        data: response,
        isLoading,
        error,
        refetch: refetchAdmissionStudents
    } = useExportPreadmissionStudentList(searchAcademicYearId ?? 0, searchClassId, searchParams);

    const tableProps = useDataTableProps(response);

    const handleSearch = () => {
        if (!academicYearId) {
            toast.error('Please select an Academic Year');
            return;
        }
        if (classId === null) {
            toast.error('Please select a Class');
            return;
        }

        setSearchAcademicYearId(academicYearId);
        setSearchClassId(classId);
        setIsSearched(true);
        setSelectedStudents([]);
        handleResetSelection();

        const params = new URLSearchParams(searchParams as any);
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const onUpdateAdmissionStatusClose = () => {
        refetchAdmissionStudents();
        setIsStatusDialogOpen(false);
        setSelectedStudents([]);
        handleResetSelection();
    };

    const handleExportPreadmissionToAdmission = async (updates: Array<{ pasr_id: number }>) => {
        if (!searchAcademicYearId) return;

        try {
            const response = await exportPreadmissionToAdmission(searchAcademicYearId, updates);
            if (response.success === true) {
                toast.success(response.message);
                onUpdateAdmissionStatusClose();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(`Error updating status ${error}`);
        }
    };

    const handleSelectStudent = (selectedRows: IPreadmissionApplicationList[]) => {
        setSelectedStudents(selectedRows);
    };

    const handleDeselectStudent = (pasrId: number) => {
        setSelectedStudents((prev) => prev.filter((student) => student.pasr_id !== pasrId));
    };

    return (
        <div className='min-h-screen'>
            {/* Header */}
            <CollapsibleSection defaultOpen={true} title='Transfer Preadmission To Admission' className='mb-4 shadow-xl'>
                <div className='flex flex-wrap justify-center gap-6 p-4'>
                    {/* Academic Year Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='academic-year' className='mb-1 font-semibold'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Select onValueChange={(value) => setAcademicYearId(Number(value))} value={academicYearId?.toString() || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {isAcademicYearLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : (
                                    academicYearData?.data?.map((item) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='class' className='mb-1 font-semibold'>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Select onValueChange={(value) => setClassId(Number(value))} value={classId?.toString() || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={0} value={'0'}>
                                    All Class
                                </SelectItem>
                                {preadmissionClassLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : preadmissionClassError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    preadmissionClass?.data?.map((item) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className='flex justify-center gap-4 p-4 pt-0'>
                    <Button onClick={handleSearch} className='gap-2' variant='default'>
                        <Search className='h-4 w-4' />
                        Search
                    </Button>
                    <Button onClick={handleCancel} className='gap-2' variant='destructive'>
                        <X className='h-4 w-4' />
                        Cancel
                    </Button>
                </div>
            </CollapsibleSection>

            {isSearched && (
                <div className='container space-y-4 p-1'>
                    {/* Data Table Section */}
                    <CollapsibleSection
                        title='List Of Students'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        {selectedStudents.length > 0 && (
                            <div className='flex w-full justify-end'>
                                <Button onClick={() => setIsStatusDialogOpen(true)} variant='default' className='h-8 w-fit gap-2'>
                                    <CheckSquare className='h-4 w-4' />
                                    Export to Admission ({selectedStudents.length})
                                </Button>
                            </div>
                        )}
                        <GenericDataTable<IPreadmissionApplicationList>
                            {...tableProps}
                            ref={tableRef}
                            columns={exportPreadmissionToAdmissionColumns}
                            isLoading={isLoading}
                            error={error}
                            loadingMessage='Loading confirmed preadmissions...'
                            noDataTitle='No Data Found'
                            noDataDescription='No confirmed preadmissions found.'
                            errorTitle='Error Loading confirmed preadmissions'
                            onRowSelectionChange={handleSelectStudent}
                        />
                    </CollapsibleSection>
                </div>
            )}
            <ExportPreadmissionToAdmissionDialog
                isOpen={isStatusDialogOpen}
                onClose={onUpdateAdmissionStatusClose}
                selectedStudents={selectedStudents}
                onSubmit={handleExportPreadmissionToAdmission}
                onDeselectStudent={handleDeselectStudent}
            />
        </div>
    );
}
