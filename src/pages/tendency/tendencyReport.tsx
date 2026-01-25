import {
  Button,
  Group,
  Box,
  Title,
  Divider,
  Text,
  Card,
  Stack,
  Paper,
  Container,
  Center,
  Select,
  TextInput,
  Badge,
  ActionIcon,
  Modal,
  Avatar,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  getAllUsers,
  getAllTendencyReport,
  createTendencyReport,
} from "../../services/api/main";
import {
  IconFilter,
  IconFilterOff,
  IconSearch,
  IconInfoCircle,
  IconUser,
  IconBuilding,
  IconCalendar,
  IconFileText,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import Loader from "../../components/common/loader";

interface TendencyItem {
  id: number;
  title: string;
  description: string;
  district: string | null;
  institution_name: string | null;
  created_at: string;
  user_name: string;
  user_id: number;
  type: string;
  type_label: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface TendencyReportResponse {
  data: TendencyItem[];
  total: number;
  current_page: number;
  last_page: number;
}

const TendencyManagement = () => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const [allTendencyData, setAllTendencyData] = useState<TendencyItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTendency, setSelectedTendency] = useState<TendencyItem | null>(
    null
  );
  const [allTypes, setAllTypes] = useState<
    { value: string; label: string; color: string }[]
  >([]);
  const [uniqueInstitutions, setUniqueInstitutions] = useState<string[]>([]);

  // Filter states
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  // Pagination and sorting
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  // Predefined tendency types with colors
  const predefinedTypes = [
    {
      value: "positive",
      label: t("tendencyreport.types.positive"),
      color: "green",
    },
    {
      value: "negative",
      label: t("tendencyreport.types.negative"),
      color: "red",
    },
    {
      value: "neutral",
      label: t("tendencyreport.types.neutral"),
      color: "blue",
    },
    {
      value: "urgent",
      label: t("tendencyreport.types.urgent"),
      color: "orange",
    },
  ];

  // Build params for API call
  const buildParams = () => {
    const params: any = {
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
    };

    if (sorting.length > 0) {
      params.sort_by = sorting[0].id;
      params.sort_order = sorting[0].desc ? "desc" : "asc";
    }

    if (selectedUser) params.user_id = selectedUser;
    if (selectedInstitution) params.institution_name = selectedInstitution;
    if (selectedType) params.type = selectedType;
    if (searchTerm) params.search = searchTerm;
    if (dateRange[0]) params.start_date = format(dateRange[0], "yyyy-MM-dd");
    if (dateRange[1]) params.end_date = format(dateRange[1], "yyyy-MM-dd");

    return params;
  };

  // Fetch data with current filters
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users (only once)
      if (users.length === 0) {
        const usersResponse = await getAllUsers();
        setUsers(usersResponse);
      }

      // Fetch tendencies with current filters
      const params = buildParams();
      const response: TendencyReportResponse = await getAllTendencyReport(
        params
      );

      setAllTendencyData(response.data);

      // Extract unique values for filters
      const institutions = [
        ...new Set(response.data.map((item) => item.institution_name)),
      ].filter(Boolean) as string[];
      setUniqueInstitutions(institutions);

      // Combine predefined and custom types
      const types = new Map<
        string,
        { value: string; label: string; color: string }
      >();
      predefinedTypes.forEach((type) => types.set(type.value, type));
      response.data.forEach((item) => {
        if (
          item.type === "custom" &&
          item.type_label &&
          !types.has(item.type_label)
        ) {
          types.set(item.type_label, {
            value: item.type_label,
            label: item.type_label,
            color: "violet",
          });
        }
      });
      setAllTypes(Array.from(types.values()));

      showNotification(
        t("tendencyreport.tendencymanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showNotification(
        t("tendencyreport.tendencymanagementadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchData();
  }, [
    selectedUser,
    selectedInstitution,
    selectedType,
    searchTerm,
    dateRange,
    pagination,
    sorting,
  ]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t(
              "tendencyreport.tendencymanagementadmin.notifications.successTitle"
            )
          : t(
              "tendencyreport.tendencymanagementadmin.notifications.errorTitle"
            ),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const getTypeColor = (type: string) => {
    const foundType = allTypes.find((t) => t.value === type);
    return foundType ? foundType.color : "gray";
  };

  const getTypeLabel = (type: string, typeLabel: string | null) => {
    if (type === "custom" && typeLabel) return typeLabel;
    const foundType = allTypes.find((t) => t.value === type);
    return foundType ? foundType.label : type;
  };

  const resetFilters = () => {
    setSelectedUser(null);
    setSelectedInstitution(null);
    setSelectedType(null);
    setSearchTerm("");
    setDateRange([null, null]);
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    setSorting([]);
    setIsFiltered(false);
    showNotification(
      t("tendencyreport.tendencymanagementadmin.notifications.resetSuccess"),
      "success"
    );
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "PPpp");
  };

  const openDetailsModal = (tendency: TendencyItem) => {
    setSelectedTendency(tendency);
    setDetailsModalOpen(true);
  };

  // CSV Export Handler
  const handleDownload = async () => {
    try {
      // Get all data without pagination for export
      const params = buildParams();
      delete params.limit;
      delete params.page;
      const response = await getAllTendencyReport(params);

      // Prepare CSV content
      const headers = [
        "ID",
        "Type",
        "Title",
        "Description",
        "Institution",
        "Submitted By",
        "Date Submitted",
      ];

      const rows = response.data.map((item) => [
        item.id,
        `"${getTypeLabel(item.type, item.type_label).replace(/"/g, '""')}"`,
        `"${(item.title || "").replace(/"/g, '""')}"`,
        `"${(item.description || "").replace(/"/g, '""')}"`,
        `"${(item.institution_name || "").replace(/"/g, '""')}"`,
        `"${(item.user_name || "").replace(/"/g, '""')}"`,
        `"${format(parseISO(item.created_at), "yyyy-MM-dd HH:mm")}"`,
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
      link.download = `tendency_export_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      showNotification(
        t("tendencyreport.exportSuccess") || "CSV downloaded successfully",
        "success"
      );
    } catch (error) {
      console.error("CSV export error:", error);
      showNotification(
        t("tendencyreport.exportError") || "Failed to generate CSV",
        "error"
      );
    }
  };

  // Define columns for MantineReactTable
  const columns: MRT_ColumnDef<TendencyItem>[] = [
    {
      accessorKey: "type",
      header: t("tendencyreport.tendencymanagementadmin.tableHeaders.type"),
      Cell: ({ row }) => (
        <Badge
          color={getTypeColor(
            row.original.type === "custom"
              ? row.original.type_label || "custom"
              : row.original.type
          )}
          variant="filled"
          size="lg"
        >
          {getTypeLabel(row.original.type, row.original.type_label)}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: t("tendencyreport.tendencymanagementadmin.tableHeaders.title"),
    },
    {
      accessorKey: "institution_name",
      header: t(
        "tendencyreport.tendencymanagementadmin.tableHeaders.institution"
      ),
      Cell: ({ cell }) => cell.getValue() || <Text color="dimmed">N/A</Text>,
    },
    {
      accessorKey: "user_name",
      header: t(
        "tendencyreport.tendencymanagementadmin.tableHeaders.submittedBy"
      ),
      Cell: ({ row }) => (
        <Group spacing="sm">
          <Avatar size={30} radius="xl" color="blue">
            {row.original.user_name.charAt(0)}
          </Avatar>
          <Text>{row.original.user_name}</Text>
        </Group>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("tendencyreport.tendencymanagementadmin.tableHeaders.date"),
      Cell: ({ cell }) => formatDate(cell.getValue<string>()),
    },
    {
      id: "actions",
      header: t("tendencyreport.tendencymanagementadmin.tableHeaders.actions"),
      Cell: ({ row }) => (
        <ActionIcon
          color="blue"
          variant="light"
          onClick={() => openDetailsModal(row.original)}
          title={t("tendencyreport.tendencymanagementadmin.viewDetailsButton")}
          size="lg"
        >
          <IconInfoCircle size={20} />
        </ActionIcon>
      ),
    },
  ];

  // Remove auto-fetch on filter change, add manual filter button
  const [pendingFilters, setPendingFilters] = useState({
    selectedUser: null as string | null,
    selectedInstitution: null as string | null,
    selectedType: null as string | null,
    searchTerm: "",
    dateRange: [null, null] as [Date | null, Date | null],
  });

  // Sync UI filter controls with pendingFilters
  useEffect(() => {
    setPendingFilters({
      selectedUser,
      selectedInstitution,
      selectedType,
      searchTerm,
      dateRange,
    });
    // eslint-disable-next-line
  }, []);

  // When user clicks Apply Filters, update real filter states and fetch
  const applyFilters = () => {
    setSelectedUser(pendingFilters.selectedUser);
    setSelectedInstitution(pendingFilters.selectedInstitution);
    setSelectedType(pendingFilters.selectedType);
    setSearchTerm(pendingFilters.searchTerm);
    setDateRange(pendingFilters.dateRange);
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    setIsFiltered(
      !!(
        pendingFilters.selectedUser ||
        pendingFilters.selectedInstitution ||
        pendingFilters.selectedType ||
        pendingFilters.searchTerm ||
        pendingFilters.dateRange[0] ||
        pendingFilters.dateRange[1]
      )
    );
  };

  return (
    <Container size="xl" py="xl" className="min-h-screen">
      {loading && <Loader />}

      {/* Header Section */}
      <Box mb="xl">
        <Group position="apart">
          <div>
            <Title order={1} className="text-3xl font-bold text-gray-800">
              {t("tendencyreport.tendencymanagementadmin.title")}
            </Title>
            <Text color="dimmed" mt="sm">
              {t("tendencyreport.tendencymanagementadmin.subtitle")}
            </Text>
          </div>
          <Group>
            <Button
              color="green"
              leftIcon={<IconFileText size={16} />}
              onClick={handleDownload}
              variant="light"
            >
              {t("tendencyreport.exportCsv") || "Export to CSV"}
            </Button>
            <Badge variant="filled" size="xl" radius="sm">
              {t("tendencyreport.total")}: {allTendencyData.length}
            </Badge>
          </Group>
        </Group>
        <Divider my="md" />
      </Box>

      {/* Filters Section */}
      <Card withBorder shadow="sm" radius="md" mb="xl" p="md">
        <Group spacing="md" grow>
          <Select
            label={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.user"
            )}
            placeholder={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.userPlaceholder"
            )}
            data={users.map((user) => ({
              value: user.id.toString(),
              label: user.name,
            }))}
            value={pendingFilters.selectedUser}
            onChange={(v) =>
              setPendingFilters((f) => ({ ...f, selectedUser: v }))
            }
            clearable
            icon={<IconUser size={16} />}
            searchable
          />

          <Select
            label={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.institution"
            )}
            placeholder={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.institutionPlaceholder"
            )}
            data={uniqueInstitutions.map((inst) => ({
              value: inst,
              label: inst,
            }))}
            value={pendingFilters.selectedInstitution}
            onChange={(v) =>
              setPendingFilters((f) => ({ ...f, selectedInstitution: v }))
            }
            clearable
            icon={<IconBuilding size={16} />}
            searchable
          />

          <Select
            label={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.type"
            )}
            placeholder={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.typePlaceholder"
            )}
            data={allTypes.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
            value={pendingFilters.selectedType}
            onChange={(v) =>
              setPendingFilters((f) => ({ ...f, selectedType: v }))
            }
            clearable
            icon={
              pendingFilters.selectedType ? (
                <ThemeIcon
                  color={getTypeColor(pendingFilters.selectedType)}
                  size="sm"
                >
                  &nbsp;
                </ThemeIcon>
              ) : (
                <IconFileText size={16} />
              )
            }
          />
        </Group>

        <Group spacing="md" grow mt="md">
          <TextInput
            label={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.search"
            )}
            placeholder={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.searchPlaceholder"
            )}
            value={pendingFilters.searchTerm}
            onChange={(e) =>
              setPendingFilters((f) => ({
                ...f,
                searchTerm: e.currentTarget.value,
              }))
            }
            icon={<IconSearch size={16} />}
          />

          <TextInput
            type="date"
            label={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.dateRange"
            )}
            placeholder={t(
              "tendencyreport.tendencymanagementadmin.filterLabels.datePlaceholder"
            )}
            value={
              pendingFilters.dateRange[0]
                ? format(pendingFilters.dateRange[0], "yyyy-MM-dd")
                : ""
            }
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setPendingFilters((f) => ({ ...f, dateRange: [date, null] }));
            }}
            icon={<IconCalendar size={16} />}
          />
        </Group>

        <Group position="right" mt="md">
          <Button
            leftIcon={<IconFilter size={16} />}
            onClick={applyFilters}
            color="blue"
          >
            {t("tendencyreport.tendencymanagementadmin.buttons.applyFilters") ||
              "Apply Filters"}
          </Button>
          <Button
            leftIcon={<IconFilterOff size={16} />}
            onClick={resetFilters}
            variant="outline"
            disabled={!isFiltered}
            color="gray"
          >
            {t("tendencyreport.tendencymanagementadmin.buttons.clearFilters")}
          </Button>
        </Group>
      </Card>

      {/* Tendency Display Section */}
      <Box>
        <MantineReactTable
          columns={columns}
          data={allTendencyData}
          state={{
            isLoading: loading,
            pagination,
            sorting,
          }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          manualPagination
          manualSorting
          rowCount={allTendencyData.length} // Adjust if your API returns total count
          enableColumnOrdering
          enableSorting
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableStickyHeader
          enableFullScreenToggle={false}
          initialState={{
            density: "xs",
          }}
          mantineTableContainerProps={{
            sx: {
              maxHeight: "calc(100vh - 210px)",
            },
          }}
          paginationDisplayMode="pages"
          mantinePaginationProps={{
            showRowsPerPage: true,
          }}
        />
      </Box>

      {/* Details Modal */}
      <Modal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={
          <Text size="xl" weight={600}>
            {t("tendencyreport.tendencymanagementadmin.detailsModal.title")}
          </Text>
        }
        size="lg"
        overlayProps={{
          blur: 3,
        }}
      >
        {selectedTendency && (
          <Stack spacing="lg">
            <Group>
              <Badge
                color={getTypeColor(
                  selectedTendency.type === "custom"
                    ? selectedTendency.type_label || "custom"
                    : selectedTendency.type
                )}
                variant="filled"
                size="xl"
                radius="sm"
              >
                {getTypeLabel(
                  selectedTendency.type,
                  selectedTendency.type_label
                )}
              </Badge>
              <Text weight={500} size="lg">
                {selectedTendency.title}
              </Text>
            </Group>

            <Box>
              <Text size="sm" color="dimmed" mb={4}>
                {t(
                  "tendencyreport.tendencymanagementadmin.detailsModal.description"
                )}
              </Text>
              <Card withBorder p="md">
                <Text>{selectedTendency.description}</Text>
              </Card>
            </Box>

            <Group grow>
              <Box>
                <Text size="sm" color="dimmed" mb={4}>
                  {t(
                    "tendencyreport.tendencymanagementadmin.detailsModal.institution"
                  )}
                </Text>
                <Group spacing="sm">
                  <IconBuilding size={18} color={theme.colors.blue[6]} />
                  <Text>{selectedTendency.institution_name || "N/A"}</Text>
                </Group>
              </Box>

              <Box>
                <Text size="sm" color="dimmed" mb={4}>
                  {t(
                    "tendencyreport.tendencymanagementadmin.detailsModal.submittedBy"
                  )}
                </Text>
                <Group spacing="sm">
                  <IconUser size={18} color={theme.colors.blue[6]} />
                  <Text>{selectedTendency.user_name}</Text>
                </Group>
              </Box>
            </Group>

            <Box>
              <Text size="sm" color="dimmed" mb={4}>
                {t(
                  "tendencyreport.tendencymanagementadmin.detailsModal.dateSubmitted"
                )}
              </Text>
              <Group spacing="sm">
                <IconCalendar size={18} color={theme.colors.blue[6]} />
                <Text>{formatDate(selectedTendency.created_at)}</Text>
              </Group>
            </Box>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default TendencyManagement;
