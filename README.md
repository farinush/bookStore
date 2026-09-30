# Marginalia — Fuzzy Book Search

A minimalist, editorial-style landing page for a small book catalog, with typo-tolerant search that runs entirely in the browser , no backend, no external search API.

Live Demo:https://book-store-beige-kappa.vercel.app/

## Why this project

I wanted to see how the SymSpell-style fuzzy search technique I'd built for a product-search demo would hold up in a completely different context , a small catalog of novels and psychology books, styled nothing like my previous, more utilitarian demos.


## What it does

- Search across 14 books by title or author, tolerant of typos (`orwel` finds *George Orwell*, `kahnemann` finds *Kahneman*)
- The search index is built once, client-side, using a simplified SymSpell "deletion" technique: every word in every title/author is pre-indexed by all its possible character-deletions up to edit distance 2, so a lookup at search time doesn't need to run Levenshtein against the whole catalog
- Each result shows whether it was an exact match or a typo-corrected one, with the actual edit distance
- Editorial/minimalist visual design: paper background, serif typography, no shadows, a single accent color per category , a deliberate contrast to the neomorphic style used in earlier demos in this series

## Tech stack

- Vanilla HTML/CSS/JavaScript , no framework, no build step
- Google Fonts (Lora + Inter)
- No external services: the entire search runs client-side

## How the fuzzy search works

1. At load time, every word in every book's title and author is expanded into all possible "delete up to 2 characters" variants, and each variant is mapped back to the book's id in an index
2. When the user types a query, the same deletion process runs on the query, and the resulting variants are looked up in that index to get a small set of candidates
3. Real Levenshtein distance is computed only on that small candidate set, for ranking , not on the full catalog

This is a simplified, educational version of the real SymSpell algorithm , the goal was to understand and demonstrate the core idea, not to ship a production-grade implementation.

## Running locally

Just open \`index.html\` in a browser , no build step, no dependencies.

## What I'd improve next

- Persist the search index instead of rebuilding it on every page load
- Add category filtering alongside search
- Try the same UI against a much larger catalog to see where the simplified index starts to break down
