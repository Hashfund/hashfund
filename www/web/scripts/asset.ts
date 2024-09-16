import { readdirSync, lstatSync, readFileSync, writeFileSync } from "fs";

function getFileName(value: string) {
  const dirs = value.split("/");
  return dirs[dirs.length - 1].split(".")[0];
}

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}

function walk(folder: string) {
  let files: string[] = [];
  let dirs = readdirSync(folder);

  for (let dir of dirs) {
    if (dir.includes(".ts")) continue;

    dir = [folder, dir].join("/");
    if (lstatSync(dir).isDirectory()) files = files.concat(walk(dir));
    else files.push(dir);
  }

  return files;
}

function buildAssetComponents(folder: string) {
  return walk(folder).map((file) => {
    const template = readFileSync("./scripts/template.txt", "utf-8");

    let name = getFileName(file).split("_").map(capitalize).join("");
    let path = file.replace("./src/assets/", "./");
    return template.replaceAll("%name%", name).replace("%path%", path);
  });
}

writeFileSync(
  "./src/assets/index.tsx",
  `import Image from "next/image"; \n` +
    buildAssetComponents("./src/assets").join("\n")
);
