import { Box, ScrollArea, Avatar, Text } from "@mantine/core";

type User = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
};

type Message = {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  isOwn: boolean;
};

const ChatMessages = ({
  messages,
  messagesEndRef,
}: {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  currentUserId: string | number;
}) => (
  <Box sx={{ flex: 1, overflow: "auto", marginBottom: 16 }}>
    <ScrollArea style={{ height: "100%" }} offsetScrollbars>
      {messages.map((msg) => (
        <Box
          key={msg.id}
          sx={(theme) => ({
            display: "flex",
            justifyContent: msg.isOwn ? "flex-end" : "flex-start",
            marginBottom: theme.spacing.xs,
          })}
        >
          {!msg.isOwn && (
            <Avatar size="sm" radius="xl" src={msg.sender.avatar} mr="sm">
              {msg.sender.name.charAt(0)}
            </Avatar>
          )}
          <Box
            sx={(theme) => ({
              maxWidth: "70%",
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.radius.md,
              backgroundColor: msg.isOwn
                ? theme.colorScheme === "dark"
                  ? theme.colors.blue[9]
                  : theme.colors.blue[6]
                : theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[2],
              color: msg.isOwn
                ? theme.white
                : theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.black,
            })}
          >
            {!msg.isOwn && (
              <Text size="xs" weight={700} sx={{ marginBottom: 4 }}>
                {msg.sender.name}
              </Text>
            )}
            <Text>{msg.content}</Text>
            <Text
              size="xs"
              color={msg.isOwn ? "white" : "dimmed"}
              align="right"
              sx={{ marginTop: 4 }}
            >
              {msg.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Box>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </ScrollArea>
  </Box>
);

export default ChatMessages;
