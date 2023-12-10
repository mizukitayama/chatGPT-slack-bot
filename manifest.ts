import { Manifest } from "deno-slack-sdk/mod.ts";
import GreetingWorkflow from "./workflows/asking_chatgpt_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "ChatGPT4",
  description:
    "This is ChatGPT bot. Mention me and I'll respond you.",
  icon: "assets/default_new_app_icon.png",
  workflows: [GreetingWorkflow],
  outgoingDomains: ['api.openai.com'],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "app_mentions:read",
  ],
});
