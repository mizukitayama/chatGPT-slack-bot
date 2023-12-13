import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { FetchThreadHistory } from "../functions/fetch_thread_history.ts";
import { AddReactionDefinition } from "../functions/add_reaction.ts";
import { GetResponseFromChatGPTFunction } from "../functions/fetch_chatgpt.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const AskingChatGPTworkflow = DefineWorkflow({
  callback_id: "asking_chatgpt_workflow",
  title: "Asking ChatGPT a question posted on channel",
  description: "Asking ChatGPT a question posted on channel",
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
        type: Schema.slack.types.message_ts,
      },
    },
    required: ["text", "channel_id", "user_id", "message_ts"],
  },
});

/**
 * For collecting input from users, we recommend the
 * built-in OpenForm function as a first step.
 * https://api.slack.com/automation/functions#open-a-form
 */

// リクエスト前にスタンプで反応
AskingChatGPTworkflow.addStep(AddReactionDefinition, {
  channel: AskingChatGPTworkflow.inputs.channel_id,
  timestamp: AskingChatGPTworkflow.inputs.message_ts,
});

// スレッドの履歴をとり、ChatGPTにリクエストを送る
const threadHistories = AskingChatGPTworkflow.addStep(
  FetchThreadHistory,
  {
    channel_id: AskingChatGPTworkflow.inputs.channel_id,
    message_ts: AskingChatGPTworkflow.inputs.message_ts,
  },
);

const replyContent = AskingChatGPTworkflow.addStep(
  GetResponseFromChatGPTFunction, {
    input: AskingChatGPTworkflow.inputs.text,
    user_id: AskingChatGPTworkflow.inputs.user_id,
    prevConversationsRoles: threadHistories.outputs.prevConversationsRoles,
    prevConversationsContent: threadHistories.outputs.prevConversationsContent,
  }
)

// ChatGPTからの返答を送信
AskingChatGPTworkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    message_context: {
      channel_id: AskingChatGPTworkflow.inputs.channel_id,
      message_ts: AskingChatGPTworkflow.inputs.message_ts,
    },
    reply_broadcast: false,
    message: replyContent.outputs.response,
  },
);

export default AskingChatGPTworkflow;
