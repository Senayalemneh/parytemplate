import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllUsers,
  getAllRoles,
  getAllWoredas,
  getAllPermissions,
  getTeamMembers,
  getBooks,
  getSubcityOfficials,
  getGalleries,
  getAllContact,
  getAllCompliant,
  getPartners,
  getNews,
  getAnnouncements,
  getEvents,
} from "../../services/api/main";

import {
  Card,
  Title,
  Text,
  Grid,
  Container,
  Loader,
  Center,
  Group,
  Badge,
  Tabs,
  ThemeIcon,
  SimpleGrid,
  useMantineTheme,
  createStyles,
  Stack,
  Divider,
  Progress 
} from "@mantine/core";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Legend,
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
  RadialBarChart,
  RadialBar,
} from "recharts";

import {
  IconUsers,
  IconBriefcase,
  IconBook,
  IconBuilding,
  IconMail,
  IconAlertCircle,
  IconUserCheck,
  IconCamera,
  IconSpeakerphone,
  IconNews,
  IconCalendarEvent,
  IconUserHeart,
  IconChartPie,
  IconChartBar,
  IconChartLine,
  IconChartArea,
  IconChartRadar,
  IconChartScatter,
  IconChartInfographic,
  IconChartTreemap,
  IconChartSankey,
  IconChartFunnel,
  IconChartDonut,
  IconChartArcs,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  dashboardHeader: {
    marginBottom: theme.spacing.xl * 2,
    textAlign: "center",
  },
  statCard: {
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows.md,
    },
  },
  chartContainer: {
    height: 320,
    marginTop: theme.spacing.md,
  },
  tabList: {
    marginBottom: theme.spacing.xl,
  },
  tabLabel: {
    fontWeight: 600,
  },
}));

const iconsMap: Record<string, JSX.Element> = {
  users: <IconUsers size={32} />,
  roles: <IconBriefcase size={32} />,
  woredas: <IconBuilding size={32} />,
  permissions: <IconUserCheck size={32} />,
  teamMembers: <IconUserHeart size={32} />,
  books: <IconBook size={32} />,
  officials: <IconUsers size={32} />,
  galleries: <IconCamera size={32} />,
  contacts: <IconMail size={32} />,
  complaints: <IconAlertCircle size={32} />,
  partners: <IconUserHeart size={32} />,
  news: <IconNews size={32} />,
  announcements: <IconSpeakerphone size={32} />,
  events: <IconCalendarEvent size={32} />,
};

const chartIcons = {
  pie: <IconChartPie size={20} />,
  bar: <IconChartBar size={20} />,
  line: <IconChartLine size={20} />,
  area: <IconChartArea size={20} />,
  radar: <IconChartRadar size={20} />,
  scatter: <IconChartScatter size={20} />,
  composed: <IconChartInfographic size={20} />,
  treemap: <IconChartTreemap size={20} />,
  sankey: <IconChartSankey size={20} />,
  funnel: <IconChartFunnel size={20} />,
  radial: <IconChartDonut size={20} />,
  sunburst: <IconChartArcs size={20} />,
};

const colorPalette = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#6366F1", // indigo-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#64748B", // slate-500
];

