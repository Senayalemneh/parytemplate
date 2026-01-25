import React from "react";
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
  ThemeIcon,
  Code,
  Box,
  CopyButton,
  ActionIcon,
  Tooltip,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import {
  IconMapPin,
  IconClock,
  IconPhone,
  IconMail,
  IconWorld,
  IconCar,
  IconBus,
  IconTrain,
  IconAccessible,
  IconCopy,
  IconCheck,
  IconNavigation,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const LocationPage = () => {
  const { t } = useTranslation();
  const gpsCoordinates = "8.989561, 38.766065";
  const googleMapsLink = `https://www.google.com/maps?q=${gpsCoordinates}`;

  const contactInfo = [
    {
      icon: <IconPhone size={18} />,
      label: t("locationpage.contact.phone"),
      value: "+251 123 456 789",
    },
    {
      icon: <IconMail size={18} />,
      label: t("locationpage.contact.email"),
      value: "bsubcity@gmail.com",
    },
    {
      icon: <IconWorld size={18} />,
      label: t("locationpage.contact.website"),
      value: "http://boleprosperityparty.org",
    },
  ];

  const operatingHours = [
    {
      day: t("locationpage.hours.weekdays"),
      hours: t("locationpage.hours.weekdaysTime"),
    },
    {
      day: t("locationpage.hours.saturday"),
      hours: t("locationpage.hours.saturdayTime"),
    },
    {
      day: t("locationpage.hours.sunday"),
      hours: t("locationpage.hours.closed"),
    },
  ];

  const transportationOptions = [
    {
      icon: <IconCar size={24} />,
      name: t("locationpage.transport.car"),
      desc: t("locationpage.transport.carDesc"),
    },
    {
      icon: <IconBus size={24} />,
      name: t("locationpage.transport.bus"),
      desc: t("locationpage.transport.busDesc"),
    },
    {
      icon: <IconTrain size={24} />,
      name: t("locationpage.transport.train"),
      desc: t("locationpage.transport.trainDesc"),
    },
    {
      icon: <IconAccessible size={24} />,
      name: t("locationpage.transport.accessible"),
      desc: t("locationpage.transport.accessibleDesc"),
    },
  ];

  const nearbyLandmarks = [
    t("locationpage.landmarks.airport"),
    t("locationpage.landmarks.mall"),
    t("locationpage.landmarks.church"),
    t("locationpage.landmarks.supermarket"),
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="w-full bg-blue-800 py-16">
        <Container size={1400}>
          <Stack align="center" spacing="sm">
            <Badge
              size="xl"
              radius="sm"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              className="mb-4"
            >
              <Group spacing="xs">
                <IconMapPin size={18} />
                <span>{t("locationpage.hero.badge")}</span>
              </Group>
            </Badge>

            <Title
              order={1}
              className="text-4xl md:text-6xl font-bold text-white text-center"
            >
              {t("locationpage.hero.title")}
            </Title>

            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100 text-center"
            >
              {t("locationpage.hero.subtitle")}
            </Text>

            <ActionIcon
              component="a"
              href={googleMapsLink}
              target="_blank"
              size="xl"
              radius="xl"
              variant="filled"
              color="white"
              className="mt-6 text-blue-700 hover:scale-110 transition-transform"
              title={t("locationpage.hero.mapButton")}
            >
              <IconNavigation size={24} />
            </ActionIcon>
          </Stack>
        </Container>
      </div>

      {/* Main Content */}
      <Container size={1400} className="py-16">
        {/* Map Section */}
        <Card
          shadow="md"
          padding="xl"
          radius="lg"
          className="mb-16 border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Stack spacing="xl">
            <Title order={2} className="text-3xl text-center text-blue-800">
              {t("locationpage.map.title")}
            </Title>

            <Box className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Text size="sm" weight={600} className="text-gray-700">
                {t("locationpage.map.gpsLabel")}:
              </Text>
              <Group spacing="xs">
                <Code className="font-mono">{gpsCoordinates}</Code>
                <CopyButton value={gpsCoordinates} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={
                        copied
                          ? t("locationpage.map.copied")
                          : t("locationpage.map.copy")
                      }
                    >
                      <ActionIcon
                        color={copied ? "teal" : "blue"}
                        onClick={copy}
                        variant="light"
                      >
                        {copied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Box>

            {/* Google Maps Iframe */}
            <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 hover:border-blue-300 transition-all">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d42322.66476943609!2d38.766065427267236!3d8.989561015955031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85430fefa2a1%3A0x89be21e8aa34e1e6!2z4Yuo4Ymm4YiMIOGKreGNjeGIiCDhiqjhibDhiJsg4Yqg4Yi14Ymw4Yuz4Yuw4YitIHwg4YiY4YyI4YqT4Yqb!5e1!3m2!1sam!2set!4v1743186583807!5m2!1sam!2set"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("locationpage.map.iframeTitle")}
                className="hover:opacity-95 transition-opacity"
              />
            </div>
          </Stack>
        </Card>

        {/* Details Grid */}
        <Grid gutter="xl" className="mt-10">
          <Grid.Col span={12} md={6}>
            <Card
              shadow="sm"
              padding="xl"
              radius="lg"
              className="h-full border border-blue-100 hover:border-blue-200 transition-all"
            >
              <Stack spacing="md">
                <Title
                  order={3}
                  className="text-2xl text-blue-800 flex items-center gap-2"
                >
                  <IconMapPin size={24} />
                  {t("locationpage.address.title")}
                </Title>

                <Text size="lg" className="text-gray-700">
                  {t("locationpage.address.line1")}
                  <br />
                  {t("locationpage.address.line2")}
                  <br />
                  {t("locationpage.address.poBox")}
                </Text>

                <Divider my="sm" />

                <Title
                  order={4}
                  className="text-lg text-gray-800 flex items-center gap-2"
                >
                  <IconClock size={20} />
                  {t("locationpage.hours.title")}
                </Title>

                <List spacing="xs" center>
                  {operatingHours.map((item, index) => (
                    <List.Item
                      key={index}
                      icon={
                        <ThemeIcon color="blue" size={20} radius="xl">
                          {index === 2 ? (
                            <Text size="xs" weight={700}>
                              ✕
                            </Text>
                          ) : (
                            <Text size="xs" weight={700}>
                              ✓
                            </Text>
                          )}
                        </ThemeIcon>
                      }
                    >
                      <Text span weight={500}>
                        {item.day}:
                      </Text>{" "}
                      {item.hours}
                    </List.Item>
                  ))}
                </List>

                <Divider my="sm" />

                <SimpleGrid cols={1} spacing="xs">
                  {contactInfo.map((item, index) => (
                    <Group key={index} spacing="sm">
                      <Avatar size="sm" color="blue" radius="xl">
                        {item.icon}
                      </Avatar>
                      <div>
                        <Text size="sm" color="dimmed">
                          {item.label}
                        </Text>
                        <Text weight={500}>{item.value}</Text>
                      </div>
                    </Group>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={12} md={6}>
            <Card
              shadow="sm"
              padding="xl"
              radius="lg"
              className="h-full border border-blue-100 hover:border-blue-200 transition-all"
            >
              <Stack spacing="md">
                <Title order={3} className="text-2xl text-blue-800">
                  {t("locationpage.transport.title")}
                </Title>

                <Text size="lg" className="text-gray-700">
                  {t("locationpage.transport.description")}
                </Text>

                <Divider my="sm" />

                <SimpleGrid
                  cols={2}
                  spacing="lg"
                  breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                >
                  {transportationOptions.map((item, index) => (
                    <Card
                      key={index}
                      padding="md"
                      radius="md"
                      withBorder
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <Stack align="center" spacing="sm">
                        <ThemeIcon
                          color="blue"
                          size="xl"
                          radius="xl"
                          variant="light"
                        >
                          {item.icon}
                        </ThemeIcon>
                        <Text weight={700} size="md">
                          {item.name}
                        </Text>
                        <Text size="sm" color="dimmed" align="center">
                          {item.desc}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>

                <Divider my="sm" />

                <Box>
                  <Text weight={600} className="mb-2">
                    {t("locationpage.parking.title")}:
                  </Text>
                  <Text color="dimmed">
                    {t("locationpage.parking.description")}
                  </Text>
                </Box>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Nearby Landmarks */}
        <Paper
          withBorder
          p="xl"
          radius="lg"
          shadow="sm"
          className="mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:shadow-md transition-shadow"
        >
          <Stack spacing="md">
            <Title order={3} className="text-2xl text-blue-800 text-center">
              {t("locationpage.landmarks.title")}
            </Title>

            <Text
              size="lg"
              color="dimmed"
              className="text-center max-w-2xl mx-auto"
            >
              {t("locationpage.landmarks.description")}
            </Text>

            <SimpleGrid
              cols={4}
              spacing="lg"
              breakpoints={[
                { maxWidth: "md", cols: 2 },
                { maxWidth: "sm", cols: 1 },
              ]}
              className="mt-6"
            >
              {nearbyLandmarks.map((landmark, index) => (
                <Group key={index} spacing="sm">
                  <ThemeIcon color="blue" size="md" radius="xl" variant="light">
                    {index + 1}
                  </ThemeIcon>
                  <Text>{landmark}</Text>
                </Group>
              ))}
            </SimpleGrid>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

export default LocationPage;
