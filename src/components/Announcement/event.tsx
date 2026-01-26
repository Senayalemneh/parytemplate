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
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconSearch,
  IconFilter,
  IconBookmark,
  IconShare,
  IconUsers,
  IconCalendarDue,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDisclosure } from "@mantine/hooks";
import { getEvents } from "../../services/api/main";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

import Loader from "../../components/common/loader"

interface Event {
  id: string;
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  date: string;
  time: {
    en: string;
    am: string;
  };
  location: {
    en: string;
    am: string;
  };
  category: {
    en: string;
    am: string;
  };
  image: string;
  organizer: {
    name: string;
    contact: string;
  };
  isFeatured: boolean;
  attendees: number;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

const EventsPage = () => {
  const { t, i18n } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "past" | "featured"
  >("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      setEvents(response || []);

      // Extract unique categories for filter
      const uniqueCategories = Array.from(
        new Set(response?.map((e: Event) => e.category[i18n.language]))
      ).map((category) => ({ value: category, label: category }));

      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error("Failed to fetch events:", error);
     
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("notifications.success")
          : t("notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  useEffect(() => {
    // Apply filters whenever events, searchQuery, activeTab, or selectedCategory changes
    const filtered = events.filter((event) => {
      // Tab filter
      if (activeTab === "upcoming" && new Date(event.date) < new Date()) {
        return false;
      }
      if (activeTab === "past" && new Date(event.date) >= new Date()) {
        return false;
      }
      if (activeTab === "featured" && !event.isFeatured) {
        return false;
      }

      // Search filter
      if (
        searchQuery &&
        !event.title[i18n.language]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory &&
        event.category[i18n.language] !== selectedCategory
      ) {
        return false;
      }

      return true;
    });

    setFilteredEvents(filtered);
    setActivePage(1); // Reset to first page when filters change
  }, [events, searchQuery, activeTab, selectedCategory, i18n.language]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
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

  const openEvent = (event: Event) => {
    setSelectedEvent(event);
    open();
  };

  if (loading && events.length === 0) {
    return (
      <Container size={1400} className="py-16">
        <Center className="h-[60vh]">
          <Loader  />
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
                <IconCalendarEvent size={18} />
                <span>{t("eventui.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
              data-aos-delay="100"
            >
              {t("eventui.title")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100 opacity-90"
              data-aos-delay="200"
            >
              {t("eventui.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Events Section */}
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
            onTabChange={(value) =>
              setActiveTab(value as "all" | "upcoming" | "past" | "featured")
            }
            className="mb-6"
          >
            <Tabs.List grow>
              <Tabs.Tab
                value="all"
                icon={<IconCalendarEvent size={16} />}
                className="text-md font-medium"
              >
                {t("eventui.tabs.all")}
              </Tabs.Tab>
              <Tabs.Tab
                value="upcoming"
                icon={<IconCalendarDue size={16} />}
                className="text-md font-medium"
              >
                {t("eventui.tabs.upcoming")}
              </Tabs.Tab>
              <Tabs.Tab
                value="past"
                icon={<IconClock size={16} />}
                className="text-md font-medium"
              >
                {t("eventui.tabs.past")}
              </Tabs.Tab>
              <Tabs.Tab
                value="featured"
                icon={<IconCalendarEvent size={16} />}
                className="text-md font-medium"
              >
                {t("eventui.tabs.featured")}
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Grid gutter="xl" align="center">
            <Grid.Col span={12} md={8}>
              <TextInput
                icon={<IconSearch size={18} />}
                placeholder={t("eventui.search.placeholder")}
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
                placeholder={t("eventui.filter.placeholder")}
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

        {/* Events Grid */}
        {paginatedEvents.length > 0 ? (
          <>
            <Grid gutter="xl">
              {paginatedEvents.map((event, index) => (
                <Grid.Col key={event.id} span={12} md={6} lg={4}>
                  <Card
                    shadow="md"
                    padding="lg"
                    className={`h-full bg-white rounded-xl border-0 transition-all duration-300 hover:shadow-lg flex flex-col transform hover:-translate-y-1`}
                    data-aos="fade-up"
                    data-aos-delay={(index % 3) * 100}
                  >
                    {event.isFeatured && (
                      <Badge
                        color="yellow"
                        variant="filled"
                        className="absolute top-4 right-4 z-10"
                        radius="sm"
                      >
                        {t("eventui.featured")}
                      </Badge>
                    )}

                    <Card.Section className="relative overflow-hidden rounded-t-lg">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0" />
                      <Image
                        src={`${import.meta.env.VITE_FILE_API}${event.image}`}
                        alt={event.title[i18n.language]}
                        height={450}
                        className="rounded-t-lg  object-contain w-full"
                      />
                      <div className="absolute bottom-0 left-0 p-4 z-10">
                        <Badge
                          color="blue"
                          variant="light"
                          size="lg"
                          radius="sm"
                          className="font-semibold"
                        >
                          {event.category[i18n.language]}
                        </Badge>
                      </div>
                    </Card.Section>

                    <div className="mt-4 flex-grow">
                      <Title
                        order={3}
                        className="text-xl font-bold text-gray-900 mb-2"
                      >
                        {event.title[i18n.language]}
                      </Title>

                      <Stack spacing="xs" className="mb-4">
                        <Group spacing="xs">
                          <ThemeIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            radius="xl"
                          >
                            <IconCalendarEvent size={14} />
                          </ThemeIcon>
                          <Text size="sm" className="font-medium text-gray-700">
                            {formatDate(event.date)}
                          </Text>
                        </Group>
                        <Group spacing="xs">
                          <ThemeIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            radius="xl"
                          >
                            <IconClock size={14} />
                          </ThemeIcon>
                          <Text size="sm" className="font-medium text-gray-700">
                            {event.time[i18n.language]}
                          </Text>
                        </Group>
                        <Group spacing="xs">
                          <ThemeIcon
                            size="sm"
                            variant="light"
                            color="blue"
                            radius="xl"
                          >
                            <IconMapPin size={14} />
                          </ThemeIcon>
                          <Text
                            size="sm"
                            className="font-medium text-gray-700 line-clamp-1"
                          >
                            {event.location[i18n.language]}
                          </Text>
                        </Group>
                      </Stack>

                      <Text className="text-gray-600 mb-4 line-clamp-2">
                        {event.description[i18n.language]}
                      </Text>

                      {event.tags && event.tags.length > 0 && (
                        <div className="mt-auto">
                          <Group spacing="xs">
                            {event.tags.map((tag, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                color="gray"
                                radius="sm"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                      )}
                    </div>

                    <Button
                      className="mt-6 bg-blue-600 hover:bg-blue-700 transition-colors"
                      fullWidth
                      radius="md"
                      onClick={() => openEvent(event)}
                      size="md"
                    >
                      {t("eventui.viewButton")}
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
                  size="lg"
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
              <IconCalendarEvent size={36} />
            </ThemeIcon>
            <Title order={3} className="mb-3 text-gray-800">
              {t("eventui.noResults.title")}
            </Title>
            <Text color="dimmed" className="mb-6 max-w-md mx-auto">
              {t("eventui.noResults.description")}
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
              {t("eventui.resetFilters")}
            </Button>
          </Paper>
        )}
      </Container>

      {/* Event Detail Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Title order={3} className="text-gray-800 font-bold">
            {selectedEvent?.title[i18n.language]}
          </Title>
        }
        size="xl"
        overlayBlur={3}
        overlayOpacity={0.25}
        radius="lg"
        padding="xl"
        centered
      >
        {selectedEvent && (
          <div>
            <Group position="apart" className="mb-6">
              <Badge color="blue" size="lg" radius="sm">
                {selectedEvent.category[i18n.language]}
              </Badge>
              {selectedEvent.isFeatured && (
                <Badge color="yellow" size="lg" radius="sm">
                  {t("eventui.featuredEvent")}
                </Badge>
              )}
            </Group>

            <Image
              src={`${import.meta.env.VITE_FILE_API}${selectedEvent.image}`}
              alt={selectedEvent.title[i18n.language]}
              height={700}
              className="rounded-lg mb-8 object-contain"
              radius="sm"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <Title order={4} className="mb-4 text-gray-800">
                  {t("eventui.details.title")}
                </Title>
                <Stack spacing="sm">
                  <Group spacing="xs" noWrap>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="blue"
                      radius="xl"
                    >
                      <IconCalendarEvent size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("eventui.details.date")}
                      </Text>
                      <Text weight={500}>{formatDate(selectedEvent.date)}</Text>
                    </div>
                  </Group>
                  <Group spacing="xs" noWrap>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="blue"
                      radius="xl"
                    >
                      <IconClock size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("eventui.details.time")}
                      </Text>
                      <Text weight={500}>
                        {selectedEvent.time[i18n.language]}
                      </Text>
                    </div>
                  </Group>
                  <Group spacing="xs" noWrap>
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color="blue"
                      radius="xl"
                    >
                      <IconMapPin size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("eventui.details.location")}
                      </Text>
                      <Text weight={500}>
                        {selectedEvent.location[i18n.language]}
                      </Text>
                    </div>
                  </Group>
                  {selectedEvent.attendees && (
                    <Group spacing="xs" noWrap>
                      <ThemeIcon
                        size="md"
                        variant="light"
                        color="blue"
                        radius="xl"
                      >
                        <IconUsers size={18} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" color="dimmed">
                          {t("eventui.details.attendees")}
                        </Text>
                        <Text weight={500}>
                          {selectedEvent.attendees}+{" "}
                          {t("eventui.details.expected")}
                        </Text>
                      </div>
                    </Group>
                  )}
                </Stack>
              </div>

              <div>
                <Title order={4} className="mb-4 text-gray-800">
                  {t("eventui.organizer.title")}
                </Title>
                <Group spacing="md" noWrap>
                  <Avatar size="lg" radius="xl" color="blue" variant="light">
                    {selectedEvent.organizer.name.charAt(0)}
                  </Avatar>
                  <div>
                    <Text weight={600} size="lg">
                      {selectedEvent.organizer.name}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {selectedEvent.organizer.contact}
                    </Text>
                  </div>
                </Group>

                {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                  <>
                    <Title order={4} className="mb-3 mt-6 text-gray-800">
                      {t("eventui.tags.title")}
                    </Title>
                    <Group spacing="xs">
                      {selectedEvent.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          color="gray"
                          radius="sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </>
                )}
              </div>
            </div>

            <div className="mb-8">
              <Title order={4} className="mb-3 text-gray-800">
                {t("eventui.description.title")}
              </Title>
              <Text className="text-gray-700 whitespace-pre-line">
                {selectedEvent.description[i18n.language]}
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
                {t("eventui.closeButton")}
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventsPage;
