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
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconSend,
  IconExternalLink,
} from "@tabler/icons-react";
import { createContact } from "../../services/api/main";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";
import Loader from "../../components/common/loader";

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

    // Form validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      notifications.show({
        title: t("contactus.notifications.missingTitle") || "Missing Information",
        message: t("contactus.notifications.missingMessage") || "Please fill in all required fields",
        color: "red",
        icon: <IconX size="1.2rem" />,
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notifications.show({
        title: t("contactus.notifications.invalidEmailTitle") || "Invalid Email",
        message: t("contactus.notifications.invalidEmailMessage") || "Please enter a valid email address",
        color: "red",
        icon: <IconX size="1.2rem" />,
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting contact form data:", formData); // Debug log

      // Call the API with the form data
      const response = await createContact({
        full_name: formData.fullName, // Note: API expects full_name, not fullName
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      console.log("API Response:", response); // Debug log

      // Check if response has success property or if it's just the created object
      if (response && (response.success || response.id || response.full_name)) {
        notifications.show({
          title: t("contactus.notifications.successTitle") || "Success!",
          message: t("contactus.notifications.successMessage") || "Your message has been sent successfully. We'll get back to you soon!",
          color: "teal",
          icon: <IconCheck size="1.2rem" />,
        });

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        // Check for error in response
        const errorMessage = response?.message || 
                            response?.error || 
                            t("contactus.notifications.errorMessage") || 
                            "Failed to send message";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error submitting contact form:", error); // Debug log
      
      let errorMessage = t("contactus.notifications.unexpectedError") || "An unexpected error occurred";
      
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        if (status === 404) {
          errorMessage = t("contactus.notifications.endpointNotFound") || "Contact endpoint not found. Please try again later.";
        } else if (status === 401 || status === 403) {
          errorMessage = t("contactus.notifications.authError") || "Authentication required. Please login and try again.";
        } else if (status === 422) {
          errorMessage = t("contactus.notifications.validationError") || "Please check your input and try again.";
        } else if (status === 500) {
          errorMessage = t("contactus.notifications.serverError") || "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Error ${status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = t("contactus.notifications.noResponse") || "No response from server. Please check your internet connection.";
      } else if (error.message) {
        // Error setting up the request
        errorMessage = error.message;
      }
      
      notifications.show({
        title: t("contactus.notifications.errorTitle") || "Error",
        message: errorMessage,
        color: "red",
        icon: <IconX size="1.2rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 py-20">
        <Container size={1400}>
          <div className="text-center text-white" data-aos="fade-down">
            <Title 
              order={1} 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            >
              {t("contactus.hero.title") || "Contact Us"}
            </Title>
            <Text 
              size="xl" 
              className="max-w-3xl mx-auto text-blue-100/90 leading-relaxed"
            >
              {t("contactus.hero.subtitle") || "Get in touch with us. We're here to help with any questions or concerns you may have."}
            </Text>
          </div>
        </Container>
      </div>

      {/* Contact Form Section */}
      <Container size={1400} className="py-16 px-4 sm:px-6">
        <Grid gutter={50}>
          <Grid.Col span={12} md={6} data-aos="fade-right">
            <Card
              shadow="xl"
              padding="xl"
              radius="lg"
              className="border-t-4 border-blue-600 bg-white transition-all duration-300 hover:shadow-2xl"
            >
              <div className="mb-2">
                <Badge
                  color="blue"
                  variant="light"
                  size="lg"
                  radius="sm"
                  className="mb-4"
                >
                  {t("contactus.form.badge") || "Send Message"}
                </Badge>
                <Title
                  order={2}
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                >
                  {t("contactus.form.title") || "Send Us a Message"}
                </Title>
                <Text color="dimmed" className="mb-8">
                  {t("contactus.form.description") || "Fill out the form below and we'll get back to you as soon as possible."}
                </Text>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TextInput
                  name="fullName"
                  label={t("contactus.form.fullName") || "Full Name"}
                  placeholder={t("contactus.form.fullNamePlaceholder") || "Enter your full name"}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                  variant="filled"
                  className="focus-within:border-blue-500"
                />

                <TextInput
                  name="email"
                  type="email"
                  label={t("contactus.form.email") || "Email Address"}
                  placeholder={t("contactus.form.emailPlaceholder") || "Enter your email"}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                  variant="filled"
                  className="focus-within:border-blue-500"
                />

                <TextInput
                  name="subject"
                  label={t("contactus.form.subject") || "Subject"}
                  placeholder={t("contactus.form.subjectPlaceholder") || "What is this regarding?"}
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  size="md"
                  radius="md"
                  variant="filled"
                  className="focus-within:border-blue-500"
                />

                <Textarea
                  name="message"
                  label={t("contactus.form.message") || "Message"}
                  placeholder={t("contactus.form.messagePlaceholder") || "Type your message here..."}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minRows={5}
                  size="md"
                  radius="md"
                  variant="filled"
                  className="focus-within:border-blue-500"
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1"
                  size="lg"
                  radius="md"
                  loading={loading}
                  disabled={loading}
                  leftIcon={loading ? null : <IconSend size={18} />}
                  styles={{
                    root: {
                      height: '50px',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader />
                      <span className="ml-2">{t("contactus.form.sending") || "Sending..."}</span>
                    </div>
                  ) : (
                    t("contactus.form.submit") || "Send Message"
                  )}
                </Button>
              </form>
            </Card>
          </Grid.Col>

          <Grid.Col span={12} md={6} data-aos="fade-left" data-aos-delay="200">
            <Card
              shadow="xl"
              padding="xl"
              radius="lg"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-t-4 border-blue-600"
            >
              <div className="mb-2">
                <Badge
                  color="blue"
                  variant="light"
                  size="lg"
                  radius="sm"
                  className="mb-4"
                >
                  {t("contactus.contactInfo.badge") || "Contact Information"}
                </Badge>
                <Title
                  order={2}
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
                >
                  {t("contactus.contactInfo.title") || "Get in Touch"}
                </Title>
                <Text color="dimmed" className="mb-8">
                  {t("contactus.contactInfo.description") || "Here's how you can reach us"}
                </Text>
              </div>

              <div className="space-y-8">
                <ContactInfoItem
                  icon={<IconMapPin size={24} />}
                  title={t("contactus.contactInfo.address.title") || "Our Address"}
                  content={[
                    t("contactus.contactInfo.address.line1") || "Addis Ababa, Ethiopia",
                    t("contactus.contactInfo.address.line2") || "Bole Sub City, Woreda 03",
                  ]}
                />
                <Divider />
                <ContactInfoItem
                  icon={<IconPhone size={24} />}
                  title={t("contactus.contactInfo.phone.title") || "Phone Numbers"}
                  content={[
                    t("contactus.contactInfo.phone.number1") || "+251 11 123 4567",
                    t("contactus.contactInfo.phone.number2") || "+251 11 987 6543",
                  ]}
                />
                <Divider />
                <ContactInfoItem
                  icon={<IconMail size={24} />}
                  title={t("contactus.contactInfo.email.title") || "Email Address"}
                  content={[
                    t("contactus.contactInfo.email.address1") || "info@example.com",
                    t("contactus.contactInfo.email.address2") || "support@example.com",
                  ]}
                />
                <Divider />
                <ContactInfoItem
                  icon={<IconClock size={24} />}
                  title={t("contactus.contactInfo.hours.title") || "Working Hours"}
                  content={[
                    t("contactus.contactInfo.hours.weekdays") || "Monday - Friday: 8:30 AM - 5:30 PM",
                    t("contactus.contactInfo.hours.saturday") || "Saturday: 9:00 AM - 1:00 PM",
                  ]}
                />
              </div>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Map Section */}
        <div className="mt-20" data-aos="fade-up" data-aos-delay="400">
          <Card 
            shadow="xl" 
            padding={0} 
            radius="lg" 
            className="overflow-hidden border border-gray-200"
          >
            <div className="p-8">
              <Badge
                color="blue"
                variant="light"
                size="lg"
                radius="sm"
                className="mb-4"
              >
                {t("contactus.map.badge") || "Our Location"}
              </Badge>
              <Title
                order={2}
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
              >
                {t("contactus.map.title") || "Find Us on Map"}
              </Title>
              <Text className="text-gray-600 max-w-3xl">
                {t("contactus.map.description") || "Visit our office location. We're here to welcome you."}
              </Text>
            </div>
            <div className="h-[400px] w-full relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6516.188085058267!2d38.80036717678424!3d9.01825369104269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85430fefa2a1%3A0x89be21e8aa34e1e6!2z4Yuo4Ymm4YiMIOGKreGNjeGIiCDhiqjhibDhiJsg4Yqg4Yi14Ymw4Yuz4Yuw4YitIHwg4YiY4YyI4YqT4Yqb!5e1!3m2!1sam!2set!4v1748719154840!5m2!1sam!2set"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute top-0 left-0"
              />
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Text className="font-semibold text-gray-800">
                    {t("contactus.map.directions") || "Getting Here"}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {t("contactus.map.directionsDescription") || "We're located in the heart of Addis Ababa, easily accessible by public transport."}
                  </Text>
                </div>
                <Button
                  variant="outline"
                  color="blue"
                  radius="md"
                  leftIcon={<IconExternalLink size={16} />}
                  onClick={() => window.open("https://maps.google.com/?q=Addis+Ababa+Ethiopia", "_blank")}
                >
                  {t("contactus.map.openDirections") || "Open in Google Maps"}
                </Button>
              </div>
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
  <div className="flex items-start group">
    <ThemeIcon
      size={50}
      radius="lg"
      color="blue"
      variant="light"
      className="mr-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100"
    >
      {icon}
    </ThemeIcon>
    <div className="flex-1">
      <Text className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
        {title}
      </Text>
      {Array.isArray(content) ? (
        <div className="space-y-1">
          {content.map((item, i) => (
            <Text 
              key={i} 
              className="text-gray-700 transition-colors group-hover:text-gray-900"
            >
              {item}
            </Text>
          ))}
        </div>
      ) : (
        <Text className="text-gray-700 transition-colors group-hover:text-gray-900">
          {content}
        </Text>
      )}
    </div>
  </div>
);

export default ContactUsPage;