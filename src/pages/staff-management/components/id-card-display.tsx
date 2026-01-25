import { useParams } from "react-router-dom";
import {
  Card,
  Text,
  Group,
  Avatar,
  Badge,
  Box,
  Stack,
  Divider,
  LoadingOverlay,
  Image,
  useMantineTheme,
} from "@mantine/core";
import {
  IconUser,
  IconId,
  IconMail,
  IconStar,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconSchool,
  IconShield,
  IconFingerprint,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getUserAccountsById } from "../../../services/api/main";
import { useTranslation } from "react-i18next";
import Logo from "../../../assets/BoleLogo.png"

export default function IDCardDisplay() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useMantineTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserAccountsById(id);
        if (response.success) {
          setUserData(response.data);
        } else {
          setError(t("idCard.invalidId"));
        }
      } catch (err) {
        setError(err.message || t("idCard.fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, t]);

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  if (error || !userData) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <Text size="xl" weight={500}>
          {error || t("idCard.invalidId")}
        </Text>
      </Box>
    );
  }

  const idNumber = userData.id.toString().padStart(6, "0");
  const currentYear = new Date().getFullYear();

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-gray-50">
      <Card
        shadow="xl"
        radius="lg"
        withBorder
        className="w-full max-w-md relative overflow-hidden border-2 border-blue-200"
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        }}
      >
        {/* Watermark background */}
        <Box className="absolute inset-0 opacity-5">
          <IconShield
            size={400}
            className="text-blue-300 absolute -right-20 -top-20"
          />
          <IconFingerprint
            size={350}
            className="text-blue-300 absolute -left-20 -bottom-20"
          />
        </Box>

        {/* Header with logo */}
        <Group position="apart" align="center" className="mb-2">
          <Image
            src={Logo}
            alt="Organization Logo"
            width={60}
            height={60}
            className="rounded-full border-2 border-blue-200"
          />
          <Box className="text-right">
            <Text size="xs" color="dimmed" className="uppercase tracking-wider">
              {t("idCard.idLabel")}
            </Text>
            <Text size="lg" weight={700} className="text-blue-600 font-mono">
              {idNumber}
            </Text>
          </Box>
        </Group>

        {/* Organization name */}
        <Box className="text-center mb-4">
          <Text
            size="xl"
            weight={800}
            className="text-blue-800 uppercase tracking-wider"
          >
            {t("idCard.organizationName")}
          </Text>
          <Text size="xs" color="dimmed" className="uppercase">
            {t("idCard.organizationSlogan")}
          </Text>
        </Box>

        <Divider
          className="my-3"
          color={theme.colorScheme === "dark" ? "dark.3" : "blue.2"}
          variant="dashed"
        />

        {/* User info section */}
        <Group position="apart" align="flex-start" className="mb-4">
          <Group spacing="sm">
            <Avatar
              size={100}
              radius="md"
              color="blue"
              className="border-4 border-blue-100 shadow-sm"
              src={
                userData.user?.avatar
                  ? `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${userData.user.avatar}`
                  : undefined
              }
            >
              {!userData.user?.avatar &&
                userData.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
            </Avatar>
            <Box>
              <Text weight={800} size="lg" className="uppercase tracking-wide">
                {userData.full_name}
              </Text>
              <Text size="sm" color="dimmed" className="capitalize">
                {userData.responsibility}
              </Text>
              {userData.type && (
                <Badge
                  color="teal"
                  variant="filled"
                  leftSection={<IconStar size={12} />}
                  className="mt-2"
                  radius="sm"
                >
                  {userData.type}
                </Badge>
              )}
            </Box>
          </Group>
        </Group>

        {/* Detailed info section */}
        <Box className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
          <Stack spacing="xs">
            <Group spacing="xs" noWrap>
              <IconUser size={18} className="text-blue-600 flex-shrink-0" />
              <Text size="sm">
                <span className="font-semibold">
                  {t("idCard.genderLabel")}:
                </span>{" "}
                {userData.gender}
              </Text>
            </Group>

            <Group spacing="xs" noWrap>
              <IconCalendar size={18} className="text-blue-600 flex-shrink-0" />
              <Text size="sm">
                <span className="font-semibold">{t("idCard.ageLabel")}:</span>{" "}
                {userData.age}
              </Text>
            </Group>

            <Group spacing="xs" noWrap>
              <IconPhone size={18} className="text-blue-600 flex-shrink-0" />
              <Text size="sm">
                <span className="font-semibold">{t("idCard.phoneLabel")}:</span>{" "}
                {userData.phone_number}
              </Text>
            </Group>

            <Group spacing="xs" noWrap>
              <IconMail size={18} className="text-blue-600 flex-shrink-0" />
              <Text size="sm">
                <span className="font-semibold">{t("idCard.emailLabel")}:</span>{" "}
                {userData.user?.email}
              </Text>
            </Group>

            <Group spacing="xs" noWrap>
              <IconSchool size={18} className="text-blue-600 flex-shrink-0" />
              <Text size="sm">
                <span className="font-semibold">
                  {t("idCard.educationLabel")}:
                </span>{" "}
                {userData.education_level}
              </Text>
            </Group>
          </Stack>
        </Box>

        {/* Footer with dates */}
        <Group position="apart" className="text-xs mt-4">
          <Box className="text-center">
            <Text weight={700} className="uppercase text-blue-600">
              {t("idCard.issuedLabel")}
            </Text>
            <Text>
              {new Date(userData.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Box>

          <Box className="text-center">
            <Text weight={700} className="uppercase text-blue-600">
              {t("idCard.validUntilLabel")}
            </Text>
            <Text>
              {new Date(
                new Date(userData.created_at).setFullYear(
                  new Date(userData.created_at).getFullYear() + 2
                )
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Box>
        </Group>

        {/* Security footer */}
        <Box className="text-center mt-4">
          <Text size="xs" color="dimmed" className="italic">
            {t("idCard.securityNotice")}
          </Text>
          <Text size="xs" color="dimmed" className="mt-1">
            © {currentYear} {t("idCard.organizationName")}.{" "}
            {t("idCard.allRightsReserved")}
          </Text>
        </Box>
      </Card>
    </Box>
  );
}
