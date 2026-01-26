import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Avatar,
  Group,
  Badge,
  Divider,
  Paper,
  List,
  Button,
  Modal,
  Image,
  LoadingOverlay,
  SegmentedControl,
} from "@mantine/core";
import {
  IconCrown,
  IconBuildingCommunity,
  IconUserCheck,
  IconX,
  IconLanguage,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getOfficials } from "../../services/api/main";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/loader";

interface Official {
  id: number;
  name: {
    am: string;
    en: string;
  };
  title: {
    am: string;
    en: string;
  };
  image: string;
  bio: {
    am: string;
    en: string;
  };
  tenure: string;
  achievements: {
    en: string;
    am: string;
  }[];
  fullBio: {
    am: string;
    en: string;
  };
  created_at: string;
  updated_at: string;
}

const GovernmentLeaders = () => {
  const [opened, setOpened] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<Official | null>(null);
  const [leaders, setLeaders] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "am">("en");
  const { t } = useTranslation();

  React.useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await getOfficials();
        setLeaders(response || []);
      } catch (error) {
        console.error("Failed to fetch officials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  const openModal = (leader: Official) => {
    setSelectedLeader(leader);
    setOpened(true);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    return `${import.meta.env.VITE_FILE_API}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-blue-800 py-16">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              color="blue"
              variant="filled"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconBuildingCommunity size={18} />
                <span>{t("leadershippage.hero.governmentLeadership")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-5xl font-bold mb-4"
              data-aos-delay="100"
            >
              {t("leadershippage.hero.headsOfGovernment")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100"
              data-aos-delay="200"
            >
              {t("leadershippage.hero.leadersDescription")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Leaders Section */}
      <Container size={1400} className="py-16">
        {leaders.length === 0 ? (
          <div className="text-center py-10">
            <Text size="xl" color="dimmed">
              {t("leadershippage.leaders.noLeadersData")}
            </Text>
          </div>
        ) : (
          <Grid gutter="xl">
            {leaders.map((leader, index) => (
              <Grid.Col key={leader.id} span={12} md={6} lg={4}>
                <Card
                  shadow="md"
                  padding="lg"
                  className="h-full bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg flex flex-col"
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 100}
                >
                  <Card.Section className="flex justify-center pt-6">
                    <Avatar
                      src={getImageUrl(leader.image)}
                      size={160}
                      radius={160}
                      className="border-4 border-white shadow-xl"
                      alt={leader.name[language]}
                    />
                  </Card.Section>

                  <div className="text-center mt-6">
                    <Title
                      order={3}
                      className="text-xl font-bold text-blue-800"
                    >
                      {leader.name[language]}
                    </Title>
                    <Text className="text-blue-600 font-medium">
                      {leader.title[language]}
                    </Text>
                    <Badge
                      color="blue"
                      variant="light"
                      className="mt-3"
                      leftSection={<IconUserCheck size={14} className="mr-1" />}
                    >
                      {leader.tenure}
                    </Badge>
                  </div>

                  <Divider my="md" />

                  <Text className="text-gray-600 text-sm mb-4">
                    {leader.bio[language]}
                  </Text>

                  {leader.achievements && leader.achievements.length > 0 && (
                    <>
                      <Title order={4} className="mb-2 flex items-center gap-2">
                        <IconCrown size={20} />{" "}
                        {t("leadershippage.leader.keyAchievements")}
                      </Title>
                      <List spacing="sm" className="mb-4">
                        {leader.achievements.map((achievement, i) => (
                          <List.Item key={i} className="text-sm">
                            {achievement[language]}
                          </List.Item>
                        ))}
                      </List>
                    </>
                  )}

                  <div className="mt-auto pt-4">
                    <Button
                      variant="light"
                      color="blue"
                      fullWidth
                      radius="md"
                      className="hover:bg-blue-100"
                      onClick={() => openModal(leader)}
                    >
                      {t("leadershippage.leader.viewProfile")}
                    </Button>
                  </div>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Leader Details Modal */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          size="lg"
          title={
            <Text size="xl" weight={600}>
              {selectedLeader?.name[language]}
            </Text>
          }
          closeButtonLabel={t("leadershippage.modal.closeLeaderProfile")}
          closeButtonProps={{
            "aria-label": t("leadershippage.modal.closeModal"),
          }}
          overlayProps={{ opacity: 0.55, blur: 3 }}
          centered
        >
          {selectedLeader && (
            <div className="space-y-6">
              <Group position="center">
                <Image
                  src={getImageUrl(selectedLeader.image)}
                  width={200}
                  height={200}
                  radius="md"
                  alt={selectedLeader.name[language]}
                  withPlaceholder
                />
              </Group>

              <div>
                <Text size="lg" weight={500} className="text-blue-600">
                  {selectedLeader.title[language]}
                </Text>
                <Badge
                  color="blue"
                  variant="light"
                  leftSection={<IconUserCheck size={14} className="mr-1" />}
                  className="mt-2"
                >
                  {selectedLeader.tenure}
                </Badge>
              </div>

              <Divider />

              <Text size="sm">
                <Title order={4} className="mb-2">
                  {t("leadershippage.leader.biography")}
                </Title>
                {selectedLeader.fullBio[language] ||
                  t("leadershippage.leader.noBiographyAvailable")}
              </Text>

              <Divider />

              {selectedLeader.achievements &&
                selectedLeader.achievements.length > 0 && (
                  <div>
                    <Title order={4} className="mb-2 flex items-center gap-2">
                      <IconCrown size={20} />{" "}
                      {t("leadershippage.leader.keyAchievements")}
                    </Title>
                    <List spacing="sm">
                      {selectedLeader.achievements.map((achievement, i) => (
                        <List.Item key={i}>{achievement[language]}</List.Item>
                      ))}
                    </List>
                  </div>
                )}
            </div>
          )}
        </Modal>

        {/* Additional Info Section */}
        <Paper
          withBorder
          p="xl"
          radius="lg"
          className="mt-16 bg-blue-50 border-blue-200"
        >
          <Title order={3} className="text-blue-800 mb-4">
            {t("leadershippage.governance.structure")}
          </Title>
          <Text className="text-gray-700 mb-4">
            {t("leadershippage.governance.description")}
          </Text>
          <Group spacing="xl">
            <div>
              <Text size="sm" color="dimmed" weight={500}>
                {t("leadershippage.governance.governmentType")}
              </Text>
              <Text>
                {t("leadershippage.governance.federalParliamentaryRepublic")}
              </Text>
            </div>
            <div>
              <Text size="sm" color="dimmed" weight={500}>
                {t("leadershippage.governance.constitution")}
              </Text>
              <Text>{t("leadershippage.governance.ethiopiaConstitution")}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed" weight={500}>
                {t("leadershippage.governance.capitalCity")}
              </Text>
              <Text>{t("leadershippage.governance.addisAbaba")}</Text>
            </div>
          </Group>
        </Paper>
      </Container>
    </div>
  );
};

export default GovernmentLeaders;
