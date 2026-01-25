import { Group, Input, Button } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

const ChatInput = ({
  message,
  setMessage,
  onSend,
}: {
  message: string;
  setMessage: (msg: string) => void;
  onSend: () => void;
}) => (
  <Group>
    <Input
      placeholder="Type a message..."
      value={message}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setMessage(e.currentTarget.value)
      }
      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
        e.key === "Enter" && onSend()
      }
      sx={{ flex: 1 }}
    />
    <Button onClick={onSend} leftIcon={<IconSend size="1rem" />}>
      Send
    </Button>
  </Group>
);

export default ChatInput;
