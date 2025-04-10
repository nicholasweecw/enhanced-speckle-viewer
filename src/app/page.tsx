"use client";

import { useEffect, useRef, useState } from "react";
import {
  Viewer,
  DefaultViewerParams,
  SpeckleLoader,
  UrlHelper,
  ViewerEvent,
  LoaderEvent,
} from "@speckle/viewer";
import { CameraController, SelectionExtension } from "@speckle/viewer";
import MetadataSidebar from "@/components/MetadataSidebar";
import Loader from "@/components/Loader";
import { Metadata, MetadataSchema } from "@/app/formatMetadata";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the 3D container
  const [selectedMetadata, setSelectedMetadata] = useState<Metadata | null>(
    null
  );
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0); // Loading progress (0–100)

  const token = process.env.NEXT_PUBLIC_SPECKLE_TOKEN;

  const pinnedRef = useRef(isSidebarPinned); // Used to preserve pin state in click handler

  useEffect(() => {
    const initViewer = async () => {
      if (!containerRef.current) return;

      // Initialize Speckle viewer with default parameters
      const params = {
        ...DefaultViewerParams,
        showStats: false,
        verbose: true,
      };

      const viewer = new Viewer(containerRef.current, params);
      await viewer.init();

      // Add navigation and selection extensions
      viewer.createExtension(CameraController);
      viewer.createExtension(SelectionExtension);

      // Load model from Speckle stream
      const urls = await UrlHelper.getResourceUrls(
        "https://app.speckle.systems/projects/c832429e56/models/53793399af"
      );

      for (const url of urls) {
        const loader = new SpeckleLoader(viewer.getWorldTree(), url, token);

        // Track and update loading progress for UX
        loader.on(LoaderEvent.LoadProgress, (event) => {
          const progress = event.progress;
          setLoadProgress(progress);
        });

        await viewer.loadObject(loader, true);
      }

      // Hide spinner after model is fully loaded
      setIsLoading(false);

      // Listen for clicks on model objects
      viewer.on(ViewerEvent.ObjectClicked, (event) => {
        if (event?.hits && event?.hits.length > 0) {
          const node = event.hits[0].node;
          const parsed = MetadataSchema.safeParse(node.model.raw);
          if (parsed.success) {
            setSelectedMetadata(parsed.data); // Show sidebar with metadata
          }
        } else {
          // Hide sidebar if not pinned
          if (!pinnedRef.current) {
            setSelectedMetadata(null);
          }
        }
      });
    };

    initViewer();
  }, [token]);

  // Keep the pinned state updated in a ref
  useEffect(() => {
    pinnedRef.current = isSidebarPinned;
  }, [isSidebarPinned]);

  return (
    <>
      {/* Show loading spinner and progress while model is loading */}
      {isLoading && <Loader progress={loadProgress} />}

      {/* 3D Viewer Container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      />

      {/* Metadata Sidebar: visible only when a model component is selected */}
      {selectedMetadata && (
        <MetadataSidebar
          data={selectedMetadata}
          onClose={() => {
            setSelectedMetadata(null);
            setIsSidebarPinned(false); // Reset pin on close
          }}
          isPinned={isSidebarPinned}
          togglePin={() => setIsSidebarPinned(!isSidebarPinned)}
        />
      )}
    </>
  );
}
