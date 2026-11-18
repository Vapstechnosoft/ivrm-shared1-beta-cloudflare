'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useBookRegister,
    useBookRegisterInitialData,
    useCategoryDropdown,
    useDepartmentDropdown,
    useLibraryDropdown,
    usePublisherDropdown,
    useSubjectDropdown,
    useVendorDropdown
} from '@/hooks/library/useBookRegister';
import { bookRegisterSchema } from '@/schemas/library/bookRegister';
import type { BookRegisterInitialData, BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import TabAuthorDetails from './TabAuthorDetails';
import TabBookDetails from './TabBookDetails';
import TabPurchaseDetails from './TabPurchaseDetails';

function normalizeBookData(data: any): BookRegisterPayload {
    if (!data) return {} as BookRegisterPayload;

    return {
        lmB_Id: data.lmB_Id || data.LMB_Id || data.lmb_Id ? Number(data.lmB_Id || data.LMB_Id || data.lmb_Id) : undefined,
        mI_Id: data.mI_Id || data.MI_Id ? Number(data.mI_Id || data.MI_Id) : undefined,
        lmB_BookTitle: data.lmB_BookTitle || data.LMB_BookTitle || '',
        mB_Subtitle: data.mB_Subtitle || data.MB_Subtitle || '',
        lmC_Id: Number(data.lmC_Id || data.LMC_Id || data.lmc_Id || 0),
        lmB_BookType: data.lmB_BookType || data.LMB_BookType || '',
        lmS_Id: Number(data.lmS_Id || data.LMS_Id || data.lms_Id || 0),
        lmD_Id: Number(data.lmD_Id || data.LMD_Id || data.lmd_Id || 0),
        binding_Type: data.binding_Type || data.Binding_Type || '',
        lmB_Edition: data.lmB_Edition || data.LMB_Edition || '',
        lmB_PublishedYear: data.lmB_PublishedYear || data.LMB_PublishedYear || '',
        lmB_EntryDate: data.lmB_EntryDate || data.LMB_EntryDate ? new Date(data.lmB_EntryDate || data.LMB_EntryDate) : new Date(),
        mB_Call_No: data.mB_Call_No || data.MB_Call_No || '',
        lmB_ISBNNo: data.lmB_ISBNNo || data.LMB_ISBNNo || '',
        lmB_ClassNo: data.lmB_ClassNo || data.LMB_ClassNo || '',
        lmB_VolNo: data.lmB_VolNo || data.LMB_VolNo || '',
        mB_Pages: data.mB_Pages || data.MB_Pages ? Number(data.mB_Pages || data.MB_Pages) : undefined,
        invoice_No: data.invoice_No || data.Invoice_No || '',
        lmBkf_KeyFactor: data.lmBkf_KeyFactor || data.LMBKF_KeyFactor || '',
        lmBkf_PageNo: data.lmBkf_PageNo || data.LMBKF_PageNo ? Number(data.lmBkf_PageNo || data.LMBKF_PageNo) : undefined,
        lmB_BookNo: data.lmB_BookNo || data.LMB_BookNo || '',
        lmAL_Id: Number(data.lmAL_Id || data.lmaL_Id || data.LMAL_Id || data.lmal_Id || 0),

        purchase_Date: data.purchase_Date || data.Purchase_Date ? new Date(data.purchase_Date || data.Purchase_Date) : new Date(),
        lmL_Id: Number(data.lmL_Id || data.LML_Id || data.lml_Id || 0),
        lmB_BillNo: data.lmB_BillNo || data.LMB_BillNo || '',
        voucher_No: data.voucher_No || data.Voucher_No || '',
        lmB_PurOrDonated:
            data.lmB_PurOrDonated === 'Purchased' || data.LMB_PurOrDonated === 'Purchased' || data.source_Type === 'Purchased' || data.Source_Type === 'Purchased'
                ? 'P'
                : data.lmB_PurOrDonated === 'Donated' || data.LMB_PurOrDonated === 'Donated' || data.source_Type === 'Donated' || data.Source_Type === 'Donated'
                  ? 'D'
                  : data.lmB_PurOrDonated === 'Specimen' || data.LMB_PurOrDonated === 'Specimen' || data.source_Type === 'Specimen' || data.Source_Type === 'Specimen'
                    ? 'S'
                    : data.lmB_PurOrDonated || data.LMB_PurOrDonated || 'P',
        donor_Id: data.donor_Id || data.Donor_Id || '',
        lmB_DonorAddress: data.lmB_DonorAddress || data.LMB_DonorAddress || '',
        currencyType: data.currencyType || data.CurrencyType || 'INR',
        source_Type: data.source_Type || data.Source_Type || '',
        lmV_Id: Number(data.lmV_Id || data.LMV_Id || data.lmv_Id || 0),
        mB_Keywords: data.mB_Keywords || data.MB_Keywords || '',
        lmP_Id: Number(data.lmP_Id || data.LMP_Id || data.lmp_Id || 0),
        mB_Remarks: data.mB_Remarks || data.MB_Remarks || '',
        bibliography_Page: data.bibliography_Page ?? data.Bibliography_Page ?? '',
        index_Page: data.index_Page ?? data.Index_Page ?? '',

        lmAU_Id: Number(data.lmAU_Id || data.LMAU_Id || data.lmau_Id || 0),
        lmB_AuthorFirstName: data.lmB_AuthorFirstName || data.LMB_AuthorFirstName || data.lmaU_AuthorFirstName || data.LMAU_AuthorFirstName || '',
        lmB_AuthorMiddleName: data.lmB_AuthorMiddleName || data.LMB_AuthorMiddleName || data.lmaU_AuthorMiddleName || data.LMAU_AuthorMiddleName || '',
        lmB_AuthorLastName: data.lmB_AuthorLastName || data.LMB_AuthorLastName || data.lmaU_AuthorLastName || data.LMAU_AuthorLastName || '',

        lmbanO_AvialableStatus: data.lmbanO_AvialableStatus || data.LMBANO_AvialableStatus || 'Available',
        lRM_Id: Number(data.lRM_Id || data.LRM_Id || data.lrm_Id || 0),
        lSM_Id: Number(data.lSM_Id || data.LSM_Id || data.lsm_Id || 0),
        lRAM_Id: Number(data.lRAM_Id || data.LRAM_Id || data.lram_Id || 0),
        lmrA_Id: Number(data.lmrA_Id || data.LMRA_Id || data.lmra_Id || 0),

        lmB_Price: data.lmB_Price || data.LMB_Price ? Number(data.lmB_Price || data.LMB_Price) : undefined,
        mB_Disc_Type: data.mB_Disc_Type || data.MB_Disc_Type || '',
        mB_Discountper: data.mB_Discountper || data.MB_Discountper ? Number(data.mB_Discountper || data.MB_Discountper) : undefined,
        mB_Discount: data.mB_Discount || data.MB_Discount ? Number(data.mB_Discount || data.MB_Discount) : undefined,
        lmB_NetPrice: data.lmB_NetPrice || data.LMB_NetPrice ? Number(data.lmB_NetPrice || data.LMB_NetPrice) : undefined,

        with_Accessories: !!(data.with_Accessories || data.With_Accessories),
        lmaC_Id: Number(data.lmaC_Id || data.LMAC_Id || data.lmac_Id || 0),
        mB_ActiveFlag: data.mB_ActiveFlag !== undefined ? !!data.mB_ActiveFlag : !!data.MB_ActiveFlag,
        lmB_StudentPhoto: data.lmB_StudentPhoto || data.Book_Image || '',

        accessionList: Array.isArray(data.accessionList) && data.accessionList.length > 0
            ? data.accessionList
            : Array.isArray(data.accessionlist) && data.accessionlist.length > 0
              ? data.accessionlist
              : [
                    {
                        lmbanO_Id: data.lmbanO_Id || data.LMBANO_Id || data.lmbanO_ID || data.lmbanO_id || undefined,
                        lmbanO_No: data.lmbanO_AccessionNo || data.lmbanO_No || data.LMBANO_AccessionNo || data.LMBANO_No || '',
                        lmbanO_AvialableStatus: data.lmbanO_AvialableStatus || data.LMBANO_AvialableStatus || 'Available'
                    }
                ],
        attachementList: Array.isArray(data.attachementList)
            ? data.attachementList
            : Array.isArray(data.attachementlist)
              ? data.attachementlist
              : [{ lmbA_FileName: '', lmbA_FilePath: '' }]
    };
}

export default function BookRegisterForm({ initialData, onSuccess }: { initialData?: BookRegisterPayload; onSuccess: () => void }) {
    const { saveMutation, saveTable1Mutation, saveTable2Mutation, saveTable3Mutation } = useBookRegister();
    const { data: initialDataRes, isLoading: isLoadingDropdowns } = useBookRegisterInitialData();
    const { data: categoryData } = useCategoryDropdown();
    const { data: departmentData } = useDepartmentDropdown();
    const { data: subjectData } = useSubjectDropdown();
    const { data: libraryData } = useLibraryDropdown();
    const { data: vendorData } = useVendorDropdown();
    const { data: publisherData } = usePublisherDropdown();

    const dropdownData = useMemo(() => {
        const base: BookRegisterInitialData = initialDataRes || {};
        const cat = (base.categorylist && base.categorylist.length > 0) ? base.categorylist : (categoryData && categoryData.length > 0) ? categoryData : [];
        const dept = (base.deptlist && base.deptlist.length > 0) ? base.deptlist : (departmentData && departmentData.length > 0) ? departmentData : [];
        const subj = (base.subjectlist && base.subjectlist.length > 0) ? base.subjectlist : (subjectData && subjectData.length > 0) ? subjectData : [];
        const lib = (base.liblist && base.liblist.length > 0) ? base.liblist : (libraryData && libraryData.length > 0) ? libraryData : [];
        const vend = (vendorData && vendorData.length > 0) ? vendorData : (base.vendorlist && base.vendorlist.length > 0) ? base.vendorlist : [];
        const pub = (publisherData && publisherData.length > 0) ? publisherData : (base.publisherlist && base.publisherlist.length > 0) ? base.publisherlist : [];

        return {
            ...base,
            categorylist: cat,
            categoryList: cat,
            deptlist: dept,
            deptList: dept,
            subjectlist: subj,
            subjectList: subj,
            liblist: lib,
            libList: lib,
            vendorlist: vend,
            vendorList: vend,
            publisherlist: pub,
            publisherList: pub
        };
    }, [initialDataRes, categoryData, departmentData, subjectData, libraryData, vendorData, publisherData]);

    const [activeTab, setActiveTab] = useState('bookDetails');

    const form = useForm<BookRegisterPayload>({
        resolver: zodResolver(bookRegisterSchema.addOrUpdate),
        defaultValues: initialData
            ? normalizeBookData(initialData)
            : {
                  lmB_BookTitle: '',
                  lmB_BookType: '',
                  lmB_PublishedYear: '',
                  lmB_EntryDate: new Date(),
                  purchase_Date: new Date(),
                  lmbanO_AvialableStatus: 'Available',
                  with_Accessories: false,
                  accessionList: [{ lmbanO_No: '' }],
                  attachementList: [{ lmbA_FileName: '', lmbA_FilePath: '' }]
              }
    });

    useEffect(() => {
        if (initialData) {
            form.reset(normalizeBookData(initialData));
        }
    }, [initialData, form]);

    const onSubmit = (data: BookRegisterPayload) => {
        const cleanedAttachments = data.attachementList?.filter((item) => !!item.lmbA_FilePath) || [];
        const payload = {
            ...data,
            attachementList: cleanedAttachments
        };

        saveTable3Mutation.mutate(payload, {
            onSuccess: (res: any) => {
                const responseData = res?.data ?? res;
                const returnVal = responseData?.returnval ?? responseData?.returnVal ?? res?.returnval;

                if (returnVal === 'Duplicate' || returnVal === 'duplicate' || res?.message?.toLowerCase()?.includes('duplicate')) {
                    toast.error(responseData?.message || res?.message || 'Duplicate record found');
                    return;
                }

                const isSuccess =
                    res?.success === true ||
                    returnVal === true ||
                    returnVal === 'save' ||
                    returnVal === 'update' ||
                    returnVal === 'saved' ||
                    returnVal === 'updated' ||
                    (res?.status && res.status >= 200 && res.status < 300) ||
                    (typeof res === 'object' && res?.success !== false && !res?.error);

                if (isSuccess) {
                    toast.success(responseData?.message || res?.message || 'Record saved successfully');
                    onSuccess();
                } else {
                    toast.error(res?.message || responseData?.message || 'Failed to save record');
                }
            },
            onError: (err: any) => {
                toast.error(err?.message || 'Failed to save record');
            }
        });
    };

    const handleNext = async () => {
        if (activeTab === 'bookDetails') {
            const fieldsToValidate: (keyof BookRegisterPayload)[] = [
                'lmB_BookTitle',
                'mB_Subtitle',
                'lmB_BookType',
                'lmB_BookNo',
                'binding_Type',
                'lmB_ISBNNo',
                'mB_Call_No',
                'lmB_ClassNo',
                'mB_Pages',
                'lmD_Id',
                'lmC_Id',
                'lmS_Id',
                'lmB_EntryDate',
                'lmB_PublishedYear',
                'lmB_Edition',
                'lmB_VolNo',
                'lmBkf_KeyFactor',
                'lmBkf_PageNo',
                'lmAL_Id',
                'lmB_StudentPhoto'
            ];

            const isValid = await form.trigger(fieldsToValidate);
            if (!isValid) {
                console.warn('First Tab Validation Failed! Errors:', form.formState.errors);
                toast.error('Please fix the validation errors on the first tab');
                return;
            }

            saveTable1Mutation.mutate(form.getValues(), {
                onSuccess: (res: any) => {
                    const responseData = res?.data ?? res;
                    const returnVal = responseData?.returnval ?? responseData?.returnVal ?? res?.returnval;

                    if (returnVal === 'Duplicate' || returnVal === 'duplicate' || res?.message?.toLowerCase()?.includes('duplicate')) {
                        toast.error(responseData?.message || res?.message || 'Duplicate record found');
                        return;
                    }

                    const isSuccess =
                        res?.success === true ||
                        returnVal === true ||
                        returnVal === 'save' ||
                        returnVal === 'update' ||
                        returnVal === 'saved' ||
                        returnVal === 'updated' ||
                        (res?.status && res.status >= 200 && res.status < 300) ||
                        (typeof res === 'object' && res?.success !== false && !res?.error);

                    if (isSuccess) {
                        toast.success(responseData?.message || res?.message || 'Book details saved successfully');
                        const savedBookId =
                            responseData?.bookDetails?.lmB_Id ||
                            responseData?.bookDetails?.LMB_Id ||
                            responseData?.lmb_Id ||
                            responseData?.LMB_Id ||
                            responseData?.lmB_Id ||
                            responseData?.bookdetails?.[0]?.lmB_Id ||
                            responseData?.bookdetails?.[0]?.LMB_Id ||
                            responseData?.bookDetailsList?.[0]?.lmB_Id ||
                            responseData?.bookDetailsList?.[0]?.LMB_Id;

                        if (savedBookId) {
                            form.setValue('lmB_Id', Number(savedBookId));
                        }
                        setActiveTab('purchaseDetails');
                    } else {
                        toast.error(res?.message || responseData?.message || 'Failed to save book details');
                    }
                },
                onError: (err: any) => {
                    toast.error(err?.message || 'Failed to save book details');
                }
            });
        } else if (activeTab === 'purchaseDetails') {
            const fieldsToValidate: (keyof BookRegisterPayload)[] = [
                'purchase_Date',
                'lmL_Id',
                'lmB_BillNo',
                'voucher_No',
                'lmB_PurOrDonated',
                'donor_Id',
                'lmB_DonorAddress',
                'currencyType',
                'source_Type',
                'lmV_Id',
                'mB_Keywords',
                'lmP_Id',
                'mB_Remarks',
                'bibliography_Page',
                'index_Page',
                'with_Accessories'
            ];

            const isValid = await form.trigger(fieldsToValidate);
            if (!isValid) {
                console.warn('Second Tab Validation Failed! Errors:', form.formState.errors);
                toast.error('Please fix the validation errors on the second tab');
                return;
            }

            saveTable2Mutation.mutate(form.getValues(), {
                onSuccess: (res: any) => {
                    const responseData = res?.data ?? res;
                    const returnVal = responseData?.returnval ?? responseData?.returnVal ?? res?.returnval;

                    if (returnVal === 'Duplicate' || returnVal === 'duplicate' || res?.message?.toLowerCase()?.includes('duplicate')) {
                        toast.error(responseData?.message || res?.message || 'Duplicate record found');
                        return;
                    }

                    const isSuccess =
                        res?.success === true ||
                        returnVal === true ||
                        returnVal === 'save' ||
                        returnVal === 'update' ||
                        returnVal === 'saved' ||
                        returnVal === 'updated' ||
                        (res?.status && res.status >= 200 && res.status < 300) ||
                        (typeof res === 'object' && res?.success !== false && !res?.error);

                    if (isSuccess) {
                        toast.success(responseData?.message || res?.message || 'Purchase details saved successfully');
                        setActiveTab('authorDetails');
                    } else {
                        toast.error(res?.message || responseData?.message || 'Failed to save purchase details');
                    }
                },
                onError: (err: any) => {
                    toast.error(err?.message || 'Failed to save purchase details');
                }
            });
        }
    };

    const handlePrevious = () => {
        if (activeTab === 'purchaseDetails') setActiveTab('bookDetails');
        else if (activeTab === 'authorDetails') setActiveTab('purchaseDetails');
    };

    const handleClear = () => {
        form.reset();
    };

    if (isLoadingDropdowns) {
        return (
            <div className='flex justify-center p-4'>
                <Loader2 className='h-6 w-6 animate-spin' />
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className='grid w-full grid-cols-3'>
                        <TabsTrigger value='bookDetails'>Books,Category Details</TabsTrigger>
                        <TabsTrigger value='purchaseDetails'>purchase,Language Details</TabsTrigger>
                        <TabsTrigger value='authorDetails'>Author,Accessories Details</TabsTrigger>
                    </TabsList>

                    <div className='mt-2 min-h-[300px] rounded-md border p-4'>
                        <TabsContent value='bookDetails'>
                            <TabBookDetails
                                dropdownData={dropdownData}
                                onNext={handleNext}
                                onCancel={() => onSuccess()}
                                onClear={handleClear}
                                isSaving={saveTable1Mutation.isPending}
                            />
                        </TabsContent>
                        <TabsContent value='purchaseDetails'>
                            <TabPurchaseDetails
                                dropdownData={dropdownData}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                onCancel={() => onSuccess()}
                                onClear={handleClear}
                                isSaving={saveTable2Mutation.isPending}
                            />
                        </TabsContent>
                        <TabsContent value='authorDetails'>
                            <TabAuthorDetails
                                dropdownData={dropdownData}
                                onSave={form.handleSubmit(onSubmit)}
                                onPrevious={handlePrevious}
                                onCancel={() => onSuccess()}
                                onClear={handleClear}
                                isSaving={saveTable3Mutation.isPending}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </form>
        </FormProvider>
    );
}
