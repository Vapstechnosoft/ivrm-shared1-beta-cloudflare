'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlumniSearchDropdownData, usePerformAlumniSearch } from '@/hooks/alumni/useAlumniSearch';
import type { IAlumniAcademicYear, IAlumniClass, IAlumniSearchResultItem } from '@/types/alumni/alumni-search';
import { FileSpreadsheet, Loader2, Mail, MapPin, MinusCircle, Phone, PlusCircle, Printer, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const FIELD_OPTIONS = [
    { value: 'StudentName', name: 'Alumni Name' },
    { value: 'ALMST_MobileNo', name: 'MobileNo' },
    { value: 'ALMST_emailId', name: 'Email id' },
    { value: 'IVRMMC_CountryName', name: 'Country' },
    { value: 'IVRMMS_Name', name: 'State' },
    { value: 'ALMST_PerCity', name: 'City' },
    { value: 'ALSPR_Designation', name: 'Profession' },
    { value: 'ALMST_BloodGroup', name: 'Blood Group' },
    { value: 'ALMST_FatherName', name: 'Father Name' },
    { value: 'ALMST_FullAddess', name: 'FullAddess' },
    { value: 'ASMCL_Id_Join', name: 'Class Joined' },
    { value: 'ASMCL_Id_Left', name: 'Class Left' },
    { value: 'ASMAY_Id_Join', name: 'Year Joined' },
    { value: 'ASMAY_Id_Left', name: 'Year Left' },
    { value: 'ALMST_MembershipId', name: 'Membership ID' },
    { value: 'ALMMC_MembershipCategory', name: 'Membership Category' }
];

const getOperators = (field: string) => {
    if (['ASMCL_Id_Join', 'ASMCL_Id_Left', 'ASMAY_Id_Join', 'ASMAY_Id_Left'].includes(field)) {
        return [
            { value: '=', name: 'Equal to' },
            { value: '!=', name: 'Not Equal to' }
        ];
    }
    return [
        { value: '=', name: 'Equal to' },
        { value: '!=', name: 'Not Equal to' },
        { value: 'like', name: 'Like' }
    ];
};

const CONDITION_OPTIONS = [
    { value: 'AND', name: 'AND' },
    { value: 'OR', name: 'OR' }
];

interface FilterRow {
    field: string;
    operator: string;
    value: string;
    condition: string;
}

export default function AlumniSearchPage() {
    // Queries & Mutations
    const { data: dropdownData, isLoading: isDropdownLoading } = useAlumniSearchDropdownData();
    const searchMutation = usePerformAlumniSearch();

    // UI States
    const [emailChecked, setEmailChecked] = useState(true);
    const [phoneChecked, setPhoneChecked] = useState(true);
    const [filters, setFilters] = useState<FilterRow[]>([{ field: '', operator: '', value: '', condition: '' }]);
    const [searchResults, setSearchResults] = useState<IAlumniSearchResultItem[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedRows, setSelectedRows] = useState<IAlumniSearchResultItem[]>([]);
    const [allSelected, setAllSelected] = useState(false);
    const [printMode, setPrintMode] = useState<'standard' | 'address'>('standard');

    // Initial Data
    const yearList = dropdownData?.data?.yearList || [];
    const classList = dropdownData?.data?.classList || [];

    // Handlers
    const addNewFilter = () => {
        setFilters([...filters, { field: '', operator: '', value: '', condition: '' }]);
    };

    const removeFilter = (index: number) => {
        if (filters.length > 1) {
            const newFilters = [...filters];
            newFilters.splice(index, 1);
            setFilters(newFilters);
        }
    };

    const updateFilter = (index: number, key: keyof FilterRow, val: string) => {
        const newFilters = [...filters];
        newFilters[index][key] = val;

        // Reset operator and value if field changes
        if (key === 'field') {
            newFilters[index].operator = '';
            newFilters[index].value = '';
        }

        setFilters(newFilters);
    };

    const handleSearch = async () => {
        // Validation
        const isValid = filters.every((f, i) => {
            if (!f.field || !f.operator || !f.value) return false;
            if (i < filters.length - 1 && !f.condition) return false;
            return true;
        });

        if (!isValid) {
            toast.error('Please fill all required filter fields');
            return;
        }

        try {
            // Updated payload structure as per user request
            const payload = {
                field: filters.map((f) => f.field),
                operator: filters.map((f) => f.operator),
                value: filters.map((f) => f.value),
                condition: filters.map((f) => f.condition).filter((c) => c !== '')
            };

            const res = await searchMutation.mutateAsync(payload);

            let resultData: IAlumniSearchResultItem[] = [];
            if (Array.isArray(res.data)) {
                resultData = res.data;
            } else if (res.data && 'searchResult' in res.data && Array.isArray(res.data.searchResult)) {
                resultData = res.data.searchResult;
            }

            if (resultData.length > 0) {
                setSearchResults(resultData);
                setShowGrid(true);
                setSelectedRows([]);
                setAllSelected(false);
            } else {
                toast.error(res?.message || 'No Records Found!');
                setShowGrid(false);
            }
        } catch (error) {
            toast.error('Failed to perform search');
        }
    };

    const handleClear = () => {
        setFilters([{ field: '', operator: '', value: '', condition: '' }]);
        setSearchResults([]);
        setShowGrid(false);
        setSearchValue('');
        setSelectedRows([]);
        setAllSelected(false);
    };

    const toggleSelectAll = (checked: boolean) => {
        setAllSelected(checked);
        if (checked) {
            setSelectedRows([...filteredResults]);
        } else {
            setSelectedRows([]);
        }
    };

    const toggleRowSelection = (row: IAlumniSearchResultItem) => {
        const isSelected = selectedRows.some(
            (r) => (row.almst_id && r.almst_id === row.almst_id) || (row.amst_admno && r.amst_admno === row.amst_admno)
        );

        if (isSelected) {
            setSelectedRows(selectedRows.filter((r) => (row.almst_id ? r.almst_id !== row.almst_id : r.amst_admno !== row.amst_admno)));
            setAllSelected(false);
        } else {
            setSelectedRows([...selectedRows, row]);
            if (selectedRows.length + 1 === filteredResults.length) {
                setAllSelected(true);
            }
        }
    };

    // Filter results based on search bar
    const filteredResults = useMemo(() => {
        if (!searchValue) return searchResults;
        return searchResults.filter((r) => Object.values(r).some((val) => String(val).toLowerCase().includes(searchValue.toLowerCase())));
    }, [searchResults, searchValue]);

    // Export to Excel
    const exportToExcel = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records to export');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(
            selectedRows.map((r, i) => ({
                'SL NO': i + 1,
                'Alumni Name': r.studentname || r.amsT_FirstName || 'N/A',
                'Reg. No': r.amst_registrationno || 'N/A',
                'Adm. No': r.amst_admno || 'N/A',
                DOB: r.amst_dob ? new Date(r.amst_dob).toLocaleDateString() : r.amsT_DOB || 'N/A',
                'Mobile No': r.amst_mobileno || r.amsT_MobileNo || 'N/A',
                'Email Id': r.amst_emailid || r.amsT_emailId || 'N/A',
                Class: r.asmcl_classname || r.ALMMC_MembershipCategory || 'N/A',
                'Joined Year': r.ASMAY_Id_Join || 'N/A',
                'Left Year': r.ASMAY_Id_Left || 'N/A',
                'Member Id': r.ALMST_MembershipId || 'N/A',
                Profession: r.ALSPR_Designation || 'N/A',
                City: r.ALMST_ConCity || 'N/A',
                'Full Address': r.ALMST_FullAddess || 'N/A'
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni Search Results');
        XLSX.writeFile(workbook, 'Alumni_Search_Report.xlsx');
    };

    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records to print');
            return;
        }
        setPrintMode('standard');
        // Small delay to ensure state update and DOM rendering
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleAddressBookPrint = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select records for address book');
            return;
        }
        setPrintMode('address');
        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <div className='fade-in min-h-screen animate-in space-y-8 bg-slate-50 p-4 duration-500 md:p-6 lg:p-8 print:min-h-0 print:bg-white print:p-0'>
            <CollapsibleSection
                title='Alumni Search'
                description='Custom search with multiple criteria and reporting'
                defaultOpen={true}
                className='overflow-hidden rounded-2xl border-none bg-white shadow-xl print:hidden'>
                <div className='space-y-6 p-6'>
                    {/* Channel Selection */}
                    <div className='flex justify-center'>
                        <Card className='w-full max-w-md border-2 border-slate-200 border-dashed bg-slate-50/50'>
                            <CardContent className='flex items-center justify-around p-4'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='email-check'
                                        checked={emailChecked}
                                        onCheckedChange={(c) => setEmailChecked(!!c)}
                                        className='h-5 w-5'
                                    />
                                    <Label htmlFor='email-check' className='flex items-center gap-2 font-semibold text-sm'>
                                        <Mail className='h-4 w-4 text-blue-500' /> Email
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='phone-check'
                                        checked={phoneChecked}
                                        onCheckedChange={(c) => setPhoneChecked(!!c)}
                                        className='h-5 w-5'
                                    />
                                    <Label htmlFor='phone-check' className='flex items-center gap-2 font-semibold text-sm'>
                                        <Phone className='h-4 w-4 text-green-500' /> Phone No.
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dynamic Filter Table */}
                    <div className='overflow-hidden rounded-xl border border-slate-200 shadow-sm'>
                        <Table>
                            <TableHeader className='bg-slate-800'>
                                <TableRow>
                                    <TableHead className='font-bold text-white'>
                                        Field <span className='text-red-400'>*</span>
                                    </TableHead>
                                    <TableHead className='font-bold text-white'>
                                        Like <span className='text-red-400'>*</span>
                                    </TableHead>
                                    <TableHead className='font-bold text-white'>
                                        Value <span className='text-red-400'>*</span>
                                    </TableHead>
                                    <TableHead className='font-bold text-white'>Condition</TableHead>
                                    <TableHead className='text-center font-bold text-white'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filters.map((row, idx) => (
                                    <TableRow key={idx} className='transition-colors hover:bg-slate-50'>
                                        <TableCell className='w-[200px]'>
                                            <Select value={row.field} onValueChange={(v) => updateFilter(idx, 'field', v)}>
                                                <SelectTrigger className='border-slate-300 bg-white'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FIELD_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className='w-[180px]'>
                                            <Select value={row.operator} onValueChange={(v) => updateFilter(idx, 'operator', v)}>
                                                <SelectTrigger className='border-slate-300 bg-white'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getOperators(row.field).map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>

                                        <TableCell>
                                            {/* Dynamic Inputs based on field */}
                                            {row.field === 'ASMAY_Id_Join' || row.field === 'ASMAY_Id_Left' ? (
                                                <Select value={row.value} onValueChange={(v) => updateFilter(idx, 'value', v)}>
                                                    <SelectTrigger className='border-slate-300 bg-white'>
                                                        <SelectValue placeholder='--Select Year--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='0'>--All Year--</SelectItem>
                                                        {yearList.map((y: IAlumniAcademicYear) => (
                                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : row.field === 'ASMCL_Id_Join' || row.field === 'ASMCL_Id_Left' ? (
                                                <Select value={row.value} onValueChange={(v) => updateFilter(idx, 'value', v)}>
                                                    <SelectTrigger className='border-slate-300 bg-white'>
                                                        <SelectValue placeholder='--Select Class--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='0'>--All Class--</SelectItem>
                                                        {classList.map((c: IAlumniClass) => (
                                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                                {c.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    className='border-slate-300 bg-white'
                                                    placeholder='enter value'
                                                    value={row.value}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // Basic allow-pattern implementation
                                                        if (row.field === 'ALMST_AadharNo' || row.field === 'PASR_Age') {
                                                            if (/^\d*$/.test(val)) updateFilter(idx, 'value', val);
                                                        } else {
                                                            updateFilter(idx, 'value', val);
                                                        }
                                                    }}
                                                    onPaste={(e) => e.preventDefault()}
                                                    maxLength={row.field === 'ALMST_AadharNo' ? 12 : row.field === 'PASR_Age' ? 2 : 50}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className='w-[150px]'>
                                            {idx < filters.length - 1 && (
                                                <Select value={row.condition} onValueChange={(v) => updateFilter(idx, 'condition', v)}>
                                                    <SelectTrigger className='border-slate-300 bg-white'>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CONDITION_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center justify-center gap-2'>
                                                <Button
                                                    size='icon'
                                                    variant='ghost'
                                                    className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                                                    onClick={addNewFilter}>
                                                    <PlusCircle className='h-5 w-5' />
                                                </Button>
                                                {idx > 0 && (
                                                    <Button
                                                        size='icon'
                                                        variant='ghost'
                                                        className='h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700'
                                                        onClick={() => removeFilter(idx)}>
                                                        <MinusCircle className='h-5 w-5' />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Form Actions */}
                    <div className='flex flex-wrap items-center justify-center gap-4 border-slate-100 border-t pt-4'>
                        <Button
                            className='min-w-[140px] bg-indigo-600 shadow-indigo-200 shadow-lg hover:bg-indigo-700'
                            onClick={handleSearch}
                            disabled={searchMutation.isPending}>
                            {searchMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Search className='mr-2 h-4 w-4' />
                            )}
                            SEARCH
                        </Button>
                        <Button variant='outline' className='min-w-[140px] border-slate-300' onClick={handleClear}>
                            <RotateCcw className='mr-2 h-4 w-4' /> CLEAR
                        </Button>
                        {showGrid && (
                            <>
                                <Button
                                    variant='secondary'
                                    className='min-w-[140px] bg-emerald-600 text-white hover:bg-emerald-700'
                                    onClick={exportToExcel}>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' /> EXPORT
                                </Button>
                                <Button
                                    variant='secondary'
                                    className='min-w-[140px] bg-slate-700 text-white hover:bg-slate-800'
                                    onClick={handlePrint}>
                                    <Printer className='mr-2 h-4 w-4' /> PRINT
                                </Button>
                                <Button
                                    variant='secondary'
                                    className='min-w-[140px] bg-orange-500 text-white hover:bg-orange-600'
                                    onClick={handleAddressBookPrint}>
                                    <MapPin className='mr-2 h-4 w-4' /> ADDRESS BOOK
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {/* Results Grid */}
            {showGrid && (
                <Card className='slide-in-from-bottom-5 animate-in overflow-hidden rounded-2xl border-none shadow-xl duration-700 print:hidden'>
                    <CardContent className='space-y-4 p-6'>
                        <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                            <div className='flex items-center gap-4'>
                                <h3 className='font-bold text-slate-800 text-xl'>Search Results</h3>
                                <Badge variant='outline' className='border-indigo-200 bg-indigo-50 px-3 py-1 font-bold text-indigo-700'>
                                    Total: {searchResults.length}
                                </Badge>
                                {selectedRows.length > 0 && (
                                    <Badge className='bg-emerald-500 px-3 py-1 font-bold text-white'>Selected: {selectedRows.length}</Badge>
                                )}
                            </div>
                            <div className='relative w-full max-w-sm'>
                                <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                                <Input
                                    className='border-slate-200 bg-slate-50 pl-10 transition-all focus:bg-white'
                                    placeholder='Search in grid...'
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='overflow-hidden rounded-xl border border-slate-200 shadow-sm'>
                            <ScrollArea className='h-[500px]'>
                                <Table className='relative'>
                                    <TableHeader className='sticky top-0 z-10 bg-slate-100 shadow-sm'>
                                        <TableRow>
                                            <TableHead className='w-12 text-center'>
                                                <Checkbox checked={allSelected} onCheckedChange={(c) => toggleSelectAll(!!c)} />
                                            </TableHead>
                                            <TableHead className='w-16 font-bold text-slate-700'>SL NO</TableHead>
                                            <TableHead className='min-w-[150px] font-bold text-slate-700'>Alumni Name</TableHead>
                                            <TableHead className='font-bold text-slate-700'>Reg. No</TableHead>
                                            <TableHead className='font-bold text-slate-700'>Adm. No</TableHead>
                                            <TableHead className='font-bold text-slate-700'>DOB</TableHead>
                                            <TableHead className='font-bold text-slate-700'>Mobile No</TableHead>
                                            <TableHead className='font-bold text-slate-700'>Email Id</TableHead>
                                            <TableHead className='font-bold text-slate-700'>Class</TableHead>
                                            <TableHead className='font-bold text-slate-700'>Profession</TableHead>
                                            <TableHead className='font-bold text-slate-700'>City</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredResults.map((row, idx) => {
                                            const rowKey = row.almst_id || row.amst_admno || `row-${idx}`;
                                            const isSelected = selectedRows.some(
                                                (r) =>
                                                    (row.almst_id && r.almst_id === row.almst_id) ||
                                                    (row.amst_admno && r.amst_admno === row.amst_admno)
                                            );

                                            return (
                                                <TableRow
                                                    key={rowKey}
                                                    className={`transition-colors hover:bg-slate-50/80 ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                                                    <TableCell className='text-center'>
                                                        <Checkbox checked={isSelected} onCheckedChange={() => toggleRowSelection(row)} />
                                                    </TableCell>
                                                    <TableCell className='font-medium text-slate-500'>{idx + 1}</TableCell>
                                                    <TableCell className='font-bold text-slate-900'>
                                                        {row.studentname || row.amsT_FirstName}
                                                    </TableCell>
                                                    <TableCell className='text-slate-600'>{row.amst_registrationno || 'N/A'}</TableCell>
                                                    <TableCell className='font-medium text-slate-600'>{row.amst_admno || 'N/A'}</TableCell>
                                                    <TableCell className='text-slate-600'>
                                                        {row.amst_dob ? new Date(row.amst_dob).toLocaleDateString() : row.amsT_DOB || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className='text-slate-600'>
                                                        {row.amst_mobileno || row.amsT_MobileNo || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className='text-slate-600'>
                                                        {row.amst_emailid || row.amsT_emailId || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className='text-slate-600'>
                                                        <Badge variant='outline' className='bg-slate-50 font-bold text-[10px] uppercase'>
                                                            {row.asmcl_classname || row.ALMMC_MembershipCategory || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className='text-slate-600 italic'>
                                                        {row.ALSPR_Designation || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className='font-semibold text-slate-600'>
                                                        {row.ALMST_ConCity || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Print Templates (Only visible during print) */}
            <div
                className='print-only-container hidden w-full font-sans print:visible print:static print:m-0 print:block print:p-0'
                id='print-section'>
                {/* Standard Table Print */}
                {printMode === 'standard' && (
                    <div className='print-section-standard w-full'>
                        <div className='mb-6 text-center'>
                            <h1 className='mb-1 font-bold text-slate-900 text-xl uppercase tracking-tight'>Alumni Search Report</h1>
                            <div className='flex items-center justify-center gap-4 font-medium text-[10px] text-slate-500 italic'>
                                <span>Generated: {new Date().toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Total Records: {selectedRows.length}</span>
                            </div>
                        </div>
                        <table className='w-full border-collapse border-2 border-black'>
                            <thead className='bg-slate-50'>
                                <tr>
                                    <th className='w-[30px] border border-black p-1.5 font-bold text-[9px] uppercase'>SL</th>
                                    <th className='min-w-[100px] border border-black p-1.5 text-left font-bold text-[9px] uppercase'>
                                        Alumni Name
                                    </th>
                                    <th className='w-[60px] border border-black p-1.5 font-bold text-[9px] uppercase'>Reg. No</th>
                                    <th className='w-[50px] border border-black p-1.5 font-bold text-[9px] uppercase'>Adm. No</th>
                                    <th className='w-[65px] border border-black p-1.5 font-bold text-[9px] uppercase'>DOB</th>
                                    <th className='w-[75px] border border-black p-1.5 font-bold text-[9px] uppercase'>Mobile</th>
                                    <th className='min-w-[80px] border border-black p-1.5 font-bold text-[9px] uppercase'>Email</th>
                                    <th className='w-[50px] border border-black p-1.5 font-bold text-[9px] uppercase'>Class</th>
                                    <th className='w-[70px] border border-black p-1.5 font-bold text-[9px] uppercase'>Profession</th>
                                    <th className='min-w-[120px] border border-black p-1.5 font-bold text-[9px] uppercase'>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className='border border-black p-1.5 text-center font-medium text-[9px]'>{idx + 1}</td>
                                        <td className='border border-black p-1.5 font-bold text-[9px] text-slate-900 uppercase'>
                                            {row.studentname || row.amsT_FirstName}
                                        </td>
                                        <td className='border border-black p-1.5 text-[9px]'>{row.amst_registrationno || 'N/A'}</td>
                                        <td className='border border-black p-1.5 font-medium text-[9px]'>{row.amst_admno || 'N/A'}</td>
                                        <td className='whitespace-nowrap border border-black p-1.5 text-center text-[9px]'>
                                            {row.amst_dob ? new Date(row.amst_dob).toLocaleDateString() : row.amsT_DOB || 'N/A'}
                                        </td>
                                        <td className='border border-black p-1.5 text-center font-mono text-[9px]'>
                                            {row.amst_mobileno || row.amsT_MobileNo || 'N/A'}
                                        </td>
                                        <td className='break-all border border-black p-1.5 text-[9px]'>
                                            {row.amst_emailid || row.amsT_emailId || 'N/A'}
                                        </td>
                                        <td className='border border-black p-1.5 text-center font-medium text-[9px] uppercase'>
                                            {row.asmcl_classname || row.ALMMC_MembershipCategory || 'N/A'}
                                        </td>
                                        <td className='border border-black p-1.5 text-center text-[9px]'>
                                            {row.ALSPR_Designation || 'N/A'}
                                        </td>
                                        <td className='border border-black p-1.5 font-medium text-[8px] text-slate-700 leading-tight'>
                                            {row.ALMST_FullAddess || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Address Book Print Layout */}
                {printMode === 'address' && (
                    <div className='print-section-address grid w-full grid-cols-2 gap-4'>
                        {selectedRows.map((row, idx) => (
                            <div
                                key={idx}
                                className='relative flex h-[180px] break-inside-avoid flex-col justify-between border-2 border-black bg-white p-4'>
                                <div className='absolute top-1 right-2 font-mono text-[8px] text-slate-400'>#{idx + 1}</div>
                                <div>
                                    <div className='mb-1 font-bold text-[9px] text-slate-500 uppercase tracking-tight'>
                                        {row.ALMST_MembershipId || row.amst_admno || 'NO-ID'} • {row.ALMMC_MembershipCategory || 'ALUMNI'}
                                    </div>
                                    <div className='mb-2 border-slate-200 border-b pb-1 font-bold text-slate-900 text-sm uppercase'>
                                        {row.studentname || row.amsT_FirstName}
                                    </div>
                                    <div className='min-h-[50px] font-medium text-[10px] text-slate-700 leading-snug'>
                                        {row.ALMST_FullAddess || 'Address Not Available'}
                                        {(row.ALMST_District || row.ALMST_ConCity) && (
                                            <div className='mt-1'>
                                                {[row.ALMST_ConCity, row.ALMST_District, row.ALMST_PerPincode].filter(Boolean).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-0.5 border-slate-100 border-t pt-2'>
                                    {(row.amst_mobileno || row.amsT_MobileNo) && (
                                        <span className='flex items-center gap-1 font-bold text-[9px] text-slate-800'>
                                            M: {row.amst_mobileno || row.amsT_MobileNo}
                                        </span>
                                    )}
                                    {(row.amst_emailid || row.amsT_emailId) && (
                                        <span className='break-all font-medium text-[9px] text-slate-600'>
                                            E: {row.amst_emailid || row.amsT_emailId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait !important;
                        margin: 10mm !important;
                    }
                    html, body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        visibility: hidden !important;
                        height: auto !important;
                        min-height: 0 !important;
                        width: 100% !important;
                    }
                    
                    #print-section, #print-section * {
                        visibility: visible !important;
                    }

                    #print-section {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 190mm !important; /* A4 (210mm) - 20mm margins */
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: auto !important;
                    }
                    
                    th, td {
                        padding: 4px 6px !important;
                        border: 1px solid #000 !important;
                        word-break: break-word !important;
                        font-size: 8.5pt !important;
                        color: black !important;
                    }
                    
                    thead {
                        display: table-header-group !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .print-section-standard, .print-section-address {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* Avoid breaking address cards */
                    .print-section-address > div {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin-bottom: 10px;
                    }

                    * {
                        animation: none !important;
                        transition: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
