'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchFeeChequeBounce } from '@/server/fees/trasactions/fee_cheque_bounce';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SearchFeeChequeBounceForm({
    asmayId,
    onSearchResults
}: {
    asmayId: number;
    onSearchResults: (data: any[]) => void;
}) {
    const [searchType, setSearchType] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');
    const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);

    const handleSearch = async () => {
        if (!searchType) {
            toast.error('Select Any Field For Search');
            return;
        }

        if (searchType === '1' && !searchDate) {
            toast.error('Search Date Is Needed');
            return;
        }

        if (searchType !== '1' && !searchText) {
            toast.error('Search Text Is Needed');
            return;
        }

        try {
            const payload: any = {
                searchType,
                ASMAY_ID: asmayId
            };

            if (searchType === '1') {
                payload.searchdate = searchDate instanceof Date ? searchDate.toISOString() : searchDate ? new Date(searchDate).toISOString() : undefined;
            } else {
                payload.searchtext = searchText;
            }

            const result = (await searchFeeChequeBounce(payload)) as any;
            console.log('result', result);
            const allData = result?.alldata || result?.data?.alldata;

            if (Array.isArray(allData) && allData.length > 0) {
                onSearchResults(allData);
            } else {
                toast.info('Record Does Not Exist For Searched Data');
                onSearchResults([]);
            }
        } catch (error) {
            toast.error('An error occurred during search');
        }
    };

    const handleCancel = () => {
        setSearchType('');
        setSearchText('');
        setSearchDate(undefined);
        onSearchResults([]);
    };

    return (
        <div className='flex flex-wrap items-end gap-4 rounded-lg border bg-muted/50 p-4'>
            <div className='space-y-2'>
                <Label>Search For</Label>
                <Select onValueChange={setSearchType} value={searchType}>
                    <SelectTrigger className='w-48'>
                        <SelectValue placeholder='--Select Field--' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='2'>Student Name</SelectItem>
                        <SelectItem value='3'>Receipt No</SelectItem>
                        <SelectItem value='1'>Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {searchType === '1' ? (
                <div className='space-y-2'>
                    <Label>Search Date</Label>
                    <DatePicker date={searchDate} setDate={setSearchDate} />
                </div>
            ) : searchType !== '' ? (
                <div className='space-y-2'>
                    <Label>Search Text</Label>
                    <Input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder='Enter search text...'
                        className='w-64'
                    />
                </div>
            ) : null}

            <div className='flex gap-2'>
                <Button onClick={handleSearch} disabled={!searchType}>
                    <Search className='mr-2 h-4 w-4' /> Search
                </Button>
                <Button variant='outline' onClick={handleCancel}>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
            </div>
        </div>
    );
}
