import {
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Text,
  Select,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createTendency,
  getTendencyById,
  deleteTendency,
  createActualTendency,
  updateTendency,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface TendencyItem {
  id: number;
  user_id: string;
  user_name: string;
  type: string;
  type_label: string | null;
  title: string;
  description: string;
  district: string | null;
  institution_name: string | null;
  created_at: string;
}

const TendencyManagement = () => {
  const { t } = useTranslation();
  const [tendencyData, setTendencyData] = useState<TendencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [customTypeInput, setCustomTypeInput] = useState(false);

  const predefinedTypes = ["positive", "negative", "neutral", "urgent"];

  const getUserId = () => {
    try {
      const userString = localStorage.getItem("currentUser");
      if (!userString) return 1;
      const user = JSON.parse(userString);
      return user?.id ?? 1;
    } catch (error) {
      console.error("Failed to parse currentUser from localStorage:", error);
      return 1;
    }
  };

  const form = useForm({
    initialValues: {
      type: "",
      custom_type: "",
      title: "",
      description: "",
      institution_name: "",
    },
    validate: {
      type: (value) =>
        value || customTypeInput
          ? null
          : t("tendency.tendencymanagementadmin.form.type.error"),
      custom_type: (value, values) =>
        customTypeInput && !value
          ? t("tendency.tendencymanagementadmin.form.customType.error")
          : null,
      title: (value) =>
        value ? null : t("tendency.tendencymanagementadmin.form.title.error"),
      description: (value) =>
        value
          ? null
          : t("tendency.tendencymanagementadmin.form.description.error"),
      institution_name: (value) =>
        value
          ? null
          : t("tendency.tendencymanagementadmin.form.institution.error"),
    },
  });

  const fetchTendencies = async () => {
    setLoading(true);
    try {
      const response = await createTendency({ user_id: getUserId() });
      setTendencyData(response || []);
      showNotification(
        t("tendency.tendencymanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch tendencies:", error);
      showNotification(
        t("tendency.tendencymanagementadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTendencies();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("tendency.tendencymanagementadmin.notifications.successTitle")
          : t("tendency.tendencymanagementadmin.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    setCustomTypeInput(false);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("tendency.tendencymanagementadmin.errors.invalidId"),
          "error"
        );
        return;
      }

      const payload = {
        user_id: getUserId(),
        type: customTypeInput ? "custom" : values.type,
        title: values.title,
        description: values.description,
        institution_name: values.institution_name,
        ...(customTypeInput && { type_label: values.custom_type }),
      };

      if (editingId) {
        await updateTendency(editingId, payload);
        showNotification(
          t("tendency.tendencymanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        const response = await createActualTendency(payload);
        showNotification(
          response.message ||
            t("tendency.tendencymanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchTendencies();
    } catch (error: any) {
      console.error("Error saving tendency:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          error.response?.data?.message ||
            t(
              `tendency.tendencymanagementadmin.notifications.${
                editingId ? "updateFailed" : "createFailed"
              }`
            ),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(
        t("tendency.tendencymanagementadmin.errors.invalidId"),
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      const response = await getTendencyById(id);

      console.log("API Response:", response); // Debug log

      if (!response?.data) {
        showNotification(
          t("tendency.tendencymanagementadmin.errors.notFound"),
          "error"
        );
        return;
      }

      const item = response.data;

      // Check if it's a custom type (either type is 'custom' or has a type_label)
      const isCustom =
        item.type === "custom" ||
        (item.type_label && !predefinedTypes.includes(item.type));
      setCustomTypeInput(isCustom);

      console.log("Setting form values:", {
        // Debug log
        type: isCustom ? "" : item.type,
        custom_type: isCustom ? item.type_label || "" : "",
        title: item.title,
        description: item.description,
        institution_name: item.institution_name,
      });

      form.setValues({
        type: isCustom ? "" : item.type,
        custom_type: isCustom ? item.type_label || "" : "",
        title: item.title || "",
        description: item.description || "",
        institution_name: item.institution_name || "",
      });

      setEditingId(item.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading tendency for edit:", error);
      let errorMessage = t(
        "tendency.tendencymanagementadmin.notifications.updateFailed"
      );
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteTendency({
        id: id,
        user_id: getUserId(), // Include the logged-in user's ID in the payload
      });
      showNotification(
        t("tendency.tendencymanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchTendencies();
    } catch (error: any) {
      console.error("Error deleting tendency:", error);
      let errorMessage = t(
        "tendency.tendencymanagementadmin.notifications.deleteFailed"
      );
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const columns: MRT_ColumnDef<TendencyItem>[] = [
    {
      accessorKey: "id",
      header: t("tendency.tendencymanagementadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "type",
      header: t("tendency.tendencymanagementadmin.table.headers.type"),
      Cell: ({ cell, row }) => {
        const type = cell.getValue<string>();
        return row.original.type_label
          ? row.original.type_label
          : predefinedTypes.includes(type)
          ? t(`tendency.types.${type}`)
          : type;
      },
    },
    {
      accessorKey: "title",
      header: t("tendency.tendencymanagementadmin.table.headers.title"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "description",
      header: t("tendency.tendencymanagementadmin.table.headers.description"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 300 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "institution_name",
      header: t("tendency.tendencymanagementadmin.table.headers.institution"),
    },
    {
      accessorKey: "user_name",
      header: t("tendency.tendencymanagementadmin.table.headers.user"),
    },
    {
      accessorKey: "created_at",
      header: t("tendency.tendencymanagementadmin.table.headers.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      id: "actions",
      header: t("tendency.tendencymanagementadmin.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("tendency.tendencymanagementadmin.table.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("tendency.tendencymanagementadmin.table.actions.delete")}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("tendency.tendencymanagementadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setCustomTypeInput(false);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("tendency.tendencymanagementadmin.buttons.addTendency")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={tendencyData}
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
      </Box>

      <Modal
        opened={editModalOpen}
        onClose={resetAndCloseModal}
        title={
          editingId
            ? t("tendency.tendencymanagementadmin.modal.editTitle")
            : t("tendency.tendencymanagementadmin.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex gap="sm" align="flex-end" mb="md">
            <Select
              withAsterisk
              label={t("tendency.tendencymanagementadmin.form.type.label")}
              placeholder={t(
                "tendency.tendencymanagementadmin.form.type.placeholder"
              )}
              data={predefinedTypes.map((type) => ({
                value: type,
                label: t(`tendency.types.${type}`),
              }))}
              {...form.getInputProps("type")}
              disabled={customTypeInput}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setCustomTypeInput(!customTypeInput);
                form.setFieldValue("type", "");
                form.setFieldValue("custom_type", "");
              }}
            >
              {customTypeInput
                ? t("tendency.tendencymanagementadmin.buttons.selectPredefined")
                : t("tendency.tendencymanagementadmin.buttons.addCustom")}
            </Button>
          </Flex>

          {customTypeInput && (
            <TextInput
              withAsterisk
              label={t(
                "tendency.tendencymanagementadmin.form.customType.label"
              )}
              placeholder={t(
                "tendency.tendencymanagementadmin.form.customType.placeholder"
              )}
              {...form.getInputProps("custom_type")}
              error={form.errors.custom_type}
              mb="md"
            />
          )}

          <TextInput
            withAsterisk
            label={t("tendency.tendencymanagementadmin.form.title.label")}
            placeholder={t(
              "tendency.tendencymanagementadmin.form.title.placeholder"
            )}
            {...form.getInputProps("title")}
            error={form.errors.title}
            mb="md"
          />

          <TextInput
            withAsterisk
            label={t("tendency.tendencymanagementadmin.form.institution.label")}
            placeholder={t(
              "tendency.tendencymanagementadmin.form.institution.placeholder"
            )}
            {...form.getInputProps("institution_name")}
            error={form.errors.institution_name}
            mb="md"
          />

          <Textarea
            withAsterisk
            label={t("tendency.tendencymanagementadmin.form.description.label")}
            placeholder={t(
              "tendency.tendencymanagementadmin.form.description.placeholder"
            )}
            minRows={4}
            {...form.getInputProps("description")}
            error={form.errors.description}
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("tendency.tendencymanagementadmin.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading}
            >
              {editingId
                ? t("tendency.tendencymanagementadmin.buttons.updateTendency")
                : t("tendency.tendencymanagementadmin.buttons.createTendency")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("tendency.tendencymanagementadmin.modal.deleteTitle")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("tendency.tendencymanagementadmin.modal.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("tendency.tendencymanagementadmin.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("tendency.tendencymanagementadmin.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default TendencyManagement;
