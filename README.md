# SRM GPA — Precision SGPA & CGPA Calculator

> A modern, high-precision academic grade calculator engineered for SRMIST students. Built with inspiration from Linear, Vercel, Raycast, and Apple Calculator.

---

## Highlights

- **Pure Focus**: No advertisements, no bloated dashboards, no mandatory logins, and no fake statistics. The calculator is the hero of the entire experience.
- **Precision Engineered**: Custom numerical calculation engine with integer-scaled arithmetic protecting against IEEE-754 floating-point inaccuracies.
- **Full Calculation Transparency**: Collapsible mathematical proof displaying exact itemized credit-grade point products and step-by-step ratio derivations for both SGPA and CGPA.
- **Linear & Vercel Aesthetic**: Geist and Inter typography, subtle borders, soft shadows, restrained motion, responsive design, and an instant light/dark mode switch.
- **Accessible Micro-Interactions**: Custom keyboard-friendly grade dropdown, sliding spring pill segmented control, animated row additions/deletions, and a smooth numeric count-up reveal.

---

## Project Architecture

```
src/
├── config/
│   └── academicRules.ts      # SRMIST 10-point grade scale, defaults, credit limits
├── lib/
│   └── calculations/
│       ├── rounding.ts       # Precision rounding & safe summations
│       ├── gradePoints.ts    # SRM grade mapping & validations
│       ├── sgpa.ts           # SGPA computation & verification breakdown
│       ├── cgpa.ts           # CGPA cumulative computation & verification
│       └── index.ts          # Unified export interface
└── components/
    ├── Navbar.tsx            # Minimal brand header, nav links, theme toggle
    ├── Hero.tsx              # Confident typography & supporting context
    ├── CalculatorShell.tsx   # Card shell with animated segmented tab switch
    ├── SgpaCalculator.tsx    # Course table with desktop/mobile adaptive layouts
    ├── CgpaCalculator.tsx    # Semester rows with cumulative GPA computation
    ├── CourseRow.tsx         # Individual course row with custom grade select
    ├── SemesterRow.tsx       # Individual semester row with inline validation
    ├── GradeSelect.tsx       # Custom accessible dropdown (O, A+, A, B+, B, C, P, F, Ab)
    ├── ResultCard.tsx        # Hero result card with smooth count-up animation
    ├── CalculationBreakdown.tsx # Transparent step-by-step mathematical proof
    ├── EmptyState.tsx        # Minimalist empty state when rows are cleared
    ├── HowItWorks.tsx        # 3-step minimal guide
    └── Footer.tsx            # Minimalist footer
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on v26)
- npm 9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
