'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    activateDeactivatePreUsers,
    sendEmailToPreUsers,
    sendSmsToPreUsers
} from '@/server/admission/preadmission/configuration/pre_user_create';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, MessageSquare, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddPreUserForm from './_components/add-form';
import { type PreUser, preUserColumns } from './_components/columns';
import { usePreUserInitialDataQuery } from './_components/usePreUserCreate';

export default function PreUserCreatePage() {
    const miId = 2; // Hardcoded default as per angular code (MI_Id: 2)
    const { data: response, isLoading, error } = usePreUserInitialDataQuery(miId);
    const queryClient = useQueryClient();
    const [selectedRows, setSelectedRows] = useState<PreUser[]>([]);

    const tableData: PreUser[] = response?.data || response?.rawResponse?.searchstudentDetails || [];

    const handleSelectionChange = (rows: PreUser[]) => {
        setSelectedRows(rows);
    };

    const activateDeactivateMutation = useMutation({
        mutationFn: async (params: { users: PreUser[]; count: number }) => {
            return await activateDeactivatePreUsers(params.users, params.count);
        },
        onSuccess: (data, variables) => {
            toast.success(`Successfully ${variables.count === 1 ? 'Activated' : 'De-Activated'}`);
            queryClient.invalidateQueries({ queryKey: ['PRE_USER_INITIAL_DATA'] });
            setSelectedRows([]);
        },
        onError: () => {
            toast.error('Action failed');
        }
    });

    const smsMutation = useMutation({
        mutationFn: async (users: PreUser[]) => {
            return await sendSmsToPreUsers(users);
        },
        onSuccess: () => {
            toast.success('SMS Sent Successfully');
        },
        onError: () => {
            toast.error('Failed to Send SMS');
        }
    });

    const emailMutation = useMutation({
        mutationFn: async (users: PreUser[]) => {
            return await sendEmailToPreUsers(users);
        },
        onSuccess: () => {
            toast.success('Email Sent Successfully');
        },
        onError: () => {
            toast.error('Failed to Send Email');
        }
    });

    const onActivateDeactivate = (flag: number) => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one record');
            return;
        }
        activateDeactivateMutation.mutate({ users: selectedRows, count: flag });
    };

    const onSendSms = () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one record');
            return;
        }
        smsMutation.mutate(selectedRows);
    };

    const onSendEmail = () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one record');
            return;
        }
        emailMutation.mutate(selectedRows);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Preadmission User Creation'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <AddPreUserForm />
                </CollapsibleSection>

                <CollapsibleSection
                    title='Preadmission Users List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-4 flex flex-wrap justify-center gap-2'>
                        <Button
                            variant='outline'
                            className='w-fit shadow-md hover:bg-primary/10 hover:text-primary'
                            onClick={onSendSms}
                            disabled={smsMutation.isPending}>
                            <MessageSquare className='mr-2 h-4 w-4' /> SMS
                        </Button>
                        <Button
                            variant='outline'
                            className='w-fit shadow-md hover:bg-primary/10 hover:text-primary'
                            onClick={onSendEmail}
                            disabled={emailMutation.isPending}>
                            <Mail className='mr-2 h-4 w-4' /> EMAIL
                        </Button>
                        <Button
                            variant='outline'
                            className='w-fit shadow-md hover:bg-success/10 hover:text-success'
                            onClick={() => onActivateDeactivate(1)}
                            disabled={activateDeactivateMutation.isPending}>
                            <Power className='mr-2 h-4 w-4 text-success' /> Activate
                        </Button>
                        <Button
                            variant='outline'
                            className='w-fit shadow-md hover:bg-destructive/10 hover:text-destructive'
                            onClick={() => onActivateDeactivate(0)}
                            disabled={activateDeactivateMutation.isPending}>
                            <PowerOff className='mr-2 h-4 w-4 text-destructive' /> De-Activate
                        </Button>
                    </div>

                    <GenericDataTable<PreUser>
                        data={tableData}
                        columns={preUserColumns}
                        isLoading={isLoading}
                        error={error}
                        onRowSelectionChange={handleSelectionChange}
                        loadingMessage='Loading Preadmission Users...'
                        noDataTitle='No Users Found'
                        noDataDescription='Get started by creating a new Preadmission User'
                        errorTitle='Error Loading Users'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
