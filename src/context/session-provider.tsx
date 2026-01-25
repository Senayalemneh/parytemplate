import { createContext, useContext, useEffect, useState } from "react";
import Loader from "../components/common/loader";
import { Container } from "@mantine/core";
import ErrorDisplay from "../components/common/error";
import { getUserById } from "../services/api/main";
const SessionContext = createContext<{
  session: any;
  setSession: (v: any) => void;
  isChecking: boolean;
  isErrorChecking: boolean;
  setRefetch: (v: boolean) => void;
  isUserEmployee: boolean;
}>({
  session: null,
  setSession: () => {},
  isChecking: true,
  isErrorChecking: false,
  setRefetch: () => {},
  isUserEmployee: false,
});
export const useSession = () => useContext(SessionContext);
const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isErrorChecking, setIsErrorChecking] = useState(false);
  const [refetch, setRefetch] = useState(true);
  const [isUserEmployee, setIsUserEmployee] = useState(false);
  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId"); //for users with no employee_id

    const getUserInfo = async () => {
      const userInfo = await getUserById(currentUserId);
      setIsChecking(false);
      setRefetch(false);
      if (userInfo?.error) {
        return setIsErrorChecking(true);
      }
      setIsUserEmployee(userInfo?.is_employee);
      setSession({ ...userInfo, role: userInfo?.role });
    };
    if (currentUserId && refetch) getUserInfo();
  }, [refetch]);

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        isChecking,
        setRefetch,
        isUserEmployee,
        isErrorChecking,
      }}
    >
      <Container fluid className="w-full p-0">
        {isChecking ? (
          <Loader />
        ) : isErrorChecking ? (
          <ErrorDisplay />
        ) : (
          children
        )}
      </Container>
    </SessionContext.Provider>
  );
};

export default SessionProvider;
