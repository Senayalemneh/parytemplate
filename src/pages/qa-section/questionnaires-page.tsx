import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Title,
  Text,
  Badge,
  Modal,
  Notification,
  Select,
  Loader,
  Center,
  Group,
  Box,
} from "@mantine/core";
import {
  getQuestionnaires,
  publishQuestionnaires,
  unpublishQuestionnaires,
} from "../../services/api/main";
import { useDisclosure } from "@mantine/hooks";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  IconEye,
  IconEdit,
  IconPlayerPlay,
  IconCheck,
} from "@tabler/icons-react";
import { PERMISSIONS } from "../../enums/permissions";

export default function QuestionnairesPage() {
  const { t } = useTranslation();
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<any[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [
    publishModalOpen,
    { open: openPublishModal, close: closePublishModal },
  ] = useDisclosure(false);
  const [
    unpublishModalOpen,
    { open: openUnpublishModal, close: closeUnpublishModal },
  ] = useDisclosure(false);
  const [currentQuestionnaireId, setCurrentQuestionnaireId] = useState<
    string | null
  >(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get current user role from localStorage
  const currentRole = JSON.parse(localStorage.getItem("currentRole") || "{}");
  const isEmployee = currentRole.id === 7;

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const data = await getQuestionnaires();
        const currentUser = localStorage.getItem("currentUser");
        const user = currentUser ? JSON.parse(currentUser) : null;

        const filteredData = data.data.filter((q) => {
          if (q.status === "Published") return true;
          if (user && q.status === "Draft" && q.creator.id === user.id)
            return true;
          return false;
        });

        setQuestionnaires(filteredData);
        setFilteredQuestionnaires(filteredData);
      } catch (error) {
        console.error("Error fetching questionnaires:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaires();
  }, []);

  useEffect(() => {
    if (typeFilter) {
      setFilteredQuestionnaires(
        questionnaires.filter((q) => q.type === typeFilter)
      );
    } else {
      setFilteredQuestionnaires(questionnaires);
    }
  }, [typeFilter, questionnaires]);

  const handlePublish = async () => {
    try {
      if (currentQuestionnaireId) {
        await publishQuestionnaires(currentQuestionnaireId);
        const updated = await getQuestionnaires();
        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "{}"
        );

        const filtered = updated.data.filter((questionnaire) => {
          if (questionnaire.status === "Published") return true;
          if (
            questionnaire.status === "Draft" &&
            questionnaire.creator.id === currentUser.id
          )
            return true;
          return false;
        });

        setQuestionnaires(filtered);
        setFilteredQuestionnaires(filtered);
        setSuccessMessage(
          t("questionnairespageadmin.notifications.publishSuccess")
        );
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      closePublishModal();
    } catch (err) {
      console.error("Failed to publish questionnaire:", err);
    }
  };

  const handleUnpublish = async () => {
    try {
      if (currentQuestionnaireId) {
        await unpublishQuestionnaires(currentQuestionnaireId);
        const updated = await getQuestionnaires();
        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "{}"
        );

        const filtered = updated.data.filter((questionnaire) => {
          if (questionnaire.status === "Published") return true;
          if (
            questionnaire.status === "Draft" &&
            questionnaire.creator.id === currentUser.id
          )
            return true;
          return false;
        });

        setQuestionnaires(filtered);
        setFilteredQuestionnaires(filtered);
        setSuccessMessage(
          t("questionnairespageadmin.notifications.unpublishSuccess")
        );
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      closeUnpublishModal();
    } catch (err) {
      console.error("Failed to unpublish questionnaire:", err);
    }
  };

  const columns: MRT_ColumnDef<any>[] = [
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
      header: t("questionnairespageadmin.columns.actions"),
      Cell: ({ row }) => (
        <Group spacing="xs">
          {!isEmployee && (
            <>
              <Button
                variant="outline"
                size="xs"
                leftIcon={<IconEye size={14} />}
                onClick={() => navigate(`/questionnaires/${row.original.id}`)}
              >
                {t("questionnairespageadmin.buttons.view")}
              </Button>
              {PERMISSIONS.MANAGE_WOREDAS && (
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<IconEdit size={14} />}
                  onClick={() =>
                    navigate(`/questionnaires/${row.original.id}/edit`)
                  }
                >
                  {t("questionnairespageadmin.buttons.edit")}
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            size="xs"
            leftIcon={<IconPlayerPlay size={14} />}
            onClick={() => navigate(`/questionnaires/${row.original.id}/take`)}
          >
            {t("questionnairespageadmin.buttons.take")}
          </Button>
          {PERMISSIONS.MANAGE_WOREDAS &&
            (row.original.status === "Draft" ? (
              <Button
                color="green"
                variant="filled"
                size="xs"
                onClick={() => {
                  setCurrentQuestionnaireId(row.original.id);
                  openPublishModal();
                }}
              >
                {t("questionnairespageadmin.buttons.publish")}
              </Button>
            ) : (
              <Button
                color="orange"
                variant="filled"
                size="xs"
                onClick={() => {
                  setCurrentQuestionnaireId(row.original.id);
                  openUnpublishModal();
                }}
              >
                {t("questionnairespageadmin.buttons.unpublish")}
              </Button>
            ))}
        </Group>
      ),
    },
  ];

  if (loading)
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" variant="dots" />
      </Center>
    );

  return (
    <Box p="md">
      <Group position="apart" mb="md">
        <Title order={2}>{t("questionnairespageadmin.title")}</Title>
        {PERMISSIONS.MANAGE_WOREDAS && (
          <Button onClick={() => navigate("/questionnaires/create")}>
            {t("questionnairespageadmin.createButton")}
          </Button>
        )}
      </Group>

      <Select
        placeholder={t("questionnairespageadmin.filterPlaceholder")}
        data={[
          {
            value: "exam",
            label: t("questionnairespageadmin.filterOptions.exam"),
          },
          {
            value: "practice_test",
            label: t("questionnairespageadmin.filterOptions.practice_test"),
          },
        ]}
        value={typeFilter}
        onChange={setTypeFilter}
        clearable
        mb="md"
        style={{ width: 200 }}
      />

      <MantineReactTable
        columns={columns}
        data={filteredQuestionnaires}
        state={{ isLoading: loading }}
        enableColumnOrdering
        enablePagination
        enableSorting
        enableColumnFilters
        enableGlobalFilter
        enableStickyHeader
        enableFullScreenToggle={false}
        initialState={{
          density: "xs",
          pagination: { pageSize: 10, pageIndex: 0 },
        }}
        mantineTableContainerProps={{
          sx: {
            maxHeight: "calc(100vh - 210px)",
          },
        }}
      />

      {!isEmployee && (
        <>
          <Modal
            opened={publishModalOpen}
            onClose={closePublishModal}
            title={t("questionnairespageadmin.modals.publish.title")}
            centered
          >
            <Text>{t("questionnairespageadmin.modals.publish.content")}</Text>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={closePublishModal}>
                {t("questionnairespageadmin.modals.publish.cancel")}
              </Button>
              <Button color="green" onClick={handlePublish}>
                {t("questionnairespageadmin.modals.publish.confirm")}
              </Button>
            </Group>
          </Modal>

          <Modal
            opened={unpublishModalOpen}
            onClose={closeUnpublishModal}
            title={t("questionnairespageadmin.modals.unpublish.title")}
            centered
          >
            <Text>{t("questionnairespageadmin.modals.unpublish.content")}</Text>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={closeUnpublishModal}>
                {t("questionnairespageadmin.modals.unpublish.cancel")}
              </Button>
              <Button color="orange" onClick={handleUnpublish}>
                {t("questionnairespageadmin.modals.unpublish.confirm")}
              </Button>
            </Group>
          </Modal>
        </>
      )}

      {showSuccess && (
        <Notification
          title={t("questionnairespageadmin.notifications.success")}
          color="green"
          onClose={() => setShowSuccess(false)}
          icon={<IconCheck size={18} />}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {successMessage}
        </Notification>
      )}
    </Box>
  );
}
