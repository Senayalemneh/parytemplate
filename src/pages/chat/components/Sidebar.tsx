import {
  Box,
  Group,
  Text,
  Button,
  Divider,
  ScrollArea,
  Avatar,
  Badge,
  Indicator,
} from "@mantine/core";
import { IconChevronDown, IconUsers } from "@tabler/icons-react";

type User = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
};

type Chat = {
  id: string;
  type: "private" | "group";
  participants: User[];
  messages: Message[];
  name?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: Date;
};

const Sidebar = ({
  chats,
  activeChat,
  setActiveChat,
  currentUserId,
  setNewChatModalOpen,
}: {
  chats: Chat[];
  activeChat: string | null;
  setActiveChat: (id: string) => void;
  currentUserId: string | number;
  setNewChatModalOpen: (open: boolean) => void;
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
    <Box
      sx={(theme) => ({
        width: 300,
        background:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
        borderRight: `1px solid ${
          theme.colorScheme === "dark"
            ? theme.colors.dark[5]
            : theme.colors.gray[3]
        }`,
        display: "flex",
        flexDirection: "column",
      })}
    >
      <Group position="apart" p="sm">
        <Text size="lg" weight={500}>
          Chats
        </Text>
        <Button
          variant="light"
          size="xs"
          onClick={() => setNewChatModalOpen(true)}
        >
          New Chat
        </Button>
      </Group>
      <Divider />
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <ScrollArea style={{ height: "100%" }} px="xs">
          {chats.map((chat) => (
            <Box
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                backgroundColor:
                  activeChat === chat.id
                    ? theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0]
                    : "transparent",
                "&:hover": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },
                cursor: "pointer",
                marginBottom: theme.spacing.xs,
              })}
            >
              <Indicator
                size={10}
                offset={5}
                position="bottom-end"
                disabled={chat.type === "group"}
              >
                {getChatAvatar(chat)}
              </Indicator>
              <Box sx={{ flex: 1, marginLeft: 12 }}>
                <Text size="sm" weight={500}>
                  {getChatName(chat)}
                </Text>
                <Text size="xs" color="dimmed" lineClamp={1}>
                  {chat.lastMessage}
                </Text>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <Text size="xs" color="dimmed">
                  {chat.lastMessageTime?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                {chat.unreadCount ? (
                  <Badge color="blue" variant="filled" size="xs" mt={4}>
                    {chat.unreadCount}
                  </Badge>
                ) : null}
              </Box>
            </Box>
          ))}
        </ScrollArea>
      </Box>
      <Divider my="sm" />
      <Group position="center" p="sm">
        <Avatar radius="xl" src="" />
        <Box sx={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            You
          </Text>
          <Text size="xs" color="dimmed">
            Online
          </Text>
        </Box>
        <IconChevronDown size="1rem" />
      </Group>
    </Box>
  );
};

export default Sidebar;
