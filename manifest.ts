import { Manifest } from "deno-slack-sdk/mod.ts";
import AskingChatGPTworkflow from "./workflows/asking_chatgpt_workflow.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "ChatGPT4",
  description:
    "This is ChatGPT bot. Mention me and I'll respond you. In case I was not useful, edit your message and submit again.",
  icon: "assets/chatgpt_logo.png",
  workflows: [AskingChatGPTworkflow],
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
