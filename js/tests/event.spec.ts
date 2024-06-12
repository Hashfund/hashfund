import { PublicKey } from "@solana/web3.js";
import { Event } from "../src/event";

function main() {
  const data = Buffer.from(
    "AFIYgoYUD0Yd2M/5vio4H64JcpKHn4jSIY2VoHZfBg3N0AVqZgAAAAALAAAAaGFzaGZ1bmQgIzEEAAAASGFzaB8AAABodHRwczovL2hhc2hmdW5kLmlvL3B1YmxpYy5qc29ugk0uxiDlFrdVQkuVsuRhtf14DJbYWjhpmlU590yCABk=",
    "base64"
  );
  console.log(Event.deserialize(data));
}

main();
