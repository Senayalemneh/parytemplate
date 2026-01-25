import { useState, useEffect } from "react";
import { Box, Text, Loader, Center } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ChatApp } from "./chat2";

const ChatPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <Box sx={{ height: "00vh", width: "100%" }}>
      {isLoading && (
        <Center sx={{ height: "100%", flexDirection: "column" }}>
          <Loader size="xl" variant="dots" />
          <Text mt="md" color="dimmed">
            {t("chat.loading")}
          </Text>
        </Center>
      )}
      <ChatApp />
    </Box>
  );
};

export default ChatPage;
