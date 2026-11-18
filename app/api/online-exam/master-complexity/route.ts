import axios from 'axios';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NAAC_URL = 'http://localhost:5000/api';

function extractArr(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val.$values && Array.isArray(val.$values)) return val.$values;
    if (val.data) return extractArr(val.data);
    return [];
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const miId = searchParams.get('MI_Id') || '30';

        const res = await axios.get(`${NAAC_URL}/MasterComplexityFacade?page=1&page_size=500`, {
            timeout: 10000
        });

        const list = extractArr(res.data?.data || res.data);

        return NextResponse.json({
            success: true,
            data: {
                getMasterComplexitiesdetails: list,
                masterComplexityList: list,
                complexityList: list
            }
        });
    } catch (error: any) {
        console.error('Error fetching master complexity:', error.message);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch master complexity',
                data: {
                    getMasterComplexitiesdetails: [],
                    masterComplexityList: [],
                    complexityList: []
                }
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, ...payload } = body;

        if (action === 'toggle' && (payload.LPMCOMP_Id || payload.lpmcomP_Id)) {
            const id = payload.LPMCOMP_Id || payload.lpmcomP_Id;
            const toggleRes = await axios.put(`${NAAC_URL}/MasterComplexityFacade/toggle/${id}`, {}, {
                timeout: 10000
            });
            return NextResponse.json(toggleRes.data);
        }

        const res = await axios.post(`${NAAC_URL}/MasterComplexityFacade`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });

        return NextResponse.json({
            success: res.data?.success !== false,
            data: res.data?.data || res.data || {},
            message: res.data?.message || 'Operation successful',
            returnval: res.data?.success ?? true
        });
    } catch (error: any) {
        console.error('Error in master complexity action:', error.message);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Action failed',
                message: error.response?.data?.message || error.message
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.LPMCOMP_Id || body.lpmcomP_Id;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing complexity ID' }, { status: 400 });
        }

        const res = await axios.delete(`${NAAC_URL}/MasterComplexityFacade/delete/${id}`, {
            timeout: 10000
        });

        return NextResponse.json({
            success: res.data?.success !== false,
            message: res.data?.message || 'Deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting complexity:', error.message);
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || error.message || 'Delete failed'
            },
            { status: 500 }
        );
    }
}
