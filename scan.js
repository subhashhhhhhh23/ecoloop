// SortWise scan endpoint (Vercel serverless function)
// Receives a photo of a finished meal tray, asks Claude to identify items,
// and returns sorting instructions as JSON.
// Your API key stays here on the server, never in the app.

// Edit these to match SUSS's actual rules (confirm with SUSS first!)
const SORTING_RULES = `
- food_waste: cooked and raw food scraps, rice, noodles, vegetables, fruit peels, [bones?], [eggshells?]
- general_waste: plastic cutlery, sauce packets, wrappers, straws, [tissues?], disposable cups
- recyclables: clean plastic bottles, clean drink cans
- drain: any liquids (soup, drinks, sauce pools) must be poured into the drain first
`;

const SYSTEM_PROMPT = `You identify leftovers and items on a finished meal tray at a Singapore university food court so the diner can sort them correctly before leaving the table.
Follow these campus sorting rules exactly:
${SORTING_RULES}
Respond ONLY with JSON, no preamble and no markdown fences, in this shape:
{
  "is_food_tray": true or false,
  "items": [{"name": "short item name", "bin": "food_waste" | "general_waste" | "recyclables" | "drain", "confidence": "high" | "medium" | "low", "reason": "one short line"}],
  "presort_steps": ["ordered short instructions to do at the table before getting up"],
  "leftover_estimate": "none" | "little" | "some" | "a lot",
  "tip": "one short friendly tip about the most likely mistake on this tray"
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { image } = req.body || {};
  if (!image || typeof image !== "string") {
    return res.status(400).json({ error: "No image received" });
  }
  // Reject oversized uploads (~3 MB of base64) to protect your credits
  if (image.length > 4_000_000) {
    return res.status(413).json({ error: "Image too large" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
              { type: "text", text: "Here is my tray after eating. How do I sort it?" },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Anthropic API error:", response.status, detail);
      return res.status(502).json({ error: "Scan service unavailable" });
    }

    const data = await response.json();
    const text = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .replace(/```json|```/g, "")
      .trim();

    const result = JSON.parse(text);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Scan failed:", err);
    return res.status(500).json({ error: "Could not read the scan result" });
  }
}
