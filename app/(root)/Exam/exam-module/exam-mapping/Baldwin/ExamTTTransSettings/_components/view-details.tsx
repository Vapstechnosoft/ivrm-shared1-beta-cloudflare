'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { getExamTTTransViewRecords, toggleExamTTTransRecord } from '@/server/exam/exam-module/exam-mapping/exam-tt-trans-settings';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ViewRecord {
    examname: string;
    subjectName: string;
    slotname: string;
    slotdate: string;
    exttS_ActiveFlag: boolean;
    exttS_Id: number;
}

interface Props {
    rowData: IExamTTTransSettings;
    onClose: () => void;
}

export default function ExamTTTransSettingsViewDetails({ rowData, onClose }: Props) {
    const [records, setRecords] = useState<ViewRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmRecord, setConfirmRecord] = useState<ViewRecord | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await getExamTTTransViewRecords(rowData.extT_Id);
                setRecords(res?.data ?? []);
            } catch {
                toast.error('Failed to load records');
            } finally {
                setLoading(false);
            }
        })();
    }, [rowData.extT_Id]);

    async function handleToggle(record: ViewRecord) {
        setIsToggling(true);
        try {
            const res = await toggleExamTTTransRecord(record.exttS_Id);
            if (res?.success === true) {
                toast.success(res.message);
                setRecords((prev) =>
                    prev.map((r) => (r.exttS_Id === record.exttS_Id ? { ...r, exttS_ActiveFlag: !r.exttS_ActiveFlag } : r))
                );
                setConfirmRecord(null);
                ``;
            } else {
                toast.error(res?.message);
            }
        } catch {
            toast.error('Error toggling status');
        } finally {
            setIsToggling(false);
        }
    }

    return (
        <AdaptiveDialog title='Exam TT Records' isOpen={true} onClose={onClose} size='5xl'>
            <AdaptiveBody>
                {loading ? (
                    <div className='py-8 text-center text-muted-foreground'>Loading records...</div>
                ) : records.length === 0 ? (
                    <div className='py-8 text-center text-muted-foreground'>No records found</div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full border-separate border-spacing-0 text-sm'>
                            <thead>
                                <tr className='bg-primary text-primary-foreground'>
                                    <th className='rounded-tl-md px-3 py-2 text-left font-medium'>Sl.No</th>
                                    <th className='px-3 py-2 text-left font-medium'>Exam Name</th>
                                    <th className='px-3 py-2 text-left font-medium'>Subject</th>
                                    <th className='px-3 py-2 text-left font-medium'>Time Slot</th>
                                    <th className='px-3 py-2 text-left font-medium'>Date</th>
                                    <th className='rounded-tr-md px-3 py-2 text-center font-medium'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r, i) => (
                                    <tr key={i} className='border-gray-200 border-t transition-colors hover:bg-accent/30'>
                                        <td className='px-3 py-2'>{i + 1}</td>
                                        <td className='px-3 py-2'>{r.examname}</td>
                                        <td className='px-3 py-2'>{r.subjectName}</td>
                                        <td className='px-3 py-2'>{r.slotname}</td>
                                        <td className='px-3 py-2'>{r.slotdate ? new Date(r.slotdate).toLocaleDateString('en-GB') : '-'}</td>
                                        <td className='px-3 py-2 text-center'>
                                            <div className='flex justify-center'>
                                                <ActionButtons
                                                    rowData={r}
                                                    buttons={{ toggle: true, edit: false }}
                                                    toggleConditionKey='exttS_ActiveFlag'
                                                    onToggle={setConfirmRecord}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button variant='outline' onClick={onClose}>
                    Close
                </Button>
            </AdaptiveFooter>

            {confirmRecord && (
                <AdaptiveDialog title='Confirm Toggle Status' isOpen={!!confirmRecord} onClose={() => setConfirmRecord(null)}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <p>
                            Are you sure you want to {confirmRecord.exttS_ActiveFlag ? 'deactivate' : 'activate'}{' '}
                            <strong>{confirmRecord.subjectName}</strong> for <strong>{confirmRecord.examname}</strong>?
                        </p>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='secondary' onClick={() => setConfirmRecord(null)}>
                            Cancel
                        </Button>
                        <Button
                            isLoading={isToggling}
                            variant={confirmRecord.exttS_ActiveFlag ? 'destructive' : 'default'}
                            onClick={() => handleToggle(confirmRecord)}>
                            {confirmRecord.exttS_ActiveFlag ? 'Deactivate' : 'Activate'}
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </AdaptiveDialog>
    );
}
