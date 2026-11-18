'use client';

import { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

import { usePreadmissionStatusData, usePreadmissionStatusSearch } from '@/hooks/college/useCollegeTransactions';
import { IClgPreadmissionStudent, IClgPreadmissionStatusFilter, IClgPreadmissionStatusUpdate } from '@/types/college/transactions';

import PreadmissionStatusSearchForm from './_components/search-form';
import PreadmissionStatusGrid from './_components/status-grid';
import CommunicationForm, { CommunicationFormValues } from './_components/communication-form';
import OTPVerificationModal from './_components/modals/otp-verification-modal';

export default function PreadmissionStatusPage() {
    const [students, setStudents] = useState<IClgPreadmissionStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<IClgPreadmissionStudent[]>([]);
    const [commValues, setCommValues] = useState<CommunicationFormValues>({ email: false, sms: false, default: false });
    const [statusType, setStatusType] = useState<'Appsts' | 'admsts'>('Appsts');
    const [statusList, setStatusList] = useState<any[]>([]);
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [updatePayload, setUpdatePayload] = useState<IClgPreadmissionStatusUpdate | null>(null);

    const { data: initialResponse, isLoading: isInitialLoading } = usePreadmissionStatusData();
    const { mutateAsync: searchStudents, isPending: isSearching } = usePreadmissionStatusSearch();

    const initialData = initialResponse?.data || {};

    const handleSearch = async (filter: IClgPreadmissionStatusFilter) => {
        setStatusType(filter.status_type);
        const res = await searchStudents(filter);
        const list = res?.data?.studentList || res?.data || [];
        setStudents(list);
        setSelectedStudents([]);

        // Update status list based on type
        const slist = (initialData?.statusList || []).filter((s: any) =>
            filter.status_type === 'Appsts' ? s.pamsT_ApplStatusFlag === 1 : s.pamsT_AdmStatusFlag === 1
        );
        setStatusList(slist);

        if (list.length === 0) {
            toast.info('No students found for the selected criteria.');
        }
    };

    const handleCancel = () => {
        setStudents([]);
        setSelectedStudents([]);
    };

    const handleStudentStatusChange = (pacA_Id: number, pamsT_Id: number) => {
        setStudents((prev) =>
            prev.map((s) => (s.pacA_Id === pacA_Id ? { ...s, pamsT_Id } : s))
        );
    };

    const handleStudentRemarkChange = (pacA_Id: number, remark: string) => {
        setStudents((prev) =>
            prev.map((s) => (s.pacA_Id === pacA_Id ? { ...s, pacA_Statusremark: remark } : s))
        );
    };

    const handleBulkStatusChange = (pamsT_Id: number) => {
        setStudents((prev) => prev.map((s) => {
            if (selectedStudents.some((sel) => sel.pacA_Id === s.pacA_Id)) {
                return { ...s, pamsT_Id };
            }
            return s;
        }));
    };

    const handleUpdateStatus = () => {
        const toUpdate = selectedStudents.length > 0
            ? students.filter((s) => selectedStudents.some((sel) => sel.pacA_Id === s.pacA_Id))
            : students;

        if (toUpdate.length === 0) {
            toast.error('No students selected or loaded to update.');
            return;
        }

        const payload: IClgPreadmissionStatusUpdate = {
            studentlist: toUpdate,
            Student_status: statusType,
            email: commValues.email,
            sms: commValues.sms,
            default: commValues.default,
            MailSubject: commValues.MailSubject,
            MailHeader: commValues.MailHeader,
            Parameter_email: commValues.Parameter_email,
            MailFooter: commValues.MailFooter,
            smscontent: commValues.smscontent,
        };

        setUpdatePayload(payload);
        setIsOTPModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        setSelectedStudents([]);
        setStudents([]);
    };

    const handleViewApplication = (student: IClgPreadmissionStudent) => {
        // Open the student application form in a new tab
        window.open(`/College/CollegePreadmission/Transactions/PreadmissionStatus/application?pacA_Id=${student.pacA_Id}`, '_blank');
    };

    const studentsToUpdate = selectedStudents.length > 0 ? selectedStudents : students;

    return (
        <div className="min-h-screen">
            <div className="container space-y-4 p-1">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Preadmission Status</h1>
                    <p className="text-sm text-muted-foreground">
                        Search and update preadmission application or admission statuses.
                    </p>
                </div>

                {/* Search Section */}
                <CollapsibleSection title="Search Criteria" defaultOpen={true}>
                    <PreadmissionStatusSearchForm
                        initialData={initialData}
                        onSearch={handleSearch}
                        onCancel={handleCancel}
                        isLoading={isSearching || isInitialLoading}
                    />
                </CollapsibleSection>

                {/* Results Grid */}
                {students.length > 0 && (
                    <CollapsibleSection title={`Students (${students.length})`} defaultOpen={true}>
                        <div className="space-y-3">
                            {selectedStudents.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{selectedStudents.length} selected</Badge>
                                </div>
                            )}
                            <PreadmissionStatusGrid
                                students={students}
                                statusList={statusList}
                                statusType={statusType}
                                selectedStudents={selectedStudents}
                                onSelectionChange={setSelectedStudents}
                                onStudentStatusChange={handleStudentStatusChange}
                                onStudentRemarkChange={handleStudentRemarkChange}
                                onBulkStatusChange={handleBulkStatusChange}
                                onViewApplication={handleViewApplication}
                            />
                        </div>
                    </CollapsibleSection>
                )}

                {/* Communication Section */}
                {students.length > 0 && (
                    <CollapsibleSection title="Communication Settings" defaultOpen={false}>
                        <CommunicationForm onChange={setCommValues} />
                    </CollapsibleSection>
                )}

                {/* Action Bar */}
                {students.length > 0 && (
                    <div className="flex items-center justify-between border rounded-md p-3 bg-muted/20 sticky bottom-4">
                        <div className="text-sm text-muted-foreground">
                            Updating: <span className="font-medium text-foreground">{studentsToUpdate.length}</span> student(s)
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel} className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </Button>
                            <Button onClick={handleUpdateStatus} className="gap-2">
                                <Save className="h-4 w-4" />
                                Update Status
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* OTP Verification Modal */}
            {isOTPModalOpen && updatePayload && (
                <OTPVerificationModal
                    open={isOTPModalOpen}
                    onClose={() => setIsOTPModalOpen(false)}
                    onSuccess={handleUpdateSuccess}
                    updatePayload={updatePayload}
                    selectedStudents={studentsToUpdate}
                />
            )}
        </div>
    );
}
