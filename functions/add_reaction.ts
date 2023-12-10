import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import env from "../utils/env.ts";

export const AddReactionDefinition = DefineFunction({
  callback_id: "adding_reaction_function",
  title: "Add a reaction",
  description: "Add a reaction while fetching",
  source_file: "functions/add_reaction.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      timestamp: {
        type: Schema.slack.types.message_ts,
      }
    },
    required: ["channel", "timestamp"]
  },
})

export default SlackFunction(
  AddReactionDefinition,
  async ({inputs, client}) => {
    const token = await env("SLACK_API_KEY")
    await client.reactions.add({
      token,
      channel: inputs.channel,
      timestamp: inputs.timestamp,
      name: "white_check_mark",
    })
    return {outputs: {}}
  }
)
