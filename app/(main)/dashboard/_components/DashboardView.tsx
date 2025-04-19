"use client"
import { InsightsInterface, LevelInterface, RoleInterface } from '@/interface/insightsInterface'
import { Brain, Briefcase, BriefcaseIcon, LineChart, LucideProps, TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'
import { Badge } from "@/components/ui/badge"
import { format, formatDistance } from 'date-fns'
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
export const DashboardView = ({insights}:{insights:InsightsInterface}) => {
  const salaryData = insights.salaryRanges.map((item:RoleInterface, idx:number) => {
    return({
      name:item.role,
      min:item.min /1000,
      max:item.max /1000,
      median:item.median /1000,
    }
    )
  })

  const getDemandLevelColor = (level:string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook:string) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };


  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

  const lastUpdated = format(new Date(insights.updatedAt), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistance(new Date(insights.nextUpdate), new Date(),{addSuffix:true});

  return (
    <div className='space-y-5'>
      <div className='flex justify-between items-center'>
        <Badge variant="outline" >Last Updated: {lastUpdated}</Badge>
        </div>
     <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
     <Card className='bg-background'>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>Market Outlook</CardTitle>
    <OutlookIcon className={`${outlookColor} w-6 h-6`} />
  </CardHeader>
  <CardContent>
    <div className='text-2xl font-black'>{insights.marketOutlook}</div>
    <p className='text-sm text-muted-foreground'>Next Update: {nextUpdateDistance}</p>
  </CardContent>

</Card>
<Card className='bg-background'>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>Industry Growth</CardTitle>
    <TrendingUp className='w-6 h-6 text-muted-foreground'/>
  </CardHeader>
  <CardContent>
    <div className='text-2xl font-black'>{insights.growthRate.toFixed(2)}%</div>

  <Progress value={insights.growthRate} className='w-full mt-2' />
  </CardContent>
</Card>

<Card className='bg-background'>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>Demand Level</CardTitle>
    <BriefcaseIcon className='w-6 h-6 text-muted-foreground' />
  </CardHeader>
  <CardContent>
    <div className='text-2xl font-black'>{insights.demandLevel}</div>
    <div
    className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(insights.demandLevel)}`}
    >
    </div>
  
  </CardContent>
</Card>


<Card className='bg-background'>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>Top Skills</CardTitle>
    <Brain className='w-6 h-6 text-muted-foreground' />
  </CardHeader>
  <CardContent>
    <div className='flex flex-wrap gap-1'>
{
  insights.topSkills.map((skill:string, idx:number) => {
    return(
      <Badge key={idx} variant="secondary" className='mr-2 mb-2'>{skill}</Badge>
    )
  })
}

    </div>
  
  </CardContent>
</Card>



     </div>
     <Card className='bg-background'>
  <CardHeader>
    <CardTitle className='text-sm font-medium'>Demand Level</CardTitle>
    <CardDescription>
      Displaying minimum, maximum salaries (in thousands)
    </CardDescription>
  </CardHeader>
  <CardContent>
  <div className='h-[400px]'>
  <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={salaryData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={({payload,label})=>{
            if(payload && payload.length && label){
              return(
                <div className='bg-background border rounded-lg p-2 shadow-md'>
                  <p className='text-sm font-medium'>{label}</p>
                  {
                    payload.map((item:any)=>{
                      return(
                        <p key={item.name} className='text-sm'>
                          {item.name} : ₹{item.value}
                        </p>
                      )
                    })
                  }
                </div>
              )
            }

          }} />
          <Legend />
          <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
        </BarChart>
      </ResponsiveContainer>
  </div>
  </CardContent>
</Card>
<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
<Card className='bg-background'>
  <CardHeader>
          <CardTitle>Key Industry Trends</CardTitle>
          <CardDescription>Current trends shaping the industry</CardDescription>
  </CardHeader>
  <CardContent>
    <ul className='space-y-4'>
      {
        insights.keyTrends.map((trend:string, idx:number)=>{
          return(
            <li key={idx} className='text-sm'>
              <span className='font-medium'>{idx+1}. </span>
              {trend}
            </li>
          )
        })
      }
    </ul>
  </CardContent>
</Card>
<Card className='bg-background'>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
</div>
    </div>
  )
}
