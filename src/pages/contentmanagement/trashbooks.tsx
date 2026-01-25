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
  Image,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { IconInfoCircle, IconPhoto, IconFile } from "@tabler/icons-react";
import { getTrashedBooks } from "../../services/api/main";

interface BookItem {
  id: number;
  title: {
    en: string;
    fr: string;
    am: string;
  };
  author?: {
    en?: string;
    fr?: string;
    am?: string;
  };
  coverImage: string;
  book_source_path: string | null;
  batchBookPaths: string | null;
  description?: {
    en?: string;
    fr?: string;
    am?: string;
  };
  category?: {
    en?: string;
    fr?: string;
    am?: string;
  };
  pages?: number;
  language?: string;
  publishedYear?: number;
  readingTime?: {
    en?: string;
    fr?: string;
    am?: string;
  };
  popularity?: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BatchBookPaths {
  paths: string[];
  category: string;
}

const TrashBooks = () => {
  const { t } = useTranslation();
  const [trashedBooks, setTrashedBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const fetchTrashedBooks = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        sort_by: sorting[0]?.id,
        sort_order: sorting[0]?.desc ? "desc" : "asc",
      };
      const response = await getTrashedBooks(params);
      setTrashedBooks(response?.data || []);
      setRowCount(response?.data ? response.data.length : 0);
      showNotification(
        t("addbooksadmin.notifications.booksLoadedSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch trashed books:", error);
      showNotification(
        t("addbooksadmin.notifications.failedLoadBooks"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedBooks();
    // eslint-disable-next-line
  }, [pagination, sorting]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("addbooksadmin.notifications.success")
          : t("addbooksadmin.notifications.error"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const openDetailsModal = (book: BookItem) => {
    setSelectedBook(book);
    setDetailsModalOpen(true);
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
      accessorFn: (row) => row.author?.en || t("table.notAvailable"),
      header: t("addbooksadmin.table.headers.author"),
      id: "author",
    },
    {
      accessorFn: (row) => row.category?.en || t("table.notAvailable"),
      header: t("addbooksadmin.table.headers.category"),
      id: "category",
      Cell: ({ cell }) => (
        <Badge color="blue" variant="light">
          {cell.getValue<string>()}
        </Badge>
      ),
    },
    {
      accessorKey: "pages",
      header: t("addbooksadmin.table.headers.pages"),
      Cell: ({ cell }) => cell.getValue<number>() || t("table.notAvailable"),
    },
    {
      accessorKey: "popularity",
      header: t("addbooksadmin.table.headers.rating"),
      Cell: ({ cell }) => cell.getValue<number>() || t("table.notAvailable"),
    },
    {
      accessorKey: "isFeatured",
      header: t("addbooksadmin.table.headers.featured"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>()
            ? t("addbooksadmin.table.featured")
            : t("addbooksadmin.table.regular")}
        </Badge>
      ),
    },
    {
      accessorKey: "coverImage",
      header: t("addbooksadmin.table.headers.cover"),
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
      accessorKey: "book_source_path",
      header: t("addbooksadmin.table.headers.bookFile"),
      Cell: ({ cell, row }) => {
        if (row.original.batchBookPaths) {
          try {
            const batchPaths = JSON.parse(
              row.original.batchBookPaths
            ) as BatchBookPaths;
            return (
              <Group spacing="xs">
                <IconFile size={24} />
                <Text size="sm">{batchPaths.paths.length} files</Text>
              </Group>
            );
          } catch {
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
      accessorKey: "createdAt",
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
            {t("addbooksadmin.trashTitle") || "Trashed Books"}
          </Text>
        </Group>
        <Divider my="md" />
      </Box>
      <Box>
        <MantineReactTable
          columns={columns}
          data={trashedBooks}
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
        title={t("addbooksadmin.trashDetailsTitle") || "Book Details"}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {selectedBook && (
          <Box>
            <Text weight={600} mb="sm">
              {selectedBook.title.en}
            </Text>
            <Text mb="sm">{selectedBook.description?.en}</Text>
            <Group spacing="xs" mb="sm">
              <Badge color="blue">
                {selectedBook.category?.en || t("table.notAvailable")}
              </Badge>
              <Text color="dimmed" size="sm">
                {selectedBook.author?.en || t("table.notAvailable")}
              </Text>
            </Group>
            <Text color="dimmed" size="sm" mb="xs">
              {t("addbooksadmin.table.headers.pages")}:{" "}
              {selectedBook.pages || t("table.notAvailable")}
            </Text>
            <Text color="dimmed" size="sm" mb="xs">
              {t("addbooksadmin.table.headers.rating")}:{" "}
              {selectedBook.popularity || t("table.notAvailable")}
            </Text>
            <Text color="dimmed" size="sm">
              {t("addbooksadmin.table.headers.createdAt")}:{" "}
              {selectedBook.createdAt
                ? new Date(selectedBook.createdAt).toLocaleString()
                : t("table.notAvailable")}
            </Text>
            <Box mt="md">
              <Image
                src={`https://bole.prosperity.boleprosperityparty.org/CMSFiles/${selectedBook.coverImage}`}
                width={120}
                height={120}
                fit="contain"
                withPlaceholder
                alt={selectedBook.title.en}
              />
            </Box>
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default TrashBooks;
