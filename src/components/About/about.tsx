import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Group,
  ThemeIcon,
  List,
  Avatar,
  Badge,
  Divider,
  Paper,
  Accordion,
  Box,
  Image,
  useMantineTheme,
} from "@mantine/core";
import {
  IconFlag,
  IconChartLine,
  IconUsers,
  IconWorld,
  IconShield,
  IconScale,
  IconHeartHandshake,
  IconPlant,
  IconEye,
  IconTarget,
  IconBulb,
  IconChecklist,
  IconShieldCheck,
  IconHandStop,
  IconScaleOutline,
  IconFileAnalytics,
  IconGavel,
  IconStar,
  IconBalance,
  IconHandshake,
  IconChartBar,
  IconLockOpen,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";

// Assets
import pplogo from "../../assets/pp.svg";
import ETHFLAG from "../../assets/Flag_of_Ethiopia.svg";
import EthMap from "../../assets/ProEth.jpg";

export default function AboutPage() {
  const theme = useMantineTheme();
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Gradient colors
  const heroGradient = {
    from: theme.colors.blue[7],
    to: theme.colors.blue[9],
    deg: 135,
  };
  const cardGradient = {
    from: theme.colors.blue[5],
    to: theme.colors.blue[7],
    deg: 45,
  };

  const coreValues = [
    {
      icon: <IconUsers size={32} />,
      title: t("aboutuspage.coreValues.dignity.title"),
      description: t("aboutuspage.coreValues.dignity.description"),
      color: "blue",
    },
    {
      icon: <IconFlag size={32} />,
      title: t("aboutuspage.coreValues.sovereignty.title"),
      description: t("aboutuspage.coreValues.sovereignty.description"),
      color: "red",
    },
    {
      icon: <IconHeartHandshake size={32} />,
      title: t("aboutuspage.coreValues.justice.title"),
      description: t("aboutuspage.coreValues.justice.description"),
      color: "violet",
    },
    {
      icon: <IconHeartHandshake size={32} />,
      title: t("aboutuspage.coreValues.unity.title"),
      description: t("aboutuspage.coreValues.unity.description"),
      color: "green",
    },
    {
      icon: <IconStar size={32} />,
      title: t("aboutuspage.coreValues.respect.title"),
      description: t("aboutuspage.coreValues.respect.description"),
      color: "orange",
    },
    {
      icon: <IconChartBar size={32} />,
      title: t("aboutuspage.coreValues.economy.title"),
      description: t("aboutuspage.coreValues.economy.description"),
      color: "teal",
    },
    {
      icon: <IconShield size={32} />,
      title: t("aboutuspage.coreValues.integrity.title"),
      description: t("aboutuspage.coreValues.integrity.description"),
      color: "indigo",
    },
    {
      icon: <IconLockOpen size={32} />,
      title: t("aboutuspage.coreValues.transparency.title"),
      description: t("aboutuspage.coreValues.transparency.description"),
      color: "cyan",
    },
  ];

  const principles = [
    {
      title: t("aboutuspage.principles.accountability.title"),
      description: t("aboutuspage.principles.accountability.description"),
      icon: <IconFileAnalytics size={24} />,
    },
    {
      title: t("aboutuspage.principles.governance.title"),
      description: t("aboutuspage.principles.governance.description"),
      icon: <IconUsers size={24} />,
    },
    {
      title: t("aboutuspage.principles.ruleOfLaw.title"),
      description: t("aboutuspage.principles.ruleOfLaw.description"),
      icon: <IconScale size={24} />,
    },
    {
      title: t("aboutuspage.principles.development.title"),
      description: t("aboutuspage.principles.development.description"),
      icon: <IconChartLine size={24} />,
    },
    {
      title: t("aboutuspage.principles.evidence.title"),
      description: t("aboutuspage.principles.evidence.description"),
      icon: <IconChecklist size={24} />,
    },
    {
      title: t("aboutuspage.principles.cohesion.title"),
      description: t("aboutuspage.principles.cohesion.description"),
      icon: <IconStar size={24} />,
    },
  ];

  const commissionDuties = [
    {
      title: t("aboutuspage.duties.bylaw.title"),
      description: t("aboutuspage.duties.bylaw.description"),
      icon: <IconFileAnalytics size={20} />,
      color: "blue",
    },
    {
      title: t("aboutuspage.duties.quality.title"),
      description: t("aboutuspage.duties.quality.description"),
      icon: <IconShieldCheck size={20} />,
      color: "green",
    },
    {
      title: t("aboutuspage.duties.assets.title"),
      description: t("aboutuspage.duties.assets.description"),
      icon: <IconHandStop size={20} />,
      color: "orange",
    },
    {
      title: t("aboutuspage.duties.memberRights.title"),
      description: t("aboutuspage.duties.memberRights.description"),
      icon: <IconUsers size={20} />,
      color: "violet",
    },
    {
      title: t("aboutuspage.duties.complaints.title"),
      description: t("aboutuspage.duties.complaints.description"),
      icon: <IconScale size={20} />,
      color: "red",
    },
    {
      title: t("aboutuspage.duties.guidelines.title"),
      description: t("aboutuspage.duties.guidelines.description"),
      icon: <IconChecklist size={20} />,
      color: "teal",
    },
    {
      title: t("aboutuspage.duties.antiCorruption.title"),
      description: t("aboutuspage.duties.antiCorruption.description"),
      icon: <IconGavel size={20} />,
      color: "indigo",
    },
    {
      title: t("aboutuspage.duties.investigations.title"),
      description: t("aboutuspage.duties.investigations.description"),
      icon: <IconScaleOutline size={20} />,
      color: "cyan",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <Box
        className="bg-blue-800"
        sx={(theme) => ({
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url(/pattern.svg)",
            opacity: 0.05,
            pointerEvents: "none",
          },
        })}
        py={80}
      >
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              variant="gradient"
              gradient={cardGradient}
              className="mb-6"
              sx={{ boxShadow: theme.shadows.md }}
            >
              <Group spacing="xs">
                <IconBulb size={18} />
                <span>{t("aboutuspage.hero.badge")}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
              data-aos-delay="100"
              sx={{
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontFamily: theme.headings.fontFamily,
              }}
            >
              {t("aboutuspage.hero.title")}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto text-blue-100"
              data-aos-delay="200"
              sx={{
                fontSize: theme.fontSizes.xl,
                lineHeight: 1.6,
              }}
            >
              {t("aboutuspage.hero.subtitle")}
            </Text>
          </div>
        </Container>
      </Box>

      {/* Mission & History */}
      <div className="w-full py-20 bg-white">
        <Container size={1400}>
          <Grid gutter={50} align="center">
            <Grid.Col md={6} data-aos="fade-right">
              <div className="relative h-96 w-full bg-gradient-to-r from-white-600 to-blue-800 rounded-xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <IconHeartHandshake
                      size={60}
                      className="text-blue-800 mx-auto mb-4"
                    />
                    <img src={pplogo} className="w-40 h-40 filter" />
                    <Text size="xl" weight={700} className="text-blue-800">
                      {t("aboutuspage.mission.unityText")}
                    </Text>
                  </div>
                </div>
              </div>
            </Grid.Col>
            <Grid.Col md={6} data-aos="fade-left" data-aos-delay="200">
              <Badge
                variant="gradient"
                gradient={cardGradient}
                size="lg"
                leftSection={<IconTarget size={16} className="mt-1" />}
                className="mb-4"
                sx={{ boxShadow: theme.shadows.sm }}
              >
                {t("aboutuspage.mission.badge")}
              </Badge>
              <Title
                order={2}
                className="text-3xl font-bold text-blue-700 mb-6"
              >
                {t("aboutuspage.mission.title")}
              </Title>
              <Text size="lg" className="text-gray-700 mb-6">
                {t("aboutuspage.mission.description")}
              </Text>
              <List
                spacing="md"
                icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconShield size={16} />
                  </ThemeIcon>
                }
                className="text-gray-700"
              >
                <List.Item>{t("aboutuspage.mission.list.item1")}</List.Item>
                <List.Item>{t("aboutuspage.mission.list.item2")}</List.Item>
                <List.Item>{t("aboutuspage.mission.list.item3")}</List.Item>
                <List.Item>{t("aboutuspage.mission.list.item4")}</List.Item>
              </List>
            </Grid.Col>
          </Grid>
        </Container>
      </div>

      {/* Vision Section */}
      <div className="w-full py-20 bg-blue-50">
        <Container size={1400}>
          <Grid gutter={50} align="center">
            <Grid.Col span={12} md={6} orderMd={2} data-aos="fade-left">
              <Box
                sx={{ height: "100%", display: "flex", alignItems: "center" }}
              >
                <Box>
                  <Badge
                    variant="gradient"
                    gradient={cardGradient}
                    size="lg"
                    leftSection={<IconEye size={16} className="mt-1" />}
                    className="mb-4"
                    sx={{ boxShadow: theme.shadows.sm }}
                  >
                    {t("aboutuspage.vision.badge")}
                  </Badge>
                  <Title
                    order={2}
                    className="text-3xl mb-6"
                    sx={{
                      color: theme.colors.blue[8],
                      fontFamily: theme.headings.fontFamily,
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    {t("aboutuspage.vision.title")}
                  </Title>
                  <Text
                    size="lg"
                    className="text-gray-700"
                    sx={{
                      fontSize: theme.fontSizes.lg,
                      lineHeight: 1.7,
                    }}
                  >
                    {t("aboutuspage.vision.description")}
                  </Text>
                </Box>
              </Box>
            </Grid.Col>
            <Grid.Col span={12} md={6} orderMd={1} data-aos="fade-right">
              <Paper
                withBorder
                shadow="xl"
                p={0}
                radius="lg"
                sx={{
                  height: "100%",
                  borderColor: theme.colors.blue[2],
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: theme.fn.linearGradient(
                      0,
                      "rgba(0,0,0,0.1)",
                      "rgba(0,0,0,0.3)"
                    ),
                    zIndex: 1,
                  }}
                />
                <Image
                  src="/ethiopia-future.jpg"
                  alt={t("aboutuspage.vision.imageAlt")}
                  height={400}
                  fit="cover"
                  withPlaceholder
                  placeholder={
                    <Box
                      sx={{
                        height: 400,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.fn.linearGradient(
                          0,
                          theme.colors.blue[1],
                          theme.colors.blue[3]
                        ),
                      }}
                    >
                      <img src={ETHFLAG} className="w-full h-full filter" />
                    </Box>
                  }
                />
                <Box
                  p="xl"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                    color: "white",
                  }}
                >
                  <Text
                    weight={600}
                    size="lg"
                    sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                  >
                    {t("aboutuspage.vision.quote")}
                  </Text>
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </div>

      {/* Core Values */}
      <div className="w-full py-20 bg-white">
        <Container size={1400}>
          <Box className="text-center mb-16">
            <Badge
              variant="gradient"
              gradient={cardGradient}
              size="lg"
              leftSection={<IconScale size={16} className="mt-1" />}
              className="mb-4"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              {t("aboutuspage.coreValuesSection.badge")}
            </Badge>
            <Title
              order={2}
              className="text-4xl font-bold text-center text-blue-800 mb-4"
              data-aos="fade-up"
            >
              {t("aboutuspage.coreValuesSection.title")}
            </Title>
            <Text
              size="lg"
              className="max-w-3xl mx-auto text-gray-700"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {t("aboutuspage.coreValuesSection.subtitle")}
            </Text>
          </Box>

          <Grid gutter={30}>
            {coreValues.map((value, index) => (
              <Grid.Col key={index} span={12} sm={6} md={4} lg={3}>
                <Card
                  shadow="md"
                  padding="lg"
                  radius="lg"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: theme.shadows.lg,
                      borderColor: theme.colors[value.color][5],
                    },
                    borderTop: `3px solid ${theme.colors[value.color][5]}`,
                  }}
                  data-aos="fade-up"
                  data-aos-delay={(index % 4) * 100}
                >
                  <ThemeIcon
                    size={64}
                    radius={64}
                    variant="gradient"
                    gradient={{
                      from: theme.colors[value.color][6],
                      to: theme.colors[value.color][4],
                    }}
                    className="mb-4"
                    sx={{ boxShadow: theme.shadows.sm }}
                  >
                    {value.icon}
                  </ThemeIcon>
                  <Title
                    order={4}
                    className="mb-2"
                    sx={{
                      color: theme.colors[value.color][7],
                      fontFamily: theme.headings.fontFamily,
                    }}
                  >
                    {value.title}
                  </Title>
                  <Text
                    size="sm"
                    className="text-gray-600"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {value.description}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Policy Pillars */}
      <div className="w-full py-20 bg-blue-50">
        <Container size={1400}>
          <Title
            order={2}
            className="text-4xl font-bold text-center text-blue-800 mb-16"
            data-aos="fade-up"
          >
            {t("aboutuspage.policyPillars.political.title")}
          </Title>

          <Grid gutter={50}>
            <Grid.Col md={6} data-aos="zoom-in" data-aos-delay="100">
              <Card
                padding="xl"
                radius="lg"
                className="h-full border-t-4 border-blue-600 shadow-lg hover:shadow-xl transition"
              >
                <Group mb="xl">
                  <ThemeIcon size={60} radius={60} color="blue" variant="light">
                    <IconFlag size={30} />
                  </ThemeIcon>
                  <Title order={3} className="text-2xl font-bold">
                    {t("aboutuspage.policyPillars.political.title")}
                  </Title>
                </Group>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color="blue"
                      variant="light"
                      className="mt-1 mr-3"
                    >
                      <IconScale size={16} />
                    </ThemeIcon>
                    <Text className="text-gray-700">
                      {t("aboutuspage.policyPillars.political.item1")}
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color="blue"
                      variant="light"
                      className="mt-1 mr-3"
                    >
                      <IconShield size={16} />
                    </ThemeIcon>
                    <Text className="text-gray-700">
                      {t("aboutuspage.policyPillars.political.item2")}
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color="blue"
                      variant="light"
                      className="mt-1 mr-3"
                    >
                      <IconUsers size={16} />
                    </ThemeIcon>
                    <Text className="text-gray-700">
                      {t("aboutuspage.policyPillars.political.item3")}
                    </Text>
                  </div>
                </div>
              </Card>
            </Grid.Col>

            <Grid.Col md={6} data-aos="zoom-in" data-aos-delay="200">
              <Card
                padding="xl"
                radius="lg"
                className="h-full border-t-4 border-green-600 shadow-lg hover:shadow-xl transition"
              >
                <Group mb="xl">
                  <ThemeIcon
                    size={60}
                    radius={60}
                    color="green"
                    variant="light"
                  >
                    <IconChartLine size={30} />
                  </ThemeIcon>
                  <Title order={3} className="text-2xl font-bold">
                    {t("aboutuspage.policyPillars.economic.title")}
                  </Title>
                </Group>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color="green"
                      variant="light"
                      className="mt-1 mr-3"
                    >
                      <IconPlant size={16} />
                    </ThemeIcon>
                    <Text className="text-gray-700">
                      {t("aboutuspage.policyPillars.economic.item1")}
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color="green"
                      variant="light"
                      className="mt-1 mr-3"
                    >
                      <IconWorld size={16} />
                    </ThemeIcon>
                    <Text className="text-gray-700">
                      {t("aboutuspage.policyPillars.economic.item2")}
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <ThemeIcon
                      size={24}
                      radius="xl"
                      color="green"
                      variant="light"
                      className="mt-1 mr-3"
                    >
                      <IconHeartHandshake size={16} />
                    </ThemeIcon>
                    <Text className="text-gray-700">
                      {t("aboutuspage.policyPillars.economic.item3")}
                    </Text>
                  </div>
                </div>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </div>

      {/* Principles Section */}
      <div className="w-full py-20 bg-white">
        <Container size={1400}>
          <Box className="text-center mb-16">
            <Badge
              variant="gradient"
              gradient={cardGradient}
              size="lg"
              leftSection={<IconBulb size={16} className="mt-1" />}
              className="mb-4"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              {t("aboutuspage.principlesSection.badge")}
            </Badge>
            <Title
              order={2}
              className="text-4xl font-bold text-center text-blue-800 mb-4"
              data-aos="fade-up"
            >
              {t("aboutuspage.principlesSection.title")}
            </Title>
            <Text
              size="lg"
              className="max-w-3xl mx-auto text-gray-700"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {t("aboutuspage.principlesSection.subtitle")}
            </Text>
          </Box>

          <Grid gutter={30}>
            {principles.map((principle, index) => (
              <Grid.Col key={index} span={12} md={6} lg={4}>
                <Paper
                  withBorder
                  p="xl"
                  radius="lg"
                  shadow="sm"
                  sx={{
                    height: "100%",
                    borderTop: `3px solid ${theme.colors.blue[5]}`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: theme.shadows.md,
                    },
                  }}
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 100}
                >
                  <Group spacing="sm" className="mb-3">
                    <ThemeIcon
                      size={42}
                      radius="md"
                      variant="light"
                      color="blue"
                      sx={{
                        backgroundColor: theme.fn.rgba(
                          theme.colors.blue[1],
                          0.5
                        ),
                        color: theme.colors.blue[6],
                      }}
                    >
                      {principle.icon}
                    </ThemeIcon>
                    <Title
                      order={4}
                      sx={{
                        color: theme.colors.blue[8],
                        fontFamily: theme.headings.fontFamily,
                      }}
                    >
                      {principle.title}
                    </Title>
                  </Group>
                  <Text className="text-gray-700" sx={{ lineHeight: 1.7 }}>
                    {principle.description}
                  </Text>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Achievements */}
      <div className="w-full py-20 bg-blue-800 text-white" data-aos="fade-up">
        <Container size={1400}>
          <Title
            order={2}
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
          >
            {t("aboutuspage.achievements.title")}
          </Title>
          <Grid gutter={50}>
            {[
              {
                value: "10M+",
                label: t("aboutuspage.achievements.jobs"),
                delay: 100,
              },
              {
                value: "85%",
                label: t("aboutuspage.achievements.electricity"),
                delay: 200,
              },
              {
                value: "12",
                label: t("aboutuspage.achievements.universities"),
                delay: 300,
              },
              {
                value: "4.2%",
                label: t("aboutuspage.achievements.gdp"),
                delay: 400,
              },
            ].map((item, index) => (
              <Grid.Col md={3} key={index}>
                <div
                  className="text-center"
                  data-aos="fade-up"
                  data-aos-delay={item.delay}
                >
                  <Text
                    size="xl"
                    weight={700}
                    className="text-5xl md:text-6xl mb-3 text-blue-200"
                  >
                    {item.value}
                  </Text>
                  <Text size="lg">{item.label}</Text>
                </div>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Commission Purpose */}
      <div className="w-full py-20 bg-white">
        <Container size={1400}>
          <Paper
            withBorder
            p="xl"
            radius="lg"
            shadow="sm"
            sx={{
              background: theme.fn.linearGradient(
                0,
                theme.fn.rgba(theme.colors.blue[0], 0.8),
                theme.fn.rgba(theme.colors.blue[1], 0.8)
              ),
              borderColor: theme.colors.blue[3],
              position: "relative",
              overflow: "hidden",
              "&:before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "30%",
                background: "url(/pattern-blue.svg)",
                opacity: 0.05,
                pointerEvents: "none",
              },
            }}
            data-aos="fade-up"
          >
            <Box
              className="text-center mb-8"
              sx={{ position: "relative", zIndex: 1 }}
            >
              <Badge
                variant="gradient"
                gradient={cardGradient}
                size="lg"
                leftSection={<IconChecklist size={16} className="mt-1" />}
                className="mb-4"
                sx={{ boxShadow: theme.shadows.sm }}
              >
                {t("aboutuspage.commissionPurpose.badge")}
              </Badge>
              <Title
                order={2}
                className="text-3xl mb-4"
                sx={{
                  color: theme.colors.blue[8],
                  fontFamily: theme.headings.fontFamily,
                  fontWeight: 700,
                }}
              >
                {t("aboutuspage.commissionPurpose.title")}
              </Title>
            </Box>
            <Text
              size="lg"
              className="text-center text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
                position: "relative",
                zIndex: 1,
                maxWidth: 900,
                margin: "0 auto",
              }}
            >
              {t("aboutuspage.commissionPurpose.description")}
            </Text>
          </Paper>
        </Container>
      </div>

      {/* Duties and Responsibilities */}
      <div className="w-full py-20 bg-blue-50">
        <Container size={1400}>
          <Box className="text-center mb-16">
            <Badge
              variant="gradient"
              gradient={cardGradient}
              size="lg"
              leftSection={<IconShieldCheck size={16} className="mt-1" />}
              className="mb-4"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              {t("aboutuspage.dutiesSection.badge")}
            </Badge>
            <Title
              order={2}
              className="text-3xl mb-4"
              sx={{
                color: theme.colors.blue[8],
                fontFamily: theme.headings.fontFamily,
                fontWeight: 700,
              }}
              data-aos="fade-up"
            >
              {t("aboutuspage.dutiesSection.title")}
            </Title>
            <Text
              size="lg"
              className="max-w-3xl mx-auto text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
              }}
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {t("aboutuspage.dutiesSection.subtitle")}
            </Text>
          </Box>

          <Accordion
            variant="filled"
            radius="md"
            chevronPosition="left"
            sx={{
              "& .mantine-Accordion-control": {
                padding: theme.spacing.lg,
                "&:hover": {
                  backgroundColor: theme.fn.rgba(theme.colors.blue[1], 0.5),
                },
              },
              "& .mantine-Accordion-content": {
                padding: `${theme.spacing.md}px ${theme.spacing.lg}px ${theme.spacing.lg}px ${theme.spacing.lg}px`,
              },
            }}
            data-aos="fade-up"
          >
            {commissionDuties.map((item, index) => (
              <Accordion.Item key={index} value={item.title}>
                <Accordion.Control
                  icon={
                    <ThemeIcon
                      size={28}
                      radius="xl"
                      variant="light"
                      color={item.color}
                      sx={{
                        backgroundColor: theme.fn.rgba(
                          theme.colors[item.color][1],
                          0.5
                        ),
                      }}
                    >
                      {item.icon}
                    </ThemeIcon>
                  }
                  sx={{
                    "&:hover": {
                      backgroundColor: `${theme.fn.rgba(
                        theme.colors[item.color][1],
                        0.3
                      )} !important`,
                    },
                  }}
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 100}
                >
                  <Text
                    weight={600}
                    size="lg"
                    sx={{ color: theme.colors[item.color][7] }}
                  >
                    {item.title}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text className="text-gray-700" sx={{ lineHeight: 1.7 }}>
                    {item.description}
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </div>

      {/* Call to Action */}
      <div className="w-full py-20 bg-gradient-to-r from-blue-700 to-blue-900">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="zoom-in">
            <Title order={2} className="text-3xl md:text-4xl font-bold mb-6">
              {t("aboutuspage.cta.title")}
            </Title>
            <Text size="xl" className="mb-8 max-w-2xl mx-auto text-blue-100">
              {t("aboutuspage.cta.subtitle")}
            </Text>
            <div className="flex gap-4 justify-center">
            
              <button
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <a href="/contact">{t("aboutuspage.cta.button2")}</a>
                
              </button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