const Dashboard = () => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>("summary");
  const [data, setData] = useState<Record<string, number>>({
    users: 0,
    roles: 0,
    woredas: 0,
    permissions: 0,
    teamMembers: 0,
    books: 0,
    officials: 0,
    galleries: 0,
    contacts: 0,
    complaints: 0,
    partners: 0,
    news: 0,
    announcements: 0,
    events: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          users,
          roles,
          woredas,
          permissions,
          teamMembers,
          books,
          officials,
          galleries,
          contacts,
          complaints,
          partners,
          news,
          announcements,
          events,
        ] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          getAllWoredas(),
          getAllPermissions(),
          getTeamMembers(),
          getBooks(),
          getSubcityOfficials(),
          getGalleries(),
          getAllContact(),
          getAllCompliant(),
          getPartners(),
          getNews(),
          getAnnouncements(),
          getEvents(),
        ]);

        setData({
          users: users?.length || 0,
          roles: roles?.data?.length || 0,
          woredas: woredas?.length || 0,
          permissions: permissions?.data?.length || 0,
          teamMembers: teamMembers?.length || 0,
          books: books?.length || 0,
          officials: officials?.length || 0,
          galleries: galleries?.length || 0,
          contacts: contacts?.length || 0,
          complaints: complaints?.length || 0,
          partners: partners?.length || 0,
          news: news?.data?.data?.length || 0,
          announcements: announcements?.length || 0,
          events: events?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = Object.entries(data).map(([key, value], index) => ({
    name: t(`dashboard.dataTypes.${key}`),
    value,
    fill: colorPalette[index % colorPalette.length],
  }));

  const topItems = [...chartData].sort((a, b) => b.value - a.value).slice(0, 5);

  const categoryData = [
    {
      name: t("dashboard.categories.userManagement"),
      value: data.users + data.roles + data.permissions + data.teamMembers,
    },
    {
      name: t("dashboard.categories.content"),
      value: data.books + data.news + data.announcements + data.events,
    },
    {
      name: t("dashboard.categories.media"),
      value: data.galleries,
    },
    {
      name: t("dashboard.categories.community"),
      value: data.contacts + data.complaints + data.partners,
    },
    {
      name: t("dashboard.categories.administrative"),
      value: data.woredas + data.officials,
    },
  ];

  const treemapData = {
    name: t("dashboard.allData"),
    children: chartData.map((item) => ({
      name: item.name,
      size: item.value,
      color: item.fill,
    })),
  };

  const funnelData = categoryData.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: colorPalette[index % colorPalette.length],
  }));

  const radialData = topItems.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: item.fill,
  }));

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" variant="dots" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <div className={classes.dashboardHeader}>
        <Title order={1} mb="sm">
          {t("dashboard.title")}
        </Title>
        <Text color="dimmed" size="lg">
          {t("dashboard.subtitle")}
        </Text>
      </div>

      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        className={classes.tabList}
      >
        <Tabs.List grow>
          <Tabs.Tab
            value="summary"
            icon={chartIcons.pie}
            className={classes.tabLabel}
          >
            {t("dashboard.tabs.summary")}
          </Tabs.Tab>
          <Tabs.Tab
            value="analytics"
            icon={chartIcons.bar}
            className={classes.tabLabel}
          >
            {t("dashboard.tabs.analytics")}
          </Tabs.Tab>
          <Tabs.Tab
            value="comparison"
            icon={chartIcons.line}
            className={classes.tabLabel}
          >
            {t("dashboard.tabs.comparison")}
          </Tabs.Tab>
          <Tabs.Tab
            value="advanced"
            icon={chartIcons.treemap}
            className={classes.tabLabel}
          >
            {t("dashboard.tabs.advanced")}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {activeTab === "summary" && (
        <>
          {/* Stats Overview Cards - Top Row */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
            <Card
              p="lg"
              radius="md"
              withBorder
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                color: "white",
                borderLeft: "4px solid #1E40AF",
              }}
            >
              <Group position="apart" mb="md">
                <ThemeIcon size="xl" variant="white" color="blue">
                  <IconUsers size={28} />
                </ThemeIcon>
                <Badge
                  variant="filled"
                  color="white"
                  style={{ color: "#1D4ED8" }}
                >
                  {data.users > 0 ? "Active" : "Empty"}
                </Badge>
              </Group>
              <Text size="sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                Total Users
              </Text>
              <Title order={2} mt={4} style={{ color: "white" }}>
                {data.users}
              </Title>
              <Text
                size="xs"
                mt="sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <span style={{ color: "white" }}>↑ 12%</span> from last month
              </Text>
            </Card>

            <Card
              p="lg"
              radius="md"
              withBorder
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
                color: "white",
                borderLeft: "4px solid #065F46",
              }}
            >
              <Group position="apart" mb="md">
                <ThemeIcon size="xl" variant="white" color="green">
                  <IconBriefcase size={28} />
                </ThemeIcon>
                <Badge
                  variant="filled"
                  color="white"
                  style={{ color: "#047857" }}
                >
                  {data.roles > 0 ? "Active" : "Empty"}
                </Badge>
              </Group>
              <Text size="sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                User Roles
              </Text>
              <Title order={2} mt={4} style={{ color: "white" }}>
                {data.roles}
              </Title>
              <Text
                size="xs"
                mt="sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <span style={{ color: "white" }}>↑ 5%</span> from last month
              </Text>
            </Card>

            <Card
              p="lg"
              radius="md"
              withBorder
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                color: "white",
                borderLeft: "4px solid #4338CA",
              }}
            >
              <Group position="apart" mb="md">
                <ThemeIcon size="xl" variant="white" color="indigo">
                  <IconBuilding size={28} />
                </ThemeIcon>
                <Badge
                  variant="filled"
                  color="white"
                  style={{ color: "#4F46E5" }}
                >
                  {data.woredas > 0 ? "Active" : "Empty"}
                </Badge>
              </Group>
              <Text size="sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                Woredas
              </Text>
              <Title order={2} mt={4} style={{ color: "white" }}>
                {data.woredas}
              </Title>
              <Text
                size="xs"
                mt="sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <span style={{ color: "white" }}>↑ 8%</span> from last month
              </Text>
            </Card>

            <Card
              p="lg"
              radius="md"
              withBorder
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "white",
                borderLeft: "4px solid #B45309",
              }}
            >
              <Group position="apart" mb="md">
                <ThemeIcon size="xl" variant="white" color="orange">
                  <IconBook size={28} />
                </ThemeIcon>
                <Badge
                  variant="filled"
                  color="white"
                  style={{ color: "#D97706" }}
                >
                  {data.books > 0 ? "Active" : "Empty"}
                </Badge>
              </Group>
              <Text size="sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                Books
              </Text>
              <Title order={2} mt={4} style={{ color: "white" }}>
                {data.books}
              </Title>
              <Text
                size="xs"
                mt="sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <span style={{ color: "white" }}>↑ 15%</span> from last month
              </Text>
            </Card>
          </SimpleGrid>

          {/* Main Content Area */}
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" mb="xl">
            {/* Data Distribution Pie Chart */}
            <Card
              shadow="sm"
              p="lg"
              radius="md"
              withBorder
              style={{ gridColumn: "span 2" }}
            >
              <Group position="apart" mb="md">
                <Group spacing="xs">
                  <ThemeIcon size="lg" variant="light" color="blue">
                    <IconChartPie size={20} />
                  </ThemeIcon>
                  <Title order={3}>Data Distribution</Title>
                </Group>
                <Badge variant="light" color="blue">
                  Current Month
                </Badge>
              </Group>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, t("dashboard.stats.count")]}
                      contentStyle={{
                        borderRadius: theme.radius.md,
                        border: "none",
                        boxShadow: theme.shadows.md,
                      }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: "20px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Quick Stats
              </Title>

              <Stack spacing="sm">
                {topItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: theme.radius.md,
                      background:
                        index % 2 === 0 ? theme.colors.gray[0] : "transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: item.fill,
                        marginRight: 12,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text size="sm" weight={500}>
                        {item.name}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {item.value} records
                      </Text>
                    </div>
                    <Badge
                      variant="light"
                      color={
                        index === 0
                          ? "green"
                          : index === 1
                          ? "blue"
                          : index === 2
                          ? "orange"
                          : "gray"
                      }
                    >
                      {index === 0
                        ? "Highest"
                        : index === 1
                        ? "High"
                        : "Medium"}
                    </Badge>
                  </div>
                ))}
              </Stack>

              <Divider my="md" />

              <Group position="apart">
                <Text size="sm" color="dimmed">
                  Total Records
                </Text>
                <Text size="sm" weight={600}>
                  {Object.values(data).reduce((a, b) => a + b, 0)}
                </Text>
              </Group>
              <Group position="apart" mt="xs">
                <Text size="sm" color="dimmed">
                  Active Categories
                </Text>
                <Text size="sm" weight={600}>
                  {Object.values(data).filter((v) => v > 0).length} /{" "}
                  {Object.keys(data).length}
                </Text>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Bottom Row - Additional Stats */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {[data.teamMembers, data.officials, data.galleries].map(
              (value, index) => {
                const titles = ["Team Members", "Officials", "Galleries"];
                const icons = [
                  <IconUserHeart size={20} />,
                  <IconUsers size={20} />,
                  <IconCamera size={20} />,
                ];
                const colors = ["violet", "cyan", "pink"];

                return (
                  <Card key={index} p="md" radius="md" withBorder>
                    <Group>
                      <ThemeIcon
                        size="lg"
                        variant="light"
                        color={colors[index]}
                      >
                        {icons[index]}
                      </ThemeIcon>
                      <div>
                        <Text size="sm" color="dimmed">
                          {titles[index]}
                        </Text>
                        <Title order={3} mt={2}>
                          {value}
                        </Title>
                      </div>
                    </Group>
                    <Progress
                      value={
                        (value /
                          Math.max(
                            ...[
                              data.teamMembers,
                              data.officials,
                              data.galleries,
                            ]
                          )) *
                        100
                      }
                      mt="md"
                      size="sm"
                      color={colors[index]}
                    />
                  </Card>
                );
              }
            )}
          </SimpleGrid>
        </>
      )}

      {activeTab === "analytics" && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl">
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.line}
              <Title order={3}>{t("dashboard.cards.trendsOverTime")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colorPalette[0]}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name={t("dashboard.stats.count")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.area}
              <Title order={3}>{t("dashboard.cards.areaDistribution")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={colorPalette[1]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={colorPalette[1]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={colorPalette[1]}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name={t("dashboard.stats.count")}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.radial}
              <Title order={3}>{t("dashboard.cards.radialDistribution")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="20%"
                  outerRadius="100%"
                  data={radialData}
                >
                  <RadialBar
                    label={{ position: "insideStart", fill: "#fff" }}
                    background
                    dataKey="value"
                  />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.funnel}
              <Title order={3}>{t("dashboard.cards.dataFunnel")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </SimpleGrid>
      )}

      {activeTab === "comparison" && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl">
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.radar}
              <Title order={3}>{t("dashboard.cards.categoryComparison")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={categoryData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, "dataMax"]} />
                  <Radar
                    name={t("dashboard.stats.categories")}
                    dataKey="value"
                    stroke={colorPalette[2]}
                    fill={colorPalette[2]}
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.scatter}
              <Title order={3}>{t("dashboard.cards.dataCorrelation")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <XAxis
                    type="number"
                    dataKey="value"
                    name={t("dashboard.stats.count")}
                    label={{
                      value: t("dashboard.stats.count"),
                      position: "insideBottomRight",
                      offset: 0,
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    name={t("dashboard.stats.categories")}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                  <Legend />
                  <Scatter
                    name={t("dashboard.stats.dataPoints")}
                    data={chartData}
                    fill={colorPalette[3]}
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.composed}
              <Title order={3}>
                {t("dashboard.cards.comprehensiveOverview")}
              </Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="name" scale="band" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    barSize={20}
                    fill={colorPalette[4]}
                    name={t("dashboard.stats.count")}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={colorPalette[5]}
                    name={t("dashboard.stats.trend")}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </SimpleGrid>
      )}

      {activeTab === "advanced" && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl">
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.treemap}
              <Title order={3}>{t("dashboard.cards.dataHierarchy")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData.children}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                >
                  <Tooltip
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group spacing="xs" mb="md">
              {chartIcons.pie}
              <Title order={3}>{t("dashboard.cards.hierarchicalData")}</Title>
            </Group>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colorPalette[index % colorPalette.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, t("dashboard.stats.count")]}
                    contentStyle={{
                      borderRadius: theme.radius.md,
                      border: "none",
                      boxShadow: theme.shadows.md,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </SimpleGrid>
      )}
    </Container>
  );
};

export default Dashboard;
