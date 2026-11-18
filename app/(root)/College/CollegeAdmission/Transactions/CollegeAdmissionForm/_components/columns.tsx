import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFormContext } from '@/components/ui/form/form-provider';

export const collegeStudentColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'studentName',
        header: 'Student Name',
        cell: ({ row }) => <div className="font-medium">{row.original.studentName || row.original.amcsT_FirstName || 'N/A'}</div>
    },
    {
        accessorKey: 'amcsT_RegistrationNo',
        header: 'Registration No',
        cell: ({ row }) => row.original.amcsT_RegistrationNo || row.original.amcsT_AdmNo || 'N/A'
    },
    {
        accessorKey: 'amcO_CourseName',
        header: 'Course',
        cell: ({ row }) => row.original.amcO_CourseName || row.original.courseName || 'N/A'
    },
    {
        accessorKey: 'amB_BranchName',
        header: 'Branch',
        cell: ({ row }) => row.original.amB_BranchName || row.original.branchName || 'N/A'
    },
    {
        accessorKey: 'semesterName',
        header: 'Semester',
        cell: ({ row }) => row.original.semesterName || 'N/A'
    },
    {
        accessorKey: 'amcsT_MobileNo',
        header: 'Mobile No',
        cell: ({ row }) => row.original.amcsT_MobileNo || row.original.stdmobilenumber || 'N/A'
    },
    {
        id: 'actions',
        header: () => <div className="text-center w-full">Actions</div>,
        cell: ({ row }) => {
            const { openEditForm } = useFormContext();
            return (
                <div className="flex justify-center items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditForm(row.original);
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Application</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Implement View Logic
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Application</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        },
    }
];
