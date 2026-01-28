import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  Modal,
  Button,
  Group,
  Badge,
  ThemeIcon,
  Tabs,
  Paper,
  TextInput,
  Pagination,
  ActionIcon,
  Center,
  Select,
  Anchor,
  Stack,
  useMantineTheme,
  createStyles,
  rem,
  Image,
  SimpleGrid,
} from "@mantine/core";
import {
  IconBook,
  IconCalendarEvent,
  IconClock,
  IconSearch,
  IconFilter,
  IconDownload,
  IconUser,
  IconFileTypePdf,
  IconX,
  IconEye,
  IconBooks,
} from "@tabler/icons-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

interface Book {
  id: number;
  title?: {
    en?: string;
    am?: string;
  };
  author?: {
    en?: string;
    am?: string;
  };
  cover_image?: string;
  book_source_path?: string;
  batchBookPaths?: string[]; // Array of file paths for batch books
  batchBookNames?: string[]; // Array of original filenames for batch books
  description?: {
    en?: string;
    am?: string;
  };
  category?: {
    en?: string;
    am?: string;
  };
  pages?: number;
  language?: string;
  publishedYear?: number;
  readingTime?: {
    en?: string;
    am?: string;
  };
  popularity?: number;
  created_at?: string;
  updated_at?: string;
}

const BASE_URL = `${import.meta.env.VITE_FILE_API}`;

const useStyles = createStyles((theme) => ({
  hero: {
    backgroundColor: theme.colors.blue[8],
    padding: `${theme.spacing.xl} 0`,
  },
  bookCard: {
    transition: "transform 150ms ease, box-shadow 150ms ease",
    "&:hover": {
      transform: "scale(1.01)",
      boxShadow: theme.shadows.md,
    },
  },
  pdfContainer: {
    height: "70vh",
    width: "100%",
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    borderRadius: theme.radius.md,
  },
  modalHeader: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    marginBottom: theme.spacing.md,
  },
  coverImageContainer: {
    height: rem(250),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],
    overflow: "hidden",
    borderRadius: theme.radius.md,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  batchBooksModal: {
    maxWidth: "90vw",
    width: "100%",
  },
  batchBookCard: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
    },
  },
  batchBookCover: {
    height: rem(120),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],
    borderRadius: theme.radius.md,
  },
  filenameText: {
    wordBreak: "break-word",
    textAlign: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],
    color: theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[6],
  },
}));

// Helper function to format image URLs
const formatImageUrl = (imgPath: string | undefined): string => {
  if (!imgPath) return "";
  
  // If it's already a full URL, return as is
  if (imgPath.startsWith("http")) return imgPath;
  
  // Remove any leading slashes from the path
  const cleanPath = imgPath.replace(/^\/+/, "");
  
  // Ensure base URL doesn't have trailing slash
  const baseUrl = BASE_URL.replace(/\/+$/, "");
  
  return `${baseUrl}/${cleanPath}`;
};

// Helper function to format file URLs (PDFs)
const formatFileUrl = (filePath: string | undefined): string => {
  if (!filePath) return "";
  
  if (filePath.startsWith("http")) return filePath;
  
  const cleanPath = filePath.replace(/^\/+/, "");
  const baseUrl = BASE_URL.replace(/\/+$/, "");
  
  return `${baseUrl}/${cleanPath}`;
};

