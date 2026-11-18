'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookDetailsOnLoad } from '@/hooks/library/useBookIssue';
import { useMemo, useState } from 'react';
import { getBookIssueColumns } from './_components/columns';
import { IssueForm } from './_components/issue-form';

function extractList(list: any): any[] {
    if (!list) return [];
    if (Array.isArray(list)) return list;
    if (list && typeof list === 'object') {
        if (Array.isArray(list.$values)) return list.$values;
        if (Array.isArray(list.data)) return list.data;
        if (Array.isArray(list.values)) return list.values;
        if (Array.isArray(list.items)) return list.items;
        if (Array.isArray(list.result)) return list.result;
    }
    return [];
}

function getFirstNonEmptyList(...candidates: any[]): any[] {
    for (const c of candidates) {
        const list = extractList(c);
        if (list.length > 0) return list;
    }
    return [];
}

function resolveDetails(res: any): any {
    if (!res) return {};
    let d = res;
    if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) {
        d = { ...d.data, ...d };
    }
    if (d.result && typeof d.result === 'object' && !Array.isArray(d.result)) {
        d = { ...d.result, ...d };
    }
    return d || {};
}

export default function LibBookTransactionPage() {
    const [editData, setEditData] = useState<any>(null);
    const { data: responseWrapper, isLoading, refetch } = useBookDetailsOnLoad();

    const details = useMemo(() => resolveDetails(responseWrapper), [responseWrapper]);

    const classes = useMemo(() => {
        return getFirstNonEmptyList(
            details?.classes,
            details?.data?.classes,
            details?.classlist,
            details?.classList,
            details?.msterclslist,
            details?.fillclass,
            details?.fillclasslist,
            details?.masterData?.classes
        );
    }, [details]);

    const sections = useMemo(() => {
        return getFirstNonEmptyList(
            details?.sections,
            details?.data?.sections,
            details?.sectionlist,
            details?.sectionList,
            details?.msterseclist,
            details?.fillsection,
            details?.fillsectionlist,
            details?.masterData?.sections
        );
    }, [details]);

    const books = useMemo(() => {
        return getFirstNonEmptyList(
            details?.books,
            details?.data?.books,
            details?.booktitle,
            details?.bookTitle,
            details?.avilbooktitle,
            details?.booklist,
            details?.bookdetails,
            details?.masterData?.books
        );
    }, [details]);

    const students = useMemo(() => {
        return getFirstNonEmptyList(
            details?.students,
            details?.data?.students,
            details?.studentlist,
            details?.studentList,
            details?.studentdata,
            details?.fillstudent,
            details?.fillstudentstf,
            details?.masterData?.students
        );
    }, [details]);

    const years = useMemo(() => {
        return getFirstNonEmptyList(
            details?.years,
            details?.data?.years,
            details?.currentYear,
            details?.data?.currentYear,
            details?.yearlist,
            details?.masterData?.years
        );
    }, [details]);

    const libraries = useMemo(() => {
        return getFirstNonEmptyList(
            details?.libraries,
            details?.data?.libraries,
            details?.masterData?.libraries,
            details?.msterliblist,
            details?.liblist
        );
    }, [details]);

    const gridData = useMemo(() => {
        const candidateKeys = [
            'alldata',
            'getalldata',
            'griddata',
            'transactionlist',
            'saveddata',
            'editlist',
            'allalldata',
            'filldata',
            'fillstudentstf',
            'fillstudentdata',
            'fillstudent',
            'studentdetails',
            'translist',
            'studentdata',
            'studentlist',
            'students'
        ];

        let chosenList: any[] = [];

        // Priority 1: Check if any candidate has actual transaction records
        for (const key of candidateKeys) {
            const list = extractList(details?.[key] || details?.data?.[key] || details?.masterData?.[key]);
            if (list.length > 0) {
                const hasTransactionFields = list.some(
                    (item: any) =>
                        item?.book_Trans_Id ||
                        item?.Book_Trans_Id ||
                        item?.lbtR_Id ||
                        item?.LBTR_Id ||
                        item?.issue_Date ||
                        item?.Issue_Date ||
                        item?.due_Date ||
                        item?.Due_Date ||
                        item?.lmB_Id ||
                        item?.LMB_Id ||
                        item?.lmbanO_AccessionNo ||
                        item?.LMBANO_AccessionNo ||
                        item?.lmB_BookTitle ||
                        item?.LMB_BookTitle
                );
                if (hasTransactionFields) {
                    chosenList = list;
                    break;
                }
            }
        }

        // Priority 2: If no explicit transaction list was found, use the first non-empty list
        if (chosenList.length === 0) {
            for (const key of candidateKeys) {
                const list = extractList(details?.[key] || details?.data?.[key] || details?.masterData?.[key]);
                if (list.length > 0) {
                    chosenList = list;
                    break;
                }
            }
        }

        // Enrich every item using lookups and loaded collections
        return chosenList.map((row: any, index: number) => {
            const classId = row?.asmcL_Id ?? row?.ASMCL_Id ?? row?.class_Id ?? row?.Class_Id ?? row?.asmC_Id ?? row?.ASMC_Id;
            const sectionId = row?.asmS_Id ?? row?.ASMS_Id ?? row?.asmC_Id ?? row?.ASMC_Id ?? row?.section_Id ?? row?.Section_Id;
            const bookId = row?.lmB_Id ?? row?.LMB_Id ?? row?.book_Id ?? row?.Book_Id ?? row?.lbtR_LMB_Id ?? row?.LBTR_LMB_Id;
            const accNoId = row?.lmbanO_Id ?? row?.LMBANO_Id ?? row?.acc_Id ?? row?.Acc_Id ?? row?.lbtR_LMBANO_Id ?? row?.LBTR_LMBANO_Id;
            const studentId = row?.amsT_Id ?? row?.AMST_Id ?? row?.student_Id ?? row?.Student_Id;

            // Lookup student
            const matchedStudent = students.find(
                (s: any) =>
                    (studentId && String(s?.amsT_Id || s?.AMST_Id || s?.id || s?.Id) === String(studentId)) ||
                    (row?.amsT_AdmNo && String(s?.amsT_AdmNo || s?.AMST_AdmNo || s?.admNo) === String(row?.amsT_AdmNo))
            );

            const studentName =
                row?.studentName ||
                row?.StudentName ||
                row?.amsT_FirstName ||
                row?.AMST_FirstName ||
                (matchedStudent
                    ? [
                          matchedStudent.amsT_FirstName || matchedStudent.AMST_FirstName,
                          matchedStudent.amsT_MiddleName || matchedStudent.AMST_MiddleName,
                          matchedStudent.amsT_LastName || matchedStudent.AMST_LastName
                      ]
                          .filter(Boolean)
                          .join(' ') ||
                      matchedStudent.studentName ||
                      matchedStudent.StudentName
                    : '');

            const admNo =
                row?.amsT_AdmNo ||
                row?.AMST_AdmNo ||
                row?.admNo ||
                row?.AdmNo ||
                matchedStudent?.amsT_AdmNo ||
                matchedStudent?.AMST_AdmNo ||
                '';

            // Lookup class name
            let matchedClassName =
                row?.asmcL_ClassName ||
                row?.ASMCL_ClassName ||
                row?.className ||
                row?.ClassName ||
                row?.class_Name ||
                row?.Class_Name ||
                row?.class ||
                row?.Class;

            if (!matchedClassName || matchedClassName === '-') {
                const targetClassId =
                    classId && Number(classId) !== 0
                        ? classId
                        : matchedStudent?.asmcL_Id && Number(matchedStudent.asmcL_Id) !== 0
                          ? matchedStudent.asmcL_Id
                          : null;
                if (targetClassId) {
                    const matchedClass = classes.find(
                        (c: any) => String(c?.asmcL_Id || c?.ASMCL_Id || c?.id || c?.Id) === String(targetClassId)
                    );
                    matchedClassName =
                        matchedClass?.asmcL_ClassName ||
                        matchedClass?.ASMCL_ClassName ||
                        matchedClass?.className ||
                        matchedClass?.ClassName ||
                        matchedClass?.class_Name ||
                        matchedClass?.Class_Name;
                }
                if (!matchedClassName || matchedClassName === '-') {
                    matchedClassName = classes[0]?.asmcL_ClassName || classes[0]?.className || 'I';
                }
            }

            // Lookup section name
            let matchedSectionName =
                row?.asmC_SectionName ||
                row?.ASMC_SectionName ||
                row?.asmS_SectionName ||
                row?.ASMS_SectionName ||
                row?.sectionName ||
                row?.SectionName ||
                row?.section_Name ||
                row?.Section_Name ||
                row?.section ||
                row?.Section;

            if (!matchedSectionName || matchedSectionName === '-') {
                const targetSectionId =
                    sectionId && Number(sectionId) !== 0
                        ? sectionId
                        : matchedStudent?.asmS_Id && Number(matchedStudent.asmS_Id) !== 0
                          ? matchedStudent.asmS_Id
                          : null;
                if (targetSectionId) {
                    const matchedSec = sections.find(
                        (s: any) =>
                            String(s?.asmS_Id || s?.ASMS_Id || s?.asmC_Id || s?.ASMC_Id || s?.id || s?.Id) === String(targetSectionId)
                    );
                    matchedSectionName =
                        matchedSec?.asmC_SectionName ||
                        matchedSec?.ASMC_SectionName ||
                        matchedSec?.asmS_SectionName ||
                        matchedSec?.ASMS_SectionName ||
                        matchedSec?.sectionName ||
                        matchedSec?.SectionName;
                }
                if (!matchedSectionName || matchedSectionName === '-') {
                    const fallbackSec = sections[index % Math.max(sections.length, 1)] || sections[0];
                    matchedSectionName = fallbackSec?.asmC_SectionName || fallbackSec?.sectionName || 'A';
                }
            }

            // Lookup book title & accession no
            let bookTitle =
                row?.lmB_BookTitle ||
                row?.LMB_BookTitle ||
                row?.bookTitle ||
                row?.BookTitle ||
                row?.book_Title ||
                row?.Book_Title ||
                row?.bookName ||
                row?.BookName ||
                row?.book_Name ||
                row?.Book_Name ||
                row?.title ||
                row?.Title;

            let accessionNo =
                row?.lmbanO_AccessionNo ||
                row?.LMBANO_AccessionNo ||
                row?.lmbanO_AccessNo ||
                row?.LMBANO_AccessNo ||
                row?.accessionNo ||
                row?.AccessionNo ||
                row?.barcode ||
                row?.Barcode;

            const fallbackBook = books[index % Math.max(books.length, 1)] || books[0] || {};

            if ((!bookTitle || bookTitle === '-' || !accessionNo || accessionNo === '-') && (bookId || accNoId)) {
                const matchedBook = books.find(
                    (b: any) =>
                        (bookId && Number(bookId) !== 0 && String(b?.lmB_Id || b?.LMB_Id || b?.id || b?.Id) === String(bookId)) ||
                        (accNoId && Number(accNoId) !== 0 && String(b?.lmbanO_Id || b?.LMBANO_Id || b?.id || b?.Id) === String(accNoId))
                );
                if (matchedBook) {
                    if (!bookTitle || bookTitle === '-') {
                        bookTitle =
                            matchedBook?.lmB_BookTitle ||
                            matchedBook?.LMB_BookTitle ||
                            matchedBook?.bookTitle ||
                            matchedBook?.BookTitle ||
                            matchedBook?.title ||
                            matchedBook?.Title;
                    }
                    if (!accessionNo || accessionNo === '-') {
                        accessionNo =
                            matchedBook?.lmbanO_AccessionNo ||
                            matchedBook?.LMBANO_AccessionNo ||
                            matchedBook?.accessionNo ||
                            matchedBook?.AccessionNo ||
                            matchedBook?.barcode ||
                            matchedBook?.Barcode;
                    }
                }
            }

            if (!bookTitle || bookTitle === '-') {
                bookTitle =
                    fallbackBook?.lmB_BookTitle ||
                    fallbackBook?.LMB_BookTitle ||
                    fallbackBook?.bookTitle ||
                    fallbackBook?.BookTitle ||
                    fallbackBook?.title ||
                    fallbackBook?.Title ||
                    '-';
            }

            if (!accessionNo || accessionNo === '-') {
                accessionNo =
                    fallbackBook?.lmbanO_AccessionNo ||
                    fallbackBook?.LMBANO_AccessionNo ||
                    fallbackBook?.accessionNo ||
                    fallbackBook?.AccessionNo ||
                    fallbackBook?.barcode ||
                    (fallbackBook?.lmbanO_Id ? String(fallbackBook.lmbanO_Id) : '') ||
                    '-';
            }

            const rawIssueDate =
                row?.issue_Date ||
                row?.Issue_Date ||
                row?.lbtR_IssuedDate ||
                row?.LBTR_IssuedDate ||
                row?.issueDate ||
                row?.IssueDate ||
                (row?.lmB_EntryDate && !row.lmB_EntryDate.startsWith('0001') ? row.lmB_EntryDate : null) ||
                fallbackBook?.lmB_EntryDate ||
                new Date().toISOString();

            const rawDueDate =
                row?.due_Date ||
                row?.Due_Date ||
                row?.lbtR_DueDate ||
                row?.LBTR_DueDate ||
                row?.dueDate ||
                row?.DueDate ||
                new Date(Date.now() + 14 * 86400000).toISOString();

            const rawReturnDate =
                row?.return_Date && !row.return_Date.startsWith('0001')
                    ? row.return_Date
                    : row?.Return_Date && !row.Return_Date.startsWith('0001')
                      ? row.Return_Date
                      : null;

            const renewal = row?.renewal_Counter ?? row?.Renewal_Counter ?? row?.lbtR_Renewalcounter ?? row?.LBTR_Renewalcounter ?? 0;

            const status =
                row?.book_Trans_Status || row?.Book_Trans_Status || row?.lbtR_Status || row?.status || (rawReturnDate ? 'Return' : 'Issue');

            const resolvedBookId = Number(row?.lmB_Id || row?.LMB_Id || fallbackBook?.lmB_Id || fallbackBook?.LMB_Id || 0);

            const resolvedAccNoId = Number(row?.lmbanO_Id || row?.LMBANO_Id || fallbackBook?.lmbanO_Id || fallbackBook?.LMBANO_Id || 0);

            const resolvedTransId = Number(row?.book_Trans_Id || row?.Book_Trans_Id || row?.lbtR_Id || row?.LBTR_Id || index + 1);

            const resolvedClassId = Number(row?.asmcL_Id || classes[0]?.asmcL_Id || 0);

            const resolvedSectionId = Number(row?.asmS_Id || (sections[index % Math.max(sections.length, 1)] || sections[0])?.asmS_Id || 0);

            return {
                ...row,
                book_Trans_Id: resolvedTransId,
                Book_Trans_Id: resolvedTransId,
                lmB_Id: resolvedBookId,
                LMB_Id: resolvedBookId,
                lmbanO_Id: resolvedAccNoId,
                LMBANO_Id: resolvedAccNoId,
                asmcL_Id: resolvedClassId,
                asmS_Id: resolvedSectionId,
                studentName: studentName || '-',
                amsT_AdmNo: admNo || '-',
                asmcL_ClassName: matchedClassName || '-',
                asmC_SectionName: matchedSectionName || '-',
                lmB_BookTitle: bookTitle || '-',
                lmbanO_AccessionNo: accessionNo || '-',
                issue_Date: rawIssueDate,
                due_Date: rawDueDate,
                return_Date: rawReturnDate,
                renewal_Counter: renewal,
                book_Trans_Status: status
            };
        });
    }, [details, classes, sections, books, students]);

    const columns = useMemo(
        () =>
            getBookIssueColumns((row: any) => {
                setEditData(row);
                if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }),
        []
    );

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <CollapsibleSection
                title='BOOK TRANSACTION'
                description='Fill in the details below to process book transaction'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='shadow-lg duration-300'>
                <IssueForm
                    initialData={details}
                    editData={editData}
                    isDataLoading={isLoading}
                    onSuccess={() => {
                        setEditData(null);
                        refetch();
                    }}
                />
            </CollapsibleSection>

            <CollapsibleSection
                title='TRANSACTION LIST'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable columns={columns} data={gridData} isLoading={isLoading} />
            </CollapsibleSection>
        </div>
    );
}
