import {
  Modal,
  Tabs,
  TextInput,
  MultiSelect,
  Box,
  Group,
  Button,
  Divider,
  Badge,
  Avatar,
  Text,
  ScrollArea as MantineScrollArea,
  Radio,
} from "@mantine/core";
import { IconUser, IconUsers, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface NewChatModalProps {
  opened: boolean;
  onClose: () => void;
  users: User[];
  onCreatePrivateChat: (userId: string) => void;
  onCreateGroupChat: (groupName: string, userIds: string[]) => void;
}

const NewChatModal = ({
  opened,
  onClose,
  users,
  onCreatePrivateChat,
  onCreateGroupChat,
}: NewChatModalProps) => {
  const [activeTab, setActiveTab] = useState<"private" | "group">("private");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChat = () => {
    if (activeTab === "private" && selectedUser) {
      onCreatePrivateChat(selectedUser);
    } else if (activeTab === "group" && groupName && selectedUsers.length > 0) {
      onCreateGroupChat(groupName, selectedUsers);
    }
    onClose();
    setSelectedUser(null);
    setGroupName("");
    setSelectedUsers([]);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="New Chat" size="lg">
      <Tabs
        value={activeTab}
        onTabChange={(value) => setActiveTab(value as "private" | "group")}
      >
        <Tabs.List>
          <Tabs.Tab value="private" icon={<IconUser size="0.8rem" />}>
            Private Chat
          </Tabs.Tab>
          <Tabs.Tab value="group" icon={<IconUsers size="0.8rem" />}>
            Group Chat
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="private" pt="xs">
          <TextInput
            placeholder="Search users..."
            icon={<IconSearch size="0.8rem" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
          />

          <Radio.Group
            value={selectedUser ?? undefined}
            onChange={setSelectedUser}
            name="private-user"
          >
            <MantineScrollArea style={{ height: 300 }}>
              {filteredUsers.map((user) => (
                <Radio
                  key={user.id}
                  value={user.id}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar size="sm" radius="xl" src={user.avatar} mr="sm">
                        {user.name.charAt(0)}
                      </Avatar>
                      <Text>{user.name}</Text>
                    </Box>
                  }
                  sx={{ marginBottom: 8 }}
                />
              ))}
            </MantineScrollArea>
          </Radio.Group>
        </Tabs.Panel>

        <Tabs.Panel value="group" pt="xs">
          <TextInput
            label="Group Name"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.currentTarget.value)}
            mb="md"
          />

          <MultiSelect
            label="Select Members"
            data={users.map((user) => ({ value: user.id, label: user.name }))}
            value={selectedUsers}
            onChange={setSelectedUsers}
            placeholder="Search users..."
            searchable
            clearable
            nothingFound="No users found"
            mb="md"
          />

          {selectedUsers.length > 0 && (
            <Box mb="md">
              <Text size="sm" weight={500} mb="xs">
                Selected Members ({selectedUsers.length})
              </Text>
              <Group spacing="xs">
                {users
                  .filter((user) => selectedUsers.includes(user.id))
                  .map((user) => (
                    <Badge
                      key={user.id}
                      leftSection={
                        <Avatar size={18} mr={5} src={user.avatar}>
                          {user.name.charAt(0)}
                        </Avatar>
                      }
                      variant="outline"
                    >
                      {user.name}
                    </Badge>
                  ))}
              </Group>
            </Box>
          )}
        </Tabs.Panel>
      </Tabs>

      <Divider my="md" />

      <Group position="right">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateChat}
          disabled={
            (activeTab === "private" && !selectedUser) ||
            (activeTab === "group" &&
              (!groupName || selectedUsers.length === 0))
          }
        >
          Create Chat
        </Button>
      </Group>
    </Modal>
  );
};

export default NewChatModal;
