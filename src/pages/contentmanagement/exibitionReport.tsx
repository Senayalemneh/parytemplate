import {
  Card,
  Grid,
  Group,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Center,
  Select,
  Badge,
  Box,
  Table,
  Avatar,
  Pagination,
  Button,
} from "@mantine/core";
import { useEffect, useState } from "react";
import Loader from "../../components/common/loader";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconUser, IconMapPin, IconDownload } from "@tabler/icons-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { getExhibitionReport } from "../../services/api/main";
import { useTranslation } from "react-i18next";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface GenderDistribution {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

interface LocationDistribution {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

interface ExhibitionSummary {
  exhibition_id: number;
  count: number;
  percentage: number;
  title?: string;
  image_path?: string;
}

interface Visitor {
  id: number;
  full_name: string;
  gender: string;
  phone_number: string;
  sub_city: string;
  woreda: string;
  exhibition_id: string;
  visit_count: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

interface ExhibitionReport {
  total_visitors: number;
  gender_distribution: GenderDistribution;
  sub_city_distribution: LocationDistribution;
  woreda_distribution: LocationDistribution;
  exhibition_summary: ExhibitionSummary[];
  visitors: Visitor[];
}

const ExhibitionReport = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState<ExhibitionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [exhibitionFilter, setExhibitionFilter] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: dateRange[0]?.toISOString().split("T")[0],
        end_date: dateRange[1]?.toISOString().split("T")[0],
      };
      const response = await getExhibitionReport(params);
      const sortedVisitors = response.visitors.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReport({ ...response, visitors: sortedVisitors });
      setFilteredVisitors(sortedVisitors);
      setActivePage(1);
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  useEffect(() => {
    if (!report) return;

    let filtered = [...report.visitors];

    if (exhibitionFilter) {
      filtered = filtered.filter((v) => v.exhibition_id === exhibitionFilter);
    }

    if (genderFilter) {
      filtered = filtered.filter(
        (v) => v.gender.toLowerCase() === genderFilter.toLowerCase()
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(
        (v) => v.sub_city === locationFilter || v.woreda === locationFilter
      );
    }

    setFilteredVisitors(filtered);
    setActivePage(1);
  }, [report, exhibitionFilter, genderFilter, locationFilter]);

  const downloadCSV = () => {
    if (filteredVisitors.length === 0) return;

    const headers = [
      'Name',
      'Phone',
      'Gender',
      'Sub City',
      'Woreda',
      'Exhibition ID',
      'Visit Count',
      'Visited At',
      'Email'
    ].join(',');

    const rows = filteredVisitors.map(visitor => [
      `"${visitor.full_name}"`,
      `"${visitor.phone_number}"`,
      `"${visitor.gender}"`,
      `"${visitor.sub_city}"`,
      `"${visitor.woreda}"`,
      `"${visitor.exhibition_id}"`,
      `"${visitor.visit_count}"`,
      `"${new Date(visitor.created_at).toLocaleString()}"`,
      `"${visitor.email || ''}"`
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const genderChartData = {
    labels: report?.gender_distribution ? Object.keys(report.gender_distribution) : [],
    datasets: [
      {
        label: t("exhibitionreport.genderDistribution"),
        data: report?.gender_distribution
          ? Object.values(report.gender_distribution).map((g) => g.count)
          : [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const locationChartData = {
    labels: report?.sub_city_distribution ? Object.keys(report.sub_city_distribution) : [],
    datasets: [
      {
        label: t("exhibitionreport.visitorsBySubcity"),
        data: report?.sub_city_distribution
          ? Object.values(report.sub_city_distribution).map((l) => l.count)
          : [],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const woredaChartData = {
    labels: report?.woreda_distribution ? Object.keys(report.woreda_distribution) : [],
    datasets: [
      {
        label: t("exhibitionreport.visitorsByWoreda"),
        data: report?.woreda_distribution
          ? Object.values(report.woreda_distribution).map((w) => w.count)
          : [],
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const exhibitionOptions =
    report?.exhibition_summary.map((e) => ({
      value: e.exhibition_id.toString(),
      label: e.title || `Exhibition ${e.exhibition_id}`,
    })) || [];

  const genderOptions = [
    { value: "male", label: t("exhibitionreport.male") },
    { value: "female", label: t("exhibitionreport.female") },
    { value: "other", label: t("exhibitionreport.other") },
  ];

  const locationOptions = [
    ...(report?.sub_city_distribution
      ? Object.keys(report.sub_city_distribution).map((s) => ({
          value: s,
          label: s,
        }))
      : []),
    ...(report?.woreda_distribution
      ? Object.keys(report.woreda_distribution).map((w) => ({
          value: w,
          label: w,
        }))
      : []),
  ];

  if (loading && !report) {
    return (
      <Center style={{ height: "80vh" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Box p="md">
      <Group position="apart" mb="md">
        <Title order={2}>{t("exhibitionreport.title")}</Title>
        <Group>
          <DatePickerInput
            type="range"
            placeholder={t("exhibitionreport.selectDateRange")}
            value={dateRange}
            onChange={setDateRange}
            icon={<IconCalendar size={16} />}
            clearable
          />
          <Button 
            leftIcon={<IconDownload size={16} />} 
            onClick={downloadCSV}
            disabled={filteredVisitors.length === 0}
          >
            {t("exhibitionreport.download")}
          </Button>
        </Group>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={12}>
          <SimpleGrid cols={3} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
            <Card withBorder shadow="sm" radius="md">
              <Group position="apart">
                <div>
                  <Text size="sm" color="dimmed">
                    {t("exhibitionreport.totalVisitors")}
                  </Text>
                  <Title order={3}>{report?.total_visitors || 0}</Title>
                </div>
                <Avatar color="blue" radius="xl">
                  <IconUser size={24} />
                </Avatar>
              </Group>
            </Card>

            <Card withBorder shadow="sm" radius="md">
              <Group position="apart">
                <div>
                  <Text size="sm" color="dimmed">
                    {t("exhibitionreport.totalExhibitions")}
                  </Text>
                  <Title order={3}>
                    {report?.exhibition_summary.length || 0}
                  </Title>
                </div>
                <Avatar color="green" radius="xl">
                  <IconMapPin size={24} />
                </Avatar>
              </Group>
            </Card>

            <Card withBorder shadow="sm" radius="md">
              <Group position="apart">
                <div>
                  <Text size="sm" color="dimmed">
                    {t("exhibitionreport.uniqueLocations")}
                  </Text>
                  <Title order={3}>
                    {(report?.sub_city_distribution
                      ? Object.keys(report.sub_city_distribution).length
                      : 0) +
                      (report?.woreda_distribution
                        ? Object.keys(report.woreda_distribution).length
                        : 0)}
                  </Title>
                </div>
                <Avatar color="orange" radius="xl">
                  <IconMapPin size={24} />
                </Avatar>
              </Group>
            </Card>
          </SimpleGrid>
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">
              {t("exhibitionreport.genderDistribution")}
            </Title>
            <div style={{ height: 300 }}>
              {report?.gender_distribution &&
              Object.keys(report.gender_distribution).length ? (
                <Pie data={genderChartData} />
              ) : (
                <Center style={{ height: "100%" }}>
                  <Text color="dimmed">{t("exhibitionreport.noData")}</Text>
                </Center>
              )}
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={12} md={6}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">
              {t("exhibitionreport.locationDistribution")}
            </Title>
            <div style={{ height: 300 }}>
              {report?.sub_city_distribution &&
              Object.keys(report.sub_city_distribution).length ? (
                <Bar data={locationChartData} />
              ) : (
                <Center style={{ height: "100%" }}>
                  <Text color="dimmed">{t("exhibitionreport.noData")}</Text>
                </Center>
              )}
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={12}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">
              {t("exhibitionreport.woredaDistribution")}
            </Title>
            <div style={{ height: 300 }}>
              {report?.woreda_distribution &&
              Object.keys(report.woreda_distribution).length ? (
                <Bar data={woredaChartData} />
              ) : (
                <Center style={{ height: "100%" }}>
                  <Text color="dimmed">{t("exhibitionreport.noData")}</Text>
                </Center>
              )}
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={12}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="sm">
              {t("exhibitionreport.exhibitionSummary")}
            </Title>
            <SimpleGrid
              cols={3}
              breakpoints={[
                { maxWidth: "md", cols: 2 },
                { maxWidth: "sm", cols: 1 },
              ]}
            >
              {report?.exhibition_summary.map((exhibition) => (
                <Card
                  key={exhibition.exhibition_id}
                  withBorder
                  shadow="xs"
                  p="sm"
                >
                  <Group>
                    {exhibition.image_path && (
                      <Avatar
                        src={`${import.meta.env.VITE_FILE_API}${exhibition.image_path}`}
                        size="lg"
                        radius="sm"
                      />
                    )}
                    <div>
                      <Text weight={500} lineClamp={1}>
                        {exhibition.title ||
                          `Exhibition ${exhibition.exhibition_id}`}
                      </Text>
                      <Badge color="blue" variant="light">
                        {exhibition.count} {t("exhibitionreport.visitors")} (
                        {exhibition.percentage}%)
                      </Badge>
                    </div>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Grid.Col>

        <Grid.Col span={12}>
          <Paper withBorder p="md" radius="md">
            <Group position="apart" mb="md">
              <Title order={4}>{t("exhibitionreport.visitorDetails")}</Title>
              <Text color="dimmed">
                {t("exhibitionreport.showing")} {filteredVisitors.length} {t("exhibitionreport.visitors")}
              </Text>
            </Group>
            
            <Group mb="md" grow>
              <Select
                label={t("exhibitionreport.filterByExhibition")}
                placeholder={t("exhibitionreport.selectExhibition")}
                data={exhibitionOptions}
                value={exhibitionFilter}
                onChange={setExhibitionFilter}
                clearable
              />
              <Select
                label={t("exhibitionreport.filterByGender")}
                placeholder={t("exhibitionreport.selectGender")}
                data={genderOptions}
                value={genderFilter}
                onChange={setGenderFilter}
                clearable
              />
              <Select
                label={t("exhibitionreport.filterByLocation")}
                placeholder={t("exhibitionreport.selectLocation")}
                data={locationOptions}
                value={locationFilter}
                onChange={setLocationFilter}
                clearable
              />
            </Group>

            <div style={{ overflowX: "auto" }}>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>{t("exhibitionreport.name")}</th>
                    <th>{t("exhibitionreport.phone")}</th>
                    <th>{t("exhibitionreport.gender")}</th>
                    <th>{t("exhibitionreport.subCity")}</th>
                    <th>{t("exhibitionreport.woreda")}</th>
                    <th>{t("exhibitionreport.exhibition")}</th>
                    <th>{t("exhibitionreport.visitCount")}</th>
                    <th>{t("exhibitionreport.visitedAt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVisitors.length > 0 ? (
                    paginatedVisitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td>{visitor.full_name}</td>
                        <td>{visitor.phone_number}</td>
                        <td>
                          <Badge
                            color={
                              visitor.gender.toLowerCase() === "male"
                                ? "blue"
                                : visitor.gender.toLowerCase() === "female"
                                ? "pink"
                                : "gray"
                            }
                          >
                            {visitor.gender}
                          </Badge>
                        </td>
                        <td>{visitor.sub_city}</td>
                        <td>{visitor.woreda}</td>
                        <td>{visitor.exhibition_id}</td>
                        <td>{visitor.visit_count}</td>
                        <td>{new Date(visitor.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }}>
                        <Text py="md" color="dimmed">
                          {t("exhibitionreport.noVisitorsFound")}
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {filteredVisitors.length > itemsPerPage && (
              <Center mt="md">
                <Pagination
                  value={activePage}
                  onChange={setActivePage}
                  total={totalPages}
                  siblings={1}
                  boundaries={1}
                />
              </Center>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default ExhibitionReport;