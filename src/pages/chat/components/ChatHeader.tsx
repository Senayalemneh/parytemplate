import { Group, Text, Menu, ActionIcon, Badge, Avatar } from "@mantine/core";
import { IconDots, IconUsers } from "@tabler/icons-react";

// Define Chat and User types here if not imported
type User = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
};

type Chat = {
  id: string;
  type: "private" | "group";
  participants: User[];
  name?: string;
};

const ChatHeader = ({
  chat,
  currentUserId,
  onAddParticipants,
}: {
  chat: Chat;
  currentUserId: string | number;
  onAddParticipants: () => void;
}) => {
  const getChatName = (chat: Chat) => {
    if (chat.type === "group") return chat.name;
    const otherUser = chat.participants.find(
      (u) => u.id !== String(currentUserId)
    );
    return otherUser?.name || "Unknown";
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === "group")
      return (
        <Group spacing={4}>
          <IconUsers size="1rem" />
          <Badge color="gray" size="xs" variant="filled">
            {chat.participants.length}
          </Badge>
        </Group>
      );
    const otherUser = chat.participants.find(
      (u) => u.id !== String(currentUserId)
    );
    return (
      <Avatar size="sm" radius="xl" src={otherUser?.avatar}>
        {otherUser?.name?.charAt(0)}
      </Avatar>
    );
  };

  return (
    <Group position="apart" sx={{ padding: "16px 0" }}>
      <Group>
        {getChatAvatar(chat)}
        <div>
          <Text weight={500}>{getChatName(chat)}</Text>
          <Text size="xs" color="dimmed">
            {chat.type === "private"
              ? ""
              : `${chat.participants.length} members`}
          </Text>
        </div>
      </Group>
      <Menu withinPortal position="bottom-end" shadow="sm">
        <Menu.Target>
          <ActionIcon>
            <IconDots size="1rem" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>View profile</Menu.Item>
          <Menu.Item>Mute notifications</Menu.Item>
          {chat.type === "group" && (
            <Menu.Item onClick={onAddParticipants}>Add participants</Menu.Item>
          )}
          <Menu.Item color="red">Delete chat</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default ChatHeader;
