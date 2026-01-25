import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Group,
  Text,
  Badge,
  Loader,
  Divider,
  Modal,
  ActionIcon,
} from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { getTrashedQuestionnaires } from "../../services/api/main";

interface QuestionnaireItem {
  id: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  questions?: any[];
  creator?: { id: number; name: string };
  createdAt: string;
}

const QATrashed = () => {
  const { t } = useTranslation();
  const [trashedQuestionnaires, setTrashedQuestionnaires] = useState<
    QuestionnaireItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<QuestionnaireItem | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const fetchTrashedQuestionnaires = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        sort_by: sorting[0]?.id,
        sort_order: sorting[0]?.desc ? "desc" : "asc",
      };
      const response = await getTrashedQuestionnaires({ params });
      setTrashedQuestionnaires(response?.data?.data || []);
      setRowCount(response?.data?.total || 0);
      notifications.show({
        title: t("questionnairespageadmin.notifications.success"),
        message: t("questionnairespageadmin.notifications.trashedLoaded"),
        color: "teal",
        withBorder: true,
      });
    } catch (error) {
      console.error("Failed to fetch trashed questionnaires:", error);
      notifications.show({
        title: t("questionnairespageadmin.notifications.error"),
        message: t("questionnairespageadmin.notifications.trashedFailed"),
        color: "red",
        withBorder: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedQuestionnaires();
    // eslint-disable-next-line
  }, [pagination, sorting]);

  const openDetailsModal = (questionnaire: QuestionnaireItem) => {
    setSelectedQuestionnaire(questionnaire);
    setDetailsModalOpen(true);
  };

  const columns: MRT_ColumnDef<QuestionnaireItem>[] = [
    {
      accessorKey: "title",
      header: t("questionnairespageadmin.columns.title"),
      Cell: ({ cell, row }) => (
        <Box>
          <Text weight={500}>{cell.getValue<string>()}</Text>
          <Text size="sm" color="dimmed">
            {row.original.description}
          </Text>
        </Box>
      ),
    },
    {
      accessorKey: "type",
      header: t("questionnairespageadmin.columns.type"),
      Cell: ({ cell }) => (
        <Badge color={cell.getValue<string>() === "exam" ? "red" : "blue"}>
          {t(
            `questionnairespageadmin.filterOptions.${cell.getValue<string>()}`
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("questionnairespageadmin.columns.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<string>() === "Published" ? "green" : "gray"}
        >
          {t(
            `questionnairespageadmin.status.${
              cell.getValue<string>() === "Published" ? "published" : "draft"
            }`
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "questions",
      header: t("questionnairespageadmin.columns.questions"),
      Cell: ({ row }) => row.original.questions?.length || 0,
    },
    {
      id: "actions",
      header: t("questionnairespageadmin.table.headers.actions"),
      Cell: ({ row }) => (
        <ActionIcon
          color="blue"
          variant="light"
          onClick={() => openDetailsModal(row.original)}
        >
          <IconInfoCircle size={16} />
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
            {t("questionnairespageadmin.trashTitle") ||
              "Trashed Questionnaires"}
          </Text>
        </Group>
        <Divider my="md" />
      </Box>
      <Box>
        <MantineReactTable
          columns={columns}
          data={trashedQuestionnaires}
          state={{ isLoading: loading, pagination, sorting }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          manualPagination
          manualSorting
          rowCount={rowCount}
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
        title={
          t("questionnairespageadmin.trashDetailsTitle") ||
          "Questionnaire Details"
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {selectedQuestionnaire && (
          <Box>
            <Text weight={600} mb="sm">
              {selectedQuestionnaire.title}
            </Text>
            <Text mb="sm">{selectedQuestionnaire.description}</Text>
            <Group spacing="xs" mb="sm">
              <Badge color="blue">
                {t(
                  `questionnairespageadmin.filterOptions.${selectedQuestionnaire.type}`
                )}
              </Badge>
              <Text color="dimmed" size="sm">
                {selectedQuestionnaire.status}
              </Text>
            </Group>
            <Text color="dimmed" size="sm" mb="xs">
              {t("questionnairespageadmin.columns.questions")}:{" "}
              {selectedQuestionnaire.questions?.length || 0}
            </Text>
            <Text color="dimmed" size="sm">
              {t("questionnairespageadmin.columns.createdAt")}:{" "}
              {selectedQuestionnaire.createdAt
                ? new Date(selectedQuestionnaire.createdAt).toLocaleString()
                : t("table.notAvailable")}
            </Text>
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default QATrashed;
