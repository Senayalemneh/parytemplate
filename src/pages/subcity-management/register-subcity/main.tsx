// subcity-management/main.tsx
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Title,
  Card,
  Avatar,
  Badge,
  Text,
  Table,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash, IconMapPin } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import SubcityFormDetail from "./form-detail";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSubcity,
  deleteSubcity,
  getAllSubcity,
  updateSubcity,
} from "../../../services/api/main";
import Loader from "../../../components/common/loader";
import Error from "../../../components/common/error";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";

interface Subcity {
  id: number;
  name: {
    en: string;
    am: string;
  };
  description: string;
  created_at: string;
  updated_at: string;
}

const SubcityManagement = () => {
  const [opened, { open: openModal, close: closeModal }] = useDisclosure();
  const [mode, setMode] = useState<"new" | "edit">("new");
  const [selectedSubcity, setSelectedSubcity] = useState<Subcity | null>(null);

  // Fetch Subcities
  const {
    isFetching,
    isError,
    data: subcities = [],
    refetch,
  } = useQuery({
    queryKey: ["all-subcities"],
    queryFn: async () => {
      const response = await getAllSubcity();
      return response.map((subcity: any) => ({
        ...subcity,
        name:
          typeof subcity.name === "string"
            ? JSON.parse(subcity.name)
            : subcity.name,
      }));
    },
    staleTime: 60000,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createSubcity,
    onSuccess: () => {
      showNotification({
        title: "Success",
        message: "Subcity created successfully",
        color: "green",
      });
      refetch();
      closeModal();
    },
    onError: () => {
      showNotification({
        title: "Error",
        message: "Failed to create subcity",
        color: "red",
      });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: Subcity) => updateSubcity(data.id, data),
    onSuccess: () => {
      showNotification({
        title: "Success",
        message: "Subcity updated successfully",
        color: "green",
      });
      refetch();
      closeModal();
    },
    onError: () => {
      showNotification({
        title: "Error",
        message: "Failed to update subcity",
        color: "red",
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubcity(id),
    onSuccess: () => {
      showNotification({
        title: "Success",
        message: "Subcity deleted successfully",
        color: "green",
      });
      refetch();
    },
    onError: () => {
      showNotification({
        title: "Error",
        message: "Failed to delete subcity",
        color: "red",
      });
    },
  });

  const handleCreate = (data: Omit<Subcity, "id">) => {
    createMutation.mutate({
      ...data,
      name: JSON.stringify(data.name),
    });
  };

  const handleUpdate = (data: Subcity) => {
    updateMutation.mutate({
      ...data,
      name: JSON.stringify(data.name),
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this subcity?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setMode("new");
    setSelectedSubcity(null);
    openModal();
  };

  const openEditModal = (subcity: Subcity) => {
    setMode("edit");
    setSelectedSubcity(subcity);
    openModal();
  };

  return (
    <Container fluid className="w-full">
      <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
        <Group position="apart" className="mt-14">
          <Title order={3}>Subcity Management</Title>
          <Badge color="blue" variant="light" size="lg">
            {subcities.length} Subcities
          </Badge>
        </Group>
        <Text color="dimmed" mt={4}>
          Manage all subcities in the system
        </Text>
      </Card>

      <Stack mt="md">
        <Button
          className="w-[13rem]"
          leftIcon={<IconPlus size={"0.9rem"} />}
          onClick={openCreateModal}
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
          loading={createMutation.isLoading}
        >
          Add New Subcity
        </Button>

        {isFetching ? (
          <Loader />
        ) : isError ? (
          <Error />
        ) : (
          <Card withBorder shadow="sm" radius="md">
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>English Name</th>
                  <th>Amharic Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcities.map((subcity: Subcity) => (
                  <tr key={subcity.id}>
                    <td>
                      <Group>
                        <Avatar color="blue" radius="xl">
                          <IconMapPin size={18} />
                        </Avatar>
                        <Text>{subcity.name.en}</Text>
                      </Group>
                    </td>
                    <td>{subcity.name.am}</td>
                    <td>
                      <Text lineClamp={1} style={{ maxWidth: 200 }}>
                        {subcity.description}
                      </Text>
                    </td>
                    <td>{dayjs(subcity.created_at).format("DD MMM YYYY")}</td>
                    <td>
                      <Group>
                        <ActionIcon
                          onClick={() => openEditModal(subcity)}
                          color="blue"
                        >
                          <IconEdit size={"0.9rem"} />
                        </ActionIcon>
                        <ActionIcon
                          onClick={() => handleDelete(subcity.id)}
                          color="red"
                        >
                          <IconTrash size={"0.9rem"} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Stack>

      <Modal
        title={
          <Group>
            <IconMapPin />
            {mode === "new" ? "Add New Subcity" : "Edit Subcity"}
          </Group>
        }
        opened={opened}
        onClose={closeModal}
        size="lg"
        overlayProps={{ blur: 3 }}
      >
        <SubcityFormDetail
          mode={mode}
          subcity={selectedSubcity}
          onSubmit={mode === "new" ? handleCreate : handleUpdate}
          isLoading={
            mode === "new" ? createMutation.isLoading : updateMutation.isLoading
          }
          onClose={closeModal}
        />
      </Modal>
    </Container>
  );
};

export default SubcityManagement;
