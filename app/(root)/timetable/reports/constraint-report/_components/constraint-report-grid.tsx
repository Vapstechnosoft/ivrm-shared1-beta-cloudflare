'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Printer } from 'lucide-react';
import { useMemo } from 'react';

interface ConstraintReportGridProps {
    reportData: any[];
    formData: any;
    onPrint: () => void;
}

export default function ConstraintReportGrid({ reportData, formData, onPrint }: ConstraintReportGridProps) {
    if (!reportData || reportData.length === 0) return null;

    const { ttconstrep, fixing1 } = formData;

    const exportToExcel = () => {
        // Basic implementation for exporting table to excel
        let table = document.getElementById('constraint-report-table');
        if (!table) return;

        const html = table.outerHTML;
        const url = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(html)));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Constraint_Report.xls';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTableContent = () => {
        // Table A: Fixing -> DP
        if (ttconstrep === 'F' && fixing1 === 'DP') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Day Name</TableHead>
                            <TableHead>No of Period</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.TTMC_CategoryName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMD_DayName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table B: Fixing -> DS
        if (ttconstrep === 'F' && fixing1 === 'DS') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Day Name</TableHead>
                            <TableHead>No. Of Periods</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMD_DayName}</TableCell>
                                <TableCell>{user.TTFDSCC_Periods}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table C: Fixing -> DSUB
        if (ttconstrep === 'F' && fixing1 === 'DSUB') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Day Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>No of Periods</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMD_DayName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.TTFDSUCC_Periods}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table D: Fixing -> PS
        if (ttconstrep === 'F' && fixing1 === 'PS') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Period Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>No of Days</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTFPSCC_Days}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table E: Fixing -> PSUB
        if (ttconstrep === 'F' && fixing1 === 'PSUB') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Period Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Staff Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table F: Restriction -> DP
        if (ttconstrep === 'R' && fixing1 === 'DP') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Day Name</TableHead>
                            <TableHead>No of Periods</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.TTMC_CategoryName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMD_DayName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table G: Restriction -> DS
        if (ttconstrep === 'R' && fixing1 === 'DS') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Day Name</TableHead>
                            <TableHead>No of Periods</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMD_DayName}</TableCell>
                                <TableCell>{user.TTFDSCC_Periods}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table H: Restriction -> DSUB
        if (ttconstrep === 'R' && fixing1 === 'DSUB') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Day Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Period Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMD_DayName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table I: Restriction -> PS
        if (ttconstrep === 'R' && fixing1 === 'PS') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Period Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>No of Days</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTRPSCC_Days}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table J: Restriction -> PSUB
        if (ttconstrep === 'R' && fixing1 === 'PSUB') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Period Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Staff Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table K: Consecutive
        if (ttconstrep === 'C') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>No of Periods</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.TTMC_CategoryName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table L: Bifurcation
        if (ttconstrep === 'B') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Bifurcation Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>No of Periods</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.TTMC_CategoryName}</TableCell>
                                <TableCell>{user.TTB_BifurcationName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.HRME_EmployeeFirstName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                                <TableCell>{user.TTMP_PeriodName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        // Table M: Lab
        if (ttconstrep === 'L') {
            return (
                <Table id="constraint-report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sl.No.</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Lab Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.TTMC_CategoryName}</TableCell>
                                <TableCell>{user.TTLAB_LABLIBName}</TableCell>
                                <TableCell>{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                <TableCell>{user.ISMS_SubjectName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        }

        return null;
    };

    return (
        <div className='mt-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Report Data</h3>
                <div className='flex space-x-2'>
                    <Button variant='outline' onClick={onPrint} size='sm'>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                    <Button variant='outline' onClick={exportToExcel} size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className='overflow-x-auto'>
                {renderTableContent()}
            </div>
        </div>
    );
}
