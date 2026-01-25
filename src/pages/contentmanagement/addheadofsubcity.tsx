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
  Badge,
  FileInput,
  Image,
  Text,
  Chip,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createSubcityOfficial,
  getSubcityOfficials,
  getSubcityOfficialById,
  deleteSubcityOfficial,
  updateSubcityOfficial,
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
  achievements: string[];
  fullBio: {
    am: string;
    en: string;
  };
  created_at: string;
  updated_at: string;
}

const SubcityOfficials = () => {
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
  const [achievements, setAchievements] = useState<string[]>([]);
  const [tempAchievement, setTempAchievement] = useState("");

  const form = useForm({
    initialValues: {
      name_en: "",
      name_am: "",
      title_en: "",
      title_am: "",
      bio_en: "",
      bio_am: "",
      tenure: "",
      fullBio_en: "",
      fullBio_am: "",
      image_path: "",
      imageFile: null as File | null,
    },
    validate: {
      name_en: (value) =>
        value ? null : t("subcityofficialadmin.errors.name_en"),
      name_am: (value) =>
        value ? null : t("subcityofficialadmin.errors.name_am"),
      title_en: (value) =>
        value ? null : t("subcityofficialadmin.errors.title_en"),
      title_am: (value) =>
        value ? null : t("subcityofficialadmin.errors.title_am"),
      bio_en: (value) =>
        value ? null : t("subcityofficialadmin.errors.bio_en"),
      bio_am: (value) =>
        value ? null : t("subcityofficialadmin.errors.bio_am"),
      tenure: (value) =>
        value ? null : t("subcityofficialadmin.errors.tenure"),
      fullBio_en: (value) =>
        value ? null : t("subcityofficialadmin.errors.fullBio_en"),
      fullBio_am: (value) =>
        value ? null : t("subcityofficialadmin.errors.fullBio_am"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image_path
          ? t("subcityofficialadmin.errors.image")
          : null,
    },
  });

  const fetchOfficials = async () => {
    setLoading(true);
    try {
      const response = await getSubcityOfficials();
      setOfficialsData(response || []);
      showNotification(
        t("subcityofficialadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch officials:", error);
      showNotification(
        t("subcityofficialadmin.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, [t]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("subcityofficialadmin.notifications.success")
          : t("subcityofficialadmin.notifications.error"),
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
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(t("subcityofficialadmin.errors.invalidId"), "error");
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
            t("subcityofficialadmin.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("subcityofficialadmin.notifications.uploadError"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !imagePath) {
        showNotification(
          t("subcityofficialadmin.errors.imageRequired"),
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
      };

      if (editingId) {
        await updateSubcityOfficial(editingId, payload);
        showNotification(
          t("subcityofficialadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await createSubcityOfficial(payload);
        showNotification(
          t("subcityofficialadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchOfficials();
    } catch (error) {
      console.error("Error saving official:", error);
      showNotification(
        t(
          editingId
            ? "subcityofficialadmin.notifications.updateError"
            : "subcityofficialadmin.notifications.createError"
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(t("subcityofficialadmin.errors.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const item = await getSubcityOfficialById(id);
      if (!item) {
        showNotification(t("subcityofficialadmin.errors.notFound"), "error");
        return;
      }

      form.setValues({
        name_en: item.name?.en || "",
        name_am: item.name?.am || "",
        title_en: item.title?.en || "",
        title_am: item.title?.am || "",
        bio_en: item.bio?.en || "",
        bio_am: item.bio?.am || "",
        tenure: item.tenure || "",
        fullBio_en: item.fullBio?.en || "",
        fullBio_am: item.fullBio?.am || "",
        image_path: item.image || "",
        imageFile: null,
      });

      setAchievements(item.achievements || []);
      setPreviewImage(
        item.image
          ? `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${item.image}`
          : null
      );
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading official for edit:", error);
      showNotification(t("subcityofficialadmin.errors.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteSubcityOfficial(id);
      showNotification(
        t("subcityofficialadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchOfficials();
    } catch (error) {
      console.error("Error deleting official:", error);
      showNotification(
        t("subcityofficialadmin.notifications.deleteError"),
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
          t("subcityofficialadmin.errors.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t("subcityofficialadmin.errors.imageSize"), "error");
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
    if (tempAchievement.trim()) {
      setAchievements([...achievements, tempAchievement]);
      setTempAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const columns: MRT_ColumnDef<Official>[] = [
    {
      accessorKey: "id",
      header: t("subcityofficialadmin.table.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.name?.am || t("subcityofficialadmin.table.na"),
      header: t("subcityofficialadmin.table.nameAm"),
      id: "name_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.name?.en || t("subcityofficialadmin.table.na"),
      header: t("subcityofficialadmin.table.nameEn"),
      id: "name_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.title?.en || t("subcityofficialadmin.table.na"),
      header: t("subcityofficialadmin.table.title"),
      id: "title",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "tenure",
      header: t("subcityofficialadmin.table.tenure"),
    },
    {
      accessorFn: (row) => row.achievements?.length || 0,
      header: t("subcityofficialadmin.table.achievements"),
      id: "achievements_count",
      Cell: ({ cell }) => (
        <Badge color="teal" variant="filled">
          {cell.getValue<number>()}{" "}
          {t("subcityofficialadmin.table.achievementsCount")}
        </Badge>
      ),
    },
    {
      accessorKey: "image",
      header: t("subcityofficialadmin.table.image"),
      Cell: ({ cell }) => (
        <Image
          src={`https://bole.prosperity.boleprosperityparty.org/CMSFiles/${cell.getValue<string>()}`}
          width={60}
          height={60}
          fit="cover"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: t("subcityofficialadmin.table.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("subcityofficialadmin.table.na");
      },
    },
    {
      id: "actions",
      header: t("subcityofficialadmin.table.actions"),
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

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("subcityofficialadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            setAchievements([]);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("subcityofficialadmin.addButton")}
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
        title={
          editingId
            ? t("subcityofficialadmin.editTitle")
            : t("subcityofficialadmin.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("subcityofficialadmin.form.nameAm")}
              required
              placeholder={t("subcityofficialadmin.form.nameAmPlaceholder")}
              {...form.getInputProps("name_am")}
            />
            <TextInput
              label={t("subcityofficialadmin.form.nameEn")}
              required
              placeholder={t("subcityofficialadmin.form.nameEnPlaceholder")}
              {...form.getInputProps("name_en")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("subcityofficialadmin.form.titleAm")}
              required
              placeholder={t("subcityofficialadmin.form.titleAmPlaceholder")}
              {...form.getInputProps("title_am")}
            />
            <TextInput
              label={t("subcityofficialadmin.form.titleEn")}
              required
              placeholder={t("subcityofficialadmin.form.titleEnPlaceholder")}
              {...form.getInputProps("title_en")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("subcityofficialadmin.form.bioAm")}
              required
              placeholder={t("subcityofficialadmin.form.bioAmPlaceholder")}
              {...form.getInputProps("bio_am")}
            />
            <Textarea
              label={t("subcityofficialadmin.form.bioEn")}
              required
              placeholder={t("subcityofficialadmin.form.bioEnPlaceholder")}
              {...form.getInputProps("bio_en")}
            />
          </Group>

          <TextInput
            label={t("subcityofficialadmin.form.tenure")}
            required
            placeholder={t("subcityofficialadmin.form.tenurePlaceholder")}
            {...form.getInputProps("tenure")}
            mb="md"
          />

          <Group grow mb="md">
            <Textarea
              label={t("subcityofficialadmin.form.fullBioAm")}
              required
              placeholder={t("subcityofficialadmin.form.fullBioAmPlaceholder")}
              {...form.getInputProps("fullBio_am")}
            />
            <Textarea
              label={t("subcityofficialadmin.form.fullBioEn")}
              required
              placeholder={t("subcityofficialadmin.form.fullBioEnPlaceholder")}
              {...form.getInputProps("fullBio_en")}
            />
          </Group>

          <FileInput
            label={t("subcityofficialadmin.form.image")}
            placeholder={t("subcityofficialadmin.form.imagePlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("subcityofficialadmin.form.imageDescription")}
            clearable
            required={!editingId}
            {...form.getInputProps("imageFile")}
          />

          {(previewImage || form.values.image_path) && (
            <Box mb="md">
              <Image
                src={
                  previewImage ||
                  `https://bole.prosperity.boleprosperityparty.org/CMSFiles/${form.values.image_path}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("subcityofficialadmin.form.imagePreview")}
              />
            </Box>
          )}

          <Box mb="md">
            <Text size="sm" weight={500} mb="xs">
              {t("subcityofficialadmin.form.achievements")}
            </Text>
            <Stack spacing="xs">
              {achievements.length > 0 && (
                <Chip.Group>
                  <Group spacing="xs">
                    {achievements.map((achievement, index) => (
                      <Chip
                        key={index}
                        checked={false}
                        onRemove={() => removeAchievement(index)}
                      >
                        {achievement}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              )}
              <Group grow>
                <TextInput
                  placeholder={t(
                    "subcityofficialadmin.form.achievementPlaceholder"
                  )}
                  value={tempAchievement}
                  onChange={(e) => setTempAchievement(e.currentTarget.value)}
                />
                <Button
                  onClick={addAchievement}
                  disabled={!tempAchievement.trim()}
                >
                  {t("subcityofficialadmin.form.addAchievement")}
                </Button>
              </Group>
            </Stack>
          </Box>

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("subcityofficialadmin.cancelButton")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("subcityofficialadmin.updateButton")
                : t("subcityofficialadmin.createButton")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("subcityofficialadmin.deleteTitle")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("subcityofficialadmin.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("subcityofficialadmin.cancelButton")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("subcityofficialadmin.deleteButton")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default SubcityOfficials;
