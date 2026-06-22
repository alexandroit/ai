import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./index.js", import.meta.url), "utf8");

if (!source.includes("requestFromExpress") || !source.includes("createStacklineAIHttpHandler")) {
  throw new Error("Express adapter must preserve the Fetch handler boundary.");
}

if (source.includes("express.json()")) {
  throw new Error("The Express example must not consume the body before the Stackline handler.");
}

console.log("Express adapter smoke passed.");
