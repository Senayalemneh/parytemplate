// subcity-management/form-detail.tsx
import {
  Button,
  Grid,
  Stack,
  TextInput,
  Textarea,
  Card,
  Group,
  Avatar,
  Title,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IconDeviceFloppy, IconMapPin } from "@tabler/icons-react";
import { CustomInputError } from "../../../components/common/form-error";
import { Subcity } from "./main";
import schema from "./form-schema";

interface FormProps {
  mode: "new" | "edit";
  subcity: Subcity | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose: () => void;
}

export const SubcityFormDetail: React.FC<FormProps> = ({
  mode,
  subcity,
  onSubmit,
  isLoading,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: subcity || {
      name: {
        en: "Addis Ababa",
        am: "አዲስ አበባ",
      },
      description: "The capital city of Ethiopia.",
    },
  });

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      name: {
        en: data.name.en,
        am: data.name.am,
      },
      description: data.description,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card withBorder shadow="sm" p="lg" radius="md">
        <Group mb="md">
          <Avatar color="blue" radius="xl">
            <IconMapPin size={18} />
          </Avatar>
          <Title order={4}>Subcity Form</Title>
        </Group>

        <Grid gutter="xl">
          <Grid.Col span={6}>
            <Stack spacing={2}>
              <TextInput
                label="Name (English)"
                {...register("name.en")}
                error={errors.name?.en?.message}
                withAsterisk
              />
              {errors.name?.en && (
                <CustomInputError message={errors.name.en.message} />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack spacing={2}>
              <TextInput
                label="Name (Amharic)"
                {...register("name.am")}
                error={errors.name?.am?.message}
                withAsterisk
              />
              {errors.name?.am && (
                <CustomInputError message={errors.name.am.message} />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={12}>
            <Stack spacing={2}>
              <Textarea
                label="Description"
                {...register("description")}
                error={errors.description?.message}
                minRows={3}
                maxRows={5}
                withAsterisk
              />
              {errors.description && (
                <CustomInputError message={errors.description.message} />
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        <Group mt="xl" position="right">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<IconDeviceFloppy size={16} />}
            loading={isLoading}
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
          >
            {mode === "new" ? "Submit" : "Update"}
          </Button>
        </Group>
      </Card>
    </form>
  );
};

export default SubcityFormDetail;
