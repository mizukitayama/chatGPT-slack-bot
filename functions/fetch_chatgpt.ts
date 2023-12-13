import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GetResponseFromChatGPTFunction = DefineFunction({
  callback_id: "requesting_chatgpt_function",
  title: "Fetching conversations and requesting ChatGPT",
  description: "Fetching conversations in threads and requesting ChatGPT",
  source_file: "functions/fetch_chatgpt.ts",
  input_parameters: {
    properties: {
      input: {
        type: Schema.types.string,
      },
      user_id: {
        type: Schema.slack.types.user_id,
      },
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
    required: ["input", "user_id"],
  },
  output_parameters: {
    properties: {
      response: {
        type: Schema.types.string,
      },
    },
    required: ["response"],
  },
});

export default SlackFunction(GetResponseFromChatGPTFunction, async ({
  env,
  inputs,
}) => {
  const apiKey = env["OPEN_AI_API_KEY"]
  const endpoint = "https://api.openai.com/v1/chat/completions";

  // NOTE: 過去のやり取りの中に送ったメッセージも含まれる。
  const messages = inputs.prevConversationsContent ? inputs.prevConversationsContent.map((content, index) => {
    return {"role": inputs.prevConversationsRoles?.[index], "content": content}
  }) : [{ "role": "user", "content": inputs.input }]

  console.log("messages", messages);

  const response: string = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages,
      model: "gpt-4",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content;
      } else if (data.error.message) {
        throw new Error(data.error.message);
      } else {
        throw new Error("予期せぬエラーが発生しました。");
      }
    })
    .catch((error) => {
      return error.message || "不明なエラーが発生しました。";
    });
  return { outputs: { response: `<@${inputs.user_id}>\n` + response } };
});
