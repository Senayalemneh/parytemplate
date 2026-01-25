import { Modal, MultiSelect, Group, Button } from "@mantine/core";

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

interface AddParticipantsModalProps {
  opened: boolean;
  onClose: () => void;
  users: User[];
  chats: Chat[];
  activeChat: string | null;
  currentUserId: string | number;
  selectedParticipants: string[];
  setSelectedParticipants: (ids: string[]) => void;
  participantSearch: string;
  setParticipantSearch: (s: string) => void;
  handleAddParticipants: () => void;
}

const AddParticipantsModal = ({
  opened,
  onClose,
  users,
  chats,
  activeChat,
  currentUserId,
  selectedParticipants,
  setSelectedParticipants,
  participantSearch,
  setParticipantSearch,
  handleAddParticipants,
}: AddParticipantsModalProps) => {
  const availableUsers = users
    .filter(
      (u) =>
        u.id !== String(currentUserId) &&
        !chats
          .find((c) => c.id === activeChat)
          ?.participants.some((p) => p.id === u.id) &&
        u.name.toLowerCase().includes(participantSearch.toLowerCase())
    )
    .map((u) => ({
      value: u.id,
      label: u.name,
    }));

  return (
    <Modal opened={opened} onClose={onClose} title="Add Participants" size="md">
      <MultiSelect
        data={availableUsers}
        value={selectedParticipants}
        onChange={setSelectedParticipants}
        placeholder="Select users to add"
        searchable
        searchValue={participantSearch}
        onSearchChange={setParticipantSearch}
        nothingFound="No users found"
        mb="md"
        maxDropdownHeight={500}
        dropdownPosition="bottom"
        styles={{
          dropdown: {
            minHeight: 350,
            maxHeight: 500,
            overflowY: "auto",
          },
          item: {
            minHeight: 48,
            fontSize: 18,
          },
          input: {
            minHeight: 48,
            fontSize: 18,
          },
        }}
      />
      <Group position="right">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleAddParticipants}
          disabled={selectedParticipants.length === 0}
        >
          Add
        </Button>
      </Group>
    </Modal>
  );
};

export default AddParticipantsModal;
