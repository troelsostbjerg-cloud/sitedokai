import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// I cloud-containeren bruger vi den forudinstallerede Chromium. Lokalt: slet linjen,
// så henter Remotion selv sin browser.
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
