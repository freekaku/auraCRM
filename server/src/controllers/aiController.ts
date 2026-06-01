import { Response } from 'express';
import Lead from '../models/Lead';
import Note from '../models/Note';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

// Initialize Gemini API if key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  
  // Create Gemini client using official GoogleGenerativeAI package
  return new GoogleGenerativeAI(apiKey);
};

// Helper: fallback mock engine to return realistic summaries
const generateMockAISummary = (lead: any, notes: any[], activities: any[]) => {
  const notesExcerpt = notes.length > 0
    ? notes.map((n, i) => `${i + 1}. ${n.content} (by ${n.author?.name || 'Rep'})`).join('\n')
    : 'No notes logged yet.';

  const timelineExcerpt = activities.length > 0
    ? activities.slice(0, 3).map((a) => `- [${a.type}]: ${a.description}`).join('\n')
    : 'No timeline events.';

  const isHighValue = lead.expectedRevenue >= 50000;
  const statusAdvice = lead.status === 'New' ? 'needs immediate initial outreach. Schedule an introductory call to discover requirements.'
    : lead.status === 'Contacted' ? 'is in active discussion. Qualify critical pain-points and determine project scope.'
    : lead.status === 'Qualified' ? 'is qualified. Prepare a formal proposal and schedule a demo/pricing discussion.'
    : lead.status === 'Proposal' ? 'has a proposal outstanding. Follow up on terms, address objections, and seek verbal commitment.'
    : lead.status === 'Won' ? 'is won! Initiate customer onboarding and ensure successful handoff to account management.'
    : 'is marked as Lost. Archive for historical insights or schedule a retro in 6 months to re-evaluate options.';

  const summaryText = `### AI Executive Lead Summary for **${lead.name}**
**Company**: ${lead.company} | **Industry**: ${lead.industry} | **Status**: ${lead.status}
**Expected Value**: $${lead.expectedRevenue.toLocaleString()} (${isHighValue ? '🔥 High Value Account' : 'Standard Account'})

#### 🔍 Strategic Assessment
This lead belongs to the **${lead.industry}** sector located in **${lead.country}**. The account is currently marked as **${lead.status}** and ${statusAdvice}

#### 📋 Notes Synthesis
${notesExcerpt}

#### 📊 Pipeline Recommendations
1. **Next Best Action**: ${lead.status === 'New' ? 'Trigger introductory email template' : lead.status === 'Contacted' ? 'Schedule a 15-minute discovery sync' : 'Send draft pricing contract'}
2. **Value Drivers**: Target solutions that emphasize scalability and industry standard processes tailored to **${lead.industry}**.
3. **Engagement Status**: The latest milestone is recorded as *"${timelineExcerpt.split('\n')[0] || 'Added to CRM'}"*. Maintain high touchpoints to avoid pipeline leakage.`;

  return summaryText;
};

const generateMockAIFollowUpEmail = (lead: any, senderName: string) => {
  const subject = `Accelerating ${lead.company}'s growth with tailored CRM Solutions`;
  const body = `Dear ${lead.name},

I hope this email finds you well. 

Following up on our CRM pipeline records, I wanted to reach out regarding **${lead.company}**'s strategic goals in the **${lead.industry}** industry. We have been tracking some exciting benchmarks in this sector, particularly regarding streamlining digital operations and maximizing revenue efficiency.

Given your expected deal projections and the pipeline status of **${lead.status}**, I would love to schedule a brief 10-minute introductory call next Tuesday to understand your workflow bottlenecks and share how our specialized frameworks can accelerate your timelines.

Do you have any availability next Tuesday at 2:00 PM or 4:00 PM EST for a quick discovery sync?

Looking forward to connecting!

Best regards,

${senderName}
Lead Relationship Manager
AuraCRM Inc.`;

  return { subject, body };
};

