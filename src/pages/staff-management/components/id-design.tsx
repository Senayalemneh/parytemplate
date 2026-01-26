import React, { useRef, useState } from "react";
import {
  Card,
  Avatar,
  Text,
  Group,
  Divider,
  Badge,
  Box,
  Image,
  useMantineTheme,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconPhone,
  IconMail,
  IconUser,
  IconCalendar,
  IconId,
  IconMapPin,
  IconSchool,
  IconStar,
  IconDownload,
  IconShield,
  IconFingerprint,
} from "@tabler/icons-react";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";

interface Role {
  id: number;
  role_key: string;
  name: {
    en: string;
    am: string;
  };
  description: string;
}

interface Woreda {
  id: number;
  name: {
    en: string;
    am: string;
  };
  subcity_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ParsedSubcity {
  id: number;
  name: {
    en: string;
    am: string;
  };
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  woreda_id: number;
  subcity_id: number;
  created_at: string;
  updated_at: string;
  avatar: string | null;
}

interface UserIDCardProps {
  user: any;
  role?: Role;
  woreda?: Woreda;
  subcity?: ParsedSubcity;
  profile_picture?: any;
}

const ProfessionalIDCard: React.FC<UserIDCardProps> = ({
  user,
  role,
  subcity,
}) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const primaryColor = theme.colors.blue[6];
  const idNumber = user.id.toString().padStart(8, "0");
  const qrValue = `${window.location.origin}/id-card/${user.id}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#f8fafc",
        scale: 3,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `Professional_ID_${user.full_name.replace(
        /\s+/g,
        "_"
      )}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col items-center p-4">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      <Card
        ref={cardRef}
        shadow="xl"
        radius="md"
        withBorder
        className="w-full max-w-md relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)",
          borderTop: `6px solid ${primaryColor}`,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Security elements */}
        <Box className="absolute inset-0 opacity-5 pointer-events-none">
          <IconShield
            size={300}
            className="text-blue-200 absolute -right-20 -top-20"
          />
          <IconFingerprint
            size={250}
            className="text-blue-200 absolute -left-20 -bottom-20"
          />
        </Box>

        {/* Header */}
        <Group position="apart" align="center" className="mb-4">
          <Image
            src="/1744355305_boleprosperity.png"
            alt={t("professionalIdCard.organizationLogoAlt")}
            width={70}
            height={70}
            className="rounded-lg"
          />
          <Box className="text-right">
            <Text size="xs" color="dimmed" className="uppercase tracking-wider">
              {t("professionalIdCard.idLabel")}
            </Text>
            <Text size="lg" weight={700} className="text-blue-600 font-mono">
              {idNumber}
            </Text>
          </Box>
        </Group>

        {/* Organization title */}
        <Box className="text-center mb-4">
          <Text
            size="xl"
            weight={800}
            className="text-blue-800 uppercase tracking-wider"
          >
            {t("professionalIdCard.organizationName")}
          </Text>
          <Text size="xs" color="dimmed" className="uppercase">
            {t("professionalIdCard.organizationSlogan")}
          </Text>
        </Box>

        <Divider
          className="my-3"
          color={theme.colorScheme === "dark" ? "dark.3" : "blue.2"}
          variant="dashed"
        />

        {/* Main content */}
        <Group position="apart" align="flex-start" className="mb-4">
          <Group spacing="sm">
            <Avatar
              size={100}
              radius="md"
              color="blue"
              className="border-4 border-blue-100 shadow-sm"
              src={
                user.user?.avatar
                  ? `${import.meta.env.VITE_FILE_API}${user.user.avatar}`
                  : undefined
              }
            >
              {!user.user?.avatar &&
                user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
            </Avatar>
            <Box>
              <Text weight={800} size="lg" className="uppercase tracking-wide">
                {user.full_name}
              </Text>
              <Text size="sm" color="dimmed" className="capitalize">
                {role?.name.en || t("professionalIdCard.noRole")}
              </Text>
              <Badge
                color="teal"
                variant="filled"
                leftSection={<IconStar size={12} />}
                className="mt-2"
                radius="sm"
              >
                {user.type}
              </Badge>
            </Box>
          </Group>
          <Box className="flex flex-col items-end">
            <Badge
              color="blue"
              variant="outline"
              leftSection={<IconId size={12} />}
              className="mb-2"
            >
              {user.rank}
            </Badge>
            <QRCode
              value={qrValue}
              size={80}
              level="H"
              bgColor="transparent"
              fgColor={primaryColor}
            />
          </Box>
        </Group>

        <Divider className="my-3" />

        {/* Details grid */}
        <Box className="grid grid-cols-2 gap-4 mb-4">
          <Group spacing="xs" noWrap>
            <IconUser size={18} className="text-blue-600 flex-shrink-0" />
            <Text size="sm">
              <span className="font-semibold">
                {t("professionalIdCard.genderLabel")}:
              </span>{" "}
              {user.gender}
            </Text>
          </Group>

          <Group spacing="xs" noWrap>
            <IconCalendar size={18} className="text-blue-600 flex-shrink-0" />
            <Text size="sm">
              <span className="font-semibold">
                {t("professionalIdCard.ageLabel")}:
              </span>{" "}
              {user.age}
            </Text>
          </Group>

          <Group spacing="xs" noWrap>
            <IconPhone size={18} className="text-blue-600 flex-shrink-0" />
            <Text size="sm">
              <span className="font-semibold">
                {t("professionalIdCard.phoneLabel")}:
              </span>{" "}
              {user.phone_number}
            </Text>
          </Group>

          <Group spacing="xs" noWrap>
            <IconMail size={18} className="text-blue-600 flex-shrink-0" />
            <Text size="sm">
              <span className="font-semibold">
                {t("professionalIdCard.emailLabel")}:
              </span>{" "}
              {user.user?.email}
            </Text>
          </Group>

          <Group spacing="xs" noWrap>
            <IconSchool size={18} className="text-blue-600 flex-shrink-0" />
            <Text size="sm">
              <span className="font-semibold">
                {t("professionalIdCard.educationLabel")}:
              </span>{" "}
              {user.education_level}
            </Text>
          </Group>

          <Group spacing="xs" noWrap>
            <IconMapPin size={18} className="text-blue-600 flex-shrink-0" />
            <Text size="sm">
              <span className="font-semibold">
                {t("professionalIdCard.locationLabel")}:
              </span>{" "}
              {subcity?.name.en || t("professionalIdCard.notAvailable")}
            </Text>
          </Group>
        </Box>

        <Divider className="my-3" />

        {/* Footer */}
        <Group position="apart" className="text-xs">
          <Box className="text-center">
            <Text weight={700} className="uppercase text-blue-600">
              {t("professionalIdCard.issuedLabel")}
            </Text>
            <Text>
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Box>

          <Box className="text-center">
            <Text weight={700} className="uppercase text-blue-600">
              {t("professionalIdCard.validUntilLabel")}
            </Text>
            <Text>
              {new Date(
                new Date(user.created_at).setFullYear(
                  new Date(user.created_at).getFullYear() + 2
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
        <Text size="xs" color="dimmed" className="text-center mt-4 italic">
          {t("professionalIdCard.securityNotice")}
        </Text>
      </Card>

      <Tooltip
        label={t("professionalIdCard.downloadTooltip")}
        position="bottom"
        withArrow
      >
        <ActionIcon
          variant="filled"
          color="blue"
          size="xl"
          radius="xl"
          className="mt-6 shadow-md"
          onClick={handleDownload}
          loading={loading}
        >
          <IconDownload size={24} />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
};

export default ProfessionalIDCard;
