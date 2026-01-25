import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Title,
  Text,
  Stack,
  Table,
  Progress,
  Badge,
  Group,
  Loader,
  Button,
  Alert,
} from '@mantine/core';
import { 
  getQuestionnaireById, 
  getAnswers, 
  getQuestions,
  saveResults,
  getResults,
} from '../../services/api/main';

export default function ResultsPage() {
  const { t } = useTranslation();
  const { id: questionnaireId } = useParams<{ id: string }>();
  const [questionnaire, setQuestionnaire] = useState<any | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser) {
          throw new Error("User not authenticated");
        }
        
        const user = JSON.parse(currentUser);
        if (!user?.id) {
          throw new Error("Invalid user data");
        }
        
        const answersData = await getAnswers(questionnaireId!, user?.id);
        
        const questionsFromAnswers = answersData.map((answer: any) => answer.question);
        const uniqueQuestions = Array.from(new Set(questionsFromAnswers.map((q: any) => q.id)))
          .map(id => questionsFromAnswers.find((q: any) => q.id === id));
        
        try {
          const [questionnaireData, questionsData, resultsData] = await Promise.all([
            getQuestionnaireById(questionnaireId!),
            getQuestions(questionnaireId!),
            getResults(questionnaireId!, user?.id),
          ]);
          
          setQuestionnaire(questionnaireData);
          setQuestions(questionsData.sort((a, b) => a.order - b.order));
          setSavedResults(resultsData);
        } catch (err) {
          console.warn('Failed to load questionnaire, using questions from answers');
          setQuestions(uniqueQuestions.sort((a, b) => a.order - b.order));
          setQuestionnaire({
            id: questionnaireId,
            title: t('resultpageadmin.title', { title: 'Questionnaire Results' }),
            description: '',
          });
        }
        
        setAnswers(answersData);
        
        if (answersData.length > 0 && savedResults.length === 0) {
          const totalPoints = answersData.reduce(
            (sum, answer) => sum + (parseInt(answer.points_earned) || 0),
            0
          );
          const maxPossiblePoints = uniqueQuestions.reduce(
            (sum, question) => sum + (parseInt(question.points) || 0),
            0
          );
          const scorePercentage = maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;
          
          const answersDetails = uniqueQuestions.map((question) => {
            const answer = answersData.find(a => a.question_id === question.id);
            return {
              question_id: question.id,
              question_text: question.question_text,
              points_earned: parseInt(answer?.points_earned) || 0,
              points_possible: parseInt(question.points) || 0,
              is_correct: answer?.is_correct || false,
              answer_text: answer?.answer_text || null,
              selected_options: answer?.selected_options || []
            };
          });

          try {
            await saveResults(questionnaireId!, {
              total_points: totalPoints,
              user_id: user.id,
              max_possible_points: maxPossiblePoints,
              percentage: scorePercentage,
              answers_details: answersDetails
            });
          } catch (err) {
            console.error('Failed to save results:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(t('resultpageadmin.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [questionnaireId, t]);

  if (loading) return <Loader size="xl" variant="dots" />;
  if (error) return <Alert color="red">{error}</Alert>;
  if (answers.length === 0) return <div>{t('resultpageadmin.noAnswers')}</div>;

  const answersByQuestionId = answers.reduce((acc, answer) => {
    acc[answer.question_id] = answer;
    return acc;
  }, {});

  const totalPoints = answers.reduce(
    (sum, answer) => sum + (parseInt(answer.points_earned) || 0),
    0
  );
  const maxPossiblePoints = questions.reduce(
    (sum, question) => sum + (parseInt(question.points) || 0),
    0
  );
  const scorePercentage = maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Title order={1} mb="md">
        {t('resultpageadmin.title', { title: questionnaire?.title || 'Questionnaire' })}
      </Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Stack spacing="xs">
          <Text size="xl" weight={500}>
            {t('resultpageadmin.score', {
              score: totalPoints,
              maxScore: maxPossiblePoints
            })}
          </Text>
          <Progress value={scorePercentage} size="lg" />
          <Text align="center" size="sm" color="dimmed">
            {t('resultpageadmin.percentage', { percentage: scorePercentage.toFixed(1) })}
          </Text>
        </Stack>
      </Card>

      {savedResults.length > 0 && (
        <>
          <Group position="apart" mb="md">
            <Title order={2}>{t('resultpageadmin.questionBreakdown')}</Title>
            <Button 
              variant="outline" 
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? t('resultpageadmin.hideHistory') : t('resultpageadmin.viewHistory')}
            </Button>
          </Group>

          {showHistory && (
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
              <Title order={3} mb="sm">{t('resultpageadmin.previousAttempts')}</Title>
              <Table>
                <thead>
                  <tr>
                    <th>{t('resultpageadmin.tableHeaders.date')}</th>
                    <th>{t('resultpageadmin.tableHeaders.score')}</th>
                    <th>{t('resultpageadmin.tableHeaders.percentage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {savedResults.map((result) => (
                    <tr key={result.id}>
                      <td>{new Date(result.created_at).toLocaleDateString()}</td>
                      <td>{result.total_points} / {result.max_possible_points}</td>
                      <td>
                        <Group spacing="xs">
                          <Progress value={result.percentage} size="sm" style={{ flex: 1 }} />
                          <Text size="sm" style={{ width: 60 }}>
                            {t('resultpageadmin.percentage', { percentage: result.percentage.toFixed(1) })}
                          </Text>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </>
      )}

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table>
          <thead>
            <tr>
              <th>{t('resultpageadmin.tableHeaders.question')}</th>
              <th>{t('resultpageadmin.tableHeaders.yourAnswer')}</th>
              <th>{t('resultpageadmin.tableHeaders.correct')}</th>
              <th>{t('resultpageadmin.tableHeaders.points')}</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => {
              const answer = answersByQuestionId[question.id];
              
              return (
                <tr key={question.id}>
                  <td>{question.question_text}</td>
                  <td>
                    {question.question_type === 'multiple_choice' ? (
                      <Stack spacing="xs">
                        {answer?.selected_options?.map((optionId: number) => {
                          const option = question.options?.find(
                            (o: any) => o.id === optionId
                          );
                          return (
                            <Text key={optionId}>
                              {option?.option_text}
                              {option?.is_correct && (
                                <Badge color="green" ml="sm">
                                  {t('resultpageadmin.badges.correct')}
                                </Badge>
                              )}
                            </Text>
                          );
                        }) ?? <Text color="dimmed">{t('resultpageadmin.notAnswered')}</Text>}
                      </Stack>
                    ) : (
                      <Text>{answer?.answer_text || <Text color="dimmed">{t('resultpageadmin.notAnswered')}</Text>}</Text>
                    )}
                  </td>
                  <td>
                    {answer?.is_correct !== undefined ? (
                      <Badge color={answer.is_correct ? 'green' : 'red'}>
                        {answer.is_correct ? t('resultpageadmin.badges.yes') : t('resultpageadmin.badges.incorrect')}
                      </Badge>
                    ) : (
                      <Badge color="gray">{t('resultpageadmin.badges.notApplicable')}</Badge>
                    )}
                  </td>
                  <td>
                    {parseInt(answer?.points_earned) || 0} / {parseInt(question.points) || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}