const SILICONFLOW_API = "https://api.siliconflow.cn/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen3-Omni-30B-A3B-Thinking";

const SUMMARY_SYSTEM_PROMPT = `你是一个专业的视频内容分析师。请根据提供的视频字幕文本，生成一份结构化的视频总结。

请严格按以下格式输出（使用 Markdown）：

## 📌 核心观点
- 列出视频的 3-5 个核心观点，每个一句话概括

## 🗂 内容大纲
1. 第一部分：...
2. 第二部分：...
3. ...（根据内容自然分段）

## 📝 关键细节
- 补充重要的事实、数据或案例细节
- 每个细节一行

## 💡 一句话总结
用一句话概括这个视频的主要内容

注意：
- 保持客观，不添加个人评价
- 如果字幕不完整或混乱，请说明
- 使用中文输出`;

export async function summarizeText(
  text: string,
  apiKey: string,
  model: string,
  onToken?: (token: string) => void
): Promise<string> {
  const response = await fetch(SILICONFLOW_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        { role: "user", content: `请为以下视频字幕生成结构化总结：\n\n${text}` },
      ],
      stream: !!onToken,
      max_tokens: 4096,
      temperature: 0.7,
      enable_thinking: true,
      thinking_budget: 2048,
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

export async function summarizeAudio(
  audioBase64: string,
  apiKey: string,
  model: string,
  onToken?: (token: string) => void
): Promise<string> {
  const response = await fetch(SILICONFLOW_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请将这段音频的内容转写成文字，只输出转写结果，不要添加任何总结、分析或额外说明。",
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
