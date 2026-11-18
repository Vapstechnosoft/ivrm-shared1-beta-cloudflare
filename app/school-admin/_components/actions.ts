'use server';

import { auth } from '@/lib/auth';
import { getAIDashboardData } from '@/server/admission/AI/masterInstDocument';

export async function fetchAdmissionAnalytics() {
    try {
        const session = await auth();
        const activeMiId = session?.mi_id || (session as any)?.user?.mi_id;

        // 1. Fetch raw dashboard data from our backend via the properly structured server API call
        const backendResponse = await getAIDashboardData({ MI_Id: activeMiId });

        if (!backendResponse.success && !backendResponse.data) {
            console.error('Failed to fetch from our backend:', backendResponse.message);
            throw new Error(`Failed to fetch from backend: ${backendResponse.message}`);
        }

        // The dashboard AI API expects the exact full response object from our backend (with success, message, data).
        const payloadForAI = backendResponse;

        // 2. Post our backend's full response to the AI team's new dashboard API
        const aiApiUrl = 'https://dashboard-backend-f93mvm00u-sai-kumar-projects6.vercel.app/dashboard';
        const aiResponse = await fetch(aiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(payloadForAI)
        });

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error('Failed to fetch from AI API:', errText);
            throw new Error(`Failed to fetch AI analytics: ${aiResponse.statusText}`);
        }

        const data = await aiResponse.json();
        return data;
    } catch (error) {
        console.error('Error fetching admission analytics:', error);
        return null;
    }
}
