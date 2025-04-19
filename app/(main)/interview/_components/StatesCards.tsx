import { QuizResultInterface } from '@/interface/QuizInterface'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Target, Trophy } from 'lucide-react'

interface StatesCardsProps {
  assessments: QuizResultInterface[]
}

const StatesCards:React.FC<StatesCardsProps> = ({assessments}) => {
  function getAverageScore(){
    if(!assessments.length) return 0;
    const totalScore =assessments.reduce((acc,ass)=>acc+Number(ass.quizScore),0)
    return (totalScore / assessments.length).toFixed(1)
  
  }
  
  function getTotalQuestions(){
    if(!assessments.length) return 0;
    const attemptedQuestions =assessments.reduce((acc,ass)=>acc+Number(ass.questions.length),0)
    return attemptedQuestions
  
  }
  
  function getLatestAssessment(){
    if(!assessments.length) return 0;
    return assessments[0]?.quizScore.toFixed(1) || 0
  }
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className='bg-background'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className="text-sm text-muted-foreground">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      <Card className='bg-background'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <Brain className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          <p className="text-sm text-muted-foreground">Total questions</p>
        </CardContent>
      </Card>

      <Card className='bg-background'>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Target className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getLatestAssessment()}%
          </div>
          <p className="text-sm text-muted-foreground">Most recent quiz score</p>
        </CardContent>
      </Card>
    </div>
  )
}


export default StatesCards