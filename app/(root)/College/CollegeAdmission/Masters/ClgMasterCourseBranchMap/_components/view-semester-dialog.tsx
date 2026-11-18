'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useClgMasterCourseBranchMap, useDeactivateSemesterCourseBranchMap } from '@/hooks/college/useCollegeMasters';
import { getCourseBranchMapModalDetails } from '@/server/college/CollegeAdmission/Masters/clg-master-course-branch-map';
import { IClgMasterCourseBranchMap } from '@/types/college/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SemesterRow {
    amcO_CourseName: string;
    amB_BranchName: string;
    amsE_SEMName: string;
    amcobmS_ActiveFlg: boolean;
    amcobmS_Id?: number;
}

interface ViewSemesterDialogProps {
    rowData: IClgMasterCourseBranchMap;
}

function SemesterToggleButton({ row, refetchAll }: { row: SemesterRow; refetchAll: () => void }) {
    const { mutateAsync: deactivateSem, isPending } = useDeactivateSemesterCourseBranchMap();

    const handleToggle = async () => {
        try {
            const response = await deactivateSem({ amcobmS_Id: row.amcobmS_Id });
            if (response.success || response.message?.toLowerCase()?.includes('success')) {
                toast.success(response.message || `Record ${row.amcobmS_ActiveFlg ? 'Deactivated' : 'Activated'} Successfully`);
                refetchAll();
            } else {
                toast.error(response.message || 'Action failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred.');
        }
    };

    return (
        <Button
            variant='link'
            size='sm'
            disabled={isPending}
            onClick={handleToggle}
            className={`p-0 h-auto font-medium ${row.amcobmS_ActiveFlg ? 'text-destructive hover:text-destructive/80' : 'text-green-600 hover:text-green-700'}`}>
            {isPending ? 'Processing...' : (row.amcobmS_ActiveFlg ? 'Deactivate' : 'Activate')}
        </Button>
    );
}

export default function ViewSemesterDialog({ rowData }: ViewSemesterDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [semesterList, setSemesterList] = useState<SemesterRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { refetchAll } = useClgMasterCourseBranchMap();

    const fetchSemesterList = async () => {
        setIsLoading(true);
        try {
            const response = await getCourseBranchMapModalDetails(rowData.amcobM_Id!);
            const data = response?.data?.semesterbrancklist || response?.data?.semesterbranchlist || response?.data?.editdata || [];
            setSemesterList(data);
        } catch (error) {
            console.error('Failed to fetch semester details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        fetchSemesterList();
    };

    const columns: ColumnDef<SemesterRow>[] = [
        {
            id: 'slNo',
            header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
            size: 70
        },
        {
            accessorKey: 'amcO_CourseName',
            header: () => <div className='text-center font-bold text-black'>Course Name</div>,
            cell: ({ row }) => <div className='text-center font-medium'>{row.original.amcO_CourseName}</div>
        },
        {
            accessorKey: 'amB_BranchName',
            header: () => <div className='text-center font-bold text-black'>Branch Name</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.amB_BranchName}</div>
        },
        {
            accessorKey: 'amsE_SEMName',
            header: () => <div className='text-center font-bold text-black'>Semester Name</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.amsE_SEMName}</div>
        },
        {
            id: 'actions',
            header: () => <div className='text-center font-bold text-black'>Action</div>,
            cell: ({ row }) => <div className='text-center'><SemesterToggleButton row={row.original} refetchAll={() => { refetchAll(); fetchSemesterList(); }} /></div>
        }
    ];

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={handleOpen}
                            className='h-8 w-8 p-0 transition-all duration-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50'>
                            <Eye className='h-4 w-4' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View Semesters</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {isOpen && (
                <AdaptiveDialog
                    title={`Course Branch Semester List — ${rowData.amcO_CourseName} / ${rowData.amB_BranchName}`}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    size='4xl'>
                    <AdaptiveBody>
                        <div className='my-2 max-h-[60vh] overflow-y-auto rounded-lg border p-3 shadow-sm'>
                            <GenericDataTable<SemesterRow>
                                data={semesterList}
                                totalItems={semesterList.length}
                                columns={columns}
                                isLoading={isLoading}
                                error={null}
                                showViewOptions={false}
                                isPaginationRequired={false}
                                isSearchRequired={false}
                                loadingMessage='Loading semester details...'
                                noDataTitle='No Semesters Mapped'
                                noDataDescription='No semesters are currently mapped to this course-branch combination'
                            />
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter className='flex justify-end'>
                        <Button variant='destructive' onClick={() => setIsOpen(false)} type='button'>Close</Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
