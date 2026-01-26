import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Image,
  Modal,
  Button,
  Group,
  Badge,
  ThemeIcon,
  Divider,
  Space,
  Tabs,
  Paper,
  Avatar,
  List,
  TextInput,
  ScrollArea,
  Pagination,

  ActionIcon,
  Center,
  Select,
  Anchor,
  Stack,
  Box,
  useMantineTheme,
} from "@mantine/core";
import {
  IconNews,
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconSearch,
  IconFilter,
  IconBookmark,
  IconShare,
  IconDownload,
  IconUser,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { getAnnouncements } from "../../services/api/main";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader"

interface Announcement {
  id: number;
  title: {
    en: string;
    am: string;
  };
  content: {
    en: string;
    am: string;
  };
  date: string;
  category: {
    en: string;
    am: string;
  };
  image?: string;
  author: {
    en: string;
    am: string;
  };
  isPinned: number;
  created_at: string;
  updated_at: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

const AnnouncementsPage = () => {
  const { t, i18n } = useTranslation();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const itemsPerPage = 6;
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      setAnnouncements(response || []);
      
      // Extract unique categories for filter
      const uniqueCategories = Array.from(
        new Set(response?.map((a: Announcement) => a.category[i18n.language]))
        .map(category => ({ 
          value: category.toLowerCase(), 
          label: category 
        })));
      
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title: type === "success" ? t("notifications.success") : t("notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  useEffect(() => {
    // Apply filters whenever announcements, searchQuery, activeTab, or selectedCategory changes
    const filtered = announcements.filter((announcement) => {
      // Tab filter
      if (activeTab !== "all" && announcement.category[i18n.language].toLowerCase() !== activeTab) {
        return false;
      }

      // Search filter
      if (
        searchQuery &&
        !announcement.title[i18n.language].toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory && announcement.category[i18n.language].toLowerCase() !== selectedCategory) {
        return false;
      }

      return true;
    });

    // Sort pinned announcements first
    const sorted = [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    setFilteredAnnouncements(sorted);
    setActivePage(1); // Reset to first page when filters change
  }, [announcements, searchQuery, activeTab, selectedCategory, i18n.language]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  const openAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    open();
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return undefined;
    return `${import.meta.env.VITE_FILE_API}${imagePath}`;
  };

  if (loading && announcements.length === 0) {
    return (
      <Container size={1400} className="py-16">
        <Center className="h-[60vh]">
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-800 to-blue-600 py-20">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              color="blue"
              variant="light"
              className="mb-6"
            >
              <Group spacing="xs">
                <IconNews size={18} />
                <span>{t("announcementsui.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
              data-aos-delay="100"
            >
              {t("announcementsui.title")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100 opacity-90"
              data-aos-delay="200"
            >
              {t("announcementsui.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Announcements Section */}
      <Container size={1400} className="py-16">
        {/* Search and Filter */}
        <Paper 
          withBorder 
          p="lg" 
          radius="lg" 
          shadow="sm"
          className="mb-12 bg-white border-0 shadow-md"
        >
          <Tabs
            value={activeTab}
            onTabChange={(value) => setActiveTab(value as string)}
            className="mb-6"
          >
            <Tabs.List grow>
              <Tabs.Tab 
                value="all" 
                icon={<IconNews size={16} />}
                className="text-md font-medium"
              >
                {t("announcementsui.tabs.all")}
              </Tabs.Tab>
              {categories.map((category) => (
                <Tabs.Tab 
                  key={category.value}
                  value={category.value}
                  className="text-md font-medium"
                >
                  {category.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <Grid gutter="xl" align="center">
            <Grid.Col span={12} md={8}>
              <TextInput
                icon={<IconSearch size={18} />}
                placeholder={t("announcementsui.search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="md"
                radius="md"
                className="shadow-sm"
              />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <Select
                icon={<IconFilter size={18} />}
                placeholder={t("announcementsui.filter.placeholder")}
                data={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                clearable
                size="md"
                radius="md"
                className="shadow-sm"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Announcements Grid */}
        {paginatedAnnouncements.length > 0 ? (
          <>
            <Grid gutter="xl">
              {paginatedAnnouncements.map((announcement, index) => (
                <Grid.Col key={announcement.id} span={12} md={6} lg={4}>
                  <Card
                    shadow="md"
                    padding="lg"
                    className={`h-full bg-white rounded-xl border-0 transition-all duration-300 hover:shadow-lg flex flex-col transform hover:-translate-y-1 ${
                      announcement.isPinned ? "border-l-4 border-blue-500" : ""
                    }`}
                    data-aos="fade-up"
                    data-aos-delay={(index % 3) * 100}
                  >
                    {announcement.isPinned && (
                      <Badge
                        color="yellow"
                        variant="filled"
                        className="absolute top-4 right-4 z-10"
                        radius="sm"
                      >
                        {t("announcementsui.pinned")}
                      </Badge>
                    )}

                    {announcement.image && (
                      <Card.Section className="relative overflow-hidden rounded-t-lg">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0" />
                        <Image
                          src={getImageUrl(announcement.image)}
                          alt={announcement.title[i18n.language]}
                          height={400}
                          className="rounded-t-lg object-fill w-full"
                        />
                        <div className="absolute bottom-0 left-0 p-4 z-10">
                          <Badge 
                            color="blue" 
                            variant="light"
                            size="lg"
                            radius="sm"
                            className="font-semibold"
                          >
                            {announcement.category[i18n.language]}
                          </Badge>
                        </div>
                      </Card.Section>
                    )}

                    <div className="mt-4 flex-grow">
                      <Title
                        order={3}
                        className="text-xl font-bold text-gray-900 mb-2"
                      >
                        {announcement.title[i18n.language]}
                      </Title>

                      <Stack spacing="xs" className="mb-4">
                        <Group spacing="xs">
                          <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                            <IconCalendarEvent size={14} />
                          </ThemeIcon>
                          <Text size="sm" className="font-medium text-gray-700">
                            {formatDate(announcement.date)}
                          </Text>
                        </Group>
                        {announcement.author && (
                          <Group spacing="xs">
                            <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                              <IconUser size={14} />
                            </ThemeIcon>
                            <Text size="sm" className="font-medium text-gray-700">
                              {announcement.author[i18n.language]}
                            </Text>
                          </Group>
                        )}
                      </Stack>

                      <Text className="text-gray-600 mb-4 line-clamp-3">
                        {announcement.content[i18n.language]}
                      </Text>
                    </div>

                    <Button
                      className="mt-6 bg-blue-600 hover:bg-blue-700 transition-colors"
                      fullWidth
                      radius="md"
                      onClick={() => openAnnouncement(announcement)}
                      size="md"
                    >
                      {t("announcementsui.readButton")}
                    </Button>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group position="center" className="mt-16">
                <Pagination
                  page={activePage}
                  onChange={setActivePage}
                  total={totalPages}
                  color="blue"
                  radius="md"
                  size={isMobile ? "md" : "lg"}
                  className="shadow-sm"
                  withEdges
                />
              </Group>
            )}
          </>
        ) : (
          <Paper 
            withBorder 
            p="xl" 
            radius="lg" 
            shadow="sm"
            className="text-center border-0 bg-gradient-to-br from-blue-50 to-white"
          >
            <ThemeIcon
              size={80}
              radius={80}
              color="blue"
              variant="light"
              className="mx-auto mb-6"
            >
              <IconNews size={36} />
            </ThemeIcon>
            <Title order={3} className="mb-3 text-gray-800">
              {t("announcementsui.noResults.title")}
            </Title>
            <Text color="dimmed" className="mb-6 max-w-md mx-auto">
              {t("announcementsui.noResults.description")}
            </Text>
            <Button
              variant="light"
              color="blue"
              size="md"
              radius="md"
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              {t("announcementsui.resetFilters")}
            </Button>
          </Paper>
        )}
      </Container>

      {/* Announcement Detail Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Title order={3} className="text-gray-800 font-bold">
            {selectedAnnouncement?.title[i18n.language]}
          </Title>
        }
        size="xl"
        overlayBlur={3}
        overlayOpacity={0.25}
        radius="lg"
        padding="xl"
        centered
      >
        {selectedAnnouncement && (
          <div>
            <Group position="apart" className="mb-6">
              <Badge color="blue" size="lg" radius="sm">
                {selectedAnnouncement.category[i18n.language]}
              </Badge>
              {selectedAnnouncement.isPinned && (
                <Badge color="yellow" size="lg" radius="sm">
                  {t("announcementsui.pinned")}
                </Badge>
              )}
            </Group>

            {selectedAnnouncement.image && (
              <Image
                src={getImageUrl(selectedAnnouncement.image)}
                alt={selectedAnnouncement.title[i18n.language]}
                height={600}
                className="rounded-lg mb-8  object-contain w-full md:p-10"
                radius="sm"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <Title order={4} className="mb-4 text-gray-800">
                  {t("announcementsui.details.title")}
                </Title>
                <Stack spacing="sm">
                  <Group spacing="xs" noWrap>
                    <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                      <IconCalendarEvent size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("announcementsui.details.date")}
                      </Text>
                      <Text weight={500}>{formatDate(selectedAnnouncement.date)}</Text>
                    </div>
                  </Group>
                  {selectedAnnouncement.author && (
                    <Group spacing="xs" noWrap>
                      <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                        <IconUser size={18} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" color="dimmed">
                          {t("announcementsui.details.author")}
                        </Text>
                        <Text weight={500}>{selectedAnnouncement.author[i18n.language]}</Text>
                      </div>
                    </Group>
                  )}
                  <Group spacing="xs" noWrap>
                    <ThemeIcon size="md" variant="light" color="blue" radius="xl">
                      <IconClock size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("announcementsui.details.published")}
                      </Text>
                      <Text weight={500}>{formatDateTime(selectedAnnouncement.created_at)}</Text>
                    </div>
                  </Group>
                </Stack>
              </div>

              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div>
                  <Title order={4} className="mb-4 text-gray-800">
                    {t("announcementsui.attachments.title")}
                  </Title>
                  <List spacing="sm">
                    {selectedAnnouncement.attachments.map((attachment, index) => (
                      <List.Item
                        key={index}
                        icon={
                          <IconDownload size={18} className="text-blue-500" />
                        }
                      >
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {attachment.name}
                        </a>{" "}
                        <Badge
                          size="xs"
                          variant="outline"
                          color="gray"
                          className="ml-2"
                        >
                          {attachment.type}
                        </Badge>
                      </List.Item>
                    ))}
                  </List>
                </div>
              )}
            </div>

            <div className="mb-8">
              <Title order={4} className="mb-3 text-gray-800">
                {t("announcementsui.content.title")}
              </Title>
              <Text className="text-gray-700 whitespace-pre-line">
                {selectedAnnouncement.content[i18n.language]}
              </Text>
            </div>

            <Group position="right">
              <Button
                variant="light"
                color="blue"
                size="md"
                radius="md"
                onClick={close}
              >
                {t("announcementsui.closeButton")}
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;