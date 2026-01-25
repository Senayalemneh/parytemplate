import { Button, Container, Title, Text, Group, createStyles, rem } from '@mantine/core';
import { IconLock, IconArrowLeft } from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: theme.white,
    padding: theme.spacing.xl,
  },
  container: {
    position: 'relative',
    backgroundColor: 'rgba(26, 32, 44, 0.9)',
    borderRadius: theme.radius.xl,
    padding: `${theme.spacing.xl} ${theme.spacing.xl}`,
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${theme.colors.blue[7]}`,
    maxWidth: rem(600),
    textAlign: 'center',
    overflow: 'hidden',
  },
  icon: {
    color: theme.colors.red[6],
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: rem(42),
    fontWeight: 900,
    lineHeight: 1.2,
    marginBottom: theme.spacing.md,
    background: 'linear-gradient(45deg, #f72585 0%, #7209b7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  description: {
    fontSize: rem(20),
    color: theme.colors.gray[4],
    marginBottom: theme.spacing.xl,
  },
  button: {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.radius.md,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: rem(1),
    transition: 'all 0.3s ease',
    background: 'linear-gradient(45deg, #4361ee 0%, #3a0ca3 100%)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 20px rgba(67, 97, 238, 0.3)',
    },
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
  },
}));

const UnauthorizedPage = () => {
  const { classes } = useStyles();

  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.1,
    animationDelay: Math.random() * 5,
  }));

  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <div className={classes.particles}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={classes.particle}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                opacity: particle.opacity,
                animation: `float ${5 + particle.animationDelay}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>

        <IconLock size={64} className={classes.icon} strokeWidth={1.5} />
        <Title className={classes.title}>Access Denied</Title>
        <Text className={classes.description}>
          You don't have permission to access this page. Please contact your administrator or return
          to the homepage.
        </Text>

        <Group position="center">
          <Button
            leftIcon={<IconArrowLeft size={20} />}
            className={`${classes.button} hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
            size="lg"
            component="a"
            href="/"
          >
            Return Home
          </Button>
          <Button
            variant="outline"
            className="border-blue-400 text-blue-400 hover:bg-blue-900/20 hover:border-blue-300 hover:text-blue-300"
            size="lg"
            component="a"
            href="/contact"
          >
            Contact Support
          </Button>
        </Group>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UnauthorizedPage;