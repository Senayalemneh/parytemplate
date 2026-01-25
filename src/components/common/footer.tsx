import { Box, Group, Text, Stack, createStyles } from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { Image } from "@mantine/core";
import Logo from "../../assets/BoleLogo.png";

const useStyles = createStyles((theme) => ({
  footer: {
    backgroundColor: theme.colors.blue[8],
    color: theme.white,
    padding: `${theme.spacing.xl * 2}px 0`,
  },
  footerLinks: {
    "& a": {
      color: theme.white,
      textDecoration: "none",
      transition: "color 0.2s ease",
      "&:hover": {
        color: theme.colors.yellow[5],
      },
    },
  },
  socialIcon: {
    color: theme.white,
    transition: "color 0.2s ease",
    "&:hover": {
      color: theme.colors.yellow[5],
    },
  },
  divider: {
    borderTop: `1px solid ${theme.colors.blue[7]}`,
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
}));

export default function Footer() {
  const { classes } = useStyles();

  return (
    <Box component="footer" className={classes.footer}>
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Group align="start" position="apart" className="flex-wrap gap-8">
          {/* Quick Links */}
          <Stack spacing="sm" className={`mb-8 md:mb-0 ${classes.footerLinks}`}>
            <Text className="text-lg font-bold mb-4">Quick Links</Text>
            <a href="/home">Home</a>
            <a href="about">About</a>
            <a href="news">News</a>
            <a href="contact">Contact</a>
            <a href="gallery">Gallery</a>
            <a href="compliant">Compliant</a>
            <a href="bookstore">Book Store</a>
          </Stack>

          {/* Social Media Links */}
          <Stack spacing="sm" className="mb-8 md:mb-0">
            <Text className="text-lg font-bold mb-4">Follow Us</Text>
            <Group spacing="sm">
              <a
                href="https://x.com/prosperity_bole?t=AfSid_ADa1Hf9ta88tzaGw&s=09"
                target="_blank"
                className={classes.socialIcon}
              >
                <IconBrandTwitter size={24} />
              </a>
              <a
                href="https://web.facebook.com/boleporsperity"
                target="_blank"
                className={classes.socialIcon}
              >
                <IconBrandFacebook size={24} />
              </a>
              <a
                href="https://www.youtube.com/@boleprosperity"
                target="_blank"
                className={classes.socialIcon}
              >
                <IconBrandYoutube size={24} />
              </a>
              <a
                href="https://web.facebook.com/boleporsperity"
                target="_blank"
                className={classes.socialIcon}
              >
                <IconBrandInstagram size={24} />
              </a>
              {/* <a href="#" target="_blank" className={classes.socialIcon}>
                <IconBrandLinkedin size={24} />
              </a> */}
            </Group>
          </Stack>

          {/* Logo Image */}
          <Stack spacing="sm" className="w-full md:w-auto flex justify-center">
            <Image src={Logo} alt="Company Logo" width={200} fit="contain" />
          </Stack>
        </Group>

        {/* Footer Bottom */}
        <Box className={classes.divider}>
          <Text className="text-sm text-center">
            &copy; {new Date().getFullYear()} Bole Subcity Prosperity.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
