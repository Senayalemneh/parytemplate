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
import Logo from "../../assets/logo.jpg";
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Color variables
  const colors = {
    oceanBlue: "#0275b2",
    navyBlue: "#112f77",
    teal: "#046d74",
    yellow: "#f9db12",
    white: "#ffffff",
    black: "#000000",
  };

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Navigation items - responsive versions
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
      setIsScrolled(currentScrollY > 10);
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
      <Box className="fixed top-0 left-0 right-0 z-[9999] w-full">
        <Box
          className={`
            shadow-lg transition-all duration-300 
            ${isScrolled ? 'shadow-xl py-0 backdrop-blur-md' : 'py-0'}
            ${isMobile ? 'h-14' : isTablet ? 'h-16' : 'h-20'}
          `}
          style={{
            background: `linear-gradient(135deg, ${colors.navyBlue} 0%, ${colors.oceanBlue} 50%, ${colors.teal} 100%)`,
            borderBottom: isScrolled ? `2px solid ${colors.yellow}` : `2px solid transparent`,
          }}
        >
          <Box className="max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 h-full">
            <Box className="flex justify-between items-center h-full">
              
              {/* Logo and Brand Name - Responsive */}
              <Box
                className="flex items-center gap-1 sm:gap-2 md:gap-3 cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => navigate("/home")}
              >
                <Avatar
                  src={Logo}
                  alt={t("logo.alt")}
                  radius="xl"
                  size={isMobile ? "sm" : isTablet ? "md" : "lg"}
                  className="border-2 shadow-lg"
                  style={{ borderColor: colors.yellow }}
                />
                <Text className={`
                  font-extrabold tracking-tight drop-shadow-md
                  ${isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-lg'}
                `}
                style={{ color: colors.white }}
                >
                  {t("logo.title")}
                </Text>
              </Box>

              {/* Desktop Navigation Links - Hidden on mobile */}
              <Box className="hidden lg:flex items-center gap-1 xl:gap-2">
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
                          className={`
                            px-2 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold 
                            rounded-lg transition-all duration-300
                            hover:bg-white/20 backdrop-blur-sm
                            ${isActive(item.route) ||
                              item.subItems.some((sub) => isActive(sub.route))
                              ? "font-bold bg-white/30 border-b-2 shadow-lg"
                              : ""
                            }
                          `}
                          style={{
                            color: colors.white,
                            borderColor: isActive(item.route) || item.subItems.some((sub) => isActive(sub.route)) ? colors.yellow : 'transparent'
                          }}
                          rightIcon={<IconChevronDown size={isMobile ? 12 : 16} color={colors.white} />}
                        >
                          {isMobile ? item.label.substring(0, 10) + "..." : item.label}
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown 
                        className="rounded-lg shadow-2xl border"
                        style={{ 
                          backgroundColor: colors.navyBlue,
                          borderColor: colors.yellow
                        }}
                      >
                        {item.subItems.map((subItem) => (
                          <Menu.Item
                            key={subItem.route}
                            component={Link}
                            to={getRoute(subItem.route)}
                            className={`
                              block px-3 py-2 text-xs xl:text-sm 
                              rounded transition-colors duration-200
                              hover:bg-teal-600
                              ${isActive(subItem.route)
                                ? "font-semibold"
                                : ""
                              }
                            `}
                            style={{
                              color: colors.white,
                              backgroundColor: isActive(subItem.route) ? colors.teal : 'transparent'
                            }}
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
                      className={`
                        px-2 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold 
                        rounded-lg transition-all duration-300
                        hover:bg-white/20 backdrop-blur-sm
                        ${isActive(item.route)
                          ? "font-bold bg-white/30 border-b-2 shadow-lg"
                          : ""
                        }
                      `}
                      style={{
                        color: colors.white,
                        borderColor: isActive(item.route) ? colors.yellow : 'transparent'
                      }}
                    >
                      {isMobile ? item.label.substring(0, 10) + "..." : item.label}
                    </Button>
                  )
                )}
              </Box>

              {/* Tablet Navigation - Reduced menu */}
              <Box className="hidden md:flex lg:hidden items-center gap-1">
                {navItems.slice(0, 4).map((item) => (
                  <Button
                    key={item.route}
                    component={Link}
                    to={getRoute(item.route)}
                    variant="subtle"
                    className={`
                      px-2 py-1 text-xs font-semibold 
                      rounded transition-all duration-300
                      hover:bg-white/20 backdrop-blur-sm
                      ${isActive(item.route)
                        ? "font-bold bg-white/30 border-b-2"
                        : ""
                      }
                    `}
                    style={{
                      color: colors.white,
                      borderColor: isActive(item.route) ? colors.yellow : 'transparent'
                    }}
                  >
                    {item.label.substring(0, 8)}...
                  </Button>
                ))}
                <Menu position="bottom" withArrow>
                  <Menu.Target>
                    <Button
                      variant="subtle"
                      className="px-2 py-1 text-xs font-semibold rounded hover:bg-white/20 backdrop-blur-sm"
                      style={{ color: colors.white }}
                      rightIcon={<IconChevronDown size={12} color={colors.white} />}
                    >
                      More
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown 
                    className="rounded-lg shadow-2xl border"
                    style={{ 
                      backgroundColor: colors.navyBlue,
                      borderColor: colors.yellow
                    }}
                  >
                    {navItems.slice(4).map((item) => (
                      <Menu.Item
                        key={item.route}
                        component={Link}
                        to={getRoute(item.route)}
                        className="text-xs rounded transition-colors duration-200 hover:bg-teal-600"
                        style={{ color: colors.white }}
                      >
                        {item.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </Box>

              {/* Right Side Actions */}
              <Box className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {/* Notification Bell */}
                {session && (
                  <Popover
                    width={isMobile ? 300 : isTablet ? 350 : 400}
                    position="bottom-end"
                    withArrow
                    shadow="xl"
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
                        size={isMobile ? 16 : 20}
                        disabled={unreadCount === 0}
                        color={colors.yellow}
                        withBorder
                        offset={4}
                      >
                        <ActionIcon
                          variant="filled"
                          size={isMobile ? "md" : "lg"}
                          radius="xl"
                          onClick={() => setNotificationsOpened((o) => !o)}
                          style={{ 
                            backgroundColor: colors.white,
                            color: colors.oceanBlue
                          }}
                          className="hover:scale-110 transition-transform duration-200 shadow-lg"
                        >
                          <IconBell size={isMobile ? 18 : 24} stroke={1.5} />
                        </ActionIcon>
                      </Indicator>
                    </Popover.Target>
                    <Popover.Dropdown 
                      className="rounded-lg shadow-2xl border"
                      style={{ 
                        backgroundColor: colors.navyBlue,
                        borderColor: colors.yellow
                      }}
                    >
                      <Box className="p-2 sm:p-3 md:p-4">
                        <Box className="flex justify-between items-center mb-2">
                          <Text
                            size={isMobile ? "sm" : "md"}
                            weight={700}
                            style={{ color: colors.white }}
                          >
                            {t("notifications")}
                          </Text>
                          <Box className="flex items-center gap-1">
                            {unreadCount > 0 && (
                              <Badge
                                style={{ 
                                  backgroundColor: colors.yellow,
                                  color: colors.navyBlue
                                }}
                                variant="filled"
                                size={isMobile ? "xs" : "sm"}
                                radius="sm"
                              >
                                {unreadCount} {t("notifications.new")}
                              </Badge>
                            )}
                            <CloseButton
                              size={isMobile ? "xs" : "sm"}
                              onClick={() => setNotificationsOpened(false)}
                              aria-label={t("notifications.close")}
                              color={colors.white}
                            />
                          </Box>
                        </Box>
                      </Box>

                      <Divider style={{ borderColor: colors.yellow }} />

                      <ScrollArea.Autosize mah={300} type="auto">
                        {notifications.length === 0 ? (
                          <Box className="p-3 sm:p-4 text-center">
                            <IconBell size={isMobile ? 30 : 40} color={colors.yellow} stroke={1} />
                            <Text size={isMobile ? "xs" : "sm"} mt="sm" style={{ color: colors.white }}>
                              {t("notifications.empty")}
                            </Text>
                          </Box>
                        ) : (
                          <List spacing={0} className="p-0">
                            {notifications.map((notification) => (
                              <List.Item
                                key={notification.id}
                                className={`
                                  p-2 sm:p-3 rounded-lg transition-colors duration-200
                                  hover:bg-oceanBlue/30
                                `}
                                style={{
                                  backgroundColor: notification.read_status === 0 
                                    ? 'rgba(2, 117, 178, 0.2)' 
                                    : 'transparent'
                                }}
                              >
                                <Box className="flex justify-between items-start gap-2 w-full">
                                  <Box className="flex-1 overflow-hidden">
                                    <Box className="flex items-center gap-1 mb-0.5">
                                      <Text
                                        size={isMobile ? "xs" : "sm"}
                                        weight={600}
                                        className="truncate"
                                        style={{ color: colors.white }}
                                      >
                                        {notification.title}
                                      </Text>
                                      {notification.read_status === 0 && (
                                        <Badge
                                          size="xs"
                                          style={{ backgroundColor: colors.yellow }}
                                          variant="dot"
                                        />
                                      )}
                                    </Box>
                                    <Text
                                      size={isMobile ? "xxs" : "xs"}
                                      className="line-clamp-2 mb-0.5"
                                      style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                    >
                                      {notification.message}
                                    </Text>
                                    <Text size={isMobile ? "xxs" : "xs"} style={{ color: colors.yellow }}>
                                      {formatDistanceToNow(
                                        new Date(notification.created_at),
                                        { addSuffix: true }
                                      )}
                                    </Text>
                                  </Box>
                                  {notification.read_status === 0 && (
                                    <ActionIcon
                                      size={isMobile ? "xs" : "sm"}
                                      variant="subtle"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                      }}
                                      className="self-center"
                                      style={{ color: colors.yellow }}
                                    >
                                      <IconCheck size={isMobile ? 12 : 16} />
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
                          <Divider style={{ borderColor: colors.yellow }} />
                          <Box className="p-2 text-center">
                            <Button
                              variant="filled"
                              size={isMobile ? "xs" : "sm"}
                              onClick={handleMarkAllAsRead}
                              disabled={unreadCount === 0}
                              style={{
                                backgroundColor: colors.teal,
                                color: colors.white
                              }}
                              className="hover:opacity-90 transition-opacity duration-200"
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
                        <IconLanguage 
                          size={isMobile ? 16 : 20} 
                          color={colors.yellow}
                        />
                      }
                      className={`
                        rounded-lg transition-all duration-200
                        ${isMobile ? 'px-1' : 'px-2'}
                        hover:bg-white/20 backdrop-blur-sm
                      `}
                      style={{ color: colors.white }}
                      size={isMobile ? "xs" : "sm"}
                      compact
                    >
                      {!isMobile && (
                        <>
                          {languages.find((lang) => lang.code === i18n.language)
                            ?.flag || "🌐"}{" "}
                          {languages.find((lang) => lang.code === i18n.language)
                            ?.label?.substring(0, 3) || "ENG"}
                        </>
                      )}
                      {isMobile && (
                        languages.find((lang) => lang.code === i18n.language)
                          ?.flag || "🌐"
                      )}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown 
                    className="rounded-lg shadow-2xl border"
                    style={{ 
                      backgroundColor: colors.navyBlue,
                      borderColor: colors.yellow
                    }}
                  >
                    {languages.map((lang) => (
                      <Menu.Item
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="rounded transition-colors duration-200 hover:bg-teal-600"
                        style={{ color: colors.white }}
                        icon={<Text size="lg">{lang.flag}</Text>}
                      >
                        {lang.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>

                {/* Auth Buttons */}
                <Box className="hidden sm:flex items-center gap-1 md:gap-2">
                  {session ? (
                    <>
                      <Button
                        variant="filled"
                        className={`
                          transition-all duration-200 shadow-lg
                          ${isMobile ? 'px-2 text-xs' : 'px-3 text-sm'}
                          hover:scale-105
                        `}
                        onClick={handleDashboardClick}
                        leftIcon={<IconDashboard size={isMobile ? 14 : 18} />}
                        size={isMobile ? "xs" : "sm"}
                        radius="md"
                        style={{
                          background: `linear-gradient(135deg, ${colors.yellow}, #ffde59)`,
                          color: colors.navyBlue
                        }}
                      >
                        {!isMobile && t("auth.dashboard")}
                        {isMobile && "Dashboard"}
                      </Button>
                      <Button
                        variant="filled"
                        className={`
                          transition-all duration-200 shadow-lg
                          ${isMobile ? 'px-2 text-xs' : 'px-3 text-sm'}
                          hover:scale-105
                        `}
                        onClick={handleLogout}
                        leftIcon={<IconLogout size={isMobile ? 14 : 18} />}
                        size={isMobile ? "xs" : "sm"}
                        radius="md"
                        style={{
                          background: `linear-gradient(135deg, ${colors.teal}, #058e8b)`,
                          color: colors.white
                        }}
                      >
                        {!isMobile && t("auth.logOut")}
                        {isMobile && "Logout"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className={`
                          transition-all duration-200
                          ${isMobile ? 'px-2 text-xs' : 'px-3 text-sm'}
                          hover:bg-white/20 hover:text-white
                        `}
                        onClick={handleSignInClick}
                        leftIcon={<IconLogin size={isMobile ? 14 : 18} />}
                        size={isMobile ? "xs" : "sm"}
                        radius="md"
                        style={{
                          borderColor: colors.yellow,
                          color: colors.yellow
                        }}
                      >
                        {!isMobile && t("auth.signIn")}
                        {isMobile && "Login"}
                      </Button>
                      <Button
                        variant="filled"
                        className={`
                          transition-all duration-200 shadow-lg
                          ${isMobile ? 'px-2 text-xs' : 'px-3 text-sm'}
                          hover:scale-105
                        `}
                        onClick={handleSignUpClick}
                        leftIcon={<IconUserPlus size={isMobile ? 14 : 18} />}
                        size={isMobile ? "xs" : "sm"}
                        radius="md"
                        style={{
                          background: `linear-gradient(135deg, ${colors.oceanBlue}, ${colors.navyBlue})`,
                          color: colors.white
                        }}
                      >
                        {!isMobile && t("auth.signUp")}
                        {isMobile && "Sign Up"}
                      </Button>
                    </>
                  )}
                </Box>

                {/* Mobile Auth Buttons (icons only) */}
                <Box className="flex sm:hidden items-center gap-1">
                  {session ? (
                    <>
                      <ActionIcon
                        variant="filled"
                        onClick={handleDashboardClick}
                        size={isMobile ? "md" : "lg"}
                        style={{
                          background: `linear-gradient(135deg, ${colors.yellow}, #ffde59)`,
                          color: colors.navyBlue
                        }}
                        className="hover:scale-110 transition-transform duration-200 shadow-lg"
                      >
                        <IconDashboard size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="filled"
                        onClick={handleLogout}
                        size={isMobile ? "md" : "lg"}
                        style={{
                          background: `linear-gradient(135deg, ${colors.teal}, #058e8b)`,
                          color: colors.white
                        }}
                        className="hover:scale-110 transition-transform duration-200 shadow-lg"
                      >
                        <IconLogout size={18} />
                      </ActionIcon>
                    </>
                  ) : (
                    <>
                      <ActionIcon
                        variant="outline"
                        onClick={handleSignInClick}
                        size={isMobile ? "md" : "lg"}
                        style={{
                          borderColor: colors.yellow,
                          color: colors.yellow
                        }}
                        className="hover:bg-yellow/20 transition-colors duration-200"
                      >
                        <IconLogin size={18} />
                      </ActionIcon>
                    </>
                  )}
                </Box>

                {/* Mobile Menu Button */}
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  className="md:hidden"
                  color={colors.yellow}
                  size={isMobile ? "sm" : "md"}
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
        size={isMobile ? 280 : 320}
        position="right"
        overlayProps={{ opacity: 0.7, color: colors.navyBlue }}
        transitionProps={{ transition: "slide-left", duration: 300 }}
        className="md:hidden"
        withCloseButton={false}
        zIndex={10000}
        styles={{
          content: {
            background: `linear-gradient(180deg, ${colors.navyBlue} 0%, ${colors.oceanBlue} 50%, ${colors.teal} 100%)`,
            boxShadow: `0 4px 20px ${colors.yellow}40`,
            borderLeft: `3px solid ${colors.yellow}`,
          },
        }}
      >
        <Box className="flex flex-col h-full">
          {/* Drawer Header */}
          <Box 
            className="p-4 border-b"
            style={{ 
              borderColor: colors.yellow,
            }}
          >
            <Box className="flex justify-between items-center">
              <Text size="xl" weight={700} style={{ color: colors.white }}>
                {t("mobileMenu.title")}
              </Text>
              <ActionIcon
                onClick={() => setOpened(false)}
                size="xl"
                variant="transparent"
                color={colors.yellow}
              >
                <IconX size={24} />
              </ActionIcon>
            </Box>
          </Box>

          {/* Drawer Body */}
          <Box className="flex-1 p-4 overflow-y-auto">
            <Stack spacing={2}>
              {navItems.map((item) =>
                item.subItems ? (
                  <Box key={item.route}>
                    <Box
                      className={`
                        block px-4 py-3 text-base sm:text-lg 
                        rounded-lg transition-all duration-200 cursor-pointer
                        hover:bg-white/20
                        ${isActive(item.route) ||
                          item.subItems.some((sub) => isActive(sub.route))
                          ? "font-semibold bg-white/30 border-l-4"
                          : ""
                        }
                      `}
                      style={{
                        color: colors.white,
                        backgroundColor: isActive(item.route) || item.subItems.some((sub) => isActive(sub.route))
                          ? 'rgba(255, 255, 255, 0.3)'
                          : 'transparent',
                        borderLeftColor: isActive(item.route) || item.subItems.some((sub) => isActive(sub.route))
                          ? colors.yellow
                          : 'transparent'
                      }}
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
                        <Text className="font-medium">{item.label}</Text>
                        {item.route === "management" ? (
                          mobileManagementOpen ? (
                            <IconChevronUp
                              size={16}
                              color={colors.yellow}
                            />
                          ) : (
                            <IconChevronDown
                              size={16}
                              color={colors.yellow}
                            />
                          )
                        ) : item.route === "announcement" ? (
                          mobileAnnouncementOpen ? (
                            <IconChevronUp
                              size={16}
                              color={colors.yellow}
                            />
                          ) : (
                            <IconChevronDown
                              size={16}
                              color={colors.yellow}
                            />
                          )
                        ) : mobileServicesOpen ? (
                          <IconChevronUp
                            size={16}
                            color={colors.yellow}
                          />
                        ) : (
                          <IconChevronDown
                            size={16}
                            color={colors.yellow}
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
                      <Stack spacing={1} className="mt-1">
                        {item.subItems.map((subItem) => (
                          <Anchor
                            key={subItem.route}
                            component={Link}
                            to={getRoute(subItem.route)}
                            className={`
                              block px-4 py-2 pl-8 text-sm sm:text-base 
                              rounded-lg transition-all duration-200
                              hover:bg-teal-700
                              ${isActive(subItem.route)
                                ? "font-semibold border-l-4"
                                : ""
                              }
                            `}
                            style={{
                              color: colors.white,
                              backgroundColor: isActive(subItem.route)
                                ? colors.teal
                                : 'transparent',
                              borderLeftColor: isActive(subItem.route)
                                ? colors.yellow
                                : 'transparent'
                            }}
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
                    className={`
                      block px-4 py-3 text-base sm:text-lg 
                      rounded-lg transition-all duration-200
                      hover:bg-white/20
                      ${isActive(item.route)
                        ? "font-semibold bg-white/30 border-l-4"
                        : ""
                      }
                    `}
                    style={{
                      color: colors.white,
                      backgroundColor: isActive(item.route)
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'transparent',
                      borderLeftColor: isActive(item.route)
                        ? colors.yellow
                        : 'transparent'
                    }}
                    onClick={() => setOpened(false)}
                  >
                    {item.label}
                  </Anchor>
                )
              )}
            </Stack>
          </Box>

          {/* Drawer Footer */}
          <Box 
            className="p-4 border-t"
            style={{ 
              borderColor: colors.yellow,
            }}
          >
            <Stack spacing="md">
              {/* Language Switcher */}
              <Menu position="top" withinPortal>
                <Menu.Target>
                  <Button
                    variant="subtle"
                    leftIcon={<IconLanguage size={20} color={colors.yellow} />}
                    className="w-full rounded-lg hover:bg-white/20"
                    style={{ color: colors.white }}
                    size="md"
                  >
                    {languages.find((lang) => lang.code === i18n.language)
                      ?.flag || "🌐"}{" "}
                    {languages.find((lang) => lang.code === i18n.language)
                      ?.label || t("language.english")}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown 
                  className="rounded-lg shadow-2xl border"
                  style={{ 
                    backgroundColor: colors.navyBlue,
                    borderColor: colors.yellow
                  }}
                >
                  {languages.map((lang) => (
                    <Menu.Item
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="rounded transition-colors duration-200 hover:bg-teal-600"
                      style={{ color: colors.white }}
                      icon={<Text size="lg">{lang.flag}</Text>}
                    >
                      {lang.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              {/* Notifications */}
              {session && (
                <Button
                  variant="subtle"
                  leftIcon={<IconBell size={20} color={colors.yellow} />}
                  rightIcon={
                    unreadCount > 0 && (
                      <Badge size="sm" variant="filled" style={{ 
                        backgroundColor: colors.yellow,
                        color: colors.navyBlue
                      }}>
                        {unreadCount}
                      </Badge>
                    )
                  }
                  className="w-full rounded-lg hover:bg-white/20"
                  style={{ color: colors.white }}
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
                    className="w-full hover:opacity-90 transition-opacity duration-200 shadow-lg"
                    onClick={handleDashboardClick}
                    leftIcon={<IconDashboard />}
                    size="md"
                    radius="md"
                    style={{
                      background: `linear-gradient(135deg, ${colors.yellow}, #ffde59)`,
                      color: colors.navyBlue
                    }}
                  >
                    {t("auth.dashboard")}
                  </Button>
                  <Button
                    variant="filled"
                    className="w-full hover:opacity-90 transition-opacity duration-200 shadow-lg"
                    onClick={handleLogout}
                    leftIcon={<IconLogout />}
                    size="md"
                    radius="md"
                    style={{
                      background: `linear-gradient(135deg, ${colors.teal}, #058e8b)`,
                      color: colors.white
                    }}
                  >
                    {t("auth.logOut")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-white/20 hover:text-white transition-colors duration-200"
                    onClick={handleSignInClick}
                    leftIcon={<IconLogin />}
                    size="md"
                    radius="md"
                    style={{
                      borderColor: colors.yellow,
                      color: colors.yellow
                    }}
                  >
                    {t("auth.signIn")}
                  </Button>
                  <Button
                    variant="filled"
                    className="w-full hover:opacity-90 transition-opacity duration-200 shadow-lg"
                    onClick={handleSignUpClick}
                    leftIcon={<IconUserPlus />}
                    size="md"
                    radius="md"
                    style={{
                      background: `linear-gradient(135deg, ${colors.oceanBlue}, ${colors.navyBlue})`,
                      color: colors.white
                    }}
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