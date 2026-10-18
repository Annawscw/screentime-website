/* ==========================================================================
   questions.js — the CONTENT of the Screen Habit Check.
   ========================================================================== */

var DIMENSIONS = {
  control:      { label: 'Loss of control', colour: 'var(--amber)' },
  displacement: { label: 'Displacement',    colour: 'var(--coral)' },
  mood:         { label: 'Mood & withdrawal', colour: 'var(--violet)' },
  conflict:     { label: 'Conflict',        colour: 'var(--mint)' }
};

var QUESTIONS = [
  {
    dim: 'control',
    text: 'How often do you pick up your phone without actually deciding to?',
    opts: ['Hardly ever', 'Sometimes', 'Most days', 'Constantly — it just happens']
  },
  {
    dim: 'control',
    text: 'You open an app to do one thing. How often do you look up 40 minutes later?',
    opts: ['Rarely', 'Now and then', 'Several times a week', 'Every single day']
  },
  {
    dim: 'control',
    text: 'If you tried to stay off social media for a whole day, how would it go?',
    opts: ['Easy', 'A bit annoying', 'Hard — I would probably cave', 'No chance']
  },
  {
    dim: 'displacement',
    text: 'How often does your phone cut into your sleep?',
    opts: ['Never', 'Once or twice a week', 'Most nights', 'Basically every night']
  },
  {
    dim: 'displacement',
    text: 'Has your phone got in the way of homework, sport or a job recently?',
    opts: ['No', 'A little', 'Yes, fairly often', 'Yes, a lot']
  },
  {
    dim: 'displacement',
    text: 'When you hang out with people in person, where is your phone?',
    opts: ['Away — I forget about it', 'In my pocket, mostly ignored', 'In my hand a fair bit', 'In my hand the whole time']
  },
  {
    dim: 'mood',
    text: 'Your phone is in another room for two hours. How do you feel?',
    opts: ['Fine, honestly', 'Slightly aware of it', 'Restless — I keep thinking about it', 'Anxious. I would go get it']
  },
  {
    dim: 'mood',
    text: 'How often do you go on your phone because you feel bored, stressed or flat?',
    opts: ['Rarely', 'Sometimes', 'Often', 'It is my automatic response']
  },
  {
    dim: 'mood',
    text: 'After a long scroll, how do you usually feel?',
    opts: ['Good — I got something out of it', 'Neutral', 'A bit empty or behind', 'Worse than when I started']
  },
  {
    dim: 'conflict',
    text: 'How often does your phone cause friction with family or friends?',
    opts: ['Never', 'Occasionally', 'Regularly', 'It is a constant argument']
  }
];

/* --------------------------------------------------------------------------
   PROFILES — the four score bands.
   -------------------------------------------------------------------------- */

var PROFILES = [
  {
    id: 'control',
    min: 0, max: 7,
    name: 'In Control',
    colour: 'var(--mint)',
    headline: 'Your phone works for you, not the other way round.',
    body: 'You use your phone a lot — everyone does — but you are still the one making the decisions. The goal now is protecting that, because habits drift quietly. Most people who end up struggling did not notice it happening.',
    actions: [
      { title: 'Keep the bedroom clear', text: 'The single habit that protects everything else. Phone charges outside the room, or at least across it.' },
      { title: 'Audit your notifications once a term', text: 'Apps quietly re-enable them after updates. Turn off anything that is not a real person messaging you.' },
      { title: 'Notice your default', text: 'Next time you are bored, clock what your hand does. Just noticing is enough at your level.' }
    ]
  },
  {
    id: 'drifting',
    min: 8, max: 14,
    name: 'Drifting',
    colour: 'var(--amber)',
    headline: 'Mostly fine — but a few habits are starting to run themselves.',
    body: 'Nothing here is alarming. What your answers show is a bit of autopilot: opening apps without deciding to, losing more time than you meant to, and letting your phone eat into things you actually care about. This is the easiest stage to change, because you have not built much around it yet.',
    actions: [
      { title: 'Pick your one worst moment', text: 'Not your whole day — one moment. For most people it is the last hour before sleep. Fix that one and the rest follows.' },
      { title: 'Put friction in the way', text: 'Move your three worst apps off your home screen and into a folder on the last page. Sounds trivial. Cuts opens by about a third.' },
      { title: 'Log your hours for a week', text: 'Use the dashboard here. Guessing is always wrong — usually by half. The real number is the motivation.' }
    ]
  },
  {
    id: 'hooked',
    min: 15, max: 21,
    name: 'Hooked',
    colour: 'var(--coral)',
    headline: 'Your phone is making some of your decisions for you.',
    body: 'Your answers point to a real pattern: time going missing, sleep getting shorter, and reaching for your phone when you feel flat rather than when you actually want something. That is not a character flaw. These apps are built by very large teams whose entire job is to produce exactly this result. But it does mean willpower alone will not fix it — you need to change the setup, not just try harder.',
    actions: [
      { title: 'Get it out of your bedroom tonight', text: 'A $15 alarm clock is the highest-value purchase in this whole list. The barrier has to be physical, not mental.' },
      { title: 'Grayscale your screen after 9pm', text: 'Settings → Accessibility → Colour filters. It sounds silly. Colour is doing more work than you think.' },
      { title: 'Replace, do not just remove', text: 'An empty hour gets filled by the phone again. Decide in advance what goes in it — a book, a walk, the gym, a mate.' }
    ]
  },
  {
    id: 'stuck',
    min: 22, max: 30,
    name: 'Stuck',
    colour: 'var(--coral)',
    headline: 'This is affecting your sleep and your mood, and that is worth taking seriously.',
    body: 'Your answers describe something that is costing you real things — rest, focus, and probably how you feel day to day. That is genuinely hard, and it is not something to be embarrassed about. Two things are true at once: small changes will help, and you do not have to sort this out on your own. Talking to someone you trust makes a bigger difference than any app.',
    showHelp: true,
    actions: [
      { title: 'Start with sleep only', text: 'Do not try to overhaul everything. One change: the phone leaves your room. Give it a week before you add anything else.' },
      { title: 'Tell one person', text: 'A friend, a parent, a coach, a school counsellor. Saying it out loud takes it from a secret to a problem you are working on.' },
      { title: 'Track it honestly for a week', text: 'No goal, no judgement — just log the real number. You cannot change a number you are avoiding looking at.' }
    ]
  }
];
