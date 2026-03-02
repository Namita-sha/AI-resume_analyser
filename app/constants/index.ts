export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: { score: 90, tips: [] },
      toneAndStyle: { score: 90, tips: [] },
      content: { score: 90, tips: [] },
      structure: { score: 90, tips: [] },
      skills: { score: 90, tips: [] },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: { score: 55, tips: [] },
      toneAndStyle: { score: 55, tips: [] },
      content: { score: 55, tips: [] },
      structure: { score: 55, tips: [] },
      skills: { score: 55, tips: [] },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: { score: 75, tips: [] },
      toneAndStyle: { score: 75, tips: [] },
      content: { score: 75, tips: [] },
      structure: { score: 75, tips: [] },
      skills: { score: 75, tips: [] },
    },
  },
];

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `You are an expert ATS and resume analyzer.
Analyze the resume and return ONLY a JSON object. No extra text. No markdown. No backticks. No comments.
The JSON must use EXACTLY these field names and structure:

{
  "overallScore": <number 0-100>,
  "ATS": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<short title>", "explanation": "<detailed explanation>" },
      { "type": "improve", "tip": "<short title>", "explanation": "<detailed explanation>" }
    ]
  },
  "toneAndStyle": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<short title>", "explanation": "<detailed explanation>" },
      { "type": "improve", "tip": "<short title>", "explanation": "<detailed explanation>" }
    ]
  },
  "content": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<short title>", "explanation": "<detailed explanation>" },
      { "type": "improve", "tip": "<short title>", "explanation": "<detailed explanation>" }
    ]
  },
  "structure": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<short title>", "explanation": "<detailed explanation>" },
      { "type": "improve", "tip": "<short title>", "explanation": "<detailed explanation>" }
    ]
  },
  "skills": {
    "score": <number 0-100>,
    "tips": [
      { "type": "good", "tip": "<short title>", "explanation": "<detailed explanation>" },
      { "type": "improve", "tip": "<short title>", "explanation": "<detailed explanation>" }
    ]
  }
}

IMPORTANT RULES:
- Use EXACTLY these field names: overallScore, ATS, toneAndStyle, content, structure, skills
- Each section needs 3-4 tips with mix of "good" and "improve"
- type must be ONLY "good" or "improve"
- Do NOT use: overall_rating, ats_score, strengths, weaknesses, or any other field names
- Return ONLY the raw JSON, absolutely nothing else

Job title: ${jobTitle}
Job description: ${jobDescription}`;