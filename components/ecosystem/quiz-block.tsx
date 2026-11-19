'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

const questions = [
  { q: 'Sample question 1: what should a motivation letter focus on?', options: ['A list of every achievement', 'Why this program and your relevant evidence', 'A copy of your CV'], answer: 1 },
  { q: 'Sample question 2: when should you ask a referee?', options: ['The day before the deadline', 'As early as possible', 'After you apply'], answer: 1 },
  { q: 'Sample question 3: what is a good first step?', options: ['Read the requirements carefully', 'Submit quickly', 'Skip the guidelines'], answer: 0 },
]

/** Runs in the browser only: the score is shown, never stored. */
export function QuizBlock() {
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)
  const score = questions.filter((question, index) => picked[index] === question.answer).length

  return (
    <div className="flex max-w-2xl flex-col gap-5 rounded-xl border border-border p-4 sm:p-6">
      <h2 className="text-lg font-semibold">Sample quiz</h2>
      {questions.map((question, index) => (
        <fieldset key={question.q} className="flex flex-col gap-2">
          <legend className="text-sm font-medium">{question.q}</legend>
          {question.options.map((option, optionIndex) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input type="radio" name={`q${index}`} checked={picked[index] === optionIndex} onChange={() => { setPicked((c) => ({ ...c, [index]: optionIndex })); setChecked(false) }} />
              {option}
              {checked && optionIndex === question.answer ? <span className="text-xs text-muted-foreground">(correct)</span> : null}
            </label>
          ))}
        </fieldset>
      ))}
      <div className="flex flex-col items-start gap-2">
        <Button type="button" onClick={() => setChecked(true)} disabled={Object.keys(picked).length < questions.length}>Check answers</Button>
        {checked ? <p role="status" className="text-sm">Score: {score} of {questions.length}. This sample score is not saved.</p> : null}
      </div>
    </div>
  )
}
