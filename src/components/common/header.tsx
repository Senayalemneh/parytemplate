import {
  Box,
  Group,
  Text,
  Button,
  Burger,
  Drawer,
  Stack,
  Avatar,
  CloseButton,
  Anchor,
  Menu,
  Collapse,
  Indicator,
  ActionIcon,
  Popover,
  Badge,
  ScrollArea,
  Divider,
  List,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCheck,
  IconBell,
  IconX,
  IconLanguage,
  IconDashboard,
  IconLogin,
  IconLogout,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/BoleLogo.png"; // Ensure this path is correct
import { useTranslation } from "react-i18next";
import { useSession } from "../../context/session-provider";
import { ROLE_ENUM } from "../../enums/main";
import { markAsRead, getUserNotifications } from "../../services/api/main";

export default function Layout() {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [mobileManagementOpen, setMobileManagementOpen] = useState(false);
  const [mobileAnnouncementOpen, setMobileAnnouncementOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, setSession } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpened, setNotificationsOpened] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const roleKey = session?.role;

  // Navigation items
  const navItems = [
    { label: t("nav.home"), route: "home" },
    { label: t("nav.news"), route: "news" },
    { label: t("nav.headsofgovernment"), route: "headsofgovernment" },
    { label: t("nav.about"), route: "about" },

    {
      label: t("nav.management"),
      route: "management",
      subItems: [
        { label: t("nav.managementTeam"), route: "management/management-team" },
        {
          label: t("nav.organizationalStructure"),
          route: "management/management-offices",
        },
        { label: t("nav.woredas"), route: "management/management-woredas" },
      ],
    },
    {
      label: t("nav.services"),
      route: "services",
      subItems: [
        { label: t("nav.gallery"), route: "gallery" },
        { label: t("nav.video"), route: "video" },
        { label: t("nav.bookStore"), route: "bookstore" },
        { label: t("nav.contact"), route: "contact" },
        { label: t("nav.compliant"), route: "compliant" },
        { label: t("nav.checkCompliant"), route: "compliant/check-response" },

        { label: t("nav.FamilyDiscussion"), route: "auth/login" },
        { label: t("nav.Question and Answer"), route: "auth/login" },
        { label: t("nav.Tendency"), route: "auth/login" },
      ],
    },
    {
      label: t("nav.announcement"),
      route: "announcement",
      subItems: [
        { label: t("nav.announcements"), route: "announcement/announcements" },
        { label: t("nav.tenders"), route: "announcement/tender" },
        { label: t("nav.events"), route: "announcement/event" },
      ],
    },
  ];

  const languages = [
    { code: "en", label: t("language.english"), flag: "🇬🇧" },
    { code: "am", label: t("language.amharic"), flag: "🇪🇹" },
    // { code: "or", label: t("language.oromo"), flag: "🇪🇹" },
  ];

  const getRoute = (route) => `/${route}`;
  const isActive = (route) => location.pathname === getRoute(route);

  const handleSignInClick = () => {
    navigate("/auth/login");
    setOpened(false);
  };

  const handleSignUpClick = () => {
    navigate("/auth/signup");
    setOpened(false);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setOpened(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setSession(null);
    navigate("/");
    setOpened(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpened(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          const response = await getUserNotifications(user.id);
          if (response && response) {
            setNotifications(response);
            const unread = response.filter((n) => n.read_status === 0).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [notificationsOpened]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_status: 1 } : n
        )
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => n.read_status === 0)
        .map((n) => n.id);

      if (unreadIds.length > 0) {
        await Promise.all(unreadIds.map((id) => markAsRead(id)));
        setNotifications((prev) => prev.map((n) => ({ ...n, read_status: 1 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <Box className="mb-[6vh]">
      {/* Main Navigation Bar */}
      <Box className="fixed top-0 z-50 w-full">
        <Box
          className={`bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-md transition-all duration-300 relative z-10 border-b-2 border-yellow-500 ${
            isScrolled ? "shadow-xl py-1" : "py-2"
          }`}
        >
          <Box className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <Box className="flex justify-between items-center h-16">
              {/* Logo and Brand Name */}
              <Box
                className="flex items-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => navigate("/home")}
              >
                <Avatar
                  src={Logo}
                  alt={t("logo.alt")}
                  radius="xl"
                  size="lg"
                  className="border-2 border-yellow-500"
                />
                <Text className="text-white text-lg sm:text-sm font-extrabold tracking-tight">
                  {t("logo.title")}
                </Text>
              </Box>

              {/* Desktop Navigation Links */}
              <Box className="hidden lg:flex items-center gap-2">
                {navItems.map((item) =>
                  item.subItems ? (
                    <Menu
                      key={item.route}
                      position="bottom"
                      withArrow
                      trigger="hover"
                      openDelay={100}
                      closeDelay={300}
                      withinPortal
                      transitionProps={{ transition: "scale-y", duration: 200 }}
                    >
                      <Menu.Target>
                        <Button
                          variant="subtle"
                          className={`px-4 py-2 text-sm font-semibold text-white hover:text-yellow-500 hover:bg-blue-800 rounded-lg transition-all duration-300 ${
                            isActive(item.route) ||
                            item.subItems.some((sub) => isActive(sub.route))
                              ? "text-yellow-500 font-bold bg-blue-800 border-b-2 border-yellow-500"
                              : ""
                          }`}
                          rightIcon={<IconChevronDown size={16} />}
                        >
                          {item.label}
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown className="bg-blue-900 border border-blue-700 rounded-lg shadow-lg">
                        {item.subItems.map((subItem) => (
                          <Menu.Item
                            key={subItem.route}
                            component={Link}
                            to={getRoute(subItem.route)}
                            className={`block px-4 py-2 text-sm text-white hover:bg-blue-800 hover:text-yellow-500 rounded transition-colors duration-200 ${
                              isActive(subItem.route)
                                ? "bg-blue-800 text-yellow-500 font-semibold"
                                : ""
                            }`}
                          >
                            {subItem.label}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  ) : (
                    <Button
                      key={item.route}
                      component={Link}
                      to={getRoute(item.route)}
                      variant="subtle"
                      className={`px-4 py-2 text-sm font-semibold text-white hover:text-yellow-500 hover:bg-blue-800 rounded-lg transition-all duration-300 ${
                        isActive(item.route)
                          ? "text-yellow-500 font-bold bg-blue-800 border-b-2 border-yellow-500"
                          : ""
                      }`}
                    >
                      {item.label}
                    </Button>
                  )
                )}
              </Box>

              {/* Right Side Actions */}
              <Box className="flex items-center gap-3">
                {/* Notification Bell */}
                {session && (
                  <Popover
                    width={400}
                    position="bottom-end"
                    withArrow
                    shadow="lg"
                    opened={notificationsOpened}
                    onChange={setNotificationsOpened}
                    withinPortal
                    transitionProps={{
                      transition: "scale-y",
                      duration: 200,
                    }}
                  >
                    <Popover.Target>
                      <Indicator
                        inline
                        label={unreadCount}
                        size={20}
                        disabled={unreadCount === 0}
                        color="red"
                        withBorder
                        offset={6}
                      >
                        <ActionIcon
                          variant="filled"
                          color="blue.8"
                          size="lg"
                          radius="xl"
                          onClick={() => setNotificationsOpened((o) => !o)}
                          className="bg-blue-700 hover:bg-blue-600 transition-colors duration-200"
                        >
                          <IconBell size={24} stroke={1.5} />
                        </ActionIcon>
                      </Indicator>
                    </Popover.Target>
                    <Popover.Dropdown className="bg-white rounded-lg shadow-xl border border-gray-200">
                      <Box className="p-4">
                        <Box className="flex justify-between items-center mb-3">
                          <Text
                            size="lg"
                            weight={700}
                            className="text-blue-900"
                          >
                            {t("notifications")}
                          </Text>
                          <Box className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <Badge
                                color="red"
                                variant="filled"
                                size="md"
                                radius="sm"
                              >
                                {unreadCount} {t("notifications.new")}
                              </Badge>
                            )}
                            <CloseButton
                              size="sm"
                              onClick={() => setNotificationsOpened(false)}
                              aria-label={t("notifications.close")}
                            />
                          </Box>
                        </Box>
                      </Box>

                      <Divider className="border-gray-200" />

                      <ScrollArea.Autosize mah={400} type="auto">
                        {notifications.length === 0 ? (
                          <Box className="p-4 text-center">
                            <IconBell size={40} color="gray" stroke={1} />
                            <Text size="sm" color="dimmed" mt="sm">
                              {t("notifications.empty")}
                            </Text>
                          </Box>
                        ) : (
                          <List spacing={0} className="p-0">
                            {notifications.map((notification) => (
                              <List.Item
                                key={notification.id}
                                className={`p-3 rounded-lg ${
                                  notification.read_status === 0
                                    ? "bg-blue-50"
                                    : "bg-white"
                                } hover:bg-gray-100 transition-colors duration-200`}
                              >
                                <Box className="flex justify-between items-start gap-3 w-full">
                                  <Box className="flex-1 overflow-hidden">
                                    <Box className="flex items-center gap-1 mb-1">
                                      <Text
                                        size="sm"
                                        weight={600}
                                        className="truncate text-blue-900"
                                      >
                                        {notification.title}
                                      </Text>
                                      {notification.read_status === 0 && (
                                        <Badge
                                          size="xs"
                                          color="red"
                                          variant="dot"
                                        />
                                      )}
                                    </Box>
                                    <Text
                                      size="xs"
                                      color="dimmed"
                                      className="line-clamp-2 mb-1"
                                    >
                                      {notification.message}
                                    </Text>
                                    <Text size="xs" color="dimmed">
                                      {formatDistanceToNow(
                                        new Date(notification.created_at),
                                        { addSuffix: true }
                                      )}
                                    </Text>
                                  </Box>
                                  {notification.read_status === 0 && (
                                    <ActionIcon
                                      size="sm"
                                      variant="subtle"
                                      color="blue"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                      }}
                                      className="self-center"
                                    >
                                      <IconCheck size={16} />
                                    </ActionIcon>
                                  )}
                                </Box>
                              </List.Item>
                            ))}
                          </List>
                        )}
                      </ScrollArea.Autosize>

                      {notifications.length > 0 && (
                        <>
                          <Divider className="border-gray-200" />
                          <Box className="p-3 text-center">
                            <Button
                              variant="light"
                              size="sm"
                              color="blue"
                              onClick={handleMarkAllAsRead}
                              disabled={unreadCount === 0}
                              className="hover:bg-blue-100"
                            >
                              {t("notifications.markAllAsRead")}
                            </Button>
                          </Box>
                        </>
                      )}
                    </Popover.Dropdown>
                  </Popover>
                )}

                {/* Language Switcher */}
                <Menu
                  position="bottom-end"
                  withArrow
                  withinPortal
                  transitionProps={{ transition: "scale-y", duration: 200 }}
                >
                  <Menu.Target>
                    <Button
                      variant="subtle"
                      leftIcon={
                        <IconLanguage size={20} className="text-yellow-500" />
                      }
                      className="text-white hover:bg-blue-800 rounded-lg transition-colors duration-200"
                      size="sm"
                      compact
                    >
                      {languages.find((lang) => lang.code === i18n.language)
                        ?.flag || "🌐"}{" "}
                      {languages.find((lang) => lang.code === i18n.language)
                        ?.label || t("language.english")}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown className="bg-blue-900 border border-blue-700 rounded-lg shadow-lg">
                    {languages.map((lang) => (
                      <Menu.Item
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="text-white hover:bg-blue-800 hover:text-yellow-500 transition-colors duration-200"
                        icon={<Text size="lg">{lang.flag}</Text>}
                      >
                        {lang.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>

                {/* Auth Buttons */}
                <Box className="hidden sm:flex items-center gap-2">
                  {session ? (
                    <>
                      <Button
                        variant="filled"
                        className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 transition-all duration-200"
                        onClick={handleDashboardClick}
                        leftIcon={<IconDashboard size={18} />}
                        size="sm"
                        radius="md"
                      >
                        {t("auth.dashboard")}
                      </Button>
                      <Button
                        variant="filled"
                        className="bg-red-600 text-white hover:bg-red-500 transition-all duration-200"
                        onClick={handleLogout}
                        leftIcon={<IconLogout size={18} />}
                        size="sm"
                        radius="md"
                      >
                        {t("auth.logOut")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-blue-900 transition-all duration-200"
                        onClick={handleSignInClick}
                        leftIcon={<IconLogin size={18} />}
                        size="sm"
                        radius="md"
                      >
                        {t("auth.signIn")}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-blue-900 transition-all duration-200"
                        onClick={handleSignUpClick}
                        leftIcon={<IconUserPlus size={18} />}
                        size="sm"
                        radius="md"
                      >
                        {t("auth.signUp")}
                      </Button>
                    </>
                  )}
                </Box>

                {/* Mobile Menu Button */}
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  className="lg:hidden"
                  color="white"
                  size="sm"
                  aria-label={t("mobileMenu.title")}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        size={320}
        position="right"
        overlayProps={{ opacity: 0.5, color: theme.colors.blue[9] }}
        transitionProps={{ transition: "slide-left", duration: 300 }}
        className="lg:hidden"
        withCloseButton={false}
        zIndex={1000}
        styles={{
          content: {
            backgroundColor: theme.colors.blue[9],
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Box className="flex flex-col h-full">
          {/* Drawer Header */}
          <Box className="p-4 border-b border-blue-700 bg-gradient-to-b from-blue-800 to-blue-900">
            <Box className="flex justify-between items-center">
              <Text size="xl" weight={700} className="text-white">
                {t("mobileMenu.title")}
              </Text>
              <ActionIcon
                onClick={() => setOpened(false)}
                size="xl"
                variant="transparent"
                color="white"
              >
                <IconX size={24} />
              </ActionIcon>
            </Box>
          </Box>

          {/* Drawer Body */}
          <Box className="flex-1 p-4 overflow-y-auto">
            <Stack spacing={4}>
              {navItems.map((item) =>
                item.subItems ? (
                  <Box key={item.route}>
                    <Box
                      className={`block px-4 py-3 text-lg text-white rounded-lg hover:bg-blue-800 hover:text-yellow-500 transition-all duration-200 ${
                        isActive(item.route) ||
                        item.subItems.some((sub) => isActive(sub.route))
                          ? "bg-blue-800 text-yellow-500 font-semibold"
                          : ""
                      }`}
                      onClick={() => {
                        if (item.route === "management") {
                          setMobileManagementOpen(!mobileManagementOpen);
                        } else if (item.route === "announcement") {
                          setMobileAnnouncementOpen(!mobileAnnouncementOpen);
                        } else {
                          setMobileServicesOpen(!mobileServicesOpen);
                        }
                      }}
                    >
                      <Group position="apart">
                        <Text>{item.label}</Text>
                        {item.route === "management" ? (
                          mobileManagementOpen ? (
                            <IconChevronUp
                              size={16}
                              className="text-yellow-500"
                            />
                          ) : (
                            <IconChevronDown
                              size={16}
                              className="text-yellow-500"
                            />
                          )
                        ) : item.route === "announcement" ? (
                          mobileAnnouncementOpen ? (
                            <IconChevronUp
                              size={16}
                              className="text-yellow-500"
                            />
                          ) : (
                            <IconChevronDown
                              size={16}
                              className="text-yellow-500"
                            />
                          )
                        ) : mobileServicesOpen ? (
                          <IconChevronUp
                            size={16}
                            className="text-yellow-500"
                          />
                        ) : (
                          <IconChevronDown
                            size={16}
                            className="text-yellow-500"
                          />
                        )}
                      </Group>
                    </Box>
                    <Collapse
                      in={
                        item.route === "management"
                          ? mobileManagementOpen
                          : item.route === "announcement"
                          ? mobileAnnouncementOpen
                          : mobileServicesOpen
                      }
                      transitionDuration={200}
                    >
                      <Stack spacing={4} className="mt-1">
                        {item.subItems.map((subItem) => (
                          <Anchor
                            key={subItem.route}
                            component={Link}
                            to={getRoute(subItem.route)}
                            className={`block px-4 py-2 pl-12 text-base text-white rounded-lg hover:bg-blue-800 hover:text-yellow-500 transition-all duration-200 ${
                              isActive(subItem.route)
                                ? "bg-blue-800 text-yellow-500 font-semibold"
                                : ""
                            }`}
                            onClick={() => setOpened(false)}
                          >
                            {subItem.label}
                          </Anchor>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                ) : (
                  <Anchor
                    key={item.route}
                    component={Link}
                    to={getRoute(item.route)}
                    className={`block px-4 py-3 text-lg text-white rounded-lg hover:bg-blue-800 hover:text-yellow-500 transition-all duration-200 ${
                      isActive(item.route)
                        ? "bg-blue-800 text-yellow-500 font-semibold"
                        : ""
                    }`}
                    onClick={() => setOpened(false)}
                  >
                    {item.label}
                  </Anchor>
                )
              )}
            </Stack>
          </Box>

          {/* Drawer Footer */}
          <Box className="p-4 border-t border-blue-700 bg-gradient-to-t from-blue-800 to-blue-900">
            <Stack spacing="md">
              {/* Language Switcher */}
              {/* <Menu
                position="top"
                withinPortal
                transitionProps={{ transition: "scale-y", duration: 200 }}
              >
                <Menu.Target>
                  <Button
                    variant="subtle"
                    leftIcon={
                      <IconLanguage size={20} className="text-yellow-500" />
                    }
                    className="w-full text-white hover:bg-blue-800 rounded-lg"
                    size="md"
                  >
                    {languages.find((lang) => lang.code === i18n.language)
                      ?.flag || "🌐"}{" "}
                    {languages.find((lang) => lang.code === i18n.language)
                      ?.label || t("language.english")}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown className="bg-blue-900 border border-blue-700 rounded-lg shadow-lg">
                  {languages.map((lang) => (
                    <Menu.Item
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="text-white hover:bg-blue-800 hover:text-yellow-500 transition-colors duration-200"
                      icon={<Text size="lg">{lang.flag}</Text>}
                    >
                      {lang.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu> */}

              {/* Notifications */}
              {session && (
                <Button
                  variant="subtle"
                  leftIcon={<IconBell size={20} />}
                  rightIcon={
                    unreadCount > 0 && (
                      <Badge size="sm" variant="filled" color="red">
                        {unreadCount}
                      </Badge>
                    )
                  }
                  className="w-full text-white hover:bg-blue-800 rounded-lg"
                  size="md"
                  onClick={() => {
                    setNotificationsOpened(true);
                    setOpened(false);
                  }}
                >
                  {t("notifications")}
                </Button>
              )}

              {/* Auth Buttons */}
              {session ? (
                <>
                  <Button
                    variant="filled"
                    className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400 transition-all duration-200"
                    onClick={handleDashboardClick}
                    leftIcon={<IconDashboard />}
                    size="md"
                    radius="md"
                  >
                    {t("auth.dashboard")}
                  </Button>
                  <Button
                    variant="filled"
                    color="red"
                    onClick={handleLogout}
                    leftIcon={<IconLogout />}
                    className="w-full hover:bg-red-500 transition-all duration-200"
                    size="md"
                    radius="md"
                  >
                    {t("auth.logOut")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-blue-900 transition-all duration-200"
                    onClick={handleSignInClick}
                    leftIcon={<IconLogin />}
                    size="md"
                    radius="md"
                  >
                    {t("auth.signIn")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white hover:text-blue-900 transition-all duration-200"
                    onClick={handleSignUpClick}
                    leftIcon={<IconUserPlus />}
                    size="md"
                    radius="md"
                  >
                    {t("auth.signUp")}
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
