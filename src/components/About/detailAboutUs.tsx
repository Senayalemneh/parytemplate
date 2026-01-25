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
  Accordion,
  Box,
  Image,
  useMantineTheme,
} from "@mantine/core";
import {
  IconEye,
  IconTarget,
  IconScale,
  IconBulb,
  IconChecklist,
  IconShieldCheck,
  IconHandStop,
  IconChartLine,
  IconUsers,
  IconScaleOutline,
  IconFileAnalytics,
  IconGavel,
  IconStar,
  IconFlag,
  IconBalance,
  IconHeartHandshake,
  IconHandshake,
  IconChartBar,
  IconShield,
  IconLockOpen,
} from "@tabler/icons-react";
import ETHFLAG from "../../assets/Flag_of_Ethiopia.svg"
import EthMap from "../../assets/ProEth.jpg"
import AOS from "aos";
import "aos/dist/aos.css";

const AboutParty = () => {
  const theme = useMantineTheme();

  React.useEffect(() => {
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

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <Box
        sx={(theme) => ({
          backgroundImage: theme.fn.gradient(heroGradient),
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url(/pattern.svg)", // Add a subtle pattern
            opacity: 0.05,
            pointerEvents: "none",
          },
        })}
        py={80}
      >
        <Container size={1400}>
          <Box className="text-center text-white" data-aos="fade-down">
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
                <span>Party Foundations</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              data-aos-delay="100"
              sx={{
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontFamily: theme.headings.fontFamily,
              }}
            >
              Our Guiding Principles & Values
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
              The vision, mission and core values that drive Ethiopia's
              Prosperity Party toward national transformation
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size={1400} py={80}>
        {/* Vision Section */}
        <Grid gutter={50} className="mb-24" align="center">
          <Grid.Col span={12} md={6} data-aos="fade-right">
            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Box>
                <Badge
                  variant="gradient"
                  gradient={cardGradient}
                  size="lg"
                  leftSection={<IconEye size={16} className="mt-1" />}
                  className="mb-4"
                  sx={{ boxShadow: theme.shadows.sm }}
                >
                  Our Vision
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
                  Ethiopia's Transformational Future
                </Title>
                <Text
                  size="lg"
                  className="text-gray-700"
                  sx={{
                    fontSize: theme.fontSizes.lg,
                    lineHeight: 1.7,
                  }}
                >
                  Seeing Ethiopia as a party capable of making Africa a model of
                  prosperity by 2030 through sustainable development, inclusive
                  growth, and democratic governance.
                </Text>

                <Box mt={30}>
                  <Divider
                    size="sm"
                    color={theme.colors.blue[3]}
                    sx={{ maxWidth: 120 }}
                    className="mb-4"
                  />
                  <Group spacing="sm">
                    {[1, 2, 3].map((i) => (
                      <ThemeIcon
                        key={i}
                        size={36}
                        radius="xl"
                        variant="gradient"
                        gradient={cardGradient}
                        sx={{ boxShadow: theme.shadows.sm }}
                      >
                        <IconStar size={18} />
                      </ThemeIcon>
                    ))}
                  </Group>
                </Box>
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={12} md={6} data-aos="fade-left">
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
                src="/ethiopia-future.jpg" // Replace with actual high-quality image
                alt="Ethiopia's vision"
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
                    <img src={ETHFLAG} className="w-full h-full  filter" />
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
                  "A prosperous Ethiopia leading Africa's renaissance"
                </Text>
              </Box>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Mission Section */}
        <Grid gutter={50} className="mb-24" align="center">
          <Grid.Col span={12} md={6} orderMd={2} data-aos="fade-left">
            <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
              <Box>
                <Badge
                  variant="gradient"
                  gradient={cardGradient}
                  size="lg"
                  leftSection={<IconTarget size={16} className="mt-1" />}
                  className="mb-4"
                  sx={{ boxShadow: theme.shadows.sm }}
                >
                  Our Mission
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
                  Building Ethiopia's Prosperity
                </Title>
                <Text
                  size="lg"
                  className="text-gray-700 mb-4"
                  sx={{
                    fontSize: theme.fontSizes.lg,
                    lineHeight: 1.7,
                  }}
                >
                  Building a democratic national federal system acceptable to
                  the people of Ethiopia through:
                </Text>
                <List
                  spacing="md"
                  size="lg"
                  sx={{
                    "& .mantine-List-itemWrapper": {
                      alignItems: "flex-start",
                    },
                  }}
                >
                  <List.Item
                    icon={
                      <ThemeIcon
                        size={24}
                        radius="xl"
                        variant="gradient"
                        gradient={cardGradient}
                      >
                        <IconUsers size={16} />
                      </ThemeIcon>
                    }
                    sx={{ marginBottom: theme.spacing.sm }}
                  >
                    Strengthening internal party unity and democratic processes
                  </List.Item>
                  <List.Item
                    icon={
                      <ThemeIcon
                        size={24}
                        radius="xl"
                        variant="gradient"
                        gradient={cardGradient}
                      >
                        <IconChartLine size={16} />
                      </ThemeIcon>
                    }
                    sx={{ marginBottom: theme.spacing.sm }}
                  >
                    Executing comprehensive political, economic and social
                    development plans
                  </List.Item>
                  <List.Item
                    icon={
                      <ThemeIcon
                        size={24}
                        radius="xl"
                        variant="gradient"
                        gradient={cardGradient}
                      >
                        <IconShieldCheck size={16} />
                      </ThemeIcon>
                    }
                  >
                    Ensuring universal prosperity under competent, ethical
                    leadership
                  </List.Item>
                </List>
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
                src="/ethiopia-development.jpg" // Replace with actual high-quality image
                alt="Party mission"
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
                   <img src={EthMap} className="w-full h-full  filter" />
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
                  "United in purpose, diverse in approach"
                </Text>
              </Box>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Values Section */}
        <Box className="mb-24" data-aos="fade-up">
          <Box className="text-center mb-16">
            <Badge
              variant="gradient"
              gradient={cardGradient}
              size="lg"
              leftSection={<IconScale size={16} className="mt-1" />}
              className="mb-4"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              Core Values
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
              What We Stand For
            </Title>
            <Text
              size="lg"
              className="max-w-3xl mx-auto text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
              }}
            >
              The fundamental beliefs that guide our actions and decisions at
              every level of governance
            </Text>
          </Box>

          <Grid gutter={30}>
            {[
              {
                icon: <IconUsers size={32} />,
                title: "Dignity of Citizens",
                description:
                  "Respecting the inherent worth and rights of all Ethiopians",
                color: "blue",
              },
              {
                icon: <IconFlag size={32} />,
                title: "National Sovereignty",
                description:
                  "Maintaining Ethiopia's independence and territorial integrity",
                color: "red",
              },
              {
                icon: <IconHeartHandshake size={32} />,
                title: "Justice & Equity",
                description:
                  "Ensuring fairness and equal opportunity for all citizens",
                color: "violet",
              },
              {
                icon: <IconHeartHandshake size={32} />,
                title: "National Unity",
                description: "Promoting solidarity among all Ethiopian peoples",
                color: "green",
              },
              {
                icon: <IconStar size={32} />,
                title: "Respect & Tolerance",
                description: "Valuing diversity and different perspectives",
                color: "orange",
              },
              {
                icon: <IconChartBar size={32} />,
                title: "Economic Progress",
                description:
                  "Driving sustainable development and shared prosperity",
                color: "teal",
              },
              {
                icon: <IconShield size={32} />,
                title: "Integrity",
                description:
                  "Upholding the highest ethical standards in governance",
                color: "indigo",
              },
              {
                icon: <IconLockOpen size={32} />,
                title: "Transparency",
                description:
                  "Operating with openness and public accountability",
                color: "cyan",
              },
            ].map((value, index) => (
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
        </Box>

        {/* Principles Section */}
        <Box className="mb-24" data-aos="fade-up">
          <Box className="text-center mb-16">
            <Badge
              variant="gradient"
              gradient={cardGradient}
              size="lg"
              leftSection={<IconBulb size={16} className="mt-1" />}
              className="mb-4"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              Guiding Principles
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
              Our Operational Foundations
            </Title>
            <Text
              size="lg"
              className="max-w-3xl mx-auto text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
              }}
            >
              The fundamental principles that shape our approach to governance
              and national development
            </Text>
          </Box>

          <Grid gutter={30}>
            {[
              {
                title: "Public Accountability",
                description:
                  "Operating with transparency and public awareness at all levels",
                icon: <IconFileAnalytics size={24} />,
              },
              {
                title: "Democratic Governance",
                description:
                  "Promoting participatory decision-making processes",
                icon: <IconUsers size={24} />,
              },
              {
                title: "Rule of Law",
                description:
                  "Ensuring all actions comply with constitutional principles",
                icon: <IconScale size={24} />,
              },
              {
                title: "Equitable Development",
                description:
                  "Balancing progress with fair distribution of resources",
                icon: <IconChartLine size={24} />,
              },
              {
                title: "Evidence-Based Policy",
                description:
                  "Basing decisions on empirical data and practical realities",
                icon: <IconChecklist size={24} />,
              },
              {
                title: "National Cohesion",
                description: "Strengthening social bonds among all Ethiopians",
                icon: <IconStar size={24} />,
              },
            ].map((principle, index) => (
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
        </Box>

        {/* Commission Purpose */}
        <Box className="mb-24" data-aos="fade-up">
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
                Commission Purpose
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
                Our Reason for Being
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
              To strengthen the institutional capacity of the Commission at all
              levels and contribute to the strength of the Party by effectively
              carrying out the duties and responsibilities assigned to it by the
              party bylaws in periodic inspection work and providing feedback
              along with recommendations on findings that can add value to the
              party's mission and Ethiopia's development goals.
            </Text>
          </Paper>
        </Box>

        {/* Duties and Responsibilities */}
        <Box data-aos="fade-up">
          <Box className="text-center mb-16">
            <Badge
              variant="gradient"
              gradient={cardGradient}
              size="lg"
              leftSection={<IconShieldCheck size={16} className="mt-1" />}
              className="mb-4"
              sx={{ boxShadow: theme.shadows.sm }}
            >
              Commission Mandate
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
              Duties and Responsibilities
            </Title>
            <Text
              size="lg"
              className="max-w-3xl mx-auto text-gray-700"
              sx={{
                fontSize: theme.fontSizes.lg,
                lineHeight: 1.7,
              }}
            >
              The essential functions that guide our daily operations and
              oversight activities
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
          >
            {[
              {
                title: "Bylaw Implementation",
                description:
                  "Monitor and ensure strict adherence to the party's bylaws and regulations across all organizational levels, providing guidance and corrective measures where necessary.",
                icon: <IconFileAnalytics size={20} />,
                color: "blue",
              },
              {
                title: "Political Quality Assurance",
                description:
                  "Maintain the political integrity and moral soundness of the Party through regular assessments, training programs, and ethical guidelines enforcement.",
                icon: <IconShieldCheck size={20} />,
                color: "green",
              },
              {
                title: "Asset Protection",
                description:
                  "Oversee the proper management, preservation and accountability of the Party's financial resources, physical assets and critical documents.",
                icon: <IconHandStop size={20} />,
                color: "orange",
              },
              {
                title: "Member Rights Protection",
                description:
                  "Safeguard the rights and interests of all party members and organizational bodies through established grievance mechanisms and regular monitoring.",
                icon: <IconUsers size={20} />,
                color: "violet",
              },
              {
                title: "Complaint Resolution",
                description:
                  "Receive, investigate and resolve complaints from members in a fair and timely manner, implementing systemic improvements based on findings.",
                icon: <IconScale size={20} />,
                color: "red",
              },
              {
                title: "Guideline Development",
                description:
                  "Develop comprehensive ethics, inspection and regulatory frameworks that align with the party's values and national legal requirements.",
                icon: <IconChecklist size={20} />,
                color: "teal",
              },
              {
                title: "Anti-Corruption Efforts",
                description:
                  "Lead the party's anti-corruption initiatives through prevention measures, awareness campaigns and coordinated investigations with relevant authorities.",
                icon: <IconGavel size={20} />,
                color: "indigo",
              },
              {
                title: "Ethical Investigations",
                description:
                  "Conduct thorough investigations into ethical violations at all party levels, recommending appropriate disciplinary actions and systemic reforms.",
                icon: <IconScaleOutline size={20} />,
                color: "cyan",
              },
            ].map((item, index) => (
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
        </Box>
      </Container>
    </div>
  );
};

export default AboutParty;
