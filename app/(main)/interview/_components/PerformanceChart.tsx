"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizResultInterface } from '@/interface/QuizInterface'
import { format } from 'date-fns'
import { Brain, Target, Trophy } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
interface PerformanceCardsProps {
  assessments: QuizResultInterface[]
}

const PerformanceChart:React.FC<PerformanceCardsProps> =({assessments}) => {
const [chartData,setChartData]= useState<any[]>([])

useEffect(()=>{
  if(assessments.length > 0){
    const data = assessments.map((assessment)=>({
      date:format(new Date(assessment.createdAt as string),'dd/MM/yyyy'),
      score:Number(assessment.quizScore)
      
    }))
    setChartData(data)
  }
  

},[assessments])

console.log(chartData)
  return (
    <Card className='bg-background'>
    <CardHeader>
      <CardTitle className="gradient-title text-3xl md:text-4xl">
        Performance Trend
      </CardTitle>
      <CardDescription>Your quiz scores over time</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3 " />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-md">
                      <p className="text-sm font-medium">
                        Score: {Number(payload[0].value).toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payload[0].payload.date}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
  )
}

export default PerformanceChart