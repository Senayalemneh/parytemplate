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
import { IconInfoCircle, IconPhoto } from "@tabler/icons-react";
import { getTrashedNews } from "../../services/api/main";

interface NewsItem {
  id: number;
  title_am: string;
  title_en: string;
  slug: string;
  excerpt: string;
  content: string | { am: string; en: string };
  category_id: number;
  author_id: number;
  woreda_id: number | null;
  subcity_id: number | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  image_path: string;
  multiple_image_path: string[] | null;
  view_count: number;
  category: {
    id: number;
    name: string | { am: string; en: string };
    slug: string;
    created_at: string;
    updated_at: string;
  };
  author: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role_id: number;
    woreda_id: number;
    subcity_id: number;
    created_at: string;
    updated_at: string;
    active_status: number;
    avatar: string;
    dark_mode: number;
    messenger_color: string | null;
  };
}

const CMS_FILES_BASE_URL =
  "https://bole.prosperity.boleprosperityparty.org/CMSFiles/";
const formatImageUrl = (imgPath: string): string => {
  if (!imgPath) return "";
  if (imgPath.startsWith("http")) return imgPath;
  return `${CMS_FILES_BASE_URL}${imgPath.replace(/^\/+/, "")}`;
};
const parseMultipleImages = (images: string | string[] | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const TrashNews = () => {
  const { t } = useTranslation();
  const [trashedNews, setTrashedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const fetchTrashedNews = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        sort_by: sorting[0]?.id,
        sort_order: sorting[0]?.desc ? "desc" : "asc",
      };
      const response = await getTrashedNews(params);
      setTrashedNews(response?.data?.data || []);
      setRowCount(response?.data?.total || 0);
      showNotification(
        t("newsmanagementadmin.notifications.loadSuccess"),
        "success"
      );
    } catch (error) {
      console.error("Failed to fetch trashed news:", error);
      showNotification(
        t("newsmanagementadmin.notifications.loadFailed"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedNews();
    // eslint-disable-next-line
  }, [pagination, sorting]);

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("newsmanagementadmin.notifications.successTitle")
          : t("newsmanagementadmin.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  const openDetailsModal = (news: NewsItem) => {
    setSelectedNews(news);
    setDetailsModalOpen(true);
  };

  const columns: MRT_ColumnDef<NewsItem>[] = [
    {
      accessorKey: "id",
      header: t("newsmanagementadmin.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "title_am",
      header: t("newsmanagementadmin.table.headers.titleAm"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "title_en",
      header: t("newsmanagementadmin.table.headers.titleEn"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "excerpt",
      header: t("newsmanagementadmin.table.headers.excerpt"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 200 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorFn: (row) => {
        if (!row.category) return t("newsmanagementadmin.table.notAvailable");
        if (typeof row.category.name === "string") {
          try {
            const name = JSON.parse(row.category.name);
            return name?.en || t("newsmanagementadmin.table.notAvailable");
          } catch {
            return row.category.name;
          }
        }
        return (
          row.category.name?.en || t("newsmanagementadmin.table.notAvailable")
        );
      },
      header: t("newsmanagementadmin.table.headers.category"),
      id: "category",
    },
    {
      accessorFn: (row) =>
        row.author?.name || t("newsmanagementadmin.table.notAvailable"),
      header: t("newsmanagementadmin.table.headers.author"),
      id: "author",
    },
    {
      accessorKey: "is_published",
      header: t("newsmanagementadmin.table.headers.status"),
      Cell: ({ cell }) => (
        <Badge
          color={cell.getValue<boolean>() ? "green" : "orange"}
          variant="filled"
        >
          {cell.getValue<boolean>()
            ? t("newsmanagementadmin.status.published")
            : t("newsmanagementadmin.status.draft")}
        </Badge>
      ),
    },
    {
      accessorKey: "image_path",
      header: t("newsmanagementadmin.table.headers.image"),
      Cell: ({ cell }) => {
        const imageUrl = cell.getValue<string>();
        return imageUrl ? (
          <Image
            src={formatImageUrl(imageUrl)}
            width={60}
            height={40}
            fit="cover"
            withPlaceholder
            placeholder={<IconPhoto size={24} />}
          />
        ) : (
          <Box
            style={{
              width: 60,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPhoto size={24} />
          </Box>
        );
      },
    },
    {
      accessorKey: "multiple_image_path",
      header: t("newsmanagementadmin.table.headers.multipleImages"),
      Cell: ({ cell }) => {
        const images = cell.getValue<string[] | null>();
        const parsedImages = parseMultipleImages(images);
        if (parsedImages.length === 0) {
          return (
            <Box
              style={{
                width: 60,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPhoto size={24} />
            </Box>
          );
        }
        return (
          <Group spacing="xs">
            {parsedImages.slice(0, 3).map((img, index) => (
              <Image
                key={index}
                src={formatImageUrl(img)}
                width={60}
                height={40}
                fit="cover"
                withPlaceholder
                placeholder={<IconPhoto size={24} />}
              />
            ))}
            {parsedImages.length > 3 && (
              <Badge>+{parsedImages.length - 3}</Badge>
            )}
          </Group>
        );
      },
    },
    {
      accessorKey: "view_count",
      header: t("newsmanagementadmin.table.headers.views"),
    },
    {
      accessorKey: "published_at",
      header: t("newsmanagementadmin.table.headers.publishedAt"),
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value
          ? new Date(value).toLocaleString()
          : t("newsmanagementadmin.table.notAvailable");
      },
    },
    {
      id: "actions",
      header: t("newsmanagementadmin.table.headers.actions"),
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
            {t("newsmanagementadmin.trashTitle") || "Trashed News"}
          </Text>
        </Group>
        <Divider my="md" />
      </Box>
      <Box>
        <MantineReactTable
          columns={columns}
          data={trashedNews}
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
        title={t("newsmanagementadmin.trashDetailsTitle") || "News Details"}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {selectedNews && (
          <Box>
            <Text weight={600} mb="sm">
              {selectedNews.title_am}
            </Text>
            <Text mb="sm">{selectedNews.excerpt}</Text>
            <Group spacing="xs" mb="sm">
              <Badge color="blue">
                {typeof selectedNews.category?.name === "object"
                  ? selectedNews.category.name.en
                  : selectedNews.category?.name ||
                    t("newsmanagementadmin.table.notAvailable")}
              </Badge>
              <Text color="dimmed" size="sm">
                {selectedNews.author?.name ||
                  t("newsmanagementadmin.table.notAvailable")}
              </Text>
            </Group>
            <Text color="dimmed" size="sm" mb="xs">
              {t("newsmanagementadmin.table.headers.views")}:{" "}
              {selectedNews.view_count}
            </Text>
            <Text color="dimmed" size="sm" mb="xs">
              {t("newsmanagementadmin.table.headers.publishedAt")}:{" "}
              {selectedNews.published_at
                ? new Date(selectedNews.published_at).toLocaleString()
                : t("newsmanagementadmin.table.notAvailable")}
            </Text>
            <Box mt="md">
              <Image
                src={formatImageUrl(selectedNews.image_path)}
                width={120}
                height={80}
                fit="contain"
                withPlaceholder
                alt={selectedNews.title_am}
              />
            </Box>
            {selectedNews.multiple_image_path &&
              parseMultipleImages(selectedNews.multiple_image_path).length >
                0 && (
                <Group spacing="xs" mt="md">
                  {parseMultipleImages(selectedNews.multiple_image_path).map(
                    (img, idx) => (
                      <Image
                        key={idx}
                        src={formatImageUrl(img)}
                        width={60}
                        height={40}
                        fit="cover"
                        withPlaceholder
                        alt={selectedNews.title_am}
                      />
                    )
                  )}
                </Group>
              )}
          </Box>
        )}
      </Modal>
    </Container>
  );
};

export default TrashNews;
