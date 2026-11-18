'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IClgAlumniApprovalDetails } from '@/types/alumni/clg-alumni-approval';
import { Loader2, Search, Users, X } from 'lucide-react';
import { useState } from 'react';

interface AlumniListProps {
    data: IClgAlumniApprovalDetails[];
    onSearch: (id: number, membername: string) => void;
    onCancel: () => void;
    onFilter: (query: string) => void;
    isFiltering: boolean;
}

export default function AlumniList({ data, onSearch, onCancel, onFilter, isFiltering }: AlumniListProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleCheckboxChange = (id: number) => {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-start justify-between gap-4 px-2 md:flex-row md:items-center'>
                <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-primary' />
                    <p className='text-muted-foreground text-sm'>
                        Total Pending Alumni: <span className='font-bold text-foreground'>{data.length}</span>
                    </p>
                </div>
                <div className='relative w-full md:w-72'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <input
                        type='text'
                        placeholder='Search by name...'
                        className='w-full rounded-lg border bg-background py-2 pr-4 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                        onChange={(e) => onFilter(e.target.value)}
                    />
                    {isFiltering && (
                        <div className='-translate-y-1/2 absolute top-1/2 right-3'>
                            <Loader2 className='h-4 w-4 animate-spin text-primary' />
                        </div>
                    )}
                </div>
            </div>

            <ScrollArea className='h-[400px] rounded-md border'>
                <Table>
                    <TableHeader className='sticky top-0 z-10 bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-[50px] text-center'>Select</TableHead>
                            <TableHead className='w-[60px] text-center'>SLNO</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className='text-center'>Year Admitted</TableHead>
                            <TableHead className='text-center'>Year Left</TableHead>
                            <TableHead>Course Admitted</TableHead>
                            <TableHead>Course Left</TableHead>
                            <TableHead>Branch Admitted</TableHead>
                            <TableHead>Branch Left</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className='h-24 text-center'>
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => {
                                const id = item.alcsreg_id || item.amcsT_ID || index;
                                // Parse name and admno from amcsT_FirstName if needed (Format: "NAME :ADMNO")
                                let displayName = item.membername || item.amcsT_FirstName || '';
                                let displayAdmNo = '';
                                if (!item.membername && item.amcsT_FirstName?.includes(' :')) {
                                    const parts = item.amcsT_FirstName.split(' :');
                                    displayName = parts[0].trim();
                                    displayAdmNo = parts[1].trim();
                                }

                                return (
                                    <TableRow key={id} className={selectedId === id ? 'bg-primary/5' : ''}>
                                        <TableCell className='text-center'>
                                            <Checkbox
                                                checked={selectedId === id}
                                                onCheckedChange={() => handleCheckboxChange(id as number)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                        <TableCell className='font-semibold'>
                                            <div className='flex flex-col'>
                                                <span>{displayName}</span>
                                                {displayAdmNo && (
                                                    <span className='mt-1 w-fit rounded bg-muted px-1.5 py-0.5 font-normal text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                        {displayAdmNo}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {item.admitted_year || item.alcsreG_AdmittedYear || 'N/A'}
                                        </TableCell>
                                        <TableCell className='text-center'>{item.left_year || item.alcsreG_LeftYear || 'N/A'}</TableCell>
                                        <TableCell>{item.admit_course || item.amcO_CourseName || 'N/A'}</TableCell>
                                        <TableCell>{item.left_course || 'N/A'}</TableCell>
                                        <TableCell>{item.admit_branch || item.amB_BranchName || 'N/A'}</TableCell>
                                        <TableCell>{item.left_branch || 'N/A'}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-4'>
                <Button
                    onClick={() => {
                        const selectedItem = data.find((item) => (item.alcsreg_id || item.amcsT_ID) === selectedId);
                        if (selectedItem) {
                            onSearch(selectedId!, selectedItem.membername || selectedItem.amcsT_FirstName || '');
                        }
                    }}
                    disabled={!selectedId}
                    className='min-w-[120px]'>
                    <Search className='mr-2 h-4 w-4' />
                    Search Match
                </Button>
                <Button variant='destructive' onClick={onCancel} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
