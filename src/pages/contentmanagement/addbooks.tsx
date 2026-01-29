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
  Select,
  Badge,
  NumberInput,
  Rating,
  FileInput,
  Image,
  Text,
  Checkbox,
  Collapse,
  Radio,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  createBook,
  getBooks,
  getBookById,
  deleteBook,
  updateBook,
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
  IconFile,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface BookItem {
  id: number;
  title: {
    en: string;
    fr: string;
    am: string;
  };
  author?: string;
  cover_image: string;
  book_source_path: string | null;
  batch_book_paths: string | null;
  description?: string;
  category?: string;
  pages?: number;
  language?: string;
  published_year?: number;
  reading_time?: string;
  popularity?: number;
  isFeatured?: boolean;
  created_at: string;
  updated_at: string;
}

interface BatchBookPaths {
  paths: string[];
  category: string;
}

const AddBooks = () => {
  const { t } = useTranslation();
  const [booksData, setBooksData] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [uploadType, setUploadType] = useState<"single" | "batch">("single");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);

  const mockCategories = [
    { value: "fiction", label: t("addbooksadmin.categories.fiction") },
    { value: "non-fiction", label: t("addbooksadmin.categories.nonFiction") },
    { value: "biography", label: t("addbooksadmin.categories.biography") },
    { value: "science", label: t("addbooksadmin.categories.science") },
    { value: "fantasy", label: t("addbooksadmin.categories.fantasy") },
  ];

  const mockLanguages = [
    { value: "english", label: t("addbooksadmin.languages.english") },
    { value: "amharic", label: t("addbooksadmin.languages.amharic") },
    { value: "french", label: t("addbooksadmin.languages.french") },
    { value: "spanish", label: t("addbooksadmin.languages.spanish") },
  ];

  const form = useForm({
    initialValues: {
      title_en: "",
      title_am: "",
      author_en: "",
      author_am: "",
      coverImagePath: "",
      coverImageFile: null as File | null,
      bookSourcePath: "",
      bookSourceFile: null as File | null,
      batchBookFiles: [] as File[],
      batchCategory: "",
      description_en: "",
      description_am: "",
      category_en: "",
      category_am: "",
      pages: 0,
      language: "",
      publishedYear: new Date().getFullYear(),
      readingTime_en: "",
      readingTime_am: "",
      popularity: 0,
      isFeatured: false,
      includeAdditionalFields: false,
    },
    validate: {
      title_en: (value) =>
        value ? null : t("addbooksadmin.validation.titleEnRequired"),
      title_am: (value) =>
        value ? null : t("addbooksadmin.validation.titleAmRequired"),
      coverImageFile: (value, values) =>
        !editingId && !value && !values.coverImagePath
          ? t("addbooksadmin.validation.coverImageRequired")
          : null,
      bookSourceFile: (value, values) =>
        uploadType === "single" &&
          !editingId &&
          !value &&
          !values.bookSourcePath
          ? t("addbooksadmin.validation.bookSourceRequired")
          : null,
      batchBookFiles: (value, values) =>
        uploadType === "batch" && value.length === 0
          ? t("addbooksadmin.validation.batchBooksRequired")
          : null,
      batchCategory: (value, values) =>
        uploadType === "batch" && !value
          ? t("addbooksadmin.validation.batchCategoryRequired")
          : null,
      pages: (value) =>
        value !== undefined && isNaN(Number(value))
          ? t("addbooksadmin.validation.invalidNumber")
          : null,
      publishedYear: (value) =>
        value !== undefined && isNaN(Number(value))
          ? t("addbooksadmin.validation.invalidNumber")
          : null,
      popularity: (value) =>
        value !== undefined && isNaN(Number(value))
          ? t("addbooksadmin.validation.invalidNumber")
          : null,
    },
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await getBooks();
      setBooksData(response.data || []);
      showNotification(
        t("addbooksadmin.notifications.booksLoadedSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch books:", error);
      showNotification(
        t("addbooksadmin.notifications.failedLoadBooks"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("addbooksadmin.notifications.success")
          : t("addbooksadmin.notifications.error"),
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
    setCoverImagePreview(null);
    setShowAdditionalFields(false);
    setUploadType("single");
    setBatchFiles([]);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      if (editingId && (isNaN(editingId) || editingId <= 0)) {
        showNotification(
          t("addbooksadmin.notifications.invalidBookId"),
          "error"
        );
        return;
      }

      let coverImagePath = values.coverImagePath;
      let bookSourcePath = values.bookSourcePath;
      let batchBookPaths: BatchBookPaths | null = null;

      // Handle cover image upload (required)
      if (values.coverImageFile) {
        setFileUploading(true);
        try {
          const uploadResponse = await uploadFile(
            values.coverImageFile,
            "books/covers"
          );
          coverImagePath = uploadResponse.file.path;
          showNotification(
            t("addbooksadmin.notifications.coverImageUploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("Cover image upload error:", error);
          showNotification(
            t("addbooksadmin.notifications.coverImageUploadError"),
            "error"
          );
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (!editingId && !coverImagePath) {
        showNotification(
          t("addbooksadmin.notifications.uploadCoverImage"),
          "error"
        );
        return;
      }

      // Handle book source upload based on type
      if (uploadType === "single") {
        if (values.bookSourceFile) {
          setFileUploading(true);
          try {
            const uploadResponse = await uploadFile(
              values.bookSourceFile,
              "books/sources"
            );
            bookSourcePath = uploadResponse.file.path;
            showNotification(
              t("addbooksadmin.notifications.bookSourceUploadSuccess"),
              "success"
            );
          } catch (error) {
            console.error("Book source upload error:", error);
            showNotification(
              t("addbooksadmin.notifications.bookSourceUploadError"),
              "error"
            );
            return;
          } finally {
            setFileUploading(false);
          }
        } else if (!editingId && !bookSourcePath) {
          showNotification(
            t("addbooksadmin.notifications.uploadBookSource"),
            "error"
          );
          return;
        }
      } else if (uploadType === "batch") {
        if (values.batchBookFiles.length > 0) {
          setFileUploading(true);
          try {
            const uploadedPaths: string[] = [];
            for (const file of values.batchBookFiles) {
              const uploadResponse = await uploadFile(file, "books/batch");
              uploadedPaths.push(uploadResponse.file.path);
            }
            batchBookPaths = {
              paths: uploadedPaths,
              category: values.batchCategory,
            };
            showNotification(
              t("addbooksadmin.notifications.batchUploadSuccess", {
                count: uploadedPaths.length,
              }),
              "success"
            );
          } catch (error) {
            console.error("Batch upload error:", error);
            showNotification(
              t("addbooksadmin.notifications.batchUploadError"),
              "error"
            );
            return;
          } finally {
            setFileUploading(false);
          }
        }
      }

      const payload: any = {
        title: {
          en: values.title_en,
          am: values.title_am,
        },
        cover_image: coverImagePath,
      };

      // Set the appropriate book path field based on upload type
      if (uploadType === "single") {
        payload.book_source_path = bookSourcePath;
        payload.batch_book_paths = null;
      } else {
        payload.book_source_path = null;
        payload.batch_book_paths = JSON.stringify(batchBookPaths);
      }

      // Add optional fields if they exist
      if (values.author_en || values.author_am) {
        payload.author = values.author_en || values.author_am;
      }
      if (values.description_en || values.description_am) {
        payload.description = values.description_en || values.description_am;
      }
      if (values.category_en || values.category_am) {
        payload.category = values.category_en || values.category_am;
      }
      if (values.pages) {
        payload.pages = Number(values.pages);
      }
      if (values.language) {
        payload.language = values.language;
      }
      if (values.publishedYear) {
        payload.published_year = Number(values.publishedYear);
      }
      if (values.readingTime_en || values.readingTime_am) {
        payload.reading_time = values.readingTime_en || values.readingTime_am;
      }
      if (values.popularity) {
        payload.popularity = Number(values.popularity);
      }
      payload.isFeatured = values.isFeatured;

      if (editingId) {
        await updateBook(editingId, payload);
        showNotification(
          t("addbooksadmin.notifications.bookUpdatedSuccess"),
          "success"
        );
      } else {
        await createBook(payload);
        showNotification(
          t("addbooksadmin.notifications.bookCreatedSuccess"),
          "success"
        );
      }

      resetAndCloseModal();
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
      showNotification(
        t(
          editingId
            ? "addbooksadmin.notifications.updateBookError"
            : "addbooksadmin.notifications.createBookError"
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
      const book = await getBookById(id);
      if (!book) {
        showNotification(
          t("addbooksadmin.notifications.bookNotFound"),
          "error"
        );
        return;
      }

      // Determine upload type based on book data
      const uploadType = book.batch_book_paths ? "batch" : "single";
      setUploadType(uploadType);

      // Parse batch book paths if they exist
      let batchBookPaths: BatchBookPaths | null = null;
      if (book.batch_book_paths) {
        try {
          batchBookPaths = JSON.parse(book.batch_book_paths);
        } catch (e) {
          console.error("Error parsing batch_book_paths:", e);
        }
      }

      const hasAdditionalFields = Boolean(
        book.author ||
        book.description ||
        book.category ||
        book.pages ||
        book.language ||
        book.published_year ||
        book.reading_time ||
        book.popularity ||
        book.isFeatured
      );

      form.setValues({
        title_en: book.title?.en || "",
        title_am: book.title?.am || "",
        author_en: book.author || "",
        author_am: book.author || "",
        coverImagePath: book.cover_image || "",
        coverImageFile: null,
        bookSourcePath: book.book_source_path || "",
        bookSourceFile: null,
        batchBookFiles: [],
        batchCategory: batchBookPaths?.category || "",
        description_en: book.description || "",
        description_am: book.description || "",
        category_en: book.category || "",
        category_am: book.category || "",
        pages: book.pages || 0,
        language: book.language || "",
        publishedYear: book.published_year || new Date().getFullYear(),
        readingTime_en: book.reading_time || "",
        readingTime_am: book.reading_time || "",
        popularity: book.popularity || 0,
        isFeatured: book.isFeatured || false,
        includeAdditionalFields: hasAdditionalFields,
      });

      setShowAdditionalFields(hasAdditionalFields);

      if (book.cover_image) {
        setCoverImagePreview(
          `${import.meta.env.VITE_FILE_API}${book.cover_image}`
        );
      }
      setEditingId(id);
      openModal();
    } catch (error) {
      console.error("Error loading book for edit:", error);
      showNotification(t("addbooksadmin.notifications.loadBookError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deleteBook(id);
      showNotification(
        t("addbooksadmin.notifications.bookDeletedSuccess"),
        "success"
      );
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      showNotification(
        t("addbooksadmin.notifications.deleteBookError"),
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

  const handleCoverImageChange = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification(
          t("addbooksadmin.notifications.fileSizeLimit", { size: "5MB" }),
          "error"
        );
        return;
      }

      form.setFieldValue("coverImageFile", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue("coverImageFile", null);
      setCoverImagePreview(null);
    }
  };

  const handleBookSourceChange = (file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification(
          t("addbooksadmin.notifications.fileSizeLimit", { size: "10MB" }),
          "error"
        );
        return;
      }
      form.setFieldValue("bookSourceFile", file);
    } else {
      form.setFieldValue("bookSourceFile", null);
    }
  };

  const handleBatchFilesChange = (files: File[]) => {
    if (files) {
      // Check each file size
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          showNotification(
            t("addbooksadmin.notifications.fileSizeLimit", { size: "10MB" }),
            "error"
          );
          return;
        }
      }
      form.setFieldValue("batchBookFiles", files);
      setBatchFiles(files);
    } else {
      form.setFieldValue("batchBookFiles", []);
      setBatchFiles([]);
    }
  };

  const columns: MRT_ColumnDef<BookItem>[] = [
    {
      accessorKey: "id",
      header: t("addbooksadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorFn: (row) => row.title?.en || t("table.notAvailable"),
      header: t("addbooksadmin.table.headers.titleEn"),
      id: "title_en",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.title?.am || t("table.notAvailable"),
      header: t("addbooksadmin.table.headers.titleAm"),
      id: "title_am",
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "author",
      header: t("addbooksadmin.table.headers.author"),
      Cell: ({ cell }) => cell.getValue<string>() || t("table.notAvailable"),
    },
    {
      accessorKey: "category",
      header: t("addbooksadmin.table.headers.category"),
      id: "category",
      Cell: ({ cell }) =>
        cell.getValue<string>() ? (
          <Badge color="blue" variant="light">
            {cell.getValue<string>()}
          </Badge>
        ) : (
          t("table.notAvailable")
        ),
    },
    {
      accessorKey: "pages",
      header: t("addbooksadmin.table.headers.pages"),
      Cell: ({ cell }) => cell.getValue<number>() || t("table.notAvailable"),
    },
    {
      accessorKey: "language",
      header: t("addbooksadmin.table.headers.language"),
      Cell: ({ cell }) => cell.getValue<string>() || t("table.notAvailable"),
    },
    {
      accessorKey: "published_year",
      header: t("addbooksadmin.table.headers.publishedYear"),
      Cell: ({ cell }) => cell.getValue<number>() || t("table.notAvailable"),
    },
    {
      accessorKey: "popularity",
      header: t("addbooksadmin.table.headers.rating"),
      Cell: ({ cell }) =>
        cell.getValue<number>() ? (
          <Rating value={cell.getValue<number>()} fractions={2} readOnly />
        ) : (
          t("table.notAvailable")
        ),
    },
    {
      accessorKey: "cover_image",
      header: t("addbooksadmin.table.headers.cover"),
      Cell: ({ cell }) => (
        <Image
          src={`${import.meta.env.VITE_FILE_API}${cell.getValue<string>()}`}
          width={60}
          height={60}
          fit="cover"
          withPlaceholder
          placeholder={<IconPhoto size={24} />}
        />
      ),
    },
    {
      accessorKey: "book_source_path",
      header: t("addbooksadmin.table.headers.bookFile"),
      Cell: ({ cell, row }) => {
        if (row.original.batch_book_paths) {
          try {
            const batchPaths = JSON.parse(
              row.original.batch_book_paths
            ) as BatchBookPaths;
            return (
              <Group spacing="xs">
                <IconFile size={24} />
                <Text size="sm">
                  {t("addbooksadmin.table.batchFiles", {
                    count: batchPaths.paths.length,
                  })}
                </Text>
              </Group>
            );
          } catch (e) {
            return t("table.notAvailable");
          }
        }
        return (
          <Group spacing="xs">
            <IconFile size={24} />
            <Text size="sm">
              {cell.getValue<string>()?.split("/").pop() ||
                t("table.notAvailable")}
            </Text>
          </Group>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t("addbooksadmin.table.headers.createdAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("addbooksadmin.table.notAvailable");
      },
    },
    {
      id: "actions",
      header: t("addbooksadmin.table.headers.actions"),
      Cell: ({ row }) => (
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleEdit(row.original.id)}
          >
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="light"
            onClick={() => openDeleteConfirm(row.original.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Box p="md" pos="relative">
      {loading && <Loader />}
      <Group position="apart" mb="md">
        <Title order={2}>{t("addbooksadmin.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setCoverImagePreview(null);
            setShowAdditionalFields(false);
            setUploadType("single");
            setBatchFiles([]);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("addbooksadmin.addBookButton")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={booksData}
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
        title={t(
          editingId
            ? "addbooksadmin.editModal.titleEdit"
            : "addbooksadmin.editModal.titleCreate"
        )}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {(loading || fileUploading) && <Loader />}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Radio.Group
            label={t("addbooksadmin.form.uploadType")}
            value={uploadType}
            onChange={(value) => {
              setUploadType(value as "single" | "batch");
              form.setFieldValue("bookSourceFile", null);
              form.setFieldValue("batchBookFiles", []);
              setBatchFiles([]);
            }}
            mb="md"
            required
          >
            <Group mt="xs">
              <Radio
                value="single"
                label={t("addbooksadmin.form.singleBook")}
              />
              <Radio value="batch" label={t("addbooksadmin.form.batchBooks")} />
            </Group>
          </Radio.Group>

          <Group grow mb="md">
            <TextInput
              label={t("addbooksadmin.form.titleEn")}
              required
              placeholder={t("addbooksadmin.form.titleEnPlaceholder")}
              {...form.getInputProps("title_en")}
            />
            <TextInput
              label={t("addbooksadmin.form.titleAm")}
              required
              placeholder={t("addbooksadmin.form.titleAmPlaceholder")}
              {...form.getInputProps("title_am")}
            />
          </Group>

          <FileInput
            label={t("addbooksadmin.form.coverImage")}
            placeholder={t("addbooksadmin.form.upload")}
            accept="image/*"
            icon={<IconUpload size={14} />}
            mb="md"
            onChange={handleCoverImageChange}
            clearable
            description={t("addbooksadmin.form.coverImageDescription")}
            required={!editingId}
          />

          {(coverImagePreview || form.values.coverImagePath) && (
            <Box mb="md">
              <Image
                src={
                  coverImagePreview ||
                  `${import.meta.env.VITE_FILE_API}${form.values.coverImagePath}`
                }
                height={160}
                fit="contain"
                withPlaceholder
                alt={t("form.coverImageAlt")}
              />
            </Box>
          )}

          {uploadType === "single" ? (
            <>
              <FileInput
                label={t("addbooksadmin.form.bookSource")}
                placeholder={t("form.upload")}
                accept=".pdf,.epub,.doc,.docx,.txt"
                icon={<IconUpload size={14} />}
                mb="md"
                onChange={handleBookSourceChange}
                clearable
                description={t("addbooksadmin.form.bookSourceDescription")}
                required={!editingId}
                leftSection={<IconFile size={14} />}
              />

              {form.values.bookSourcePath && !form.values.bookSourceFile && (
                <Box mb="md" p="sm" style={{ border: "1px dashed #ddd" }}>
                  <Group spacing="xs">
                    <IconFile size={24} />
                    <Text size="sm">
                      {t("form.currentFile")}:{" "}
                      {form.values.bookSourcePath.split("/").pop()}
                    </Text>
                  </Group>
                </Box>
              )}
            </>
          ) : (
            <>
              <MultiSelect
                label={t("addbooksadmin.form.batchCategory")}
                placeholder={t("addbooksadmin.form.selectCategory")}
                data={mockCategories}
                {...form.getInputProps("batchCategory")}
                required
                mb="md"
              />
              <FileInput
                label={t("addbooksadmin.form.batchBooks")}
                placeholder={t("form.upload")}
                accept=".pdf,.epub,.doc,.docx,.txt"
                icon={<IconUpload size={14} />}
                multiple
                value={batchFiles}
                onChange={handleBatchFilesChange}
                clearable
                description={t("addbooksadmin.form.batchBooksDescription")}
                required={!editingId}
                leftSection={<IconFile size={14} />}
                mb="md"
              />
              {batchFiles.length > 0 && (
                <Box mb="md" p="sm" style={{ border: "1px dashed #ddd" }}>
                  <Text size="sm" mb="xs">
                    {t("addbooksadmin.form.selectedFiles")}:
                  </Text>
                  {batchFiles.map((file, index) => (
                    <Text key={index} size="sm">
                      • {file.name}
                    </Text>
                  ))}
                </Box>
              )}
            </>
          )}

          <Checkbox
            label={t("addbooksadmin.form.includeAdditionalFields")}
            checked={form.values.includeAdditionalFields}
            onChange={(event) => {
              form.setFieldValue(
                "includeAdditionalFields",
                event.currentTarget.checked
              );
              setShowAdditionalFields(event.currentTarget.checked);
            }}
            mb="md"
          />

          <Collapse in={showAdditionalFields}>
            <Group grow mb="md">
              <TextInput
                label={t("addbooksadmin.form.authorEn")}
                placeholder={t("addbooksadmin.form.authorEnPlaceholder")}
                {...form.getInputProps("author_en")}
              />
              <TextInput
                label={t("addbooksadmin.form.authorAm")}
                placeholder={t("addbooksadmin.form.authorAmPlaceholder")}
                {...form.getInputProps("author_am")}
              />
            </Group>

            <Textarea
              label={t("addbooksadmin.form.descriptionEn")}
              placeholder={t("addbooksadmin.form.descriptionEnPlaceholder")}
              minRows={3}
              {...form.getInputProps("description_en")}
              mb="md"
            />
            <Textarea
              label={t("addbooksadmin.form.descriptionAm")}
              placeholder={t("addbooksadmin.form.descriptionAmPlaceholder")}
              minRows={3}
              {...form.getInputProps("description_am")}
              mb="md"
            />

            <Group grow mb="md">
              <Select
                label={t("addbooksadmin.form.categoryEn")}
                placeholder={t("addbooksadmin.form.selectCategory")}
                data={mockCategories}
                {...form.getInputProps("category_en")}
              />
              <Select
                label={t("addbooksadmin.form.categoryAm")}
                placeholder={t("addbooksadmin.form.selectCategory")}
                data={mockCategories}
                {...form.getInputProps("category_am")}
              />
            </Group>

            <Group grow mb="md">
              <NumberInput
                label={t("addbooksadmin.form.pages")}
                min={1}
                {...form.getInputProps("pages")}
                value={Number(form.values.pages)}
                onChange={(value) => form.setFieldValue("pages", Number(value))}
              />
              <Select
                label={t("addbooksadmin.form.language")}
                placeholder={t("addbooksadmin.form.selectLanguage")}
                data={mockLanguages}
                {...form.getInputProps("language")}
              />
              <NumberInput
                label={t("addbooksadmin.form.publishedYear")}
                min={1}
                max={new Date().getFullYear()}
                {...form.getInputProps("publishedYear")}
                value={Number(form.values.publishedYear)}
                onChange={(value) =>
                  form.setFieldValue("publishedYear", Number(value))
                }
              />
            </Group>

            <Group grow mb="md">
              <TextInput
                label={t("addbooksadmin.form.readingTimeEn")}
                placeholder={t("addbooksadmin.form.readingTimePlaceholder")}
                {...form.getInputProps("readingTime_en")}
              />
              <TextInput
                label={t("addbooksadmin.form.readingTimeAm")}
                placeholder={t("addbooksadmin.form.readingTimePlaceholder")}
                {...form.getInputProps("readingTime_am")}
              />
              <Box>
                <Text size="sm" weight={500} mb={4}>
                  {t("addbooksadmin.form.popularityRating")}
                </Text>
                <Rating
                  value={Number(form.values.popularity)}
                  onChange={(value) =>
                    form.setFieldValue("popularity", Number(value))
                  }
                  fractions={2}
                  size="lg"
                />
              </Box>
            </Group>

            <Switch
              label={t("addbooksadmin.form.featuredBook")}
              checked={form.values.isFeatured}
              onChange={(e) =>
                form.setFieldValue("isFeatured", e.currentTarget.checked)
              }
              mb="md"
            />
          </Collapse>

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("addbooksadmin.form.cancelButton")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("addbooksadmin.form.updateButton")
                : t("addbooksadmin.form.createButton")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("addbooksadmin.deleteModal.title")}
        centered
      >
        {deleteLoading && <Loader />}
        <Box>
          <Text size="sm" mb="md">
            {t("addbooksadmin.deleteModal.confirmMessage")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("addbooksadmin.deleteModal.cancelButton")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("addbooksadmin.deleteModal.deleteButton")}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
};

export default AddBooks;