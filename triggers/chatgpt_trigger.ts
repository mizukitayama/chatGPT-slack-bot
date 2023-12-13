import { Trigger } from "deno-slack-sdk/types.ts";
import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import AskingChatGPTworkflow from "../workflows/asking_chatgpt_workflow.ts";
import { PopulatedArray } from "deno-slack-api/type-helpers.ts";
import env from "../utils/env.ts";

const channel_ids_from_env = await env("CHANNEL_IDS");
const channel_ids: PopulatedArray<string> = channel_ids_from_env?.split(" ") as PopulatedArray<string>;

console.log("Installing app to: ", channel_ids);

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */

const ChatgptTrigger: Trigger<typeof AskingChatGPTworkflow.definition> = {
  type: TriggerTypes.Event,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    channel_ids,
  },
  name: "ChatGPT bot mentioned trigger",
  description: "ChatGPT bot mentioned trigger",
  workflow: `#/workflows/${AskingChatGPTworkflow.definition.callback_id}`,
  inputs: {
    text: {
      value: TriggerContextData.Event.AppMentioned.text,
    },
    channel_id: {
      value: TriggerContextData.Event.AppMentioned.channel_id,
    },
    user_id: {
      value: TriggerContextData.Event.AppMentioned.user_id,
    },
    message_ts: {
      value: TriggerContextData.Event.AppMentioned.message_ts,
    },
  },
};

export default ChatgptTrigger;
