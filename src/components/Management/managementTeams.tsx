import React, { useEffect, useState } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Avatar,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Space,
  Modal,
  Button,
  Tabs,
  LoadingOverlay,
  Image,
  Box,
} from "@mantine/core";
import {
  IconUser,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconBuilding,
  IconChartLine,
  IconPhoto,
} from "@tabler/icons-react";
import { getTeamMembers } from "../../services/api/main";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader"

interface TeamMember {
  id: string;
  name: {
    en: string;
    am: string;
  };
  position: {
    en: string;
    am: string;
  };
  department: {
    en: string;
    am: string;
  };
  bio: {
    en: string;
    am: string;
  };
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  responsibilities: string[];
  achievements: string[];
}

const ManagementTeamViewer = () => {
  const { t } = useTranslation();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getTeamMembers();

      if (!response) {
        throw new Error(t("managementteam.api_error"));
      }

      const data = response.data || response;

      if (!Array.isArray(data)) {
        throw new Error(t("managementteam.array_error"));
      }

      const processedData = data
        .map((member) => {
          const safeMember = {
            id: String(member.id || ""),
            name: {
              en: String(member.name?.en || ""),
              am: String(member.name?.am || ""),
            },
            position: {
              en: String(
                member.position?.en || t("managementteam.not_specified")
              ),
              am: String(
                member.position?.am || t("managementteam.not_specified")
              ),
            },
            department: {
              en: String(member.department?.en || t("managementteam.general")),
              am: String(member.department?.am || t("managementteam.general")),
            },
            bio: {
              en: String(member.bio?.en || ""),
              am: String(member.bio?.am || ""),
            },
            email: String(member.email || ""),
            phone: String(member.phone || ""),
            avatar: member.avatar
              ? String(member.avatar)
              : "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(
                  member.name?.en || t("managementteam.user")
                ) +
                "&background=random",
            joinDate: String(member.joinDate || new Date().toISOString()),
            responsibilities: Array.isArray(member.responsibilities)
              ? member.responsibilities.map((r) => String(r))
              : [],
            achievements: Array.isArray(member.achievements)
              ? member.achievements.map((a) => String(a))
              : [],
          };

          if (!safeMember.id || !safeMember.name.en) {
            console.warn("Invalid team member data:", member);
            return null;
          }

          return safeMember;
        })
        .filter(Boolean) as TeamMember[];

      setTeamData(processedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("managementteam.load_error")
      );
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(
    new Set(
      teamData
        .map((member) => {
          const dept = member.department
            ? String(member.department.en)
            : t("managementteam.general");
          return dept.trim();
        })
        .filter((dept) => dept !== "")
    )
  ).sort();

  const filteredTeam =
    activeTab === "all"
      ? teamData
      : teamData.filter((member) => {
          const memberDept = member.department
            ? String(member.department.en).toLowerCase()
            : t("managementteam.general").toLowerCase();
          return memberDept === activeTab.toLowerCase();
        });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <Container size={1400} className="py-16 text-center">
        <Text color="red" size="xl" weight={500}>
          {error}
        </Text>
        <Button onClick={fetchTeamMembers} className="mt-4" variant="outline">
          {t("managementteam.retry")}
        </Button>
      </Container>
    );
  }

  if (teamData.length === 0) {
    return (
      <Container size={1400} className="py-16 text-center">
        <Text size="xl" color="dimmed">
          {t("managementteam.no_members")}
        </Text>
      </Container>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-blue-800 py-16">
        <Container size={1400}>
          <div className="text-center text-white">
            <Badge
              size="xl"
              radius="sm"
              color="blue"
              variant="filled"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconUser size={18} />
                <span>{t("managementteam.leadership")}</span>
              </Group>
            </Badge>
            <Title order={1} className="text-4xl md:text-5xl font-bold mb-4">
              {t("managementteam.title")}
            </Title>
            <Text size="xl" className="max-w-3xl mx-auto text-blue-100">
              {t("managementteam.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Team Section */}
      <Container size={1400} className="py-16">
        {/* Department Tabs */}
        <Tabs
          value={activeTab}
          onTabChange={(value) => setActiveTab(value || "all")}
          className="mb-12"
        >
          <Tabs.List>
            <Tabs.Tab value="all">
              {t("managementteam.all_departments")}
            </Tabs.Tab>
            {departments.map((dept) => (
              <Tabs.Tab key={dept} value={dept.toLowerCase()}>
                {dept}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        {/* Team Grid */}
        <Grid gutter="xl">
          {filteredTeam.map((member) => (
            <Grid.Col key={member.id} span={12} sm={6} lg={4} xl={3}>
              <Card
                shadow="sm"
                padding="lg"
                className="h-full bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg flex flex-col"
              >
                <Card.Section className="flex justify-center pt-6">
                  <Avatar
                    src={`${import.meta.env.VITE_FILE_API}${member.avatar}`}
                    alt={member.name.en}
                    size={120}
                    radius={120}
                    className="border-4 border-white shadow-md"
                  />
                </Card.Section>

                <div className="text-center mt-6">
                  <Title order={3} className="text-xl font-bold text-blue-800">
                    {member.name.en}
                  </Title>
                  <Text className="text-blue-600 font-medium">
                    {member.position.en}
                  </Text>
                  <Badge color="blue" variant="light" className="mt-2">
                    {member.department.en}
                  </Badge>
                </div>

                <Divider my="md" />

                <Group spacing="xs" className="mb-2">
                  <ThemeIcon size="sm" variant="light" color="blue">
                    <IconBriefcase size={14} />
                  </ThemeIcon>
                  <Text size="sm" color="dimmed">
                    {t("managementteam.since")}{" "}
                    {new Date(member.joinDate).getFullYear()}
                  </Text>
                </Group>

                <Text className="text-gray-600 text-sm line-clamp-3 mt-2">
                  {member.bio.en}
                </Text>

                <Button
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                  fullWidth
                  radius="md"
                  onClick={() => setSelectedMember(member)}
                >
                  {t("managementteam.view_profile")}
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Team Member Modal */}
      <Modal
        opened={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={
          <Title order={3} className="text-blue-800">
            {selectedMember?.name.en}
          </Title>
        }
        size="lg"
        overlayBlur={3}
        overlayOpacity={0.7}
        radius="lg"
        padding="xl"
      >
        {selectedMember && (
          <div>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0 flex flex-col items-center">
                <Image
                  src={`${import.meta.env.VITE_FILE_API}${selectedMember.avatar}`}
                  alt={selectedMember.name.en}
                  width={200}
                  height={200}
                  radius="md"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                  withPlaceholder
                  placeholder={<IconPhoto size={40} />}
                />
                <Button
                  variant="subtle"
                  size="sm"
                  mt="sm"
                  onClick={() => setImageModalOpen(true)}
                  leftIcon={<IconPhoto size={16} />}
                >
                  {t("managementteam.view_image")}
                </Button>
              </div>

              <div>
                <Title order={4} className="text-xl">
                  {selectedMember.position.en}
                </Title>
                <Badge color="blue" size="lg" className="mb-4">
                  {selectedMember.department.en}
                </Badge>

                <Group spacing="xl" className="mb-4">
                  <div>
                    <Text size="sm" color="dimmed" weight={500}>
                      {t("managementteam.email")}
                    </Text>
                    <Group spacing="xs">
                      <IconMail size={16} />
                      <Text>{selectedMember.email}</Text>
                    </Group>
                  </div>
                  <div>
                    <Text size="sm" color="dimmed" weight={500}>
                      {t("managementteam.phone")}
                    </Text>
                    <Group spacing="xs">
                      <IconPhone size={16} />
                      <Text>{selectedMember.phone}</Text>
                    </Group>
                  </div>
                </Group>

                <Text className="text-gray-700">{selectedMember.bio.en}</Text>
              </div>
            </div>

            <Divider className="my-4" />

            <Tabs defaultValue="responsibilities">
              <Tabs.List>
                <Tabs.Tab
                  value="responsibilities"
                  icon={<IconBuilding size={14} />}
                >
                  {t("managementteam.responsibilities")}
                </Tabs.Tab>
                <Tabs.Tab
                  value="achievements"
                  icon={<IconChartLine size={14} />}
                >
                  {t("managementteam.achievements")}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="responsibilities" pt="md">
                <ul className="list-disc pl-5 space-y-2">
                  {selectedMember.responsibilities.map((item, i) => (
                    <li key={i} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </Tabs.Panel>

              <Tabs.Panel value="achievements" pt="md">
                <ul className="list-disc pl-5 space-y-2">
                  {selectedMember.achievements.map((item, i) => (
                    <li key={i} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </Tabs.Panel>
            </Tabs>

            <Space h="xl" />

            <Button
              fullWidth
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setSelectedMember(null)}
            >
              {t("managementteam.close")}
            </Button>
          </div>
        )}
      </Modal>

      {/* Full Image Modal */}
      <Modal
        opened={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        size="xl"
        title={
          <Text size="lg" weight={600}>
            {t("managementteam.full_image_of")} {selectedMember?.name.en}
          </Text>
        }
        centered
      >
        {selectedMember && (
          <Box className="flex justify-center">
            <Image
              src={`${import.meta.env.VITE_FILE_API}${selectedMember.avatar}`}
              alt={`${t("managementteam.full_image_of")} ${
                selectedMember.name.en
              }`}
              fit="contain"
              withPlaceholder
              placeholder={<IconPhoto size={40} />}
            />
          </Box>
        )}
      </Modal>
    </div>
  );
};

export default ManagementTeamViewer;
