'use client';

import { Button } from '@/components/ui/button';
import type { ElectiveGroup, StudentRow } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';

import ElectiveReportExcel from './elective-report-excel';

interface ElectiveReportGridViewProps {
    students: StudentRow[];
    groupList: ElectiveGroup[];
    showMobile: boolean;
    showEmail: boolean;
    onPrint?: () => void;
}

export default function ElectiveReportGridView({ students, groupList, showMobile, showEmail, onPrint }: ElectiveReportGridViewProps) {
    return (
        <div className='mt-8 print:hidden'>
            {/* Controls */}
            <div className='no-print mb-4 items-center justify-between gap-4 py-2'>
                <div className='flex justify-end gap-2'>
                    <Button onClick={onPrint} className='w-fit text-white hover:bg-orange-800 '>
                        <Printer className='h-4 w-4' />
                        <span>PRINT</span>
                    </Button>
                    <ElectiveReportExcel students={students} groupList={groupList} showMobile={showMobile} showEmail={showEmail} />
                </div>
            </div>

            {/* Table with ORANGE headers */}
            <div className=' overflow-x-auto rounded-lg border-2 shadow-sm'>
                <table className='w-full border-collapse text-sm '>
                    <thead>
                        <tr className=' bg-gray-200 font-bold text-black'>
                            <th className='border border-gray-400 px-4 py-3 text-center'>SL.No</th>
                            <th className='border border-gray-400 px-6 py-3 text-left'>Student Name</th>
                            <th className='border border-gray-400 px-4 py-3 text-center'>Admission No</th>
                            {showMobile && <th className='border border-gray-400 px-4 py-3'>Mobile No</th>}
                            {showEmail && <th className='border border-gray-400 px-4 py-3'>Email-Id</th>}
                            <th className='border border-gray-400 px-4 py-3'>Class</th>
                            <th className='border border-gray-400 px-4 py-3'>Section</th>

                            {/* Elective Groups - Orange Headers */}
                            {groupList && groupList.length > 0 ? (
                                groupList.map((grp) => (
                                    <th
                                        key={grp.emG_Id}
                                        className='min-w-40 whitespace-normal border border-gray-400 bg-gray-200 px-5 py-3 font-semibold'>
                                        {grp.emG_GroupName || 'No Name'}
                                    </th>
                                ))
                            ) : (
                                <th className='border border-gray-400 bg-gray-600 px-4 py-3 text-yellow-100'>No Groups Available</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className='bg-white'>
                        {students.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7 + (showMobile ? 1 : 0) + (showEmail ? 1 : 0) + groupList.length}
                                    className='py-12 text-center text-gray-500 text-lg'>
                                    No students found for the selected criteria
                                </td>
                            </tr>
                        ) : (
                            students.map((stud, idx) => (
                                <tr key={stud.amsT_Id} className='transition-colors hover:bg-blue-50'>
                                    <td className='border border-gray-400 px-4 py-2 text-center font-medium'>{idx + 1}</td>
                                    <td className='border border-gray-400 px-6 py-2 text-left font-semibold text-gray-800'>
                                        {stud.amsT_FirstName}
                                    </td>
                                    <td className='border border-gray-400 px-4 py-2 text-center'>{stud.amsT_AdmNo || '-'}</td>
                                    {showMobile && (
                                        <td className='border border-gray-400 px-4 py-2 text-center'>{stud.amsT_MobileNo || '-'}</td>
                                    )}
                                    {showEmail && (
                                        <td className='break-all border border-gray-400 px-4 py-2 text-center text-xs'>
                                            {stud.amsT_emailId || '-'}
                                        </td>
                                    )}
                                    <td className='border border-gray-400 px-4 py-2 text-center'>{stud.asmcL_ClassName}</td>
                                    <td className='border border-gray-400 px-4 py-2 text-center'>{stud.asmC_SectionName}</td>

                                    {/* Subject Cells */}
                                    {groupList.map((grp) => {
                                        const subjects =
                                            stud.sub_list
                                                .filter((s) => s.emG_GroupName === grp.emG_GroupName)
                                                .map((s) => s.ismS_SubjectName || '-')
                                                .filter(Boolean)
                                                .join(', ') || '-';

                                        return (
                                            <td key={grp.emG_Id} className='border border-gray-400 px-4 py-2 text-left text-gray-700'>
                                                {subjects}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
