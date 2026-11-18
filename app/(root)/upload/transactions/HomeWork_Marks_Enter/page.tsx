'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWorkMarksList } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { Loader2 } from 'lucide-react';
import { Suspense, useState } from 'react';
import MarksEntryForm from './_components/marks-entry-form';
import SearchForm from './_components/search-form';
import VerifiedRecordsGrid from './_components/verified-records-grid';

export default function HomeworkMarksUpdatePage() {
    return (
        <Suspense
            fallback={
                <div className='flex h-full items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin' />
                </div>
            }>
            <FormProvider<IHomeWorkMarksList>>
                <HomeworkMarksUpdateContent />
            </FormProvider>
        </Suspense>
    );
}

function HomeworkMarksUpdateContent() {
    const [verifiedRecords, setVerifiedRecords] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    return (
        <div className='container min-h-screen space-y-4 p-1'>
            <CollapsibleSection title='HOMEWORK MARKS UPDATE' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <div className='space-y-4'>
                    <SearchForm
                        onSearchResults={(results, topicsList) => {
                            setSearchResults(results);
                            setHasSearched(true);
                        }}
                        onVerifiedList={(list) => setVerifiedRecords(list)}
                        onTopicsLoaded={(topics) => setTopics(topics)}
                    />
                </div>
            </CollapsibleSection>

            <MarksEntrySection searchResults={searchResults} topics={topics} hasSearched={hasSearched} />

            <VerifiedRecordsSection records={verifiedRecords} />
        </div>
    );
}

function MarksEntrySection({ searchResults, topics, hasSearched }: { searchResults: any[]; topics: any[]; hasSearched: boolean }) {
    if (searchResults.length === 0 && topics.length === 0) {
        if (hasSearched) {
            return (
                <div className='flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm'>
                    <span className='font-bold text-lg text-red-500 uppercase tracking-wider'>No records found</span>
                </div>
            );
        }
        return null;
    }

    return (
        <CollapsibleSection
            title='Student HomeWork Update List'
            defaultOpen={searchResults.length > 0}
            variant='outline'
            size='md'
            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
            <MarksEntryForm initialResults={searchResults} topics={topics} />
        </CollapsibleSection>
    );
}

function VerifiedRecordsSection({ records }: { records: any[] }) {
    const { isDetailsViewOpen } = useFormContext();

    if (records.length === 0) return null;

    return (
        <CollapsibleSection title='HomeWork Details' defaultOpen={!isDetailsViewOpen} variant='outline' size='md' className='shadow-lg'>
            <VerifiedRecordsGrid records={records} />
        </CollapsibleSection>
    );
}