// AI Generate Lead Analysis
export const generateLeadAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid Lead ID structure.' });
      return;
    }

    const lead = await Lead.findById(id).populate('owner', 'name email role');
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    const notes = await Note.find({ leadId: id }).populate('author', 'name');
    const activities = await Activity.find({ leadId: id }).sort({ createdAt: -1 });

    const aiClient = getGeminiClient();
    const senderName = req.user?.name || (lead.owner as any)?.name || 'our sales team';

    // If Gemini client is not initialized, fallback to mock AI engine
    if (!aiClient) {
      console.log('[AI Service]: GEMINI_API_KEY not configured. Invoking built-in Mock CRM AI engine.');
      
      // Artificial delay to simulate real AI processing and create premium UX loading state!
      await new Promise((resolve) => setTimeout(resolve, 800));

      const summary = generateMockAISummary(lead, notes, activities);
      const email = generateMockAIFollowUpEmail(lead, senderName);

      res.json({
        summary,
        email,
        engine: 'Mock AI Engine (Fallback)',
      });
      return;
    }

    console.log('[AI Service]: Accessing live Gemini API...');
    
    // Construct rich context prompt
    const notesStr = notes.map(n => `- Note: "${n.content}" written by ${(n.author as any)?.name}`).join('\n');
    const timelineStr = activities.slice(0, 5).map(a => `- ${a.createdAt.toISOString()}: ${a.type} (${a.description})`).join('\n');
    
    const prompt = `
You are a highly capable AI Sales Assistant embedded in a premium CRM platform called AuraCRM.
Analyze the following CRM Lead details and synthesize:
1. A concise, professional Executive Lead Summary in rich Markdown format. Cover strategic assessment, notes synthesis, and 3 clear next-step recommendations.
2. A personalized, high-converting Sales Follow-Up Email draft.

CRITICAL: Return your response EXACTLY as a JSON object with two fields: "summary" (which contains the markdown summary text) and "email" (which is an object containing "subject" and "body" strings). Do not return any extra characters, codeblocks, or explanatory text. Just pure JSON.

CRM LEAD DATA:
- Lead Name: ${lead.name}
- Company: ${lead.company}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Industry: ${lead.industry}
- Country: ${lead.country}
- Source: ${lead.source}
- Status: ${lead.status}
- Expected Revenue: $${lead.expectedRevenue}
    - Owner/Sales Representative: ${(lead.owner as any)?.name}
- Current User Requesting this Action: ${senderName}

ACTIVITY HISTORY:
${timelineStr || 'No history recorded yet.'}

CLIENT NOTES:
${notesStr || 'No notes written yet.'}
`;

    // Make live call to Gemini API using official GoogleGenerativeAI SDK
    const model = aiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    const aiResponse = await model.generateContent(prompt);
    const responseText = aiResponse.response.text();
    if (!responseText) {
      throw new Error('Received empty response from Gemini API.');
    }

    // Parse returned JSON
    const parsedData = JSON.parse(responseText.trim());
    
    res.json({
      summary: parsedData.summary,
      email: parsedData.email,
      engine: 'Gemini AI Live Engine',
    });

  } catch (error: any) {
    console.error('[AI Service Error]:', error);
    // Graceful fallback to Mock AI even in case of live API error, ensuring absolute reliability!
    try {
      const { id } = req.params;
      const lead = await Lead.findById(id);
      const notes = await Note.find({ leadId: id }).populate('author', 'name');
      const activities = await Activity.find({ leadId: id }).sort({ createdAt: -1 });
      const senderName = req.user?.name || 'our sales team';

      const summary = generateMockAISummary(lead, notes, activities);
      const email = generateMockAIFollowUpEmail(lead, senderName);

      res.json({
        summary,
        email,
        engine: 'Mock AI Engine (Error Fallback)',
        errorInfo: error.message || 'Gemini API call failed.'
      });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to execute both live Gemini and Mock AI generation.' });
    }
  }
};

