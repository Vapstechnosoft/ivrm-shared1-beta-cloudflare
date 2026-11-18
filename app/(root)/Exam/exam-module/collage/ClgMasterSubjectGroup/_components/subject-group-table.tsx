'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, Check, Edit2, Eye, List, Search, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ISubjectGroupRecord } from '../types';

interface SubjectGroupTableProps {
    groups: ISubjectGroupRecord[];
    onEdit: (group: ISubjectGroupRecord) => void;
    onViewSubjects: (group: ISubjectGroupRecord) => void;
    onToggleActive: (group: ISubjectGroupRecord) => void;
}

export function SubjectGroupTable({ groups, onEdit, onViewSubjects, onToggleActive }: SubjectGroupTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<string>('emG_GroupName');
    const [sortAsc, setSortAsc] = useState<boolean>(true);

    const filteredAndSortedGroups = useMemo(() => {
        let list = [...groups];

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter((g) => (g.emG_GroupName || '').toLowerCase().includes(q));
        }

        if (sortKey) {
            list.sort((a, b) => {
                const valA = (a as any)[sortKey] ?? '';
                const valB = (b as any)[sortKey] ?? '';

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortAsc ? valA - valB : valB - valA;
                }
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
            });
        }

        return list;
    }, [groups, searchTerm, sortKey, sortAsc]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    return (
        <Card className='fade-in mt-6 animate-in border-border/60 shadow-sm duration-300'>
            <CardHeader className='border-b pb-4'>
                <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-bold text-foreground text-xl tracking-tight'>
                            <List className='h-5 w-5 text-primary' />
                            Master Group Details
                        </CardTitle>
                        <CardDescription className='mt-0.5 text-muted-foreground text-xs'>
                            Showing {filteredAndSortedGroups.length} of {groups.length} subject groups
                        </CardDescription>
                    </div>

                    <div className='relative w-full sm:w-64'>
                        <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search group name...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='h-9 pl-9 text-xs'
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-6'>
                <div className='overflow-x-auto rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50 hover:bg-muted/50'>
                                <TableHead className='w-14 text-center font-bold text-foreground'>SL NO</TableHead>
                                <TableHead
                                    className='min-w-[180px] cursor-pointer select-none font-bold text-foreground'
                                    onClick={() => handleSort('emG_GroupName')}>
                                    <div className='flex items-center gap-1'>
                                        Group Name
                                        <ArrowUpDown className='h-3 w-3' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer select-none whitespace-nowrap text-center font-bold text-foreground'
                                    onClick={() => handleSort('emG_TotSubjects')}>
                                    <div className='flex items-center justify-center gap-1'>
                                        Total Subjects
                                        <ArrowUpDown className='h-3 w-3' />
                                    </div>
                                </TableHead>
                                <TableHead className='whitespace-nowrap text-center font-bold text-foreground'>Max. Applicable</TableHead>
                                <TableHead className='whitespace-nowrap text-center font-bold text-foreground'>Min. Applicable</TableHead>
                                <TableHead className='whitespace-nowrap text-center font-bold text-foreground'>BestOff Subjects</TableHead>
                                <TableHead className='whitespace-nowrap text-center font-bold text-foreground'>Elective Subjects</TableHead>
                                <TableHead className='w-28 whitespace-nowrap text-center font-bold text-foreground'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedGroups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='h-24 text-center text-muted-foreground text-xs'>
                                        No subject groups found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedGroups.map((row, index) => {
                                    const isElective =
                                        row.emG_ElectiveFlg === true || row.emG_ElectiveFlg === 1 || row.emG_ElectiveFlg === '1';

                                    const isActive = row.emG_ActiveFlag !== false;

                                    return (
                                        <TableRow key={row.emG_Id || index} className='hover:bg-muted/30'>
                                            <TableCell className='text-center font-medium text-xs'>{index + 1}</TableCell>
                                            <TableCell className='text-left font-semibold text-foreground text-xs'>
                                                {row.emG_GroupName}
                                            </TableCell>
                                            <TableCell className='text-center font-medium text-xs'>{row.emG_TotSubjects}</TableCell>
                                            <TableCell className='text-center text-xs'>{row.emG_MaxAplSubjects}</TableCell>
                                            <TableCell className='text-center text-xs'>{row.emG_MinAplSubjects}</TableCell>
                                            <TableCell className='text-center text-xs'>{row.emG_BestOff}</TableCell>
                                            <TableCell className='text-center'>
                                                {isElective ? (
                                                    <span className='inline-flex items-center text-emerald-600 dark:text-emerald-400'>
                                                        <Check className='h-4 w-4 stroke-[3]' />
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center text-destructive'>
                                                        <X className='h-4 w-4 stroke-[3]' />
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className='p-2 text-center'>
                                                <TooltipProvider>
                                                    <div className='flex items-center justify-center gap-1.5'>
                                                        {/* View Subjects */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-7 w-7 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30'
                                                                    onClick={() => onViewSubjects(row)}>
                                                                    <Eye className='h-3.5 w-3.5' />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>View Mapped Subjects</TooltipContent>
                                                        </Tooltip>

                                                        {/* Edit */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-7 w-7 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30'
                                                                    onClick={() => onEdit(row)}>
                                                                    <Edit2 className='h-3.5 w-3.5' />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit Group</TooltipContent>
                                                        </Tooltip>

                                                        {/* Activate / Deactivate Toggle */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className={`h-7 w-7 ${
                                                                        isActive
                                                                            ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30'
                                                                            : 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                                                                    }`}
                                                                    onClick={() => onToggleActive(row)}>
                                                                    {isActive ? (
                                                                        <ToggleRight className='h-4 w-4' />
                                                                    ) : (
                                                                        <ToggleLeft className='h-4 w-4' />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {isActive ? 'Deactivate Group' : 'Activate Group'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
