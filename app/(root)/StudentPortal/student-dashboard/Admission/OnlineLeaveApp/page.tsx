'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LeaveApplicationForm from './_components/leave-application-form';
import LeaveDetailsGrid from './_components/leave-details-grid';
import { applyLeave, cancelLeave, getLeaveLoadData } from './actions';
import type { LeaveApplication, StudentDetails } from './types';

export default function OnlineLeaveAppPage() {
    const { status, data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [student, setStudent] = useState<StudentDetails | null>(null);
    const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
    const [editingLeave, setEditingLeave] = useState<LeaveApplication | null>(null);
    const [mi_Id, setMi_Id] = useState<number>(0);
    const [asmaY_Id, setAsmaY_Id] = useState<number>(0);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const result = await getLeaveLoadData();
            if (result) {
                setMi_Id(result.mi_Id || 0);
                setAsmaY_Id(result.asmaY_Id || 0);

                if (result.studentdetails && result.studentdetails.length > 0) {
                    setStudent(result.studentdetails[0]);
                } else if (!student && session?.user) {
                    // Fallback to session data if API returns empty
                    setStudent({
                        amsT_Id: 0,
                        asmS_Id: 0,
                        asmcL_Id: 0,
                        asmcL_ClassName: '',
                        asmC_SectionName: '',
                        amsT_FirstName: session.user.name || '',
                        amsT_RegistrationNo: '',
                        amsT_MobileNo: 0,
                        amsT_emailId: session.user.email || ''
                    });
                }

                if (result.allstuddata) {
                    setLeaveApplications(result.allstuddata);
                }
            }
        } catch (error) {
            console.error('Failed to load initial data', error);
            toast.error('Failed to load leave data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status !== 'loading') {
            loadInitialData();
        }
    }, [status]);

    const handleApplyLeave = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                aslA_Id: data.aslA_Id,
                mi_Id: mi_Id,
                amsT_Id: student?.amsT_Id || 0,
                asmaY_Id: asmaY_Id,
                aslA_LeaveId: data.aslA_LeaveId ? Number.parseInt(data.aslA_LeaveId) : 0,
                aslA_Reason: data.aslA_Reason,
                aslA_ApplyDate: new Date().toISOString(),
                aslA_FromDate: data.aslA_FromDate.toISOString(),
                aslA_ToDate: data.aslA_ToDate.toISOString(),
                aslA_Flag: data.aslA_Flag
            };

            await applyLeave(payload);
            toast.success(data.aslA_Id > 0 ? 'Leave updated successfully!' : 'Leave applied successfully!');

            // Refresh data
            await loadInitialData();
            setEditingLeave(null);
        } catch (error) {
            console.error('Failed to apply leave', error);
            toast.error('Failed to apply leave');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelLeave = async (leave: LeaveApplication) => {
        if (!leave.aslA_Id) return;

        // Optimistic update
        const previousLeaves = [...leaveApplications];
        setLeaveApplications((prev) => prev.map((l) => (l.aslA_Id === leave.aslA_Id ? { ...l, aslA_Status: 'Cancelled' } : l)));

        try {
            await cancelLeave(leave.aslA_Id);
            toast.success('Leave cancelled successfully');
        } catch (error) {
            // Revert on failure
            setLeaveApplications(previousLeaves);
            console.error('Failed to cancel leave', error);
            toast.error('Failed to cancel leave');
        }
    };

    const handleEditLeave = (leave: LeaveApplication) => {
        setEditingLeave(leave);
        // Scroll to top to show form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setEditingLeave(null);
    };

    if (status === 'loading') {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        );
    }

    // if (!student && !isLoading) {
    //     return (
    //         <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border m-4 shadow-sm">
    //             <div className="bg-yellow-100 p-3 rounded-full mb-4">
    //                 <AlertTriangle className="h-8 w-8 text-yellow-600" />
    //             </div>
    //             <h3 className="text-xl font-semibold mb-2">No Student Data Found</h3>
    //             <p className="text-muted-foreground max-w-md mx-auto">
    //                 We couldn't retrieve the student details. Please try reloading the page or contact the administrator.
    //             </p>
    //             <Button
    //                 variant="outline"
    //                 className="mt-6"
    //                 onClick={() => window.location.reload()}
    //             >
    //                 Reload Page
    //             </Button>
    //         </div>
    //     );
    // }

    return (
        <div className='space-y-6'>
            <LeaveApplicationForm
                student={student}
                isSubmitting={isSubmitting}
                onSubmit={handleApplyLeave}
                onCancel={handleCancelForm}
                initialData={editingLeave}
            />

            {isLoading ? (
                <div className='flex justify-center p-8'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
            ) : (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='font-bold text-xl'>Student Leave Details</CardTitle>
                            <div className='text-muted-foreground text-sm'>
                                Total Records: <span className='font-bold text-primary'>{leaveApplications.length}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {leaveApplications.length > 0 ? (
                                <LeaveDetailsGrid
                                    data={leaveApplications}
                                    onCancelLeave={handleCancelLeave}
                                    onEditLeave={handleEditLeave}
                                />
                            ) : (
                                <div className='rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground'>
                                    No leave records found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
