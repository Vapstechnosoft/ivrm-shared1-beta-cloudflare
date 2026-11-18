'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { IMasterShiftSettingList } from '@/types/hrms/attendance-management/masters';

interface ViewShiftSettingMasterDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    rowData: IMasterShiftSettingList | null;
}

export default function ViewShiftSettingMasterDetails({ isOpen, onClose, rowData }: ViewShiftSettingMasterDetailsProps) {
    if (!rowData) return null;

    const details = [
        { label: 'Shift Name', value: rowData.fomS_ShiftName },
        { label: 'Shift Start Time', value: rowData.fomsT_IHalfLoginTime },
        { label: 'Shift End Time', value: rowData.fomsT_IIHalfLogoutTime },
        { label: 'Lunch Start Time', value: rowData.fomsT_IHalfLogoutTime },
        { label: 'Lunch End Time', value: rowData.fomsT_IIHalfLoginTime },
        { label: 'Total Working Hours', value: rowData.fomsT_FDWHrMin },
        { label: 'Half Day Working Hours', value: rowData.fomsT_HDWHrMin },
        { label: 'Lunch Hours', value: rowData.fomsT_LunchHoursDuration },
        { label: 'Delay Per Shift', value: rowData.fomsT_DelayPerShiftHrMin },
        { label: 'Early Per Shift', value: rowData.fomsT_EarlyPerShiftHrMin }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='border-b pb-2 font-bold text-xl'>{rowData.fomS_ShiftName} Details</DialogTitle>
                </DialogHeader>
                <div className='mt-4'>
                    <table className='w-full border-collapse'>
                        <tbody>
                            {details.map((detail, index) => (
                                <tr key={index} className='border-b last:border-0'>
                                    <td className='w-1/2 px-4 py-3 font-semibold text-gray-700'>{detail.label} :</td>
                                    <td className='px-4 py-3 text-gray-600'>{detail.value || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
