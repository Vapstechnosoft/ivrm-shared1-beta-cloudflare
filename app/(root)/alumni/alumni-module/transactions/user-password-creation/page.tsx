'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { tableSearchVariables } from '@/lib/data-table.config';
import { createUsername, getInitialData } from '@/server/alumni/user-password-creation';
import type { IClass, ISection, IStudent, IYear } from '@/types/alumni/user-password-creation';
import { KeyRound, Loader2, RefreshCcw } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { userPasswordCreationColumns } from './_components/columns';
import FilterForm from './_components/filter-form';

export default function UserPasswordCreationPage() {
    const [years, setYears] = useState<IYear[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<ISection[]>([]);
    const [students, setStudents] = useState<IStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<IStudent[]>([]);
    const [filterData, setFilterData] = useState<string>('');
    const [totalItems, setTotalItems] = useState<number>(0);
    const tableRef = useRef<DataTableRef>(null);

    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const filteredStudents = students.filter((student) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (student.studentname?.toLowerCase() || '').includes(query) ||
            (student.amst_admno?.toString().toLowerCase() || '').includes(query) ||
            (student.asmcl_classname?.toLowerCase() || '').includes(query) ||
            (student.asmc_sectionname?.toLowerCase() || '').includes(query)
        );
    });

    const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getInitialData();
            if (res.success && res.data) {
                setYears(res.data.yearList || []);
                setClasses(res.data.classlist || []);
                setSections(res.data.sectionlist || []);
            } else {
                toast.error('Failed to load initial dropdown data');
            }
        } catch (error: any) {
            console.error('fetchInitialData error:', error);
            toast.error(error.message || 'Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleFilterSuccess = (studentList: IStudent[], filterdata: string, total?: number) => {
        setStudents(studentList);
        setFilterData(filterdata);
        setTotalItems(total ?? studentList.length);
        setSelectedStudents([]);
    };

    const handleReset = () => {
        setStudents([]);
        setSelectedStudents([]);
        setFilterData('');
        setTotalItems(0);
        tableRef.current?.resetSelection();
    };

    const handleCreateUsername = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setIsCreating(true);
        try {
            const payload = {
                filterdata: filterData,
                data_array: selectedStudents.map((student) => ({
                    AMST_Id: student.amst_id
                }))
            };
            const res = await createUsername(payload);
            if (res.success) {
                await Swal.fire('Success', 'Username created successfully', 'success');
                window.location.reload();
            } else {
                await Swal.fire('Error', res.message || 'Not created', 'error');
                window.location.reload();
            }
        } catch (error: any) {
            console.error('handleCreateUsername error:', error);
            toast.error(error.message || 'Error occurred during creation');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className='container mx-auto space-y-8 p-6'>
            <Card className='w-full border-t-4 border-t-primary shadow-lg'>
                <CardHeader>
                    <CardTitle className='text-center font-bold text-2xl text-primary'>User Password Creation</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='flex h-32 items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    ) : (
                        <FilterForm
                            years={years}
                            classes={classes}
                            sections={sections}
                            onSuccess={handleFilterSuccess}
                            onReset={handleReset}
                            onLoading={setIsTableLoading}
                        />
                    )}
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card className='w-full border-t-4 border-t-primary shadow-lg'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='font-bold text-primary text-xl'>Student List ({searchQuery ? filteredStudents.length : totalItems})</CardTitle>
                        {filteredStudents.length > 0 && (
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='selectTotal'
                                    checked={selectedStudents.length === filteredStudents.length}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedStudents(filteredStudents);
                                        } else {
                                            setSelectedStudents([]);
                                            tableRef.current?.resetSelection();
                                        }
                                    }}
                                />
                                <label
                                    htmlFor='selectTotal'
                                    className='cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                    Select Total Records ({filteredStudents.length})
                                </label>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className='space-y-6 pt-2'>
                        <GenericDataTable<IStudent>
                            ref={tableRef}
                            data={paginatedStudents}
                            columns={userPasswordCreationColumns}
                            isLoading={isTableLoading}
                            showExportOptions={true}
                            onRowSelectionChange={(selected) => {
                                if (selectedStudents.length === filteredStudents.length && selected.length < paginatedStudents.length) {
                                    setSelectedStudents(selected);
                                } else if (selectedStudents.length !== filteredStudents.length) {
                                    setSelectedStudents(selected);
                                }
                            }}
                            totalItems={searchQuery ? filteredStudents.length : totalItems}
                            isPaginationRequired={true}
                            getRowId={(row) => row.amst_id.toString()}
                        />

                        {selectedStudents.length > 0 && (
                            <div className='flex justify-center gap-4 border-t pt-4'>
                                <Button
                                    onClick={handleCreateUsername}
                                    disabled={isCreating}
                                    className='h-10 w-52 bg-primary font-semibold shadow-lg transition-all hover:scale-105 hover:bg-primary/90'>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className='mr-2 h-4 w-4' /> Create Usernames
                                        </>
                                    )}
                                </Button>
                                <Button onClick={() => setSelectedStudents([])} variant='outline' className='h-10 w-32 font-semibold'>
                                    <RefreshCcw className='mr-2 h-4 w-4' /> Clear
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
