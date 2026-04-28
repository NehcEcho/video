const SILICONFLOW_API = "https://api.siliconflow.cn/v1/chat/completions";
const TRANS_MODEL = "Qwen/Qwen3-Omni-30B-A3B-Thinking";

export async function transcribeAudio(
  audioBase64: string,
  apiKey: string,
  onToken?: (token: string) => void
): Promise<string> {
  const response = await fetch(SILICONFLOW_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: TRANS_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请将这段音频的内容转写成文字。请通过音色区分不同的角色，用「角色A」「角色B」等标注不同人物。如果只有一个人说话则不需要标注。只输出转写结果，不要添加任何总结、分析或额外说明。",
            },
            {
              type: "audio_url",
              audio_url: {
                url: `data:audio/wav;base64,${audioBase64}`,
              },
            },
          ],
        },
      ],
      stream: !!onToken,
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`SiliconFlow API error (${response.status}): ${err}`);
  }

  if (onToken && response.body) {
    return readStream(response.body, onToken);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

async function readStream(
  body: ReadableStream<Uint8Array>,
  onToken: (token: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullText += delta.content;
          onToken(delta.content);
        }
      } catch {}
    }
  }

  return fullText;
}
