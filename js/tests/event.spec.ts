import { EventSchema } from "../src";
async function main() {
  const data = Buffer.from(
    "AvPwOMbY4HcH3VoRZDKHebf60PeBXEVsFpGLu/i+57pi0ybEyZ7DLZf2EvUhCRefsrclRUJWj7ZBqyP+fltkXEQZAAAAAAAAAAAoa+4AAAAACtFrZgAAAAA="
  );
  console.log(EventSchema.deserialize(data));
}

main();
