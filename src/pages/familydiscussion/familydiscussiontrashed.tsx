import {
  Group,
  Button,
  Box,
  Title,
  Divider,
  Text,
  Card,
  Stack,
  Container,
  Select,
  TextInput,
  Badge,
  ActionIcon,
  Modal,
  useMantineTheme,
  NumberInput,
  Grid,
  List,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  IconSearch,
  IconInfoCircle,
  IconUser,
  IconBuilding,
  IconCalendar,
  IconUsers,
  IconChartPie,
  IconGavel,
  IconChecklist,
  IconClipboardList,
  IconMapPin,
  IconHome,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { getTrashedFamilyDiscussions } from "../../services/api/main";
import Loader from "../../components/common/loader";

interface FamilyDiscussion {
  id: number;
  recorded_date: string;
  conducted_date: string;
  district: string;
  social_base: string;
  wing: string;
  union_name: string;
  family_name: string;
  total_male_members: string;
  total_female_members: string;
  total_family_members: string;
  attending_male_members: string;
  attending_female_members: string;
  total_attending_members: string;
  absence_reason: string;
  discussion_agenda: string[];
  key_negative_points: string[];
  conclusions_reached: string[];
  differing_opinions: string[];
  summary: string[];
  prepared_by_name: string;
  prepared_by_position: string;
  prepared_by_signature: string;
  prepared_by_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface FamilyDiscussionReport {
  current_page: number;
  data: FamilyDiscussion[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

const FamilyDiscussionReportPage = () => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  // const [reportData, setReportData] = useState<FamilyDiscussionReport | null>(null);
  const [reportData, setReportData] = useState<FamilyDiscussionReport | null>(
    null
  );
  const [filteredData, setFilteredData] = useState<FamilyDiscussion[]>([]); // For compatibility, but will use reportData.data for table
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [isFiltered, setIsFiltered] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<FamilyDiscussion | null>(null);

  // Filter states
  const [district, setDistrict] = useState<string | null>(null);
  const [wing, setWing] = useState<string | null>(null);
  const [unionName, setUnionName] = useState<string | null>(null);
  const [socialBase, setSocialBase] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordedDate, setRecordedDate] = useState<string>("");
  const [conductedDate, setConductedDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [conductedFromDate, setConductedFromDate] = useState<string>("");
  const [conductedToDate, setConductedToDate] = useState<string>("");
  const [minMembers, setMinMembers] = useState<number | "">("");
  const [maxMembers, setMaxMembers] = useState<number | "">("");
  const [minAttendance, setMinAttendance] = useState<number | "">("");
  const [minAttendanceRate, setMinAttendanceRate] = useState<number | "">("");

  const [districts, setDistricts] = useState<string[]>([]);
  const [wings, setWings] = useState<string[]>([]);
  const [unionNames, setUnionNames] = useState<string[]>([]);
  const [socialBases, setSocialBases] = useState<string[]>([]);
  const [familyNames, setFamilyNames] = useState<string[]>([]);

  const applyFilters = async (
    page = currentPage,
    pageSize = Number(perPage) || 10
  ) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (district) params.district = district;
      if (wing) params.wing = wing;
      if (unionName) params.union_name = unionName;
      if (socialBase) params.social_base = socialBase;
      if (familyName) params.family_name = familyName;
      if (minMembers !== "") params.min_members = minMembers;
      if (maxMembers !== "") params.max_members = maxMembers;
      if (minAttendance !== "") params.min_attendance = minAttendance;
      if (minAttendanceRate !== "")
        params.min_attendance_rate = minAttendanceRate;
      if (recordedDate) params.recorded_date = recordedDate;
      if (conductedDate) params.conducted_date = conductedDate;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (conductedFromDate) params.conducted_from = conductedFromDate;
      if (conductedToDate) params.conducted_to = conductedToDate;
      params.page = page;
      params.per_page = pageSize;

      const response: FamilyDiscussionReport =
        await getTrashedFamilyDiscussions({ params });
      setReportData(response);
      setFilteredData(response.data); // For export and filter options
      setCurrentPage(response.current_page || 1);
      setTotalRows(response.total || 0);

      // Extract unique values for filters
      const uniqueDistricts = [
        ...new Set(
          response.data.map((item: FamilyDiscussion) => item.district)
        ),
      ] as string[];
      const uniqueWings = [
        ...new Set(response.data.map((item: FamilyDiscussion) => item.wing)),
      ] as string[];
      const uniqueUnionNames = [
        ...new Set(
          response.data.map((item: FamilyDiscussion) => item.union_name)
        ),
      ] as string[];
      const uniqueSocialBases = [
        ...new Set(
          response.data.map((item: FamilyDiscussion) => item.social_base)
        ),
      ] as string[];
      const uniqueFamilyNames = [
        ...new Set(
          response.data.map((item: FamilyDiscussion) => item.family_name)
        ),
      ] as string[];

      setDistricts(uniqueDistricts);
      setWings(uniqueWings);
      setUnionNames(uniqueUnionNames);
      setSocialBases(uniqueSocialBases);
      setFamilyNames(uniqueFamilyNames);

      showNotification(
        t("familydiscussionn.report.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showNotification(
        t("familydiscussionn.report.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  // Initial data load
  useEffect(() => {
    applyFilters(1, perPage || 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When perPage changes, reset to page 1 and refetch
  useEffect(() => {
    applyFilters(1, perPage || 10);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("familydiscussionn.report.notifications.successTitle")
          : t("familydiscussionn.report.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPpp");
    } catch {
      return dateString;
    }
  };

  const openDetailsModal = (discussion: FamilyDiscussion) => {
    setSelectedDiscussion(discussion);
    setDetailsModalOpen(true);
  };

  const calculateAttendanceRate = (discussion: FamilyDiscussion) => {
    const total = parseInt(discussion.total_family_members);
    const attending = parseInt(discussion.total_attending_members);
    return total > 0 ? Math.round((attending / total) * 100) : 0;
  };

  const columns: MRT_ColumnDef<FamilyDiscussion>[] = [
    {
      accessorKey: "family_name",
      header: t("familydiscussionn.report.tableHeaders.familyName"),
      Cell: ({ cell }) => <Text weight={500}>{cell.getValue<string>()}</Text>,
    },
    {
      accessorKey: "union_name",
      header: t("familydiscussionn.report.tableHeaders.union"),
      Cell: ({ cell }) => (
        <Group spacing="xs">
          <IconMapPin size={16} color={theme.colors.blue[6]} />
          <Text>{cell.getValue<string>()}</Text>
        </Group>
      ),
    },
    {
      accessorKey: "wing",
      header: t("familydiscussionn.report.tableHeaders.wing"),
      Cell: ({ cell }) => (
        <Badge color="blue" variant="filled">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "total_family_members",
      header: t("familydiscussionn.report.tableHeaders.totalMembers"),
      Cell: ({ cell, row }) => (
        <Group spacing={4}>
          <Text>{cell.getValue<string>()}</Text>
          <Text size="sm" color="dimmed">
            ({row.original.total_male_members}M/
            {row.original.total_female_members}F)
          </Text>
        </Group>
      ),
    },
    {
      accessorKey: "total_attending_members",
      header: t("familydiscussionn.report.tableHeaders.attendance"),
      Cell: ({ cell, row }) => {
        const rate = calculateAttendanceRate(row.original);
        return (
          <Group spacing={4}>
            <Text>{cell.getValue<string>()}</Text>
            <Text size="sm" color="dimmed">
              ({row.original.attending_male_members}M/
              {row.original.attending_female_members}F)
            </Text>
            <Badge color={rate >= 80 ? "green" : rate >= 50 ? "yellow" : "red"}>
              {rate}%
            </Badge>
          </Group>
        );
      },
    },
    {
      accessorKey: "conducted_date",
      header: t("familydiscussionn.report.tableHeaders.conductedDate"),
      Cell: ({ cell }) => formatDate(cell.getValue<string>()),
    },
    {
      id: "actions",
      header: t("familydiscussionn.report.tableHeaders.actions"),
      Cell: ({ row }) => (
        <ActionIcon
          color="blue"
          variant="light"
          onClick={() => openDetailsModal(row.original)}
          title={t("familydiscussionn.report.viewDetailsButton")}
          size="lg"
        >
          <IconInfoCircle size={20} />
        </ActionIcon>
      ),
    },
  ];

  const DateInput = ({
    value,
    onChange,
    label,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder: string;
  }) => (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );

  // Export to CSV functionality
  const handleDownload = () => {
    try {
      // 1. Prepare CSV header
      const headers = [
        "ID",
        "District",
        "Wing",
        "Union Name",
        "Family Name",
        "Social Base",
        "Total Male Members",
        "Total Female Members",
        "Total Family Members",
        "Attending Male Members",
        "Attending Female Members",
        "Total Attending Members",
        "Attendance Rate (%)",
        "Conducted Date",
        "Recorded Date",
        "Prepared By",
        "Prepared By Position",
        "Prepared By Signature",
        "Prepared By Date",
        "Absence Reason",
        "Discussion Agenda",
        "Key Negative Points",
        "Conclusions Reached",
        "Differing Opinions",
        "Summary",
      ];

      // 2. Prepare CSV rows
      const rows = filteredData.map((item) => [
        item.id,
        `"${(item.district || "").replace(/"/g, '""')}"`,
        `"${(item.wing || "").replace(/"/g, '""')}"`,
        `"${(item.union_name || "").replace(/"/g, '""')}"`,
        `"${(item.family_name || "").replace(/"/g, '""')}"`,
        `"${(item.social_base || "").replace(/"/g, '""')}"`,
        item.total_male_members,
        item.total_female_members,
        item.total_family_members,
        item.attending_male_members,
        item.attending_female_members,
        item.total_attending_members,
        // Attendance Rate
        (() => {
          const total = parseInt(item.total_family_members);
          const attending = parseInt(item.total_attending_members);
          return total > 0 ? Math.round((attending / total) * 100) : 0;
        })(),
        `"${(item.conducted_date || "").replace(/"/g, '""')}"`,
        `"${(item.recorded_date || "").replace(/"/g, '""')}"`,
        `"${(item.prepared_by_name || "").replace(/"/g, '""')}"`,
        `"${(item.prepared_by_position || "").replace(/"/g, '""')}"`,
        `"${(item.prepared_by_signature || "").replace(/"/g, '""')}"`,
        `"${(item.prepared_by_date || "").replace(/"/g, '""')}"`,
        `"${(item.absence_reason || "").replace(/"/g, '""')}"`,
        // Array fields as semicolon-separated
        `"${(item.discussion_agenda || []).join("; ").replace(/"/g, '""')}"`,
        `"${(item.key_negative_points || []).join("; ").replace(/"/g, '""')}"`,
        `"${(item.conclusions_reached || []).join("; ").replace(/"/g, '""')}"`,
        `"${(item.differing_opinions || []).join("; ").replace(/"/g, '""')}"`,
        `"${(item.summary || []).join("; ").replace(/"/g, '""')}"`,
      ]);

      // 3. Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\r\n");

      // 4. Create download with BOM for Excel compatibility
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `family_discussion_export_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      notifications.show({
        title: t("success") || "Success",
        message:
          t("familydiscussionn.report.exportSuccess") ||
          "CSV downloaded successfully",
        color: "teal",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      notifications.show({
        title: t("error") || "Error",
        message:
          t("familydiscussionn.report.exportError") || "Failed to generate CSV",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="xl" className="min-h-screen">
      {loading && <Loader />}

      {/* Header Section */}
      <Box mb="xl">
        <Group position="apart">
          <div>
            <Title order={1} className="text-3xl font-bold text-gray-800">
              {t("familydiscussionn.report.title")}
            </Title>
            <Text color="dimmed" mt="sm">
              {t("familydiscussionn.report.subtitle")}
            </Text>
          </div>
          <Group>
            <Button color="green" onClick={handleDownload} variant="light">
              {t("tendencyreport.exportCsv") || "Export to CSV"}
            </Button>
            <Badge variant="filled" size="xl" radius="sm">
              {t("familydiscussionn.report.total")}: {filteredData.length}
            </Badge>
          </Group>
        </Group>
        <Divider my="md" />
      </Box>

      {/* Filters Section */}
      <Card withBorder shadow="sm" radius="md" mb="xl" p="md">
        <Grid gutter="md">
          <Grid.Col span={12} md={6} lg={3}>
            <Select
              label={t("familydiscussionn.report.filterLabels.district")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.districtPlaceholder"
              )}
              data={districts.map((d) => ({ value: d, label: d }))}
              value={district}
              onChange={setDistrict}
              clearable
              icon={<IconMapPin size={16} />}
              searchable
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <Select
              label={t("familydiscussionn.report.filterLabels.wing")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.wingPlaceholder"
              )}
              data={wings.map((w) => ({ value: w, label: w }))}
              value={wing}
              onChange={setWing}
              clearable
              icon={<IconHome size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <Select
              label={t("familydiscussionn.report.filterLabels.union")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.unionPlaceholder"
              )}
              data={unionNames.map((u) => ({ value: u, label: u }))}
              value={unionName}
              onChange={setUnionName}
              clearable
              icon={<IconBuilding size={16} />}
              searchable
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <Select
              label={t("familydiscussionn.report.filterLabels.socialBase")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.socialBasePlaceholder"
              )}
              data={socialBases.map((s) => ({ value: s, label: s }))}
              value={socialBase}
              onChange={setSocialBase}
              clearable
              icon={<IconUsers size={16} />}
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md" mt="md">
          <Grid.Col span={12} md={6} lg={3}>
            <Select
              label={t("familydiscussionn.report.filterLabels.familyName")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.familyNamePlaceholder"
              )}
              data={familyNames.map((f) => ({ value: f, label: f }))}
              value={familyName}
              onChange={setFamilyName}
              clearable
              icon={<IconUser size={16} />}
              searchable
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <DateInput
              label={t("familydiscussionn.report.filterLabels.recordedDate")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.datePlaceholder"
              )}
              value={recordedDate}
              onChange={setRecordedDate}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <DateInput
              label={t("familydiscussionn.report.filterLabels.conductedDate")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.datePlaceholder"
              )}
              value={conductedDate}
              onChange={setConductedDate}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <TextInput
              label={t("familydiscussionn.report.filterLabels.search")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.searchPlaceholder"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              icon={<IconSearch size={16} />}
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md" mt="md">
          <Grid.Col span={12} md={6} lg={3}>
            <DateInput
              label={t("familydiscussionn.report.filterLabels.fromDate")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.datePlaceholder"
              )}
              value={fromDate}
              onChange={setFromDate}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <DateInput
              label={t("familydiscussionn.report.filterLabels.toDate")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.datePlaceholder"
              )}
              value={toDate}
              onChange={setToDate}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <DateInput
              label={t(
                "familydiscussionn.report.filterLabels.conductedFromDate"
              )}
              placeholder={t(
                "familydiscussionn.report.filterLabels.datePlaceholder"
              )}
              value={conductedFromDate}
              onChange={setConductedFromDate}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <DateInput
              label={t("familydiscussionn.report.filterLabels.conductedToDate")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.datePlaceholder"
              )}
              value={conductedToDate}
              onChange={setConductedToDate}
            />
          </Grid.Col>
        </Grid>

        <Grid gutter="md" mt="md">
          <Grid.Col span={12} md={6} lg={3}>
            <NumberInput
              label={t("familydiscussionn.report.filterLabels.minMembers")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.minMembersPlaceholder"
              )}
              value={minMembers}
              onChange={setMinMembers}
              min={0}
              icon={<IconUsers size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <NumberInput
              label={t("familydiscussionn.report.filterLabels.maxMembers")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.maxMembersPlaceholder"
              )}
              value={maxMembers}
              onChange={setMaxMembers}
              min={0}
              icon={<IconUsers size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <NumberInput
              label={t("familydiscussionn.report.filterLabels.minAttendance")}
              placeholder={t(
                "familydiscussionn.report.filterLabels.minAttendancePlaceholder"
              )}
              value={minAttendance}
              onChange={setMinAttendance}
              min={0}
              icon={<IconUsers size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={12} md={6} lg={3}>
            <NumberInput
              label={t(
                "familydiscussionn.report.filterLabels.minAttendanceRate"
              )}
              placeholder={t(
                "familydiscussionn.report.filterLabels.minAttendanceRatePlaceholder"
              )}
              value={minAttendanceRate}
              onChange={setMinAttendanceRate}
              min={0}
              max={100}
              icon={<IconChartPie size={16} />}
              rightSection={
                <Text size="xs" color="dimmed">
                  %
                </Text>
              }
            />
          </Grid.Col>
        </Grid>

        {/* <Grid gutter="md" mt="md">
          <Grid.Col span={12} md={6} lg={3}>
            <NumberInput
              label={t("familydiscussionn.report.filterLabels.perPage")}
              placeholder={t("familydiscussionn.report.filterLabels.perPage")}
              value={perPage}
              onChange={(value) => setPerPage(Number(value) || 10)}
              min={1}
              icon={<IconUsers size={16} />}
            />
          </Grid.Col>
        </Grid> */}
        <Group position="right" spacing="md" mt={28}>
          <button
            onClick={() => applyFilters(currentPage, perPage)}
            style={{
              background: "#228be6",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            {t("familydiscussionn.report.buttons.applyFilters")}
          </button>
        </Group>
      </Card>

      {/* Report Display Section */}
      <Box>
        <MantineReactTable
          columns={columns}
          data={reportData?.data || []}
          state={{
            isLoading: loading,
            pagination: {
              pageIndex: currentPage - 1,
              pageSize: Number(perPage) || 10,
            },
          }}
          enableColumnOrdering
          enableSorting
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableStickyHeader
          enableFullScreenToggle={false}
          manualPagination
          rowCount={totalRows}
          paginationDisplayMode="pages"
          mantinePaginationProps={{
            showRowsPerPage: true,
            total: Math.ceil(totalRows / (Number(perPage) || 10)),
            value: currentPage,
          }}
          onPaginationChange={(updater) => {
            let pageIndex: number, pageSize: number;
            if (typeof updater === "function") {
              const current = {
                pageIndex: currentPage - 1,
                pageSize: Number(perPage) || 10,
              };
              const next = updater(current);
              pageIndex = next.pageIndex;
              pageSize = next.pageSize;
            } else {
              pageIndex = updater.pageIndex;
              pageSize = updater.pageSize;
            }
            const safePageSize = Number(pageSize) || 10;
            if (perPage !== safePageSize) {
              setPerPage(safePageSize);
              setCurrentPage(1);
              applyFilters(1, safePageSize);
            } else {
              setCurrentPage(pageIndex + 1);
              applyFilters(pageIndex + 1, safePageSize);
            }
          }}
        />
      </Box>

      {/* Details Modal */}
      <Modal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={
          <Text size="xl" weight={600}>
            {t("familydiscussionn.report.detailsModal.title")}
          </Text>
        }
        size="xl"
        overlayProps={{ blur: 3 }}
      >
        {selectedDiscussion && (
          <Stack spacing="lg">
            {/* Basic Info Section */}
            <Card withBorder>
              <Grid gutter="xl">
                <Grid.Col span={12} md={6}>
                  <Group spacing="xs" mb="sm">
                    <IconHome size={20} color={theme.colors.blue[6]} />
                    <Text weight={600} size="lg">
                      {selectedDiscussion.family_name}
                    </Text>
                  </Group>
                  <Group spacing="xs" mb="sm">
                    <IconMapPin size={16} color={theme.colors.gray[6]} />
                    <Text>
                      {selectedDiscussion.district},{" "}
                      {selectedDiscussion.union_name}
                    </Text>
                  </Group>
                  <Group spacing="xs" mb="sm">
                    <IconUsers size={16} color={theme.colors.gray[6]} />
                    <Text>
                      {t("familydiscussionn.report.detailsModal.socialBase")}:{" "}
                      {selectedDiscussion.social_base}
                    </Text>
                  </Group>
                  <Group spacing="xs" mb="sm">
                    <Badge color="blue" variant="filled" size="lg">
                      {selectedDiscussion.wing}
                    </Badge>
                  </Group>
                </Grid.Col>
                <Grid.Col span={12} md={6}>
                  <Group spacing="xs" mb="sm">
                    <IconCalendar size={16} color={theme.colors.gray[6]} />
                    <Text>
                      {t("familydiscussionn.report.detailsModal.conductedDate")}
                      : {formatDate(selectedDiscussion.conducted_date)}
                    </Text>
                  </Group>
                  <Group spacing="xs" mb="sm">
                    <IconCalendar size={16} color={theme.colors.gray[6]} />
                    <Text>
                      {t("familydiscussionn.report.detailsModal.recordedDate")}:{" "}
                      {formatDate(selectedDiscussion.recorded_date)}
                    </Text>
                  </Group>
                  <Group spacing="xs" mb="sm">
                    <IconUser size={16} color={theme.colors.gray[6]} />
                    <Text>
                      {t("familydiscussionn.report.detailsModal.preparedBy")}:{" "}
                      {selectedDiscussion.prepared_by_name} (
                      {selectedDiscussion.prepared_by_position})
                    </Text>
                  </Group>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Attendance Section */}
            <Card withBorder>
              <Title order={4} mb="md">
                {t("familydiscussionn.report.detailsModal.attendanceTitle")}
              </Title>
              <Grid gutter="xl">
                <Grid.Col span={12} md={6}>
                  <Text weight={600} mb="sm">
                    {t("familydiscussionn.report.detailsModal.totalMembers")}
                  </Text>
                  <Group spacing="xl">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("familydiscussionn.report.detailsModal.male")}
                      </Text>
                      <Text weight={500}>
                        {selectedDiscussion.total_male_members}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("familydiscussionn.report.detailsModal.female")}
                      </Text>
                      <Text weight={500}>
                        {selectedDiscussion.total_female_members}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("familydiscussionn.report.detailsModal.total")}
                      </Text>
                      <Text weight={500}>
                        {selectedDiscussion.total_family_members}
                      </Text>
                    </div>
                  </Group>
                </Grid.Col>
                <Grid.Col span={12} md={6}>
                  <Text weight={600} mb="sm">
                    {t(
                      "familydiscussionn.report.detailsModal.attendingMembers"
                    )}
                  </Text>
                  <Group spacing="xl">
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("familydiscussionn.report.detailsModal.male")}
                      </Text>
                      <Text weight={500}>
                        {selectedDiscussion.attending_male_members}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("familydiscussionn.report.detailsModal.female")}
                      </Text>
                      <Text weight={500}>
                        {selectedDiscussion.attending_female_members}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" color="dimmed">
                        {t("familydiscussionn.report.detailsModal.total")}
                      </Text>
                      <Text weight={500}>
                        {selectedDiscussion.total_attending_members}
                      </Text>
                    </div>
                  </Group>
                </Grid.Col>
              </Grid>
              <Group mt="md" spacing="xl">
                <div>
                  <Text size="sm" color="dimmed">
                    {t("familydiscussionn.report.detailsModal.attendanceRate")}
                  </Text>
                  <Badge
                    size="lg"
                    color={
                      calculateAttendanceRate(selectedDiscussion) >= 80
                        ? "green"
                        : calculateAttendanceRate(selectedDiscussion) >= 50
                        ? "yellow"
                        : "red"
                    }
                  >
                    {calculateAttendanceRate(selectedDiscussion)}%
                  </Badge>
                </div>
                {selectedDiscussion.absence_reason && (
                  <div>
                    <Text size="sm" color="dimmed">
                      {t("familydiscussionn.report.detailsModal.absenceReason")}
                    </Text>
                    <Text>{selectedDiscussion.absence_reason}</Text>
                  </div>
                )}
              </Group>
            </Card>

            {/* Discussion Content Sections */}
            <Card withBorder>
              <Title order={4} mb="md">
                {t("familydiscussionn.report.detailsModal.discussionAgenda")}
              </Title>
              <List spacing="xs" size="sm" center>
                {selectedDiscussion.discussion_agenda.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={
                      <IconChecklist size={16} color={theme.colors.blue[6]} />
                    }
                  >
                    {item}
                  </List.Item>
                ))}
              </List>
            </Card>
            <Card withBorder>
              <Title order={4} mb="md">
                {t("familydiscussionn.report.detailsModal.keyNegativePoints")}
              </Title>
              <List spacing="xs" size="sm" center>
                {selectedDiscussion.key_negative_points.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={<IconGavel size={16} color={theme.colors.red[6]} />}
                  >
                    {item}
                  </List.Item>
                ))}
              </List>
            </Card>
            <Card withBorder>
              <Title order={4} mb="md">
                {t("familydiscussionn.report.detailsModal.conclusionsReached")}
              </Title>
              <List spacing="xs" size="sm" center>
                {selectedDiscussion.conclusions_reached.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={
                      <IconClipboardList
                        size={16}
                        color={theme.colors.green[6]}
                      />
                    }
                  >
                    {item}
                  </List.Item>
                ))}
              </List>
            </Card>
            <Card withBorder>
              <Title order={4} mb="md">
                {t("familydiscussionn.report.detailsModal.differingOpinions")}
              </Title>
              <List spacing="xs" size="sm" center>
                {selectedDiscussion.differing_opinions.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={
                      <IconGavel size={16} color={theme.colors.orange[6]} />
                    }
                  >
                    {item}
                  </List.Item>
                ))}
              </List>
            </Card>
            <Card withBorder>
              <Title order={4} mb="md">
                {t("familydiscussionn.report.detailsModal.summary")}
              </Title>
              <List spacing="xs" size="sm" center>
                {selectedDiscussion.summary.map((item, index) => (
                  <List.Item
                    key={index}
                    icon={
                      <IconClipboardList
                        size={16}
                        color={theme.colors.teal[6]}
                      />
                    }
                  >
                    {item}
                  </List.Item>
                ))}
              </List>
            </Card>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default FamilyDiscussionReportPage;
