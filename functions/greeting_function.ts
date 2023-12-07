import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const GreetingFunctionDefinition = DefineFunction({
  callback_id: "greeting_function",
  title: "Generate a greeting",
  description: "Generate a greeting",
  source_file: "functions/greeting_function.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Message to be posted",
      },
      user_id: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      message_ts: {
        type: Schema.slack.types.message_ts
      }
    },
    required: ["message", "user_id", "channel_id", "message_ts"],
  },
  output_parameters: {
    properties: {
      updatedMsg: {
        type: Schema.slack.types.rich_text,
        description: "Greeting for the recipient",
      },
    },
    required: ["updatedMsg"],
  },
});

export default SlackFunction(
  GreetingFunctionDefinition,
  async ({inputs, client}) => {
    console.log(inputs.channel_id, inputs.message_ts)
    const updatedMsg = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "Thank you for mentionning ."
        }
      },
    ]
    console.log("fetching")
//  Fetch the target messages in thread
    const parent_ts = await client.conversations.replies({
      token: 'api-key',
      channel: inputs.channel_id,
      ts: inputs.message_ts,
      include_all_metadata: true,
    }).then((current) => current.messages?.[0].thread_ts)
    console.log(parent_ts)

    const all_replies = await client.conversations.replies({
      token: 'api-key',
      channel: inputs.channel_id,
      ts: parent_ts,
      include_all_metadata: true,
    })
    console.log(all_replies)

    return {outputs: {updatedMsg}};
  },
);