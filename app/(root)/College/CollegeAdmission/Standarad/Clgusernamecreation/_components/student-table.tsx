import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { getStudentColumns } from '@/app/(root)/College/CollegeAdmission/Standarad/Clgusernamecreation/_components/columns';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StudentTableProps {
    data: any[];
    studentType: string;
    onSelectionChange?: (selectedRows: any[]) => void;
}

export function StudentTable({ data, studentType, onSelectionChange }: StudentTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lower = searchTerm.toLowerCase();
        return data.filter(item => 
            item.studentName?.toLowerCase().includes(lower) ||
            item.admno?.toLowerCase().includes(lower) ||
            item.courseName?.toLowerCase().includes(lower) ||
            item.branchName?.toLowerCase().includes(lower) ||
            item.semName?.toLowerCase().includes(lower)
        );
    }, [data, searchTerm]);

    const tableProps = useDataTableProps({ data: filteredData, totalRecords: filteredData.length });
    const studentColumns = getStudentColumns(studentType);

    return (
        <div className="space-y-4">
            <div className="flex justify-end p-2">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search here..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <GenericDataTable
                {...tableProps}
                columns={studentColumns}
                showViewOptions={false}
                isLoading={false}
                noDataTitle="No Students Found"
                onRowSelectionChange={onSelectionChange}
                noDataDescription="Try adjusting your search criteria"
            />
        </div>
    );
}
