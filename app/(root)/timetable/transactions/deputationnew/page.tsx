'use client';

import { useDeputationNewPeriodAlloted } from '@/hooks/timetable/useDeputationNew';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import DeputationNewAssignmentTable from './_components/deputationNewAssignmentTable';
import DeputationNewForm, { type IDeputationNewFormSelection } from './_components/deputationNewForm';

export default function DeputationNewPage() {
    const [selection, setSelection] = useState<IDeputationNewFormSelection | null>(null);

    // Fetch period allotments when absent staff, day, date, and academic year are selected
    const {
        data: periodData,
        isLoading: periodsLoading,
        refetch: refetchPeriods
    } = useDeputationNewPeriodAlloted(
        {
            ASMAY_Id: selection?.asmaY_Id || 0,
            TTMD_Id: selection?.dayId || 0,
            HRME_Id: selection?.absentStaffId || 0,
            TTSD_Date: selection?.dateStr || ''
        },
        !!selection?.absentStaffId && !!selection?.dateStr && !!selection?.asmaY_Id && !!selection?.dayId
    );

    const handleSaveSuccess = () => {
        refetchPeriods();
    };

    const handleCancel = () => {
        setSelection(null);
    };

    return (
        <div className='container mx-auto max-w-7xl space-y-8 p-4'>
            {/* Main Deputation Form */}
            <DeputationNewForm onFetch={setSelection} onResetParent={handleCancel} />

            {/* Loading Indicator */}
            {selection && periodsLoading && (
                <div className='flex items-center justify-center gap-3 rounded-2xl border border-purple-100 bg-white p-8 font-semibold text-purple-700 shadow-md'>
                    <Loader2 className='h-5 w-5 animate-spin text-purple-600' />
                    <span>Loading allotted periods and substitute staff availability...</span>
                </div>
            )}

            {/* Period Assignment & Substitution Table */}
            {selection && !periodsLoading && periodData && (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-8 duration-500'>
                    <DeputationNewAssignmentTable
                        periodsData={periodData}
                        selection={selection}
                        onSaveSuccess={handleSaveSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}
