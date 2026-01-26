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
  List,
  TextInput,
  Pagination,

  Center,
  Select,
  Anchor,
  Table,
  useMantineTheme,
  Notification,
} from "@mantine/core";
import {
  IconGavel,
  IconCalendar,
  IconClock,
  IconSearch,
  IconFilter,
  IconBookmark,
  IconShare,
  IconFileDescription,
  IconBuilding,
  IconCoin,
  IconReceipt,
  IconX,
  IconCheck,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconDownload,
} from "@tabler/icons-react";
import Loader from "../../components/common/loader"

import AOS from "aos";
import "aos/dist/aos.css";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { getTenders } from "../../services/api/main";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

interface Tender {
  id: number;
  title: {
    en: string;
    am: string;
  };
  description: {
    en: string;
    am: string;
  };
  tender_number: string;
  published_date: string;
  closing_date: string;
  opening_date: string;
  category: {
    en: string;
    am: string;
  };
  budget: string;
  status: "open" | "closed" | "awarded";
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  requirements?: {
    en: string;
    am: string;
  }[];
  contact_person: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

const TendersPage = () => {
  const { t, i18n } = useTranslation();
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "open" | "closed" | "awarded"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [filteredTenders, setFilteredTenders] = useState<Tender[]>([]);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const itemsPerPage = 6;
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const response = await getTenders();

      // Sort tenders by published_date in descending order (newest first)
      const sortedTenders = (response || []).sort((a, b) => {
        return (
          new Date(b.published_date).getTime() -
          new Date(a.published_date).getTime()
        );
      });

      setTenders(sortedTenders);

      // Extract unique categories for filter
      const uniqueCategories = Array.from(
        new Set(sortedTenders?.map((t: Tender) => t.category[i18n.language]))
      ).map((category) => ({
        value: category.toLowerCase().replace(/\s+/g, "-"),
        label: category,
      }));

      setCategories(uniqueCategories);
     
    } catch (error) {
      console.error("Failed to fetch tenders:", error);
     
    } finally {
      setLoading(false);
    }
  };

  const getDocumentUrl = (url: string) => {
    if (url.startsWith("http") || url.startsWith("https")) {
      return url;
    }
    return `${import.meta.env.VITE_FILE_API}${url}`;
  };

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("notifications.success")
          : t("notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  useEffect(() => {
    // Apply filters while maintaining the newest-first order
    const filtered = tenders.filter((tender) => {
      if (activeTab !== "all" && tender.status !== activeTab) {
        return false;
      }
      if (
        searchQuery &&
        !tender.title[i18n.language]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedCategory &&
        tender.category[i18n.language].toLowerCase().replace(/\s+/g, "-") !==
          selectedCategory
      ) {
        return false;
      }
      return true;
    });

    setFilteredTenders(filtered);
    setActivePage(1);
  }, [tenders, searchQuery, activeTab, selectedCategory, i18n.language]);

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);
  const paginatedTenders = filteredTenders.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  const openTender = (tender: Tender) => {
    setSelectedTender(tender);
    open();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "green";
      case "closed":
        return "red";
      case "awarded":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "open":
        return t("tenderui.status.open");
      case "closed":
        return t("tenderui.status.closed");
      case "awarded":
        return t("tenderui.status.awarded");
      default:
        return status;
    }
  };

  if (loading && tenders.length === 0) {
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
                <IconGavel size={18} />
                <span>{t("tenderui.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
              data-aos-delay="100"
            >
              {t("tenderui.title")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100 opacity-90"
              data-aos-delay="200"
            >
              {t("tenderui.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Tenders Section */}
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
              setActiveTab(value as "all" | "open" | "closed" | "awarded")
            }
            className="mb-6"
          >
            <Tabs.List grow>
              <Tabs.Tab value="all" className="text-md font-medium">
                {t("tenderui.tabs.all")}
              </Tabs.Tab>
              <Tabs.Tab
                value="open"
                color="green"
                icon={<IconCalendar size={16} />}
                className="text-md font-medium"
              >
                {t("tenderui.tabs.open")}
              </Tabs.Tab>
              <Tabs.Tab
                value="closed"
                color="red"
                icon={<IconClock size={16} />}
                className="text-md font-medium"
              >
                {t("tenderui.tabs.closed")}
              </Tabs.Tab>
              <Tabs.Tab
                value="awarded"
                color="blue"
                icon={<IconReceipt size={16} />}
                className="text-md font-medium"
              >
                {t("tenderui.tabs.awarded")}
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <Grid gutter="xl" align="center">
            <Grid.Col span={12} md={8}>
              <TextInput
                icon={<IconSearch size={18} />}
                placeholder={t("tenderui.search.placeholder")}
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
                placeholder={t("tenderui.filter.placeholder")}
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

        {/* Tenders Grid */}
        {paginatedTenders.length > 0 ? (
          <>
            <Grid gutter="xl">
              {paginatedTenders.map((tender, index) => (
                <Grid.Col key={tender.id} span={12} md={6}>
                  <Card
                    shadow="md"
                    padding="lg"
                    className="h-full bg-white rounded-xl border-0 transition-all duration-300 hover:shadow-lg flex flex-col transform hover:-translate-y-1"
                    data-aos="fade-up"
                    data-aos-delay={(index % 2) * 100}
                  >
                    <Group position="apart" className="mb-4">
                      <Badge
                        color={getStatusColor(tender.status)}
                        variant="light"
                        size="lg"
                        leftSection={
                          tender.status === "open" ? (
                            <IconCalendar size={14} />
                          ) : tender.status === "closed" ? (
                            <IconClock size={14} />
                          ) : (
                            <IconReceipt size={14} />
                          )
                        }
                      >
                        {getStatusTranslation(tender.status)}
                      </Badge>
                      <Badge color="blue" variant="light" size="lg">
                        {tender.category[i18n.language]}
                      </Badge>
                    </Group>

                    <Title
                      order={3}
                      className="text-xl font-bold text-blue-800 mb-3"
                    >
                      {tender.title[i18n.language]}
                    </Title>

                    <Text className="text-gray-600 mb-6 line-clamp-2">
                      {tender.description[i18n.language]}
                    </Text>

                    {tender.documents && tender.documents.length > 0 && (
                      <Group spacing="xs" className="mt-4">
                        {tender.documents.map((doc, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            leftSection={
                              doc.type === "pdf" ? (
                                <IconFileTypePdf size={14} />
                              ) : (
                                <IconFileTypeDoc size={14} />
                              )
                            }
                            component="a"
                            href={getDocumentUrl(doc.url)}
                            target="_blank"
                            className="cursor-pointer hover:bg-blue-50"
                          >
                            {doc.name}
                          </Badge>
                        ))}
                      </Group>
                    )}

                    <Divider className="my-4" />

                    <Table striped className="mb-6">
                      <tbody>
                        <tr>
                          <td className="font-semibold">
                            {t("tenderui.table.published")}:
                          </td>
                          <td>{formatDate(tender.published_date)}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold">
                            {t("tenderui.table.closing")}:
                          </td>
                          <td>{formatDate(tender.closing_date)}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold">
                            {t("tenderui.table.budget")}:
                          </td>
                          <td>{tender.budget}</td>
                        </tr>
                      </tbody>
                    </Table>

                    <div className="mt-auto">
                      <Button
                        fullWidth
                        className="bg-blue-600 hover:bg-blue-700 transition-colors"
                        onClick={() => openTender(tender)}
                        leftIcon={<IconGavel size={18} />}
                        size="md"
                        radius="md"
                      >
                        {t("tenderui.viewButton")}
                      </Button>
                    </div>
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
              <IconGavel size={36} />
            </ThemeIcon>
            <Title order={3} className="mb-3 text-gray-800">
              {t("tenderui.noResults.title")}
            </Title>
            <Text color="dimmed" className="mb-6 max-w-md mx-auto">
              {t("tenderui.noResults.description")}
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
              {t("tenderui.resetFilters")}
            </Button>
          </Paper>
        )}
      </Container>

      {/* Tender Detail Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Title order={3} className="text-blue-800 font-bold">
            {selectedTender?.title[i18n.language]}
          </Title>
        }
        size="xl"
        overlayBlur={3}
        overlayOpacity={0.25}
        radius="lg"
        padding="xl"
        centered
      >
        {selectedTender && (
          <div>
            <Group position="apart" className="mb-6">
              <Group spacing="xs">
                <Badge
                  color={getStatusColor(selectedTender.status)}
                  size="lg"
                  variant="light"
                  leftSection={
                    selectedTender.status === "open" ? (
                      <IconCalendar size={14} />
                    ) : selectedTender.status === "closed" ? (
                      <IconClock size={14} />
                    ) : (
                      <IconReceipt size={14} />
                    )
                  }
                >
                  {getStatusTranslation(selectedTender.status)}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                  {selectedTender.category[i18n.language]}
                </Badge>
              </Group>
              <Text size="sm" color="dimmed">
                {t("tenderui.table.published")}:{" "}
                {formatDate(selectedTender.published_date)}
              </Text>
            </Group>

            <Paper withBorder p="md" radius="md" className="mb-8 bg-blue-50">
              <Grid gutter="md">
                <Grid.Col span={6} md={3}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.table.tenderNumber")}
                  </Text>
                  <Text weight={500}>{selectedTender.tender_number}</Text>
                </Grid.Col>
                <Grid.Col span={6} md={3}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.table.closing")}
                  </Text>
                  <Text weight={500}>
                    {formatDate(selectedTender.closing_date)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6} md={3}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.table.opening")}
                  </Text>
                  <Text weight={500}>
                    {formatDate(selectedTender.opening_date)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6} md={3}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.table.budget")}
                  </Text>
                  <Text weight={500}>{selectedTender.budget}</Text>
                </Grid.Col>
              </Grid>
            </Paper>

            <Title order={4} className="mb-3 text-gray-800">
              {t("tenderui.description.title")}
            </Title>
            <Text className="text-gray-700 mb-8 whitespace-pre-line">
              {selectedTender.description[i18n.language]}
            </Text>

            {selectedTender.requirements &&
              selectedTender.requirements.length > 0 && (
                <>
                  <Divider className="my-6" />
                  <Title order={4} className="mb-3 text-gray-800">
                    {t("tenderui.requirements.title")}
                  </Title>
                  <List spacing="sm" className="mb-8">
                    {selectedTender.requirements.map((req, i) => (
                      <List.Item key={i}>{req[i18n.language]}</List.Item>
                    ))}
                  </List>
                </>
              )}

            {selectedTender.documents &&
              selectedTender.documents.length > 0 && (
                <>
                  <Divider className="my-6" />
                  <Title order={4} className="mb-3 text-gray-800">
                    {t("tenderui.documents.title")}
                  </Title>
                  <List spacing="sm" className="mb-8">
                    {selectedTender.documents.map((doc, i) => (
                      <List.Item
                        key={i}
                        icon={
                          <ThemeIcon size="sm" variant="light" color="blue">
                            {doc.type === "pdf" ? (
                              <IconFileTypePdf size={16} />
                            ) : (
                              <IconFileTypeDoc size={16} />
                            )}
                          </ThemeIcon>
                        }
                      >
                        <Group spacing="xs" noWrap>
                          <Anchor
                            href={getDocumentUrl(doc.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            {doc.name}
                          </Anchor>
                          <Button
                            variant="subtle"
                            size="xs"
                            px={4}
                            onClick={() =>
                              window.open(getDocumentUrl(doc.url), "_blank")
                            }
                          >
                            <IconDownload size={14} />
                          </Button>
                        </Group>
                      </List.Item>
                    ))}
                  </List>
                </>
              )}

            <Divider className="my-6" />

            <Title order={4} className="mb-3 text-gray-800">
              {t("tenderui.contact.title")}
            </Title>
            <Paper withBorder p="md" radius="md" className="mb-8">
              <Grid gutter="md">
                <Grid.Col span={12} md={6}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.contact.person")}
                  </Text>
                  <Text weight={500}>{selectedTender.contact_person.name}</Text>
                  <Text size="sm" color="dimmed">
                    {selectedTender.contact_person.position}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12} md={6}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.contact.phone")}
                  </Text>
                  <Text weight={500}>
                    {selectedTender.contact_person.phone}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="sm" color="dimmed">
                    {t("tenderui.contact.email")}
                  </Text>
                  <Text weight={500}>
                    {selectedTender.contact_person.email}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            <Group grow>
              <Button
                variant="outline"
                color="blue"
                leftIcon={<IconBookmark size={18} />}
                size="md"
                radius="md"
              >
                {t("tenderui.actions.save")}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
                leftIcon={<IconShare size={18} />}
                size="md"
                radius="md"
              >
                {t("tenderui.actions.share")}
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TendersPage;
