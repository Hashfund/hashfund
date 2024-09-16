import moment from "moment";

async function main() {
  console.log({
    from: moment().subtract(3, "days").toISOString(),
    to: moment().toISOString(),
    unit: "day",
  });

  // console.log(buildRange(moment().subtract(1, "days"),  moment(), "time"))
}

main().catch(console.log);
