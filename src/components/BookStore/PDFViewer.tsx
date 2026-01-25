import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Center, Loader, Group, ActionIcon, Text, Paper } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconX,
} from "@tabler/icons-react";

// Set worker path from a reliable source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState(800);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth * 0.8);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setIsLoading(false);
    setError("Failed to load PDF. Please try again later.");
  }

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* PDF Controls */}
      <Paper p="sm" shadow="sm" withBorder style={{ marginBottom: 10 }}>
        <Group position="apart">
          <Group>
            <ActionIcon
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              variant="filled"
              color="blue"
              size="lg"
            >
              <IconChevronLeft size={18} />
            </ActionIcon>

            <Text size="sm" weight={500}>
              Page {pageNumber} of {numPages || "--"}
            </Text>

            <ActionIcon
              onClick={goToNextPage}
              disabled={!!numPages && pageNumber >= numPages}
              variant="filled"
              color="blue"
              size="lg"
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>

          <Group>
            <ActionIcon
              onClick={zoomOut}
              variant="light"
              color="blue"
              size="lg"
            >
              <IconZoomOut size={18} />
            </ActionIcon>
            <Text size="sm" weight={500}>
              {Math.round(scale * 100)}%
            </Text>
            <ActionIcon onClick={zoomIn} variant="light" color="blue" size="lg">
              <IconZoomIn size={18} />
            </ActionIcon>
          </Group>

          <ActionIcon onClick={onClose} variant="light" color="red" size="lg">
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Paper>

      {/* PDF Document */}
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {isLoading && (
          <Center
            style={{ height: "100%", position: "absolute", width: "100%" }}
          >
            <Loader size="xl" variant="dots" color="blue" />
          </Center>
        )}

        {error ? (
          <Center style={{ height: "100%" }}>
            <Text color="red">{error}</Text>
          </Center>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <Center style={{ height: "100%" }}>
                <Loader size="xl" variant="dots" />
              </Center>
            }
            error={
              <Center style={{ height: "100%" }}>
                <Text color="red">Failed to load PDF document</Text>
              </Center>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={width * scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <Center style={{ height: "100%" }}>
                  <Loader size="sm" variant="dots" />
                </Center>
              }
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
