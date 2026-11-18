'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Layers, Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ISubjectItem } from '../types';

interface SubjectGroupFormProps {
    groupName: string;
    totSubjects: string;
    maxAplSubjects: string;
    minAplSubjects: string;
    bestOff: string;
    subjectList: ISubjectItem[];
    isEditing: boolean;
    isSaving: boolean;

    onChangeGroupName: (val: string) => void;
    onChangeTotSubjects: (val: string) => void;
    onChangeMaxAplSubjects: (val: string) => void;
    onChangeMinAplSubjects: (val: string) => void;
    onChangeBestOff: (val: string) => void;
    onToggleSubject: (subjectId: number, checked: boolean) => void;
    onToggleAllSubjects: (checked: boolean) => void;

    onSubmit: () => void;
    onReset: () => void;
}

export function SubjectGroupForm({
    groupName,
    totSubjects,
    maxAplSubjects,
    minAplSubjects,
    bestOff,
    subjectList,
    isEditing,
    isSaving,

    onChangeGroupName,
    onChangeTotSubjects,
    onChangeMaxAplSubjects,
    onChangeMinAplSubjects,
    onChangeBestOff,
    onToggleSubject,
    onToggleAllSubjects,

    onSubmit,
    onReset
}: SubjectGroupFormProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<string>('ismS_SubjectName');
    const [sortAsc, setSortAsc] = useState<boolean>(true);

    const filteredSubjects = useMemo(() => {
        let list = [...subjectList];
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(
                (s) => (s.ismS_SubjectName || '').toLowerCase().includes(q) || (s.ismS_SubjectCode || '').toLowerCase().includes(q)
            );
        }

        if (sortKey) {
            list.sort((a, b) => {
                const valA = (a as any)[sortKey] ?? '';
                const valB = (b as any)[sortKey] ?? '';
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
            });
        }

        return list;
    }, [subjectList, searchTerm, sortKey, sortAsc]);

    const selectedCount = useMemo(() => {
        return subjectList.filter((s) => s.checkedvalue).length;
    }, [subjectList]);

    const isAllSelected = useMemo(() => {
        if (filteredSubjects.length === 0) return false;
        return filteredSubjects.every((s) => s.checkedvalue);
    }, [filteredSubjects]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    // Validations on input changes
    const handleTotSubjectsChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        const num = Number(cleanVal);
        if (cleanVal !== '' && num > subjectList.length) {
            toast.error(`You cannot set Maximum Subjects more than available subjects (${subjectList.length})`);
            return;
        }
        if (cleanVal === '0') {
            toast.error('Max Subjects cannot be set to 0');
            return;
        }
        onChangeTotSubjects(cleanVal);
    };

    const handleMaxAplSubjectsChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        if (!totSubjects) {
            toast.error('Please set Max Subjects first');
            return;
        }
        const num = Number(cleanVal);
        const maxTot = Number(totSubjects);
        if (cleanVal !== '' && num > maxTot) {
            toast.error(`Max Applicable Subjects cannot exceed Max Subjects (${totSubjects})`);
            return;
        }
        if (cleanVal === '0') {
            toast.error('Max Applicable Subjects cannot be set to 0');
            return;
        }
        onChangeMaxAplSubjects(cleanVal);
    };

    const handleMinAplSubjectsChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        if (!maxAplSubjects) {
            toast.error('Please set Max Applicable Subjects first');
            return;
        }
        const num = Number(cleanVal);
        const maxApl = Number(maxAplSubjects);
        if (cleanVal !== '' && num > maxApl) {
            toast.error(`Min Applicable Subjects cannot exceed Max Applicable Subjects (${maxAplSubjects})`);
            return;
        }
        if (cleanVal === '0') {
            toast.error('Min Applicable Subjects cannot be set to 0');
            return;
        }
        onChangeMinAplSubjects(cleanVal);
    };

    const handleBestOffChange = (val: string) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        onChangeBestOff(cleanVal);
    };

    const handleBestOffBlur = () => {
        if (!bestOff) return;
        const numBest = Number(bestOff);
        const minApl = Number(minAplSubjects);
        const maxApl = Number(maxAplSubjects);

        if (maxAplSubjects && numBest > maxApl) {
            toast.error(`Best Off Subjects cannot exceed Max Applicable Subjects (${maxAplSubjects})`);
            onChangeBestOff('');
            return;
        }
        if (minAplSubjects && numBest < minApl) {
            toast.error(`Best Off Subjects cannot be less than Min Applicable Subjects (${minAplSubjects})`);
            onChangeBestOff('');
            return;
        }
    };

    const handleSubjectToggle = (subjectId: number, checked: boolean) => {
        if (checked) {
            if (!totSubjects) {
                toast.error('Please set Max Subjects first');
                return;
            }
            const maxTot = Number(totSubjects);
            if (selectedCount >= maxTot) {
                toast.error(`Selection of subjects cannot exceed Max Subjects (${totSubjects})`);
                return;
            }
        }
        onToggleSubject(subjectId, checked);
    };

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            if (!totSubjects) {
                toast.error('Please set Max Subjects first');
                return;
            }
            const maxTot = Number(totSubjects);
            if (subjectList.length > maxTot) {
                toast.error(`Total subjects (${subjectList.length}) exceeds Max Subjects (${totSubjects}). Please select individually.`);
                return;
            }
        }
        onToggleAllSubjects(checked);
    };

    const isFormValid = !!groupName.trim() && !!totSubjects && !!maxAplSubjects && !!minAplSubjects && !!bestOff;

    return (
        <Card className='border-border/60 shadow-sm transition-all duration-200 hover:shadow-md'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <Layers className='h-5 w-5 text-primary' />
                            {isEditing ? 'Edit Master Subject Group' : 'Master Subject Group'}
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Configure college subject groups, total subjects, applicable thresholds, and elective rules
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                {/* Inputs Grid */}
                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                    {/* Group Name */}
                    <div className='space-y-1.5'>
                        <Label htmlFor='group-name' className='font-semibold text-foreground text-xs'>
                            Group Name <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            id='group-name'
                            placeholder='Enter Group Name (e.g. Science Core)'
                            value={groupName}
                            onChange={(e) => onChangeGroupName(e.target.value)}
                            maxLength={100}
                            className='h-9 text-xs'
                        />
                    </div>

                    {/* Max. Subjects */}
                    <div className='space-y-1.5'>
                        <Label htmlFor='max-subjs' className='font-semibold text-foreground text-xs'>
                            Max. Subjects <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            id='max-subjs'
                            placeholder={`Max subjects (Available: ${subjectList.length})`}
                            value={totSubjects}
                            onChange={(e) => handleTotSubjectsChange(e.target.value)}
                            maxLength={2}
                            className='h-9 text-xs'
                        />
                    </div>

                    {/* Applicable Subjects row */}
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1.5'>
                            <Label htmlFor='max-apl' className='block truncate font-semibold text-foreground text-xs'>
                                Max. Applicable <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='max-apl'
                                placeholder='Max Applicable'
                                value={maxAplSubjects}
                                onChange={(e) => handleMaxAplSubjectsChange(e.target.value)}
                                maxLength={2}
                                className='h-9 text-xs'
                            />
                        </div>

                        <div className='space-y-1.5'>
                            <Label htmlFor='min-apl' className='block truncate font-semibold text-foreground text-xs'>
                                Min. Applicable <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='min-apl'
                                placeholder='Min Applicable'
                                value={minAplSubjects}
                                onChange={(e) => handleMinAplSubjectsChange(e.target.value)}
                                maxLength={2}
                                className='h-9 text-xs'
                            />
                        </div>
                    </div>

                    {/* Best Off Subjects */}
                    <div className='space-y-1.5'>
                        <Label htmlFor='best-off' className='font-semibold text-foreground text-xs'>
                            Best Off Subjects <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                            id='best-off'
                            placeholder='Best off subjects (e.g. 2)'
                            value={bestOff}
                            onChange={(e) => handleBestOffChange(e.target.value)}
                            onBlur={handleBestOffBlur}
                            maxLength={2}
                            className='h-9 text-xs'
                        />
                    </div>
                </div>

                {/* Subject Selection Table */}
                <div className='space-y-3 pt-2'>
                    <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
                        <Label className='flex items-center gap-2 font-bold text-foreground text-xs'>
                            Select Subjects for Group
                            <span className='font-normal text-primary'>
                                ({selectedCount} of {totSubjects || '0'} selected)
                            </span>
                        </Label>

                        <div className='relative w-full sm:w-64'>
                            <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                            <Input
                                placeholder='Search subjects...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='h-8 pl-8 text-xs'
                            />
                        </div>
                    </div>

                    <div className='custom-scrollbar max-h-72 overflow-x-auto overflow-y-auto rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-muted/50 hover:bg-muted/50'>
                                    <TableHead className='w-14 text-center font-bold text-foreground'>SLNO</TableHead>
                                    <TableHead className='w-14 text-center'>
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={(checked) => handleToggleAll(!!checked)}
                                            aria-label='Select all subjects'
                                        />
                                    </TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none text-left font-bold text-foreground'
                                        onClick={() => handleSort('ismS_SubjectName')}>
                                        <div className='flex items-center gap-1'>
                                            Subject Name
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className='w-44 cursor-pointer select-none text-left font-bold text-foreground'
                                        onClick={() => handleSort('ismS_SubjectCode')}>
                                        <div className='flex items-center gap-1'>
                                            Subject Code
                                            <ArrowUpDown className='h-3 w-3' />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className='h-20 text-center text-muted-foreground text-xs'>
                                            No subjects found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubjects.map((sub, index) => {
                                        const isChecked = !!sub.checkedvalue;
                                        return (
                                            <TableRow
                                                key={sub.ismS_Id}
                                                className={`transition-colors ${
                                                    isChecked ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'
                                                }`}>
                                                <TableCell className='text-center font-medium text-xs'>{index + 1}</TableCell>
                                                <TableCell className='text-center'>
                                                    <Checkbox
                                                        id={`sub-${sub.ismS_Id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => handleSubjectToggle(sub.ismS_Id, !!checked)}
                                                        aria-label={`Select ${sub.ismS_SubjectName}`}
                                                    />
                                                </TableCell>
                                                <TableCell className='text-left font-medium text-foreground text-xs'>
                                                    <label htmlFor={`sub-${sub.ismS_Id}`} className='cursor-pointer select-none'>
                                                        {sub.ismS_SubjectName}
                                                    </label>
                                                </TableCell>
                                                <TableCell className='text-left text-muted-foreground text-xs'>
                                                    {sub.ismS_SubjectCode || '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Form Action Buttons */}
                <div className='flex flex-wrap items-center justify-center gap-3 border-t pt-4'>
                    <Button
                        type='button'
                        onClick={onSubmit}
                        disabled={!isFormValid || isSaving}
                        className='h-9 px-6 font-semibold text-xs shadow-sm'>
                        {isSaving ? (
                            <>
                                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-3.5 w-3.5' />
                                {isEditing ? 'Update' : 'Save'}
                            </>
                        )}
                    </Button>

                    <Button type='button' variant='outline' onClick={onReset} disabled={isSaving} className='h-9 px-4 font-medium text-xs'>
                        <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
