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
  Select,
  Badge,
  MultiSelect,
  FileInput,
  Image,
  Text,
  Stack,
  Paper,
  ScrollArea,
  Chip,
  ChipProps,
  Styles,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  getWoredas,
  getWoredaById,
  deleteWoreda,
  addWoreda,
  updateWoreda,
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

interface WoredaItem {
  id: number;
  name: {
    am: string;
    en: string;
  };
  woreda: {
    en: string;
    am: string;
  };
  subCity: {
    en: string;
    am: string;
  };
  location: {
    en: string;
    am: string;
  };
  image: string;
  description: {
    en: string;
    am: string;
  };
  operatingHours: {
    en: string;
    am: string;
  };
  capacity: string;
  amenities: string[];
  rating: number;
  accessType: {
    en: string;
    am: string;
  };
  maintenanceSchedule: {
    en: string;
    am: string;
  };
  contactPerson: {
    en: string;
    am: string;
  };
  contactPhone: string;
  mission: {
    en: string;
    am: string;
  };
  vision: {
    en: string;
    am: string;
  };
  values: string[];
  email: string;
  socialMedia: string[];
  additionalContacts: string[];
  serviceAreas: string[];
  created_at: string;
  updated_at: string;
}

const chipStyles: Styles<ChipProps, Record<string, any>> = (theme) => ({
  label: {
    padding: "8px 12px",
    margin: "4px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],
    borderRadius: theme.radius.sm,
  },
});

