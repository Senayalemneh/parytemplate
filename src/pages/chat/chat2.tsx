import { useState, useEffect, useRef } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Indicator,
  Input,
  Menu,
  Modal,
  MultiSelect,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import {
  getUserConversations,
  getConversationMessages,
  getAllUsers,
  createPrivateConversation,
  createGroupConversation,
  addGroupParticipants,
  sendConversationMessage,
} from "../../services/api/main";

import NewChatModal from "./components/NewChatModal";
import {
  IconUsers,
  IconChevronDown,
  IconDots,
  IconSend,
} from "@tabler/icons-react";
import AddParticipantsModal from "./components/AddParticipant";

interface ConvUser {
  id: string | number;
  name: string;
  avatar?: string;
  active_status?: string | number;
}

interface ConvMessage {
  id: string | number;
  body: string;
  created_at: string;
}

interface Conv {
  id: string | number;
  is_group?: string | number;
  name?: string;
  users?: ConvUser[];
  messages?: ConvMessage[];
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
}

interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Chat {
  id: string;
  type: "private" | "group";
  participants: User[];
  messages: Message[];
  name?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export const ChatApp = () => {
  const currentUserId = 1;
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllUsers().then((userList) => {
      setUsers(
        userList.map(
          (u: {
            id: string | number;
            name: string;
            avatar?: string;
            active_status?: string | number;
          }): User => ({
            id: String(u.id),
            name: u.name,
            avatar: u.avatar || "",
            status: u.active_status === "1" ? "online" : "offline",
          })
        )
      );
    });

    // Fetch conversations
    getUserConversations(currentUserId).then((convs) => {
      setChats(
        (convs as Conv[]).map((conv: Conv) => ({
          id: String(conv.id),
          type:
            conv.is_group === "1" || conv.is_group === 1 ? "group" : "private",
          name: conv.name,
          participants: Array.isArray(conv.users)
            ? conv.users.map((u: ConvUser) => ({
                id: String(u.id),
                name: u.name,
                avatar: u.avatar || "",
                status: u.active_status === "1" ? "online" : "offline",
              }))
            : [],
          messages: [],
          lastMessage:
            Array.isArray(conv.messages) && conv.messages.length > 0
              ? conv.messages[conv.messages.length - 1].body
              : "",
          lastMessageTime:
            Array.isArray(conv.messages) && conv.messages.length > 0
              ? new Date(conv.messages[conv.messages.length - 1].created_at)
              : undefined,
          unreadCount: 0,
        }))
      );
      if (convs.length > 0) setActiveChat(String(convs[0].id));
    });
  }, []);

  // Fetch messages for the active chat
  useEffect(() => {
    if (!activeChat) return;
    getConversationMessages(Number(activeChat), currentUserId).then((res) => {
      const msgs = Array.isArray(res.data) ? res.data : [];
      setChats((prevChats: Chat[]) =>
        prevChats.map((chat: Chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: msgs.map(
                  (msg: {
                    id: string | number;
                    user: {
                      id: string | number;
                      name: string;
                      avatar?: string;
                      active_status?: string | number;
                    };
                    body: string;
                    created_at: string;
                  }): Message => ({
                    id: String(msg.id),
                    sender: {
                      id: String(msg.user.id),
                      name: msg.user.name,
                      avatar: msg.user.avatar || "",
                      status:
                        msg.user.active_status === "1" ? "online" : "offline",
                    },
                    content: msg.body,
                    timestamp: new Date(msg.created_at),
                    isOwn: String(msg.user.id) === String(currentUserId),
                  })
                ),
              }
            : chat
        )
      );
    });
  }, [activeChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, chats]);

  // Send message handler
  const handleSendMessage = () => {
    if (!message.trim() || !activeChat) return;
    sendConversationMessage(Number(activeChat), {
      user_id: currentUserId,
      body: message,
      type: "text",
    }).then(() => {
      getConversationMessages(Number(activeChat), currentUserId).then((res) => {
        const msgs = Array.isArray(res.data) ? res.data : [];
        setChats((prevChats: Chat[]) =>
          prevChats.map(
            (chat: Chat): Chat =>
              chat.id === activeChat
                ? {
                    ...chat,
                    messages: msgs.map(
                      (msg: {
                        id: string | number;
                        user: {
                          id: string | number;
                          name: string;
                          avatar?: string;
                          active_status?: string | number;
                        };
                        body: string;
                        created_at: string;
                      }): Message => ({
                        id: String(msg.id),
                        sender: {
                          id: String(msg.user.id),
                          name: msg.user.name,
                          avatar: msg.user.avatar || "",
                          status:
                            msg.user.active_status === "1"
                              ? "online"
                              : "offline",
                        },
                        content: msg.body,
                        timestamp: new Date(msg.created_at),
                        isOwn: String(msg.user.id) === String(currentUserId),
                      })
                    ),
                    lastMessage:
                      msgs.length > 0 ? msgs[msgs.length - 1].body : "",
                    lastMessageTime:
                      msgs.length > 0
                        ? new Date(msgs[msgs.length - 1].created_at)
                        : undefined,
                    unreadCount: 0,
                  }
                : chat
          )
        );
        setMessage("");
      });
    });
  };

  // Create private chat handler
  const handleCreatePrivateChat = (userId: string) => {
    createPrivateConversation({
      user_id: currentUserId,
      user_ids: [Number(userId)],
    }).then((conv) => {
      getUserConversations(currentUserId).then((convs) => {
        setChats(
          (convs as Conv[]).map((conv: Conv) => ({
            id: String(conv.id),
            type:
              conv.is_group === "1" || conv.is_group === 1
                ? "group"
                : "private",
            name: conv.name,
            participants: Array.isArray(conv.users)
              ? conv.users.map((u: ConvUser) => ({
                  id: String(u.id),
                  name: u.name,
                  avatar: u.avatar || "",
                  status: u.active_status === "1" ? "online" : "offline",
                }))
              : [],
            messages: [],
            lastMessage:
              Array.isArray(conv.messages) && conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].body
                : "",
            lastMessageTime:
              Array.isArray(conv.messages) && conv.messages.length > 0
                ? new Date(conv.messages[conv.messages.length - 1].created_at)
                : undefined,
            unreadCount: 0,
          }))
        );
        setActiveChat(String(conv.id));
      });
    });
  };

  const handleCreateGroupChat = (name: string, userIds: string[]) => {
    const allUserIds = [
      currentUserId,
      ...userIds.map((id) => Number(id)).filter((id) => id !== currentUserId),
    ];
    createGroupConversation({
      user_id: currentUserId,
      user_ids: allUserIds,
      is_group: true,
      name,
      description: "",
    }).then((conv) => {
      getUserConversations(currentUserId).then((convs) => {
        setChats(
          convs.map((conv: any) => ({
            id: String(conv.id),
            type:
              conv.is_group === "1" || conv.is_group === 1
                ? "group"
                : "private",
            name: conv.name,
            participants: Array.isArray(conv.users)
              ? conv.users.map((u: any) => ({
                  id: String(u.id),
                  name: u.name,
                  avatar: u.avatar || "",
                  status: u.active_status === "1" ? "online" : "offline",
                }))
              : [],
            messages: [],
            lastMessage:
              Array.isArray(conv.messages) && conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].body
                : "",
            lastMessageTime:
              Array.isArray(conv.messages) && conv.messages.length > 0
                ? new Date(conv.messages[conv.messages.length - 1].created_at)
                : undefined,
            unreadCount: 0,
          }))
        );
        setActiveChat(String(conv.id));
      });
    });
  };

  const handleAddParticipants = () => {
    if (!activeChat || selectedParticipants.length === 0) return;
    addGroupParticipants(Number(activeChat), {
      user_id: currentUserId,
      user_ids: selectedParticipants.map(Number),
    }).then(() => {
      getUserConversations(currentUserId).then((convs) => {
        setChats(
          convs.map((conv: any) => ({
            id: String(conv.id),
            type:
              conv.is_group === "1" || conv.is_group === 1
                ? "group"
                : "private",
            name: conv.name,
            participants: Array.isArray(conv.users)
              ? conv.users.map((u: any) => ({
                  id: String(u.id),
                  name: u.name,
                  avatar: u.avatar || "",
                  status: u.active_status === "1" ? "online" : "offline",
                }))
              : [],
            messages: [],
            lastMessage:
              Array.isArray(conv.messages) && conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].body
                : "",
            lastMessageTime:
              Array.isArray(conv.messages) && conv.messages.length > 0
                ? new Date(conv.messages[conv.messages.length - 1].created_at)
                : undefined,
            unreadCount: 0,
          }))
        );
      });
      setAddParticipantModalOpen(false);
      setSelectedParticipants([]);
      setParticipantSearch("");
    });
  };

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
    <Flex gap="md" align="stretch" style={{ height: "80vh" }}>
      {/* Sidebar */}
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

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChat ? (
          <>
            {/* Chat header */}
            <Group position="apart" sx={{ padding: "16px 0" }}>
              <Group>
                {getChatAvatar(chats.find((c) => c.id === activeChat)!)}
                <div>
                  <Text weight={500}>
                    {getChatName(chats.find((c) => c.id === activeChat)!)}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {chats.find((c) => c.id === activeChat)?.type === "private"
                      ? ""
                      : `${
                          chats.find((c) => c.id === activeChat)?.participants
                            .length
                        } members`}
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
                  {chats.find((c) => c.id === activeChat)?.type === "group" && (
                    <Menu.Item onClick={() => setAddParticipantModalOpen(true)}>
                      Add participants
                    </Menu.Item>
                  )}
                  <Menu.Item color="red">Delete chat</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
            {/* Chat messages */}
            <Box sx={{ flex: 1, overflow: "auto", marginBottom: 16 }}>
              <ScrollArea style={{ height: "100%" }} offsetScrollbars>
                {chats
                  .find((c) => c.id === activeChat)
                  ?.messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={(theme) => ({
                        display: "flex",
                        justifyContent: msg.isOwn ? "flex-end" : "flex-start",
                        marginBottom: theme.spacing.xs,
                      })}
                    >
                      {!msg.isOwn && (
                        <Avatar
                          size="sm"
                          radius="xl"
                          src={msg.sender.avatar}
                          mr="sm"
                        >
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
            {/* Chat input */}
            <Group>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                sx={{ flex: 1 }}
              />
              <Button
                onClick={handleSendMessage}
                leftIcon={<IconSend size="1rem" />}
              >
                Send
              </Button>
            </Group>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Text color="dimmed">Select a chat to start messaging</Text>
          </Box>
        )}
      </Box>
      {/* Modal */}
      <NewChatModal
        opened={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        users={users.filter((u) => u.id !== String(currentUserId))}
        onCreatePrivateChat={handleCreatePrivateChat}
        onCreateGroupChat={handleCreateGroupChat}
      />
      {/* Add Participants Modal */}

      <AddParticipantsModal
        opened={addParticipantModalOpen}
        onClose={() => setAddParticipantModalOpen(false)}
        users={users.filter((u) => u.id !== String(currentUserId))}
        chats={chats}
        activeChat={activeChat}
        currentUserId={currentUserId}
        selectedParticipants={selectedParticipants}
        setSelectedParticipants={setSelectedParticipants}
        participantSearch={participantSearch}
        setParticipantSearch={setParticipantSearch}
        handleAddParticipants={handleAddParticipants}
      />
    </Flex>
  );
};
