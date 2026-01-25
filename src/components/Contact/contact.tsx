import React, { useState, useEffect } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  Card,
  TextInput,
  Textarea,
  Button,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
} from "@tabler/icons-react";
import { createContact } from "../../services/api/main";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";

interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUsPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      notifications.show({
        title: t("contactus.notifications.missingTitle"),
        message: t("contactus.notifications.missingMessage"),
        color: "red",
        icon: <IconX size="1.2rem" />,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await createContact(formData);

      if (response.success) {
        notifications.show({
          title: t("contactus.notifications.successTitle"),
          message: t("contactus.notifications.successMessage"),
          color: "teal",
          icon: <IconCheck size="1.2rem" />,
        });

        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(
          response.message || t("contactus.notifications.errorMessage")
        );
      }
    } catch (error) {
      notifications.show({
        title: t("contactus.notifications.errorTitle"),
        message:
          error instanceof Error
            ? error.message
            : t("contactus.notifications.unexpectedError"),
        color: "red",
        icon: <IconX size="1.2rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="w-full bg-blue-800 py-16">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Title order={1} className="text-4xl md:text-5xl font-bold mb-4">
              {t("contactus.hero.title")}
            </Title>
            <Text size="xl" className="max-w-3xl mx-auto text-blue-100">
              {t("contactus.hero.subtitle")}
            </Text>
          </div>
        </Container>
      </div>

      {/* Contact Form Section */}
      <Container size={1400} className="py-16">
        <Grid gutter={50}>
          <Grid.Col span={12} md={6} data-aos="fade-right">
            <Card
              shadow="lg"
              padding="xl"
              radius="lg"
              className="border-t-4 border-blue-600"
            >
              <Title
                order={2}
                className="text-2xl font-bold text-blue-800 mb-8"
              >
                {t("contactus.form.title")}
              </Title>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TextInput
                  name="fullName"
                  label={t("contactus.form.fullName")}
                  placeholder={t("contactus.form.fullNamePlaceholder")}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />

                <TextInput
                  name="email"
                  type="email"
                  label={t("contactus.form.email")}
                  placeholder={t("contactus.form.emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />

                <TextInput
                  name="subject"
                  label={t("contactus.form.subject")}
                  placeholder={t("contactus.form.subjectPlaceholder")}
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                />

                <Textarea
                  name="message"
                  label={t("contactus.form.message")}
                  placeholder={t("contactus.form.messagePlaceholder")}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minRows={5}
                  size="md"
                  radius="md"
                />

                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 transition-all"
                  size="md"
                  radius="md"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? <Loader  /> : t("contactus.form.submit")}
                </Button>
              </form>
            </Card>
          </Grid.Col>

          <Grid.Col span={12} md={6} data-aos="fade-left" data-aos-delay="200">
            <Card
              shadow="lg"
              padding="xl"
              radius="lg"
              className="bg-blue-50 border-t-4 border-blue-600"
            >
              <Title
                order={2}
                className="text-2xl font-bold text-blue-800 mb-8"
              >
                {t("contactus.contactInfo.title")}
              </Title>

              <div className="space-y-6">
                <ContactInfoItem
                  icon={<IconMapPin size={20} />}
                  title={t("contactus.contactInfo.address.title")}
                  content={[
                    t("contactus.contactInfo.address.line1"),
                    t("contactus.contactInfo.address.line2"),
                  ]}
                />
                <Divider />
                <ContactInfoItem
                  icon={<IconPhone size={20} />}
                  title={t("contactus.contactInfo.phone.title")}
                  content={[
                    t("contactus.contactInfo.phone.number1"),
                    t("contactus.contactInfo.phone.number2"),
                  ]}
                />
                <Divider />
                <ContactInfoItem
                  icon={<IconMail size={20} />}
                  title={t("contactus.contactInfo.email.title")}
                  content={[
                    t("contactus.contactInfo.email.address1"),
                    // t("contactus.contactInfo.email.address2"),
                  ]}
                />
                <Divider />
                <ContactInfoItem
                  icon={<IconClock size={20} />}
                  title={t("contactus.contactInfo.hours.title")}
                  content={[
                    t("contactus.contactInfo.hours.weekdays"),
                    t("contactus.contactInfo.hours.saturday"),
                  ]}
                />
              </div>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Map Section */}
        <div className="mt-20" data-aos="fade-up">
          <Card shadow="lg" padding={0} radius="lg" className="overflow-hidden">
            <Title
              order={2}
              className="text-2xl font-bold text-blue-800 p-6 pb-0"
            >
              {t("contactus.map.title")}
            </Title>
            <Text className="text-gray-600 px-6">
              {t("contactus.map.description")}
            </Text>
            <div className="h-[400px] w-full mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6516.188085058267!2d38.80036717678424!3d9.01825369104269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85430fefa2a1%3A0x89be21e8aa34e1e6!2z4Yuo4Ymm4YiMIOGKreGNjeGIiCDhiqjhibDhiJsg4Yqg4Yi14Ymw4Yuz4Yuw4YitIHwg4YiY4YyI4YqT4Yqb!5e1!3m2!1sam!2set!4v1748719154840!5m2!1sam!2set"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
};

const ContactInfoItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  content: string | string[];
}> = ({ icon, title, content }) => (
  <div className="flex items-start">
    <ThemeIcon
      size={40}
      radius="md"
      color="blue"
      variant="light"
      className="mr-4"
    >
      {icon}
    </ThemeIcon>
    <div>
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
      {Array.isArray(content) ? (
        content.map((item, i) => (
          <Text key={i} className="text-gray-700">
            {item}
          </Text>
        ))
      ) : (
        <Text className="text-gray-700">{content}</Text>
      )}
    </div>
  </div>
);

export default ContactUsPage;
