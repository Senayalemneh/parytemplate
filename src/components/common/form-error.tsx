import { Text } from "@mantine/core";

export const CustomInputError = ({ message }: { message?: string }) => {
  return (
    <Text size={"xs"} color="red" pl={3} align="start">
      {message || "Error"}
    </Text>
  );
};
