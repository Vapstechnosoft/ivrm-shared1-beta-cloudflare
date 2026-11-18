import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let status = 'success';
    let txnid = '';
    let amount = '';
    let receiptno = '';
    let message = '';
    let edvironCollectRequestId = '';
    let rawData: Record<string, any> = {};

    try {
        const formData = await request.formData();
        rawData = Object.fromEntries(formData.entries());
        status = (formData.get('status') as string) || (formData.get('payment_status') as string) || 'success';
        edvironCollectRequestId =
            (formData.get('EdvironCollectRequestId') as string) ||
            (formData.get('edvironCollectRequestId') as string) ||
            (formData.get('collect_request_id') as string) ||
            (formData.get('collectRequestId') as string) ||
            '';
        txnid = (formData.get('txnid') as string) || (formData.get('transaction_id') as string) || edvironCollectRequestId || '';
        amount = (formData.get('amount') as string) || '';
        receiptno = (formData.get('receiptno') as string) || (formData.get('fyP_Receipt_No') as string) || '';
        message = (formData.get('error_Message') as string) || (formData.get('msg') as string) || (formData.get('reason') as string) || '';
    } catch {
        try {
            rawData = await request.json();
            status = rawData.status || rawData.payment_status || 'success';
            edvironCollectRequestId =
                rawData.EdvironCollectRequestId ||
                rawData.edvironCollectRequestId ||
                rawData.collect_request_id ||
                rawData.collectRequestId ||
                '';
            txnid = rawData.txnid || rawData.transaction_id || edvironCollectRequestId || '';
            amount = rawData.amount || '';
            receiptno = rawData.receiptno || rawData.fyP_Receipt_No || '';
            message = rawData.error_Message || rawData.msg || rawData.reason || '';
        } catch {
            const url = new URL(request.url);
            status = url.searchParams.get('status') || url.searchParams.get('payment_status') || 'success';
            edvironCollectRequestId =
                url.searchParams.get('EdvironCollectRequestId') ||
                url.searchParams.get('edvironCollectRequestId') ||
                url.searchParams.get('collect_request_id') ||
                url.searchParams.get('collectRequestId') ||
                '';
            txnid = url.searchParams.get('txnid') || url.searchParams.get('transaction_id') || edvironCollectRequestId || '';
            amount = url.searchParams.get('amount') || '';
            receiptno = url.searchParams.get('receiptno') || url.searchParams.get('fyP_Receipt_No') || '';
            message = url.searchParams.get('msg') || url.searchParams.get('message') || url.searchParams.get('reason') || '';
        }
    }

    console.log('====================================================');
    console.log('🔔 [Edviron Callback] Received Payment Data:');
    console.log(JSON.stringify(rawData, null, 2));
    console.log('====================================================');

    // Server-to-server notification to backend fees API if session token is available
    if (Object.keys(rawData).length > 0) {
        const feesBaseUrl = process.env.FEES_API_BASE_URL || 'https://vidhya.vapssmartecampus.com:21495/api';

        let token: string | undefined;
        try {
            const session = await auth();
            token = (session as any)?.token;
        } catch {}

        if (token) {
            const finalCollectRequestId = String(
                rawData.collect_request_id ||
                rawData.EdvironCollectRequestId ||
                rawData.edvironCollectRequestId ||
                rawData.txnid ||
                rawData.transaction_id ||
                edvironCollectRequestId ||
                txnid ||
                ''
            );

            let miId = 0;
            try {
                const session = await auth();
                miId = Number((session as any)?.mi_id || (session as any)?.user?.mi_id || 0);
            } catch {}

            const edvironBackendPayload = {
                collect_request_id: finalCollectRequestId,
                collect_request_url: String(rawData.collect_request_url || ''),
                sign: String(rawData.sign || ''),
                status: String(rawData.status || rawData.payment_status || finalStatus || 'cancelled'),
                amount: String(rawData.amount || amount || '0'),
                mI_Id: Number(rawData.mI_Id || rawData.MI_Id || miId || 0),
                additional_data: [
                    {
                        uid: String(rawData.uid || rawData.reason || rawData.msg || rawData.error_Message || message || ''),
                        uid1: String(rawData.uid1 || ''),
                        uid2: String(rawData.uid2 || ''),
                        uid3: String(rawData.uid3 || ''),
                        uid4: String(rawData.uid4 || '')
                    }
                ]
            };

            console.log(`🚀 [Edviron Callback] Calling: ${feesBaseUrl}/FeeOnlinePaymentFacade/EdvironnResponse with session token...`);
            fetch(`${feesBaseUrl}/FeeOnlinePaymentFacade/EdvironnResponse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(edvironBackendPayload)
            })
                .then(async (res) => {
                    console.log(`📥 [Edviron Callback] /FeeOnlinePaymentFacade/EdvironnResponse Status: ${res.status}`);
                    if (res.ok) {
                        const data = await res.json().catch(() => null);
                        console.log('📦 [Edviron Callback] Response Data:', data);
                    }
                })
                .catch((err) => {
                    console.error('❌ [Edviron Callback] Error calling /FeeOnlinePaymentFacade/EdvironnResponse:', err);
                });
        } else {
            console.log('ℹ️ [Edviron Callback] No Bearer token on cross-origin callback. Authenticated client session will notify the backend upon redirect.');
        }
    }

    const finalReceiptNo = receiptno || '';
    const finalTxnId = txnid || edvironCollectRequestId || '';
    const finalStatus = status || 'cancelled';

    const queryParams = new URLSearchParams();
    for (const [k, v] of Object.entries(rawData)) {
        if (typeof v === 'string' && v.length < 300) {
            queryParams.set(k, v);
        }
    }
    queryParams.set('status', finalStatus);
    if (edvironCollectRequestId) queryParams.set('EdvironCollectRequestId', edvironCollectRequestId);
    if (finalTxnId) queryParams.set('txnid', finalTxnId);
    if (amount) queryParams.set('amount', amount);
    if (finalReceiptNo) queryParams.set('receiptno', finalReceiptNo);
    if (message) queryParams.set('message', message);
    queryParams.set('gateway', 'EDVIRON');

    const targetUrl = `/StudentPortal/masters/feeonlinpayment?${queryParams.toString()}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${targetUrl}">
    <title>Redirecting to Fee Payment...</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc;">
    <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 0.5rem; color: #1e293b;">Redirecting...</h2>
        <p style="margin: 0; color: #64748b;">Please wait while we redirect you back to the fee payment screen.</p>
    </div>
    <script>
        try {
            sessionStorage.setItem('edviron_callback_data', JSON.stringify(${JSON.stringify(rawData)}));
        } catch (e) {}
        window.location.replace('${targetUrl}');
    </script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    if (!searchParams.has('gateway')) {
        searchParams.set('gateway', 'EDVIRON');
    }
    const targetUrl = `/StudentPortal/masters/feeonlinpayment?${searchParams.toString()}`;

    const rawData = Object.fromEntries(url.searchParams.entries());

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Fee Payment...</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc;">
    <script>
        try {
            sessionStorage.setItem('edviron_callback_data', JSON.stringify(${JSON.stringify(rawData)}));
        } catch (e) {}
        window.location.replace('${targetUrl}');
    </script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}
