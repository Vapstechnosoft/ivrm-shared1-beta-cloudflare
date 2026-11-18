'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { useGatePass } from '@/hooks/visitors-management/transactions/useGatePass';
import type { GatePassTransactionData } from '@/types/visitors-management/transactions';
import { ChevronRight, Plus, Ticket, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { getColumns } from './_components/columns';
import GatePassForm from './_components/gate-pass-form';

export default function GatePassPage() {
    const { data: loadedData, isLoading, refetch } = useGatePass();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<GatePassTransactionData | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const data = loadedData?.getdata || [];

    const handleEdit = (record: GatePassTransactionData) => {
        setSelectedRecord(record);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleAddNew = () => {
        setSelectedRecord(null);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        setSelectedRecord(null);
        refetch();
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedRecord(null);
    };

    const columns = getColumns({ onEdit: handleEdit });

    return (
        <div className='min-h-screen space-y-6 pb-12'>
            {/* Top Polygon Banner matching Screenshot 1 */}
            <PolygonBanner
                title='Gate Pass'
                description='Generate, track and manage Student and Employee Gate Passes'
                breadcrumb={
                    <div className='flex flex-wrap items-center gap-1.5 text-white/80 text-xs sm:text-sm'>
                        <Link href='/visitors-management' className='font-medium transition-colors hover:text-white'>
                            Visitor Management
                        </Link>
                        <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        <span className='transition-colors hover:text-white'>Transactions</span>
                        <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        <span className='font-bold text-white'>Gate Pass</span>
                    </div>
                }
            />

            {/* Page Content Container matching Screenshot 1 */}
            <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 px-4 duration-300 sm:px-6 lg:px-8'>
                {/* Header Action Button */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={handleAddNew}
                        className='w-fit bg-primary font-medium text-primary-foreground text-xs shadow-sm transition-all duration-200 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4' />
                        Generate Gate Pass
                    </Button>
                </div>

                {/* Generate Gate Pass Form */}
                {isFormOpen && (
                    <div ref={formRef} className='fade-in slide-in-from-top-4 animate-in duration-300'>
                        <Card className='shadow-sm'>
                            <CardHeader className='border-b bg-muted/30 pb-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-2'>
                                        <Ticket className='h-5 w-5 text-primary' />
                                        <div>
                                            <CardTitle className='font-semibold text-base'>
                                                {selectedRecord ? 'Edit Gate Pass' : 'Generate Gate Pass'}
                                            </CardTitle>
                                            <CardDescription className='text-xs'>
                                                Fill in the details below to generate a new gate pass
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={closeForm}
                                        className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'>
                                        <X className='h-4 w-4' />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className='pt-6'>
                                <GatePassForm onSuccess={handleSuccess} initialData={selectedRecord} onCancel={closeForm} />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Gate Pass List Grid */}
                <Card className='shadow-sm'>
                    <CardHeader className='border-b bg-muted/30 pb-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2'>
                                <Ticket className='h-5 w-5 text-primary' />
                                <div>
                                    <CardTitle className='font-semibold text-base'>Gate Pass Entries</CardTitle>
                                    <CardDescription className='text-xs'>
                                        List of all generated student and employee gate passes
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <GenericDataTable<GatePassTransactionData>
                            columns={columns}
                            data={data}
                            isLoading={isLoading}
                            loadingMessage='Loading gate passes...'
                            noDataTitle='No Gate Passes Found'
                            noDataDescription='Click "Generate Gate Pass" above to create a new gate pass.'
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
