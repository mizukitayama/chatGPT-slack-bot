import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import getResponseFromChatGPT from "./fetch_chatgpt.ts";
import env from "../utils/env.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */

type SlackMessageType = {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  blocks: [];
  team: string;
  thread_ts: string;
  parent_user_id: string;
  reply_count?: number; //スレッドの頭のみ
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  is_locked?: boolean;
  subscribed?: boolean;
  last_read?: string;
  user_name?: string; //botのみ
  bot_id?: string;
  app_id?: string;
};

export const RequestingChatgptFunction = DefineFunction({
  callback_id: "requesting_chatgpt_function",
  title: "Fetching conversations and requesting ChatGPT",
  description: "Fetching conversations in threads and requesting ChatGPT",
  source_file: "functions/requesting_chatgpt_function.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
      },
      user_id: {
        type: Schema.slack.types.user_id,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      message_ts: {
        type: Schema.slack.types.message_ts,
      },
    },
    required: ["message", "user_id", "channel_id", "message_ts"],
  },
  output_parameters: {
    properties: {
      updatedMsg: {
        type: Schema.slack.types.rich_text,
      },
    },
    required: ["updatedMsg"],
  },
});

export default SlackFunction(
  RequestingChatgptFunction,
  async ({ inputs, client }) => {
    const token = await env("SLACK_API_KEY");

    // スレッドの履歴を全てとる
    const parent_ts = await client.conversations.replies({
      token,
      channel: inputs.channel_id,
      ts: inputs.message_ts,
      include_all_metadata: true,
    }).then((current) => current.messages?.[0].thread_ts);

    const repliesResponse = await client.conversations.replies({
      token,
      channel: inputs.channel_id,
      ts: parent_ts,
      include_all_metadata: true,
    });

    const allReplies: SlackMessageType[] = repliesResponse?.messages;
    const prevConversations = allReplies?.map((reply) => ({
      role: reply.bot_id ? "assistant" : "user",
      content: reply.text.replace(/<@([A-Z0-9]*)>/g, ""),
    }));

    const response = await getResponseFromChatGPT(
      inputs.message,
      prevConversations,
    );
    return { outputs: { updatedMsg: `<@${inputs.user_id}>\n` + response } };
  },
);
