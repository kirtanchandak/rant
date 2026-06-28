# Personal Knowledge Graph (PKG)

## Vision

The journal is the source of truth.

The AI continuously builds a structured understanding of the user's life.

Every journal entry contributes to a living knowledge graph.

This graph powers:

- AI Chat
- Weekly Reviews
- Monthly Reviews
- Yearly Reflection
- Goal Tracking
- Timeline
- Recommendations
- Pattern Detection
- Memory

The graph should continuously evolve as new journal entries are written.

---

# Core Principles

## 1. Journal entries are immutable.

Never edit them.

They are the raw history.

---

## 2. Everything else is derived.

Memories

Relationships

Events

Insights

Summaries

Embeddings

All of these can be regenerated.

---

## 3. AI should never be the database.

The LLM extracts knowledge.

The application owns the knowledge.

---

# Architecture

Journal Entry

↓

Knowledge Extraction

↓

Knowledge Processor

↓

Knowledge Graph

↓

Insights + Chat + Timeline

---

# Ontology

The model MUST classify entities using one of these types.

## Identity

person

relationship

organization

company

---

## Work

project

goal

skill

task

---

## Lifestyle

habit

preference

belief

interest

---

## Entertainment

book

movie

music

podcast

game

---

## Sports

sport

team

athlete

---

## Places

place

country

city

location

---

## Physical

device

vehicle

product

---

## Food

food

drink

restaurant

---

## Timeline

event

---

## Other

other

The ontology should be easy to extend.

---

# Memory

Memory represents something that is expected to remain true across time.

Example

"I use a MacBook."

"I support RCB."

"I enjoy Formula 1."

"My daughter is Emma."

"My startup is Monday."

Schema

```ts
Memory {

id

userId

type

name

summary

metadata

status

confidence

firstSeen

lastSeen

mentionCount

createdAt

updatedAt

}
```

---

# Memory Status

Every memory has a lifecycle.

Status

proposed

confirmed

updated

archived

contradicted

deleted

Example

Journal

"I think I'll move to Windows."

↓

Status

proposed

Later

"Sold my MacBook."

↓

updated

Later

"I've completely switched."

↓

confirmed

Later

"Bought a MacBook again."

↓

Windows

archived

MacBook

confirmed

---

# Events

Events happen once.

Schema

```ts
Event {

id

userId

name

summary

eventDate

confidence

metadata

}
```

Examples

Started Gym

Graduated

Bought Car

Started Company

Got Married

---

# Relationships

Everything can connect.

Schema

```ts
Relationship {

id

userId

sourceMemoryId

relation

targetMemoryId

confidence

}
```

Examples

Emma

CHILD_OF

John

---

Monday

USES

OpenAI

---

RCB

PLAYS_IN

IPL

---

Journal

INSPIRED_BY

Reflect

---

# LLM Output

Always return JSON.

```json
{
  "entities": [],
  "relationships": [],
  "events": []
}
```

Every entity includes

type

name

summary

metadata

confidence

Never return markdown.

Never explain.

---

# Knowledge Processor

For every entity

Normalize name

↓

Search existing memories

↓

If exists

Update

Else

Create

The processor—not the LLM—owns merge logic.

---

# Merge Strategy

Exact match

↓

Normalized match

↓

Future:

Embedding similarity

↓

Future:

Graph similarity

---

# API

POST

/api/knowledge/process

Input

journalEntryId

Pipeline

Fetch Journal

↓

LLM Extraction

↓

Validate JSON

↓

Normalize

↓

Merge

↓

Store

↓

Return updated graph

---

# UI

## Memory

Grouped by ontology.

People

Projects

Goals

Preferences

Devices

Places

etc.

---

## Timeline

Chronological events.

---

## Relationships

Interactive graph.

Example

Monday

↓

USES

↓

OpenAI

↓

CREATED_BY

↓

Kirtan

---

## Future AI Features

Chat

"What was I doing in March?"

↓

Graph Retrieval

↓

Relevant Journal Entries

↓

LLM

↓

Answer

---

Weekly Review

Read graph changes.

Generate summary.

---

Monthly Review

Read graph evolution.

Generate reflection.

---

Pattern Detection

Detect

- recurring goals

- repeated mistakes

- emotional trends

- abandoned projects

- growing interests

---

Recommendations

"You've mentioned AI agents 31 times in the last two months."

"You haven't mentioned the gym in three weeks."

"Your happiest entries usually happen after shipping projects."

---

# Future Architecture

Journal

↓

Knowledge Graph

↓

Embeddings

↓

Temporal Graph

↓

Reasoning

↓

Insights

The graph becomes richer over time without changing the journal itself.