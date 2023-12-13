import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
// import env from "../utils/env.ts";

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

export const FetchThreadHistory = DefineFunction({
  callback_id: "fetch_thread_history",
  title: "fetching thread history",
  description: "fetching thread history",
  source_file: "functions/fetch_thread_history.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      message_ts: {
        type: Schema.slack.types.message_ts,
      },
    },
    required: ["channel_id", "message_ts"],
  },
  output_parameters: {
    properties: {
      prevConversationsRoles: {
        type: Schema.types.array,
        items: {
          type: Schema.types.string,
        },
      },
      prevConversationsContent: {
        type: Schema.types.array,
        items: {
          type: Schema.types.string,
        },
      },
    },
    required: [],
  },
});

export default SlackFunction(
  FetchThreadHistory,
  async ({ inputs, client, env }) => {
    const token = env["SLACK_API_KEY"];

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
    const prevConversationsRoles: string[] = allReplies?.map((reply) => {
      return reply.bot_id ? "assistant" : "user";
    });

    const prevConversationsContent: string[] = allReplies?.map((reply) => {
      return reply.text.replace(/<@([A-Z0-9]*)>/g, "");
    });
    return { outputs: { prevConversationsRoles, prevConversationsContent } };
  },
);
