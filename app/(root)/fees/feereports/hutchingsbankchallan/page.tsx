'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import {
    useHutchingsBankChallanOnload,
    useGenerateHutchingsBankChallan,
    useDeleteHutchingsBankChallan
} from '@/hooks/fees/useHutchingsBankChallan';
import type { IHutchingsBankChallanItem } from '@/types/fees/reports/hutchings_bank_challan';
import { BankChallanForm } from './_components/bank-challan-form';
import { StudentChallanListTable } from './_components/student-challan-list-table';
import { ChallanViewModal } from './_components/challan-view-modal';

export default function HutchingsBankChallanPage() {
    const { data: onloadData, isLoading } = useHutchingsBankChallanOnload();
    const { mutateAsync: generateChallan, isPending: isGenerating } = useGenerateHutchingsBankChallan();
    const { mutateAsync: deleteChallan } = useDeleteHutchingsBankChallan();

    const [challanList, setChallanList] = useState<IHutchingsBankChallanItem[]>([]);
    const [selectedChallanForView, setSelectedChallanForView] = useState<IHutchingsBankChallanItem | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleFormSubmit = async (values: any) => {
        try {
            await generateChallan(values);

            const selectedStudent = onloadData?.studentList?.find((s) => s.amst_Id === values.AMST_Id);
            const studentName = selectedStudent?.amsT_StudentName||"";

            const newChallanNo = `HHS${212 + challanList.length}`;
            const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

            const newChallan: IHutchingsBankChallanItem = {
                slNo: 1,
                amst_Id: values.AMST_Id,
                studentName:studentName,
                admNo:'',
                amount:0,
                challanNo:"",
                className:"",
                downloadDate:"",
                sectionName:"",
                asmay_Year:"",
                termNames:''
            };

            setChallanList((prev) => [
                newChallan,
                ...prev.map((item, idx) => ({ ...item, slNo: idx + 2 }))
            ]);

            toast.success(`Bank Challan ${newChallanNo} generated successfully for ${studentName}!`);
        } catch (error: any) {
            console.error('Error generating challan:', error);
            toast.error(error?.message || 'Failed to generate bank challan');
        }
    };

    const handleResetForm = () => {
        toast.info('Form reset');
    };

    const handleViewChallan = (challan: IHutchingsBankChallanItem) => {
        setSelectedChallanForView(challan);
        setIsViewModalOpen(true);
    };

    const handleDeleteChallan = async (challanNo: string) => {
        try {
            await deleteChallan(challanNo);
            setChallanList((prev) =>
                prev
                    .filter((c) => c.challanNo !== challanNo)
                    .map((item, idx) => ({ ...item, slNo: idx + 1 }))
            );
            toast.success(`Challan ${challanNo} removed successfully`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete challan');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-600">Loading Hutchings Bank Challan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 space-y-8">
                {/* Main Card Container */}
                <Card className="border-0 shadow-xl">
                    <div className="p-8">
                        <div className="space-y-8">
                            {/* Bank Challan Form */}
                            <BankChallanForm
                                onSubmit={handleFormSubmit}
                                isSubmitting={isGenerating}
                                onReset={handleResetForm}
                            />

                            {/* Student Challan List Table Section */}
                            <StudentChallanListTable
                                challanList={challanList}
                                onViewChallan={handleViewChallan}
                                onDeleteChallan={handleDeleteChallan}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* View Modal */}
            <ChallanViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                challan={selectedChallanForView}
            />
        </div>
    );
}
