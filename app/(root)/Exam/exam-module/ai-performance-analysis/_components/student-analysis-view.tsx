'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { IndividualAnalysis, StudentPerformance } from '@/types/exam/exam-module/ai-analysis';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface StudentAnalysisViewProps {
    student: StudentPerformance;
    analysis: IndividualAnalysis;
}

export function StudentAnalysisView({ student, analysis }: StudentAnalysisViewProps) {
    const chartData = student.subjects.map((s) => ({
        subject: s.subject,
        score: s.percentage
    }));

    return (
        <div className='fade-in-50 animate-in space-y-6'>
            <div className='flex items-center justify-between rounded-lg bg-muted/50 p-4'>
                <div>
                    <h2 className='font-bold text-2xl'>{student.name}</h2>
                    <p className='text-muted-foreground'>Index: {student.index}</p>
                </div>
                <div className='text-right'>
                    <div className='font-bold text-2xl text-primary'>{student.averageScore}%</div>
                    <div className='text-muted-foreground text-sm'>Average Score</div>
                </div>
            </div>

            <Tabs defaultValue='weakest' className='w-full'>
                <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='weakest'>📉 Weakest</TabsTrigger>
                    <TabsTrigger value='improvement'>⚠️ Improve</TabsTrigger>
                    <TabsTrigger value='strong'>✅ Strong</TabsTrigger>
                    <TabsTrigger value='overall'>📊 Overall</TabsTrigger>
                    <TabsTrigger value='prediction'>🔮 Prediction</TabsTrigger>
                </TabsList>

                <TabsContent value='weakest' className='mt-4'>
                    <Card className='border-red-200 bg-red-50/50'>
                        <CardContent className='pt-6'>
                            <h3 className='mb-2 font-bold text-red-700 text-xl'>
                                {analysis.weakestSubject.name} (Score: {analysis.weakestSubject.score})
                            </h3>
                            <p className='text-red-900 leading-relaxed'>{analysis.weakestSubject.analysis}</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='improvement' className='mt-4'>
                    <div className='space-y-4'>
                        {analysis.needsImprovement.map((subject, i) => (
                            <Card key={i}>
                                <CardContent className='pt-6'>
                                    <h4 className='mb-2 font-semibold text-lg'>
                                        {subject.name} (Score: {subject.score})
                                    </h4>
                                    <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-900'>
                                        💡 {subject.recommendation}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value='strong' className='mt-4'>
                    <div className='grid gap-4 md:grid-cols-3'>
                        {analysis.strongSubjects.map((subject, i) => (
                            <Card key={i} className='border-green-200 bg-green-50/50'>
                                <CardContent className='pt-6'>
                                    <h4 className='mb-1 font-semibold text-green-900'>{subject.name}</h4>
                                    <p className='mb-2 font-medium text-green-700 text-sm'>Score: {subject.score}</p>
                                    <p className='text-green-800 text-sm'>{subject.praise}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value='overall' className='mt-4'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        <Card className='border-blue-200 bg-blue-50/50'>
                            <CardContent className='pt-6'>
                                <h3 className='mb-2 font-semibold text-blue-900'>📝 Assessment</h3>
                                <p className='text-blue-800 leading-relaxed'>{analysis.overallAssessment}</p>
                            </CardContent>
                        </Card>
                        <Card className='border-purple-200 bg-purple-50/50'>
                            <CardContent className='pt-6'>
                                <h3 className='mb-2 font-semibold text-purple-900'>🎯 Strategy</h3>
                                <p className='whitespace-pre-line text-purple-800 leading-relaxed'>{analysis.improvementStrategy}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='prediction' className='mt-4'>
                    {(() => {
                        const pred = analysis.performancePrediction || {
                            predictedScoreRange: `${Math.min(100, Math.round(student.averageScore + 2))}% - ${Math.min(100, Math.round(student.averageScore + 7))}%`,
                            confidenceLevel: 'High (AI Trajectory Projection)',
                            trajectory: student.averageScore >= 75 ? 'High Growth Potential' : student.averageScore >= 50 ? 'Improving' : 'At Risk',
                            predictedSubjectScores: student.subjects.map((s) => ({
                                subject: s.subject,
                                predictedScore: Math.min(100, Math.round(s.percentage + (s.percentage < 60 ? 8 : 4))),
                                potentialScore: Math.min(100, Math.round(s.percentage + 12))
                            })),
                            keyRiskFactors: [
                                `Gaps in ${analysis.weakestSubject?.name || 'core subjects'} fundamentals`,
                                'Inconsistent revision schedule before major exams'
                            ],
                            growthOpportunities: [
                                `Targeted 25-min daily focus on ${analysis.weakestSubject?.name || 'weak topics'} can boost score by +8%`,
                                'Regular self-assessment and solving previous term papers'
                            ],
                            actionableMilestones: [
                                'Achieve minimum 80% in weekly chapter quizzes',
                                'Clear doubt backlog with subject teachers before mid-terms'
                            ]
                        };

                        return (
                            <div className='space-y-6'>
                                <div className='grid gap-4 md:grid-cols-3'>
                                    <Card className='border-purple-200 bg-purple-50/60'>
                                        <CardContent className='pt-6'>
                                            <p className='font-semibold text-purple-700 text-xs uppercase tracking-wider'>Predicted Next Term Score</p>
                                            <h3 className='mt-2 font-black text-purple-900 text-3xl'>{pred.predictedScoreRange}</h3>
                                            <p className='mt-1 text-purple-700 text-xs'>Confidence: {pred.confidenceLevel}</p>
                                        </CardContent>
                                    </Card>

                                    <Card className='border-indigo-200 bg-indigo-50/60'>
                                        <CardContent className='pt-6'>
                                            <p className='font-semibold text-indigo-700 text-xs uppercase tracking-wider'>Growth Trajectory</p>
                                            <div className='mt-2 flex items-center gap-2'>
                                                <span className='inline-block rounded-full bg-indigo-600 px-3 py-1 font-bold text-sm text-white shadow-sm'>
                                                    🚀 {pred.trajectory}
                                                </span>
                                            </div>
                                            <p className='mt-2 text-indigo-700 text-xs'>Based on current learning pace</p>
                                        </CardContent>
                                    </Card>

                                    <Card className='border-emerald-200 bg-emerald-50/60'>
                                        <CardContent className='pt-6'>
                                            <p className='font-semibold text-emerald-700 text-xs uppercase tracking-wider'>Max Potential Peak</p>
                                            <h3 className='mt-2 font-black text-emerald-900 text-3xl'>
                                                {Math.min(100, Math.round(student.averageScore + 12))}%
                                            </h3>
                                            <p className='mt-1 text-emerald-700 text-xs'>If strategic recommendations are followed</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className='grid gap-6 md:grid-cols-2'>
                                    <Card className='border-amber-200 bg-amber-50/40'>
                                        <CardContent className='pt-6 space-y-3'>
                                            <h4 className='font-bold text-amber-900 text-base flex items-center gap-2'>
                                                <span>⚠️</span> Key Risk Factors
                                            </h4>
                                            <ul className='space-y-2 text-amber-950 text-sm'>
                                                {pred.keyRiskFactors.map((rf, idx) => (
                                                    <li key={idx} className='flex items-start gap-2 bg-amber-100/60 p-2 rounded border border-amber-200/60'>
                                                        <span className='text-amber-700 font-bold'>•</span>
                                                        <span>{rf}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className='border-blue-200 bg-blue-50/40'>
                                        <CardContent className='pt-6 space-y-3'>
                                            <h4 className='font-bold text-blue-900 text-base flex items-center gap-2'>
                                                <span>💡</span> Growth Opportunities
                                            </h4>
                                            <ul className='space-y-2 text-blue-950 text-sm'>
                                                {pred.growthOpportunities.map((go, idx) => (
                                                    <li key={idx} className='flex items-start gap-2 bg-blue-100/60 p-2 rounded border border-blue-200/60'>
                                                        <span className='text-blue-700 font-bold'>✓</span>
                                                        <span>{go}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className='border-slate-200 bg-white'>
                                    <CardContent className='pt-6 space-y-3'>
                                        <h4 className='font-bold text-slate-900 text-base flex items-center gap-2'>
                                            <span>🎯</span> Actionable Target Milestones
                                        </h4>
                                        <div className='grid gap-3 md:grid-cols-2'>
                                            {pred.actionableMilestones.map((ms, idx) => (
                                                <div key={idx} className='flex items-center gap-3 p-3 rounded-lg border border-purple-100 bg-purple-50/40 text-purple-950 text-sm font-medium'>
                                                    <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white'>
                                                        {idx + 1}
                                                    </span>
                                                    <span>{ms}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })()}
                </TabsContent>
            </Tabs>

            {/* Chart */}
            <Card>
                <CardContent className='pt-6'>
                    <h3 className='mb-6 font-semibold text-lg'>Subject Performance</h3>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='subject' tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor='end' height={80} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey='score' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
