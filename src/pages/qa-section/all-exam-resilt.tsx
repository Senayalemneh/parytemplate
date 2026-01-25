import { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Badge,
  Text,
  Card,
  Paper,
  Stack,
  Avatar,
  Progress,
  Tooltip,
  ScrollArea,
  SimpleGrid,
  useMantineTheme,
  createStyles,
  Table,
  Alert,
  NumberInput,
  Select,
  Input,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import { getAllResults } from "../../services/api/main";
import {
  IconAlertCircle,
  IconChartBar,
  IconInfoCircle,
  IconZoomIn,
  IconDownload,
  IconUser,
  IconClock,
  IconStar,
  IconTrophy,
  IconAward,
  IconMoodHappy,
  IconMoodSad,
  IconSearch,
  IconTrash,
  IconFilter,
  IconFilterOff,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

const useStyles = createStyles((theme) => ({
  performanceExcellent: {
    backgroundColor: theme.fn.rgba(theme.colors.teal[6], 0.1),
    color: theme.colors.teal[6],
  },
  performanceGood: {
    backgroundColor: theme.fn.rgba(theme.colors.blue[6], 0.1),
    color: theme.colors.blue[6],
  },
  performanceAverage: {
    backgroundColor: theme.fn.rgba(theme.colors.yellow[6], 0.1),
    color: theme.colors.yellow[6],
  },
  performancePoor: {
    backgroundColor: theme.fn.rgba(theme.colors.red[6], 0.1),
    color: theme.colors.red[6],
  },
}));

interface AnswerDetail {
  question_id: number;
  question_text: string;
  points_earned: number;
  points_possible: number;
  is_correct: boolean;
  answer_text: string | null;
  selected_options: string[];
  feedback?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface ResultItem {
  id: number;
  user_id: string;
  questionnaire_id: string;
  total_points: string;
  max_possible_points: string;
  percentage: string;
  answers_details: AnswerDetail[];
  created_at: string;
  updated_at: string;
  user: User;
}

interface PerformanceStats {
  totalParticipants: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  highestScorer?: ResultItem;
  lowestScorer?: ResultItem;
  performanceLevels: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  mostCommonQuestionnaire: [string, number];
  firstCompletion?: Date;
  lastCompletion?: Date;
}

const ViewResults = () => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);
  const [viewModalOpen, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  // Filter states
  const [minPoints, setMinPoints] = useState<number | "">("");
  const [maxPercentage, setMaxPercentage] = useState<number | "">(100);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [sortField, setSortField] = useState<string>("percentage");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const buildFilters = () => {
    const filters: any = {};

    if (minPoints !== "") filters.min_points = minPoints;
    if (maxPercentage !== "") filters.max_percentage = maxPercentage;
    if (dateRange[0]) filters.date_from = format(dateRange[0], "yyyy-MM-dd");
    if (dateRange[1]) filters.date_to = format(dateRange[1], "yyyy-MM-dd");

    return {
      filters,
      sort: {
        field: sortField,
        direction: sortDirection,
      },
      with_user: true,
    };
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = buildFilters();
      const resultsData = await getAllResults(filters);

      // Convert numeric string fields to numbers for all results and answers_details
      const processedResults = resultsData.map((result: any) => ({
        ...result,
        percentage: parseFloat(result.percentage || "0"),
        total_points: parseFloat(result.total_points || "0"),
        max_possible_points: parseFloat(result.max_possible_points || "0"),
        created_at: result.created_at || new Date().toISOString(),
        answers_details: Array.isArray(result.answers_details)
          ? result.answers_details.map((detail: any) => ({
              ...detail,
              points_earned:
                typeof detail.points_earned === "string"
                  ? parseFloat(detail.points_earned)
                  : detail.points_earned,
              points_possible:
                typeof detail.points_possible === "string"
                  ? parseFloat(detail.points_possible)
                  : detail.points_possible,
            }))
          : [],
      }));

      setResults(processedResults);
      calculateStatistics(processedResults);

      notifications.show({
        title: t("viewresultsadmin.notification.success") || "Success!",
        message:
          t("viewresultsadmin.notification.resultsLoaded") ||
          "Results loaded successfully",
        color: "teal",
      });
    } catch (error) {
      console.error("Error fetching results:", error);
      setError(
        t("viewresultsadmin.notification.failedLoadResults") ||
          "Failed to load results"
      );
      notifications.show({
        title: t("viewresultsadmin.notification.error") || "Error!",
        message:
          t("viewresultsadmin.notification.failedLoadResults") ||
          "Failed to load results",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (resultsData: ResultItem[]) => {
    if (resultsData.length === 0) return;

    const totalParticipants = resultsData.length;
    const averagePercentage =
      resultsData.reduce(
        (sum, result) => sum + parseFloat(result.percentage),
        0
      ) / totalParticipants;
    const highestScore = Math.max(
      ...resultsData.map((result) => parseFloat(result.percentage))
    );
    const lowestScore = Math.min(
      ...resultsData.map((result) => parseFloat(result.percentage))
    );
    const highestScorer = resultsData.find(
      (result) => parseFloat(result.percentage) === highestScore
    );
    const lowestScorer = resultsData.find(
      (result) => parseFloat(result.percentage) === lowestScore
    );

    // Count performance levels
    const performanceLevels = {
      excellent: resultsData.filter(
        (result) => parseFloat(result.percentage) >= 75
      ).length,
      good: resultsData.filter(
        (result) =>
          parseFloat(result.percentage) >= 50 &&
          parseFloat(result.percentage) < 75
      ).length,
      average: resultsData.filter(
        (result) =>
          parseFloat(result.percentage) >= 25 &&
          parseFloat(result.percentage) < 50
      ).length,
      poor: resultsData.filter((result) => parseFloat(result.percentage) < 25)
        .length,
    };

    // Find most common questionnaire
    const questionnaireCounts: Record<string, number> = {};
    resultsData.forEach((result) => {
      const id = result.questionnaire_id;
      questionnaireCounts[id] = (questionnaireCounts[id] || 0) + 1;
    });
    const mostCommonQuestionnaire = Object.entries(questionnaireCounts).sort(
      (a, b) => b[1] - a[1]
    )[0] || ["0", 0];

    // Calculate completion timeline
    const sortedByDate = [...resultsData].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const firstCompletion = sortedByDate[0]
      ? new Date(sortedByDate[0].created_at)
      : undefined;
    const lastCompletion = sortedByDate[sortedByDate.length - 1]
      ? new Date(sortedByDate[sortedByDate.length - 1].created_at)
      : undefined;

    setStats({
      totalParticipants,
      averagePercentage,
      highestScore,
      lowestScore,
      highestScorer,
      lowestScorer,
      performanceLevels,
      mostCommonQuestionnaire,
      firstCompletion,
      lastCompletion,
    });
  };

  const resetFilters = () => {
    setMinPoints("");
    setMaxPercentage(100);
    setDateRange([null, null]);
    setSortField("percentage");
    setSortDirection("desc");
    fetchResults();
  };

  const handleDownload = async () => {
    try {
      // Get all data without pagination for export
      const filters = buildFilters();
      const response = await getAllResults(filters);

      // Prepare CSV content
      const headers = [
        "ID",
        "User",
        "Questionnaire",
        "Points Earned",
        "Max Points",
        "Percentage",
        "Completion Date",
      ];

      const rows = response.map((result: ResultItem) => [
        result.id,
        `"${(result.user?.name || "Unknown User").replace(/"/g, '""')}"`,
        `Q-${result.questionnaire_id}`,
        result.total_points,
        result.max_possible_points,
        `${formatPercentage(result.percentage)}%`,
        `"${format(new Date(result.created_at), "yyyy-MM-dd HH:mm")}"`,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\r\n");

      // Trigger download
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `results_export_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("CSV export error:", error);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "UU";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getUserColor = (name?: string) => {
    if (!name) return "gray";
    const colors = [
      "blue",
      "teal",
      "violet",
      "pink",
      "orange",
      "cyan",
      "grape",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getPercentageColor = (percentage: string | number) => {
    const num =
      typeof percentage === "string" ? parseFloat(percentage) : percentage;
    if (num >= 75) return "teal";
    if (num >= 50) return "blue";
    if (num >= 25) return "yellow";
    return "red";
  };

  const formatPercentage = (percentage: string | number) => {
    const num =
      typeof percentage === "string" ? parseFloat(percentage) : percentage;
    return num.toFixed(1);
  };

  const handleView = (result: ResultItem) => {
    setSelectedResult(result);
    openViewModal();
  };

  useEffect(() => {
    fetchResults();
  }, [sortField, sortDirection]);

  const columns: MRT_ColumnDef<ResultItem>[] = [
    {
      accessorKey: "user.name",
      header: t("viewresultsadmin.columns.user") || "User",
      Cell: ({ row }) => (
        <Group spacing="sm">
          <Avatar
            color={getUserColor(row.original.user?.name)}
            size={36}
            radius="xl"
          >
            {getUserInitials(row.original.user?.name)}
          </Avatar>
          <div>
            <Text weight={600}>
              {row.original.user?.name ||
                t("viewresultsadmin.unknownUser") ||
                "Unknown User"}
            </Text>
            <Text size="xs" color="dimmed" style={{ lineHeight: 1.2 }}>
              {row.original.user?.email ||
                t("viewresultsadmin.noEmail") ||
                "No email provided"}
            </Text>
          </div>
        </Group>
      ),
      size: 250,
    },
    {
      accessorKey: "questionnaire_id",
      header: t("viewresultsadmin.columns.questionnaire") || "Questionnaire",
      Cell: ({ cell }) => (
        <Badge
          variant="outline"
          color="blue"
          radius="sm"
          leftSection={<IconUser size={12} />}
        >
          Q-{cell.getValue<string>()}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "score",
      header: t("viewresultsadmin.columns.score") || "Score",
      Cell: ({ row }) => (
        <Text weight={600}>
          {row.original.total_points}
          <Text span color="dimmed" size="sm">
            /{row.original.max_possible_points}
          </Text>
        </Text>
      ),
      size: 100,
    },
    {
      accessorKey: "percentage",
      header: t("viewresultsadmin.columns.performance") || "Performance",
      Cell: ({ row }) => (
        <Group spacing={5} noWrap>
          <Progress
            value={row.original.percentage}
            size="lg"
            style={{ flex: 1, minWidth: 150 }}
            color={getPercentageColor(row.original.percentage)}
            animate
            radius="xl"
          />
          <Badge
            color={getPercentageColor(row.original.percentage)}
            variant="light"
            style={{ minWidth: 70 }}
            radius="sm"
          >
            {formatPercentage(row.original.percentage)}%
          </Badge>
        </Group>
      ),
      size: 250,
    },
    {
      accessorKey: "created_at",
      header: t("viewresultsadmin.columns.date") || "Date",
      Cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return date ? (
          <Group spacing={5} noWrap>
            <IconClock size={14} color={theme.colors.gray[6]} />
            <div>
              <Text size="sm" weight={500}>
                {format(new Date(date), "MMM dd, yyyy")}
              </Text>
              <Text size="xs" color="dimmed">
                {format(new Date(date), "hh:mm a")}
              </Text>
            </div>
          </Group>
        ) : (
          t("viewresultsadmin.notAvailable") || "N/A"
        );
      },
      size: 150,
    },
    {
      id: "actions",
      header: t("viewresultsadmin.columns.actions") || "Actions",
      Cell: ({ row }) => (
        <Group spacing="xs">
          <Tooltip label={t("viewresultsadmin.viewDetails") || "View details"}>
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleView(row.original)}
            >
              <IconZoomIn size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      size: 120,
    },
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
          {error}
        </Alert>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box p="xl">
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          title={t("viewresultsadmin.noData") || "No Data"}
          color="blue"
        >
          {t("viewresultsadmin.noResultsFound") ||
            "No results found in the database."}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {crudLoading && <Loader />}
      <Box p="md" pos="relative">
        <Card withBorder shadow="sm" mb="md" radius="md">
          <Group position="apart">
            <Title
              order={2}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <IconChartBar size={28} />
              {t("viewresultsadmin.title") || "Questionnaire Results"}
            </Title>
            <Group>
              <Button
                color="green"
                leftIcon={<IconDownload size={16} />}
                onClick={handleDownload}
                variant="light"
              >
                {t("viewresultsadmin.downloadReport") || "Export to CSV"}
              </Button>
              <TextInput
                placeholder={
                  t("viewresultsadmin.searchPlaceholder") || "Search results..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                icon={<IconSearch size={16} />}
                sx={{ width: 300 }}
              />
            </Group>
          </Group>
        </Card>

        {/* Filters Section */}
        <Card withBorder shadow="sm" radius="md" mb="xl" p="md">
          <Group spacing="md" grow>
            <NumberInput
              label={t("viewresultsadmin.minPoints") || "Minimum Points"}
              value={minPoints}
              onChange={setMinPoints}
              min={0}
              placeholder="0"
            />

            <NumberInput
              label={
                t("viewresultsadmin.maxPercentage") || "Maximum Percentage"
              }
              value={maxPercentage}
              onChange={setMaxPercentage}
              min={0}
              max={100}
              placeholder="100"
            />

            <TextInput
              type="date"
              label={t("viewresultsadmin.dateFrom") || "Date From"}
              value={dateRange[0] ? format(dateRange[0], "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const newDate = e.currentTarget.value
                  ? new Date(e.currentTarget.value)
                  : null;
                setDateRange([newDate, dateRange[1]]);
              }}
              sx={{ minWidth: 120 }}
            />
            <TextInput
              type="date"
              label={t("viewresultsadmin.dateTo") || "Date To"}
              value={dateRange[1] ? format(dateRange[1], "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const newDate = e.currentTarget.value
                  ? new Date(e.currentTarget.value)
                  : null;
                setDateRange([dateRange[0], newDate]);
              }}
              sx={{ minWidth: 120 }}
            />
          </Group>

          <Group spacing="md" grow mt="md">
            <Select
              label={t("viewresultsadmin.sortBy") || "Sort By"}
              value={sortField}
              onChange={(value) => value && setSortField(value)}
              data={[
                {
                  value: "percentage",
                  label: t("viewresultsadmin.percentage") || "Percentage",
                },
                {
                  value: "total_points",
                  label: t("viewresultsadmin.points") || "Points",
                },
                {
                  value: "created_at",
                  label: t("viewresultsadmin.date") || "Date",
                },
              ]}
            />

            <Select
              label={t("viewresultsadmin.sortDirection") || "Sort Direction"}
              value={sortDirection}
              onChange={(value) =>
                value && setSortDirection(value as "asc" | "desc")
              }
              data={[
                {
                  value: "asc",
                  label: t("viewresultsadmin.ascending") || "Ascending",
                },
                {
                  value: "desc",
                  label: t("viewresultsadmin.descending") || "Descending",
                },
              ]}
            />
          </Group>

          <Group position="right" mt="md">
            <Button
              leftIcon={<IconFilterOff size={16} />}
              onClick={resetFilters}
              variant="outline"
              color="gray"
            >
              {t("viewresultsadmin.resetFilters") || "Reset Filters"}
            </Button>
            <Button
              leftIcon={<IconFilter size={16} />}
              onClick={fetchResults}
              color="blue"
            >
              {t("viewresultsadmin.applyFilters") || "Apply Filters"}
            </Button>
          </Group>
        </Card>

        <MantineReactTable
          columns={columns}
          data={results.filter((result) => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
              (result.user?.name || "").toLowerCase().includes(searchLower) ||
              (result.user?.email || "").toLowerCase().includes(searchLower) ||
              result.questionnaire_id.includes(searchTerm) ||
              result.total_points.includes(searchTerm) ||
              formatPercentage(result.percentage).includes(searchTerm)
            );
          })}
          state={{ isLoading: loading }}
          enablePagination
          enableSorting
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableStickyHeader
          enableFullScreenToggle={false}
          initialState={{
            density: "xs",
            pagination: { pageSize: 10, pageIndex: 0 },
          }}
          mantineTableContainerProps={{
            sx: {
              maxHeight: "calc(100vh - 240px)",
              "&::-webkit-scrollbar": {
                height: "10px",
                width: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ced4da",
                borderRadius: "10px",
              },
            },
          }}
          mantineTableHeadCellProps={{
            sx: {
              fontWeight: 600,
              fontSize: "0.875rem",
              backgroundColor: "#f8f9fa",
            },
          }}
          mantineTableBodyCellProps={{
            sx: {
              fontSize: "0.875rem",
            },
          }}
        />

        {/* Comprehensive Report Section */}
        {stats && (
          <Box mt="xl">
            <Title
              order={2}
              mb="md"
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <IconChartBar size={28} />
              {t("viewresultsadmin.performanceAnalytics") ||
                "Performance Analytics"}
            </Title>

            <Paper shadow="sm" p="lg" radius="md" withBorder mb="xl">
              <SimpleGrid
                cols={3}
                breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                spacing="lg"
              >
                <Paper p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.totalParticipants") ||
                          "Total Participants"}
                      </Text>
                      <Title order={3}>{stats.totalParticipants}</Title>
                    </div>
                    <Avatar color="blue" radius="xl" size={48}>
                      <IconUser size={24} />
                    </Avatar>
                  </Group>
                </Paper>

                <Paper p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.averageScore") || "Average Score"}
                      </Text>
                      <Title
                        order={3}
                        color={getPercentageColor(stats.averagePercentage)}
                      >
                        {stats.averagePercentage.toFixed(1)}%
                      </Title>
                    </div>
                    <Avatar
                      color={getPercentageColor(stats.averagePercentage)}
                      radius="xl"
                      size={48}
                    >
                      <IconStar size={24} />
                    </Avatar>
                  </Group>
                </Paper>

                <Paper p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.scoreRange") || "Score Range"}
                      </Text>
                      <Title order={3}>
                        {stats.lowestScore.toFixed(1)}% -{" "}
                        {stats.highestScore.toFixed(1)}%
                      </Title>
                    </div>
                    <Avatar color="grape" radius="xl" size={48}>
                      <IconAward size={24} />
                    </Avatar>
                  </Group>
                </Paper>
              </SimpleGrid>

              <Divider my="lg" variant="dashed" />

              <Title order={4} mb="sm">
                {t("viewresultsadmin.performanceDistribution") ||
                  "Performance Distribution"}
              </Title>
              <SimpleGrid
                cols={4}
                breakpoints={[
                  { maxWidth: "md", cols: 2 },
                  { maxWidth: "sm", cols: 1 },
                ]}
                spacing="lg"
              >
                <Paper
                  p="md"
                  withBorder
                  className={classes.performanceExcellent}
                >
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.excellent") || "Excellent (≥75%)"}
                      </Text>
                      <Group spacing={5} align="flex-end" mt={4}>
                        <Title order={3}>
                          {stats.performanceLevels.excellent}
                        </Title>
                        <Text size="sm" color="dimmed" mb={1}>
                          (
                          {(
                            (stats.performanceLevels.excellent /
                              stats.totalParticipants) *
                            100
                          ).toFixed(1)}
                          %)
                        </Text>
                      </Group>
                      <Progress
                        value={
                          (stats.performanceLevels.excellent /
                            stats.totalParticipants) *
                          100
                        }
                        color="teal"
                        size="sm"
                        mt="sm"
                      />
                    </div>
                    <Avatar color="teal" radius="xl" size={48}>
                      <IconTrophy size={24} />
                    </Avatar>
                  </Group>
                </Paper>

                <Paper p="md" withBorder className={classes.performanceGood}>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.good") || "Good (50-74%)"}
                      </Text>
                      <Group spacing={5} align="flex-end" mt={4}>
                        <Title order={3}>{stats.performanceLevels.good}</Title>
                        <Text size="sm" color="dimmed" mb={1}>
                          (
                          {(
                            (stats.performanceLevels.good /
                              stats.totalParticipants) *
                            100
                          ).toFixed(1)}
                          %)
                        </Text>
                      </Group>
                      <Progress
                        value={
                          (stats.performanceLevels.good /
                            stats.totalParticipants) *
                          100
                        }
                        color="blue"
                        size="sm"
                        mt="sm"
                      />
                    </div>
                    <Avatar color="blue" radius="xl" size={48}>
                      <IconMoodHappy size={24} />
                    </Avatar>
                  </Group>
                </Paper>

                <Paper p="md" withBorder className={classes.performanceAverage}>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.average") || "Average (25-49%)"}
                      </Text>
                      <Group spacing={5} align="flex-end" mt={4}>
                        <Title order={3}>
                          {stats.performanceLevels.average}
                        </Title>
                        <Text size="sm" color="dimmed" mb={1}>
                          (
                          {(
                            (stats.performanceLevels.average /
                              stats.totalParticipants) *
                            100
                          ).toFixed(1)}
                          %)
                        </Text>
                      </Group>
                      <Progress
                        value={
                          (stats.performanceLevels.average /
                            stats.totalParticipants) *
                          100
                        }
                        color="yellow"
                        size="sm"
                        mt="sm"
                      />
                    </div>
                    <Avatar color="yellow" radius="xl" size={48}>
                      <IconStar size={24} />
                    </Avatar>
                  </Group>
                </Paper>

                <Paper p="md" withBorder className={classes.performancePoor}>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.poor") || "Poor (<25%)"}
                      </Text>
                      <Group spacing={5} align="flex-end" mt={4}>
                        <Title order={3}>{stats.performanceLevels.poor}</Title>
                        <Text size="sm" color="dimmed" mb={1}>
                          (
                          {(
                            (stats.performanceLevels.poor /
                              stats.totalParticipants) *
                            100
                          ).toFixed(1)}
                          %)
                        </Text>
                      </Group>
                      <Progress
                        value={
                          (stats.performanceLevels.poor /
                            stats.totalParticipants) *
                          100
                        }
                        color="red"
                        size="sm"
                        mt="sm"
                      />
                    </div>
                    <Avatar color="red" radius="xl" size={48}>
                      <IconMoodSad size={24} />
                    </Avatar>
                  </Group>
                </Paper>
              </SimpleGrid>

              <Divider my="lg" variant="dashed" />

              <SimpleGrid cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
                <Paper p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.topPerformer") || "Top Performer"}
                      </Text>
                      <Title order={4} mt="xs">
                        {stats.highestScorer?.user?.name ||
                          t("viewresultsadmin.notAvailable") ||
                          "N/A"}
                      </Title>
                      <Group spacing={5}>
                        <Badge
                          color="teal"
                          variant="filled"
                          leftSection={<IconTrophy size={12} />}
                        >
                          {stats.highestScore.toFixed(1)}%
                        </Badge>
                        <Text size="sm" color="dimmed">
                          Q-{stats.highestScorer?.questionnaire_id}
                        </Text>
                      </Group>
                    </div>
                    <Avatar color="teal" radius="xl" size={48}>
                      <IconTrophy size={24} />
                    </Avatar>
                  </Group>
                </Paper>

                <Paper p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("viewresultsadmin.mostAttempted") ||
                          "Most Attempted"}
                      </Text>
                      <Title order={4} mt="xs">
                        {t("viewresultsadmin.questionnaire") || "Questionnaire"}{" "}
                        {stats.mostCommonQuestionnaire[0]}
                      </Title>
                      <Badge
                        color="violet"
                        variant="filled"
                        leftSection={<IconChartBar size={12} />}
                      >
                        {stats.mostCommonQuestionnaire[1]}{" "}
                        {t("viewresultsadmin.attempts") || "attempts"}
                      </Badge>
                    </div>
                    <Avatar color="violet" radius="xl" size={48}>
                      <IconChartBar size={24} />
                    </Avatar>
                  </Group>
                </Paper>
              </SimpleGrid>
            </Paper>
          </Box>
        )}

        {/* Result Details Modal */}
        <Modal
          opened={viewModalOpen}
          onClose={closeViewModal}
          title={
            <Group spacing="sm">
              <Avatar
                color={getUserColor(selectedResult?.user?.name)}
                size={40}
                radius="xl"
              >
                {getUserInitials(selectedResult?.user?.name)}
              </Avatar>
              <div>
                <Title order={4}>
                  {selectedResult?.user?.name ||
                    t("viewresultsadmin.user") ||
                    "User"}{" "}
                  {t("viewresultsadmin.results") || "Results"}
                </Title>
                <Text size="sm" color="dimmed">
                  Q-{selectedResult?.questionnaire_id}
                </Text>
              </div>
            </Group>
          }
          size="xl"
          overlayProps={{ blur: 3 }}
        >
          {selectedResult && (
            <Stack spacing="md">
              <SimpleGrid cols={2}>
                <Paper p="md" withBorder>
                  <Text size="sm" color="dimmed">
                    {t("viewresultsadmin.overallScore") || "Overall Score"}
                  </Text>
                  <Group spacing={5} align="flex-end" mt={4}>
                    <Title
                      order={3}
                      color={getPercentageColor(selectedResult.percentage)}
                    >
                      {formatPercentage(selectedResult.percentage)}%
                    </Title>
                    <Text size="sm" color="dimmed" mb={2}>
                      ({selectedResult.total_points}/
                      {selectedResult.max_possible_points}{" "}
                      {t("viewresultsadmin.points") || "points"})
                    </Text>
                  </Group>
                  <Progress
                    value={parseFloat(selectedResult.percentage)}
                    size="md"
                    mt="sm"
                    color={getPercentageColor(selectedResult.percentage)}
                    animate
                  />
                </Paper>

                <Paper p="md" withBorder>
                  <Text size="sm" color="dimmed">
                    {t("viewresultsadmin.completionDate") || "Completion Date"}
                  </Text>
                  <Group spacing={5} mt={4}>
                    <IconClock size={16} color={theme.colors.gray[6]} />
                    <Title order={3}>
                      {format(
                        new Date(selectedResult.created_at),
                        "MMM dd, yyyy"
                      )}
                    </Title>
                  </Group>
                  <Text size="sm" color="dimmed" mt={2}>
                    {format(new Date(selectedResult.created_at), "hh:mm a")}
                  </Text>
                </Paper>
              </SimpleGrid>

              <Divider />

              <Title order={4}>
                {t("viewresultsadmin.questionBreakdown") ||
                  "Question Breakdown"}
              </Title>
              <ScrollArea style={{ height: 400 }}>
                <Table fontSize="sm" striped>
                  <thead>
                    <tr>
                      <th>{t("viewresultsadmin.question") || "Question"}</th>
                      <th style={{ width: 100 }}>
                        {t("viewresultsadmin.points") || "Points"}
                      </th>
                      <th style={{ width: 100 }}>
                        {t("viewresultsadmin.status") || "Status"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.answers_details?.map(
                      (detail: AnswerDetail, index: number) => (
                        <tr key={`${detail.question_id}-${index}`}>
                          <td>
                            <Text weight={500}>{detail.question_text}</Text>
                            <Text size="xs" color="dimmed" mt={4}>
                              {detail.answer_text ||
                                (detail.selected_options?.length > 0
                                  ? `${
                                      t("viewresultsadmin.selected") ||
                                      "Selected"
                                    }: ${detail.selected_options.join(", ")}`
                                  : t("viewresultsadmin.noAnswer") ||
                                    "No answer provided")}
                            </Text>
                            {detail.feedback && (
                              <Text
                                size="xs"
                                color={detail.is_correct ? "teal" : "red"}
                                mt={2}
                              >
                                {detail.feedback}
                              </Text>
                            )}
                          </td>
                          <td>
                            <Text weight={600}>
                              {detail.points_earned}
                              <Text span color="dimmed" size="xs">
                                /{detail.points_possible}
                              </Text>
                            </Text>
                          </td>
                          <td>
                            <Badge
                              color={detail.is_correct ? "green" : "red"}
                              variant="light"
                              fullWidth
                              leftSection={
                                detail.is_correct ? (
                                  <IconStar size={12} />
                                ) : (
                                  <IconAlertCircle size={12} />
                                )
                              }
                            >
                              {detail.is_correct
                                ? t("viewresultsadmin.correct") || "Correct"
                                : t("viewresultsadmin.incorrect") ||
                                  "Incorrect"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
            </Stack>
          )}
        </Modal>
      </Box>
    </>
  );
};

export default ViewResults;
