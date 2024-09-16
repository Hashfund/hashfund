import { EventSchema } from "../src";
async function main() {
  const data = Buffer.from(
    "37VbE4VAtx554sf79M18jvMUGzJosRQbJ5wUdpyf32TfvwuJurrpMSjwyyCNi2dpsfu3F4tvbC9LyRrRxTVemQqv"
  );
  console.log(EventSchema.deserialize(data));
}

main();
