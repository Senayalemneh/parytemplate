import { useState } from "react";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import {
  TextInput,
  Select,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Text,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";

interface QuestionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function QuestionForm({
  initialValues,
  onSubmit,
  isSubmitting,
}: QuestionFormProps) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      order: 0,
      is_required: false,
      options: [{ option_text: "", is_correct: false, order: 0 }],
      ...initialValues,
    },

    validate: (values) => {
      const errors: Record<string, any> = {};

      if (!values.question_text) {
        errors.question_text = t("questionform.errors.questionRequired");
      }
      if (!["multiple_choice", "open_ended"].includes(values.question_type)) {
        errors.question_type = t("questionform.errors.invalidType");
      }
      if (values.points <= 0) {
        errors.points = t("questionform.errors.pointsMinimum");
      }

      if (values.question_type === "multiple_choice") {
        if (!values.options || values.options.length === 0) {
          errors.options = t("questionform.errors.optionRequired");
        } else {
          const optionErrors = values.options.map((option: any) => {
            if (!option.option_text) {
              return {
                option_text: t("questionform.errors.optionTextRequired"),
              };
            }
            return null;
          });

          if (optionErrors.some((error: any) => error !== null)) {
            errors.options = optionErrors;
          }
        }
      }

      return errors;
    },
  });

  const addOption = () => {
    form.insertListItem("options", {
      option_text: "",
      is_correct: false,
      order: 0,
    });
  };

  const removeOption = (index: number) => {
    form.removeListItem("options", index);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing="md">
        <TextInput
          label={t("questionform.fields.questionText")}
          placeholder={t("questionform.placeholders.question")}
          required
          {...form.getInputProps("question_text")}
        />

        <Select
          label={t("questionform.fields.questionType")}
          data={[
            {
              value: "multiple_choice",
              label: t("questionform.questionTypes.multipleChoice"),
            },
            {
              value: "open_ended",
              label: t("questionform.questionTypes.openEnded"),
            },
          ]}
          required
          {...form.getInputProps("question_type")}
        />

        <NumberInput
          label={t("questionform.fields.points")}
          min={1}
          required
          {...form.getInputProps("points")}
        />

        <NumberInput
          label={t("questionform.fields.order")}
          min={0}
          {...form.getInputProps("order")}
        />

        <Checkbox
          label={t("questionform.fields.required")}
          {...form.getInputProps("is_required", { type: "checkbox" })}
        />

        {form.values.question_type === "multiple_choice" && (
          <Box>
            <Text size="sm" weight={500} mb="sm">
              {t("questionform.fields.options")}
            </Text>
            {form.values.options.map((_: any, index: number) => (
              <Group key={index} align="flex-end" mb="sm">
                <TextInput
                  placeholder={t("questionform.placeholders.option")}
                  required
                  sx={{ flex: 1 }}
                  {...form.getInputProps(`options.${index}.option_text`)}
                />
                <Checkbox
                  label={t("questionform.fields.correct")}
                  {...form.getInputProps(`options.${index}.is_correct`, {
                    type: "checkbox",
                  })}
                />
                <NumberInput
                  placeholder={t("questionform.placeholders.order")}
                  min={0}
                  width={80}
                  {...form.getInputProps(`options.${index}.order`)}
                />
                {form.values.options.length > 1 && (
                  <ActionIcon color="red" onClick={() => removeOption(index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
            <Button
              leftIcon={<IconPlus size={16} />}
              variant="outline"
              onClick={addOption}
            >
              {t("questionform.buttons.addOption")}
            </Button>
          </Box>
        )}

        <Group position="right" mt="md">
          <Button type="submit" loading={isSubmitting}>
            {initialValues
              ? t("questionform.buttons.updateQuestion")
              : t("questionform.buttons.createQuestion")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
