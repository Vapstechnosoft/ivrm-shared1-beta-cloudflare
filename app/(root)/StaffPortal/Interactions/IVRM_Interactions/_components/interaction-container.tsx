'use client';

import { ComposeTab } from '@/app/(root)/StaffPortal/Interactions/IVRM_Interactions/_components/compose-tab';
import { FeedbackModal } from '@/app/(root)/StaffPortal/Interactions/IVRM_Interactions/_components/feedback-modal';
import { InboxTab } from '@/app/(root)/StaffPortal/Interactions/IVRM_Interactions/_components/inbox-tab';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitialInteractions, loadFeedbackQuestions } from '@/server/staff-portal/interactions';
import type { IFeedbackOption, IFeedbackQuestion, IInteractionsInitialData } from '@/types/staff-portal/interactions';
import { useCallback, useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InteractionContainerProps {
    initialData: IInteractionsInitialData;
}
export const dynamic = 'force-dynamic';
export function InteractionContainer({ initialData }: InteractionContainerProps) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [interactionsData, setInteractionsData] = useState(initialData);
    const [feedbackData, setFeedbackData] = useState<{ questions: IFeedbackQuestion[]; options: IFeedbackOption[] } | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const roleFlg = interactionsData.roletype?.[0]?.ivrmrT_Role || 'Staff';
    const isStudent = roleFlg === 'Student';

    // Refresh inbox data
    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getInitialInteractions();
            if (response.success && response.data) {
                setInteractionsData(response.data);
            }
        } catch (error) {
            console.error('Failed to refresh interactions:', error);
            toast.error('Failed to refresh data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check for feedback on load - matches legacy loaddata -> loadmodulefeedback
    useEffect(() => {
        const checkFeedback = async () => {
            try {
                const response = await loadFeedbackQuestions('Interaction');
                if (response.success && response.data && response.data.feedbackquestion?.length > 0) {
                    const mappedQuestions = response.data.feedbackquestion.map((q) => ({
                        ...q,
                        feedbackoptiondata: (response.data as any).feedbackoption.filter((o: any) => o.fmqE_Id === q.fmqE_Id)
                    }));
                    setFeedbackData({
                        questions: mappedQuestions,
                        options: (response.data as any).feedbackoption
                    });
                    setShowFeedback(true);
                }
            } catch (error) {
                console.error('Error checking feedback:', error);
            }
        };

        checkFeedback();
    }, []);

    const onTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <Card className='overflow-hidden rounded-none border shadow-lg'>
            <div className='flex items-center justify-between border-orange-400 border-t-2 border-t-orange-400 border-b bg-white px-4 py-2'>
                <h2 className='font-black text-[#1e40af] text-[11px] uppercase tracking-[0.2em]'>INTERACTIONS</h2>
                <div className='h-0.5 w-6 bg-slate-200'></div>
            </div>
            <CardContent className='p-0'>
                <Tabs value={activeTab} onValueChange={onTabChange} className='w-full'>
                    <div className='border-b bg-slate-50 px-2 py-2'>
                        <TabsList className='h-8 justify-start gap-0 rounded-none border border-slate-200 bg-transparent p-0'>
                            <TabsTrigger
                                value='inbox'
                                className='h-8 rounded-none border-slate-200 border-r bg-white px-6 font-black text-[#1e40af] text-[10px] uppercase tracking-wider shadow-none transition-all data-[state=active]:bg-[#1e40af] data-[state=active]:text-white data-[state=active]:shadow-none'>
                                Inbox
                            </TabsTrigger>

                            {!isStudent ? (
                                <>
                                    <TabsTrigger
                                        value='group'
                                        className='h-8 rounded-none border-slate-200 border-r bg-white px-6 font-black text-[#1e40af] text-[10px] uppercase tracking-wider shadow-none transition-all data-[state=active]:bg-[#1e40af] data-[state=active]:text-white data-[state=active]:shadow-none'>
                                        Group
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='individual'
                                        className='h-8 rounded-none bg-white px-6 font-black text-[#1e40af] text-[10px] uppercase tracking-wider shadow-none transition-all data-[state=active]:bg-[#1e40af] data-[state=active]:text-white data-[state=active]:shadow-none'>
                                        Individual
                                    </TabsTrigger>
                                </>
                            ) : (
                                <TabsTrigger
                                    value='individual'
                                    className='h-8 rounded-none bg-white px-6 font-black text-[#1e40af] text-[10px] uppercase tracking-wider shadow-none transition-all data-[state=active]:bg-[#1e40af] data-[state=active]:text-white data-[state=active]:shadow-none'>
                                    Compose
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    <div className='relative min-h-[400px] p-6'>
                        {isLoading && (
                            <div className='absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px]'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            </div>
                        )}

                        <TabsContent value='inbox' className='mt-0 outline-none'>
                            <InboxTab data={interactionsData} onRefresh={refreshData} roleFlg={roleFlg} />
                        </TabsContent>

                        <TabsContent value='group' className='mt-0 outline-none'>
                            <ComposeTab
                                data={interactionsData}
                                mode='Group'
                                onCancel={() => setActiveTab('inbox')}
                                onSuccess={() => {
                                    setActiveTab('inbox');
                                    refreshData();
                                }}
                            />
                        </TabsContent>

                        <TabsContent value='individual' className='mt-0 outline-none'>
                            <ComposeTab
                                data={interactionsData}
                                mode='Individual'
                                onCancel={() => setActiveTab('inbox')}
                                onSuccess={() => {
                                    setActiveTab('inbox');
                                    refreshData();
                                }}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>

            {showFeedback && feedbackData && (
                <FeedbackModal
                    isOpen={showFeedback}
                    onClose={() => setShowFeedback(false)}
                    questions={feedbackData.questions}
                    options={feedbackData.options}
                    roleFlg={roleFlg}
                    userhrmE_Id={interactionsData.userhrmE_Id || 0}
                />
            )}
        </Card>
    );
}

export default InteractionContainer;
