'use client';

import { getLabConstraintsEditDetails } from '@/server/timetable/constraints/labconstraints';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LabConstraintsForm from './lab-constraints-form';

interface LanConstraintsUpdateProps {
    initialData: any;
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function LanConstraintsUpdate({ initialData, selectedRow, onSuccess, onCancel }: LanConstraintsUpdateProps) {
    const [apiData, setApiData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedRow?.ttlaB_Id) return;

            try {
                const response = await getLabConstraintsEditDetails(selectedRow.ttlaB_Id);
                console.log('Raw Edit API Response:', response);
                const responseData = response?.data || response;

                let masterArray: any[] = [];
                let subArray: any[] = [];

                if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
                    // Check if it's the exact format the backend returns: Object with tempararyArrayList
                    if (responseData.ttlaB_LABLIBName || responseData.TTLAB_LABLIBName || responseData.asmaY_Id) {
                        masterArray = [responseData];
                    }
                    if (Array.isArray(responseData.tempararyArrayList)) {
                        subArray = responseData.tempararyArrayList;
                    }
                } else if (Array.isArray(responseData)) {
                    masterArray = responseData;
                    subArray = responseData;
                }

                if (masterArray.length === 0) {
                    masterArray = [selectedRow];
                }

                setApiData({ master: masterArray, sub: subArray });
            } catch (error: any) {
                toast.error(error?.message || 'Failed to fetch edit details');
                onCancel();
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [selectedRow, onCancel]);

    if (isLoading) {
        return (
            <div className='flex h-40 items-center justify-center p-6'>
                <Loader2 className='mr-2 h-8 w-8 animate-spin text-primary' />
                <span className='text-muted-foreground text-sm'>Loading constraint details...</span>
            </div>
        );
    }

    return (
        <LabConstraintsForm
            initialData={initialData}
            editData={apiData?.master || [selectedRow]}
            subGridData={apiData?.sub || []}
            onSuccess={onSuccess}
            onCancel={onCancel}
        />
    );
}
