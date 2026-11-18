'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMasterClassCategorySection } from '@/hooks/admission/preadmission/useMasters';
import type { IMasterClassCategoryList } from '@/types/admission/preadmission/masters';
import { RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';
import ToggleMasterClassCategorySectionForm from './section-toggle-form';

interface ViewDetailModalProps {
    rowData: IMasterClassCategoryList;
    isOpen: boolean;
    onClose: () => void;
}

type SectionRow = {
    asmcC_Id?: number;
    asmaY_Year?: string;
    amC_Name?: string;
    asmcL_ClassName?: string;
    asmccS_Id?: number;
    asmS_Id?: number;
    asmC_SectionName?: string;
    asmccS_ActiveFlg?: boolean;
};

export default function ViewDetailModal({ rowData, isOpen, onClose }: ViewDetailModalProps) {
    const [isToggleFormOpen, setIsToggleFormOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const closeToggleForm = useCallback(() => {
        setIsToggleFormOpen(false);
        setSelectedRow(null);
    }, []);

    const { data: response, isLoading, refetch } = useMasterClassCategorySection(rowData.asmcC_Id);

    const flattenedData: SectionRow[] = (() => {
        const raw = (response as any)?.data ?? response;
        if (!raw) return [];

        const targetAsmcCId = rowData.asmcC_Id ?? (rowData as any)?.asmcc_Id ?? (rowData as any)?.ASMCC_Id;
        const list = Array.isArray(raw) ? raw : [raw];

        return list.flatMap((item: any) => {
            if (!item || typeof item !== 'object') return [];

            const itemAsmcCId = item.asmcC_Id ?? item.asmcc_Id ?? item.ASMCC_Id ?? item.asmcc_id;
            if (itemAsmcCId != null && targetAsmcCId != null && Number(itemAsmcCId) !== Number(targetAsmcCId)) {
                return [];
            }

            const asmaY_Year = item.asmaY_Year ?? item.asmay_Year ?? item.ASMAY_Year ?? rowData.asmaY_Year;
            const amC_Name = item.amC_Name ?? item.amc_Name ?? item.AMC_Name ?? rowData.amC_Name;
            const asmcL_ClassName = item.asmcL_ClassName ?? item.asmcl_ClassName ?? item.ASMCL_ClassName ?? rowData.asmcL_ClassName;

            const sections = item.sections ?? item.Sections;
            if (Array.isArray(sections) && sections.length > 0) {
                return sections.map((s: any) => ({
                    asmcC_Id: itemAsmcCId ?? targetAsmcCId,
                    asmaY_Year,
                    amC_Name,
                    asmcL_ClassName,
                    asmccS_Id: s.asmccS_Id ?? s.asmccs_Id ?? s.ASMCCS_Id ?? s.asmccs_id,
                    asmS_Id: s.asmS_Id ?? s.asms_Id ?? s.ASMS_Id ?? s.asms_id,
                    asmC_SectionName:
                        s.asmC_SectionName ??
                        s.asmc_SectionName ??
                        s.ASMC_SectionName ??
                        s.sectionName ??
                        s.asmC_Section_Name ??
                        '',
                    asmccS_ActiveFlg:
                        s.asmccS_ActiveFlg ??
                        s.asmccs_ActiveFlg ??
                        s.ASMCCS_ActiveFlg ??
                        s.asmccs_activeflg ??
                        s.activeFlg ??
                        true
                }));
            }

            if (item.asmS_Id != null || item.asms_Id != null || item.asmccS_Id != null || item.asmccs_Id != null || item.ASMCCS_Id != null) {
                return [
                    {
                        asmcC_Id: itemAsmcCId ?? targetAsmcCId,
                        asmaY_Year,
                        amC_Name,
                        asmcL_ClassName,
                        asmccS_Id: item.asmccS_Id ?? item.asmccs_Id ?? item.ASMCCS_Id ?? item.asmccs_id,
                        asmS_Id: item.asmS_Id ?? item.asms_Id ?? item.ASMS_Id ?? item.asms_id,
                        asmC_SectionName:
                            item.asmC_SectionName ??
                            item.asmc_SectionName ??
                            item.ASMC_SectionName ??
                            item.sectionName ??
                            '',
                        asmccS_ActiveFlg:
                            item.asmccS_ActiveFlg ??
                            item.asmccs_ActiveFlg ??
                            item.ASMCCS_ActiveFlg ??
                            item.activeFlg ??
                            true
                    }
                ];
            }

            return [];
        });
    })();

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className='max-h-[85vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader className='pb-2'>
                        <DialogTitle className='font-semibold text-lg text-foreground'>
                            Mapped Section Details
                        </DialogTitle>
                        <DialogDescription className='text-muted-foreground text-sm'>
                            {rowData.amC_Name ? `${rowData.amC_Name} - ` : ''}Class {rowData.asmcL_ClassName ?? ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='rounded-lg border bg-card'>
                        {isLoading ? (
                            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                                <RefreshCw className='h-8 w-8 animate-spin text-secondary' />
                                <p className='text-muted-foreground text-sm'>Loading details...</p>
                            </div>
                        ) : flattenedData.length === 0 ? (
                            <div className='flex flex-col items-center justify-center space-y-2 py-12'>
                                <p className='font-semibold text-base text-muted-foreground'>No Details Found</p>
                                <p className='text-muted-foreground text-sm'>No related details available</p>
                            </div>
                        ) : (
                            <div className='relative w-full overflow-auto'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='grid-header-row bg-muted/40'>
                                            <TableHead className='w-20 pl-6 font-bold text-black'>Sl.No</TableHead>
                                            <TableHead className='font-bold text-black'>Category Name</TableHead>
                                            <TableHead className='font-bold text-black'>Class</TableHead>
                                            <TableHead className='font-bold text-black'>Section</TableHead>
                                            <TableHead className='w-28 text-start font-bold text-black'>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {flattenedData.map((row, index) => (
                                            <TableRow key={row.asmccS_Id ?? `${row.asmcC_Id}-${index}`} className='hover:bg-muted/50'>
                                                <TableCell className='pl-6 font-medium'>{index + 1}</TableCell>
                                                <TableCell>{row.amC_Name}</TableCell>
                                                <TableCell>{row.asmcL_ClassName}</TableCell>
                                                <TableCell className='font-medium'>{row.asmC_SectionName}</TableCell>
                                                <TableCell>
                                                    <ActionButtonsCell
                                                        rowData={row}
                                                        onOpenToggle={(r: any) => {
                                                            setSelectedRow(r);
                                                            setIsToggleFormOpen(true);
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {isToggleFormOpen && selectedRow && (
                <ToggleMasterClassCategorySectionForm
                    SectionRow={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        refetch();
                    }}
                />
            )}
        </div>
    );
}

function ActionButtonsCell({
    rowData,
    onOpenToggle
}: {
    rowData: any;
    onOpenToggle: (r: any) => void;
}) {
    const handleToggle = useCallback(() => {
        onOpenToggle(rowData);
    }, [onOpenToggle, rowData]);

    return (
        <div className='flex items-center gap-2'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: false, toggle: true, delete: false }}
                onToggle={handleToggle}
                toggleConditionKey='asmccS_ActiveFlg'
            />
        </div>
    );
}
