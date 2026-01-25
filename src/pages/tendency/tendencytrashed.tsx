import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Divider,
  Card,
  Loader,
  Group,
  Badge,
  Text,
  ActionIcon,
  Modal,
  Avatar,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useMantineTheme } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { getTrashedTendencies } from "../../services/api/main";
// import getAllUsers if needed for user info

// Define types (copy from tendencyReport.tsx)
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

interface TendencyReportResponse {
  data: TendencyItem[];
  total: number;
  current_page: number;
  last_page: number;
}

const TendencyTrashed = () => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const [trashedTendencyData, setTrashedTendencyData] = useState<
    TendencyItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTendency, setSelectedTendency] = useState<TendencyItem | null>(
    null
  );
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
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
  const [allTypes, setAllTypes] = useState(predefinedTypes);

  // Fetch trashed tendency data
  const fetchTrashedData = async () => {
    setLoading(true);
    try {
      // API call for trashed tendency data with pagination
      const params = {
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        sort_by: sorting[0]?.id,
        sort_order: sorting[0]?.desc ? "desc" : "asc",
      };
      const response: TendencyReportResponse = await getTrashedTendencies(
        params
      );
      setTrashedTendencyData(response.data);
      // Optionally update types if custom types exist in trashed data
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
            color: "gray",
          });
        }
      });
      setAllTypes(Array.from(types.values()));
      showNotification(
        t("tendencyreport.tendencymanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch trashed data:", error);
      showNotification(
        t("tendencyreport.tendencymanagementadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedData();
    // eslint-disable-next-line
  }, [pagination, sorting]);

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
      // Replace with your actual trashed tendency API call for all data
      // const response = await getTrashedTendencyReport({ ...all params, no pagination });
      const response: TendencyReportResponse = await getTrashedTendencies({
        ...allParams,
        noPagination: true,
      });
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
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tendency_trashed_export_${format(
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

  return (
    <Container size="xl" py="xl" className="min-h-screen">
      {loading && <Loader />}
      <Box mb="xl">
        <Group position="apart">
          <Text size="xl" weight={700}>
            {t("tendencyreport.trashedTitle") || "Trashed Tendency Reports"}
          </Text>
          <Group>
            <ActionIcon
              color="teal"
              variant="filled"
              onClick={handleDownload}
              title={t("tendencyreport.exportButton") || "Export CSV"}
              size="lg"
            >
              <i className="fa fa-download" />
            </ActionIcon>
          </Group>
        </Group>
        <Divider my="md" />
      </Box>
      <Card
        withBorder
        shadow="sm"
        radius="md"
        mb="xl"
        p="md"
        children={undefined}
      >
        {/* Add any trashed-specific filters if needed */}
      </Card>
      <Box>
        <MantineReactTable
          columns={columns}
          data={trashedTendencyData}
          state={{
            isLoading: loading,
            pagination,
            sorting,
          }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          manualPagination
          manualSorting
          rowCount={trashedTendencyData.length}
          enableColumnOrdering
          enableSorting
          enableColumnFilters={false}
          enableGlobalFilter={false}
          enableStickyHeader
          enableFullScreenToggle={false}
          initialState={{ density: "xs" }}
          mantineTableContainerProps={{
            sx: { maxHeight: "calc(100vh - 210px)" },
          }}
          paginationDisplayMode="pages"
          mantinePaginationProps={{ showRowsPerPage: true }}
        />
      </Box>
      <Modal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={t("tendencyreport.tendencymanagementadmin.viewDetailsButton")}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {selectedTendency && (
          <Box>
            <Text weight={600} mb="sm">
              {selectedTendency.title}
            </Text>
            <Text mb="sm">{selectedTendency.description}</Text>
            <Group spacing="xs" mb="sm">
              <Badge color={getTypeColor(selectedTendency.type)}>
                {getTypeLabel(
                  selectedTendency.type,
                  selectedTendency.type_label
                )}
              </Badge>
              <Text color="dimmed" size="sm">
                {t(
                  "tendencyreport.tendencymanagementadmin.tableHeaders.institution"
                )}
                : {selectedTendency.institution_name || "N/A"}
              </Text>
            </Group>
            <Text color="dimmed" size="sm" mb="xs">
              {t(
                "tendencyreport.tendencymanagementadmin.tableHeaders.submittedBy"
              )}
              : {selectedTendency.user_name}
            </Text>
            <Text color="dimmed" size="sm">
              {t("tendencyreport.tendencymanagementadmin.tableHeaders.date")}:{" "}
              {formatDate(selectedTendency.created_at)}
            </Text>
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default TendencyTrashed;
