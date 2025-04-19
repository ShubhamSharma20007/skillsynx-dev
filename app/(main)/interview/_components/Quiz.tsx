"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useFetch } from '@/hooks/user-fetch'
import saveQuizResult, { generateQuiz } from '@/services/interview'
import React, { useEffect, useRef, useState } from 'react'
import { BarLoader } from 'react-spinners'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from 'sonner'
import QuizResult from './QuizResult'
import { Loader2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface Props {
  customInterviewData: any;
  setCustomInterviewData: React.SetStateAction<any>;
}

function QuizComponent() {
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answers, setAnswers] = React.useState<string[]>([])
  const [correctAnser, setCorrectAnswer] = React.useState<string[]>([])
  const [showExplaination, setShowExplanation] = React.useState(false)

  const {
    loading: isGenerateQuiz,
    data: quizData,
    fn: generateQuizFn
  } = useFetch(generateQuiz)

  const {
    loading: savingQuizResult,
    setData: setResultData,
    data: resultData,
    fn: saveQuizFun
  } = useFetch(saveQuizResult)

  useEffect(() => {
    if (quizData?.questions && quizData?.questions.length) {
      setAnswers(Array(quizData?.questions.length).fill(null))
    }
  }, [quizData]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData?.questions[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData?.questions.length) * 100
  };

  const finishQuiz = async () => {
    let score = calculateScore()
    try {
      await saveQuizFun(quizData?.questions, answers, score,false)
      toast.success('Quiz Completed!')
    } catch (error: any) {
      toast.error(error.message || error)
      console.log('Error during the save quiz record :', error)
    }
  }

  const handleNext = () => {
    if (currentQuestion < quizData?.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    } else {
      finishQuiz()
    }
  }

  const startNewQuiz = () => {
    setCurrentQuestion(0)
    setAnswers(Array(quizData?.questions.length).fill(null))
    setShowExplanation(false)
    generateQuizFn()
    setResultData(null)
  }
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (isGenerateQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  if (!quizData?.questions || !Array.isArray(quizData?.questions) || quizData?.questions.length === 0) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData?.questions[currentQuestion] || {
    question: "Question not available",
    options: [],
    explanation: ""
  };


  return (
    <div>
      <Card className="mx-2 w-full">
        <CardHeader>
          <CardTitle>
            Question {currentQuestion + 1} of {quizData?.questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className="text-lg font-medium">
            {question.question}
          </p>

          <RadioGroup
            className='space-y-2'
            onValueChange={handleAnswer}
            value={answers[currentQuestion]}
          >
            {
              question.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`id-${option}`} />
                  <Label htmlFor={`id-${option}`}>{option}</Label>
                </div>
              ))
            }
          </RadioGroup>

          {
            showExplaination && (
              <div className='mt-4 bg-muted rounded-lg p-4'>
                <p className='font-medium'>Explanation:</p>
                <p className='text-muted-foreground'>{question.explanation}</p>
              </div>
            )
          }
        </CardContent>
        <CardFooter className='flex items-center justify-between'>
          {!showExplaination && (
            <Button
              className='cursor-pointer'
              variant={'secondary'}
              disabled={!answers[currentQuestion]}
              onClick={() => setShowExplanation(true)}
            >
              Show Explanation
            </Button>
          )}

          <Button
            variant={'default'}
            className='cursor-pointer relative z-10'
            disabled={!answers[currentQuestion] || savingQuizResult}
            onClick={handleNext}
          >
            {savingQuizResult ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" color="gray" />
                Finishing...
              </>
            ) : (
              currentQuestion < quizData?.questions.length - 1 ? 'Next Question' : 'Finish'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function CustomQuizComponent({ customQuizJSON, setCustomQuizJSON }: { customQuizJSON?: any, setCustomQuizJSON: any }) {
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answers, setAnswers] = React.useState<string[]>([])
  const [showExplaination, setShowExplanation] = React.useState(false)
  let timeRef = useRef<NodeJS.Timeout | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (customQuizJSON?.timer && customQuizJSON.duration) {
      const minutes = parseInt(customQuizJSON.duration.replace(/\D/g, ''));
      return minutes * 60;
    }
    return null;
  });

  const {
    loading: savingQuizResult,
    setData: setResultData,
    data: resultData,
    fn: saveQuizFun
  } = useFetch(saveQuizResult)

  useEffect(() => {
    if (customQuizJSON?.questions && customQuizJSON?.questions.length) {
      setAnswers(Array(customQuizJSON?.questions.length).fill(null))
    }
  }, [customQuizJSON]);


  // useEffect(() => {
  //   if (resultData) {
  //     setCustomQuizJSON(null);
  //   }
  // }, [resultData, setCustomQuizJSON]);


  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === customQuizJSON?.questions[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / customQuizJSON?.questions.length) * 100
  };

  const finishQuiz = async () => {
    let score = calculateScore()
    try {
      await saveQuizFun(customQuizJSON?.questions, answers, score,true);
    } catch (error: any) {
      toast.error(error.message || error)
      console.log('Error during the save quiz record :', error)
    }
  }

  const handleNext = () => {
    if (currentQuestion < customQuizJSON?.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    } else {
      finishQuiz()
    }
  }

  const startNewQuiz = () => {
    setCurrentQuestion(0)
    setAnswers(Array(customQuizJSON?.questions.length).fill(null))
    setShowExplanation(false)
    setResultData(null)
    setCustomQuizJSON(null);
    if (timeRef.current) {
      clearInterval(timeRef.current);
    }

    if (customQuizJSON?.timer && customQuizJSON.duration) {
      const minutes = parseInt(customQuizJSON.duration.replace(/\D/g, ''));
      setTimeRemaining(minutes * 60);
    }
  }

  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} Minute`;
    
  }

  useEffect(() => {
    if (customQuizJSON?.timer && timeRemaining !== null) {
      if (timeRef.current) {
        clearInterval(timeRef.current)
      }
      timeRef.current = setInterval(() => {
        setTimeRemaining((prevTime: any) => {
          if (prevTime <= 1) {
            clearInterval(timeRef.current!)
            finishQuiz()
            return 0
          }
          return prevTime -1 ;
        })
      }, 1000)
    }
    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [customQuizJSON?.timer, currentQuestion])


  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  const question = customQuizJSON?.questions[currentQuestion] || {
    question: "Question not available",
    options: [],
    explanation: ""
  };




  return (
    <div>
      <Card className="mx-2 w-full">
        <CardHeader>
          <CardTitle className='flex justify-between items-center'>
            <div>
              Question {currentQuestion + 1} of {customQuizJSON?.questions.length}
            </div>
            {customQuizJSON?.timer && timeRemaining !== null ? (
              <Badge
                className='text-sm p-1'
                variant={timeRemaining < 60 ? "destructive" : "secondary"}
              >
                {formatTime(timeRemaining)}
              </Badge>
            ) : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className="text-lg font-medium">
            {question.question}
          </p>

          <RadioGroup
            className='space-y-2'
            onValueChange={handleAnswer}
            value={answers[currentQuestion]}
          >
            {
              question.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`id-${option}`} />
                  <Label htmlFor={`id-${option}`}>{option}</Label>
                </div>
              ))
            }
          </RadioGroup>

          {
            showExplaination && (
              <div className='mt-4 bg-muted rounded-lg p-4'>
                <p className='font-medium'>Explanation:</p>
                <p className='text-muted-foreground'>{question.explanation}</p>
              </div>
            )
          }
        </CardContent>
        <CardFooter className='flex items-center justify-between'>
          {!showExplaination && (
            <Button
              className='cursor-pointer'
              variant={'secondary'}
              disabled={!answers[currentQuestion]}
              onClick={() => setShowExplanation(true)}
            >
              Show Explanation
            </Button>
          )}

          <Button
            variant={'default'}
            className='cursor-pointer relative z-10'
            disabled={!answers[currentQuestion] || savingQuizResult}
            onClick={handleNext}
          >
            {savingQuizResult ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" color="gray" />
                Finishing...
              </>
            ) : (
              currentQuestion < customQuizJSON?.questions.length - 1 ? 'Next Question' : 'Finish'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


const Quiz: React.FC<Props> = ({ customInterviewData, setCustomInterviewData }) => {
 
  if (customInterviewData) {
    return (
      <CustomQuizComponent
        customQuizJSON={customInterviewData}
        setCustomQuizJSON={setCustomInterviewData}
      />
    )
  }
  return (
    <>
      <QuizComponent />
    </>
  );
};

export default Quiz;