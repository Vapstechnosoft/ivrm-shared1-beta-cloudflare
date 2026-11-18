'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import {
    useActivePreadmissionDetails,
    useDocumentView,
    usePreadmissionDocumentsDropdown
} from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionDocumentView } from '@/types/admission/preadmission/transactions';
import React, { useState, useMemo } from 'react';
import { documentViewReportColumns } from './_components/columns';
import FilterForm from './_components/filter-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function DocumentViewReportPage(props: { searchParams: SearchParams }) {
    const searchParams = (React as any).use(props.searchParams);
    const [filterPayload, setFilterPayload] = useState<any>(null);
    const [isSearched, setIsSearched] = useState(false);

    const { data: response, isLoading, error } = useDocumentView(filterPayload?.asmaY_Id ?? 0, filterPayload?.asmcL_Id ?? 0, searchParams);

    const { data: activeDetails } = useActivePreadmissionDetails();
    const activeData = activeDetails?.data;

    const { data: masterDocs } = usePreadmissionDocumentsDropdown();

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

            return {
                ...student,
                doclist: studentDocs,
                selected_asmaY_Id: filterPayload?.asmaY_Id || 0,
                selected_asmcL_Id: filterPayload?.asmcL_Id || 0
            };
        });
    }, [response, masterDocs]);

    const tableProps = {
        ...useDataTableProps(response),
        data: mergedData
    };

    return (
        <FormProvider<IPreadmissionDocumentView>>
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    {/* {activeData && (
                        <div className='bg-muted/50 border rounded-lg p-4 flex flex-wrap gap-6 items-center justify-between shadow-sm'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-primary/10 rounded-full'>
                                    <Calendar className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                    <p className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>Active Academic Year</p>
                                    <p className='text-lg font-bold text-foreground'>{activeData.asmaY_Year}</p>
                                </div>
                            </div>

                            <div className='flex gap-8'>
                                <div className='flex flex-col'>
                                    <p className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>Preadmission Start Date</p>
                                    <p className='font-semibold text-foreground'>
                                        {activeData.asmaY_PreAdm_F_Date ? format(new Date(activeData.asmaY_PreAdm_F_Date), 'dd-MM-yyyy') : 'N/A'}
                                    </p>
                                </div>
                                <div className='flex flex-col border-l pl-8'>
                                    <p className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>Preadmission End Date</p>
                                    <p className='font-semibold text-foreground'>
                                        {activeData.asmaY_PreAdm_T_Date ? format(new Date(activeData.asmaY_PreAdm_T_Date), 'dd-MM-yyyy') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )} */}
                    <CollapsibleSection
                        title='Document View Report'
                        description='Filter students to view their documents and application forms'
                        defaultOpen={true}
                        variant='outline'
                        size='md'>
                        <FilterForm
                            onFilterChange={(payload, reset) => {
                                if (reset) {
                                    setIsSearched(false);
                                    setFilterPayload(null);
                                } else {
                                    setFilterPayload(payload);
                                    setIsSearched(true);
                                }
                            }}
                        />
                    </CollapsibleSection>

                    {isSearched && (
                        <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                            <GenericDataTable<IPreadmissionDocumentView>
                                {...tableProps}
                                columns={documentViewReportColumns}
                                isLoading={isLoading}
                                error={error}
                                showViewOptions={false}
                                isSearchRequired={true}
                                isPaginationRequired={true}
                                loadingMessage='Loading students...'
                                noDataTitle='No Students Found'
                                noDataDescription='Try adjusting your filters'
                            />
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}
