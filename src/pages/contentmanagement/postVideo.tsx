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
  FileInput,
  Text,
  Anchor,
  Image,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { MRT_ColumnDef, MantineReactTable } from "mantine-react-table";
import {
  postVideo,
  uploadFile,
  getPostedVideos,
  updatePostedVideo,
  deletePosteVideo,
} from "../../services/api/main";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconUpload,
  IconVideo,
  IconExternalLink,
  IconPhoto,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

// Define base URL for CMS files
const CMS_FILES_BASE_URL =
  "https://bole.prosperity.boleprosperityparty.org/CMSFiles/";

interface VideoItem {
  id: number;
  title: string;
  description: string;
  thumbnail_image_path: string;
  video_file: string;
  video_url: string;
  created_at: string;
  updated_at: string;
}

const VideoUploader = () => {
  const { t } = useTranslation();
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      videoFile: null as File | null,
      thumbnailFile: null as File | null,
      thumbnail_image_path: "",
      video_file: "",
      video_url: "",
    },
    validate: {
      title: (value) => (value ? null : t("postvideo.formErrors.title")),
      description: (value) =>
        value ? null : t("postvideo.formErrors.description"),
      video_file: (value, values) =>
        !value && !values.video_url && !values.videoFile
          ? t("postvideo.formErrors.videoRequired")
          : null,
      video_url: (value, values) =>
        !value && !values.video_file && !values.videoFile
          ? t("postvideo.formErrors.videoRequired")
          : null,
    },
  });

  // Helper function to get full URL for CMS files
  const getFileUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${CMS_FILES_BASE_URL}${path}`;
  };

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await getPostedVideos();
      // Sort by created_at in descending order (newest first)
      setVideoData(
        response.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching videos:", error);
      showNotification(t("postvideo.notifications.fetchFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    notifications.show({
      title:
        type === "success"
          ? t("postvideo.notifications.successTitle")
          : t("postvideo.notifications.errorTitle"),
      message,
      color: type === "success" ? "teal" : "red",
      icon: type === "success" ? <IconCheck size={18} /> : <IconX size={18} />,
      withBorder: true,
    });
  };

  const resetAndCloseModal = () => {
    closeModal();
    setEditingId(null);
    setPreviewVideo(null);
    setThumbnail(null);
    form.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      let video_file = values.video_file;
      let video_url = values.video_url;
      let thumbnail_image_path = values.thumbnail_image_path;

      // Handle file uploads
      if (values.videoFile || values.thumbnailFile || thumbnail) {
        setFileUploading(true);
        try {
          // Upload video file if provided
          if (values.videoFile) {
            const uploadResponse = await uploadFile(values.videoFile, "videos");
            video_file = uploadResponse.file.path;
            video_url = ""; // Clear URL if file is uploaded
          }

          // Upload thumbnail if provided
          if (values.thumbnailFile) {
            const thumbnailResponse = await uploadFile(
              values.thumbnailFile,
              "thumbnails"
            );
            thumbnail_image_path = thumbnailResponse.file.path;
          } else if (thumbnail && !values.thumbnail_image_path) {
            // If we have a generated thumbnail (from video) and no existing thumbnail, upload it
            const response = await fetch(thumbnail);
            const blob = await response.blob();
            const thumbnailFile = new File([blob], "thumbnail.jpg", {
              type: "image/jpeg",
            });
            const thumbnailResponse = await uploadFile(
              thumbnailFile,
              "thumbnails"
            );
            thumbnail_image_path = thumbnailResponse.file.path;
          }

          showNotification(
            t("postvideo.notifications.uploadSuccess"),
            "success"
          );
        } catch (error) {
          console.error("File upload error:", error);
          showNotification(t("postvideo.notifications.uploadFailed"), "error");
          return;
        } finally {
          setFileUploading(false);
        }
      } else if (video_url) {
        video_file = ""; // Clear file path if URL is provided
      }

      // Validate that at least one of file or URL is provided
      if (!video_file && !video_url) {
        showNotification(t("postvideo.formErrors.videoRequired"), "error");
        return;
      }

      // Prepare the payload exactly as required
      const payload = {
        title: values.title,
        description: values.description,
        video_file: video_file || "", // Send empty string if not provided
        video_url: video_url || "", // Send empty string if not provided
        thumbnail_image_path: thumbnail_image_path || "test", // Default to "test" if empty
      };

      let response;
      if (editingId) {
        // Update existing video
        response = await updatePostedVideo(editingId, payload);
      } else {
        // Create new video
        response = await postVideo(payload);
      }

      if (response) {
        showNotification(
          editingId
            ? t("postvideo.notifications.updateSuccess")
            : t("postvideo.notifications.createSuccess"),
          "success"
        );
        fetchVideos(); // Refresh video list
      }

      resetAndCloseModal();
    } catch (error: any) {
      console.error("Error saving video:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          if (form.getInputProps(key)) {
            form.setFieldError(key, errors[key][0]);
          }
        });
      } else {
        showNotification(
          editingId
            ? t("postvideo.notifications.updateFailed")
            : t("postvideo.notifications.createFailed"),
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate video file type
      const validTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!validTypes.includes(file.type)) {
        showNotification(t("postvideo.formErrors.invalidVideoType"), "error");
        return;
      }

      // Validate file size (e.g., 100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        showNotification(t("postvideo.formErrors.videoSizeLimit"), "error");
        return;
      }

      form.setFieldValue("videoFile", file);
      form.setFieldValue("video_file", ""); // Clear existing path when new file is selected
      form.setFieldValue("video_url", ""); // Clear URL when file is selected

      // Create preview for the video
      const videoUrl = URL.createObjectURL(file);
      setPreviewVideo(videoUrl);

      // Generate a thumbnail from the video (first frame)
      const video = document.createElement("video");
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = Math.min(1, video.duration);
      });
      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL("image/jpeg");
          setThumbnail(thumbnailUrl);
        }
      });
    } else {
      form.setFieldValue("videoFile", null);
      setPreviewVideo(null);
      setThumbnail(null);
    }
  };

  const handleThumbnailChange = (file: File | null) => {
    if (file) {
      // Validate image file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        showNotification(t("postvideo.formErrors.invalidImageType"), "error");
        return;
      }

      form.setFieldValue("thumbnailFile", file);
      form.setFieldValue("thumbnail_image_path", ""); // Clear existing path when new file is selected

      // Create preview for the thumbnail
      const thumbnailUrl = URL.createObjectURL(file);
      setThumbnail(thumbnailUrl);
    } else {
      form.setFieldValue("thumbnailFile", null);
      form.setFieldValue("thumbnail_image_path", ""); // Clear path when no file is selected
      setThumbnail(null);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const videoToEdit = videoData.find((video) => video.id === id);
      if (videoToEdit) {
        form.setValues({
          title: videoToEdit.title,
          description: videoToEdit.description,
          videoFile: null,
          thumbnailFile: null,
          thumbnail_image_path: videoToEdit.thumbnail_image_path || "",
          video_file: videoToEdit.video_file,
          video_url: videoToEdit.video_url || "",
        });
        setEditingId(id);
        openModal();

        // Set thumbnail preview if it exists
        if (videoToEdit.thumbnail_image_path) {
          setThumbnail(getFileUrl(videoToEdit.thumbnail_image_path));
        }

        // Set video preview if it exists and is a file
        if (videoToEdit.video_file && !videoToEdit.video_url) {
          setPreviewVideo(getFileUrl(videoToEdit.video_file));
        }
      }
    } catch (error) {
      console.error("Error preparing edit form:", error);
      showNotification(t("postvideo.notifications.editFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(true);
      await deletePosteVideo(id);
      showNotification(t("postvideo.notifications.deleteSuccess"), "success");
      // Optimistically update the UI by removing the deleted item
      setVideoData(videoData.filter((video) => video.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
      showNotification(t("postvideo.notifications.deleteFailed"), "error");
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

  const openViewModal = (video: VideoItem) => {
    setCurrentVideo(video);
    setViewModalOpen(true);
  };

  const columns: MRT_ColumnDef<VideoItem>[] = [
    {
      accessorKey: "id",
      header: t("postvideo.table.headers.id"),
      size: 80,
    },
    {
      accessorKey: "title",
      header: t("postvideo.table.headers.title"),
    },
    {
      accessorKey: "description",
      header: t("postvideo.table.headers.description"),
      Cell: ({ cell }) => (
        <Box sx={{ maxWidth: 300 }}>
          <div className="truncate">{cell.getValue<string>()}</div>
        </Box>
      ),
    },
    {
      accessorKey: "thumbnail_image_path",
      header: t("postvideo.table.headers.thumbnail"),
      Cell: ({ cell, row }) => (
        <Group spacing="xs">
          {cell.getValue<string>() ? (
            <Image
              src={getFileUrl(cell.getValue<string>())}
              width={80}
              height={45}
              fit="cover"
              radius="sm"
              onClick={() => openViewModal(row.original)}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <Box
              w={80}
              h={45}
              bg="gray.2"
              display="flex"
              sx={{ alignItems: "center", justifyContent: "center" }}
            >
              <IconPhoto size={24} color="gray" />
            </Box>
          )}
        </Group>
      ),
    },
    {
      accessorKey: "video_file",
      header: t("postvideo.table.headers.videoFile"),
      Cell: ({ cell, row }) => (
        <Group spacing="xs">
          {cell.getValue<string>() ? (
            <>
              <Text size="sm" truncate>
                {cell.getValue<string>()}
              </Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="blue"
                onClick={() => openViewModal(row.original)}
              >
                <IconVideo size={16} />
              </ActionIcon>
            </>
          ) : (
            <Text size="sm" color="dimmed">
              {t("postvideo.table.na")}
            </Text>
          )}
        </Group>
      ),
    },
    {
      accessorKey: "video_url",
      header: t("postvideo.table.headers.videoUrl"),
      Cell: ({ cell, row }) => (
        <Group spacing="xs">
          {cell.getValue<string>() ? (
            <>
              <Anchor
                href={cell.getValue<string>()}
                target="_blank"
                size="sm"
                truncate
              >
                {cell.getValue<string>()}
              </Anchor>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="blue"
                onClick={() => openViewModal(row.original)}
              >
                <IconExternalLink size={16} />
              </ActionIcon>
            </>
          ) : (
            <Text size="sm" color="dimmed">
              {t("postvideo.table.na")}
            </Text>
          )}
        </Group>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("postvideo.table.headers.createdAt"),
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      id: "actions",
      header: t("postvideo.table.headers.actions"),
      Cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <Group spacing="xs">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(itemId)}
              title={t("postvideo.table.actions.edit")}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => openDeleteConfirm(itemId)}
              title={t("postvideo.table.actions.delete")}
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
        <Title order={2}>{t("postvideo.title")}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingId(null);
            setPreviewVideo(null);
            setThumbnail(null);
            openModal();
          }}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          {t("postvideo.buttons.addVideo")}
        </Button>
      </Group>
      <Divider my="md" />

      <Box className="h-[calc(100vh-200px)] w-full overflow-auto">
        <MantineReactTable
          columns={columns}
          data={videoData}
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
            ? t("postvideo.modal.editTitle")
            : t("postvideo.modal.createTitle")
        }
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            withAsterisk
            label={t("postvideo.form.title.label")}
            placeholder={t("postvideo.form.title.placeholder")}
            mb="md"
            {...form.getInputProps("title")}
          />

          <Textarea
            withAsterisk
            label={t("postvideo.form.description.label")}
            placeholder={t("postvideo.form.description.placeholder")}
            minRows={3}
            mb="md"
            {...form.getInputProps("description")}
          />

          <FileInput
            label={t("postvideo.form.videoFile.label")}
            placeholder={t("postvideo.form.videoFile.placeholder")}
            accept="video/mp4,video/webm,video/ogg"
            icon={<IconUpload size={14} />}
            onChange={handleFileChange}
            mb="md"
            description={t("postvideo.form.videoFile.description")}
            clearable
            {...form.getInputProps("videoFile")}
          />

          {previewVideo && (
            <Box mb="md">
              <video
                src={previewVideo}
                controls
                style={{ maxWidth: "100%", maxHeight: "300px" }}
              />
            </Box>
          )}

          {editingId && form.values.video_file && !previewVideo && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                {t("postvideo.currentVideo")}
              </Text>
              <video
                src={getFileUrl(form.values.video_file)}
                controls
                style={{ maxWidth: "100%", maxHeight: "300px" }}
              />
            </Box>
          )}

          <FileInput
            label={t("postvideo.form.thumbnailFile.label")}
            placeholder={t("postvideo.form.thumbnailFile.placeholder")}
            accept="image/jpeg,image/png,image/gif,image/webp"
            icon={<IconPhoto size={14} />}
            onChange={handleThumbnailChange}
            mb="md"
            description={t("postvideo.form.thumbnailFile.description")}
            clearable
            {...form.getInputProps("thumbnailFile")}
          />

          {(thumbnail || (editingId && form.values.thumbnail_image_path)) && (
            <Box mb="md">
              <Text size="sm" mb="xs">
                {t("postvideo.thumbnailPreview")}
              </Text>
              <Image
                src={thumbnail || getFileUrl(form.values.thumbnail_image_path)}
                width={150}
                height={100}
                fit="cover"
                radius="sm"
              />
              {editingId && !thumbnail && (
                <Text size="xs" color="dimmed" mt="sm">
                  {t("postvideo.currentThumbnail")}
                </Text>
              )}
            </Box>
          )}

          <TextInput
            label={t("postvideo.form.videoUrl.label")}
            placeholder={t("postvideo.form.videoUrl.placeholder")}
            mb="md"
            description={t("postvideo.form.videoUrl.description")}
            {...form.getInputProps("video_url")}
          />

          <Group position="right" mt="xl">
            <Button variant="default" onClick={resetAndCloseModal}>
              {t("postvideo.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              loading={loading || fileUploading}
            >
              {editingId
                ? t("postvideo.buttons.updateVideo")
                : t("postvideo.buttons.uploadVideo")}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t("postvideo.modal.deleteTitle")}
        centered
      >
        <Box>
          <Text size="sm" mb="md">
            {t("postvideo.modal.deleteConfirmation")}
          </Text>
          <Group position="right" mt="md">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("postvideo.buttons.cancel")}
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              {t("postvideo.buttons.delete")}
            </Button>
          </Group>
        </Box>
      </Modal>

      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={currentVideo?.title}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        {currentVideo && (
          <Box>
            <Text mb="md">{currentVideo.description}</Text>

            {currentVideo.thumbnail_image_path && (
              <Box mb="md">
                <Image
                  src={getFileUrl(currentVideo.thumbnail_image_path)}
                  width="100%"
                  height={200}
                  fit="cover"
                  radius="sm"
                />
              </Box>
            )}

            {currentVideo.video_file ? (
              <video
                src={getFileUrl(currentVideo.video_file)}
                controls
                style={{ maxWidth: "100%", maxHeight: "500px" }}
              />
            ) : currentVideo.video_url ? (
              <Box>
                <Text mb="sm">{t("postvideo.externalVideoUrl")}:</Text>
                <Anchor href={currentVideo.video_url} target="_blank">
                  {currentVideo.video_url}
                </Anchor>
                <Box mt="md">
                  <iframe
                    src={currentVideo.video_url}
                    style={{ width: "100%", height: "500px", border: "none" }}
                    allowFullScreen
                  />
                </Box>
              </Box>
            ) : (
              <Text color="dimmed">{t("postvideo.noVideoAvailable")}</Text>
            )}
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default VideoUploader;
