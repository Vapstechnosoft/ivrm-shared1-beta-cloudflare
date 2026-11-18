'use client';

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, ArrowUpDown, Search } from 'lucide-react';
import { IClgSectionAllotmentStudent } from '@/types/college/transactions';

interface StudentTransferListProps {
    availableStudents: IClgSectionAllotmentStudent[];
    setAvailableStudents: React.Dispatch<React.SetStateAction<IClgSectionAllotmentStudent[]>>;
    selectedStudents: IClgSectionAllotmentStudent[];
    setSelectedStudents: React.Dispatch<React.SetStateAction<IClgSectionAllotmentStudent[]>>;
    leftTitle?: string;
    rightTitle?: string;
    showSem?: boolean;
    showSection?: boolean;
}

export function StudentTransferList({
    availableStudents,
    setAvailableStudents,
    selectedStudents,
    setSelectedStudents,
    leftTitle = 'Available Students',
    rightTitle = 'Students To Allot',
    showSem = false,
    showSection = false
}: StudentTransferListProps) {
    const [searchLeft, setSearchLeft] = useState('');
    const [searchRight, setSearchRight] = useState('');
    const [sortKeyLeft, setSortKeyLeft] = useState<'name' | 'admNo'>('name');
    const [sortAscLeft, setSortAscLeft] = useState(true);
    const [sortKeyRight, setSortKeyRight] = useState<'name' | 'admNo'>('name');
    const [sortAscRight, setSortAscRight] = useState(true);

    const getFullName = (s: IClgSectionAllotmentStudent) => {
        if (s.studentName) return s.studentName;
        return [s.amcsT_FirstName, s.amcsT_MiddleName, s.amcsT_LastName]
            .filter((x) => x && x !== '0')
            .join(' ')
            .trim();
    };

    // Filtered & Sorted Left List
    const filteredLeft = useMemo(() => {
        let list = availableStudents.filter((s) => {
            const name = getFullName(s).toLowerCase();
            const adm = (s.amcsT_AdmNo || '').toLowerCase();
            const term = searchLeft.toLowerCase();
            return name.includes(term) || adm.includes(term);
        });

        list.sort((a, b) => {
            const valA = sortKeyLeft === 'name' ? getFullName(a).toLowerCase() : (a.amcsT_AdmNo || '').toLowerCase();
            const valB = sortKeyLeft === 'name' ? getFullName(b).toLowerCase() : (b.amcsT_AdmNo || '').toLowerCase();
            if (valA < valB) return sortAscLeft ? -1 : 1;
            if (valA > valB) return sortAscLeft ? 1 : -1;
            return 0;
        });

        return list;
    }, [availableStudents, searchLeft, sortKeyLeft, sortAscLeft]);

    // Filtered & Sorted Right List
    const filteredRight = useMemo(() => {
        let list = selectedStudents.filter((s) => {
            const name = getFullName(s).toLowerCase();
            const adm = (s.amcsT_AdmNo || '').toLowerCase();
            const term = searchRight.toLowerCase();
            return name.includes(term) || adm.includes(term);
        });

        list.sort((a, b) => {
            const valA = sortKeyRight === 'name' ? getFullName(a).toLowerCase() : (a.amcsT_AdmNo || '').toLowerCase();
            const valB = sortKeyRight === 'name' ? getFullName(b).toLowerCase() : (b.amcsT_AdmNo || '').toLowerCase();
            if (valA < valB) return sortAscRight ? -1 : 1;
            if (valA > valB) return sortAscRight ? 1 : -1;
            return 0;
        });

        return list;
    }, [selectedStudents, searchRight, sortKeyRight, sortAscRight]);

    // Left selection handlers
    const allLeftSelected = useMemo(
        () => filteredLeft.length > 0 && filteredLeft.every((s) => s.Selected),
        [filteredLeft]
    );

    const toggleSelectAllLeft = (checked: boolean) => {
        const ids = new Set(filteredLeft.map((s) => s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id));
        setAvailableStudents((prev) =>
            prev.map((s) => {
                const id = s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id;
                return ids.has(id) ? { ...s, Selected: checked } : s;
            })
        );
    };

    const toggleSelectLeft = (student: IClgSectionAllotmentStudent) => {
        const id = student.amsT_Id ?? student.amcsT_Id ?? student.acysT_Id ?? student.AMST_Id;
        setAvailableStudents((prev) =>
            prev.map((s) => {
                const sId = s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id;
                return sId === id ? { ...s, Selected: !s.Selected } : s;
            })
        );
    };

    // Right selection handlers
    const allRightSelected = useMemo(
        () => filteredRight.length > 0 && filteredRight.every((s) => s.Selected1),
        [filteredRight]
    );

    const toggleSelectAllRight = (checked: boolean) => {
        const ids = new Set(filteredRight.map((s) => s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id));
        setSelectedStudents((prev) =>
            prev.map((s) => {
                const id = s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id;
                return ids.has(id) ? { ...s, Selected1: checked } : s;
            })
        );
    };

    const toggleSelectRight = (student: IClgSectionAllotmentStudent) => {
        const id = student.amsT_Id ?? student.amcsT_Id ?? student.acysT_Id ?? student.AMST_Id;
        setSelectedStudents((prev) =>
            prev.map((s) => {
                const sId = s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id;
                return sId === id ? { ...s, Selected1: !s.Selected1 } : s;
            })
        );
    };

    // Transfer Left -> Right
    const moveToRight = () => {
        const toMove = availableStudents.filter((s) => s.Selected);
        if (toMove.length === 0) return;

        setSelectedStudents((prev) => [
            ...prev,
            ...toMove.map((s) => ({ ...s, Selected: false, Selected1: true }))
        ]);
        setAvailableStudents((prev) => prev.filter((s) => !s.Selected));
    };

    // Transfer Right -> Left
    const moveToLeft = () => {
        const toMove = selectedStudents.filter((s) => s.Selected1);
        if (toMove.length === 0) return;

        setAvailableStudents((prev) => [
            ...prev,
            ...toMove.map((s) => ({ ...s, Selected1: false, Selected: true }))
        ]);
        setSelectedStudents((prev) => prev.filter((s) => !s.Selected1));
    };

    return (
        <div className='grid grid-cols-1 items-center gap-4 lg:grid-cols-11'>
            {/* Left Table: Available Students */}
            <div className='flex flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-5'>
                <div className='flex items-center justify-between pb-3'>
                    <div className='flex items-center gap-2'>
                        <h4 className='font-semibold text-sm tracking-tight text-foreground'>{leftTitle}</h4>
                        <Badge variant='secondary' className='rounded-full px-2 text-xs'>
                            {availableStudents.length}
                        </Badge>
                    </div>
                    <div className='relative w-44'>
                        <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                        <Input
                            placeholder='Search students...'
                            value={searchLeft}
                            onChange={(e) => setSearchLeft(e.target.value)}
                            className='h-8 pl-8 text-xs'
                        />
                    </div>
                </div>

                <div className='max-h-80 overflow-y-auto rounded-lg border border-border/60 bg-background'>
                    <Table>
                        <TableHeader className='sticky top-0 z-10 bg-muted/80 backdrop-blur-sm'>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead className='w-10 text-center font-bold'>#</TableHead>
                                <TableHead className='w-10 text-center'>
                                    <Checkbox
                                        checked={allLeftSelected}
                                        onCheckedChange={(checked) => toggleSelectAllLeft(!!checked)}
                                    />
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => {
                                        setSortKeyLeft('name');
                                        setSortAscLeft(!sortAscLeft);
                                    }}>
                                    <div className='flex items-center gap-1'>
                                        Student Name
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                {showSem && <TableHead className='font-bold'>SEM</TableHead>}
                                {showSection && <TableHead className='font-bold'>Section</TableHead>}
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => {
                                        setSortKeyLeft('admNo');
                                        setSortAscLeft(!sortAscLeft);
                                    }}>
                                    <div className='flex items-center gap-1'>
                                        Adm. No.
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeft.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={showSem || showSection ? 5 : 4} className='h-24 text-center text-muted-foreground text-xs'>
                                        No students available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeft.map((student, idx) => (
                                    <TableRow
                                        key={student.amsT_Id ?? student.amcsT_Id ?? student.acysT_Id ?? idx}
                                        className={`transition-colors cursor-pointer ${student.Selected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                        onClick={() => toggleSelectLeft(student)}>
                                        <TableCell className='text-center text-muted-foreground text-xs'>{idx + 1}</TableCell>
                                        <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={!!student.Selected}
                                                onCheckedChange={() => toggleSelectLeft(student)}
                                            />
                                        </TableCell>
                                        <TableCell className='font-medium text-xs text-foreground'>
                                            {getFullName(student)}
                                        </TableCell>
                                        {showSem && <TableCell className='text-xs'>{student.amsE_SEMName || '-'}</TableCell>}
                                        {showSection && <TableCell className='text-xs'>{student.acmS_SectionName || '-'}</TableCell>}
                                        <TableCell className='font-mono text-xs text-muted-foreground'>
                                            {student.amcsT_AdmNo || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Middle Action Buttons */}
            <div className='flex flex-row justify-center gap-3 lg:col-span-1 lg:flex-col lg:items-center'>
                <Button
                    type='button'
                    variant='default'
                    size='icon'
                    onClick={moveToRight}
                    disabled={!availableStudents.some((s) => s.Selected)}
                    className='h-10 w-10 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95'
                    title='Move Selected Right'>
                    <ChevronRight className='h-5 w-5' />
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={moveToLeft}
                    disabled={!selectedStudents.some((s) => s.Selected1)}
                    className='h-10 w-10 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95'
                    title='Move Selected Left'>
                    <ChevronLeft className='h-5 w-5' />
                </Button>
            </div>

            {/* Right Table: Selected Students */}
            <div className='flex flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-5'>
                <div className='flex items-center justify-between pb-3'>
                    <div className='flex items-center gap-2'>
                        <h4 className='font-semibold text-sm tracking-tight text-foreground'>{rightTitle}</h4>
                        <Badge variant='default' className='rounded-full px-2 text-xs'>
                            {selectedStudents.length}
                        </Badge>
                    </div>
                    <div className='relative w-44'>
                        <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                        <Input
                            placeholder='Search selected...'
                            value={searchRight}
                            onChange={(e) => setSearchRight(e.target.value)}
                            className='h-8 pl-8 text-xs'
                        />
                    </div>
                </div>

                <div className='max-h-80 overflow-y-auto rounded-lg border border-border/60 bg-background'>
                    <Table>
                        <TableHeader className='sticky top-0 z-10 bg-muted/80 backdrop-blur-sm'>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead className='w-10 text-center font-bold'>#</TableHead>
                                <TableHead className='w-10 text-center'>
                                    <Checkbox
                                        checked={allRightSelected}
                                        onCheckedChange={(checked) => toggleSelectAllRight(!!checked)}
                                    />
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => {
                                        setSortKeyRight('name');
                                        setSortAscRight(!sortAscRight);
                                    }}>
                                    <div className='flex items-center gap-1'>
                                        Student Name
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                {showSem && <TableHead className='font-bold'>SEM</TableHead>}
                                {showSection && <TableHead className='font-bold'>Section</TableHead>}
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => {
                                        setSortKeyRight('admNo');
                                        setSortAscRight(!sortAscRight);
                                    }}>
                                    <div className='flex items-center gap-1'>
                                        Adm. No.
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRight.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={showSem || showSection ? 5 : 4} className='h-24 text-center text-muted-foreground text-xs'>
                                        No students selected
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRight.map((student, idx) => (
                                    <TableRow
                                        key={student.amsT_Id ?? student.amcsT_Id ?? student.acysT_Id ?? idx}
                                        className={`transition-colors cursor-pointer ${student.Selected1 ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                        onClick={() => toggleSelectRight(student)}>
                                        <TableCell className='text-center text-muted-foreground text-xs'>{idx + 1}</TableCell>
                                        <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={!!student.Selected1}
                                                onCheckedChange={() => toggleSelectRight(student)}
                                            />
                                        </TableCell>
                                        <TableCell className='font-medium text-xs text-foreground'>
                                            {getFullName(student)}
                                        </TableCell>
                                        {showSem && <TableCell className='text-xs'>{student.amsE_SEMName || '-'}</TableCell>}
                                        {showSection && <TableCell className='text-xs'>{student.acmS_SectionName || '-'}</TableCell>}
                                        <TableCell className='font-mono text-xs text-muted-foreground'>
                                            {student.amcsT_AdmNo || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
