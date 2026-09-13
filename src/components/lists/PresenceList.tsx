import { formatDisplayText } from "../../lib/formatters";

type PresenceUser = {
  userId: string;
  name: string;
};

type PresenceListProps = {
  onlineUsers: PresenceUser[];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const PresenceList = ({ onlineUsers }: PresenceListProps) => {
  const hasOnlineUsers = onlineUsers.length > 0;

  return (
    <section className="flex flex-wrap items-center gap-3 border-b border-border py-4">
      <span className="flex shrink-0 items-center gap-1.5 text-sm text-slate">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            hasOnlineUsers ? "bg-success" : "bg-border-strong"
          }`}
        />
        {hasOnlineUsers ? `${onlineUsers.length} here now` : "No one else is here"}
      </span>

      {hasOnlineUsers && (
        <div className="flex flex-wrap gap-2">
          {onlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.userId}
              className="flex items-center gap-2 rounded-full border border-border bg-bg py-1 pl-1 pr-3"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-tint text-[10px] font-medium text-accent-ink">
                {getInitials(onlineUser.name)}
              </span>
              <span className="text-xs text-ink">
                {formatDisplayText(onlineUser.name)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PresenceList;