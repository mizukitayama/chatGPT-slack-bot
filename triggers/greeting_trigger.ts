import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerEventTypes, TriggerTypes } from "deno-slack-api/mod.ts";
import GreetingWorkflow from "../workflows/greeting_workflow.ts";
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { PopulatedArray } from "deno-slack-api/type-helpers.ts";

const env = await load();
const channel_ids_from_env = env["CHANNEL_IDS"]
const channel_ids: PopulatedArray<string> = channel_ids_from_env.split(" ") as PopulatedArray<string>
console.log(channel_ids)
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const greetingTrigger: Trigger<typeof GreetingWorkflow.definition> = {
  type: TriggerTypes.Event,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    channel_ids
  },
  name: "Sample event trigger",
  description: "A sample event trigger",
  workflow: `#/workflows/${GreetingWorkflow.definition.callback_id}`,
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

export default greetingTrigger;
