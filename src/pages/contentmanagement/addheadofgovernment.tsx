import {
  TextInput,
  Textarea,
  Button,
  Switch,
  Group,
  Box,
  Title,
  Divider,
  Modal,
  ActionIcon,
  Badge,
  FileInput,
  Image,
  Text,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createOfficial,
  getOfficials,
  getOfficialById,
  deleteOfficial,
  updateOfficial,
  uploadFile,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconUpload,
  IconPhoto,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface Achievement {
  en: string;
  am: string;
}

interface Official {
  id: number;
  name: {
    am: string;
    en: string;
  };
  title: {
    am: string;
    en: string;
  };
  image: string;
  bio: {
    am: string;
    en: string;
  };
  tenure: string;
  achievements: Achievement[];
  fullBio: {
    am: string;
    en: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const GovernmentOfficials = () => {
  const { t } = useTranslation();
  const [officialsData, setOfficialsData] = useState<Official[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tempAchievement, setTempAchievement] = useState<Achievement>({
    en: "",
    am: "",
  });

  const form = useForm({
    initialValues: {
      name_en: "",
      name_am: "",
      title_en: "",
      title_am: "",
      tenure: "",
      bio_en: "",
      bio_am: "",
      fullBio_en: "",
      fullBio_am: "",
      image_path: "",
      is_active: true,
      imageFile: null as File | null,
    },
    validate: {
      name_en: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.name_en"),
      name_am: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.name_am"),
      title_en: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.title_en"),
      title_am: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.title_am"),
      tenure: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.tenure"),
      bio_en: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.bio_en"),
      bio_am: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.bio_am"),
      fullBio_en: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.fullBio_en"),
      fullBio_am: (value) =>
        value ? null : t("governmentofficalsadmin.form.errors.fullBio_am"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image_path
          ? t("governmentofficalsadmin.form.errors.image")
          : null,
    },
  });

  const fetchOfficials = async () => {
    setLoading(true);
    try {
      const response = await getOfficials();
      setOfficialsData(response || []);
      showNotification(
        t("governmentofficalsadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch officials:", error);
      showNotification(
        t("governmentofficalsadmin.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("governmentofficalsadmin.notifications.success")
          : t("governmentofficalsadmin.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    setPreviewImage(null);
    setAchievements([]);
    setTempAchievement({ en: "", am: "" });
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("governmentofficalsadmin.notifications.invalidId"),
          "error"
        );
        return;
      }

      let imagePath = values.image_path;

      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.imageFile,
            "officials"
          );
          imagePath = uploadResponse.file.path;
          showNotification(
            t("governmentofficalsadmin.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("governmentofficalsadmin.notifications.uploadError"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !imagePath) {
        showNotification(
          t("governmentofficalsadmin.notifications.imageRequired"),
          "error"
        );
        return;
      }

      const payload = {
        name: {
          en: values.name_en,
          am: values.name_am,
        },
        title: {
          en: values.title_en,
          am: values.title_am,
        },
        bio: {
          en: values.bio_en,
          am: values.bio_am,
        },
        fullBio: {
          en: values.fullBio_en,
          am: values.fullBio_am,
        },
        tenure: values.tenure,
        achievements: achievements,
        image: imagePath,
        is_active: values.is_active,
      };

      if (editingId) {
        await updateOfficial(editingId, payload);
        showNotification(
          t("governmentofficalsadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createOfficial(payload);
        showNotification(
          t("governmentofficalsadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchOfficials();
    } catch (error) {
      console.error("Error saving official:", error);
      showNotification(
        t(
          editingId ? "notifications.updateError" : "notifications.createError"
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const item = await getOfficialById(id);
      if (!item) {
        showNotification(
          t("governmentofficalsadmin.notifications.notFound"),
          "error"
        );
        return;
      }

      form.setValues({
        name_en: item.name?.en || "",
        name_am: item.name?.am || "",
        title_en: item.title?.en || "",
        title_am: item.title?.am || "",
        tenure: item.tenure || "",
        bio_en: item.bio?.en || "",
        bio_am: item.bio?.am || "",
        fullBio_en: item.fullBio?.en || "",
        fullBio_am: item.fullBio?.am || "",
        image_path: item.image || "",
        is_active: item.is_active || true,
        imageFile: null,
      });

      setAchievements(item.achievements || []);
      setPreviewImage(item.image || null);
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading official for edit:", error);
      showNotification(
        t("governmentofficalsadmin.notifications.loadEditError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteOfficial(id);
      showNotification(
        t("governmentofficalsadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchOfficials();
    } catch (error) {
      console.error("Error deleting official:", error);
      showNotification(
        t("governmentofficalsadmin.notifications.deleteError"),
        "error"
      );
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

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification(
          t("governmentofficalsadmin.notifications.invalidFileType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("governmentofficalsadmin.notifications.fileSizeError"),
          "error"
        );
        return;
      }

      form.setFieldValue("imageFile", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue("imageFile", null);
      setPreviewImage(null);
    }
  };

  const addAchievement = () => {
    if (tempAchievement.en && tempAchievement.am) {
      setAchievements([...achievements, tempAchievement]);
      setTempAchievement({ en: "", am: "" });
      showNotification(
        t("governmentofficalsadmin.notifications.achievementAdded"),
        "success"
      );
    } else {
      showNotification(
        t("governmentofficalsadmin.notifications.achievementRequired"),
        "error"
      );
    }
  };

  const removeAchievement = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    setAchievements(newAchievements);
    showNotification(
      t("governmentofficalsadmin.notifications.achievementRemoved"),
      "success"
    );
  };

  const columns: MRT_ColumnDef<Official>[] = [
    {
      accessorKey: "id",
      header: t("governmentofficalsadmin.table.columns.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.name?.am || "N/A",
      header: t("governmentofficalsadmin.table.columns.name_am"),
      id: "name_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.name?.en || "N/A",
      header: t("governmentofficalsadmin.table.columns.name_en"),
      id: "name_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.title?.en || "N/A",
      header: t("governmentofficalsadmin.table.columns.title_en"),
      id: "title_en",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "tenure",
      header: t("governmentofficalsadmin.table.columns.tenure"),
    },
    {
      accessorFn: (row) => row.achievements?.length || 0,
      header: t("governmentofficalsadmin.table.columns.achievements"),
      id: "achievements_count",
      Cell: ({ cell }) => (
        <Badge color="teal" variant="filled">
          {cell.getValue<number>()}{" "}
          {t("governmentofficalsadmin.table.achievements")}
        </Badge>
      ),
    },
    {
      accessorKey: "image",
      header: t("governmentofficalsadmin.table.columns.image"),
      Cell: ({ cell }) => (
        <Image
          src={`${import.meta.env.VITE_FILE_API}${cell.getValue<string>()}`}
          width={60}
          height={40}
          fit="cover"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
    },
    {
      accessorKey: "is_active",
      header: t("governmentofficalsadmin.table.columns.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>()
            ? t("governmentofficalsadmin.table.active")
            : t("governmentofficalsadmin.table.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("governmentofficalsadmin.table.columns.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value ? new Date(value).toLocaleString() : "N/A";
      },
    },
    {
      id: "actions",
      header: t("governmentofficalsadmin.table.columns.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("governmentofficalsadmin.table.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("governmentofficalsadmin.table.actions.delete")}
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
        <Title order={2}>{t("governmentofficalsadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            setAchievements([]);
            setTempAchievement({ en: "", am: "" });
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("governmentofficalsadmin.addButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={officialsData}
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
        title={t(editingId ? "modal.editTitle" : "modal.createTitle")}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {(loading || fileUploading) && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("governmentofficalsadmin.form.labels.name_en")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.name_en"
              )}
              {...form.getInputProps("name_en")}
            />
            <TextInput
              label={t("governmentofficalsadmin.form.labels.name_am")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.name_am"
              )}
              {...form.getInputProps("name_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("governmentofficalsadmin.form.labels.title_en")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.title_en"
              )}
              {...form.getInputProps("title_en")}
            />
            <TextInput
              label={t("governmentofficalsadmin.form.labels.title_am")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.title_am"
              )}
              {...form.getInputProps("title_am")}
            />
          </Group>

          <TextInput
            label={t("governmentofficalsadmin.form.labels.tenure")}
            required
            placeholder={t("governmentofficalsadmin.form.placeholders.tenure")}
            {...form.getInputProps("tenure")}
            mb="md"
          />

          <Group grow mb="md">
            <Textarea
              label={t("governmentofficalsadmin.form.labels.bio_en")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.bio_en"
              )}
              {...form.getInputProps("bio_en")}
            />
            <Textarea
              label={t("governmentofficalsadmin.form.labels.bio_am")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.bio_am"
              )}
              {...form.getInputProps("bio_am")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("governmentofficalsadmin.form.labels.fullBio_en")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.fullBio_en"
              )}
              {...form.getInputProps("fullBio_en")}
            />
            <Textarea
              label={t("governmentofficalsadmin.form.labels.fullBio_am")}
              required
              placeholder={t(
                "governmentofficalsadmin.form.placeholders.fullBio_am"
              )}
              {...form.getInputProps("fullBio_am")}
            />
          </Group>

          <FileInput
            label={t("governmentofficalsadmin.form.labels.image")}
            placeholder={t("governmentofficalsadmin.form.placeholders.image")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("governmentofficalsadmin.form.descriptions.image")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
          />

          {(previewImage || form.values.image_path) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `${import.meta.env.VITE_FILE_API}${form.values.image_path}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("governmentofficalsadmin.form.altText.imagePreview")}
              />
            </Box>
          )}

          <Box mb="md">
            <Title order={5} mb="sm">
              {t("governmentofficalsadmin.form.labels.achievements")}
            </Title>
            {achievements.length > 0 && (
              <Stack spacing="xs" mb="sm">
                {achievements.map((achievement, index) => (
                  <Group key={index} position="apart">
                    <Box>
                      <Text size="sm" weight={500}>
                        {t("governmentofficalsadmin.form.achievement.en")}:{" "}
                        {achievement.en}
                      </Text>
                      <Text size="sm" weight={500}>
                        {t("governmentofficalsadmin.form.achievement.am")}:{" "}
                        {achievement.am}
                      </Text>
                    </Box>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeAchievement(index)}
                      title={t(
                        "governmentofficalsadmin.form.actions.removeAchievement"
                      )}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
            <Group grow align="flex-end">
              <TextInput
                label={t("governmentofficalsadmin.form.labels.achievement_en")}
                placeholder={t(
                  "governmentofficalsadmin.form.placeholders.achievement_en"
                )}
                value={tempAchievement.en}
                onChange={(e) =>
                  setTempAchievement({
                    ...tempAchievement,
                    en: e.currentTarget.value,
                  })
                }
              />
              <TextInput
                label={t("governmentofficalsadmin.form.labels.achievement_am")}
                placeholder={t(
                  "governmentofficalsadmin.form.placeholders.achievement_am"
                )}
                value={tempAchievement.am}
                onChange={(e) =>
                  setTempAchievement({
                    ...tempAchievement,
                    am: e.currentTarget.value,
                  })
                }
              />
              <Button
                onClick={addAchievement}
                disabled={!tempAchievement.en || !tempAchievement.am}
              >
                {t("governmentofficalsadmin.form.actions.addAchievement")}
              </Button>
            </Group>
          </Box>

          <Switch
            label={t("governmentofficalsadmin.form.labels.is_active")}
            checked={form.values.is_active}
            onChange={(e) =>
              form.setFieldValue("is_active", e.currentTarget.checked)
            }
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("governmentofficalsadmin.form.actions.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("governmentofficalsadmin.form.actions.update")
                : t("governmentofficalsadmin.form.actions.create")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("governmentofficalsadmin.deleteModal.title")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("governmentofficalsadmin.deleteModal.message")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("governmentofficalsadmin.deleteModal.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("governmentofficalsadmin.deleteModal.confirm")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default GovernmentOfficials;
