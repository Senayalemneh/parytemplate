import { useState, useRef, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const JitsiMeetInternal = () => {
  const { t } = useTranslation();
  const [roomName, setRoomName] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Generate a random room name
  const generateRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const newRoom = `internal-${randomId}`;
    setGeneratedRoom(newRoom);
    setRoomName(newRoom);
  };

  // Handle joining a meeting
  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      setHasJoined(true);
      toast.success(t("videoconference.toasts.joinSuccess"));
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen && jitsiContainerRef.current) {
      jitsiContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    if (linkInputRef.current) {
      navigator.clipboard.writeText(linkInputRef.current.value);
      setCopied(true);
      toast.success(t("toasts.copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate meeting link
  const getMeetingLink = () => {
    return `https://meet.jit.si/${roomName}`;
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-blue-200">{t("videoconference.header.prefix")}</span>{" "}
              {t("videoconference.header.title")}
            </h1>
            {hasJoined && (
              <div className="hidden md:flex items-center space-x-2 bg-blue-800/70 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {t("videoconference.header.meetingActive")}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!hasJoined ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-200/70 backdrop-blur-sm bg-white/90">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {t("videoconference.joinForm.title")}
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                {t("videoconference.joinForm.subtitle")}
              </p>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-6">
              <div>
                <label
                  htmlFor="room"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("videoconference.joinForm.roomLabel")}
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="room"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder={t("joinForm.roomPlaceholder")}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomRoom}
                    className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center shadow-sm hover:shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("videoconference.joinForm.generateButton")}
                  </button>
                </div>
                {generatedRoom && (
                  <p className="mt-2 text-xs text-gray-500">
                    {t("videoconference.joinForm.generatedRoom")}:{" "}
                    <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {generatedRoom}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("videoconference.joinForm.joinButton")}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <h3 className="text-sm font-medium text-gray-800 mb-3">
                {t("videoconference.joinForm.featuresTitle")}
              </h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t("videoconference.joinForm.features.0")}</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t("videoconference.joinForm.features.1")}</span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mt-0.5 mr-2 text-blue-500 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t("videoconference.joinForm.features.2")}</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Meeting Info Bar */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-5 rounded-2xl shadow-lg border border-gray-200/50 backdrop-blur-sm bg-white/90">
              <div className="mb-3 md:mb-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("videoconference.meeting.meetingTitle")}:{" "}
                  <span className="font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {roomName}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {t("videoconference.meeting.shareInstructions")}
                </p>
              </div>

              {/* Meeting Link Sharing */}
              <div className="flex items-center w-full md:w-auto">
                <div className="relative flex-grow">
                  <input
                    ref={linkInputRef}
                    type="text"
                    value={getMeetingLink()}
                    readOnly
                    className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                  <button
                    onClick={copyMeetingLink}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-blue-600"
                  >
                    {copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={copyMeetingLink}
                  className="px-4 py-3 bg-blue-600 text-white text-sm rounded-r-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  {copied ? t("videoconference.meeting.copiedButton") : t("videoconference.meeting.copyButton")}
                </button>
              </div>
            </div>

            {/* Meeting Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow border border-gray-200/50 backdrop-blur-sm bg-white/90">
              <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{t("videoconference.meeting.connectedStatus")}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={toggleFullscreen}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center shadow-sm hover:shadow-md"
                >
                  {isFullscreen ? (
                    <>
                      <span className="mr-2">
                        {t("videoconference.meeting.exitFullscreen")}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 16h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3v-3a1 1 0 10-2 0v3H5a1 1 0 100 2zm7-13H9V0a1 1 0 10-2 0v3H4a1 1 0 100 2h3v3a1 1 0 102 0V5h3a1 1 0 100-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">{t("videoconference.meeting.fullscreen")}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setHasJoined(false);
                    toast(t("toasts.leaveMeeting"), { icon: "👋" });
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center shadow-sm hover:shadow-md"
                >
                  <span className="mr-2">{t("meeting.leaveButton")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Jitsi Meeting Container */}
            <div
              ref={jitsiContainerRef}
              className={`relative bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
                isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-[600px]"
              }`}
            >
              <iframe
                src={`https://meet.jit.si/${roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`}
                className="absolute inset-0 w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture"
                allowFullScreen
                title={t("videoconference.meeting.iframeTitle")}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>{t("videoconference.footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
};

export default JitsiMeetInternal;
