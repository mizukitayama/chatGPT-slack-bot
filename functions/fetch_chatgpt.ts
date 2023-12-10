import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

const getResponseFromChatGPT = async (
  input: string,
  prevConversations: { role: string; content: string }[] | undefined,
) => {
  const env = await load();
  const apiKey = env["OPEN_AI_API_KEY"];
  const endpoint = "https://api.openai.com/v1/chat/completions";

  console.log(prevConversations);
  // NOTE: 過去のやり取りの中に送ったメッセージも含まれる。
  const messages = prevConversations
    ? prevConversations
    : [{ "role": "user", "content": input }];

  const response = await fetch(endpoint, {
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
  return response;
};

export default getResponseFromChatGPT;
