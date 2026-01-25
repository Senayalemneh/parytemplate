import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, LoadingOverlay, Notification } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import QuestionForm from './question-form';
import { createQuestion } from '../../services/api/main';
import { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function CreateQuestionPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const payload = values.question_type === 'open_ended' 
        ? { ...values, options: undefined } 
        : values;
      
      await createQuestion(id!, payload);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/questionnaires/${id}`);
      }, 2000);
    } catch (error) {
      console.error(t('createquestionpage.error'), error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" pos="relative">
      <LoadingOverlay visible={isSubmitting} overlayBlur={2} />
      
      <Title order={2} mb="xl">
        {t('createquestionpage.title')}
      </Title>
      
      <QuestionForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />

      {showSuccess && (
        <Notification
          icon={<IconCheck size="1.1rem" />}
          color="teal"
          title={t('createquestionpage.success')}
          onClose={() => setShowSuccess(false)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t('createquestionpage.success')}
        </Notification>
      )}

      {showError && (
        <Notification
          icon={<IconX size="1.1rem" />}
          color="red"
          title={t('createquestionpage.error')}
          onClose={() => setShowError(false)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {t('createquestionpage.error')}
        </Notification>
      )}
    </Container>
  );
}