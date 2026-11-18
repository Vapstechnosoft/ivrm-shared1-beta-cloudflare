'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { checkLibraryDataValidation, getImportLibraryDataInitial, saveImportLibraryData } from '@/server/library/reports/importlibrarydata';
import { RefreshCw, Save, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const FIELD_MAP: Record<string, string> = {
    LMB_BOOKTITLE: 'LMB_BookTitle',
    BOOKTITLE: 'LMB_BookTitle',
    LMB_BOOKSUBTITLE: 'LMB_BookSubTitle',
    BOOKSUBTITLE: 'LMB_BookSubTitle',
    LMB_CALLNO: 'LMB_CallNo',
    CALLNO: 'LMB_CallNo',
    LMB_CLASSNO: 'LMB_ClassNo',
    CLASSNO: 'LMB_ClassNo',
    LMB_ISBNNO: 'LMB_ISBNNo',
    ISBNNO: 'LMB_ISBNNo',
    LMB_VOLNO: 'LMB_VolNo',
    VOLNO: 'LMB_VolNo',
    LMB_BOOKTYPE: 'LMB_BookType',
    BOOKTYPE: 'LMB_BookType',
    LMD_DEPARTMENTNAME: 'LMD_DepartmentName',
    DEPARTMENTNAME: 'LMD_DepartmentName',
    LML_LANGUAGENAME: 'LML_LanguageName',
    LANGUAGENAME: 'LML_LanguageName',
    LMS_SUBJECTNAME: 'LMS_SubjectName',
    SUBJECTNAME: 'LMS_SubjectName',
    LMB_BOOKNO: 'LMB_BookNo',
    BOOKNO: 'LMB_BookNo',
    LMP_PUBLISHERNAME: 'LMP_PublisherName',
    PUBLISHERNAME: 'LMP_PublisherName',
    LMBA_AUTHORFIRSTNAME: 'LMBA_AuthorFirstName',
    AUTHORFIRSTNAME: 'LMBA_AuthorFirstName',
    LMBANO_ACTIVEFLG: 'LMBANO_ActiveFlg',
    ACTIVEFLG: 'LMBANO_ActiveFlg',
    LMB_BILLNO: 'LMB_BillNo',
    BILLNO: 'LMB_BillNo',
    LMB_VOUCHERNO: 'LMB_VoucherNo',
    VOUCHERNO: 'LMB_VoucherNo',
    LMB_PRICE: 'LMB_Price',
    PRICE: 'LMB_Price',
    LMB_DISCOUNT: 'LMB_Discount',
    DISCOUNT: 'LMB_Discount',
    LMB_NETPRICE: 'LMB_NetPrice',
    NETPRICE: 'LMB_NetPrice',
    LMB_BINDINGTYPE: 'LMB_BindingType',
    BINDINGTYPE: 'LMB_BindingType',
    LMB_PURCHASEDATE: 'LMB_PurchaseDate',
    PURCHASEDATE: 'LMB_PurchaseDate',
    LMB_ENTRYDATE: 'LMB_EntryDate',
    ENTRYDATE: 'LMB_EntryDate',
    LMB_BIBLOGRAPHY: 'LMB_Biblography',
    LMB_INDEXPAGE: 'LMB_IndexPage',
    LMB_NOOFPAGES: 'LMB_NoOfPages',
    NOOFPAGES: 'LMB_NoOfPages',
    LMB_PUBLISHEDYEAR: 'LMB_PublishedYear',
    PUBLISHEDYEAR: 'LMB_PublishedYear',
    LMB_EDITION: 'LMB_Edition',
    EDITION: 'LMB_Edition',
    LMB_PURORDONATED: 'LMB_PurOrDonated',
    PURORDONATED: 'LMB_PurOrDonated',
    LMB_DONORNAME: 'LMB_DonorName',
    DONORNAME: 'LMB_DonorName',
    LMB_DONORADDRESS: 'LMB_DonorAddress',
    LMB_REMARKS: 'LMB_Remarks',
    REMARKS: 'LMB_Remarks',
    LMB_KEYWORDS: 'LMB_Keywords',
    KEYWORDS: 'LMB_Keywords',
    LMB_NOOFCOPIES: 'LMB_NoOfCopies',
    NOOFCOPIES: 'LMB_NoOfCopies',
    LMB_CURRENCEYTYPE: 'LMB_CurrenceyType',
    CURRENCEYTYPE: 'LMB_CurrenceyType',
    LMB_BOOKIMAGE: 'LMB_BookImage'
};

// Helper to determine the backend payload key automatically based on filename or column headers
function detectPayloadConfig(fname: string, headers: string[]): { key: string; requiresLibrary: boolean } {
    const lowerName = fname.toLowerCase();
    const upperHeaders = headers.map((h) => h.toUpperCase());

    // 1. By Filename
    if (lowerName.includes('subject')) return { key: 'mastersub', requiresLibrary: true };
    if (lowerName.includes('department') || lowerName.includes('masterdep')) return { key: 'masterdep', requiresLibrary: true };
    if (lowerName.includes('language') || lowerName.includes('masterlang')) return { key: 'masterlang', requiresLibrary: false };
    if (lowerName.includes('publisher') || lowerName.includes('masterpubl')) return { key: 'masterpubl', requiresLibrary: true };
    if (lowerName.includes('rack') || lowerName.includes('masterrack')) return { key: 'masterrack', requiresLibrary: true };
    if (lowerName.includes('vendor') || lowerName.includes('vender')) return { key: 'mastervender', requiresLibrary: true };
    if (lowerName.includes('trans') || lowerName.includes('circulation')) return { key: 'booktransIMP', requiresLibrary: true };
    if (lowerName.includes('author') || lowerName.includes('masterauthor')) return { key: 'masterauthor', requiresLibrary: true };
    if (lowerName.includes('accn') || lowerName.includes('accession') || lowerName.includes('masteracces'))
        return { key: 'masteracces', requiresLibrary: true };
    if (lowerName.includes('book') || lowerName.includes('masterbook')) return { key: 'masterbook', requiresLibrary: true };

    // 2. By Header column names - CHECK MASTERBOOK FIRST!
    // Book import sheets typically contain book title/subtitle, call no, publisher, author, accession flag, etc.
    if (
        upperHeaders.some(
            (h) =>
                h.startsWith('LMB_') ||
                h.startsWith('LMBA_') ||
                h.startsWith('LMBANO_') ||
                h.includes('BOOKTITLE') ||
                h.includes('BOOKSUBTITLE') ||
                h.includes('CALLNO') ||
                h.includes('ISBN')
        )
    ) {
        return { key: 'masterbook', requiresLibrary: true };
    }

    if (upperHeaders.some((h) => h.startsWith('LMAU_') || (h.includes('AUTHOR') && !h.startsWith('LMBA_'))))
        return { key: 'masterauthor', requiresLibrary: true };
    if (upperHeaders.some((h) => h.startsWith('LMRA_') || h.includes('RACKNAME'))) return { key: 'masterrack', requiresLibrary: true };
    if (
        upperHeaders.some(
            (h) => (h.startsWith('LMBANO_') || h.includes('ACCESSIONNO')) && !upperHeaders.some((uh) => uh.startsWith('LMB_'))
        )
    )
        return { key: 'masteracces', requiresLibrary: true };
    if (upperHeaders.some((h) => h.startsWith('LBTR_') || h.includes('ISSUEDDATE') || h.includes('RETURNEDDATE')))
        return { key: 'booktransIMP', requiresLibrary: true };
    if (upperHeaders.some((h) => h.startsWith('LMV_') || h.includes('VENDORNAME'))) return { key: 'mastervender', requiresLibrary: true };
    if (upperHeaders.some((h) => h.startsWith('LMP_') || h.includes('PUBLISHERNAME'))) return { key: 'masterpubl', requiresLibrary: true };
    if (upperHeaders.some((h) => h.startsWith('LML_') || h.includes('LANGUAGENAME'))) return { key: 'masterlang', requiresLibrary: false };
    if (upperHeaders.some((h) => h.startsWith('LMD_') || h.includes('DEPARTMENTNAME'))) return { key: 'masterdep', requiresLibrary: true };
    if (upperHeaders.some((h) => h.startsWith('LMS_') || h.includes('SUBJECTNAME'))) return { key: 'mastersub', requiresLibrary: true };

    // Default to book
    return { key: 'masterbook', requiresLibrary: true };
}

export default function ImportLibraryDataPage() {
    return (
        <FormProvider<any>>
            <ImportLibraryDataContent />
        </FormProvider>
    );
}

function ImportLibraryDataContent() {
    const [libraries, setLibraries] = useState<any[]>([]);
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [activeFlag, setActiveFlag] = useState<boolean>(false);
    const [gridData, setGridData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [filename, setFilename] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial libraries
    useEffect(() => {
        setIsLoading(true);
        getImportLibraryDataInitial()
            .then((res) => {
                const libList =
                    res?.masterlibarary ||
                    res?.msterliblist1 ||
                    res?.masterlibrary ||
                    res?.lib_list ||
                    res?.libList ||
                    res?.libraryList ||
                    res?.list ||
                    (Array.isArray(res) ? res : []);

                if (Array.isArray(libList) && libList.length > 0) {
                    setLibraries(libList);
                }
            })
            .catch((err) => {
                toast.error(err.message || 'Failed to fetch libraries');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Handle Excel File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const lowerName = file.name.toLowerCase();
        const validExtensions = ['.xlsx', '.xls', '.csv', '.xlsm', '.xlsb'];
        const isExcel = validExtensions.some((ext) => lowerName.endsWith(ext));

        if (!isExcel && !file.type.includes('sheet') && !file.type.includes('excel') && !file.type.includes('csv') && file.type !== '') {
            toast.error('Please upload a valid Excel file (.xlsx, .xls, .csv)');
            return;
        }

        setFilename(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const buffer = evt.target?.result as ArrayBuffer;
                const workbook = XLSX.read(buffer, {
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });

                const sheetNames = workbook.SheetNames;
                if (!sheetNames || sheetNames.length === 0) {
                    toast.error('Uploaded file contains no worksheets.');
                    return;
                }

                const worksheet = workbook.Sheets[sheetNames[0]];
                if (!worksheet) {
                    toast.error('Worksheet not found.');
                    return;
                }

                // Extract header row
                const headerMatrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
                const firstRow = headerMatrix[0] || [];

                // Extract rows
                const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

                if (!rawData || rawData.length === 0) {
                    toast.error('Excel sheet is empty');
                    setGridData([]);
                    setColumns([]);
                    return;
                }

                // Sanitize column headers
                const cleanedHeaders: string[] = [];
                firstRow.forEach((h: any, idx: number) => {
                    const text = h !== undefined && h !== null ? String(h).trim() : '';
                    if (text) {
                        cleanedHeaders.push(text);
                    } else if (idx < Object.keys(rawData[0] || {}).length) {
                        cleanedHeaders.push(`Column_${idx + 1}`);
                    }
                });

                const finalHeaders = cleanedHeaders.length > 0 ? cleanedHeaders : Object.keys(rawData[0] || {});

                // Format row values
                const formattedData = rawData.map((row: any) => {
                    const cleanRow: Record<string, any> = {};
                    for (const col of finalHeaders) {
                        let val = row[col];
                        if (val instanceof Date) {
                            val = val.toISOString().split('T')[0];
                        } else if (val === undefined || val === null) {
                            val = '';
                        } else if (typeof val === 'string') {
                            val = val.trim();
                        }
                        cleanRow[col] = val;
                    }
                    return cleanRow;
                });

                // Display in grid immediately
                setGridData(formattedData);
                setColumns(finalHeaders);
                toast.success(`Loaded ${formattedData.length} records from Excel`);

                // Non-blocking background validation
                try {
                    checkLibraryDataValidation({ newlstget1: formattedData.slice(0, 100) })
                        .then((valRes) => {
                            if (valRes?.stuStatus && valRes.stuStatus !== '') {
                                toast.info(`Validation Note: ${valRes.stuStatus}`);
                            }
                        })
                        .catch(() => {});
                } catch (_) {}
            } catch (err: any) {
                console.error('File reading error:', err);
                toast.error('Failed to parse Excel file. Please ensure it is not corrupt.');
            }
        };

        reader.onerror = () => {
            toast.error('Error reading file from disk');
        };

        reader.readAsArrayBuffer(file);

        if (e.target) {
            e.target.value = '';
        }
    };

    // Filter rows based on search input
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return gridData;
        const query = searchQuery.toLowerCase().trim();
        return gridData.filter((row) =>
            columns.some((col) => {
                const val = row[col];
                return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
            })
        );
    }, [gridData, columns, searchQuery]);

    // Clear / Cancel
    const handleClear = () => {
        setGridData([]);
        setColumns([]);
        setSelectedLibraryId('');
        setActiveFlag(false);
        setFilename('');
        setSearchQuery('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Save imported data
    const handleSave = async () => {
        if (!selectedLibraryId) {
            toast.error('Library Name Is Not Selected !');
            return;
        }

        if (gridData.length === 0) {
            toast.error('Please upload a valid excel data');
            return;
        }

        setIsSaving(true);
        try {
            const config = detectPayloadConfig(filename, columns);
            const activeKey = config.key || 'masterbook';

            // Format dates and ensure LMB_Id is 0 if missing for masterbook
            const formattedData = gridData.map((item) => {
                const newItem: Record<string, any> = {};
                for (const [k, v] of Object.entries(item)) {
                    if (k === 'SLNO' || k === 'slno') continue;
                    const cleanK = k.trim().toUpperCase();
                    const targetKey = FIELD_MAP[cleanK] || k.trim();
                    const valStr = v !== undefined && v !== null ? String(v).trim() : '';
                    newItem[targetKey] = valStr;
                    if (targetKey !== k) {
                        newItem[k] = valStr;
                    }
                }

                if (newItem.LBTR_IssuedDate) {
                    try {
                        newItem.LBTR_IssuedDate = new Date(newItem.LBTR_IssuedDate).toISOString().split('T')[0];
                    } catch (_) {}
                }
                if (newItem.LBTR_ReturnedDate) {
                    try {
                        newItem.LBTR_ReturnedDate = new Date(newItem.LBTR_ReturnedDate).toISOString().split('T')[0];
                    } catch (_) {}
                }

                // If BookTitle is missing, copy from BookSubTitle or vice-versa
                const subTitle = newItem.LMB_BookSubTitle || newItem.LMB_BOOKSUBTITLE || '';
                const title = newItem.LMB_BookTitle || newItem.LMB_BOOKTITLE || '';
                if (!title && subTitle) {
                    newItem.LMB_BookTitle = subTitle;
                    newItem.LMB_BOOKTITLE = subTitle;
                }
                if (!subTitle && title) {
                    newItem.LMB_BookSubTitle = title;
                    newItem.LMB_BOOKSUBTITLE = title;
                }

                newItem.LMB_Id = Number(newItem.LMB_Id || 0);

                return newItem;
            });

            const payload: Record<string, any> = {
                LMAL_Id: Number(selectedLibraryId) || 0,
                LMV_Id: 0,
                LMAU_Id: 0,
                MI_Id: 0,
                returnval: false,
                suscnt: 0,
                failcnt: 0,
                dupcnt: 0,
                booktransIMP: activeKey === 'booktransIMP' ? formattedData : null,
                masteracces: activeKey === 'masteracces' ? formattedData : null,
                mastervender: activeKey === 'mastervender' ? formattedData : null,
                masterauthor: activeKey === 'masterauthor' ? formattedData : null,
                mastersub: activeKey === 'mastersub' ? formattedData : null,
                masterdep: activeKey === 'masterdep' ? formattedData : null,
                masterlang: activeKey === 'masterlang' ? formattedData : null,
                masterpubl: activeKey === 'masterpubl' ? formattedData : null,
                masterrack: activeKey === 'masterrack' ? formattedData : null,
                masterbook: formattedData
            };

            const response: any = await saveImportLibraryData(payload);

            const innerData = response?.data ?? response;
            const msg = response?.message || innerData?.message;
            const suscnt = innerData?.suscnt ?? response?.suscnt ?? 0;
            const failcnt = innerData?.failcnt ?? response?.failcnt ?? 0;
            const dupcnt = innerData?.dupcnt ?? response?.dupcnt ?? 0;
            const returnval = innerData?.returnval ?? response?.returnval;

            const isSuccess = response?.success === true || returnval === true || returnval === 'true' || (suscnt > 0 && failcnt === 0);

            const displayMessage =
                msg ||
                (isSuccess
                    ? `Data saved successfully. Success: ${suscnt}, Failed: ${failcnt}, Duplicates: ${dupcnt}`
                    : `Data saving failed. Success: ${suscnt}, Failed: ${failcnt}, Duplicates: ${dupcnt}`);

            // Always show response message in green color as requested
            toast.success(displayMessage);
            if (isSuccess || suscnt > 0) {
                handleClear();
            }
        } catch (error: any) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'Failed to save data');
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* SECTION 1: LIBRARY DATA IMPORT */}
                <CollapsibleSection title='LIBRARY DATA IMPORT' defaultOpen={true} variant='outline' size='md' className='shadow-lg'>
                    <div className='flex justify-center p-4'>
                        <div className='rounded border border-gray-300 bg-white px-8 py-2 text-center font-bold text-green-600 shadow-sm'>
                            ** Kindly Select Only One Excel Sheet To Import
                        </div>
                    </div>
                </CollapsibleSection>

                {/* SECTION 2: IMPORTED DATA FROM EXCEL */}
                <CollapsibleSection title='IMPORTED DATA FROM EXCEL' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='space-y-6 p-4'>
                        {/* Top Controls Row */}
                        <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
                            <div className='flex flex-wrap items-center gap-6'>
                                {/* Choose File */}
                                <div className='relative'>
                                    <Input
                                        id='excel-upload'
                                        type='file'
                                        accept='.xlsx,.xls,.csv,.xlsm,.xlsb'
                                        onChange={handleFileUpload}
                                        className='hidden'
                                        ref={fileInputRef}
                                    />
                                    <Label
                                        htmlFor='excel-upload'
                                        className='flex min-w-[140px] cursor-pointer items-center justify-center rounded bg-[#f1b53d] px-6 py-2 font-bold text-black text-sm shadow-sm transition hover:bg-[#e0a42c]'>
                                        Choose File
                                    </Label>
                                </div>

                                {/* Libarary Name */}
                                <div className='flex items-center gap-3'>
                                    <Label className='whitespace-nowrap font-medium text-gray-700 text-sm'>Libarary Name</Label>
                                    <Select value={selectedLibraryId} onValueChange={setSelectedLibraryId} disabled={isLoading}>
                                        <SelectTrigger className='w-[240px] bg-white'>
                                            <SelectValue placeholder='Select Libarary Name' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {libraries.map((lib: any, idx: number) => {
                                                const id = String(lib.lmaL_Id ?? lib.LMAL_Id ?? lib.lmal_id ?? lib.id ?? idx);
                                                const name =
                                                    lib.lmaL_LibraryName ??
                                                    lib.LMAL_LibraryName ??
                                                    lib.lmal_LibraryName ??
                                                    lib.libraryName ??
                                                    lib.name ??
                                                    '';
                                                return (
                                                    <SelectItem key={`${id}-${idx}`} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Active Flag */}
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='activeFlag'
                                        checked={activeFlag}
                                        onCheckedChange={(checked) => setActiveFlag(!!checked)}
                                    />
                                    <Label
                                        htmlFor='activeFlag'
                                        className='cursor-pointer whitespace-nowrap font-medium text-gray-700 text-sm'>
                                        Active Flag
                                    </Label>
                                </div>
                            </div>

                            {/* Search Input on the right */}
                            <div className='w-full md:w-[260px]'>
                                <div className='relative'>
                                    <Input
                                        placeholder='search here...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='bg-white pr-9 pl-3'
                                    />
                                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                                        <Search className='h-4 w-4 text-gray-500' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons: Centered SAVE and CANCEL */}
                        <div className='flex justify-center gap-4 py-1'>
                            <Button
                                size='sm'
                                onClick={handleSave}
                                disabled={isSaving}
                                className='w-28 gap-2 bg-[#3f51b5] font-bold text-white shadow hover:bg-[#303f9f]'>
                                {isSaving ? (
                                    <>
                                        <RefreshCw className='h-4 w-4 animate-spin' />
                                        SAVING...
                                    </>
                                ) : (
                                    <>
                                        <Save className='h-4 w-4' />
                                        SAVE
                                    </>
                                )}
                            </Button>
                            <Button
                                size='sm'
                                onClick={handleClear}
                                disabled={isSaving}
                                className='w-28 gap-2 bg-[#f4511e] font-bold text-white shadow hover:bg-[#d84315]'>
                                <X className='h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>

                        {/* Table Display */}
                        {gridData.length > 0 ? (
                            <div className='max-h-[500px] overflow-auto rounded-md border shadow-sm'>
                                <table className='w-full border-collapse text-left text-sm'>
                                    <thead className='sticky top-0 z-10 bg-primary text-primary-foreground'>
                                        <tr>
                                            <th className='border border-primary-foreground/20 p-2.5 text-center font-bold'>SLNO</th>
                                            {columns.map((col, idx) => (
                                                <th
                                                    key={idx}
                                                    className='whitespace-nowrap border border-primary-foreground/20 p-2.5 font-semibold text-xs uppercase tracking-wider'>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row, rIdx) => (
                                            <tr
                                                key={rIdx}
                                                className='border-b transition-colors odd:bg-white even:bg-muted/20 hover:bg-muted/60'>
                                                <td className='border p-2 text-center font-medium text-muted-foreground text-xs'>
                                                    {rIdx + 1}
                                                </td>
                                                {columns.map((col, cIdx) => (
                                                    <td
                                                        key={cIdx}
                                                        className='max-w-[250px] truncate border p-2 text-xs'
                                                        title={String(row[col] ?? '')}>
                                                        {String(row[col] ?? '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className='overflow-x-auto rounded-md border'>
                                <div className='flex min-h-[25px] items-center justify-center bg-gray-100 p-4' />
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
