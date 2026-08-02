import type { CopyBlock, ListBlock } from "@/config/site";

interface ChapterProps {
  block: CopyBlock | ListBlock;
  id: string;
}

function isList(block: CopyBlock | ListBlock): block is ListBlock {
  return "points" in block && Array.isArray(block.points);
}

/**
 * One chapter of the story arc. Optional capability register shown as a
 * matte two-column list — no cards, no chrome.
 */
export function Chapter({ block, id }: ChapterProps) {
  return (
    <section
      id={id}
      className="relative flex min-h-[80svh] flex-col justify-center px-6 py-24 md:px-12 max-w-4xl"
    >
      <p className="mono text-akal-muted">{block.kicker}</p>

      <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
        {block.title}
      </h2>

      <p className="mt-6 max-w-xl text-lg text-akal-muted">{block.body}</p>

      {isList(block) && (
        <ul className="mt-12 grid max-w-2xl gap-x-10 gap-y-3 sm:grid-cols-2">
          {block.points.map((point) => (
            <li
              key={point}
              className="flex items-baseline gap-3 text-sm text-akal-muted"
            >
              <span aria-hidden="true" className="text-akal-accent">
                —
              </span>
              {point}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
