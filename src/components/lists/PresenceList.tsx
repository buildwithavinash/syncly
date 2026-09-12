type PresenceUser = {
  userId: string;
  name: string;
};

type PresenceListProps = {
  onlineUsers: PresenceUser[];
};

const PresenceList = ({
  onlineUsers,
}: PresenceListProps) => {
  return (
    <section>
      <h2>Currently Viewing</h2>

      {onlineUsers.length === 0 ? (
        <p>
          No one is currently viewing this list.
        </p>
      ) : (
        <ul>
          {onlineUsers.map((onlineUser) => (
            <li key={onlineUser.userId}>
              🟢 {onlineUser.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PresenceList;