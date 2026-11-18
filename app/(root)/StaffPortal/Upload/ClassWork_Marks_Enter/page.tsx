'use client';

import MarksEntryForm from '@/app/(root)/upload/transactions/ClassWork_Marks_Enter/_components/marks-entry-form';
import SearchForm from '@/app/(root)/upload/transactions/ClassWork_Marks_Enter/_components/search-form';
import VerifiedRecordsGrid from '@/app/(root)/upload/transactions/ClassWork_Marks_Enter/_components/verified-records-grid';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IClassWorkMarksList } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { Loader2 } from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';

export default function VerifyClassWorkPage() {
    return (
        <Suspense
            fallback={
                <div className='flex h-full items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin' />
                </div>
            }>
            <FormProvider<IClassWorkMarksList>>
                <VerifyClassWorkContent />
            </FormProvider>
        </Suspense>
    );
}

function VerifyClassWorkContent() {
    const [verifiedRecords, setVerifiedRecords] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSearchResults = useCallback((results: any[], _topicsList: any[]) => {
        setSearchResults(results);
    }, []);

    const handleVerifiedList = useCallback((list: any[]) => {
        setVerifiedRecords(list);
    }, []);

    const handleTopicsLoaded = useCallback((topics: any[]) => {
        setTopics(topics);
    }, []);

    const handleSearchTrigger = useCallback(() => {
        setIsSubmitted(true);
    }, []);

    const handleResetTrigger = useCallback(() => {
        setIsSubmitted(false);
    }, []);

    return (
        <div className='container min-h-screen space-y-4 p-1'>
            <CollapsibleSection title='CLASSWORK MARKS UPDATE' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <div className='space-y-4'>
                    <SearchForm
                        onSearchResults={handleSearchResults}
                        onVerifiedList={handleVerifiedList}
                        onTopicsLoaded={handleTopicsLoaded}
                        onSearchTrigger={handleSearchTrigger}
                        onResetTrigger={handleResetTrigger}
                    />
                </div>
            </CollapsibleSection>

            {isSubmitted && (
                <>
                    <MarksEntrySection searchResults={searchResults} topics={topics} />
                    <VerifiedRecordsSection records={verifiedRecords} />
                </>
            )}
        </div>
    );
}

function MarksEntrySection({ searchResults, topics }: { searchResults: any[]; topics: any[] }) {
    if (searchResults.length === 0 && topics.length === 0) return null;

    return (
        <CollapsibleSection
            title='Marks Entry / Verification'
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

    // If details view (MarksEntry) is open, maybe keep this collapsed?
    // Legacy shows it below.
    if (records.length === 0) return null;

    return (
        <CollapsibleSection
            title='Verified Classwork Details'
            defaultOpen={!isDetailsViewOpen}
            variant='outline'
            size='md'
            className='shadow-lg'>
            <VerifiedRecordsGrid records={records} />
        </CollapsibleSection>
    );
}