const BooksPage = () => {
  const { t, i18n } = useTranslation();
  const { classes } = useStyles();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [batchBooksOpened, { open: openBatchBooks, close: closeBatchBooks }] =
    useDisclosure(false);
  const [readOpened, { open: openRead, close: closeRead }] =
    useDisclosure(false);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const itemsPerPage = 12;
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchBooks();
  }, []);

  const safeGetField = (
    field: any,
    lang: "en" | "am",
    defaultValue: string = "N/A"
  ) => {
    if (!field) return defaultValue;
    if (typeof field === "string") return field;
    return field[lang] || defaultValue;
  };

  const parseMultilingualField = (field: any) => {
    if (!field) return { en: "N/A", am: "N/A" };
    if (typeof field === "object") return field;
    try {
      const cleanedField = String(field)
        .replace(/^"|"$/g, "")
        .replace(/\\"/g, '"');
      return JSON.parse(cleanedField);
    } catch (e) {
      return { en: String(field), am: String(field) };
    }
  };

  const parseBatchBooksPath = (path: any): { paths: string[], names: string[] } => {
    if (!path) return { paths: [], names: [] };

    // If already an array, return it with empty names
    if (Array.isArray(path)) return { paths: path, names: path.map(p => p.split('/').pop() || p) };

    try {
      // First parse: decode outer JSON string
      let parsed = JSON.parse(path);

      // If still a string after first parse, parse again
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      // Extract paths and generate names from paths
      const paths = parsed.paths || [];
      const names = paths.map((p: string) => {
        // Remove any numeric prefixes and underscores (like "1749241106_")
        const cleaned = p.replace(/^\d+_/, '');
        // Remove any URL encoding or special characters
        return decodeURIComponent(cleaned).split('/').pop() || cleaned;
      });

      return { paths, names };
    } catch (e) {
      console.error("Failed to parse batchBookPaths:", e);
      return { paths: [], names: [] };
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
      `${BASE_URL}/api/books`
      );
    
      const data = await response.json();

      const parsedBooks = data.data.map((book: any) => {
        const { paths, names } = parseBatchBooksPath(book.batch_book_paths);
        return {
          ...book,
          title: parseMultilingualField(book.title),
          author: parseMultilingualField(book.author),
          description: parseMultilingualField(book.description),
          category: parseMultilingualField(book.category),
          readingTime: parseMultilingualField(book.reading_time),
          batchBookPaths: paths,
          batchBookNames: names,
        };
      });

      const sortedBooks = [...parsedBooks].sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
      setBooks(sortedBooks);

      const categorySet = new Set<string>();
      sortedBooks.forEach((book: Book) => {
        const category = safeGetField(
          book.category,
          i18n.language === "am" ? "am" : "en"
        );
        if (category && category !== "N/A") {
          categorySet.add(category);
        }
      });

      const uniqueCategories = Array.from(categorySet).map(
        (category, index) => ({
          value: `${String(category)
            .toLowerCase()
            .replace(/\s+/g, "-")}-${index}`,
          label: String(category),
        })
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      notifications.show({
        title: t("bookpage.notifications.errorTitle") || "Error",
        message: t("bookpage.notifications.fetchError") || "Failed to load books",
        color: "red",
        withBorder: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("bookpage.notifications.successTitle")
          : t("bookpage.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      withBorder: true,
    });
  };

  useEffect(() => {
    const filtered = books.filter((book) => {
      const baseCategory = activeTab.split("-")[0];
      const currentLang = i18n.language === "am" ? "am" : "en";

      if (activeTab !== "all") {
        const bookCategory = safeGetField(
          book.category,
          currentLang,
          ""
        ).toLowerCase();
        if (!bookCategory.includes(baseCategory)) {
          return false;
        }
      }

      if (searchQuery) {
        const title = safeGetField(book.title, currentLang, "").toLowerCase();
        const author = safeGetField(book.author, currentLang, "").toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        if (!title.includes(searchLower) && !author.includes(searchLower)) {
          return false;
        }
      }

      if (selectedCategory) {
        const bookCategory = safeGetField(
          book.category,
          currentLang,
          ""
        ).toLowerCase();
        if (!bookCategory.includes(selectedCategory.split("-")[0])) {
          return false;
        }
      }

      return true;
    });

    setFilteredBooks(filtered);
    setActivePage(1);
  }, [books, searchQuery, activeTab, selectedCategory, i18n.language]);

  // Calculate paginated books
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const getBookCoverImage = (book: Book) => {
    if (!book.cover_image) return null;
    
    const imageUrl = formatImageUrl(book.cover_image);
    console.log("Book cover image URL:", imageUrl); // Debug log
    return imageUrl;
  };

  const getBookFileUrl = (path?: string) => {
    if (!path) return null;
    return formatFileUrl(path);
  };

  const getFileIcon = (filename?: string) => {
    if (!filename) return <IconBook size={24} />;
    if (filename.endsWith(".pdf"))
      return <IconFileTypePdf size={24} color="red" />;
    return <IconBook size={24} />;
  };

  const openBookDetails = (book: Book) => {
    setSelectedBook(book);
    open();
  };

  const handleBatchBookClick = (book: Book) => {
    setSelectedBook(book);
    if (book.batchBookPaths && book.batchBookPaths.length > 0) {
      openBatchBooks();
    } else if (book.book_source_path) {
      window.open(getBookFileUrl(book.book_source_path), "_blank");
    }
  };

  const handleReadBatchBook = (bookPath: string) => {
    window.open(getBookFileUrl(bookPath), "_blank");
  };

  if (loading && books.length === 0) {
    return (
      <Container size={1400} className="py-16">
        <Center className="h-[60vh]">
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 py-20">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Badge
              size="xl"
              radius="sm"
              variant="light"
              className="mb-6 bg-white/10 backdrop-blur-sm border-white/20"
            >
              <Group spacing="xs">
                <IconBook size={18} />
                <span>{t("bookpage.hero.badge") || "Library"}</span>
              </Group>
            </Badge>
            <Title
              order={1}
              className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white"
              data-aos-delay="100"
            >
              {t("bookpage.hero.title") || "Digital Library"}
            </Title>
            <Text
              size="xl"
              className="max-w-3xl mx-auto opacity-90 text-blue-100"
              data-aos-delay="200"
            >
              {t("bookpage.hero.subtitle") || "Explore our collection of books and resources"}
            </Text>
          </div>
        </Container>
      </div>

      {/* Books Section */}
      <Container size={1400} className="py-16">
        {/* Search and Filter */}
        <Paper
          withBorder
          p="lg"
          radius="lg"
          shadow="sm"
          className="mb-12 bg-white"
        >
          <Tabs
            value={activeTab}
            onTabChange={(value) => setActiveTab(value as string)}
            className="mb-6"
          >
            <Tabs.List grow>
              <Tabs.Tab
                value="all"
                icon={<IconBook size={16} />}
                className="text-md font-medium"
              >
                {t("bookpage.tabs.all") || "All Books"}
              </Tabs.Tab>
              {categories.map((category) => (
                <Tabs.Tab
                  key={category.value}
                  value={category.value}
                  className="text-md font-medium"
                >
                  {category.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <Grid gutter="xl" align="center">
            <Grid.Col span={12} md={8}>
              <TextInput
                icon={<IconSearch size={18} />}
                placeholder={t("bookpage.search.placeholder") || "Search books by title or author..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                size="md"
                radius="md"
                className="shadow-sm"
              />
            </Grid.Col>
            <Grid.Col span={12} md={4}>
              <Select
                icon={<IconFilter size={18} />}
                placeholder={t("bookpage.filter.placeholder") || "Filter by category"}
                data={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                clearable
                size="md"
                radius="md"
                className="shadow-sm"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Books Grid */}
        {paginatedBooks.length > 0 ? (
          <>
            <Grid gutter="xl">
              {paginatedBooks.map((book, index) => {
                const currentLang = i18n.language === "am" ? "am" : "en";
                const title = safeGetField(book.title, currentLang);
                const author = safeGetField(book.author, currentLang);
                const category = safeGetField(book.category, currentLang);
                const readingTime = safeGetField(book.readingTime, currentLang);
                const description = safeGetField(book.description, currentLang);
                const coverImageUrl = getBookCoverImage(book);
                
                return (
                  <Grid.Col key={book.id} span={12} md={6} lg={4}>
                    <Card
                      shadow="sm"
                      padding="lg"
                      className={`${classes.bookCard} h-full bg-white rounded-lg flex flex-col border border-gray-200`}
                      data-aos="fade-up"
                      data-aos-delay={(index % 3) * 100}
                    >
                      {/* Cover Image Section */}
                      <Card.Section className={classes.coverImageContainer}>
                        {coverImageUrl ? (
                          <Image
                            src={coverImageUrl}
                            alt={`Cover of ${title}`}
                            className={classes.coverImage}
                            withPlaceholder
                            placeholder={
                              <div className={classes.imagePlaceholder}>
                                <IconBook size={48} />
                              </div>
                            }
                            onError={(e) => {
                              console.error("Failed to load cover image:", coverImageUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show placeholder if image fails to load
                              const placeholder = target.parentElement?.querySelector('.cover-fallback') as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : (
                          <div className={classes.imagePlaceholder}>
                            <IconBook size={48} />
                          </div>
                        )}
                        {/* Fallback placeholder (hidden by default) */}
                        <div className={`${classes.imagePlaceholder} cover-fallback`} style={{ display: 'none' }}>
                          <IconBook size={48} />
                        </div>
                      </Card.Section>

                      <div className="mt-4 flex-grow">
                        <Title
                          order={3}
                          className="text-xl font-bold text-gray-900 mb-2 line-clamp-2"
                          title={title}
                        >
                          {title}
                        </Title>
                        
                        {author && author !== "N/A" && (
                          <Text size="sm" color="dimmed" className="mb-3">
                            <IconUser size={14} className="inline mr-1" />
                            {author}
                          </Text>
                        )}
                        
                        <Stack spacing="xs" className="mb-4">
                          {category && category !== "N/A" && (
                            <Badge color="blue" variant="light" size="sm">
                              {category}
                            </Badge>
                          )}
                          {book.publishedYear && (
                            <Badge variant="outline" color="gray" size="sm">
                              <IconCalendarEvent size={12} className="mr-1" />
                              {book.publishedYear}
                            </Badge>
                          )}
                          {readingTime && readingTime !== "N/A" && (
                            <Badge variant="outline" color="gray" size="sm">
                              <IconClock size={12} className="mr-1" />
                              {readingTime}
                            </Badge>
                          )}
                        </Stack>
                        
                        {description && description !== "N/A" && (
                          <Text size="sm" color="dimmed" className="mb-4 line-clamp-3">
                            {description}
                          </Text>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <Group position="apart" className="mt-auto pt-4 border-t border-gray-100">
                        <Group spacing="xs">
                          {/* Always show "Show All" if batchBooksPath exists */}
                          {book.batchBookPaths &&
                            book.batchBookPaths.length > 0 && (
                              <Button
                                variant="outline"
                                color="blue"
                                radius="md"
                                size="sm"
                                leftIcon={<IconBooks size={16} />}
                                onClick={() => handleBatchBookClick(book)}
                              >
                                {t("bookpage.buttons.showAll") || "Show All"}
                              </Button>
                            )}

                          {/* Allow reading directly if not a batch */}
                          {!book.batchBookPaths ||
                          book.batchBookPaths.length === 0
                            ? book.book_source_path && (
                                <Anchor
                                  href={getBookFileUrl(book.book_source_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    variant="filled"
                                    color="blue"
                                    radius="md"
                                    size="sm"
                                    leftIcon={<IconEye size={16} />}
                                  >
                                    {t("bookpage.buttons.read") || "Read"}
                                  </Button>
                                </Anchor>
                              )
                            : null}
                        </Group>
                        
                        {book.book_source_path && (
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            title={t("bookpage.buttons.download") || "Download"}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = getBookFileUrl(book.book_source_path) || '#';
                              link.download = `${title}.pdf`;
                              link.click();
                            }}
                          >
                            <IconDownload size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group position="center" className="mt-16">
                <Pagination
                  page={activePage}
                  onChange={setActivePage}
                  total={totalPages}
                  color="blue"
                  radius="md"
                  size={isMobile ? "md" : "lg"}
                  className="shadow-sm"
                  withEdges
                />
              </Group>
            )}
          </>
        ) : (
          <Paper
            withBorder
            p="xl"
            radius="lg"
            shadow="sm"
            className="text-center bg-white"
          >
            <ThemeIcon
              size={80}
              radius={80}
              color="blue"
              variant="light"
              className="mx-auto mb-6"
            >
              <IconBook size={36} />
            </ThemeIcon>
            <Title order={3} className="mb-3 text-gray-800">
              {t("bookpage.noBooks.title") || "No Books Found"}
            </Title>
            <Text color="dimmed" className="mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory || activeTab !== "all"
                ? t("bookpage.noBooks.searchDescription") || "Try adjusting your search or filters"
                : t("bookpage.noBooks.description") || "Check back soon for new books"}
            </Text>
            <Button
              variant="light"
              color="blue"
              size="md"
              radius="md"
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              {t("bookpage.buttons.resetFilters") || "Reset Filters"}
            </Button>
          </Paper>
        )}
      </Container>

      {/* Batch Books Modal */}
      <Modal
        opened={batchBooksOpened}
        onClose={closeBatchBooks}
        title={
          <Title order={3} className="font-bold">
            {selectedBook
              ? safeGetField(
                  selectedBook.title,
                  i18n.language === "am" ? "am" : "en"
                )
              : ""}
          </Title>
        }
        size="xl"
        className={classes.batchBooksModal}
        overlayBlur={3}
        overlayOpacity={0.25}
        radius="lg"
        padding="xl"
        centered
      >
        {selectedBook && selectedBook.batchBookPaths && selectedBook.batchBookNames && (
          <div>
            <Text size="lg" className="mb-6">
              {t("bookpage.batchBooksModal.description") || "This book contains multiple documents. Click on any to read:"}
            </Text>
            <SimpleGrid
              cols={isMobile ? 2 : 4}
              spacing="lg"
              breakpoints={[
                { maxWidth: "sm", cols: 2, spacing: "sm" },
                { maxWidth: "xs", cols: 1, spacing: "sm" },
              ]}
            >
              {selectedBook.batchBookPaths.map((path, index) => {
                const filename = selectedBook.batchBookNames?.[index] || 
                  path.split('/').pop() || `Document ${index + 1}`;
                const displayName = filename.replace(/\.pdf$/i, ''); // Remove .pdf extension if present
                
                return (
                  <Card
                    key={index}
                    shadow="sm"
                    p="lg"
                    radius="md"
                    className={classes.batchBookCard}
                  >
                    <Card.Section className={classes.batchBookCover}>
                      <IconFileTypePdf size={48} color="red" />
                    </Card.Section>
                    <Text 
                      size="sm" 
                      className={`mt-4 font-medium ${classes.filenameText}`}
                      title={displayName} // Show full name on hover
                    >
                      {displayName}
                    </Text>
                    <Button
                      fullWidth
                      variant="light"
                      color="blue"
                      mt="md"
                      radius="md"
                      onClick={() => handleReadBatchBook(path)}
                      leftIcon={<IconEye size={16} />}
                    >
                      {t("bookpage.buttons.read") || "Read"}
                    </Button>
                  </Card>
                );
              })}
            </SimpleGrid>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BooksPage;