// Modular AI layer: add a provider to PROVIDERS and set AI_PROVIDER to switch. The API key never leaves the server.
const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

const SYSTEM = `You are PathWise's career mentor for students. Be structured, beginner-friendly and personalised to the student's profile.
Keep answers under 150 words. Be honest about uncertainty. Never promise jobs or salaries, and never claim one programming language is best for everyone.
Separate educational guidance, industry trends and personal preference. Stay on topic: education, skills, projects, careers and professional platforms.`;

const lim = (v, n) => String(v ?? '').replace(/[\u0000-\u001F]/g, ' ').slice(0, n);

function context(p = {}) {
  const arr = a => (Array.isArray(a) ? a.slice(0, 20).map(x => lim(x, 60)).join(', ') : '') || 'none listed';
  return `Student profile: ${lim(p.who, 40)}, studying ${lim(p.deg, 80)}, semester ${lim(p.sem, 3)}. Knows: ${arr(p.known)}. Interests: ${arr(p.interests)}. Career goal: ${lim(p.goal, 80)}. Completed roadmap skills: ${arr(p.completed)}.`;
}

const PROVIDERS = {
  async anthropic({ question, profile, history }) {
    const past = (Array.isArray(history) ? history : []).slice(-6)
      .map(h => `${h && h.r === 'Mentor' ? 'Mentor' : 'Student'}: ${lim(h && h.t, 600)}`).join('\n');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-sonnet-4-6',
        max_tokens: 500,
        system: `${SYSTEM}\n${context(profile)}`,
        messages: [{ role: 'user', content: (past ? `Earlier conversation:\n${past}\n\n` : '') + lim(question, 1000) }]
      }),
      signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`AI provider returned ${res.status}`);
    const data = await res.json();
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  }
};

async function askMentor(input) {
  const fn = PROVIDERS[process.env.AI_PROVIDER || 'anthropic'];
  if (!fn) throw new Error('Unknown AI_PROVIDER');
  return fn(input);
}
module.exports = { aiEnabled, askMentor };