const WoredasManagement = () => {
  const { t } = useTranslation();
  const [woredasData, setWoredasData] = useState<WoredaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [arrayInputs, setArrayInputs] = useState<Record<string, string>>({
    amenities: "",
    values: "",
    socialMedia: "",
    additionalContacts: "",
    serviceAreas: "",
  });

  const form = useForm({
    initialValues: {
      name_en: "",
      name_am: "",
      woreda_en: "",
      woreda_am: "",
      subCity_en: "",
      subCity_am: "",
      location_en: "",
      location_am: "",
      image_path: "",
      description_en: "",
      description_am: "",
      operatingHours_en: "",
      operatingHours_am: "",
      capacity: "",
      amenities: [] as string[],
      rating: 0,
      accessType_en: "",
      accessType_am: "",
      maintenanceSchedule_en: "",
      maintenanceSchedule_am: "",
      contactPerson_en: "",
      contactPerson_am: "",
      contactPhone: "",
      mission_en: "",
      mission_am: "",
      vision_en: "",
      vision_am: "",
      values: [] as string[],
      email: "",
      socialMedia: [] as string[],
      additionalContacts: [] as string[],
      serviceAreas: [] as string[],
      imageFile: null as File | null,
    },
    validate: {
      name_en: (value) =>
        value ? null : t("woredamanagementadmin.errors.name_en"),
      name_am: (value) =>
        value ? null : t("woredamanagementadmin.errors.name_am"),
      woreda_en: (value) =>
        value ? null : t("woredamanagementadmin.errors.woreda_en"),
      woreda_am: (value) =>
        value ? null : t("woredamanagementadmin.errors.woreda_am"),
      subCity_en: (value) =>
        value ? null : t("woredamanagementadmin.errors.subCity_en"),
      subCity_am: (value) =>
        value ? null : t("woredamanagementadmin.errors.subCity_am"),
      contactPhone: (value) =>
        /^\+?\d{10,15}$/.test(value)
          ? null
          : t("woredamanagementadmin.errors.invalidPhone"),
      email: (value) =>
        /^\S+@\S+$/.test(value)
          ? null
          : t("woredamanagementadmin.errors.invalidEmail"),
      rating: (value) =>
        value >= 0 && value <= 5
          ? null
          : t("woredamanagementadmin.errors.ratingRange"),
      imageFile: (value, values) =>
        !editingId && !value && !values.image_path
          ? t("woredamanagementadmin.errors.imageRequired")
          : null,
    },
  });

  const handleArrayInputChange = (field: string, value: string) => {
    setArrayInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddArrayItems = (field: keyof typeof arrayInputs) => {
    if (!arrayInputs[field]) return;

    const items = arrayInputs[field]
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length > 0) {
      form.setFieldValue(field, [...form.values[field], ...items]);
      setArrayInputs((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    const newArray = [...form.values[field]];
    newArray.splice(index, 1);
    form.setFieldValue(field, newArray);
  };

  const fetchWoredas = async () => {
    setLoading(true);
    try {
      const response = await getWoredas();
      setWoredasData(response || []);
      showNotification(
        t("woredamanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch woredas:", error);
      showNotification(
        t("woredamanagementadmin.notifications.loadError"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWoredas();
  }, [t]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("woredamanagementadmin.notifications.success")
          : t("woredamanagementadmin.notifications.error"),
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
    setArrayInputs({
      amenities: "",
      values: "",
      socialMedia: "",
      additionalContacts: "",
      serviceAreas: "",
    });
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(t("woredamanagementadmin.errors.invalidId"), "error");
        return;
      }

      let imagePath = values.image_path;

      if (values.imageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(values.imageFile, "woredas");
          imagePath = uploadResponse.file.path;
          showNotification(
            t("woredamanagementadmin.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(
            t("woredamanagementadmin.notifications.uploadError"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !imagePath) {
        showNotification(
          t("woredamanagementadmin.errors.imageRequired"),
          "error"
        );
        return;
      }

      const payload = {
        name: {
          en: values.name_en,
          am: values.name_am,
        },
        woreda: {
          en: values.woreda_en,
          am: values.woreda_am,
        },
        subCity: {
          en: values.subCity_en,
          am: values.subCity_am,
        },
        location: {
          en: values.location_en,
          am: values.location_am,
        },
        image: imagePath,
        description: {
          en: values.description_en,
          am: values.description_am,
        },
        operatingHours: {
          en: values.operatingHours_en,
          am: values.operatingHours_am,
        },
        capacity: values.capacity,
        amenities: values.amenities,
        rating: values.rating,
        accessType: {
          en: values.accessType_en,
          am: values.accessType_am,
        },
        maintenanceSchedule: {
          en: values.maintenanceSchedule_en,
          am: values.maintenanceSchedule_am,
        },
        contactPerson: {
          en: values.contactPerson_en,
          am: values.contactPerson_am,
        },
        contactPhone: values.contactPhone,
        mission: {
          en: values.mission_en,
          am: values.mission_am,
        },
        vision: {
          en: values.vision_en,
          am: values.vision_am,
        },
        values: values.values,
        email: values.email,
        socialMedia: values.socialMedia,
        additionalContacts: values.additionalContacts,
        serviceAreas: values.serviceAreas,
      };

      if (editingId) {
        await updateWoreda(editingId, payload);
        showNotification(
          t("woredamanagementadmin.notifications.updateSuccess"),
          "success"
        );
      } else {
        await addWoreda(payload);
        showNotification(
          t("woredamanagementadmin.notifications.createSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchWoredas();
    } catch (error) {
      console.error("Error saving woreda:", error);
      showNotification(
        t(
          editingId
            ? "woredamanagementadmin.notifications.updateError"
            : "woredamanagementadmin.notifications.createError"
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      showNotification(t("woredamanagementadmin.errors.invalidId"), "error");
      return;
    }

    try {
      setLoading(true);
      const item = await getWoredaById(id);
      if (!item) {
        showNotification(t("woredamanagementadmin.errors.notFound"), "error");
        return;
      }

      form.setValues({
        name_en: item.name?.en || "",
        name_am: item.name?.am || "",
        woreda_en: item.woreda?.en || "",
        woreda_am: item.woreda?.am || "",
        subCity_en: item.subCity?.en || "",
        subCity_am: item.subCity?.am || "",
        location_en: item.location?.en || "",
        location_am: item.location?.am || "",
        image_path: item.image || "",
        description_en: item.description?.en || "",
        description_am: item.description?.am || "",
        operatingHours_en: item.operatingHours?.en || "",
        operatingHours_am: item.operatingHours?.am || "",
        capacity: item.capacity || "",
        amenities: item.amenities || [],
        rating: item.rating || 0,
        accessType_en: item.accessType?.en || "",
        accessType_am: item.accessType?.am || "",
        maintenanceSchedule_en: item.maintenanceSchedule?.en || "",
        maintenanceSchedule_am: item.maintenanceSchedule?.am || "",
        contactPerson_en: item.contactPerson?.en || "",
        contactPerson_am: item.contactPerson?.am || "",
        contactPhone: item.contactPhone || "",
        mission_en: item.mission?.en || "",
        mission_am: item.mission?.am || "",
        vision_en: item.vision?.en || "",
        vision_am: item.vision?.am || "",
        values: item.values || [],
        email: item.email || "",
        socialMedia: item.socialMedia || [],
        additionalContacts: item.additionalContacts || [],
        serviceAreas: item.serviceAreas || [],
        imageFile: null,
      });

      setPreviewImage(item.image || null);
      setEditingId(item.id);
      openModal();
    } catch (error) {
      console.error("Error loading woreda for edit:", error);
      showNotification(t("woredamanagementadmin.errors.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteWoreda(id);
      showNotification(
        t("woredamanagementadmin.notifications.deleteSuccess"),
        "success"
      );
      fetchWoredas();
    } catch (error) {
      console.error("Error deleting woreda:", error);
      showNotification(
        t("woredamanagementadmin.notifications.deleteError"),
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
          t("woredamanagementadmin.errors.invalidImageType"),
          "error"
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification(t("woredamanagementadmin.errors.imageSize"), "error");
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

  const renderArrayField = (
    field: string,
    label: string,
    placeholder: string
  ) => (
    <Box mb="md">
      <Text size="sm" weight={500} mb={4}>
        {label}
      </Text>
      <Textarea
        placeholder={placeholder}
        value={arrayInputs[field]}
        onChange={(e) => handleArrayInputChange(field, e.currentTarget.value)}
        mb="sm"
        minRows={2}
        description={t("woredamanagementadmin.form.arrayFieldDescription")}
      />
      <Button
        onClick={() => handleAddArrayItems(field as keyof typeof arrayInputs)}
        variant="outline"
        size="sm"
        mb="sm"
      >
        {t("woredamanagementadmin.form.addItems")}
      </Button>

      {form.values[field]?.length > 0 && (
        <Paper withBorder p="sm" radius="sm">
          <ScrollArea.Autosize mah={150} type="auto">
            <Chip.Group>
              <Group spacing={4}>
                {form.values[field].map((item, index) => (
                  <Chip
                    key={`${field}-${index}`}
                    styles={chipStyles}
                    checked={false}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Group spacing={4}>
                      {item}
                      <ActionIcon
                        size="xs"
                        color="red"
                        variant="transparent"
                        onClick={() => handleRemoveArrayItem(field, index)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </ScrollArea.Autosize>
        </Paper>
      )}
    </Box>
  );

  const columns: MRT_ColumnDef<WoredaItem>[] = [
    {
      accessorKey: "id",
      header: t("woredamanagementadmin.table.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.name?.am || t("woredamanagementadmin.table.na"),
      header: t("woredamanagementadmin.table.nameAm"),
      id: "name_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.name?.en || t("woredamanagementadmin.table.na"),
      header: t("woredamanagementadmin.table.nameEn"),
      id: "name_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) =>
        row.woreda?.en || t("woredamanagementadmin.table.na"),
      header: t("woredamanagementadmin.table.woreda"),
      id: "woreda",
    },
    {
      accessorFn: (row) =>
        row.subCity?.en || t("woredamanagementadmin.table.na"),
      header: t("woredamanagementadmin.table.subCity"),
      id: "subCity",
    },
    {
      accessorKey: "contactPhone",
      header: t("woredamanagementadmin.table.contactPhone"),
    },
    {
      accessorKey: "rating",
      header: t("woredamanagementadmin.table.rating"),
      Cell: ({ cell }) => (
        <Badge
          color={
            cell.getValue<number>() >= 4
              ? "green"
              : cell.getValue<number>() >= 2.5
              ? "yellow"
              : "red"
          }
        >
          {cell.getValue<number>()}
        </Badge>
      ),
    },
    {
      accessorKey: "image",
      header: t("woredamanagementadmin.table.image"),
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
      accessorKey: "created_at",
      header: t("woredamanagementadmin.table.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("woredamanagementadmin.table.na");
      },
    },
    {
      id: "actions",
      header: t("woredamanagementadmin.table.actions"),
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
        <Title order={2}>{t("woredamanagementadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewImage(null);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("woredamanagementadmin.addButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={woredasData}
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
            ? t("woredamanagementadmin.editTitle")
            : t("woredamanagementadmin.createTitle")
        }
        size="xl"
        overlayProps={{ blur: 3 }}
        scrollAreaComponent={Modal.NativeScrollArea}
      >
        {(loading || fileUploading) && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.nameEn")}
              required
              placeholder={t("woredamanagementadmin.form.nameEnPlaceholder")}
              {...form.getInputProps("name_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.nameAm")}
              required
              placeholder={t("woredamanagementadmin.form.nameAmPlaceholder")}
              {...form.getInputProps("name_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.woredaEn")}
              required
              placeholder={t("woredamanagementadmin.form.woredaEnPlaceholder")}
              {...form.getInputProps("woreda_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.woredaAm")}
              required
              placeholder={t("woredamanagementadmin.form.woredaAmPlaceholder")}
              {...form.getInputProps("woreda_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.subCityEn")}
              required
              placeholder={t("woredamanagementadmin.form.subCityEnPlaceholder")}
              {...form.getInputProps("subCity_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.subCityAm")}
              required
              placeholder={t("woredamanagementadmin.form.subCityAmPlaceholder")}
              {...form.getInputProps("subCity_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.locationEn")}
              placeholder={t(
                "woredamanagementadmin.form.locationEnPlaceholder"
              )}
              {...form.getInputProps("location_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.locationAm")}
              placeholder={t(
                "woredamanagementadmin.form.locationAmPlaceholder"
              )}
              {...form.getInputProps("location_am")}
            />
          </Group>

          <FileInput
            label={t("woredamanagementadmin.form.image")}
            placeholder={t("woredamanagementadmin.form.imagePlaceholder")}
            accept="image/png,image/jpeg,image/webp"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("woredamanagementadmin.form.imageDescription")}
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
                alt={t("woredamanagementadmin.form.preview")}
              />
            </Box>
          )}

          <Group grow mb="md">
            <Textarea
              label={t("woredamanagementadmin.form.descriptionEn")}
              placeholder={t(
                "woredamanagementadmin.form.descriptionEnPlaceholder"
              )}
              minRows={2}
              {...form.getInputProps("description_en")}
            />
            <Textarea
              label={t("woredamanagementadmin.form.descriptionAm")}
              placeholder={t(
                "woredamanagementadmin.form.descriptionAmPlaceholder"
              )}
              minRows={2}
              {...form.getInputProps("description_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.operatingHoursEn")}
              placeholder={t(
                "woredamanagementadmin.form.operatingHoursEnPlaceholder"
              )}
              {...form.getInputProps("operatingHours_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.operatingHoursAm")}
              placeholder={t(
                "woredamanagementadmin.form.operatingHoursAmPlaceholder"
              )}
              {...form.getInputProps("operatingHours_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.capacity")}
              placeholder={t("woredamanagementadmin.form.capacityPlaceholder")}
              {...form.getInputProps("capacity")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.rating")}
              type="number"
              min={0}
              max={5}
              step={0.1}
              placeholder={t("woredamanagementadmin.form.ratingPlaceholder")}
              {...form.getInputProps("rating")}
            />
          </Group>

          {renderArrayField(
            "amenities",
            t("woredamanagementadmin.form.amenities"),
            t("woredamanagementadmin.form.amenitiesPlaceholder")
          )}

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.accessTypeEn")}
              placeholder={t(
                "woredamanagementadmin.form.accessTypeEnPlaceholder"
              )}
              {...form.getInputProps("accessType_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.accessTypeAm")}
              placeholder={t(
                "woredamanagementadmin.form.accessTypeAmPlaceholder"
              )}
              {...form.getInputProps("accessType_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.maintenanceScheduleEn")}
              placeholder={t(
                "woredamanagementadmin.form.maintenanceScheduleEnPlaceholder"
              )}
              {...form.getInputProps("maintenanceSchedule_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.maintenanceScheduleAm")}
              placeholder={t(
                "woredamanagementadmin.form.maintenanceScheduleAmPlaceholder"
              )}
              {...form.getInputProps("maintenanceSchedule_am")}
            />
          </Group>

          <Group grow mb="md">
            <TextInput
              label={t("woredamanagementadmin.form.contactPersonEn")}
              placeholder={t(
                "woredamanagementadmin.form.contactPersonEnPlaceholder"
              )}
              {...form.getInputProps("contactPerson_en")}
            />
            <TextInput
              label={t("woredamanagementadmin.form.contactPersonAm")}
              placeholder={t(
                "woredamanagementadmin.form.contactPersonAmPlaceholder"
              )}
              {...form.getInputProps("contactPerson_am")}
            />
          </Group>

          <TextInput
            label={t("woredamanagementadmin.form.contactPhone")}
            placeholder={t(
              "woredamanagementadmin.form.contactPhonePlaceholder"
            )}
            required
            mb="md"
            {...form.getInputProps("contactPhone")}
          />

          <Group grow mb="md">
            <Textarea
              label={t("woredamanagementadmin.form.missionEn")}
              placeholder={t("woredamanagementadmin.form.missionEnPlaceholder")}
              minRows={2}
              {...form.getInputProps("mission_en")}
            />
            <Textarea
              label={t("woredamanagementadmin.form.missionAm")}
              placeholder={t("woredamanagementadmin.form.missionAmPlaceholder")}
              minRows={2}
              {...form.getInputProps("mission_am")}
            />
          </Group>

          <Group grow mb="md">
            <Textarea
              label={t("woredamanagementadmin.form.visionEn")}
              placeholder={t("woredamanagementadmin.form.visionEnPlaceholder")}
              minRows={2}
              {...form.getInputProps("vision_en")}
            />
            <Textarea
              label={t("woredamanagementadmin.form.visionAm")}
              placeholder={t("woredamanagementadmin.form.visionAmPlaceholder")}
              minRows={2}
              {...form.getInputProps("vision_am")}
            />
          </Group>

          {renderArrayField(
            "values",
            t("woredamanagementadmin.form.values"),
            t("woredamanagementadmin.form.valuesPlaceholder")
          )}

          <TextInput
            label={t("woredamanagementadmin.form.email")}
            placeholder={t("woredamanagementadmin.form.emailPlaceholder")}
            type="email"
            mb="md"
            {...form.getInputProps("email")}
          />

          {renderArrayField(
            "socialMedia",
            t("woredamanagementadmin.form.socialMedia"),
            t("woredamanagementadmin.form.socialMediaPlaceholder")
          )}

          {renderArrayField(
            "additionalContacts",
            t("woredamanagementadmin.form.additionalContacts"),
            t("woredamanagementadmin.form.additionalContactsPlaceholder")
          )}

          {renderArrayField(
            "serviceAreas",
            t("woredamanagementadmin.form.serviceAreas"),
            t("woredamanagementadmin.form.serviceAreasPlaceholder")
          )}

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("woredamanagementadmin.cancelButton")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              disabled={loading || fileUploading}
            >
              {editingId
                ? t("woredamanagementadmin.updateButton")
                : t("woredamanagementadmin.createButton")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("woredamanagementadmin.deleteTitle")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("woredamanagementadmin.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("woredamanagementadmin.cancelButton")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("woredamanagementadmin.deleteButton")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default WoredasManagement;
