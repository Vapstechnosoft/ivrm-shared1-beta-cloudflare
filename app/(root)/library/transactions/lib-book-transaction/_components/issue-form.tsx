'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookDetailsOnLoad, useIssueBook, useRenewBook, useReturnBook } from '@/hooks/library/useBookIssue';
import { format } from 'date-fns';
import { Loader2, RefreshCw, RotateCcw, Save, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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

function extractPayload(raw: any) {
    if (!raw) return {};
    let target = raw;
    if (target.data && typeof target.data === 'object' && !Array.isArray(target.data)) {
        target = { ...target.data, ...target };
    }
    if (target.result && typeof target.result === 'object' && !Array.isArray(target.result)) {
        target = { ...target.result, ...target };
    }
    return target || {};
}

function getFirstNonEmptyList(...candidates: any[]): any[] {
    for (const c of candidates) {
        const list = extractList(c);
        if (list.length > 0) return list;
    }
    return [];
}

export const IssueForm = ({
    initialData: externalInitialData,
    editData,
    isDataLoading: externalLoading,
    onSuccess
}: {
    initialData?: any;
    editData?: any;
    isDataLoading?: boolean;
    onSuccess?: () => void;
}) => {
    const { data: fetchedWrapper, isLoading: isFetchedLoading } = useBookDetailsOnLoad();

    const rawData = useMemo(() => {
        return extractPayload(externalInitialData || fetchedWrapper);
    }, [externalInitialData, fetchedWrapper]);

    const isLoading = externalLoading ?? isFetchedLoading;

    const masterData = rawData?.masterData || {};

    // Deduplicate lists to avoid React key / Select issues
    const libraries = useMemo(() => {
        const list = getFirstNonEmptyList(
            rawData?.libraries,
            rawData?.data?.libraries,
            masterData?.libraries,
            rawData?.msterliblist,
            masterData?.msterliblist,
            rawData?.liblist
        );
        return Array.from(
            new Map(
                list
                    .filter((item: any) => item?.lmaL_Id || item?.lmA_Id || item?.LMAL_Id || item?.LMA_Id || item?.id || item?.Id)
                    .map((item: any) => {
                        const id = item?.lmaL_Id ?? item?.lmA_Id ?? item?.LMAL_Id ?? item?.LMA_Id ?? item?.id ?? item?.Id;
                        const name = item?.lmaL_LibraryName || item?.LMAL_LibraryName || item?.libraryName || item?.LibraryName || '';
                        return [String(id), { ...item, lmaL_Id: id, lmaL_LibraryName: name }];
                    })
            ).values()
        );
    }, [rawData, masterData]);

    const years = useMemo(() => {
        const list = getFirstNonEmptyList(
            rawData?.years,
            rawData?.data?.years,
            rawData?.currentYear,
            rawData?.data?.currentYear,
            masterData?.years,
            rawData?.yearlist,
            masterData?.yearlist
        );
        return Array.from(
            new Map(
                list
                    .filter((item: any) => item?.asmaY_Id || item?.ASMAY_Id || item?.id || item?.Id)
                    .map((item: any) => {
                        const id = item?.asmaY_Id ?? item?.ASMAY_Id ?? item?.id ?? item?.Id;
                        const year = item?.asmaY_Year || item?.ASMAY_Year || item?.year || item?.Year || '';
                        return [String(id), { ...item, asmaY_Id: id, asmaY_Year: year }];
                    })
            ).values()
        );
    }, [rawData, masterData]);

    const classes = useMemo(() => {
        const list = getFirstNonEmptyList(
            rawData?.classes,
            rawData?.data?.classes,
            rawData?.classlist,
            masterData?.classlist,
            rawData?.classList,
            masterData?.classList,
            rawData?.msterclslist,
            rawData?.fillclass,
            masterData?.classes
        );
        return Array.from(
            new Map(
                list
                    .filter((item: any) => item?.asmcL_Id || item?.ASMCL_Id || item?.id || item?.Id)
                    .map((item: any) => {
                        const id = item?.asmcL_Id ?? item?.ASMCL_Id ?? item?.id ?? item?.Id;
                        const name =
                            item?.asmcL_ClassName ||
                            item?.ASMCL_ClassName ||
                            item?.className ||
                            item?.ClassName ||
                            item?.class_Name ||
                            '';
                        return [String(id), { ...item, asmcL_Id: id, asmcL_ClassName: name }];
                    })
            ).values()
        );
    }, [rawData, masterData]);

    const sections = useMemo(() => {
        const list = getFirstNonEmptyList(
            rawData?.sections,
            rawData?.data?.sections,
            rawData?.sectionlist,
            masterData?.sectionlist,
            rawData?.sectionList,
            masterData?.sectionList,
            rawData?.msterseclist,
            rawData?.fillsection,
            masterData?.sections
        );
        return Array.from(
            new Map(
                list
                    .filter((item: any) => item?.asmS_Id || item?.ASMS_Id || item?.asmC_Id || item?.ASMC_Id || item?.id || item?.Id)
                    .map((item: any) => {
                        const id = item?.asmS_Id ?? item?.ASMS_Id ?? item?.asmC_Id ?? item?.ASMC_Id ?? item?.id ?? item?.Id;
                        const name =
                            item?.asmC_SectionName ||
                            item?.ASMC_SectionName ||
                            item?.asmS_SectionName ||
                            item?.ASMS_SectionName ||
                            item?.sectionName ||
                            item?.SectionName ||
                            '';
                        return [String(id), { ...item, asmS_Id: id, asmC_SectionName: name }];
                    })
            ).values()
        );
    }, [rawData, masterData]);

    const books = useMemo(() => {
        const list = getFirstNonEmptyList(
            rawData?.books,
            rawData?.data?.books,
            rawData?.booktitle,
            rawData?.avilbooktitle,
            rawData?.booklist,
            rawData?.bookdetails,
            masterData?.books,
            masterData?.booktitle,
            masterData?.avilbooktitle,
            masterData?.booklist
        );
        return Array.from(
            new Map(
                list
                    .filter((item: any) => item?.lmB_Id || item?.LMB_Id || item?.id || item?.Id)
                    .map((item: any) => {
                        const id = item?.lmB_Id ?? item?.LMB_Id ?? item?.id ?? item?.Id;
                        const title =
                            item?.lmB_BookTitle ||
                            item?.LMB_BookTitle ||
                            item?.bookTitle ||
                            item?.BookTitle ||
                            item?.book_Title ||
                            item?.title ||
                            '';
                        const accNo =
                            item?.lmbanO_AccessionNo ||
                            item?.LMBANO_AccessionNo ||
                            item?.lmbanO_Accessionno ||
                            item?.lmbanO_AccessNo ||
                            item?.LMBANO_AccessNo ||
                            item?.accessionNo ||
                            item?.AccessionNo ||
                            item?.accession_No ||
                            item?.accNo ||
                            item?.barcode ||
                            (item?.lmbanO_Id || item?.LMBANO_Id ? String(item.lmbanO_Id || item.LMBANO_Id) : '');
                        return [String(id), { ...item, lmB_Id: id, lmB_BookTitle: title, lmbanO_AccessionNo: accNo }];
                    })
            ).values()
        );
    }, [rawData, masterData]);

    const initialStudents = useMemo(() => {
        const list = getFirstNonEmptyList(
            rawData?.students,
            rawData?.data?.students,
            rawData?.studentlist,
            rawData?.studentdata,
            rawData?.fillstudent,
            masterData?.students,
            masterData?.studentlist,
            masterData?.studentdata
        );
        return Array.from(
            new Map(
                list
                    .filter((item: any) => item?.amsT_Id || item?.AMST_Id || item?.id || item?.Id)
                    .map((item: any) => {
                        const id = item?.amsT_Id ?? item?.AMST_Id ?? item?.id ?? item?.Id;
                        const fullName = [
                            item?.amsT_FirstName || item?.AMST_FirstName,
                            item?.amsT_MiddleName || item?.AMST_MiddleName,
                            item?.amsT_LastName || item?.AMST_LastName
                        ].filter(Boolean).join(' ') || item?.studentName || item?.student_Name || '';
                        const admNo = item?.amsT_AdmNo || item?.AMST_AdmNo || item?.admNo || '';

                        return [
                            String(id),
                            {
                                ...item,
                                amsT_Id: id,
                                studentName: fullName,
                                amsT_FirstName: item?.amsT_FirstName || item?.AMST_FirstName || fullName,
                                amsT_AdmNo: admNo
                            }
                        ];
                    })
            ).values()
        );
    }, [rawData, masterData]);

    const currentYear = useMemo(() => {
        const list = getFirstNonEmptyList(rawData?.currentYear, rawData?.data?.currentYear, masterData?.currentYear);
        return Array.isArray(list) ? list : [];
    }, [rawData, masterData]);

    const defaultLibraryId = useMemo(() => {
        if (editData?.lmaL_Id) return String(editData.lmaL_Id);
        if (masterData?.libraryId) return String(masterData.libraryId);
        if (libraries.length > 0) return String(libraries[0]?.lmaL_Id || libraries[0]?.lmA_Id || '');
        return '';
    }, [editData?.lmaL_Id, masterData?.libraryId, libraries]);

    const defaultYearId = useMemo(() => {
        if (editData?.asmaY_Id) return String(editData.asmaY_Id);
        if (currentYear[0]?.asmaY_Id) return String(currentYear[0].asmaY_Id);
        if (years.length > 0) return String(years[0]?.asmaY_Id || '');
        return '';
    }, [editData?.asmaY_Id, currentYear, years]);

    const defaultClassId = useMemo(() => {
        if (editData?.asmcL_Id) return String(editData.asmcL_Id);
        if (classes.length > 0) return String(classes[0]?.asmcL_Id || '');
        return '';
    }, [editData?.asmcL_Id, classes]);

    const defaultSectionId = useMemo(() => {
        if (editData?.asmS_Id) return String(editData.asmS_Id);
        if (sections.length > 0) return String(sections[0]?.asmS_Id || '');
        return '';
    }, [editData?.asmS_Id, sections]);

    const defaultBookId = useMemo(() => {
        if (editData?.lmB_Id) return String(editData.lmB_Id);
        if (books.length > 0) return String(books[0]?.lmB_Id || '');
        return '';
    }, [editData?.lmB_Id, books]);

    const defaultBarcode = useMemo(() => {
        if (editData?.lmbanO_AccessionNo) return String(editData.lmbanO_AccessionNo);
        if (books.length > 0) return String(books[0]?.lmbanO_AccessionNo || '');
        return '';
    }, [editData?.lmbanO_AccessionNo, books]);

    const defaultStudentId = useMemo(() => {
        if (editData?.amsT_Id) return String(editData.amsT_Id);
        if (initialStudents.length > 0) return String(initialStudents[0]?.amsT_Id || '');
        return '';
    }, [editData?.amsT_Id, initialStudents]);

    const issueBookMutation = useIssueBook();
    const returnBookMutation = useReturnBook();
    const renewBookMutation = useRenewBook();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue
    } = useForm({
        values: {
            libraryName: defaultLibraryId,
            memberType: (editData?.memberType as string) || 'STUDENT',
            materialType: (editData?.materialType as string) || 'BOOK',
            transactionType: (editData?.transactionType as string) || 'ISSUE',
            academicYear: defaultYearId,
            class: defaultClassId,
            section: defaultSectionId,
            barcode: defaultBarcode,
            bookTitle: defaultBookId,
            studentName: defaultStudentId,
            bookAvailability: false,
            sendPushNotification: false
        },
        resetOptions: {
            keepDirtyValues: true
        }
    });

    // Synchronize form values whenever default data or editData arrives
    useEffect(() => {
        if (editData) {
            reset({
                libraryName: String(editData.lmaL_Id || editData.lmA_Id || defaultLibraryId),
                memberType: (editData.memberType as string) || 'STUDENT',
                materialType: (editData.materialType as string) || 'BOOK',
                transactionType: (editData.transactionType as string) || 'ISSUE',
                academicYear: String(editData.asmaY_Id || defaultYearId),
                class: String(editData.asmcL_Id || defaultClassId),
                section: String(editData.asmS_Id || defaultSectionId),
                barcode: String(editData.lmbanO_AccessionNo || defaultBarcode),
                bookTitle: String(editData.lmB_Id || defaultBookId),
                studentName: String(editData.amsT_Id || defaultStudentId),
                bookAvailability: false,
                sendPushNotification: false
            });
        } else if (defaultLibraryId || defaultYearId || defaultClassId || defaultSectionId || defaultBookId || defaultStudentId) {
            reset({
                libraryName: defaultLibraryId,
                memberType: 'STUDENT',
                materialType: 'BOOK',
                transactionType: 'ISSUE',
                academicYear: defaultYearId,
                class: defaultClassId,
                section: defaultSectionId,
                barcode: defaultBarcode,
                bookTitle: defaultBookId,
                studentName: defaultStudentId,
                bookAvailability: false,
                sendPushNotification: false
            });
        }
    }, [
        editData,
        defaultLibraryId,
        defaultYearId,
        defaultClassId,
        defaultSectionId,
        defaultBookId,
        defaultBarcode,
        defaultStudentId,
        reset
    ]);

    const barcodeValue = watch('barcode');
    const bookTitleValue = watch('bookTitle');
    const studentNameValue = watch('studentName');
    const classValue = watch('class');
    const sectionValue = watch('section');
    const academicYearValue = watch('academicYear');

    const studentsToDisplay = useMemo(() => {
        let list = initialStudents;
        if (!Array.isArray(list) || list.length === 0) return [];

        if (academicYearValue) {
            const yearFiltered = list.filter((s: any) => !s.asmaY_Id || s.asmaY_Id === 0 || String(s.asmaY_Id) === String(academicYearValue));
            if (yearFiltered.length > 0) list = yearFiltered;
        }

        if (classValue && sectionValue) {
            const filtered = list.filter(
                (s: any) =>
                    (!s.asmcL_Id || s.asmcL_Id === 0 || String(s.asmcL_Id) === String(classValue)) &&
                    (!s.asmS_Id || s.asmS_Id === 0 || String(s.asmS_Id) === String(sectionValue))
            );
            if (filtered.length > 0) return filtered;
        }
        return list;
    }, [initialStudents, academicYearValue, classValue, sectionValue]);

    // Handle Barcode matching -> sets bookTitle
    const handleBarcodeChange = (val: string) => {
        setValue('barcode', val, { shouldDirty: true });
        if (val && books.length > 0) {
            const matchedBook = books.find(
                (b: any) =>
                    String(b.lmbanO_AccessionNo || '').trim().toLowerCase() === String(val).trim().toLowerCase() ||
                    String(b.lmB_Id) === String(val).trim()
            );
            if (matchedBook && String(matchedBook.lmB_Id) !== String(bookTitleValue)) {
                setValue('bookTitle', String(matchedBook.lmB_Id), { shouldDirty: true });
            }
        }
    };

    // Handle Book Title change -> sets barcode
    const handleBookTitleChange = (val: string) => {
        setValue('bookTitle', val, { shouldDirty: true });
        const book = books.find((b: any) => String(b.lmB_Id) === String(val));
        if (book?.lmbanO_AccessionNo) {
            setValue('barcode', String(book.lmbanO_AccessionNo), { shouldDirty: true });
        }
    };

    // Selected Book details for right preview card
    const selectedBook = useMemo(() => {
        const id = bookTitleValue || defaultBookId;
        const barcode = barcodeValue || defaultBarcode;
        if (id) {
            const match = books.find((b: any) => String(b.lmB_Id) === String(id));
            if (match) return match;
        }
        if (barcode) {
            const match = books.find((b: any) =>
                String(b.lmbanO_AccessionNo || '').trim().toLowerCase() === String(barcode).trim().toLowerCase()
            );
            if (match) return match;
        }
        return books[0] || null;
    }, [books, bookTitleValue, barcodeValue, defaultBookId, defaultBarcode]);

    // Selected Student details for right preview card
    const selectedStudent = useMemo(() => {
        const id = studentNameValue || defaultStudentId;
        if (id) {
            const match =
                studentsToDisplay.find((s: any) => String(s.amsT_Id) === String(id)) ||
                initialStudents.find((s: any) => String(s.amsT_Id) === String(id));
            if (match) return match;
        }
        return studentsToDisplay[0] || initialStudents[0] || null;
    }, [studentNameValue, studentsToDisplay, initialStudents, defaultStudentId]);

    // Selected Class Name
    const selectedClassName =
        classes.find((c: any) => String(c.asmcL_Id) === String(classValue || defaultClassId))?.asmcL_ClassName ||
        selectedStudent?.asmcL_ClassName ||
        (classes.length > 0 ? classes[0]?.asmcL_ClassName : '') ||
        '';

    // Selected Section Name
    const selectedSectionName =
        sections.find((s: any) => String(s.asmS_Id) === String(sectionValue || defaultSectionId))?.asmC_SectionName ||
        selectedStudent?.asmC_SectionName ||
        (sections.length > 0 ? sections[0]?.asmC_SectionName : '') ||
        '';

    // Formatted student full name
    const studentFullName = selectedStudent
        ? [selectedStudent.amsT_FirstName, selectedStudent.amsT_MiddleName, selectedStudent.amsT_LastName]
              .filter(Boolean)
              .join(' ') || selectedStudent.studentName || selectedStudent.amsT_FirstName || ''
        : '';

    const onSubmit = async (values: any) => {
        try {
            await issueBookMutation.mutateAsync({
                Book_Trans_Id: editData ? Number(editData?.book_Trans_Id || editData?.Book_Trans_Id || editData?.lbtR_Id || editData?.LBTR_Id || 0) : undefined,
                LMAL_Id: Number(values.libraryName || defaultLibraryId),
                ASMAY_Id: Number(values.academicYear || defaultYearId),
                ASMCL_Id: Number(values.class || defaultClassId),
                ASMS_Id: Number(values.section || defaultSectionId),
                AMST_Id: Number(values.studentName || defaultStudentId),
                LMB_Id: Number(values.bookTitle || defaultBookId),
                booktype: values.transactionType === 'ISSUE' ? 'issue' : 'ref',
                issuertype: values.memberType === 'STUDENT' ? 'std' : 'staff',
                bookcat_type: values.materialType === 'BOOK' ? 'book' : 'nonbook',
                send_sms: values.sendPushNotification,
                ...(values.barcode ? { LMBANO_AccessionNo: values.barcode } : {})
            } as any);
            reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleReturn = async (e: React.MouseEvent) => {
        e.preventDefault();
        const values = watch();
        const transId = Number(
            editData?.book_Trans_Id ??
            editData?.Book_Trans_Id ??
            editData?.lbtR_Id ??
            editData?.LBTR_Id ??
            editData?.trans_Id ??
            editData?.Trans_Id ??
            0
        );
        const bookId = Number(
            values.bookTitle ||
            editData?.lmB_Id ||
            editData?.LMB_Id ||
            selectedBook?.lmB_Id ||
            defaultBookId ||
            0
        );
        const accNoId = Number(
            editData?.lmbanO_Id ||
            editData?.LMBANO_Id ||
            selectedBook?.lmbanO_Id ||
            selectedBook?.LMBANO_Id ||
            0
        );
        const fodmId = Number(
            editData?.fodM_Id ||
            editData?.FODM_Id ||
            0
        );
        const fineCollected = Number(
            editData?.lbtR_FineCollected ??
            editData?.LBTR_FineCollected ??
            editData?.fine_Amount ??
            editData?.finecollected ??
            0
        );
        const totalFine = Number(
            editData?.totalFine ??
            editData?.TotalFine ??
            editData?.fine_Amount ??
            editData?.Fine_Amount ??
            0
        );

        let booktype = 'issue';
        const rawBookType = String(values.transactionType || editData?.booktype || editData?.bookType || '').toLowerCase();
        if (rawBookType.includes('ref')) {
            booktype = 'ref';
        }

        let issuertype = 'std';
        const rawMemberType = String(values.memberType || editData?.issuertype || editData?.memberType || '').toLowerCase();
        if (rawMemberType.includes('stf') || rawMemberType.includes('staff')) {
            issuertype = 'stf';
        } else if (rawMemberType.includes('dep')) {
            issuertype = 'dep';
        } else if (rawMemberType.includes('gst') || rawMemberType.includes('guest')) {
            issuertype = 'gst';
        }

        let bookcatType = 'book';
        const rawCatType = String(values.materialType || editData?.bookcat_type || editData?.materialType || '').toLowerCase();
        if (rawCatType.includes('non')) {
            bookcatType = 'nonbook';
        }

        const rawDueDate = editData?.due_Date || editData?.Due_Date || editData?.dueDate || new Date().toISOString();
        const dueDate = typeof rawDueDate === 'string' && !rawDueDate.startsWith('0001') ? rawDueDate : new Date().toISOString();
        const returnDate = new Date().toISOString();

        try {
            await returnBookMutation.mutateAsync({
                book_Trans_Id: transId,
                lmbanO_Id: accNoId,
                lmB_Id: bookId,
                due_Date: dueDate,
                return_Date: returnDate,
                booktype: booktype,
                issuertype: issuertype,
                bookcat_type: bookcatType,
                lbtR_FineCollected: fineCollected,
                fodM_Id: fodmId,
                returnval: true,
                totalFine: totalFine,
                msg: ''
            });
            reset();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error returning book:', err);
        }
    };

    const handleRenew = async (e: React.MouseEvent) => {
        e.preventDefault();
        const values = watch();
        const transId = Number(
            editData?.book_Trans_Id ||
            editData?.Book_Trans_Id ||
            editData?.lbtR_Id ||
            editData?.LBTR_Id ||
            0
        );
        const bookId = Number(values.bookTitle || editData?.lmB_Id || defaultBookId || 0);
        const accNoId = Number(editData?.lmbanO_Id || selectedBook?.lmbanO_Id || 0);

        try {
            await renewBookMutation.mutateAsync({
                Book_Trans_Id: transId,
                LMBANO_Id: accNoId,
                LMB_Id: bookId,
                Issue_Date: editData?.issue_Date || editData?.Issue_Date || new Date().toISOString(),
                Due_Date: editData?.due_Date || editData?.Due_Date || new Date().toISOString(),
                Return_Date: new Date().toISOString(),
                Max_No_Renewals: Number(editData?.renewal_Counter ?? editData?.lbtR_Renewalcounter ?? 3),
                issuertype: values.memberType === 'STUDENT' ? 'std' : 'stf',
                bookcat_type: values.materialType === 'BOOK' ? 'book' : 'nonbook',
                LBTR_FineCollected: Number(editData?.fine_Amount || editData?.finecollected || 0)
            });
            reset();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error renewing book:', err);
        }
    };

    const formatDateSafe = (dateStr?: string) => {
        if (!dateStr || dateStr.startsWith('0001')) return '-';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch {
            return dateStr.split('T')[0] || dateStr;
        }
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center gap-2 p-12 text-slate-500'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Loading transaction details...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='bg-white p-6'>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Library Name */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[120px]'>
                            Library Name:<span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='libraryName'
                            render={({ field }) => {
                                const selectedLib = libraries.find(
                                    (item: any) => String(item.lmaL_Id || item.lmA_Id) === String(field.value || defaultLibraryId)
                                );
                                const selectedLibName = selectedLib ? (selectedLib.lmaL_LibraryName || selectedLib.lmA_LibraryName) : undefined;
                                return (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ? String(field.value) : defaultLibraryId ? String(defaultLibraryId) : undefined}>
                                        <SelectTrigger className='h-8 flex-1 text-xs'>
                                            <SelectValue placeholder='Select Library'>
                                                {selectedLibName}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {libraries.map((item: any) => (
                                                <SelectItem
                                                    key={item.lmaL_Id || item.lmA_Id}
                                                    value={String(item.lmaL_Id || item.lmA_Id)}>
                                                    {item.lmaL_LibraryName || item.lmA_LibraryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                    </div>

                    {/* Radio Settings */}
                    <div className='space-y-2 divide-y rounded-md border bg-slate-50/30 p-2'>
                        <Controller
                            control={control}
                            name='memberType'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value || 'STUDENT'}
                                    className='flex flex-wrap justify-center gap-8 py-1'>
                                    {['STUDENT', 'STAFF', 'DEPARTMENT', 'GUEST'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`m-${opt}`} />
                                            <Label htmlFor={`m-${opt}`} className='cursor-pointer font-semibold text-xs'>
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name='materialType'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value || 'BOOK'}
                                    className='flex flex-wrap justify-center gap-8 py-2'>
                                    {['BOOK', 'NON-BOOK'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`mat-${opt}`} />
                                            <Label htmlFor={`mat-${opt}`} className='cursor-pointer font-semibold text-xs'>
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name='transactionType'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value || 'ISSUE'}
                                    className='flex flex-wrap justify-center gap-8 py-2'>
                                    {['ISSUE', 'REFERENCE'].map((opt) => (
                                        <div key={opt} className='flex items-center space-x-2'>
                                            <RadioGroupItem value={opt} id={`t-${opt}`} />
                                            <Label htmlFor={`t-${opt}`} className='cursor-pointer font-semibold text-xs'>
                                                {opt}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {/* Academic Fields */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='academicYear'
                                render={({ field }) => {
                                    const selectedYear = years.find((item: any) => String(item.asmaY_Id) === String(field.value || defaultYearId));
                                    const selectedYearName = selectedYear ? (selectedYear.asmaY_Year || selectedYear.year) : undefined;
                                    return (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : defaultYearId ? String(defaultYearId) : undefined}>
                                            <SelectTrigger className='h-8 flex-1 text-xs'>
                                                <SelectValue placeholder='Select Academic Year'>
                                                    {selectedYearName}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Class:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='class'
                                render={({ field }) => {
                                    const selectedCls = classes.find((item: any) => String(item.asmcL_Id) === String(field.value || defaultClassId));
                                    const selectedClsName = selectedCls ? (selectedCls.asmcL_ClassName || selectedCls.className) : undefined;
                                    return (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : defaultClassId ? String(defaultClassId) : undefined}>
                                            <SelectTrigger className='h-8 flex-1 text-xs'>
                                                <SelectValue placeholder='Select Class'>
                                                    {selectedClsName}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((item: any) => (
                                                    <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Section:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='section'
                                render={({ field }) => {
                                    const selectedSec = sections.find((item: any) => String(item.asmS_Id || item.asmC_Id) === String(field.value || defaultSectionId));
                                    const selectedSecName = selectedSec ? (selectedSec.asmC_SectionName || selectedSec.sectionName) : undefined;
                                    return (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : defaultSectionId ? String(defaultSectionId) : undefined}>
                                            <SelectTrigger className='h-8 flex-1 text-xs'>
                                                <SelectValue placeholder='Select Section'>
                                                    {selectedSecName}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((item: any) => (
                                                    <SelectItem key={item.asmS_Id || item.asmC_Id} value={String(item.asmS_Id || item.asmC_Id)}>
                                                        {item.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        </div>
                    </div>

                    {/* Book & Student Selectors */}
                    <div className='mt-4 space-y-3'>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px] uppercase'>BARCODE:</Label>
                            <Controller
                                control={control}
                                name='barcode'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value !== undefined && field.value !== '' ? field.value : defaultBarcode}
                                        onChange={(e) => handleBarcodeChange(e.target.value)}
                                        placeholder='Barcode Scanner'
                                        className='h-8 text-xs'
                                    />
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Book Title:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='bookTitle'
                                render={({ field }) => {
                                    const selectedB = books.find((item: any) => String(item.lmB_Id) === String(field.value || defaultBookId));
                                    const selectedBText = selectedB
                                        ? `${selectedB.lmB_BookTitle || selectedB.bookTitle || ''}${selectedB.lmbanO_AccessionNo ? ` (Acc No: ${selectedB.lmbanO_AccessionNo})` : ''}`
                                        : undefined;
                                    return (
                                        <Select
                                            onValueChange={handleBookTitleChange}
                                            value={field.value ? String(field.value) : defaultBookId ? String(defaultBookId) : undefined}>
                                            <SelectTrigger className='h-8 flex-1 text-xs'>
                                                <SelectValue placeholder='Select Book Title'>
                                                    {selectedBText}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {books.map((item: any) => (
                                                    <SelectItem key={item.lmB_Id} value={String(item.lmB_Id)}>
                                                        {item.lmB_BookTitle || item.bookTitle} {item.lmbanO_AccessionNo ? `(Acc No: ${item.lmbanO_AccessionNo})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[120px]'>
                                Student Name:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='studentName'
                                render={({ field }) => {
                                    const selectedS = studentsToDisplay.find(
                                        (item: any) => String(item.amsT_Id) === String(field.value || defaultStudentId)
                                    ) || initialStudents.find(
                                        (item: any) => String(item.amsT_Id) === String(field.value || defaultStudentId)
                                    );
                                    const fullName = selectedS
                                        ? [selectedS.amsT_FirstName, selectedS.amsT_MiddleName, selectedS.amsT_LastName].filter(Boolean).join(' ') || selectedS.studentName || selectedS.amsT_FirstName
                                        : '';
                                    const admNo = selectedS?.amsT_AdmNo || selectedS?.AMST_AdmNo || selectedS?.admNo || '';
                                    const selectedSText = selectedS ? `${fullName}${admNo ? ` (Adm No: ${admNo})` : ''}` : undefined;

                                    return (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : defaultStudentId ? String(defaultStudentId) : undefined}>
                                            <SelectTrigger className='h-8 flex-1 text-xs'>
                                                <SelectValue placeholder='Select Student Name'>
                                                    {selectedSText}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studentsToDisplay.map((item: any) => {
                                                    const name = [item.amsT_FirstName, item.amsT_MiddleName, item.amsT_LastName]
                                                        .filter(Boolean)
                                                        .join(' ') || item.studentName || item.amsT_FirstName;
                                                    const sAdmNo = item.amsT_AdmNo || item.AMST_AdmNo || item.admNo || '';
                                                    return (
                                                        <SelectItem key={item.amsT_Id} value={String(item.amsT_Id)}>
                                                            {name} {sAdmNo ? `(Adm No: ${sAdmNo})` : ''}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        </div>
                        <div className='flex items-center gap-2 pt-2'>
                            <Controller
                                control={control}
                                name='bookAvailability'
                                render={({ field }) => (
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='avail' />
                                )}
                            />
                            <Label htmlFor='avail' className='cursor-pointer font-semibold text-xs'>
                                BOOK AVAILABILITY
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-6'>
                    {/* BOOK DETAILS CARD */}
                    <div className='relative rounded-md border bg-slate-50/10 p-4 pt-6'>
                        <div className='-mt-3 absolute top-0 right-0 left-0 flex justify-center'>
                            <span className='bg-white px-2 font-semibold text-muted-foreground text-xs tracking-wider'>
                                BOOK DETAILS
                            </span>
                        </div>

                        <div className='mt-2 grid grid-cols-2 gap-x-4 gap-y-3 font-medium text-slate-700 text-xs'>
                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Title</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_BookTitle || '-'}</span>
                            </div>
                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Entry Date</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>
                                    {formatDateSafe(selectedBook?.lmB_EntryDate)}
                                </span>
                            </div>

                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Vol. No.</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_VolNo || '-'}</span>
                            </div>
                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Class No</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>{selectedBook?.lmB_ClassNo || '-'}</span>
                            </div>

                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Price</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>
                                    {selectedBook?.lmB_Price !== undefined && selectedBook?.lmB_Price !== null
                                        ? `₹${selectedBook.lmB_Price}`
                                        : '-'}
                                </span>
                            </div>
                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Category Name</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>
                                    {selectedBook?.categoryName ||
                                        selectedBook?.lmC_CategoryName ||
                                        (selectedBook?.lmC_Id ? `Category ${selectedBook.lmC_Id}` : '-')}
                                </span>
                            </div>

                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Call No</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>
                                    {selectedBook?.mB_Call_No || selectedBook?.lmB_CallNo || '-'}
                                </span>
                            </div>
                            <div className='col-span-1' />

                            <div className='flex'>
                                <span className='w-24 text-slate-500'>Author's Name</span>
                                <span>:</span>
                                <span className='ml-2 font-bold text-slate-800'>
                                    {selectedBook?.authorName || selectedBook?.lmB_AuthorName || '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* STUDENT DETAILS CARD */}
                    <div className='relative rounded-md border bg-slate-50/10 p-4 pt-10'>
                        <div className='-mt-3 absolute top-0 right-0 left-0 flex justify-center'>
                            <span className='bg-white px-2 font-semibold text-muted-foreground text-xs tracking-wider'>
                                STUDENT DETAILS
                            </span>
                        </div>

                        <div className='absolute top-2 right-4 w-40'>
                            <Input
                                placeholder='Scan QR Code'
                                className='h-7 border-blue-200 text-blue-500 text-xs placeholder:text-blue-300'
                            />
                        </div>

                        <div className='mt-2 flex'>
                            <div className='flex-1 space-y-3 font-medium text-slate-700 text-xs'>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Student Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>{studentFullName || selectedStudent?.studentName || '-'}</span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Registration No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>
                                        {selectedStudent?.amsT_RegistrationNo || selectedStudent?.amsT_AdmNo || '-'}
                                    </span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Admission No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amsT_AdmNo || '-'}</span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Roll No</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>{selectedStudent?.amaY_RollNo || selectedStudent?.amsT_RollNo || '-'}</span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Class Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>{selectedClassName || selectedStudent?.asmcL_ClassName || '-'}</span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Section Name</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>{selectedSectionName || selectedStudent?.asmC_SectionName || '-'}</span>
                                </div>
                                <div className='flex'>
                                    <span className='w-28 text-slate-500'>Parent's No.</span>
                                    <span>:</span>
                                    <span className='ml-2 font-bold text-slate-800'>
                                        {selectedStudent?.mobileNo ||
                                            selectedStudent?.amsT_MobileNo ||
                                            selectedStudent?.amsT_FatherMobleNo ||
                                            '-'}
                                    </span>
                                </div>
                            </div>
                            <div className='flex h-28 w-24 items-center justify-center rounded-md border border-dashed bg-slate-50 text-[10px] text-muted-foreground'>
                                Student Photo
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
                {editData ? (
                    <>
                        <Button
                            type='button'
                            onClick={handleReturn}
                            disabled={returnBookMutation.isPending}
                            className='h-8 w-28 rounded-md bg-[#10b981] px-4 font-semibold text-white text-xs shadow-sm hover:bg-[#059669] disabled:opacity-50'>
                            {returnBookMutation.isPending ? (
                                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                            ) : (
                                <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                            )}
                            RETURN
                        </Button>

                        <Button
                            type='button'
                            onClick={handleRenew}
                            disabled={renewBookMutation.isPending}
                            className='h-8 w-28 rounded-md bg-[#8b5cf6] px-4 font-semibold text-white text-xs shadow-sm hover:bg-[#7c3aed]'>
                            {renewBookMutation.isPending ? (
                                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                            ) : (
                                <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                            )}
                            RENEW
                        </Button>
                    </>
                ) : null}

                <Button
                    type='submit'
                    disabled={issueBookMutation.isPending}
                    className='h-8 w-28 rounded-md bg-[#4251b1] px-4 font-semibold text-white text-xs shadow-sm hover:bg-[#35418e]'>
                    {issueBookMutation.isPending ? (
                        <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    ) : (
                        <Save className='mr-1.5 h-3.5 w-3.5' />
                    )}
                    {editData ? 'UPDATE' : 'ISSUE'}
                </Button>

                <Button
                    type='button'
                    onClick={() => {
                        reset();
                        if (onSuccess) onSuccess();
                    }}
                    className='h-8 w-28 rounded-md bg-[#ff5a30] px-4 font-semibold text-white text-xs shadow-sm hover:bg-[#e64d26]'>
                    <XCircle className='mr-1.5 h-3.5 w-3.5' /> CANCEL
                </Button>

                <div className='ml-4 flex items-center gap-2'>
                    <Controller
                        control={control}
                        name='sendPushNotification'
                        render={({ field }) => (
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} id='push' />
                        )}
                    />
                    <Label htmlFor='push' className='cursor-pointer text-xs'>
                        Send Mobile Push Notification
                    </Label>
                </div>
            </div>
        </form>
    );
};
