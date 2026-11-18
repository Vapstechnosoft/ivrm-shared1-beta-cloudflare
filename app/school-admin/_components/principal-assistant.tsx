'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type AssistantResponse, getPrincipalAssistantResponse } from '@/server/dashboards/principal-assistant';
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, Lightbulb, RefreshCw, RotateCcw, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export interface AdminQuestion {
    id: string;
    text: string;
    category: 'Operations' | 'Overview' | 'Academics' | 'Attendance' | 'Finance' | 'Staff' | 'Admissions';
}

const ADMINISTRATIVE_QUESTIONS: AdminQuestion[] = [
    { id: 'coe_details', text: 'What are the upcoming COE details and events?', category: 'Operations' },
    { id: 'school_health', text: 'Overall school health score?', category: 'Overview' },
    { id: 'fail_risk', text: 'Which students might fail this term?', category: 'Academics' },
    { id: 'attendance_alert', text: 'Which classes have attendance problems?', category: 'Attendance' },
    { id: 'fee_projection', text: 'How much fee will we collect this year?', category: 'Finance' },
    { id: 'financial_summary', text: "Today's money summary?", category: 'Finance' },
    { id: 'teacher_load', text: 'Which teachers are overloaded?', category: 'Staff' },
    { id: 'top_students', text: 'Who are the top students?', category: 'Academics' },
    { id: 'subject_pass_rate', text: 'Which subjects have low pass rate?', category: 'Academics' },
    { id: 'remedial_subjects', text: 'Which subjects need extra help?', category: 'Academics' },
    { id: 'teacher_performance', text: 'Which teachers get best results?', category: 'Staff' },
    { id: 'staff_lateness', text: 'Which staff come late often?', category: 'Staff' },
    { id: 'admission_dropout', text: 'Which new admissions might drop out?', category: 'Admissions' },
    { id: 'transport_occupancy', text: 'Which bus routes are underused?', category: 'Operations' },
    { id: 'hostel_capacity', text: 'How full is the hostel?', category: 'Operations' },
    { id: 'library_overdue', text: 'Who has overdue library books?', category: 'Operations' },
    { id: 'inventory_shortage', text: 'What supplies are running low?', category: 'Operations' }
];

const CATEGORIES = ['All', 'Operations', 'Overview', 'Academics', 'Attendance', 'Finance', 'Staff', 'Admissions'] as const;

