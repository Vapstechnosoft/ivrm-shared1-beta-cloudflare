'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IExamReportCard, ISubject } from '@/types/exam/exam-module/report';
import type { ColumnDef } from '@tanstack/react-table';

export const getBrsReportCardIXColumns = (subjects: ISubject[]): ColumnDef<IExamReportCard>[] => {
    const cols: ColumnDef<IExamReportCard>[] = [];

    // Sl No
    cols.push({
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl No' />,
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination;
            return <div className='text-center'>{pageIndex * pageSize + row.index + 1}</div>;
        }
    });

    // Student Name
    cols.push({
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='text-center font-medium'>{row.getValue('amsT_FirstName')}</div>
    });

    // Roll No
    cols.push({
        accessorKey: 'amaY_RollNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('amaY_RollNo') ?? '-'}</div>
    });

    // Adm No
    cols.push({
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('amsT_AdmNo') ?? '-'}</div>
    });

    // Class & Section
    cols.push({
        id: 'classSection',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class / Section' />,
        cell: ({ row }) => (
            <div className='text-center'>
                {row.original.asmcL_ClassName}/{row.original.asmC_SectionName}
            </div>
        )
    });

    // Per-subject columns (applicable subjects only)
    subjects
        .filter((s) => s.eyceS_AplResultFlg)
        .sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999))
        .forEach((subj) => {
            cols.push({
                id: `subject_${subj.ismS_Id}`,
                header: () => <div className='break-words text-center font-bold text-xs uppercase'>{subj.ismS_SubjectName}</div>,
                cell: ({ row }) => renderBrsIXCell(row.original, subj)
            });
        });

    // Summary columns
    const resultSubjects = subjects.filter((s) => s.eyceS_AplResultFlg);
    if (resultSubjects.length > 0) {
        cols.push(
            {
                accessorKey: 'estmP_TotalMaxMarks',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Total Max' />,
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.estmP_Result === 'AB' ? '-' : (row.getValue('estmP_TotalMaxMarks') ?? '-')}
                    </div>
                )
            },
            {
                accessorKey: 'estmP_TotalObtMarks',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Obtained' />,
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.estmP_Result === 'AB' ? '-' : (row.getValue('estmP_TotalObtMarks') ?? '-')}
                    </div>
                )
            },
            {
                accessorKey: 'estmP_Percentage',
                header: ({ column }) => <DataTableColumnHeader column={column} title='%' />,
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.estmP_Result === 'AB' ? '-' : `${row.getValue('estmP_Percentage') ?? '-'}%`}
                    </div>
                )
            },
            {
                accessorKey: 'estmP_TotalGrade',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Grade' />,
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.original.estmP_Result === 'AB' ? '-' : (row.getValue('estmP_TotalGrade') ?? '-')}
                    </div>
                )
            },
            {
                accessorKey: 'estmP_Result',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
                cell: ({ row }) => {
                    const result = row.getValue('estmP_Result') as string;
                    return (
                        <div
                            className={`text-center font-semibold ${
                                result === 'Pass' ? 'text-green-600' : result === 'Fail' ? 'text-red-600' : ''
                            }`}>
                            {result ?? '-'}
                        </div>
                    );
                }
            }
        );
    }

    return cols;
};

function renderBrsIXCell(row: IExamReportCard, subj: ISubject) {
    const mark = row.sub_list?.find((m) => m.ismS_Id === subj.ismS_Id);
    if (!mark) return <div className='text-center text-gray-400'>-</div>;

    if (mark.estmpS_PassFailFlg === 'AB') {
        return <div className='text-center font-bold text-red-600'>AB</div>;
    }

    const showMarks = subj.eyceS_MarksDisplayFlg;
    const showGrade = subj.eyceS_GradeDisplayFlg;

    return (
        <div className='space-y-0 text-center leading-tight'>
            <div className='font-medium'>{showMarks ? (mark.estmpS_ObtainedMarks ?? '-') : '-'}</div>
            {showGrade && <div className='text-blue-700 text-xs'>{mark.estmpS_ObtainedGrade ?? '-'}</div>}
        </div>
    );
}
