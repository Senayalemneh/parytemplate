import { Center, Container, Stack, Text } from "@mantine/core";
import loaderLottieFile from "../../lotties/error-page.json";
import Lottie from "lottie-react";

const ErrorPage = ({ message }: { message?: string }) => {
  return (
    <Container fluid className="h-screen">
      <Center className="h-full">
        <Stack justify="center" align="center">
          <Lottie 
            animationData={loaderLottieFile} 
            loop={true}
            autoplay={true}
            style={{ height: 200, width: 400 }}
          />
          <Text size={"md"} color="red">
            {message ? message : "Page Not Found!"}
          </Text>
        </Stack>
      </Center>
    </Container>
  );
};

export default ErrorPage;
