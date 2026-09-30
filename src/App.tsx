import { useMemo, useState } from "react";


type Category = "novel" | "psychology";

type Book = {
  id: number;
  title: string;
  author: string;
  category: Category;
  price: string;
  desc: string;
};

type SearchResult = {
  book: Book;
  distance: number; 
};

const BOOKS: Book[] = [
  {
    id: 1,
    title: "1984",
    author: "George Orwell",
    category: "novel",
    price: "$12",
    desc: "A totalitarian future where a party controls not just behavior, but thought and memory itself.",
  },
  {
    id: 2,
    title: "Animal Farm",
    author: "George Orwell",
    category: "novel",
    price: "$9",
    desc: "A short fable about a farm revolution that slowly rebuilds the very tyranny it overthrew.",
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "novel",
    price: "$10",
    desc: "A sharp, witty study of marriage, class, and first impressions in Regency England.",
  },
  {
    id: 4,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "novel",
    price: "$11",
    desc: "A glittering, hollow portrait of the American dream told through one impossible love.",
  },
  {
    id: 5,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "novel",
    price: "$13",
    desc: "A child's view of racial injustice in a small Southern town, and a father who won't look away.",
  },
  {
    id: 6,
    title: "Brave New World",
    author: "Aldous Huxley",
    category: "novel",
    price: "$12",
    desc: "A society optimized for comfort and stability, where happiness is engineered and dissent is unthinkable.",
  },
  {
    id: 7,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    category: "novel",
    price: "$10",
    desc: "Three days in the restless, cynical mind of a teenager who trusts almost no one.",
  },
  {
    id: 8,
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    category: "novel",
    price: "$15",
    desc: "Seven generations of one family, where the mythic and the ordinary are never quite separate.",
  },
  {
    id: 9,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "psychology",
    price: "$17",
    desc: "A Nobel laureate's map of the two systems that drive human judgment — one fast, one deliberate.",
  },
  {
    id: 10,
    title: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "psychology",
    price: "$11",
    desc: "A psychiatrist's account of survival in the camps, and the theory of meaning it led him to.",
  },
  {
    id: 11,
    title: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "psychology",
    price: "$18",
    desc: "How trauma reshapes the body and brain, and what real recovery actually requires.",
  },
  {
    id: 12,
    title: "Quiet",
    author: "Susan Cain",
    category: "psychology",
    price: "$14",
    desc: "A case for introversion in a culture that rewards constant talking and visibility.",
  },
  {
    id: 13,
    title: "Atomic Habits",
    author: "James Clear",
    category: "psychology",
    price: "$16",
    desc: "Why tiny, consistent changes compound into identity — and how systems beat willpower.",
  },
  {
    id: 14,
    title: "Influence",
    author: "Robert Cialdini",
    category: "psychology",
    price: "$15",
    desc: "The six psychological levers that quietly shape how people say yes.",
  },
];

const MAX_DIST = 2;

function generateDeletes(word: string, maxDist: number): Set<string> {
  let current = new Set([word]);
  const all = new Set([word]);
  for (let d = 0; d < maxDist; d++) {
    const next = new Set<string>();
    for (const w of current) {
      for (let i = 0; i < w.length; i++) {
        const del = w.slice(0, i) + w.slice(i + 1);
        if (!all.has(del)) {
          next.add(del);
          all.add(del);
        }
      }
    }
    current = next;
    if (!current.size) break;
  }
  return all;
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const m: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(0),
  );
  for (let i = 0; i < rows; i++) m[i][0] = i;
  for (let j = 0; j < cols; j++) m[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + cost,
      );
    }
  }
  return m[rows - 1][cols - 1];
}

function buildIndex(books: Book[]): Map<string, Set<number>> {
  const idx = new Map<string, Set<number>>();
  for (const b of books) {
    const words = (b.title + " " + b.author).toLowerCase().split(/\s+/);
    for (const w of words) {
      for (const d of generateDeletes(w, MAX_DIST)) {
        if (!idx.has(d)) idx.set(d, new Set());
        idx.get(d)!.add(b.id);
      }
    }
  }
  return idx;
}

