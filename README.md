# Name Verification Application

A small application with two independent capabilities:
- Target name generation from a user-provided prompt
- Candidate name verification against the latest generated target name

## Tech Stack
- NodeJS (v24.13)
- Node Package Manager (npm v11.8)
- Vite (v8.0)
- React (v19.2)
- Anthropic Claude (via `@anthropic-ai/sdk`) for name generation and verification

## How to run locally
### Install dependencies
```bash
npm install
```

### Create environment file
```bash
cp .env.example .env
```
- Now edit `.env` file and add your Anthropic API key
- NOTE: To find your key: Go to [https://console.anthropic.com/](https://console.anthropic.com/) → API Keys → create or copy an existing one.

### Run the project
```bash
npm run dev
```

## Built-in lint test
```bash
npm run lint
```

## Run test cases
- watch mode
```bash
npm test
```

- single run (CI-style)
```bash
npm run test:run
```


## The challenge
### What you're building

A small application with two independent capabilities:

- Target name generation from a user-provided prompt
- Candidate name verification against the latest generated target name

Key Design Constraint — The verifier must treat the generator as a black box. It must not "cheat" by reusing generator chat context or calling back into the generator to decide whether a candidate matches.

### Functional Requirements
#### Target Name Generator

What the user can do:

- Provide a free-form prompt (e.g., "Generate a random name with …")
- Trigger generation
- See the resulting target name (a single string)

Behavior:

- Each generation produces exactly one target name string
- The app maintains the concept of the latest generated target name
- Generating again updates what "latest" means

Example prompt: "Please generate a random Arabic sounding name with an Al and ibn both involved. The name shouldn't be longer than 5 words."

#### Name Verifier
What the user can do:

- Input a candidate name
- Trigger verification
- Receive a structured result
- The verifier returns, at minimum:

Field: match — boolean

Field: confidence — numeric (0–1 or 0–100)

Field: reason — short explanation

- Checks candidate against the latest generated target name
- If no target name exists yet, returns a clear error state

### Architectural Constraint

🔒 Black Box Generator
The verifier must be implemented as if the generator is not an open, available resource during verification. The verifier may only access the latest generated target name string.

X-> Generator chat history or context
X-> Calling the generator again (directly or indirectly) to evaluate a match
X-> "Hidden" shared LLM state between generator and verifier

How the latest target name is exposed to the verifier (in memory, file, database, API, etc.) does not matter — only that the verifier is architecturally isolated from generator internals and operates using only the latest name string.

### Implementation
#### Interface

You can implement this as a web app, CLI app, desktop app, etc. The only requirement is that a reviewer can:

- Provide a prompt → generate a target name
- Provide a candidate name → verify against the latest target name and see output

#### Matcher Evaluation
You will be graded on matching behavior using a test suite based on the list provided below. Your verifier should produce results consistent with the expected outcomes.

You're free to implement any matching strategy you think is appropriate, as long as it:

- Produces deterministic (or at least stable/consistent) outputs
- Returns match + confidence + explanation
- Can be tested programmatically

Documentation: No formal docs needed — just make it clear how to run the application.

### Test Cases
#### Expected Matches
Target Name	Candidate Name		Rationale

1	Tyler Bliha	Tlyer Bilha	MATCH	Minor transposition and misspelling in both first and last name
2	Al-Hilal	alhilal	MATCH	Hyphen and casing differences only
3	Dargulov	Darguloff	MATCH	Common phonetic suffix variation (v vs ff)
4	Bob Ellensworth	Robert Ellensworth	MATCH	Common nickname vs formal name
5	Mohammed Al Fayed	Muhammad Alfayed	MATCH	Spacing and transliteration variance
6	Sarah O'Connor	Sara Oconnor	MATCH	Apostrophe removal and vowel simplification
7	Jonathon Smith	Jonathan Smith	MATCH	Common spelling variant of first name
8	Abdul Rahman ibn Saleh	Abdulrahman ibn Saleh	MATCH	Spacing variation within compound name
9	Al Hassan Al Saud	Al-Hasan Al Saud	MATCH	Minor consonant simplification and hyphenation
10	Katherine McDonald	Catherine Macdonald	MATCH	Phonetic first name and common Mc/Mac variation
11	Yusuf Al Qasim	Youssef Alkasim	MATCH	Transliteration differences in Arabic-derived names
12	Steven Johnson	Stephen Jonson	MATCH	Phonetic spelling differences in both names
13	Alexander Petrov	Aleksandr Petrof	MATCH	Slavic transliteration and phonetic variation
14	Jean-Luc Picard	Jean Luc Picard	MATCH	Hyphen removal
15	Mikhail Gorbachov	Mikhail Gorbachev	MATCH	Alternate transliteration endings
16	Elizabeth Turner	Liz Turner	MATCH	Common nickname shortening
17	Omar ibn Al Khattab	Omar Ibn Alkhattab	MATCH	Case, spacing, and compound-name variance
18	Sean O'Brien	Shawn Obrien	MATCH	Phonetic first name and punctuation removal


#### Expected Non-Matches
Target Name	Candidate Name		Rationale

19	Emanuel Oscar	Belinda Oscar	NO MATCH	Same last name but entirely different first name
20	Michael Thompson	Michelle Thompson	NO MATCH	Similar-looking but distinct first names
21	Ali Hassan	Hassan Ali	NO MATCH	Token order swap changes identity
22	John Smith	James Smith	NO MATCH	Different common first names
23	Abdullah ibn Omar	Omar ibn Abdullah	NO MATCH	Reversal of patronymic meaning
24	Maria Gonzalez	Mario Gonzalez	NO MATCH	Gendered name difference
25	Christopher Nolan	Christian Nolan	NO MATCH	Similar prefix but distinct names
26	Ahmed Al Rashid	Ahmed Al Rashidi	NO MATCH	Different surname root
27	Samantha Lee	Samuel Lee	NO MATCH	Different first name despite shared root
28	Ivan Petrov	Ilya Petrov	NO MATCH	Distinct given names in same cultural group
29	Fatima Zahra	Zahra Fatima	NO MATCH	Name order inversion changes identity
30	William Carter	Liam Carter	NO MATCH	Nickname not universally equivalent without explicit mapping