import {
  Card,
  TextInput,
  Button,
  Group,
  Text,
  Select,
  LoadingOverlay,
  Box,
  Notification,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { registerVisitor } from "../../services/api/main";
import { IconCheck, IconX } from "@tabler/icons-react";

const subCities = [
  { value: "Addis Ketema", label: "Addis Ketema" },
  { value: "Akaky Kaliti", label: "Akaky Kaliti" },
  { value: "Arada", label: "Arada" },
  { value: "Bole", label: "Bole" },
  { value: "Gullele", label: "Gullele" },
  { value: "Kirkos", label: "Kirkos" },
  { value: "Kolfe Keranio", label: "Kolfe Keranio" },
  { value: "Lideta", label: "Lideta" },
  { value: "Nifas Silk-Lafto", label: "Nifas Silk-Lafto" },
  { value: "Yeka", label: "Yeka" },
  { value: "Lemi Kura", label: "Lemi Kura" },
];

const woredas = Array.from({ length: 20 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'),
  label: (i + 1).toString().padStart(2, '0'),
}));

const genders = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const RegisterVisitor = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      full_name: "Senay Alemneh",
      gender: "Male",
      phone_number: "0908259010",
      sub_city: "Bole",
      woreda: "06",
      exhibition_id: "8",
    },
    validate: {
      full_name: (value) => (value.trim().length < 2 ? "Name is too short" : null),
      phone_number: (value) =>
        /^[0-9]{10}$/.test(value) ? null : "Phone number must be 10 digits",
      sub_city: (value) => (value ? null : "Please select a sub-city"),
      woreda: (value) => (value ? null : "Please select a woreda"),
      exhibition_id: (value) =>
        /^[0-9]+$/.test(value) ? null : "Exhibition ID must be a number",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        full_name: values.full_name,
        gender: values.gender,
        phone_number: values.phone_number,
        sub_city: values.sub_city,
        woreda: values.woreda,
        exhibition_id: parseInt(values.exhibition_id),
      };

      await registerVisitor(payload);
      setSuccess(true);
      form.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maw={500} mx="auto" mt="xl">
      <Card withBorder shadow="sm" radius="md">
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <Text size="xl" weight={700} mb="md">
          Register New Visitor
        </Text>

        {success && (
          <Notification
            icon={<IconCheck size="1.1rem" />}
            color="teal"
            title="Success"
            mb="md"
            onClose={() => setSuccess(false)}
          >
            Visitor registered successfully!
          </Notification>
        )}

        {error && (
          <Notification
            icon={<IconX size="1.1rem" />}
            color="red"
            title="Error"
            mb="md"
            onClose={() => setError(null)}
          >
            {error}
          </Notification>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Full Name"
            placeholder="Enter full name"
            {...form.getInputProps("full_name")}
            mb="md"
          />

          <Select
            label="Gender"
            placeholder="Select gender"
            data={genders}
            {...form.getInputProps("gender")}
            mb="md"
          />

          <TextInput
            label="Phone Number"
            placeholder="Enter phone number"
            {...form.getInputProps("phone_number")}
            mb="md"
          />

          <Select
            label="Sub City"
            placeholder="Select sub city"
            data={subCities}
            {...form.getInputProps("sub_city")}
            mb="md"
          />

          <Select
            label="Woreda"
            placeholder="Select woreda"
            data={woredas}
            {...form.getInputProps("woreda")}
            mb="md"
          />

          <TextInput
            label="Exhibition ID"
            placeholder="Enter exhibition ID"
            {...form.getInputProps("exhibition_id")}
            mb="md"
          />

          <Group position="right" mt="xl">
            <Button type="submit" loading={loading}>
              Register Visitor
            </Button>
          </Group>
        </form>
      </Card>
    </Box>
  );
};

export default RegisterVisitor;