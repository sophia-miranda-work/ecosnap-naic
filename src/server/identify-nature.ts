import { createServerFn } from "@tanstack/react-start";

export type IdentifyNatureResult = {
  identified: boolean;
  /** Common name of the subject, e.g. "Dandelion". Empty when not identified. */
  name: string;
  /** One of the journal categories, or "other". */
  category:
    | "tree"
    | "plant"
    | "flower"
    | "bird"
    | "insect"
    | "mushroom"
    | "stone"
    | "water"
    | "sky"
    | "other";
  /** Confidence 0–1 from the model. */
  confidence: number;
  /** A short, friendly congratulatory message. */
  congratsMessage: string;
  /** A short fun fact about the subject. */
  funFact: string;
};

const FALLBACK: IdentifyNatureResult = {
  identified: false,
  name: "",
  category: "other",
  confidence: 0,
  congratsMessage: "",
  funFact: "",
};

/**
 * Send a captured photo (data URL) to Lovable AI Gateway for nature
 * identification. Returns a structured result via tool calling.
 * Never throws on AI errors — returns FALLBACK so the camera flow can
 * gracefully fall back to manual categorization.
 */
export const identifyNature = createServerFn({ method: "POST" })
  .inputValidator((input: { imageDataUrl: string }) => {
    if (!input || typeof input.imageDataUrl !== "string") {
      throw new Error("imageDataUrl is required");
    }
    if (!input.imageDataUrl.startsWith("data:image/")) {
      throw new Error("imageDataUrl must be a data: image URL");
    }
    // Cap payload around ~6MB encoded (~4.5MB raw) to stay friendly to the gateway.
    if (input.imageDataUrl.length > 6_000_000) {
      throw new Error("Image too large");
    }
    return input;
  })
  .handler(async ({ data }): Promise<IdentifyNatureResult> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return FALLBACK;
    }

    const systemPrompt =
      "You are a friendly nature guide for a cozy walking app called Explorer's Notebook. " +
      "Given a photo, identify the main natural subject (a plant, flower, tree, bird, insect, " +
      "mushroom, stone, body of water, or sky feature). Be specific where possible (e.g. 'Dandelion' " +
      "rather than 'flower'). If the photo is blurry, indoors, of a person, of a screen, or has no " +
      "clear nature subject, set identified=false. Always respond by calling the report_find tool.";

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Identify the main nature subject in this photo and respond with the report_find tool.",
                },
                {
                  type: "image_url",
                  image_url: { url: data.imageDataUrl },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_find",
                description: "Report the identified nature subject in a structured way.",
                parameters: {
                  type: "object",
                  properties: {
                    identified: {
                      type: "boolean",
                      description: "True if a clear nature subject was found, false otherwise.",
                    },
                    name: {
                      type: "string",
                      description:
                        "Common name of the subject, capitalized (e.g. 'Dandelion'). Empty string if not identified.",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "tree",
                        "plant",
                        "flower",
                        "bird",
                        "insect",
                        "mushroom",
                        "stone",
                        "water",
                        "sky",
                        "other",
                      ],
                    },
                    confidence: {
                      type: "number",
                      description: "Confidence between 0 and 1.",
                    },
                    congratsMessage: {
                      type: "string",
                      description:
                        "A short, warm, celebratory one-liner. e.g. \"Congrats, you've found a Dandelion! 🌼\". Empty if not identified.",
                    },
                    funFact: {
                      type: "string",
                      description:
                        "A short, surprising, family-friendly fact about the subject (1–2 sentences). Empty if not identified.",
                    },
                  },
                  required: [
                    "identified",
                    "name",
                    "category",
                    "confidence",
                    "congratsMessage",
                    "funFact",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "report_find" } },
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Lovable AI gateway error:", response.status, text);
        return FALLBACK;
      }

      const json = (await response.json()) as {
        choices?: Array<{
          message?: {
            tool_calls?: Array<{
              function?: { name?: string; arguments?: string };
            }>;
          };
        }>;
      };

      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!args) {
        console.warn("AI returned no tool call");
        return FALLBACK;
      }

      const parsed = JSON.parse(args) as Partial<IdentifyNatureResult>;
      return {
        identified: Boolean(parsed.identified),
        name: typeof parsed.name === "string" ? parsed.name : "",
        category: (parsed.category as IdentifyNatureResult["category"]) ?? "other",
        confidence:
          typeof parsed.confidence === "number"
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0,
        congratsMessage:
          typeof parsed.congratsMessage === "string" ? parsed.congratsMessage : "",
        funFact: typeof parsed.funFact === "string" ? parsed.funFact : "",
      };
    } catch (err) {
      console.error("identifyNature failed:", err);
      return FALLBACK;
    }
  });