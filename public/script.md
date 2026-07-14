# Tlapalli — English Voiceover Script

## Synced to scene breakdown / YouTube

---

### A note before recording

This script is written to be read, not memorized.
Read it out loud at least once before recording — adjust any phrase that doesn't feel like you.
[PAUSE] marks are breathing room and editorial cuts, not hard stops.
[RITMO ↑] and [RITMO ↓] carry over from the podcast format — same idea.

---

## SCENE 02–03 — Situation

As a software developer, I tend to have several repositories open at the same time.

[PAUSE]

The backend. The frontend. A library and the app that depends on it.
Each one with a different context. A different way of thinking.

[PAUSE]

And if there's one thing I've learned over the years —
switching context has a cost.

[RITMO ↓]

Not just in time.
In mental energy.

[PAUSE]

So I started doing something simple.
Different VSCode themes for different repos.

[PAUSE]

Just to know — at a glance — where I was.
Which file I was about to touch.
Which context I was operating in.

[PAUSE]

One theme. One repo.

It worked.

---

## SCENE 04 — Desire

Then, one day I came across a monochromatic theme.

[PAUSE]

At first, I didn't like it.
It felt flat. Almost uncomfortable after years of colorful syntax highlighting.

[PAUSE]

But I gave it time.

[RITMO ↓]

And something shifted.

[PAUSE]

I started noticing I could focus better.
Less visual noise. Less going on around the code.

My mind felt less loaded.

[PAUSE]

Especially in winter — when there's not much light outside —
even dark themes started feeling heavy.

The monochromatic one just... held up.

---

## SCENE 05 — Conflict pt. 1

The problem was that the theme wasn't quite right.

[PAUSE]

Comments were hard to read.
Reserved keywords and my own values didn't have enough contrast between them.

[PAUSE]

And slowly, everything started to look the same again.

[RITMO ↓]

Which defeated the whole point.

---

## SCENE 06 — Conflict pt. 2

VSCode lets you override colors manually in your settings.
So I started doing that.

[PAUSE]

But every time I switched codebases —
every time I wanted to use a different base theme —
I had to go through the whole process again.

[RITMO ↑]

Every codebase. Every theme. Every time.

[PAUSE]

[RITMO ↓]

I was trying to simplify my environment.

[PAUSE]

And making it more complicated instead.

---

## SCENE 07 — Change: the question

And then I asked myself a question.

[PAUSE]

One of those questions that sounds small —
but you already know it's gonna get you in trouble:

[PAUSE]

_"How hard would it be to just build my own theme?"_

[PAUSE]

Rabbit hole.

---

## SCENE 08 — Change: building with AI

I started using AI tools to generate variations from that base theme I mostly liked.
Asking for adaptations. Specific adjustments.

Then it hit me.

[PAUSE]

I realized I could keep the monochromatic base —
clean, distraction-free —
but add a tint.

[PAUSE]

A single hue, shifted across the whole theme.

[PAUSE]

And alongside that, I built some scripts.
To modify color values. To add new keys. To extract specific tokens.

Things I'd otherwise have to do manually — over and over.

---

## SCENE 09 — Change: the click

It was messy at first.
A lot of experimenting. A lot of things that almost worked.

[RITMO ↑]

And when I saw the variations side by side —
each one feeling like its own thing,
but all sharing the same calm foundation —

[PAUSE]

That was the moment.

[RITMO ↓]

One tint. One codebase. Same focus.

[PAUSE]

It wasn't just a fixed theme anymore.

It was a system.

---

## SCENE 10 — Result: what Tlapalli is

That's how Tlapalli came to be.

[PAUSE]

Tlapalli means _color_ in Náhuatl —
the language of the Aztec civilization,
still spoken in parts of Mexico today.

[PAUSE]

It's a collection of monochromatic VSCode themes,
each one inspired by a mineral or gemstone found in Mexico.

[PAUSE]

Obsidian. Gold. Turquoise. Quartz.
Lapis Lazuli. Amethyst. Jade. Fire Opal.

[PAUSE]

Each one available in dark and light modes.

---

## SCENE 11 — Result: the work behind it

Getting here took more than I expected.

[PAUSE]

What started as one repository
became more than just that —
the theme, the website, and a separate repo just for scripts and templates, heck... the codebase for this very video.

[PAUSE]

Like I said... Scripts to generate variants. Scripts to convert dark themes to light.
A GitHub Action to automate releases to both
the VSCode Marketplace and the Open VSX Registry.

---

## SCENE 12 — Result: the website

The website ended up being its own project entirely.

[PAUSE]

Built with Nuxt as a static site.
Sixteen themes to show.

[PAUSE]

There's a frosted glass effect on the header.
Haptic feedback if you visit from your phone.
And a sound when you open the menu —
each gem in the logo is a button.

[PAUSE]

Details nobody asked for.

[RITMO ↓]

But that felt right to include.

---

## SCENE 12b — Result: the SVG crop pipeline

And then there were the screenshots.

[PAUSE]

Sixteen themes.
Each one had to be cropped exactly the same way —
same region, same framing, every single time.

[PAUSE]

So I built a template.

[PAUSE]

One SVG file. One rectangle.
The script places it on top of each screenshot
and clips everything outside of it.

[PAUSE]

[RITMO ↑]

Same rectangle. Sixteen times.

[PAUSE]

[RITMO ↓]

Consistent. Automatic. Done.

---

## SCENE 13 — Closing reflection

It wasn't a moment of inspiration.

[PAUSE]

It was iteration.
Friction.
Repeating something enough times
until I got tired of repeating it
and built something to handle it for me.

[PAUSE]

And slowly —

[RITMO ↓]

something small became something I felt ready to share.

---

## SCENE 14 — Outro

If your environment is bothering you —

[PAUSE]

maybe you don't need to adapt to it.

[PAUSE]

Maybe you can build something better.

[PAUSE]

You can find Tlapalli on the VSCode Marketplace,
on the Open VSX Registry,

[PAUSE]

Thanks for watching.

---

## Word count and pacing reference

| Scene                  | Est. duration |
| ---------------------- | ------------- |
| 01 Cold open (silence) | 4s            |
| 02–03 Situation        | ~50s          |
| 04 Desire              | ~40s          |
| 05–06 Conflict         | ~40s          |
| 07 The question        | ~15s          |
| 08 Building            | ~30s          |
| 09 The click           | ~40s          |
| 10 What Tlapalli is    | ~35s          |
| 11 The work            | ~30s          |
| 12 Website             | ~25s          |
| 12b SVG crop pipeline  | ~30s          |
| 13 Reflection          | ~25s          |
| 14 Outro               | ~20s          |
| **Total**              | **~6:30 min** |

_Note: actual duration will depend on your natural pace and how long you hold the pauses.
If you want to keep it under 5 minutes, scenes 11 and 12 are the easiest to trim —
the website details are great but not essential to the core story._
