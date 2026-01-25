import {
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Box,
  Avatar,
  LoadingOverlay,
  Alert,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconLock,
  IconUser,
  IconMail,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { passwordReset } from "../../services/api/main";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

interface UserData {
  id: number;
  name: string;
  email: string;
  roleId: number;
  woredaId: number | null;
  subcityId: number | null;
}

export default function PasswordResetPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get user data from localStorage
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  ) as UserData;

  const form = useForm({
    initialValues: {
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    validate: {
      old_password: (value) =>
        value.length >= 8 ? null : t("profile.passwordValidation"),
      new_password: (value) =>
        value.length >= 8 ? null : t("profile.passwordValidation"),
      new_password_confirmation: (value, values) =>
        value === values.new_password
          ? null
          : t("profile.passwordMatchValidation"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await passwordReset(currentUser.id, {
        old_password: values.old_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      });

      if (response.success) {
        setSuccess(true);
        notifications.show({
          title: t("profile.successTitle"),
          message: t("profile.successMessage"),
          color: "teal",
          withBorder: true,
        });
        form.reset();
      } else {
        setError(response.message || t("profile.updateFailed"));
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(t("profile.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="md" pos="relative">
      <LoadingOverlay visible={loading} overlayBlur={2} />

      <Card withBorder shadow="sm" mb="md">
        <Group position="apart">
          <Title order={2}>{t("profile.resetPasswordTitle")}</Title>
        </Group>
      </Card>

      <Card withBorder shadow="sm">
        <Box sx={{ textAlign: "center", marginBottom: "24px" }}>
          <Avatar
            size="xl"
            radius="50%"
            color="blue"
            sx={{ margin: "0 auto 16px" }}
          >
            <IconLock size={40} />
          </Avatar>
          <Text color="dimmed">{t("profile.updatePasswordMessage")}</Text>
        </Box>

        {error && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            title={t("profile.errorTitle")}
            color="red"
            mb="md"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            icon={<IconCheck size={18} />}
            title={t("profile.successTitle")}
            color="teal"
            mb="md"
            withCloseButton
            onClose={() => setSuccess(false)}
          >
            {t("profile.successMessage")}
          </Alert>
        )}

        <Box mb="md" p="md" sx={{ background: "#f8f9fa", borderRadius: "8px" }}>
          <Group spacing="sm" mb="sm">
            <IconUser size={18} color="#495057" />
            <Text size="sm" color="dimmed">
              {t("profile.nameLabel")}:{" "}
              {currentUser?.name || t("profile.notAvailable")}
            </Text>
          </Group>
          <Group spacing="sm">
            <IconMail size={18} color="#495057" />
            <Text size="sm" color="dimmed">
              {t("profile.emailLabel")}:{" "}
              {currentUser?.email || t("profile.notAvailable")}
            </Text>
          </Group>
        </Box>

        <Divider my="md" />

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <PasswordInput
            label={t("profile.currentPasswordLabel")}
            placeholder={t("profile.currentPasswordPlaceholder")}
            icon={<IconLock size={16} />}
            required
            mb="md"
            {...form.getInputProps("old_password")}
          />

          <PasswordInput
            label={t("profile.newPasswordLabel")}
            placeholder={t("profile.newPasswordPlaceholder")}
            icon={<IconLock size={16} />}
            required
            mb="md"
            {...form.getInputProps("new_password")}
            description={t("profile.passwordDescription")}
          />

          <PasswordInput
            label={t("profile.confirmPasswordLabel")}
            placeholder={t("profile.confirmPasswordPlaceholder")}
            icon={<IconLock size={16} />}
            required
            mb="xl"
            {...form.getInputProps("new_password_confirmation")}
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            variant="filled"
            disabled={loading}
          >
            {t("profile.updateButton")}
          </Button>
        </form>
      </Card>
    </Box>
  );
}
