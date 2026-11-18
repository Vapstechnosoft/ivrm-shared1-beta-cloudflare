'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AcademicYear, StudentComplaint } from '@/constants/types';
import { useAcademicStudentCompliants } from '@/hooks/student-portal/useCumulative';
import { useEffect, useState } from 'react';
import { getStudentComplaintsLoadData, getStudentComplaintsReport } from './actions';
import { columns } from './columns';
interface StudentComplaintsViewClientProps {
    initialYears: AcademicYear[];
    initialData: StudentComplaint[];
    initialYearId: number;
}

export default function StudentComplaintsViewClient() {
    const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
    const [data, setData] = useState<StudentComplaint[]>([]); // Initialize with empty array
    const [isLoading, setIsLoading] = useState(false);
    const { data: academicYears, isLoading: isAcademicYearsLoading } = useAcademicStudentCompliants();

    // Fetch initial complaint data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const loadData = await getStudentComplaintsLoadData();
                console.log('DEBUG: Client received initial load data:', loadData);

                if (loadData && loadData.studentdivlist && loadData.studentdivlist.length > 0) {
                    setData(loadData.studentdivlist);
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleYearChange = async (yearId: string) => {
        console.log(`DEBUG: Year changed to ${yearId}. Fetching report...`);
        setSelectedYear(yearId);
        setIsLoading(true);
        try {
            // Passing 0 for optional params as we don't have them in this context yet,
            // relying on backend or default 0 logic as per user payload "studentview": [0]
            const response = await getStudentComplaintsReport({
                ASMAY_Id: Number(yearId),
                ASMCL_Id: 0,
                ASMS_Id: 0
            });
            console.log('DEBUG: Client received report response:', response);
            if (response && response.studentdivlist) {
                setData(response.studentdivlist);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <span>STUDENT DISCIPLINE</span>
                        {/* Collapse button logic is typically handled by Collapsible component, omitting for MVP unless requested */}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex justify-center'>
                        <div className='w-full max-w-md space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <span className='whitespace-nowrap font-semibold'>
                                    Year:<span className='text-red-500'>*</span>
                                </span>
                                <Select value={selectedYear} onValueChange={(value) => handleYearChange(value)}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {academicYears?.data?.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {(data.length > 0 || isLoading) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable<StudentComplaint, unknown>
                            columns={columns}
                            data={data}
                            isSearchRequired={true}
                            isPaginationRequired={true}
                            isLoading={isLoading}
                            totalItems={data.length}
                        />
                    </CardContent>
                </Card>
            )}

            {data.length === 0 && !isLoading && selectedYear && (
                <div className='p-4 text-center text-muted-foreground'>No Records Found</div>
            )}
        </div>
    );
}
