import { Center, Container, Stack, Text } from "@mantine/core";
import loaderLottieFile from "../../lotties/error-page.json";
import Lottie from "react-lottie";
const ErrorPage = ({ message }: { message?: string }) => {
  const loaderLottie = {
    loop: true,
    autoplay: true,
    animationData: loaderLottieFile,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <Container fluid className="h-screen">
      <Center className="h-full">
        <Stack justify="center" align="center">
          <Lottie options={loaderLottie} height={200} width={400} />
          <Text size={"md"} color="red">
            {message ? message : "Page Not Found!"}
          </Text>
        </Stack>
      </Center>
    </Container>
  );
};

export default ErrorPage;