const INDEX = buildIndex(BOOKS);

function searchBooks(query: string): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return BOOKS.map((book) => ({ book, distance: -1 }));
  const qWords = trimmed.split(/\s+/);
  const candidateIds = new Set<number>();
  for (const qw of qWords) {
    for (const d of generateDeletes(qw, MAX_DIST)) {
      const ids = INDEX.get(d);
      if (ids) ids.forEach((id) => candidateIds.add(id));
    }
  }
  return Array.from(candidateIds)
    .map((id) => {
      const book = BOOKS.find((b) => b.id === id)!;
      const bookWords = (book.title + " " + book.author)
        .toLowerCase()
        .split(/\s+/);
      const distance = Math.min(
        ...qWords.flatMap((qw) =>
          bookWords.map((bw) => levenshteinDistance(qw, bw)),
        ),
      );
      return { book, distance };
    })
    .filter((r) => r.distance <= MAX_DIST)
    .sort((a, b) => a.distance - b.distance);
}




const App = () => {
  const [query, setQuery] = useState("orwel");
  const results = useMemo(() => searchBooks(query), [query]);

  return (
    <div
      className="min-h-screen bg-[#F7F6F2] font-bold text-[#f7f5f2]"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <div
        style={{ backgroundImage: "url('/images (15).png')" }}
        className="max-w-3xl border border-gray-300  mx-auto px-6 py-16"
      >
        <header className="text-center mb-12">
          <div
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "Georgia, 'Lora', serif" }}
          >
            Margin<span className="text-[#dabbbb]">alia</span>
          </div>
          <p className="text-sm text-[#f5ead7] mt-2 flex flex-col">
            <span>a small catalog of novels &amp; psychology</span>
            <span> search even with a typo</span>
          </p>
        </header>

        <div className="bg-amber-200/80 p-2">
          <div className="max-w-md mx-auto border-b-2 border-[#201f1c] mb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='try "orwel" or "kahneman"'
              className="w-full bg-transparent outline-none py-2 text-lg text-black font-bold italic"
              style={{ fontFamily: "Georgia, 'Lora', serif" }}
            />
          </div>
          <p className="text-center text-xs text-[#2e2c28] mb-5 flex flex-col">
            <span> fuzzy search runs entirely in your browser</span>
            <span>try misspelling a title or author</span>
          </p>
        </div>

        <p className="text-sm text-[#6B6459] mb-4">
          {query.trim()
            ? `${results.length} result${results.length === 1 ? "" : "s"}`
            : `${BOOKS.length} books in the catalog`}
        </p>

        {results.length === 0 ? (
          <div className="text-center py-16 text-[#6B6459]">
            <p
              className="text-lg mb-1"
              style={{ fontFamily: "Georgia, 'Lora', serif", color: "#211D18" }}
            >
              Nothing on the shelf for that one.
            </p>
            <p className="text-sm">Try a different title or author.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map(({ book, distance }) => (
              <div
                key={book.id}
                className="bg-[#f5e5a7] p-5 border-r-[3px]"
                style={{
                  borderColor:
                    book.category === "psychology" ? "#33544A" : "#7A2E2E",
                }}
              >
                <div className="flex justify-between items-baseline gap-3 mb-1.5">
                  <span
                    className="font-semibold text-zinc-800 text-[17px] leading-snug"
                    style={{ fontFamily: "Georgia, 'Lora', serif" }}
                  >
                    {book.title}
                  </span>
                  <span className="text-xs w-fit h-fit border border-zinc-700 p-0.5 text-[#6B6459] whitespace-nowrap">
                    {book.price}
                  </span>
                </div>
                <p className="italic text-[#6d1f59] border w-fit h-fit p-1 text-sm mb-2.5">
                  {book.author}
                </p>
                <p className="text-[13.5px] text-zinc-800 leading-relaxed opacity-85 mb-3">
                  {book.desc}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] tracking-wider uppercase text-[#6B6459]">
                    {book.category}
                  </span>
                  {distance > 0 && (
                    <span className="text-[10.5px] font-mono text-[#7A2E2E]">
                      typo match · d={distance}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
