import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let status = 'success';
    let txnid = '';
    let amount = '';
    let receiptno = '';
    let message = '';
    let easepayid = '';
    let rawData: Record<string, any> = {};

    try {
        const formData = await request.formData();
        rawData = Object.fromEntries(formData.entries());
        status = (formData.get('status') as string) || (formData.get('payment_status') as string) || 'success';
        txnid = (formData.get('txnid') as string) || (formData.get('transaction_id') as string) || '';
        amount = (formData.get('amount') as string) || '';
        receiptno = (formData.get('receiptno') as string) || (formData.get('fyP_Receipt_No') as string) || '';
        message = (formData.get('error_Message') as string) || (formData.get('msg') as string) || '';
        easepayid = (formData.get('easepayid') as string) || '';
    } catch {
        try {
            rawData = await request.json();
            status = rawData.status || rawData.payment_status || 'success';
            txnid = rawData.txnid || rawData.transaction_id || '';
            amount = rawData.amount || '';
            receiptno = rawData.receiptno || rawData.fyP_Receipt_No || '';
            message = rawData.error_Message || rawData.msg || '';
            easepayid = rawData.easepayid || '';
        } catch {
            const url = new URL(request.url);
            status = url.searchParams.get('status') || 'success';
            txnid = url.searchParams.get('txnid') || '';
            amount = url.searchParams.get('amount') || '';
            receiptno = url.searchParams.get('receiptno') || '';
            message = url.searchParams.get('msg') || url.searchParams.get('message') || '';
        }
    }

    console.log('====================================================');
    console.log('🔔 [Easebuzz Callback] Received Payment Data:');
    console.log(JSON.stringify(rawData, null, 2));
    console.log('====================================================');

    // Direct server-to-server notification to backend fees API

    if (Object.keys(rawData).length > 0) {
        const feesBaseUrl = process.env.FEES_API_BASE_URL || 'https://shared2.vapssmartecampus.com:21615/api';

        let token: string | undefined;
        try {
            const session = await auth();
            token = (session as any)?.token;
        } catch {}
        console.log('🔑 [Easebuzz Callback] Session token present in webhook request:', !!token);

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        if (token) {
            console.log(
                `🚀 [Easebuzz Callback] Calling: ${feesBaseUrl}/FeeOnlinePaymentFacade/getpaymentresponseeasybuzz with session token...`
            );
            fetch(`${feesBaseUrl}/FeeOnlinePaymentFacade/getpaymentresponseeasybuzz`, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify(rawData)
            })
                .then(async (res) => {
                    console.log(`📥 [Easebuzz Callback] /FeeOnlinePaymentFacade/getpaymentresponseeasybuzz Status: ${res.status}`);
                    if (res.ok) {
                        const data = await res.json().catch(() => null);
                        console.log('📦 [Easebuzz Callback] Response Data:', data);
                    }
                })
                .catch((err) => {
                    console.error('❌ [Easebuzz Callback] Error calling /FeeOnlinePaymentFacade/getpaymentresponseeasybuzz:', err);
                });
        } else {
            console.log(
                'ℹ️ [Easebuzz Callback] No Bearer token on cross-origin POST from Easebuzz. The student session will notify the backend with authorization upon page redirect.'
            );
        }
    }

    const finalReceiptNo = receiptno || '';
    const finalTxnId = txnid || '';
    const finalStatus = status || 'userCancelled';

    const queryParams = new URLSearchParams();
    for (const [k, v] of Object.entries(rawData)) {
        if (typeof v === 'string' && v.length < 300) {
            queryParams.set(k, v);
        }
    }
    queryParams.set('status', finalStatus);
    if (finalTxnId) queryParams.set('txnid', finalTxnId);
    if (amount) queryParams.set('amount', amount);
    if (finalReceiptNo) queryParams.set('receiptno', finalReceiptNo);
    if (message) queryParams.set('message', message);
    if (easepayid) queryParams.set('easepayid', easepayid);

    const targetUrl = `/StudentPortal/masters/feeonlinpayment?${queryParams.toString()}`;

    // Return HTML page with immediate client-side redirection and data persistence
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
            sessionStorage.setItem('easebuzz_callback_data', JSON.stringify(${JSON.stringify(rawData)}));
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
    const targetUrl = `/StudentPortal/masters/feeonlinpayment${url.search}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Fee Payment...</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc;">
    <script>
        window.location.href = '${targetUrl}';
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
