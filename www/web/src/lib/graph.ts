import { ResolutionString } from "@hashfund/chart";

export const resolveResolution = (input: ResolutionString) => {
  const duration = input.split(/(\+d)/g).filter(Boolean).at(0)!;

  switch (duration) {
    case "1":
    case "5":
    case "15":
    case "30":
      return {
        duration,
        resolution: "minute",
      };
    default:
      return {
        duration,
        resolution: "hour",
      };
  }
};
