import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Text,
  Textarea,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createworeda,
  GetAllWoredas,
  getworedasbyId,
  UpdateWoredas,
  DeleteWoredas,
  getAllSubcity,
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

interface WoredaItem {
  id: number;
  name: {
    en: string;
    am: string;
  };
  subcity_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface SubcityItem {
  id: number;
  name: string; // This is a stringified JSON
  description: string;
  created_at: string;
  updated_at: string;
}

interface SelectItem {
  value: string;
  label: string;
}

const WoredaManagement = () => {
  const { t } = useTranslation();
  const [woredaData, setWoredaData] = useState<WoredaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [subcities, setSubcities] = useState<SelectItem[]>([]);
  const [subcitiesLoading, setSubcitiesLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name_en: "",
      name_am: "",
      subcity_id: "",
      description: "",
    },
    validate: {
      name_en: (value) =>
        value ? null : t("woredaregistration.woreda.errors.nameEnRequired"),
      name_am: (value) =>
        value ? null : t("woredaregistration.woreda.errors.nameAmRequired"),
      subcity_id: (value) =>
        value ? null : t("woredaregistration.woreda.errors.subcityRequired"),
      description: (value) =>
        value
          ? null
          : t("woredaregistration.woreda.errors.descriptionRequired"),
    },
  });

  const fetchSubcities = async () => {
    setSubcitiesLoading(true);
    try {
      const response = await getAllSubcity();
      const formattedSubcities = response.map((subcity: SubcityItem) => {
        try {
          const nameObj = JSON.parse(subcity.name);
          return {
            value: subcity.id.toString(),
            label: nameObj.en || `Subcity ${subcity.id}`,
          };
        } catch (e) {
          console.error("Error parsing subcity name:", e);
          return {
            value: subcity.id.toString(),
            label: `Subcity ${subcity.id}`,
          };
        }
      });
      setSubcities(formattedSubcities);
    } catch (error) {
      console.error("Failed to fetch subcities:", error);
      showNotification(
        t("woredaregistration.woreda.errors.failedLoadSubcities"),
        "error"
      );
    } finally {
      setSubcitiesLoading(false);
    }
  };

  const fetchWoredas = async () => {
    setLoading(true);
    try {
      const response = await GetAllWoredas();
      setWoredaData(response || []);
      showNotification(
        t("woredaregistration.woreda.messages.dataLoaded"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch woredas:", error);
      showNotification(
        t("woredaregistration.woreda.errors.failedLoad"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcities();
    fetchWoredas();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("woredaregistration.common.success")
          : t("woredaregistration.common.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("woredaregistration.woreda.errors.invalidId"),
          "error"
        );
        return;
      }

      const payload = {
        name: {
          en: values.name_en,
          am: values.name_am,
        },
        subcity_id: Number(values.subcity_id),
        description: values.description,
      };

      if (editingId) {
        // Correctly structure the update payload
        await UpdateWoredas(editingId, payload);
        showNotification(
          t("woredaregistration.woreda.messages.updateSuccess"),
          "success"
        );
      } else {
        await createworeda(payload);
        showNotification(
          t("woredaregistration.woreda.messages.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchWoredas();
    } catch (error: any) {
      console.error("Error saving woreda:", error);

      if (error.response?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          t(
            editingId
              ? "woredaregistration.woreda.errors.updateFailed"
              : "woredaregistration.woreda.errors.createFailed",
            {
              error: error.message,
            }
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
        t("woredaregistration.woreda.errors.invalidId"),
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      const item = await getworedasbyId(id);
      if (!item) {
        showNotification(
          t("woredaregistration.woreda.errors.notFound"),
          "error"
        );
        return;
      }

      form.setValues({
        name_en: item.name?.en || "",
        name_am: item.name?.am || "",
        subcity_id: item.subcity_id?.toString() || "",
        description: item.description || "",
      });

      setEditingId(item.id);
      openModal();
    } catch (error: any) {
      console.error("Error loading woreda for edit:", error);
      let errorMessage = t(
        "woredaregistration.woreda.errors.loadForEditFailed"
      );
      if (error.response?.message) {
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
      await DeleteWoredas(id);
      showNotification(
        t("woredaregistration.woreda.messages.deleteSuccess"),
        "success"
      );
      fetchWoredas();
    } catch (error: any) {
      console.error("Error deleting woreda:", error);
      let errorMessage = t("woredaregistration.woreda.errors.deleteFailed");
      if (error.response?.message) {
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

  const columns: MRT_ColumnDef<WoredaItem>[] = [
    {
      accessorKey: "id",
      header: t("woredaregistration.woreda.table.headers.id"),
      size: 80,
    },
    {
      accessorFn: (row) =>
        row.name?.en || t("woredaregistration.common.notAvailable"),
      header: t("woredaregistration.woreda.table.headers.nameEn"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) =>
        row.name?.am || t("woredaregistration.common.notAvailable"),
      header: t("woredaregistration.woreda.table.headers.nameAm"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "subcity_id",
      header: t("woredaregistration.woreda.table.headers.subcityId"),
      Cell: ({ cell }) => {
        const subcityId = cell.getValue<number>();
        const subcity = subcities.find((s) => s.value === subcityId.toString());
        return subcity ? subcity.label : subcityId;
      },
    },
    {
      accessorKey: "description",
      header: t("woredaregistration.woreda.table.headers.description"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">
            {cell.getValue<string>() ||
              t("woredaregistration.common.notAvailable")}
          </div>
        </Box>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("woredaregistration.woreda.table.headers.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("woredaregistration.common.notAvailable");
      },
    },
    {
      accessorKey: "updated_at",
      header: t("woredaregistration.woreda.table.headers.updatedAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("woredaregistration.common.notAvailable");
      },
    },
    {
      id: "actions",
      header: t("woredaregistration.woreda.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        );
      },
    },
  ];

  if (loading || subcitiesLoading) {
    return <Loader />;
  }

  return (
    <Box p="md" pos="relative">
      <Group position="apart" mb="md">
        <Title order={2}>{t("woredaregistration.woreda.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("woredaregistration.woreda.buttons.addWoreda")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={woredaData}
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
            ? t("woredaregistration.woreda.modal.editTitle")
            : t("woredaregistration.woreda.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {loading ? (
          <Loader />
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group grow mb="md">
              <TextInput
                withAsterisk
                label={t("woredaregistration.woreda.form.nameEnLabel")}
                placeholder={t(
                  "woredaregistration.woreda.form.nameEnPlaceholder"
                )}
                {...form.getInputProps("name_en")}
                error={form.errors.name_en}
              />
              <TextInput
                withAsterisk
                label={t("woredaregistration.woreda.form.nameAmLabel")}
                placeholder={t(
                  "woredaregistration.woreda.form.nameAmPlaceholder"
                )}
                {...form.getInputProps("name_am")}
                error={form.errors.name_am}
              />
            </Group>

            <Select
              withAsterisk
              label={t("woredaregistration.woreda.form.subcityLabel")}
              placeholder={t(
                "woredaregistration.woreda.form.subcityPlaceholder"
              )}
              data={subcities}
              mb="md"
              {...form.getInputProps("subcity_id")}
              error={form.errors.subcity_id}
              searchable
              nothingFound={t(
                "woredaregistration.woreda.form.noSubcitiesFound"
              )}
            />

            <Textarea
              withAsterisk
              label={t("woredaregistration.woreda.form.descriptionLabel")}
              placeholder={t(
                "woredaregistration.woreda.form.descriptionPlaceholder"
              )}
              minRows={3}
              mb="md"
              {...form.getInputProps("description")}
              error={form.errors.description}
            />

            <Group position="right" mt="xl">
              <Button variant="default" onClick={resetAndCloseModal}>
                {t("woredaregistration.woreda.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan" }}
                loading={loading}
              >
                {editingId
                  ? t("woredaregistration.woreda.buttons.updateWoreda")
                  : t("woredaregistration.woreda.buttons.createWoreda")}
              </Button>
            </Group>
          </form>
        )}
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("woredaregistration.woreda.modal.deleteTitle")}
        centered
      >
        {deleteLoading ? (
          <Loader />
        ) : (
          <Box>
            <Text size="sm" mb="md">
              {t("woredaregistration.woreda.modal.deleteConfirmation")}
            </Text>
            <Group position="right" mt="md">
              <Button
                variant="default"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                {t("woredaregistration.woreda.buttons.cancel")}
              </Button>
              <Button
                color="red"
                loading={deleteLoading}
                onClick={() => itemToDelete && handleDelete(itemToDelete)}
              >
                {t("woredaregistration.woreda.buttons.delete")}
              </Button>
            </Group>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default WoredaManagement;
