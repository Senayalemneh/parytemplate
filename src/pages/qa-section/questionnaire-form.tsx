import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  NumberInput,
  Button,
  Group,
  Stack,
  Box,
  Text,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { DateInput } from '@mantine/dates';

interface QuestionnaireFormValues {
  title: string;
  description: string;
  type: 'exam' | 'practice_test';
  is_active: boolean;
  time_limit: number | undefined;
  start_date: Date | null;
  end_date: Date | null;
  created_by: string;
}

interface QuestionnaireFormProps {
  initialValues?: Partial<QuestionnaireFormValues>;
  onSubmit: (values: QuestionnaireFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function QuestionnaireForm({
  initialValues,
  onSubmit,
  isSubmitting,
}: QuestionnaireFormProps) {
  const { t } = useTranslation();
  const [parsedUser, setParsedUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setParsedUser(JSON.parse(user));
    }
  }, []);

  const parseInitialValues = () => {
    if (!initialValues) return {
      title: '',
      description: '',
      type: 'exam',
      is_active: true,
      time_limit: undefined, // Changed from null to undefined
      start_date: null,
      end_date: null,
      created_by: '',
    };

    return {
      ...initialValues,
      time_limit: initialValues.time_limit !== null && initialValues.time_limit !== undefined 
        ? Number(initialValues.time_limit) 
        : undefined, // Ensure time_limit is number or undefined
      start_date: initialValues.start_date
        ? new Date(initialValues.start_date)
        : null,
      end_date: initialValues.end_date
        ? new Date(initialValues.end_date)
        : null,
    };
  };

  const form = useForm<QuestionnaireFormValues>({
    initialValues: parseInitialValues(),

    validate: {
      title: (value) => (value ? null : t('questionnaireform.errors.titleRequired')),
      type: (value) => (['exam', 'practice_test'].includes(value) 
        ? null 
        : t('questionnaireform.errors.invalidType')),
      end_date: (value, values) => {
        if (!values.start_date || !value) return null;
        return value < values.start_date
          ? t('questionnaireform.errors.endDateBeforeStart')
          : null;
      },
    },

    transformValues: (values) => ({
      ...values,
      time_limit: values.time_limit ? Number(values.time_limit) : undefined,
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
    }),
  });

  useEffect(() => {
    if (parsedUser?.id) {
      form.setFieldValue('created_by', parsedUser.id);
    }
  }, [parsedUser]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack spacing="md">
        <TextInput
          label={t('questionnaireform.fields.title')}
          placeholder={t('questionnaireform.placeholders.title')}
          required
          {...form.getInputProps('title')}
        />

        <Textarea
          label={t('questionnaireform.fields.description')}
          placeholder={t('questionnaireform.placeholders.description')}
          minRows={3}
          {...form.getInputProps('description')}
        />

        <Select
          label={t('questionnaireform.fields.type')}
          data={[
            { value: 'exam', label: t('questionnaireform.types.exam') },
            { value: 'practice_test', label: t('questionnaireform.types.practiceTest') },
          ]}
          required
          {...form.getInputProps('type')}
        />

        <Checkbox
          label={t('questionnaireform.fields.active')}
          {...form.getInputProps('is_active', { type: 'checkbox' })}
        />

        <NumberInput
          label={t('questionnaireform.fields.timeLimit')}
          placeholder={t('questionnaireform.placeholders.timeLimit')}
          min={1}
          precision={0}
          value={form.values.time_limit ?? undefined} // Ensure value is never null
          onChange={(value) => form.setFieldValue('time_limit', value ?? undefined)} // Convert null to undefined
        />

        <Box>
          <Text size="sm" weight={500} mb={4}>
            {t('questionnaireform.fields.startDate')}
          </Text>
          <DateInput
            valueFormat="YYYY-MM-DD"
            placeholder={t('questionnaireform.placeholders.startDate')}
            clearable
            value={form.values.start_date}
            onChange={(date) => form.setFieldValue('start_date', date)}
            error={form.errors.start_date}
          />
        </Box>

        <Box>
          <Text size="sm" weight={500} mb={4}>
            {t('questionnaireform.fields.endDate')}
          </Text>
          <DateInput
            valueFormat="YYYY-MM-DD"
            placeholder={t('questionnaireform.placeholders.endDate')}
            clearable
            value={form.values.end_date}
            onChange={(date) => form.setFieldValue('end_date', date)}
            minDate={form.values.start_date || undefined}
            error={form.errors.end_date}
          />
        </Box>

        <Group position="right" mt="md">
          <Button type="submit" loading={isSubmitting}>
            {initialValues 
              ? t('questionnaireform.buttons.update') 
              : t('questionnaireform.buttons.create')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}