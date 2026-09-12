import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

type ListHeaderProps = {
  listName: string;
};

const ListHeader = ({ listName }: ListHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 px-2 flex items-center gap-3 border-b border-border bg-bg/90 py-4 backdrop-blur ">
      <Link
        to="/lists"
        aria-label="Back to my lists"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong hover:bg-surface"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <h1 className="truncate font-display text-xl text-ink sm:text-2xl">
        {listName}
      </h1>
    </header>
  );
};

export default ListHeader;