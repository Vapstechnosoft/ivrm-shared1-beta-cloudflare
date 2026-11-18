'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type {
    IDefaulterClass,
    IDefaulterGroup,
    IDefaulterHead,
    IDefaulterStudent,
    IFeeDefaulterSearchResponse
} from '@/types/staff-portal/fee-defaulter-report';
import { FileSpreadsheet, Printer, Save, Search as SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableProps {
    data: IFeeDefaulterSearchResponse;
    onSaveRemarks?: (students: IDefaulterStudent[]) => void;
    showRemarks: boolean;
}

export default function FeeDefaulterTable({ data, onSaveRemarks, showRemarks }: TableProps) {
    const [searchValue, setSearchValue] = useState('');
    const [localStudents, setLocalStudents] = useState<IDefaulterStudent[]>([]);
    const [localGroups, setLocalGroups] = useState<IDefaulterGroup[]>([]);
    const [localHeads, setLocalHeads] = useState<IDefaulterHead[]>([]);
    const [localClasses, setLocalClasses] = useState<IDefaulterClass[]>([]);
    const [checkAll, setCheckAll] = useState(false);

    useEffect(() => {
        if (data.studentalldata) setLocalStudents(data.studentalldata.map((s) => ({ ...s, stdselected: false })));
        if (data.groupalldata) setLocalGroups(data.groupalldata.map((g) => ({ ...g, grpselected: false })));
        if (data.headalldata) setLocalHeads(data.headalldata.map((h) => ({ ...h, hadselected: false })));
        if (data.classalldata) setLocalClasses(data.classalldata.map((c) => ({ ...c, clsselected: false })));
    }, [data]);

    const handleCheckAll = (checked: boolean) => {
        setCheckAll(checked);
        if (data.radioval === 'FSW') setLocalStudents((prev) => prev.map((s) => ({ ...s, stdselected: checked })));
        if (data.radioval === 'FGW') setLocalGroups((prev) => prev.map((g) => ({ ...g, grpselected: checked })));
        if (data.radioval === 'FHW') setLocalHeads((prev) => prev.map((h) => ({ ...h, hadselected: checked })));
        if (data.radioval === 'FCW') setLocalClasses((prev) => prev.map((c) => ({ ...c, clsselected: checked })));
    };

    const handleRemarkChange = (idx: number, val: string) => {
        setLocalStudents((prev) => prev.map((s, i) => (i === idx ? { ...s, FSDREM_Remarks: val } : s)));
    };

    const renderStudentTable = () => {
        const filtered = localStudents.filter((s) => s.StudentName.toLowerCase().includes(searchValue.toLowerCase()));
        const total = filtered.reduce((acc, curr) => acc + curr.totalbalance, 0);
        const selectedTotal = filtered.filter((s) => s.stdselected).reduce((acc, curr) => acc + curr.totalbalance, 0);

        return (
            <div className='space-y-4'>
                <div className='overflow-hidden overflow-x-auto rounded-md border bg-card shadow-sm'>
                    <Table>
                        <TableHeader className='bg-muted/50'>
                            <TableRow>
                                <TableHead className='w-[50px]'>
                                    <Checkbox checked={checkAll} onCheckedChange={(v) => handleCheckAll(!!v)} />
                                </TableHead>
                                <TableHead className='w-[60px]'>Sl No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Adm No</TableHead>
                                <TableHead>Class : Section</TableHead>
                                <TableHead>Father Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead className='text-right'>Balance</TableHead>
                                {showRemarks && <TableHead className='min-w-[200px]'>Remarks</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((student, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <Checkbox
                                            checked={student.stdselected}
                                            onCheckedChange={(v) =>
                                                setLocalStudents((prev) => prev.map((s, i) => (i === idx ? { ...s, stdselected: !!v } : s)))
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell className='font-medium'>{student.StudentName}</TableCell>
                                    <TableCell>{student.AMST_AdmNo}</TableCell>
                                    <TableCell>{student.ClassSection}</TableCell>
                                    <TableCell>{student.AMST_FatherName}</TableCell>
                                    <TableCell className='text-xs'>{student.AMST_MobileNo}</TableCell>
                                    <TableCell className='text-right font-bold text-destructive'>
                                        ₹{student.totalbalance.toLocaleString()}
                                    </TableCell>
                                    {showRemarks && (
                                        <TableCell>
                                            <Textarea
                                                className='h-10 min-h-[40px] text-xs'
                                                value={student.FSDREM_Remarks || ''}
                                                onChange={(e) => handleRemarkChange(idx, e.target.value)}
                                                placeholder='Enter remarks...'
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter className='bg-muted/30 font-bold'>
                            <TableRow>
                                <TableCell colSpan={7} className='text-right'>
                                    Total Balance:
                                </TableCell>
                                <TableCell className='text-right text-destructive'>₹{total.toLocaleString()}</TableCell>
                                {showRemarks && <TableCell />}
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={7} className='text-right'>
                                    Selected Balance:
                                </TableCell>
                                <TableCell className='text-right text-primary'>₹{selectedTotal.toLocaleString()}</TableCell>
                                {showRemarks && <TableCell />}
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
                {showRemarks && filtered.length > 0 && (
                    <div className='flex justify-center py-4'>
                        <Button onClick={() => onSaveRemarks?.(localStudents.filter((s) => s.FSDREM_Remarks))} className='gap-2 bg-primary'>
                            <Save className='h-4 w-4' /> Save Remarks
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderGroupTable = () => {
        const filtered = localGroups.filter((g) => g.FMG_GroupName.toLowerCase().includes(searchValue.toLowerCase()));
        return (
            <div className='overflow-hidden rounded-md border bg-card shadow-sm'>
                <Table>
                    <TableHeader className='bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-[50px]'>
                                <Checkbox checked={checkAll} onCheckedChange={(v) => handleCheckAll(!!v)} />
                            </TableHead>
                            <TableHead>Sl No</TableHead>
                            <TableHead>Group Name</TableHead>
                            <TableHead className='text-right'>Balance Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((group, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Checkbox
                                        checked={group.grpselected}
                                        onCheckedChange={(v) =>
                                            setLocalGroups((prev) => prev.map((g, i) => (i === idx ? { ...g, grpselected: !!v } : g)))
                                        }
                                    />
                                </TableCell>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className='font-medium'>{group.FMG_GroupName}</TableCell>
                                <TableCell className='text-right font-bold text-destructive'>
                                    ₹{group.totalbalance.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    const renderHeadTable = () => {
        const filtered = localHeads.filter((h) => h.FMH_FeeName.toLowerCase().includes(searchValue.toLowerCase()));
        return (
            <div className='overflow-hidden rounded-md border bg-card shadow-sm'>
                <Table>
                    <TableHeader className='bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-[50px]'>
                                <Checkbox checked={checkAll} onCheckedChange={(v) => handleCheckAll(!!v)} />
                            </TableHead>
                            <TableHead>Sl No</TableHead>
                            <TableHead>Head Name</TableHead>
                            <TableHead className='text-right'>Balance Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((head, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Checkbox
                                        checked={head.hadselected}
                                        onCheckedChange={(v) =>
                                            setLocalHeads((prev) => prev.map((h, i) => (i === idx ? { ...h, hadselected: !!v } : h)))
                                        }
                                    />
                                </TableCell>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className='font-medium'>{head.FMH_FeeName}</TableCell>
                                <TableCell className='text-right font-bold text-destructive'>
                                    ₹{head.totalbalance.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    const renderClassTable = () => {
        const filtered = localClasses.filter((c) => c.ASMCL_ClassName.toLowerCase().includes(searchValue.toLowerCase()));
        return (
            <div className='overflow-hidden rounded-md border bg-card shadow-sm'>
                <Table>
                    <TableHeader className='bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-[50px]'>
                                <Checkbox checked={checkAll} onCheckedChange={(v) => handleCheckAll(!!v)} />
                            </TableHead>
                            <TableHead>Sl No</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead className='text-right'>Balance Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((cls, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Checkbox
                                        checked={cls.clsselected}
                                        onCheckedChange={(v) =>
                                            setLocalClasses((prev) => prev.map((c, i) => (i === idx ? { ...c, clsselected: !!v } : c)))
                                        }
                                    />
                                </TableCell>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className='font-medium'>{cls.ASMCL_ClassName}</TableCell>
                                <TableCell className='text-right font-bold text-destructive'>
                                    ₹{cls.totalbalance.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center justify-between gap-4 rounded-lg border border-primary/5 bg-muted/20 p-4 md:flex-row'>
                <div className='flex items-center gap-6'>
                    <div className='flex flex-col'>
                        <span className='font-bold text-[10px] text-muted-foreground uppercase'>Report Type</span>
                        <span className='font-bold text-primary text-sm'>
                            {data.radioval === 'FSW'
                                ? 'Student Wise'
                                : data.radioval === 'FGW'
                                  ? 'Group Wise'
                                  : data.radioval === 'FHW'
                                    ? 'Head Wise'
                                    : 'Class Wise'}
                        </span>
                    </div>
                </div>
                <div className='relative w-full md:w-80'>
                    <SearchIcon className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search report records...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='h-10 border-primary/20 bg-background pl-10'
                    />
                </div>
                <div className='flex gap-2'>
                    <Button variant='outline' className='gap-2 border-green-500/50 text-green-600 text-xs hover:bg-green-50'>
                        <FileSpreadsheet className='h-3.5 w-3.5' /> Export
                    </Button>
                    <Button variant='outline' className='gap-2 border-blue-500/50 text-blue-600 text-xs hover:bg-blue-50'>
                        <Printer className='h-3.5 w-3.5' /> Print
                    </Button>
                </div>
            </div>

            {data.radioval === 'FSW' && renderStudentTable()}
            {data.radioval === 'FGW' && renderGroupTable()}
            {data.radioval === 'FHW' && renderHeadTable()}
            {data.radioval === 'FCW' && renderClassTable()}
        </div>
    );
}
