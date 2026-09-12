import { Link } from "react-router";

type ListHeaderProps = {
  listName: string;
};

const ListHeader = ({
  listName,
}: ListHeaderProps) => {
  return (
    <header>
      <Link to="/lists">
        ← Back to My Lists
      </Link>

      <h1>{listName}</h1>
    </header>
  );
};

export default ListHeader;