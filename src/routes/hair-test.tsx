import { createFileRoute } from "@tanstack/react-router";
import { DressupAvatar } from "@/components/dressup-avatar";
import { DEFAULT_DRESSUP, type HairStyleId } from "@/hooks/use-character";

export const Route = createFileRoute("/hair-test")({
  component: HairTest,
});

const STYLES: HairStyleId[] = [
  "soft-bob",
  "long-bangs",
  "low-pigtails",
  "space-buns",
  "twin-braids",
  "fluffy-curls",
  "side-sweep",
  "curtain-cut",
  "afro",
  "topknot",
  "fade",
];
const SIZES = [0.86, 1.0, 1.12];
const FACES = ["oval", "round", "long"] as const;

function HairTest() {
  return (
    <div style={{ padding: 12, background: "#f7efe2" }}>
      {STYLES.map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "flex-end", gap: 4, borderBottom: "1px solid #ddd" }}>
          <div style={{ width: 90, fontSize: 11 }}>{s}</div>
          {FACES.map((face) =>
            SIZES.map((sz) => (
              <div key={face + sz} style={{ textAlign: "center", fontSize: 9 }}>
                <DressupAvatar
                  size={90}
                  dressup={{ ...DEFAULT_DRESSUP, hairstyle: s, faceShape: face, headSize: sz }}
                />
                <div>{face}/{sz}</div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}