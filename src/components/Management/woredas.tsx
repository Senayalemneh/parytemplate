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
  Select,
  TextInput,
  Stack,
  Anchor,
  LoadingOverlay,
  Avatar,
  Center,
} from "@mantine/core";
import {
  IconWash,
  IconMapPin,
  IconClock,
  IconStar,
  IconUsers,
  IconBuildingCommunity,
  IconSearch,
  IconFilter,
  IconMail,
  IconPhone,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandTelegram,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandLinkedin,
  IconWorld,
  IconCalendar,
  IconTools,
  IconInfoCircle,
  IconAddressBook,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getWoredas } from "../../services/api/main";

import Loader from "../../components/common/loader"

interface ShowerFacility {
  id: number;
  name: {
    en: string;
    am: string;
  };
  woreda: {
    en: string;
    am: string;
  };
  subCity: {
    en: string;
    am: string;
  };
  location: {
    en: string;
    am: string;
  };
  image: string;
  description: {
    en: string;
    am: string;
  };
  operatingHours: {
    en: string;
    am: string;
  };
  capacity: string;
  amenities: string[];
  rating: number;
  accessType: {
    en: string;
    am: string;
  };
  maintenanceSchedule: {
    en: string;
    am: string;
  };
  contactPerson: {
    en: string;
    am: string;
  };
  contactPhone: string;
  mission?: {
    en: string;
    am: string;
  };
  vision?: {
    en: string;
    am: string;
  };
  values?: string[];
  email?: string;
  socialMedia?: string[];
  additionalContacts?: string[];
  serviceAreas?: string[];
  created_at: string;
  updated_at: string;
}

