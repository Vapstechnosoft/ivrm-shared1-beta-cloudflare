import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { IPreadmissionClassDropdown } from '@/types/admission/preadmission/transactions';
import { format } from 'date-fns';

interface IneligibleClassesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classes: IPreadmissionClassDropdown[];
    cutOffDate?: Date;
}

export function IneligibleClassesDialog({ open, onOpenChange, classes, cutOffDate = new Date() }: IneligibleClassesDialogProps) {
    const validCutOffDate = cutOffDate && !Number.isNaN(new Date(cutOffDate).getTime()) ? new Date(cutOffDate) : new Date();

    // Maximum Date of Birth (cutOffDate minus MaxAge)
    const calculateMaxDOB = (years?: number, months?: number, days?: number) => {
        const date = new Date(validCutOffDate);
        date.setFullYear(date.getFullYear() - (years || 0));
        date.setMonth(date.getMonth() - (months || 0));
        date.setDate(date.getDate() - (days || 0));
        return format(date, 'dd/MM/yyyy');
    };

    // Minimum Date of Birth (cutOffDate minus MinAge)
    const calculateMinDOB = (years?: number, months?: number, days?: number) => {
        const date = new Date(validCutOffDate);
        date.setFullYear(date.getFullYear() - (years || 0));
        date.setMonth(date.getMonth() - (months || 0));
        date.setDate(date.getDate() - (days || 0));
        return format(date, 'dd/MM/yyyy');
    };

    const getMaxDOBString = (classItem: any) => {
        if (classItem.maxdate) {
            try {
                return format(new Date(classItem.maxdate), 'dd/MM/yyyy');
            } catch {
                // fallback
            }
        }
        return calculateMaxDOB(classItem.asmcL_MaxAgeYear, classItem.asmcL_MaxAgeMonth, classItem.asmcL_MaxAgeDays);
    };

    const getMinDOBString = (classItem: any) => {
        if (classItem.mindate) {
            try {
                return format(new Date(classItem.mindate), 'dd/MM/yyyy');
            } catch {
                // fallback
            }
        }
        return calculateMinDOB(classItem.asmcL_MinAgeYear, classItem.asmcL_MinAgeMonth, classItem.asmcL_MinAgeDays);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto p-6 bg-white sm:rounded-lg shadow-xl border border-gray-200'>
                <DialogHeader className='space-y-1 text-center'>
                    <DialogTitle className='text-center text-lg md:text-xl font-bold text-red-600'>
                        NO Class Is Applicable For Your Age!!
                    </DialogTitle>
                    <DialogDescription className='text-center text-xs md:text-sm font-bold text-gray-900'>
                        NOTE:Child Date of Birth should be between Maximum and Minimum Date for Respective Class
                    </DialogDescription>
                </DialogHeader>

                <div className='mt-4 overflow-x-auto border border-gray-300 rounded'>
                    <table className='w-full border-collapse text-xs md:text-sm'>
                        <thead>
                            <tr className='bg-gray-100 text-gray-800 border-b border-gray-300'>
                                <th className='border border-gray-300 px-3 py-2 text-center font-bold w-16'>SL.NO.</th>
                                <th className='border border-gray-300 px-3 py-2 text-center font-bold'>Class Name</th>
                                <th className='border border-gray-300 px-3 py-2 text-center font-bold'>Maximum Date of Birth</th>
                                <th className='border border-gray-300 px-3 py-2 text-center font-bold'>Minimum Date of Birth</th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {classes.length > 0 ? (
                                classes.map((classItem, index) => (
                                    <tr key={classItem.asmcL_Id || index} className='hover:bg-gray-50'>
                                        <td className='border border-gray-300 px-3 py-2 text-center text-gray-800 font-medium'>
                                            {index + 1}
                                        </td>
                                        <td className='border border-gray-300 px-4 py-2 text-left text-gray-800 font-medium'>
                                            {classItem.asmcL_ClassName}
                                        </td>
                                        <td className='border border-gray-300 px-3 py-2 text-center text-gray-700'>
                                            {getMaxDOBString(classItem)}
                                        </td>
                                        <td className='border border-gray-300 px-3 py-2 text-center text-gray-700'>
                                            {getMinDOBString(classItem)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className='border border-gray-300 px-4 py-3 text-center text-muted-foreground'>
                                        No class details available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='mt-5 pt-3 border-t border-gray-200 flex justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        className='bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-1.5 h-auto text-sm font-medium rounded shadow-sm'>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