const CHART_COLORS = ['#8b5cf6', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#f59e0b'];

export function PrincipalAssistant() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [response, setResponse] = useState<AssistantResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showQuerySwitcher, setShowQuerySwitcher] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAsk = async (questionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPrincipalAssistantResponse(questionId);
            setResponse(data);
        } catch (e) {
            console.error(e);
            setError('Failed to fetch analysis from ERP system. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setResponse(null);
        setError(null);
        setShowQuerySwitcher(false);
    };

    const filteredQuestions =
        selectedCategory === 'All' ? ADMINISTRATIVE_QUESTIONS : ADMINISTRATIVE_QUESTIONS.filter((q) => q.category === selectedCategory);

    const displayedQuestions = isExpanded ? filteredQuestions : filteredQuestions.slice(0, 8);

    return (
        <Card className='card-premium mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white text-slate-900 shadow-sm'>
            <CardHeader className='relative border-slate-100 border-b pb-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs'>
                            <Sparkles size={20} className='animate-pulse text-indigo-600' />
                        </div>
                        <div>
                            <CardTitle className='flex items-center gap-2 font-black text-lg text-slate-800 tracking-tight'>
                                Principal Assistant{' '}
                                <Badge className='border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 font-bold text-[9px] text-indigo-700'>
                                    AI Insights
                                </Badge>
                            </CardTitle>
                            <CardDescription className='mt-0.5 font-bold text-slate-400 text-xs'>
                                Select an administrative query below to get instant ERP insights, charts, and recommendations.
                            </CardDescription>
                        </div>
                    </div>
                    {response && (
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleClear}
                            className='h-8 rounded-xl border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50 hover:text-indigo-600'>
                            <RotateCcw size={14} className='mr-1.5' />
                            View All Queries
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                {/* Category Filter Pills */}
                <div className='flex flex-wrap items-center gap-1.5'>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type='button'
                            onClick={() => {
                                setSelectedCategory(cat);
                                setIsExpanded(false);
                            }}
                            className={cn(
                                'rounded-xl px-3 py-1.5 font-bold text-xs transition-all',
                                selectedCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                            )}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className='flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700 text-xs'>
                        <HelpCircle size={18} className='shrink-0 text-red-500' />
                        <div>{error}</div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                        <RefreshCw className='h-8 w-8 animate-spin text-indigo-600' />
                        <div className='animate-pulse font-bold text-slate-400 text-xs uppercase tracking-widest'>
                            VAPS AI is analyzing ERP Databases...
                        </div>
                    </div>
                )}

                {/* Query Selection Grid (When no response is active) */}
                {!response && !loading && (
                    <div className='space-y-3.5'>
                        <div className='flex items-center justify-between font-bold text-slate-400 text-xs uppercase tracking-wider'>
                            <div className='flex items-center gap-2'>
                                <span>Administrative Queries</span>
                                <span className='rounded-full bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-slate-600'>
                                    {filteredQuestions.length > 8 && !isExpanded
                                        ? `Showing 8 of ${filteredQuestions.length}`
                                        : `${filteredQuestions.length}`}
                                </span>
                            </div>
                            {filteredQuestions.length > 8 && (
                                <button
                                    type='button'
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className='inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1 font-bold text-indigo-600 text-xs transition-all hover:bg-indigo-50 hover:text-indigo-700'>
                                    <span>{isExpanded ? 'Collapse' : `Show All (${filteredQuestions.length})`}</span>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            )}
                        </div>
                        <div className='grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3'>
                            {displayedQuestions.map((q) => (
                                <button
                                    key={q.id}
                                    type='button'
                                    onClick={() => handleAsk(q.id)}
                                    className='group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left font-semibold text-slate-700 text-xs transition-all hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-xs'>
                                    <div className='flex items-center gap-2.5'>
                                        <span className='rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-[9px] text-slate-500 uppercase tracking-wide group-hover:bg-indigo-100 group-hover:text-indigo-700'>
                                            {q.category}
                                        </span>
                                        <span className='text-slate-700 group-hover:text-indigo-950'>{q.text}</span>
                                    </div>
                                    <ArrowUpRight
                                        size={14}
                                        className='group-hover:-translate-y-0.5 ml-2 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600'
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Dropdown / Collapse Button at bottom */}
                        {filteredQuestions.length > 8 && (
                            <div className='flex flex-col items-center justify-center pt-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className='group flex h-9.5 items-center gap-2 rounded-2xl border-slate-200 bg-white px-5 font-bold text-indigo-600 text-xs shadow-2xs transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95'>
                                    <span>
                                        {isExpanded
                                            ? 'Show Less (Collapse to 8 Queries)'
                                            : `Show All Queries (${filteredQuestions.length})`}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp
                                            size={15}
                                            className='group-hover:-translate-y-0.5 text-indigo-500 transition-transform duration-200'
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={15}
                                            className='text-indigo-500 transition-transform duration-200 group-hover:translate-y-0.5'
                                        />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* AI Insights Response Section */}
                {response && !loading && (
                    <div className='fade-in zoom-in-95 animate-in space-y-6 rounded-3xl border border-slate-100 bg-slate-50/60 p-6 duration-500'>
                        {/* Title Header */}
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                            <div>
                                <span className='rounded-full border border-emerald-200/50 bg-emerald-50 px-2 py-0.5 font-black text-[9px] text-emerald-700 uppercase tracking-widest'>
                                    Resolved AI Query
                                </span>
                                <h3 className='mt-1.5 font-black text-lg text-slate-800'>{response.matchedQuestion}</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setShowQuerySwitcher(!showQuerySwitcher)}
                                    className='h-8 rounded-xl border-slate-200 font-bold text-indigo-600 text-xs hover:bg-indigo-50 hover:text-indigo-700'>
                                    {showQuerySwitcher ? 'Hide Switcher' : 'Switch Query'}
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleClear}
                                    className='h-8 w-8 rounded-xl text-slate-400 hover:bg-slate-200/50 hover:text-slate-700'>
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Switch Queries dropdown if toggled */}
                        {showQuerySwitcher && (
                            <div className='fade-in animate-in rounded-2xl border border-indigo-100 bg-white p-4 duration-300'>
                                <div className='mb-2.5 font-bold text-slate-400 text-xs uppercase tracking-wider'>Select Another Query</div>
                                <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                                    {ADMINISTRATIVE_QUESTIONS.map((q) => (
                                        <button
                                            key={q.id}
                                            type='button'
                                            onClick={() => {
                                                handleAsk(q.id);
                                                setShowQuerySwitcher(false);
                                            }}
                                            className='group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left font-semibold text-slate-600 text-xs transition-all hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-700'>
                                            <div className='flex items-center gap-2'>
                                                <span className='rounded bg-slate-200/60 px-1.5 py-0.5 font-bold text-[9px] text-slate-600 uppercase'>
                                                    {q.category}
                                                </span>
                                                <span>{q.text}</span>
                                            </div>
                                            <ArrowUpRight
                                                size={13}
                                                className='ml-1.5 shrink-0 text-slate-400 group-hover:text-indigo-600'
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            {response.numbers.map((num, i) => (
                                <div
                                    key={i}
                                    className='flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
                                    <span className='font-bold text-[10px] text-slate-400 uppercase tracking-wider'>{num.label}</span>
                                    <div className='mt-2 flex items-baseline gap-2'>
                                        <span className='font-black text-2xl text-slate-900'>{num.value}</span>
                                        {num.change && (
                                            <span
                                                className={cn(
                                                    'rounded-md px-1.5 py-0.5 font-black text-[10px]',
                                                    num.isPositive === undefined
                                                        ? 'bg-slate-100 text-slate-650'
                                                        : num.isPositive
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-red-50 text-red-600'
                                                )}>
                                                {num.change}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart and Graph Rendering */}
                        <div className='grid grid-cols-1 items-center gap-6 lg:grid-cols-12'>
                            {/* Recharts Component */}
                            <div className='h-64 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-7'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    {response.chartType === 'bar' ? (
                                        <BarChart data={response.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                            <XAxis dataKey='name' stroke='#64748b' fontSize={10} tickLine={false} />
                                            <YAxis stroke='#64748b' fontSize={10} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e2e8f0',
                                                    borderRadius: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                            {response.chartData.length > 0 &&
                                                Object.keys(response.chartData[0])
                                                    .filter((k) => k !== 'name')
                                                    .map((key, i) => (
                                                        <Bar
                                                            key={key}
                                                            dataKey={key}
                                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    ))}
                                        </BarChart>
                                    ) : response.chartType === 'line' ? (
                                        <LineChart data={response.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                            <XAxis dataKey='name' stroke='#64748b' fontSize={10} tickLine={false} />
                                            <YAxis stroke='#64748b' fontSize={10} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e2e8f0',
                                                    borderRadius: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                            {response.chartData.length > 0 &&
                                                Object.keys(response.chartData[0])
                                                    .filter((k) => k !== 'name')
                                                    .map((key, i) => (
                                                        <Line
                                                            key={key}
                                                            type='monotone'
                                                            dataKey={key}
                                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                                            strokeWidth={3}
                                                            dot={{ r: 4 }}
                                                        />
                                                    ))}
                                        </LineChart>
                                    ) : response.chartType === 'area' ? (
                                        <AreaChart data={response.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                            <XAxis dataKey='name' stroke='#64748b' fontSize={10} tickLine={false} />
                                            <YAxis stroke='#64748b' fontSize={10} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e2e8f0',
                                                    borderRadius: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                            {response.chartData.length > 0 &&
                                                Object.keys(response.chartData[0])
                                                    .filter((k) => k !== 'name')
                                                    .map((key, i) => (
                                                        <Area
                                                            key={key}
                                                            type='monotone'
                                                            dataKey={key}
                                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                                            fillOpacity={0.1}
                                                            strokeWidth={2.5}
                                                        />
                                                    ))}
                                        </AreaChart>
                                    ) : response.chartType === 'radar' ? (
                                        <RadarChart
                                            cx='50%'
                                            cy='50%'
                                            data={response.chartData}
                                            outerRadius='75%'
                                            margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                            <PolarGrid stroke='#e2e8f0' />
                                            <PolarAngleAxis dataKey='subject' stroke='#64748b' fontSize={9} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke='#94a3b8' fontSize={8} />
                                            {response.chartData.length > 0 &&
                                                Object.keys(response.chartData[0])
                                                    .filter((k) => k !== 'subject')
                                                    .map((key, i) => (
                                                        <Radar
                                                            key={key}
                                                            name={key === 'A' ? 'Evaluated' : key === 'rating' ? 'Current Rating' : key}
                                                            dataKey={key}
                                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                                            fillOpacity={0.2}
                                                        />
                                                    ))}
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e2e8f0',
                                                    borderRadius: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                        </RadarChart>
                                    ) : (
                                        <PieChart>
                                            <Pie
                                                data={response.chartData}
                                                cx='50%'
                                                cy='50%'
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey='value'>
                                                {response.chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e2e8f0',
                                                    borderRadius: '12px',
                                                    color: '#0f172a',
                                                    boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign='bottom'
                                                height={36}
                                                iconSize={8}
                                                iconType='circle'
                                                wrapperStyle={{ fontSize: '10px' }}
                                            />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </div>

                            {/* Recommendations Block */}
                            <div className='space-y-4 rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo-50/20 to-slate-50 p-5 shadow-sm lg:col-span-5'>
                                <div className='flex items-center gap-2 text-indigo-600'>
                                    <Lightbulb size={18} className='animate-bounce text-amber-500' />
                                    <h4 className='font-black text-xs uppercase tracking-wider'>AI Recommendations</h4>
                                </div>
                                <div className='space-y-3'>
                                    {response.recommendations.map((rec, i) => (
                                        <div key={i} className='flex items-start gap-2.5'>
                                            <CheckCircle2 size={14} className='mt-0.5 shrink-0 text-emerald-500' />
                                            <p className='font-semibold text-slate-600 text-xs leading-relaxed'>{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}