import ParentsDashboard from '@/components/ui/dashboard/parents-dashboard';
import { ROLES } from '@/constants';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect('/sign-in');
    }

    const role = (session.role as string)?.toUpperCase();
    if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
        redirect('/school-admin');
    } else if (role === ROLES.STUDENT) {
        redirect('/StudentPortal/student-dashboard');
    } else if (role === ROLES.CHAIRMAN) {
        redirect('/chairman');
    } else if (role === ROLES.STAFF || role === ROLES.GENERAL_STAFF || role === ROLES.HR_ADMIN) {
        redirect('/StaffPortal/staff-dashboard');
    }

    return (
        <main className='container px-0 py-2'>
            <ParentsDashboard />
        </main>
    );
}
