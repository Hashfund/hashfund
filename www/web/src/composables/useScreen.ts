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
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
