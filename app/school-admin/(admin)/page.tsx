import { GetChairmanDashBoardFeesdata, GetTeacherCount, getDashboardCounts } from '@/server/dashboards/chairman-dashboard';
import { AdminDashboardClient } from './_components/admin-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    let initialDashboardData: any = null;
    let initialTeachers: number | null = null;
    let initialTotalFeeCollected = 0;
    let initialFeeDetailsData: any[] = [];

    try {
        const [response, feesResponse, teacherResponse] = await Promise.allSettled([
            getDashboardCounts(),
            GetChairmanDashBoardFeesdata(),
            GetTeacherCount()
        ]);

        if (teacherResponse.status === 'fulfilled') {
            const teacherResult = teacherResponse.value?.data;
            const teacherData = Array.isArray(teacherResult) ? teacherResult[0] : teacherResult;
            initialTeachers = teacherData?.activeEmp?.length || 0;
        }

        if (response.status === 'fulfilled') {
            const countResult = response.value;
            initialDashboardData = countResult?.data ? countResult.data : countResult;
        }

        if (feesResponse.status === 'fulfilled') {
            const feesResult = feesResponse.value;
            const feesDataArray = feesResult?.data || [];
            if (Array.isArray(feesDataArray)) {
                initialTotalFeeCollected = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.callected || 0), 0);
                initialFeeDetailsData = feesDataArray.map((item: any) => ({
                    name: item.classname || 'Unknown',
                    Collected: item.callected || 0,
                    Receivable: item.receivable || 0,
                    Balance: item.ballance || 0
                }));
            }
        }
    } catch (error) {
        console.error('Error prefetching dashboard counts on server:', error);
    }

    return (
        <AdminDashboardClient
            initialDashboardData={initialDashboardData}
            initialTeachers={initialTeachers}
            initialTotalFeeCollected={initialTotalFeeCollected}
            initialFeeDetailsData={initialFeeDetailsData}
        />
    );
}
