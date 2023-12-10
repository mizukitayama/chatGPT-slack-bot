import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GreetingFunctionDefinition } from "../functions/greeting_function.ts";
import { AddReactionDefinition } from "../functions/add_reaction.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const GreetingWorkflow = DefineWorkflow({
  callback_id: "greeting_workflow",
  title: "Send a greeting",
  description: "Send a greeting to channel",
  input_parameters: {
    properties: {
      text: {
        type: Schema.types.string,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      user_id: {
        type: Schema.slack.types.user_id,
      },
      message_ts: {
        type: Schema.slack.types.message_ts
      }
    },
    required: ["text", "channel_id", "user_id", "message_ts"],
  },
});

/**
 * For collecting input from users, we recommend the
 * built-in OpenForm function as a first step.
 * https://api.slack.com/automation/functions#open-a-form
 */

GreetingWorkflow.addStep(AddReactionDefinition, {
  channel: GreetingWorkflow.inputs.channel_id,
  timestamp: GreetingWorkflow.inputs.message_ts,
})

const greetingFunctionStep = GreetingWorkflow.addStep(GreetingFunctionDefinition, {
  message: GreetingWorkflow.inputs.text,
  user_id: GreetingWorkflow.inputs.user_id,
  channel_id: GreetingWorkflow.inputs.channel_id,
  message_ts: GreetingWorkflow.inputs.message_ts,
})

GreetingWorkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    message_context: {
      channel_id: GreetingWorkflow.inputs.channel_id,
      message_ts: GreetingWorkflow.inputs.message_ts
    },
    reply_broadcast: false,
    message: greetingFunctionStep.outputs.updatedMsg
  },
  );

export default GreetingWorkflow;
