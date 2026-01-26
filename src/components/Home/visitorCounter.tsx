import React, { useState, useEffect } from "react";
import { countVisitor } from "../../services/api/main";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface VisitorResponse {
  today: number;
  this_month: number;
  all_time: number;
}

const VisitorBanner: React.FC = () => {
  const [visitorData, setVisitorData] = useState<VisitorResponse>({
    today: 0,
    this_month: 0,
    all_time: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const response = await countVisitor();
        setVisitorData(response);
        setIsLoading(false);
      } catch (err) {
        setError(t("counter.error"));
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchVisitorCount();
  }, [t]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm"
        role="alert"
      >
        <p className="font-bold">{t("counter.error_title")}</p>
        <p>{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white rounded-xl shadow-2xl mb-8 overflow-hidden relative"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white bg-opacity-10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Header Section */}
          <div className="flex items-center mb-6 md:mb-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mr-6 bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm"
            >
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold drop-shadow-md">
                {t("counter.title")}
              </h2>
              <p className="text-blue-100 font-medium">
                {t("counter.subtitle")}
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
            {/* Today's Visitors */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm border border-white border-opacity-20"
            >
              <p className="text-sm text-blue-100 mb-1 font-medium">
                {t("counter.today")}
              </p>
              {isLoading ? (
                <div className="w-24 h-8 bg-white bg-opacity-20 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold tracking-tight">
                  {visitorData.today?.toLocaleString()}
                  <span className="text-sm font-normal ml-1 opacity-80">
                    {t("counter.visits")}
                  </span>
                </p>
              )}
            </motion.div>

            {/* Monthly Visitors */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm border border-white border-opacity-20"
            >
              <p className="text-sm text-blue-100 mb-1 font-medium">
                {t("counter.this_month")}
              </p>
              {isLoading ? (
                <div className="w-24 h-8 bg-white bg-opacity-20 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold tracking-tight">
                  {visitorData.this_month?.toLocaleString()}
                  <span className="text-sm font-normal ml-1 opacity-80">
                    {t("counter.visits")}
                  </span>
                </p>
              )}
            </motion.div>

            {/* Total Visitors */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm border border-white border-opacity-20"
            >
              <p className="text-sm text-blue-100 mb-1 font-medium">
                {t("counter.all_time")}
              </p>
              {isLoading ? (
                <div className="w-24 h-8 bg-white bg-opacity-20 rounded-lg animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold tracking-tight">
                  {visitorData.all_time?.toLocaleString()}
                  <span className="text-sm font-normal ml-1 opacity-80">
                    {t("counter.visits")}
                  </span>
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VisitorBanner;