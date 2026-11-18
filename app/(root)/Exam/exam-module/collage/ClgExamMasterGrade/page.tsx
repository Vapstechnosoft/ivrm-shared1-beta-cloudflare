'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import {
    ArrowUpDown,
    Award,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Eye,
    Loader2,
    Minus,
    Plus,
    Power,
    RefreshCw,
    RotateCcw,
    Save,
    Search,
    SlidersHorizontal,
    Trash2,
    XCircle
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
    deactivateClgExamMasterGrade,
    getClgExamMasterGradeAllDetails,
    getClgExamMasterGradeEditDetails,
    getClgExamMasterGradeViewRecords,
    saveClgExamMasterGrade
} from './actions';
import { ViewGradeModal } from './_components/view-grade-modal';
import type {
    IClgGradeDetailRecord,
    IClgGradeSubRow,
    IClgMasterGrade
} from './types';

const initialRow: IClgGradeSubRow = {
    count: 0,
    EMGD_From: '',
    EMGD_To: '',
    EMGD_Name: '',
    EMGD_GradePoints: '',
    EMGD_Remarks: ''
};

export default function ClgExamMasterGradePage() {
    // Form state
    const [emgRId, setEmgRId] = useState<number>(0);
    const [emgDId, setEmgDId] = useState<number>(0);
    const [gradeName, setGradeName] = useState<string>('');
    const [marksPerFlag, setMarksPerFlag] = useState<'P' | 'M'>('P');
    const [rows, setRows] = useState<IClgGradeSubRow[]>([{ ...initialRow }]);
    const [submitted, setSubmitted] = useState<boolean>(false);

    // Grid / List State
    const [gradeList, setGradeList] = useState<IClgMasterGrade[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Search and Pagination
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string>('emgR_GradeName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [viewGradeName, setViewGradeName] = useState<string>('');
    const [viewRecords, setViewRecords] = useState<IClgGradeDetailRecord[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);

    // Load Data
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getClgExamMasterGradeAllDetails();

            if (response.success && response.data) {
                const rawList: IClgMasterGrade[] =
                    response.data.grade_list ||
                    (Array.isArray(response.data) ? response.data : []);

                setGradeList(rawList);
            } else {
                toast.error(response.message || 'Failed to load master grades');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error fetching master grade list');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Clear / Reset Form
    const handleClear = () => {
        setEmgRId(0);
        setEmgDId(0);
        setGradeName('');
        setMarksPerFlag('P');
        setRows([{ ...initialRow, count: 0 }]);
        setSubmitted(false);
    };

    // Sub-Row Add / Remove
    const handleAddRow = () => {
        if (!gradeName.trim()) {
            setSubmitted(true);
            toast.error('Please enter Grade Name first');
            return;
        }

        const newRow: IClgGradeSubRow = {
            count: rows.length,
            EMGD_From: '',
            EMGD_To: '',
            EMGD_Name: '',
            EMGD_GradePoints: '',
            EMGD_Remarks: ''
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length > 1) {
            const updated = rows.filter((_, idx) => idx !== index).map((r, i) => ({ ...r, count: i }));
            setRows(updated);
        }
    };

    const updateRowField = (index: number, field: keyof IClgGradeSubRow, value: string) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: value };
        setRows(updated);
    };

    // Validation on Blur for Sub-Rows
    const validateFrom = (rowIndex: number) => {
        const targetRow = rows[rowIndex];
        if (!targetRow || !targetRow.EMGD_From) return;

        const numFrom = Number(targetRow.EMGD_From);
        if (isNaN(numFrom)) {
            Swal.fire({ icon: 'warning', title: 'Invalid Number', text: 'Please enter a valid numeric value' });
            updateRowField(rowIndex, 'EMGD_From', '');
            return;
        }

        const formatted = numFrom.toFixed(2);
        const maxVal = marksPerFlag === 'P' ? 100 : 1000;

        if (numFrom > maxVal) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Exceeded',
                text: `Max Value Is ${maxVal}`
            });
            updateRowField(rowIndex, 'EMGD_From', '');
            return;
        }

        // Check duplicates and interval overlaps with other rows
        let duplicateCount = 0;
        rows.forEach((r, idx) => {
            if (idx !== rowIndex && r.EMGD_From && r.EMGD_To) {
                const rFrom = Number(r.EMGD_From);
                const rTo = Number(r.EMGD_To);
                const minR = Math.min(rFrom, rTo);
                const maxR = Math.max(rFrom, rTo);

                if (numFrom >= minR && numFrom <= maxR) {
                    duplicateCount++;
                }
            } else if (idx === rowIndex && r.EMGD_To) {
                const rTo = Number(r.EMGD_To);
                if (numFrom === rTo) {
                    duplicateCount++;
                }
            }
        });

        if (duplicateCount > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Overlap Detected',
                text: 'Value Is Already Existed In Other Details'
            });
            updateRowField(rowIndex, 'EMGD_From', '');
            return;
        }

        // Sub-range check
        if (targetRow.EMGD_To && rows.length > 1) {
            const numTo = Number(targetRow.EMGD_To);
            const minT = Math.min(numFrom, numTo);
            const maxT = Math.max(numFrom, numTo);

            let subCount = 0;
            rows.forEach((r, idx) => {
                if (idx !== rowIndex && r.EMGD_From && r.EMGD_To) {
                    const rFrom = Number(r.EMGD_From);
                    const rTo = Number(r.EMGD_To);
                    const minR = Math.min(rFrom, rTo);
                    const maxR = Math.max(rFrom, rTo);

                    if (minR >= minT && maxR <= maxT) {
                        subCount++;
                    }
                }
            });

            if (subCount > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Range',
                    text: 'Entered Details Are Sub Values Of Existed One !!!!'
                });
                updateRowField(rowIndex, 'EMGD_From', '');
                return;
            }
        }

        updateRowField(rowIndex, 'EMGD_From', formatted);
    };

    const validateTo = (rowIndex: number) => {
        const targetRow = rows[rowIndex];
        if (!targetRow || !targetRow.EMGD_To) return;

        const numTo = Number(targetRow.EMGD_To);
        if (isNaN(numTo)) {
            Swal.fire({ icon: 'warning', title: 'Invalid Number', text: 'Please enter a valid numeric value' });
            updateRowField(rowIndex, 'EMGD_To', '');
            return;
        }

        const formatted = numTo.toFixed(2);
        const maxVal = marksPerFlag === 'P' ? 100 : 1000;

        if (numTo > maxVal) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Exceeded',
                text: `Max Value Is ${maxVal}`
            });
            updateRowField(rowIndex, 'EMGD_To', '');
            return;
        }

        // Check duplicate & interval overlaps
        let duplicateCount = 0;
        rows.forEach((r, idx) => {
            if (idx !== rowIndex && r.EMGD_From && r.EMGD_To) {
                const rFrom = Number(r.EMGD_From);
                const rTo = Number(r.EMGD_To);
                const minR = Math.min(rFrom, rTo);
                const maxR = Math.max(rFrom, rTo);

                if (numTo >= minR && numTo <= maxR) {
                    duplicateCount++;
                }
            } else if (idx === rowIndex && r.EMGD_From) {
                const rFrom = Number(r.EMGD_From);
                if (numTo === rFrom) {
                    duplicateCount++;
                }
            }
        });

        if (duplicateCount > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Overlap Detected',
                text: 'Value Is Already Existed In Other Details'
            });
            updateRowField(rowIndex, 'EMGD_To', '');
            return;
        }

        // Sub-range check
        if (targetRow.EMGD_From && rows.length > 1) {
            const numFrom = Number(targetRow.EMGD_From);
            const minT = Math.min(numFrom, numTo);
            const maxT = Math.max(numFrom, numTo);

            let subCount = 0;
            rows.forEach((r, idx) => {
                if (idx !== rowIndex && r.EMGD_From && r.EMGD_To) {
                    const rFrom = Number(r.EMGD_From);
                    const rTo = Number(r.EMGD_To);
                    const minR = Math.min(rFrom, rTo);
                    const maxR = Math.max(rFrom, rTo);

                    if (minR >= minT && maxR <= maxT) {
                        subCount++;
                    }
                }
            });

            if (subCount > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Range',
                    text: 'Entered Details Are Sub Values Of Existed One !!!!'
                });
                updateRowField(rowIndex, 'EMGD_To', '');
                return;
            }
        }

        updateRowField(rowIndex, 'EMGD_To', formatted);
    };

    const validateGrade = (rowIndex: number) => {
        const targetRow = rows[rowIndex];
        if (!targetRow || !targetRow.EMGD_Name.trim()) return;

        const gName = targetRow.EMGD_Name.trim().toUpperCase();
        if (gName === 'AB' || gName === 'M' || gName === 'L') {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Grade Name',
                text: 'AB, L, M Are Not Allowed For Grade Name'
            });
            updateRowField(rowIndex, 'EMGD_Name', '');
            return;
        }

        let duplicateCount = 0;
        rows.forEach((r, idx) => {
            if (idx !== rowIndex && r.EMGD_Name) {
                if (r.EMGD_Name.trim().toUpperCase() === gName) {
                    duplicateCount++;
                }
            }
        });

        if (duplicateCount > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Grade',
                text: 'Duplicate Grade !!!'
            });
            updateRowField(rowIndex, 'EMGD_Name', '');
            return;
        }

        updateRowField(rowIndex, 'EMGD_Name', gName);
    };

    const validatePoints = (rowIndex: number) => {
        const targetRow = rows[rowIndex];
        if (!targetRow || !targetRow.EMGD_GradePoints) return;

        const points = Number(targetRow.EMGD_GradePoints);
        if (isNaN(points)) {
            Swal.fire({ icon: 'warning', title: 'Invalid Points', text: 'Enter a valid numeric grade point' });
            updateRowField(rowIndex, 'EMGD_GradePoints', '');
            return;
        }

        if (points > 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Exceeded',
                text: 'Max Value Is 10'
            });
            updateRowField(rowIndex, 'EMGD_GradePoints', '');
            return;
        }

        let duplicateCount = 0;
        rows.forEach((r, idx) => {
            if (idx !== rowIndex && r.EMGD_GradePoints) {
                if (Number(r.EMGD_GradePoints) === points) {
                    duplicateCount++;
                }
            }
        });

        if (duplicateCount > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Point',
                text: 'Duplicate Gradepoint !!!'
            });
            updateRowField(rowIndex, 'EMGD_GradePoints', '');
        }
    };

    const validateRemarks = (rowIndex: number) => {
        const targetRow = rows[rowIndex];
        if (!targetRow || !targetRow.EMGD_Remarks.trim()) return;

        const rem = targetRow.EMGD_Remarks.trim().toUpperCase();
        let duplicateCount = 0;
        rows.forEach((r, idx) => {
            if (idx !== rowIndex && r.EMGD_Remarks) {
                if (r.EMGD_Remarks.trim().toUpperCase() === rem) {
                    duplicateCount++;
                }
            }
        });

        if (duplicateCount > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Remarks',
                text: 'Duplicate Grade Remarks !!!'
            });
            updateRowField(rowIndex, 'EMGD_Remarks', '');
        }
    };

    // Save Data
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!gradeName.trim()) {
            toast.error('Please enter Grade Name');
            return;
        }

        // Validate all rows
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (
                !row.EMGD_From ||
                !row.EMGD_To ||
                !row.EMGD_Name.trim() ||
                !row.EMGD_GradePoints ||
                !row.EMGD_Remarks.trim()
            ) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Incomplete Details',
                    text: `Please fill all fields for row #${i + 1}`
                });
                return;
            }
        }

        try {
            setIsSaving(true);
            const payload = {
                EMGR_Id: emgRId,
                EMGD_Id: emgDId,
                EMGR_GradeName: gradeName.trim(),
                EMGR_MarksPerFlag: marksPerFlag,
                sub_list: rows.map((r, i) => ({
                    count: i,
                    EMGD_From: r.EMGD_From,
                    EMGD_To: r.EMGD_To,
                    EMGD_Name: r.EMGD_Name.trim(),
                    EMGD_GradePoints: r.EMGD_GradePoints,
                    EMGD_Remarks: r.EMGD_Remarks.trim()
                }))
            };

            const response = await saveClgExamMasterGrade(payload);
            const resData = response?.data;

            if (resData?.returnval === true) {
                if (resData.emgR_Id === 0 || (resData.emgR_Id && resData.emgR_Id < 0) || !emgRId) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Record saved successfully'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Record updated successfully'
                    });
                }
                handleClear();
                await loadData();
            } else if (resData?.returnduplicatestatus === 'Duplicate') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Record',
                    text: 'Record already exist'
                });
            } else {
                const msg =
                    emgRId > 0
                        ? 'Failed to update, please contact administrator'
                        : 'Failed to save, please contact administrator';
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: response?.message || msg
                });
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error saving master grade');
        } finally {
            setIsSaving(false);
        }
    };

    // Edit Grade
    const handleEdit = async (record: IClgMasterGrade) => {
        try {
            setIsLoading(true);
            const response = await getClgExamMasterGradeEditDetails(record.emgR_Id);

            if (response.success && response.data) {
                const res = response.data;
                if (res.edit_m_grade && res.edit_m_grade.length > 0) {
                    const main = res.edit_m_grade[0];
                    setEmgRId(main.emgR_Id);
                    setGradeName(main.emgR_GradeName || '');
                    setMarksPerFlag((main.emgR_MarksPerFlag as 'P' | 'M') || 'P');
                }

                if (res.edit_m_grade_details && res.edit_m_grade_details.length > 0) {
                    const subRows: IClgGradeSubRow[] = res.edit_m_grade_details.map((d, index) => ({
                        count: index,
                        EMGD_From: String(d.emgD_From ?? ''),
                        EMGD_To: String(d.emgD_To ?? ''),
                        EMGD_Name: String(d.emgD_Name ?? ''),
                        EMGD_GradePoints: String(d.emgD_GradePoints ?? ''),
                        EMGD_Remarks: String(d.emgD_Remarks ?? '')
                    }));
                    setRows(subRows);
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'Notice',
                        text: "This Grade Don't Have Details"
                    });
                    setRows([{ ...initialRow, count: 0 }]);
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(response.message || 'Failed to fetch grade details for edit');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error editing master grade');
        } finally {
            setIsLoading(false);
        }
    };

    // View Records Modal
    const handleViewRecords = async (record: IClgMasterGrade) => {
        try {
            setViewGradeName(record.emgR_GradeName);
            setIsViewLoading(true);
            setIsViewModalOpen(true);

            const response = await getClgExamMasterGradeViewRecords(record.emgR_Id);
            if (response.success && response.data) {
                setViewGradeName(response.data.emgR_GradeName || record.emgR_GradeName);
                setViewRecords(response.data.view_grade_details || []);
            } else {
                setViewRecords([]);
                toast.error(response.message || 'Failed to fetch details');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error fetching view details');
            setViewRecords([]);
        } finally {
            setIsViewLoading(false);
        }
    };

    // Activate / Deactivate
    const handleToggleActive = async (record: IClgMasterGrade) => {
        const isActive = Boolean(record.emgR_ActiveFlag);
        const actionVerb = isActive ? 'Deactivate' : 'Activate';
        const confirmMsg = isActive ? 'De-activated' : 'Activated';

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${actionVerb} record?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isActive ? '#d33' : '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${actionVerb} it!`,
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await deactivateClgExamMasterGrade(record);
                const resData = response?.data;

                if (resData?.already_cnt === true) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Dependency Warning',
                        text: 'You Can Not Deactivate This Record, It Has Dependency'
                    });
                } else if (resData?.returnval === true) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: `Record ${confirmMsg} successfully`
                    });
                    await loadData();
                    handleClear();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: `Record ${actionVerb} Failed`
                    });
                }
            } catch (error: any) {
                toast.error(error?.message || `Error attempting to ${actionVerb} record`);
            }
        }
    };

    // Filter and Sort Table Data
    const filteredAndSortedList = useMemo(() => {
        let result = [...gradeList];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((item) => {
                const name = (item.emgR_GradeName || '').toLowerCase();
                const type =
                    item.emgR_MarksPerFlag === 'M' || item.emgR_MarksPerFlag === 'Marks'
                        ? 'marks'
                        : 'percentage';
                const status = item.emgR_ActiveFlag ? 'active' : 'deactive inactive';
                return name.includes(query) || type.includes(query) || status.includes(query);
            });
        }

        result.sort((a, b) => {
            const valA = (a as any)[sortColumn] ?? '';
            const valB = (b as any)[sortColumn] ?? '';

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });

        return result;
    }, [gradeList, searchQuery, sortColumn, sortDirection]);

    // Pagination calculations
    const totalItems = filteredAndSortedList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedList = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAndSortedList.slice(start, start + pageSize);
    }, [filteredAndSortedList, currentPage, pageSize]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return (
        <div className='container mx-auto space-y-6 p-4 max-w-7xl'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                        <Award className='h-6 w-6' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>Master Grade</h1>
                        <p className='text-sm text-muted-foreground'>
                            Define and configure college grade ranges, points, and criteria
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSave} className='space-y-6' noValidate>
                {/* Master Grade Header Card */}
                <Card className='shadow-sm'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-lg font-semibold flex items-center justify-between'>
                            <span>Grade Master</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='max-w-xl mx-auto space-y-5'>
                            {/* Grade Name */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <Label htmlFor='grade_name' className='sm:w-1/3 text-sm font-medium sm:text-right'>
                                    Grade Name <span className='text-destructive'>*</span>
                                </Label>
                                <div className='sm:w-2/3'>
                                    <InputText
                                        id='grade_name'
                                        placeholder='Enter Grade Name'
                                        maxLength={100}
                                        value={gradeName}
                                        onChange={(e) => setGradeName(e.target.value)}
                                        required
                                    />
                                    {submitted && !gradeName.trim() && (
                                        <FormError>Enter Grade Name</FormError>
                                    )}
                                </div>
                            </div>

                            {/* Percentage / Marks Radio Selector */}
                            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                <div className='sm:w-1/3' />
                                <div className='sm:w-2/3'>
                                    <div className='flex items-center justify-center sm:justify-start gap-6 p-3 rounded-lg border bg-muted/20'>
                                        <label className='flex items-center gap-2 cursor-pointer text-sm font-medium select-none'>
                                            <input
                                                type='radio'
                                                name='type'
                                                value='P'
                                                checked={marksPerFlag === 'P'}
                                                onChange={() => setMarksPerFlag('P')}
                                                disabled={rows.length > 1}
                                                className='h-4 w-4 text-primary accent-primary cursor-pointer'
                                            />
                                            <span>Percentage</span>
                                        </label>
                                        <label className='flex items-center gap-2 cursor-pointer text-sm font-medium select-none'>
                                            <input
                                                type='radio'
                                                name='type'
                                                value='M'
                                                checked={marksPerFlag === 'M'}
                                                onChange={() => setMarksPerFlag('M')}
                                                disabled={rows.length > 1}
                                                className='h-4 w-4 text-primary accent-primary cursor-pointer'
                                            />
                                            <span>Marks</span>
                                        </label>
                                    </div>
                                    {rows.length > 1 && (
                                        <p className='text-xs text-muted-foreground mt-1'>
                                            (Evaluation type cannot be changed when multiple detail rows exist)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Master Grade Details Table Card */}
                <Card className='shadow-sm'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-lg font-semibold flex items-center justify-between'>
                            <span>Master Grade Details</span>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleAddRow}
                                className='gap-1.5'>
                                <Plus className='h-4 w-4 text-green-600' />
                                <span>Add Row</span>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='overflow-x-auto rounded-md border'>
                            <table className='w-full border-collapse text-sm text-center'>
                                <thead className='bg-muted/60 border-b font-medium text-muted-foreground'>
                                    <tr>
                                        <th className='p-3 w-16 text-center'>SL NO</th>
                                        <th className='p-3 min-w-[130px] text-center'>
                                            From <span className='text-destructive'>*</span>
                                        </th>
                                        <th className='p-3 min-w-[130px] text-center'>
                                            To <span className='text-destructive'>*</span>
                                        </th>
                                        <th className='p-3 min-w-[120px] text-center'>
                                            Grade <span className='text-destructive'>*</span>
                                        </th>
                                        <th className='p-3 min-w-[120px] text-center'>
                                            Grade Points <span className='text-destructive'>*</span>
                                        </th>
                                        <th className='p-3 min-w-[180px] text-center'>
                                            Remarks <span className='text-destructive'>*</span>
                                        </th>
                                        <th className='p-3 w-24 text-center'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y'>
                                    {rows.map((row, index) => (
                                        <tr key={index} className='hover:bg-muted/20 transition-colors'>
                                            <td className='p-3 font-medium'>{index + 1}</td>
                                            <td className='p-2'>
                                                <Input
                                                    value={row.EMGD_From}
                                                    onChange={(e) => updateRowField(index, 'EMGD_From', e.target.value)}
                                                    onBlur={() => validateFrom(index)}
                                                    placeholder='e.g. 90.00'
                                                    className='text-center h-9 rounded-md'
                                                    required
                                                />
                                                {submitted && !row.EMGD_From && (
                                                    <p className='text-[0.75rem] font-medium text-destructive mt-1'>
                                                        Enter From[Range]
                                                    </p>
                                                )}
                                            </td>
                                            <td className='p-2'>
                                                <Input
                                                    value={row.EMGD_To}
                                                    onChange={(e) => updateRowField(index, 'EMGD_To', e.target.value)}
                                                    onBlur={() => validateTo(index)}
                                                    placeholder='e.g. 100.00'
                                                    className='text-center h-9 rounded-md'
                                                    required
                                                />
                                                {submitted && !row.EMGD_To && (
                                                    <p className='text-[0.75rem] font-medium text-destructive mt-1'>
                                                        Enter To[Range]
                                                    </p>
                                                )}
                                            </td>
                                            <td className='p-2'>
                                                <Input
                                                    value={row.EMGD_Name}
                                                    maxLength={5}
                                                    onChange={(e) => updateRowField(index, 'EMGD_Name', e.target.value)}
                                                    onBlur={() => validateGrade(index)}
                                                    placeholder='e.g. A+'
                                                    className='text-center uppercase h-9 rounded-md'
                                                    required
                                                />
                                                {submitted && !row.EMGD_Name.trim() && (
                                                    <p className='text-[0.75rem] font-medium text-destructive mt-1'>
                                                        Enter Grade
                                                    </p>
                                                )}
                                            </td>
                                            <td className='p-2'>
                                                <Input
                                                    value={row.EMGD_GradePoints}
                                                    maxLength={3}
                                                    onChange={(e) => updateRowField(index, 'EMGD_GradePoints', e.target.value)}
                                                    onBlur={() => validatePoints(index)}
                                                    placeholder='e.g. 9.5'
                                                    className='text-center h-9 rounded-md'
                                                    required
                                                />
                                                {submitted && !row.EMGD_GradePoints && (
                                                    <p className='text-[0.75rem] font-medium text-destructive mt-1'>
                                                        Enter Grade Points
                                                    </p>
                                                )}
                                            </td>
                                            <td className='p-2'>
                                                <Input
                                                    value={row.EMGD_Remarks}
                                                    maxLength={50}
                                                    onChange={(e) => updateRowField(index, 'EMGD_Remarks', e.target.value)}
                                                    onBlur={() => validateRemarks(index)}
                                                    placeholder='e.g. Outstanding'
                                                    className='h-9 rounded-md'
                                                    required
                                                />
                                                {submitted && !row.EMGD_Remarks.trim() && (
                                                    <p className='text-[0.75rem] font-medium text-destructive mt-1'>
                                                        Enter Remarks
                                                    </p>
                                                )}
                                            </td>
                                            <td className='p-2 text-center'>
                                                <div className='flex items-center justify-center gap-1.5'>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50'
                                                        onClick={handleAddRow}
                                                        title='Add Row'>
                                                        <Plus className='h-4 w-4' />
                                                    </Button>
                                                    {rows.length > 1 && (
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                                            onClick={() => handleRemoveRow(index)}
                                                            title='Remove Row'>
                                                            <Minus className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Form Action Buttons */}
                        <div className='flex flex-wrap items-center justify-center gap-3 pt-4 border-t'>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='min-w-[110px] gap-2'>
                                {isSaving ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className='h-4 w-4' />
                                        <span>{emgRId > 0 ? 'Update' : 'Save'}</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleClear}
                                className='min-w-[110px] gap-2'>
                                <RotateCcw className='h-4 w-4' />
                                <span>Cancel</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Master Grade Grid View Card */}
            <Card className='shadow-sm'>
                <CardHeader className='pb-3'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <CardTitle className='text-lg font-semibold'>Master Grade Grid View</CardTitle>
                        <div className='flex items-center gap-2'>
                            <div className='relative w-full sm:w-64'>
                                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <InputText
                                    placeholder='Search grades...'
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className='pl-8 h-9'
                                />
                            </div>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-9 w-9 shrink-0'
                                onClick={loadData}
                                title='Refresh data'>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='overflow-x-auto rounded-md border'>
                        <table className='w-full border-collapse text-sm'>
                            <thead className='bg-muted/60 border-b font-medium text-muted-foreground'>
                                <tr>
                                    <th className='p-3 w-16 text-center'>SL NO</th>
                                    <th
                                        className='p-3 text-left cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgR_GradeName')}>
                                        <div className='flex items-center gap-1'>
                                            <span>Grade Name</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                    <th
                                        className='p-3 text-center cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgR_MarksPerFlag')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>Percentage / Marks</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                    <th className='p-3 text-center w-28'>Status</th>
                                    <th className='p-3 text-center w-36'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y'>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className='p-8 text-center text-muted-foreground'>
                                            <div className='flex flex-col items-center justify-center gap-2'>
                                                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                                <span>Loading master grades...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className='p-8 text-center text-muted-foreground'>
                                            No master grades found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedList.map((record, index) => {
                                        const globalIndex = (currentPage - 1) * pageSize + index + 1;
                                        const isActive = Boolean(record.emgR_ActiveFlag);
                                        const displayType =
                                            record.emgR_MarksPerFlag === 'M' || record.emgR_MarksPerFlag === 'Marks'
                                                ? 'Marks'
                                                : 'Percentage';

                                        return (
                                            <tr key={record.emgR_Id || index} className='hover:bg-muted/20 transition-colors'>
                                                <td className='p-3 text-center font-medium'>{globalIndex}</td>
                                                <td className='p-3 text-left font-medium'>{record.emgR_GradeName}</td>
                                                <td className='p-3 text-center'>
                                                    <Badge variant='outline' className='font-normal'>
                                                        {displayType}
                                                    </Badge>
                                                </td>
                                                <td className='p-3 text-center'>
                                                    {isActive ? (
                                                        <Badge className='bg-green-600 hover:bg-green-700 text-white'>
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant='destructive'>Deactive</Badge>
                                                    )}
                                                </td>
                                                <td className='p-3 text-center'>
                                                    <div className='flex items-center justify-center gap-1.5'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                                                            onClick={() => handleViewRecords(record)}
                                                            title='View Details'>
                                                            <Eye className='h-4 w-4' />
                                                        </Button>

                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                                            onClick={() => handleEdit(record)}
                                                            title='Edit'>
                                                            <Edit className='h-4 w-4' />
                                                        </Button>

                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className={`h-8 w-8 ${isActive
                                                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                                : 'text-destructive hover:text-destructive hover:bg-destructive/10'
                                                                }`}
                                                            onClick={() => handleToggleActive(record)}
                                                            title={isActive ? 'Deactivate Now' : 'Activate Now'}>
                                                            <Power className='h-4 w-4' />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-2'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <span>Showing</span>
                            <span className='font-medium text-foreground'>
                                {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                            </span>
                            <span>to</span>
                            <span className='font-medium text-foreground'>
                                {Math.min(currentPage * pageSize, totalItems)}
                            </span>
                            <span>of</span>
                            <span className='font-medium text-foreground'>{totalItems}</span>
                            <span>records</span>
                        </div>

                        <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1'>
                                <span className='text-xs text-muted-foreground mr-1'>Rows:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className='h-8 rounded border bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary'>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className='flex items-center gap-1'>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1 || isLoading}>
                                    <ChevronsLeft className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || isLoading}>
                                    <ChevronLeft className='h-4 w-4' />
                                </Button>
                                <span className='text-xs px-2'>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || isLoading}>
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || isLoading}>
                                    <ChevronsRight className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details View Modal */}
            <ViewGradeModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                gradeName={viewGradeName}
                records={viewRecords}
                isLoading={isViewLoading}
            />
        </div>
    );
}
