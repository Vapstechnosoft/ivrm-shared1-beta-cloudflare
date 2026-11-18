'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScheduleReportInitialDetails } from '@/hooks/admission/preadmission/useReports';
import {
    useActivePreadmissionDetails,
    useDocumentView,
    usePreadmissionDocumentsDropdown
} from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import { CheckSquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentViewColoumn } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function DocumentView(props: { searchParams: SearchParams }) {
    const searchParams = (React as any).use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const tableRef = useRef<DataTableRef>(null);

    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: initialDetails, isLoading: initialDetailsLoading, isError: initialDetailsError } = useScheduleReportInitialDetails();
    const { data: masterDocs } = usePreadmissionDocumentsDropdown();

    console.log('initialDetails', {
        data: initialDetails,
        isLoading: initialDetailsLoading,
        isError: initialDetailsError
    });

    console.log('masterDocs', {
        data: masterDocs
    });

    // Filters
    const [classId, setClassId] = useState(0);
    const [academicYearId, setAcademicYearId] = useState(0);

    // (moved) effects that depend on refetchStudents are placed after hook below

    // Table selection
    const [selectedStudents, setSelectedStudents] = useState<IPreadmissionDocumentView[]>([]);

    const {
        data: response,
        isLoading: studentsLoading,
        error,
        refetch: refetchStudents
    } = useDocumentView(academicYearId ?? 0, classId, searchParams);

    // Auto-select first academic year when options load so details populate
    useEffect(() => {
        if ((academicYearId ?? 0) === 0 && initialDetails?.year && initialDetails.year.length > 0) {
            setAcademicYearId(Number(initialDetails.year[0].asmaY_Id));
        }
    }, [initialDetails]);

    // When academic year changes, ensure students data is fetched immediately
    useEffect(() => {
        if (academicYearId && typeof refetchStudents === 'function') {
            refetchStudents();
        }
    }, [academicYearId, refetchStudents]);

    const mergedData = useMemo(() => {
        if (!response?.data) return [];

        const { studentList, documentList } = response.data as any;
        const students = Array.isArray(studentList) ? studentList : studentList?.$values || [];
        const docListGlobal = Array.isArray(documentList) ? documentList : documentList?.$values || [];
        const masterDocsList = masterDocs?.data || [];

        return students.map((student: any) => {
            const studentId = Number(student.pasr_id || student.pasR_Id || 0);

            // Filter documents for this student
            let studentDocs = docListGlobal.filter((doc: any) => {
                const docStudentId = Number(doc.pasr_id || doc.pasR_Id || 0);
                return docStudentId === studentId && studentId !== 0;
            });

            // If global doclist is empty for this student, check student-level properties
            if (studentDocs.length === 0) {
                studentDocs = student.doclist || student.documentList || student.$values || [];
            }

            // Ensure document names and paths are handled
            studentDocs = studentDocs.map((doc: any) => {
                const masterDoc = masterDocsList.find((md) => Number(md.amsmD_Id) === Number(doc.amsmD_Id));
                return {
                    ...doc,
                    amsmD_DocumentName: doc.amsmD_DocumentName || masterDoc?.amsmD_DocumentName || 'Document',
                    document_Path: doc.document_Path || doc.document_path || doc.path || ''
                };
            });

            // Merge details if present to make photo access easier
            const details = student.student_details || student.details || {};

            return {
                ...student,
                ...details,
                doclist: studentDocs
            };
        });
    }, [response, masterDocs]);

    const tableProps = {
        ...useDataTableProps(response),
        data: mergedData
    };

    const handleSelectStudent = (selectedRows: IPreadmissionDocumentView[]) => {
        setSelectedStudents(selectedRows);
    };

    useEffect(() => {
        if (activePreadmission?.data) {
            setAcademicYearId(activePreadmission.data.asmaY_Id ?? 0);
        }
    }, [activePreadmission]);

    const handleFilterChange = (filterType: 'class' | 'academic_year', value: number) => {
        if (filterType === 'class') {
            setClassId(value);
        } else {
            setAcademicYearId(value);
        }

        // Reset to page 1 when filter changes
        const params = new URLSearchParams();
        if (searchParams) {
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.set(key, String(value));
                }
            });
        }
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className='min-h-screen'>
            {/* Filters Header */}
            <div className='mb-3 flex w-fit flex-col gap-4 rounded-xl border p-4 shadow-xl'>
                <div className='flex flex-wrap justify-start gap-6'>
                    {/* Academic Year Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='academic-year' className='mb-1 font-semibold'>
                            Academic Year
                        </Label>
                        {/* <Select
                            value={academicYearId !== 0 ? String(academicYearId) : undefined}
                            onValueChange={(value) => setAcademicYearId(Number(value))}> */}
                        <Select
                            onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                            value={academicYearId !== 0 ? academicYearId?.toString() || undefined : undefined}>
                            <SelectTrigger id='academic-year'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {initialDetailsLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : initialDetailsError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    initialDetails?.year?.map((item) => (
                                        <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
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
                            Class
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                handleFilterChange('class', Number(value));
                            }}
                            value={classId?.toString() || undefined}>
                            <SelectTrigger id='class'>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='0'>All</SelectItem>
                                {initialDetailsLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : initialDetailsError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    initialDetails?.classname?.map((item) => (
                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {selectedStudents.length > 0 && (
                        <div className='flex w-full justify-end'>
                            <Button variant='default' className='h-8 w-fit gap-2'>
                                <CheckSquare className='h-4 w-4' />
                                Update Status ({selectedStudents.length})
                            </Button>
                        </div>
                    )}

                    <GenericDataTable<IPreadmissionDocumentView>
                        {...tableProps}
                        ref={tableRef}
                        columns={DocumentViewColoumn}
                        isLoading={studentsLoading}
                        error={error}
                        showViewOptions={false}
                        loadingMessage='Loading preadmission applications...'
                        noDataTitle='No Data Found'
                        noDataDescription='No preadmission applications found.'
                        errorTitle='Error Loading Preadmission Applications'
                        onRowSelectionChange={handleSelectStudent}
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
