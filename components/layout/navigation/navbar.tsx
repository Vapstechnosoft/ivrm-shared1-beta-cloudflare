import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { UserNav } from '../user-nav';
import { AIAgentHeader } from './ai-agent-header';
import { ContactUs } from './contact-us';
import { HeaderSearch } from './header-search';
import { IntelligentAppsMenu } from './intelligent-apps-menu';
import Logo from './logo';
import { NavigationSystem } from './navigation-system';
import { OperationTools } from './operation-tools';

export default async function Navbar() {
    const session = await auth();

    return (
        <header className='sticky top-0 z-30 w-full border-border/40 border-b bg-background'>
            <div className='container flex max-h-14 items-center py-2'>
                <div className='flex w-full items-center gap-2'>
                    <Logo size='icon' herf={ROUTES.DASHBOARD} />
                    {session?.mi_name && (
                        <span
                            className='ml-2 hidden max-w-[250px] truncate border-l py-1 pl-3 font-semibold text-foreground/80 text-sm md:inline-block'
                            title={session.mi_name}>
                            {session.mi_name}
                        </span>
                    )}
                    <NavigationSystem />
                    <div className='flex items-center gap-4'>
                        <HeaderSearch />
                        <OperationTools />
                        <ContactUs />
                        <IntelligentAppsMenu />
                        <AIAgentHeader />

                        {/* <UserNotificationPage /> */}
                        <UserNav session={session} />
                    </div>
                </div>
            </div>
        </header>
    );
}
