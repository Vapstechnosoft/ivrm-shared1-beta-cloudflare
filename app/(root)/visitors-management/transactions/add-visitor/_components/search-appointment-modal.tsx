'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AppointmentVisitorData } from '@/types/visitors-management/transactions';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (visitor: AppointmentVisitorData) => void;
    onSearch: (query: string) => Promise<AppointmentVisitorData[]>;
}

export const SearchAppointmentModal = ({ isOpen, onClose, onSelect, onSearch }: SearchAppointmentModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AppointmentVisitorData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const data = await onSearch(query);
            setResults(data);
            setHasSearched(true);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Search Appointment Visitors</DialogTitle>
                </DialogHeader>
                <div className='flex gap-2'>
                    <Input placeholder='Search by Name, Mobile No, Email...' value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? (
                            'Searching...'
                        ) : (
                            <>
                                <Search className='mr-2 h-4 w-4' /> Search
                            </>
                        )}
                    </Button>
                </div>

                <div className='mt-4'>
                    {results.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Visitor Name</TableHead>
                                    <TableHead>Contact No</TableHead>
                                    <TableHead>Visit Date</TableHead>
                                    <TableHead>Staff Name</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((visitor) => (
                                    <TableRow key={visitor.vpA_Id}>
                                        <TableCell>{visitor.vpA_VisitorName}</TableCell>
                                        <TableCell>{visitor.vpA_ContactNo}</TableCell>
                                        <TableCell>
                                            {visitor.vpA_VisitDateTime
                                                ? format(new Date(visitor.vpA_VisitDateTime), 'dd-MM-yyyy HH:mm')
                                                : ''}
                                        </TableCell>
                                        <TableCell>{visitor.empname}</TableCell>
                                        <TableCell>
                                            <Button size='sm' onClick={() => onSelect(visitor)}>
                                                Select
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : hasSearched ? (
                        <p className='p-4 text-center text-muted-foreground'>No records found</p>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
};
