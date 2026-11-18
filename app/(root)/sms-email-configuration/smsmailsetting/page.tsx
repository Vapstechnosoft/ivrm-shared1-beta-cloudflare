'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetSmsMailSettingDetails, useSmsMailSettingData } from '@/hooks/sms-email-configuration/useSmsMailSetting';
import { tableSearchVariables } from '@/lib/data-table.config';
import { Plus } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { AddForm } from './add-form';
import { ListGrid } from './list-grid';

export default function SmsMailSettingPage() {
    const { data: initialData, isLoading } = useSmsMailSettingData();
    const getDetailsMutation = useGetSmsMailSettingDetails();
    const [editData, setEditData] = useState<any>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const rawData = (initialData?.data?.emailSmsSettingList as any[]) || [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return rawData;
        const lowerQuery = searchQuery.toLowerCase();
        const searchableKeys = ['iseS_Template_Name', 'iseS_SMSMessage', 'iseS_Mail_Message'];

        return rawData.filter((item) => {
            return searchableKeys.some((key) => {
                const val = item[key];
                return val !== null && val !== undefined && String(val).toLowerCase().includes(lowerQuery);
            });
        });
    }, [rawData, searchQuery]);

    const handleEdit = (record: any) => {
        setIsFormOpen(true);
        getDetailsMutation.mutate(
            { ises_id: record.iseS_Id, ivrmimp_id: record.ivrmimP_Id },
            {
                onSuccess: (response) => {
                    setEditData(response.data);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        );
    };

    const handleClear = () => {
        setEditData(undefined);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='space-y-6'>
            {isFormOpen && (
                <AddForm
                    initialData={(initialData?.data as any) || undefined}
                    editData={editData}
                    onClear={handleClear}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}

            <Card>
                <CardHeader className='flex flex-row items-center justify-between border-border/50 border-b pb-4'>
                    <CardTitle>SMS &amp; Email Setting Details</CardTitle>
                    {!isFormOpen && (
                        <Button onClick={() => setIsFormOpen(true)} className='bg-primary text-primary-foreground'>
                            <Plus className='mr-2 h-4 w-4' /> Add New
                        </Button>
                    )}
                </CardHeader>
                <CardContent className='pt-6'>
                    <ListGrid data={filteredData} onEdit={handleEdit} />
                </CardContent>
            </Card>
        </div>
    );
}
