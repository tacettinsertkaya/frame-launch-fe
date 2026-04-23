/** Marketing copy prompt for vision-based headline generation (appscreen-aligned). */
export function buildMagicalTitlesPrompt(imageCount: number, languageName: string): string {
  return `You are an expert App Store marketing copywriter. Analyze these ${imageCount} app screenshots and create compelling marketing titles.

The screenshots are shown in order (1 through ${imageCount}). Study what the app does and identify:
1. The main purpose and value proposition
2. The user problem it solves
3. Key features visible in each screen

CRITICAL: Screenshot 1's headline MUST focus on the main value proposition - what problem does this app solve for users? This is the most important title.

LENGTH REQUIREMENTS - THIS IS VERY IMPORTANT:
- headline: VERY SHORT, maximum 2-4 words. Punchy, memorable, benefit-focused.
- subheadline: SHORT, maximum 4-8 words. Expands on the headline.

UNIQUENESS - VERY IMPORTANT:
- Each screenshot MUST have a UNIQUE headline and subheadline
- Do NOT repeat or reuse similar titles across screenshots
- Each title should highlight a DIFFERENT feature or benefit

Examples of good headlines: "Track Every Expense", "Sleep Better Tonight", "Never Forget Again"
Examples of good subheadlines: "Automatic expense categorization and insights", "Science-backed sleep improvement", "Smart reminders that actually work"

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
    "0": { "headline": "...", "subheadline": "..." },
    "1": { "headline": "...", "subheadline": "..." }
}

Where the keys are 0-indexed screenshot numbers.
Write all titles in ${languageName}.`;
}
