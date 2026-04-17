import { useState, useEffect } from "react";

function getWindowDimensions() {
  if (typeof window === "undefined") return;

  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useScreen() {
  const [windowDimensions, setWindowDimensions] = useState<{
    width: number;
    height: number;
  }>();

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
