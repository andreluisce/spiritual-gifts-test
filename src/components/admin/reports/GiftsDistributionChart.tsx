'use client'

import { useMemo } from 'react'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieChartIcon } from 'lucide-react'

interface QuestionAnswer {
    gift_category: string
    answer_value: number
}

interface GiftsDistributionChartProps {
    questions: QuestionAnswer[]
    title?: string
}

const GIFT_COLORS: Record<string, string> = {
    'Profecia': '#8b5cf6', // violet-500
    'Prophecy': '#8b5cf6',
    'Serviço': '#0ea5e9', // sky-500
    'Service': '#0ea5e9',
    'Ensino': '#6366f1', // indigo-500
    'Teaching': '#6366f1',
    'Exortação': '#f59e0b', // amber-500
    'Exhortation': '#f59e0b',
    'Contribuição': '#10b981', // emerald-500
    'Giving': '#10b981',
    'Liderança': '#f43f5e', // rose-500
    'Leadership': '#f43f5e',
    'Misericórdia': '#14b8a6', // teal-500
    'Mercy': '#14b8a6'
}

const DEFAULT_COLOR = '#6b7280' // gray-500

export function GiftsDistributionChart({ questions, title }: GiftsDistributionChartProps) {
    const data = useMemo(() => {
        const scores: Record<string, number> = {}

        questions.forEach(q => {
            const category = q.gift_category
            scores[category] = (scores[category] || 0) + q.answer_value
        })

        return Object.entries(scores)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [questions])

    const getColor = (name: string) => {
        const key = Object.keys(GIFT_COLORS).find(k => name.includes(k))
        return key ? GIFT_COLORS[key] : DEFAULT_COLOR
    }

    return (
        <Card className="print:shadow-none print:border-none">
            <CardHeader className="print:px-0 print:py-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChartIcon className="h-5 w-5 text-gray-500" />
                    {title || 'Distribuição dos Dons'}
                </CardTitle>
            </CardHeader>
            <CardContent className="print:px-0">
                <div className="h-[300px] w-full print:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: { name: string, percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                isAnimationActive={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
