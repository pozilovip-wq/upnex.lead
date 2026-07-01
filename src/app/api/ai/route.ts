import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { student, mode, apiKey } = await req.json()

  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'No OpenAI API key. Add it in Settings.' }, { status: 400 })
  }

  const studentSummary = `
Name: ${student.name}
Country: ${student.country}, City: ${student.city}
Age: ${student.age}
School: ${student.school}
GPA: ${student.gpa}/4.0
IELTS: ${student.ielts}
${student.duolingo ? `Duolingo: ${student.duolingo}` : ''}
${student.sat ? `SAT: ${student.sat}` : ''}
Major: ${student.major}
Preferred Country: ${student.preferredCountry}
Preferred Universities: ${student.preferredUniversities?.join(', ') || 'Not specified'}
Intake: ${student.intake}
Budget: $${student.budget?.toLocaleString()}/year
Pipeline Status: ${student.status}
Lead Score: ${student.leadScore}
Enrollment Probability: ${student.enrollmentProbability}%
Last Contact: ${student.lastContact}
Notes: ${student.notes || 'None'}
Counselor: ${student.counselor}
`.trim()

  const prompts: Record<string, string> = {
    analyze: `You are an expert education consulting sales coach at Upnex, a top international education agency.

Analyze this student lead and give the counselor a sharp, actionable briefing:

${studentSummary}

Provide:
1. **Lead Assessment** — Is this a strong lead? What are the risks?
2. **University Recommendations** — 3 specific universities that fit their GPA, budget, major, and intake. Explain why each fits.
3. **Scholarship Opportunities** — Any realistic scholarship options?
4. **What To Do RIGHT NOW** — 3 specific actions the counselor must take this week to move this deal forward.
5. **Sales Strategy** — How to convince this student and their parents to sign the contract. What objections will they have?

Be direct, specific, and actionable. No fluff.`,

    email: `You are an expert education counselor at Upnex agency.

Write a warm, professional follow-up email for this student:

${studentSummary}

The email should:
- Be personalized with their name and details
- Reference their specific major and target country
- Mention 1-2 specific universities that fit them
- Create urgency around the ${student.intake} intake deadline
- Include a clear call-to-action to schedule a call
- Be friendly, not salesy
- Be in English (the student understands English)

Format: Subject line first, then the email body.`,

    whatsapp: `You are an expert education counselor at Upnex agency.

Write a short WhatsApp/Telegram message for this student:

${studentSummary}

Rules:
- Maximum 4-5 sentences
- Casual and friendly tone
- Reference their name and major
- Include ONE clear question to get them to respond
- End with your name (Counselor from Upnex)
- No formal language — this is a chat message`,

    action_plan: `You are a sales manager at Upnex, a top education consulting agency.

Create a detailed action plan to CLOSE this deal:

${studentSummary}

Provide a step-by-step plan:
1. **This Week** — What must happen in the next 7 days
2. **Communication Script** — What to say on the next call (key talking points)
3. **Parent Strategy** — How to convince the parents (they often make the final decision)
4. **Objection Handling** — Top 3 objections this family will raise and how to counter each
5. **Deadline Pressure** — How to create urgency without being pushy
6. **Closing Move** — The exact approach to get them to sign the contract

Be specific, use real examples relevant to ${student.preferredCountry} education.`,

    summary: `Summarize this student profile in 3 sentences for a quick briefing:

${studentSummary}

Include: who they are, what they want, their main strengths, and biggest risk to the deal.`,
  }

  const prompt = prompts[mode] || prompts.analyze

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message || 'OpenAI error' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ result: data.choices[0].message.content })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
