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
  List,
  Button,
  Modal,
  Image,
  LoadingOverlay,
  Skeleton,
} from "@mantine/core";
import {
  IconCrown,
  IconBuildingCommunity,
  IconUserCheck,
  IconX,
  IconRefresh,
  IconCheck,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { notifications } from "@mantine/notifications";
import {
  getSubcityOfficials,
  getSubcityOfficialById,
} from "../../services/api/main";
import { useTranslation } from "react-i18next";

interface Official {
  id: number;
  name: {
    en: string;
    am: string;
  };
  title: {
    en: string;
    am: string;
  };
  image: string;
  bio: {
    en: string;
    am: string;
  };
  tenure: string;
  achievements: string[];
  fullBio: {
    en: string;
    am: string;
  };
}

const BoleSubcityOfficials = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(
    null
  );

  // Function to construct the full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    return `${import.meta.env.VITE_FILE_API}${imagePath}`;
  };

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubcityOfficials();
      setOfficials(data || []);
    } catch (err) {
      console.error("Failed to fetch officials:", err);
      setError(t("subcityofficial.officials.error.loading"));
      showNotification(t("subcityofficial.officials.error.loading"), "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficialDetails = async (id: number) => {
    try {
      const official = await getSubcityOfficialById(id);
      setSelectedOfficial(official);
      setOpened(true);
    } catch (err) {
      console.error("Failed to fetch official details:", err);
      showNotification(t("subcityofficial.officials.error.details"), "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("subcityofficial.notification.success")
          : t("subcityofficial.notification.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const openModal = (official: Official) => {
    if (official.fullBio && official.achievements) {
      setSelectedOfficial(official);
      setOpened(true);
    } else {
      fetchOfficialDetails(official.id);
    }
  };

  if (error) {
    return (
      <Container className="py-16 text-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-2xl mx-auto">
          <IconX size={48} className="text-red-500 mx-auto mb-4" />
          <Title order={3} className="text-red-700 mb-2">
            {t("subcityofficial.officials.error.title")}
          </Title>
          <Text className="text-red-600 mb-4">{error}</Text>
          <Button
            leftIcon={<IconRefresh size={16} />}
            onClick={fetchOfficials}
            variant="outline"
            color="red"
          >
            {t("subcityofficial.officials.retry")}
          </Button>
        </div>
      </Container>
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
              color="green"
              variant="filled"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconBuildingCommunity size={18} />
                <span>{t("subcityofficial.officials.hero.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-5xl font-bold mb-4"
              data-aos-delay="100"
            >
              {t("subcityofficial.officials.hero.title")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-green-100"
              data-aos-delay="200"
            >
              {t("subcityofficial.officials.hero.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Officials Section */}
      <Container size={1400} className="py-16" pos="relative">
        {/* <LoadingOverlay visible={loading} overlayBlur={2} /> */}

        <Grid gutter="xl">
          {loading && !officials.length
            ? Array.from({ length: 6 }).map((_, index) => (
                <Grid.Col key={`skeleton-${index}`} span={12} md={6} lg={4}>
                  <Card
                    shadow="sm"
                    padding="lg"
                    className="h-full bg-white rounded-xl border border-gray-200"
                  >
                    <Card.Section className="flex justify-center pt-6">
                      <Skeleton height={160} circle />
                    </Card.Section>
                    <Skeleton height={20} mt={20} width="80%" mx="auto" />
                    <Skeleton height={16} mt={10} width="60%" mx="auto" />
                    <Skeleton height={16} mt={20} width="90%" />
                    <Skeleton height={16} mt={10} width="80%" />
                    <Skeleton height={16} mt={10} width="85%" />
                    <Skeleton height={40} mt={20} radius="md" />
                  </Card>
                </Grid.Col>
              ))
            : officials.map((official, index) => (
                <Grid.Col key={official.id} span={12} md={6} lg={4}>
                  <Card
                    shadow="md"
                    padding="lg"
                    className="h-full bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg flex flex-col"
                    data-aos="fade-up"
                    data-aos-delay={(index % 3) * 100}
                  >
                    <Card.Section className="flex justify-center pt-6">
                      <Avatar
                        src={getImageUrl(official.image)}
                        size={160}
                        radius={160}
                        className="border-4 border-white shadow-xl"
                        alt={
                          official.name[
                            currentLang as keyof typeof official.name
                          ]
                        }
                      />
                    </Card.Section>

                    <div className="text-center mt-6">
                      <Title
                        order={3}
                        className="text-xl font-bold text-green-800"
                      >
                        {
                          official.name[
                            currentLang as keyof typeof official.name
                          ]
                        }
                      </Title>
                      <Text className="text-green-600 font-medium">
                        {
                          official.title[
                            currentLang as keyof typeof official.title
                          ]
                        }
                      </Text>
                      <Badge
                        color="green"
                        variant="light"
                        className="mt-3"
                        leftSection={
                          <IconUserCheck size={14} className="mr-1" />
                        }
                      >
                        {official.tenure}
                      </Badge>
                    </div>
                    <Divider my="md" />

                    <Text className="text-gray-600 text-sm mb-4">
                      {official.bio[currentLang as keyof typeof official.bio]}
                    </Text>

                    {official.achievements &&
                      official.achievements.length > 0 && (
                        <>
                          <Title
                            order={4}
                            className="mb-2 flex items-center gap-2"
                          >
                            <IconCrown size={20} />{" "}
                            {t("subcityofficial.officials.achievements")}
                          </Title>
                          <List spacing="sm" className="mb-4">
                            {official.achievements
                              .slice(0, 3)
                              .map((achievement, i) => (
                                <List.Item key={i} className="text-sm">
                                  {achievement}
                                </List.Item>
                              ))}
                          </List>
                        </>
                      )}

                    <div className="mt-auto pt-4">
                      <Button
                        variant="light"
                        color="green"
                        fullWidth
                        radius="md"
                        className="hover:bg-green-100"
                        onClick={() => openModal(official)}
                      >
                        {t("subcityofficial.officials.viewProfile")}
                      </Button>
                    </div>
                  </Card>
                </Grid.Col>
              ))}
        </Grid>

        {/* Official Details Modal */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          size="lg"
          title={
            selectedOfficial ? (
              <Text size="xl" weight={600}>
                {
                  selectedOfficial.name[
                    currentLang as keyof typeof selectedOfficial.name
                  ]
                }
              </Text>
            ) : null
          }
          closeButtonLabel={t("subcityofficial.officials.closeModal")}
          overlayProps={{ opacity: 0.55, blur: 3 }}
          centered
        >
          {selectedOfficial ? (
            <div className="space-y-6">
              <Group position="center">
                <Image
                  src={getImageUrl(selectedOfficial.image)}
                  width={200}
                  height={200}
                  radius="md"
                  alt={
                    selectedOfficial.name[
                      currentLang as keyof typeof selectedOfficial.name
                    ]
                  }
                  withPlaceholder
                />
              </Group>

              <div>
                <Text size="lg" weight={500} className="text-green-600">
                  {
                    selectedOfficial.title[
                      currentLang as keyof typeof selectedOfficial.title
                    ]
                  }
                </Text>
                <Badge
                  color="green"
                  variant="light"
                  leftSection={<IconUserCheck size={14} className="mr-1" />}
                  className="mt-2"
                >
                  {selectedOfficial.tenure}
                </Badge>
              </div>

              <Divider />

              <Text size="sm">
                <Title order={4} className="mb-2">
                  {t("subcityofficial.officials.biography")}
                </Title>
                {
                  selectedOfficial.fullBio[
                    currentLang as keyof typeof selectedOfficial.fullBio
                  ]
                }
              </Text>

              <Divider />

              {selectedOfficial.achievements &&
                selectedOfficial.achievements.length > 0 && (
                  <div>
                    <Title order={4} className="mb-2 flex items-center gap-2">
                      <IconCrown size={20} />{" "}
                      {t("subcityofficial.officials.achievements")}
                    </Title>
                    <List spacing="sm">
                      {selectedOfficial.achievements.map((achievement, i) => (
                        <List.Item key={i}>{achievement}</List.Item>
                      ))}
                    </List>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8">
              <LoadingOverlay visible={true} overlayBlur={2} />
            </div>
          )}
        </Modal>
      </Container>
    </div>
  );
};

export default BoleSubcityOfficials;