const WoredaShowersViewer = () => {
  const [selectedShower, setSelectedShower] = useState<ShowerFacility | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWoreda, setSelectedWoreda] = useState<string | null>(null);
  const [selectedSubCity, setSelectedSubCity] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState("details");
  const [showerData, setShowerData] = useState<ShowerFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
    });

    const fetchShowerData = async () => {
      try {
        setLoading(true);
        const response = await getWoredas();
        const data = Array.isArray(response)
          ? response
          : response
          ? [response]
          : [];
        setShowerData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch shower facilities. Please try again later.");
        setLoading(false);
        console.error("Error fetching shower data:", err);
      }
    };

    fetchShowerData();
  }, []);

  // Get unique woredas and subcities for filters
  const woredas = Array.from(
    new Set(showerData.map((shower) => shower.woreda.en))
  ).map((woreda) => ({
    value: woreda,
    label: woreda,
  }));

  const subCities = Array.from(
    new Set(showerData.map((shower) => shower.subCity.en))
  ).map((subCity) => ({
    value: subCity,
    label: subCity,
  }));

  const filteredShowers = showerData.filter((shower) => {
    // Tab filter
    if (activeTab !== "all") {
      const accessType = shower.accessType.en.toLowerCase();
      if (
        (activeTab === "public" && !accessType.includes("public")) ||
        (activeTab === "private" && !accessType.includes("private")) ||
        (activeTab === "government" && !accessType.includes("government"))
      ) {
        return false;
      }
    }

    // Search filter
    if (
      searchQuery &&
      !shower.name.en.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Woreda filter
    if (selectedWoreda && shower.woreda.en !== selectedWoreda) {
      return false;
    }

    // SubCity filter
    if (selectedSubCity && shower.subCity.en !== selectedSubCity) {
      return false;
    }

    return true;
  });

  const getAccessTypeColor = (accessType: string) => {
    if (accessType.toLowerCase().includes("public")) return "green";
    if (accessType.toLowerCase().includes("private")) return "blue";
    if (accessType.toLowerCase().includes("government")) return "orange";
    return "gray";
  };

  const getSocialMediaIcon = (url: string) => {
    if (url.includes("facebook")) return <IconBrandFacebook size={20} />;
    if (url.includes("twitter")) return <IconBrandTwitter size={20} />;
    if (url.includes("instagram")) return <IconBrandInstagram size={20} />;
    if (url.includes("youtube")) return <IconBrandYoutube size={20} />;
    if (url.includes("linkedin")) return <IconBrandLinkedin size={20} />;
    if (url.includes("telegram")) return <IconBrandTelegram size={20} />;
    return <IconWorld size={20} />;
  };

  const getSocialMediaColor = (url: string) => {
    if (url.includes("facebook")) return "#1877F2";
    if (url.includes("twitter")) return "#1DA1F2";
    if (url.includes("instagram")) return "#E1306C";
    if (url.includes("youtube")) return "#FF0000";
    if (url.includes("linkedin")) return "#0077B5";
    if (url.includes("telegram")) return "#0088CC";
    return "blue";
  };

  const getSocialMediaName = (url: string) => {
    if (url.includes("facebook")) return "Facebook";
    if (url.includes("twitter")) return "Twitter";
    if (url.includes("instagram")) return "Instagram";
    if (url.includes("youtube")) return "YouTube";
    if (url.includes("linkedin")) return "LinkedIn";
    if (url.includes("telegram")) return "Telegram";
    return "Website";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
       <Loader/>
      </div>
    );
  }

  if (error) {
    return (
      <Container size={1400} className="py-16">
        <Paper withBorder p="xl" radius="md" className="text-center">
          <ThemeIcon
            size={60}
            radius={60}
            color="red"
            variant="light"
            className="mx-auto mb-4"
          >
            <IconWash size={30} />
          </ThemeIcon>
          <Title order={3} className="mb-2">
            Error Loading Data
          </Title>
          <Text color="dimmed" className="mb-4">
            {error}
          </Text>
          <Button
            variant="subtle"
            color="red"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-700 to-blue-900 py-16">
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
                <span>Woreda Facilities</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-5xl font-bold mb-4"
              data-aos-delay="100"
            >
              Public Shower Facilities
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100"
              data-aos-delay="200"
            >
              Find clean and accessible shower facilities across all woredas
            </Text>
          </div>
        </Container>
      </div>

      {/* Filter Section */}
      <Container size={1400} className="py-8">
        <Paper withBorder p="md" radius="md" shadow="sm" className="bg-white">
          <Grid gutter="md">
            <Grid.Col span={12} md={4}>
              <TextInput
                icon={<IconSearch size={16} />}
                placeholder="Search by facility name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                radius="md"
              />
            </Grid.Col>
            <Grid.Col span={12} md={3}>
              <Select
                icon={<IconFilter size={16} />}
                placeholder="Filter by sub-city"
                data={subCities}
                value={selectedSubCity}
                onChange={setSelectedSubCity}
                clearable
                radius="md"
              />
            </Grid.Col>
            <Grid.Col span={12} md={3}>
              <Select
                icon={<IconFilter size={16} />}
                placeholder="Filter by woreda"
                data={woredas}
                value={selectedWoreda}
                onChange={setSelectedWoreda}
                clearable
                radius="md"
              />
            </Grid.Col>
            <Grid.Col span={12} md={2}>
              <Button
                variant="outline"
                color="gray"
                fullWidth
                radius="md"
                onClick={() => {
                  setSelectedWoreda(null);
                  setSelectedSubCity(null);
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </Grid.Col>
          </Grid>

          <Tabs
            value={activeTab}
            onTabChange={setActiveTab}
            className="mt-4"
            variant="outline"
            radius="md"
          >
            <Tabs.List grow>
              <Tabs.Tab value="all" icon={<IconBuildingCommunity size={14} />}>
                All Facilities
              </Tabs.Tab>
              <Tabs.Tab value="public" icon={<IconUsers size={14} />}>
                Public
              </Tabs.Tab>
              <Tabs.Tab value="private" icon={<IconWash size={14} />}>
                Private
              </Tabs.Tab>
              <Tabs.Tab value="government" icon={<IconInfoCircle size={14} />}>
                Government
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Paper>
      </Container>

      {/* Shower Facilities Section */}
      <Container size={1400} className="py-8">
        {filteredShowers.length > 0 ? (
          <Grid gutter="xl">
            {filteredShowers.map((shower, index) => (
              <Grid.Col key={shower.id} span={12} sm={6} lg={4}>
                <Card
                  shadow="sm"
                  padding="lg"
                  className="h-full bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg flex flex-col"
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 100}
                >
                  <Card.Section>
                    <Image
                      src={`${import.meta.env.VITE_FILE_API}${shower.image}`}
                      alt={shower.name.en}
                      height={400}
                      className="rounded-t-xl object-fill p-5 w-full"
                      withPlaceholder
                    />
                  </Card.Section>

                  <Group position="apart" className="mt-4">
                    <Title
                      order={3}
                      className="text-lg font-bold text-blue-800"
                    >
                      {shower.name.en}
                    </Title>
                    <Badge
                      color={getAccessTypeColor(shower.accessType.en)}
                      variant="light"
                      radius="sm"
                    >
                      {shower.accessType.en}
                    </Badge>
                  </Group>

                  <Group spacing={5} className="mt-2">
                    <ThemeIcon size="sm" variant="light" color="blue">
                      <IconMapPin size={14} />
                    </ThemeIcon>
                    <Text size="sm">
                      {shower.woreda.en}, {shower.subCity.en}
                    </Text>
                  </Group>

                  <Group spacing="xs" className="mt-2">
                    <ThemeIcon size="sm" variant="light" color="blue">
                      <IconClock size={14} />
                    </ThemeIcon>
                    <Text size="sm">{shower.operatingHours.en}</Text>
                  </Group>

                  <Group spacing="xs" className="mt-2">
                    <ThemeIcon size="sm" variant="light" color="blue">
                      <IconUsers size={14} />
                    </ThemeIcon>
                    <Text size="sm">{shower.capacity}</Text>
                  </Group>

                  <Text className="text-gray-600 mt-3 line-clamp-2">
                    {shower.description.en}
                  </Text>

                  <Button
                    className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    fullWidth
                    radius="md"
                    onClick={() => {
                      setSelectedShower(shower);
                      setModalTab("details");
                    }}
                  >
                    View Facility Details
                  </Button>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Paper
            withBorder
            p="xl"
            radius="md"
            shadow="sm"
            className="text-center"
          >
            <ThemeIcon
              size={60}
              radius={60}
              color="blue"
              variant="light"
              className="mx-auto mb-4"
            >
              <IconWash size={30} />
            </ThemeIcon>
            <Title order={3} className="mb-2">
              No Shower Facilities Found
            </Title>
            <Text color="dimmed" className="mb-4">
              Try adjusting your search or filters
            </Text>
            <Button
              variant="subtle"
              color="blue"
              onClick={() => {
                setActiveTab("all");
                setSelectedWoreda(null);
                setSelectedSubCity(null);
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </Paper>
        )}
      </Container>

      {/* Shower Facility Modal */}
      <Modal
        opened={!!selectedShower}
        onClose={() => setSelectedShower(null)}
        title={
          <Title order={3} className="text-blue-800">
            {selectedShower?.name.en}
          </Title>
        }
        size="xl"
        overlayBlur={3}
        overlayOpacity={0.7}
        radius="lg"
        padding="xl"
      >
        {selectedShower && (
          <div>
            <Tabs value={modalTab} onTabChange={setModalTab} variant="outline">
              <Tabs.List grow>
                <Tabs.Tab value="details" icon={<IconInfoCircle size={16} />}>
                  Details
                </Tabs.Tab>
                <Tabs.Tab
                  value="about"
                  icon={<IconBuildingCommunity size={16} />}
                >
                  About Us
                </Tabs.Tab>
                <Tabs.Tab value="contacts" icon={<IconAddressBook size={16} />}>
                  Contacts
                </Tabs.Tab>
                <Tabs.Tab value="location" icon={<IconMapPin size={16} />}>
                  Location
                </Tabs.Tab>
              </Tabs.List>
              <div className="flex-shrink-0 w-full md:w-1/3">
                {/* <Image
                  src={`${import.meta.env.VITE_FILE_API}${selectedShower.image}`}
                  alt={selectedShower.name.en}
                  width={300}
                  height={200}
                  className="rounded-lg object-contain w-full h-full"
                  withPlaceholder
                /> */}
              </div>
              <Tabs.Panel value="details" pt="md">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="flex-1">
                    <Group position="apart" className="mb-3">
                      <Badge color="blue" size="lg" radius="sm">
                        <span className="font-bold text-blue-700">
                          Sub City :{" "}
                        </span>{" "}
                        {selectedShower.subCity.en}
                      </Badge>
                      <Badge color="blue" size="lg" radius="sm">
                        <span className="font-bold text-blue-700">
                          Woreda :{" "}
                        </span>{" "}
                        {selectedShower.woreda.en}
                      </Badge>
                      <Badge
                        color={getAccessTypeColor(selectedShower.accessType.en)}
                        size="lg"
                        radius="sm"
                      >
                        {selectedShower.accessType.en}
                      </Badge>
                    </Group>

                    <Text className="mb-4 text-gray-700">
                      ✅
                      <span className="font-bold text-blue-700">
                        Description :{" "}
                      </span>{" "}
                      {selectedShower.description.en}
                    </Text>

                    <Stack spacing="sm">
                      <Group spacing="xs">
                        <ThemeIcon size="sm" variant="light" color="blue">
                          <IconClock size={14} />
                        </ThemeIcon>
                        <p>Operationg Hours</p>
                        <Text>{selectedShower.operatingHours.en}</Text>
                      </Group>

                      <Group spacing="xs">
                        <ThemeIcon size="sm" variant="light" color="blue">
                          <IconUsers size={14} />
                        </ThemeIcon>
                        <p>Woreda Capacity</p>
                        <Text>{selectedShower.capacity}</Text>
                      </Group>
                    </Stack>
                  </div>
                </div>

                <Divider className="my-4" />

                <Title order={4} className="mb-3">
                  Amenities
                </Title>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {selectedShower.amenities?.map((amenity, i) => (
                    <Paper key={i} withBorder p="sm" radius="md">
                      <Group spacing="xs">
                        <ThemeIcon size="sm" variant="light" color="blue">
                          <IconWash size={14} />
                        </ThemeIcon>
                        <Text>{amenity}</Text>
                      </Group>
                    </Paper>
                  ))}
                </div>

                <Divider className="my-4" />

                <Title order={4} className="mb-3">
                  Maintenance Schedule
                </Title>
                <Paper withBorder p="md" radius="md">
                  <Group spacing="xs">
                    <ThemeIcon size="sm" variant="light" color="blue">
                      <IconCalendar size={14} />
                    </ThemeIcon>
                    <Text>{selectedShower.maintenanceSchedule.en}</Text>
                  </Group>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="about" pt="md">
                <Stack spacing="md">
                  {selectedShower.mission && (
                    <Paper withBorder p="md" radius="md">
                      <Title order={4} className="mb-2">
                        Our Mission
                      </Title>
                      <Text className="text-gray-700">
                        {selectedShower.mission.en}
                      </Text>
                    </Paper>
                  )}

                  {selectedShower.vision && (
                    <Paper withBorder p="md" radius="md">
                      <Title order={4} className="mb-2">
                        Our Vision
                      </Title>
                      <Text className="text-gray-700">
                        {selectedShower.vision.en}
                      </Text>
                    </Paper>
                  )}

                  {selectedShower.values && (
                    <Paper withBorder p="md" radius="md">
                      <Title order={4} className="mb-2">
                        Our Values
                      </Title>
                      <List spacing="sm">
                        {selectedShower.values.map((value, i) => (
                          <List.Item
                            key={i}
                            icon={<IconStar size={16} color="gold" />}
                          >
                            {value}
                          </List.Item>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="contacts" pt="md">
                <Stack spacing="md">
                  <Paper withBorder p="md" radius="md" shadow="sm">
                    <Title order={4} className="mb-3">
                      Primary Contact
                    </Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Text size="sm" color="dimmed">
                          Contact Person
                        </Text>
                        <Group spacing="xs" className="mt-1">
                          <IconUsers size={16} color="blue" />
                          <Text>{selectedShower.contactPerson.en}</Text>
                        </Group>
                      </div>
                      <div>
                        <Text size="sm" color="dimmed">
                          Phone Number
                        </Text>
                        <Group spacing="xs" className="mt-1">
                          <IconPhone size={16} color="blue" />
                          <Anchor
                            href={`tel:${selectedShower.contactPhone}`}
                            target="_blank"
                          >
                            {selectedShower.contactPhone}
                          </Anchor>
                        </Group>
                      </div>
                      {selectedShower.email && (
                        <div>
                          <Text size="sm" color="dimmed">
                            Email
                          </Text>
                          <Group spacing="xs" className="mt-1">
                            <IconMail size={16} color="blue" />
                            <Anchor
                              href={`mailto:${selectedShower.email}`}
                              target="_blank"
                            >
                              {selectedShower.email}
                            </Anchor>
                          </Group>
                        </div>
                      )}
                    </div>
                  </Paper>

                  {selectedShower.additionalContacts && (
                    <Paper withBorder p="md" radius="md" shadow="sm">
                      <Title order={4} className="mb-3">
                        Additional Contacts
                      </Title>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedShower.additionalContacts.map((contact, i) => (
                          <Paper key={i} withBorder p="sm" radius="md">
                            <Group spacing="xs">
                              <Avatar color="blue" radius="xl" size="sm">
                                {i + 1}
                              </Avatar>
                              <Anchor href={`tel:${contact}`} target="_blank">
                                {contact}
                              </Anchor>
                            </Group>
                          </Paper>
                        ))}
                      </div>
                    </Paper>
                  )}

                  {selectedShower.socialMedia && (
                    <Paper withBorder p="md" radius="md" shadow="sm">
                      <Title order={4} className="mb-3">
                        Social Media & Website
                      </Title>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedShower.socialMedia.map((link, i) => (
                          <Anchor
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline={false}
                          >
                            <Paper
                              withBorder
                              p="sm"
                              radius="md"
                              style={{
                                backgroundColor:
                                  getSocialMediaColor(link) + "10",
                                borderColor: getSocialMediaColor(link) + "30",
                              }}
                              className="hover:shadow-md transition-all"
                            >
                              <Center>
                                <ThemeIcon
                                  size="xl"
                                  radius="xl"
                                  variant="light"
                                  color={getSocialMediaColor(link)}
                                >
                                  {getSocialMediaIcon(link)}
                                </ThemeIcon>
                              </Center>
                              <Text size="sm" align="center" mt="sm">
                                {getSocialMediaName(link)}
                              </Text>
                            </Paper>
                          </Anchor>
                        ))}
                      </div>
                    </Paper>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="location" pt="md">
                <Stack spacing="md">
                  <Paper withBorder p="md" radius="md" shadow="sm">
                    <Title order={4} className="mb-2">
                      Location Details
                    </Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Text size="sm" color="dimmed">
                          Administrative Area
                        </Text>
                        <Group spacing="xs" className="mt-1">
                          <IconBuildingCommunity size={16} color="blue" />
                          <Text>
                            {selectedShower.woreda.en},{" "}
                            {selectedShower.subCity.en}
                          </Text>
                        </Group>
                      </div>
                    </div>
                  </Paper>

                  {selectedShower.serviceAreas && (
                    <Paper withBorder p="md" radius="md" shadow="sm">
                      <Title order={4} className="mb-2">
                        Service Areas Covered
                      </Title>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedShower.serviceAreas.map((area, i) => (
                          <Badge
                            key={i}
                            variant="dot"
                            color="blue"
                            size="lg"
                            radius="sm"
                            fullWidth
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </Paper>
                  )}

                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    shadow="sm"
                    className="mt-4"
                  >
                    <Title order={4} className="mb-2">
                      Map Location
                    </Title>
                    <div className="h-96 w-full rounded-md overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={selectedShower.location.en}
                        allowFullScreen
                      ></iframe>
                    </div>
                    <Text size="sm" color="dimmed" className="mt-2">
                      Interactive map showing the location of{" "}
                      {selectedShower.name.en}
                    </Text>
                  </Paper>
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Space h="xl" />

            <Button
              fullWidth
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              radius="md"
              onClick={() => setSelectedShower(null)}
            >
              Close Details
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WoredaShowersViewer;
