'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PreviousVisitorData } from '@/types/visitors-management/transactions';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchPreviousModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (visitor: PreviousVisitorData) => void;
    onSearch: (query: string) => Promise<PreviousVisitorData[]>;
}

export const SearchPreviousModal = ({ isOpen, onClose, onSelect, onSearch }: SearchPreviousModalProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PreviousVisitorData[]>([]);
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
                    <DialogTitle>Search Previous Visitors</DialogTitle>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact No</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>From Place</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((visitor) => (
                                    <TableRow key={visitor.vmmV_Id}>
                                        <TableCell>{visitor.vmmV_VisitorName}</TableCell>
                                        <TableCell>{visitor.vmmV_VisitorContactNo}</TableCell>
                                        <TableCell>{visitor.vmmV_VisitorEmailid}</TableCell>
                                        <TableCell>{visitor.vmmV_FromPlace}</TableCell>
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
