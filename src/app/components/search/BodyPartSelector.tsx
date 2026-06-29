interface BodyPartSelectorProps {
  onSelectBodyPart: (part: string) => void;
  selectedPart: string | null;
}

const bodyParts = [
  { id: "face", label: "Face", cx: 100, cy: 40, r: 25 },
  { id: "nose", label: "Nose", cx: 100, cy: 45, r: 8 },
  { id: "teeth", label: "Teeth", cx: 100, cy: 52, r: 6 },
  { id: "chest", label: "Chest", cx: 100, cy: 90, r: 20 },
  { id: "abdomen", label: "Abdomen", cx: 100, cy: 130, r: 18 },
  { id: "arms", label: "Arms", cx: 60, cy: 100, r: 12 },
  { id: "arms-right", label: "Arms", cx: 140, cy: 100, r: 12 },
  { id: "legs", label: "Legs", cx: 85, cy: 180, r: 12 },
  { id: "legs-right", label: "Legs", cx: 115, cy: 180, r: 12 },
];

export default function BodyPartSelector({
  onSelectBodyPart,
  selectedPart,
}: BodyPartSelectorProps) {
  return (
    <div className="rounded-lg border border-border bg-input-background p-4">
      <svg
        viewBox="0 0 200 240"
        className="h-auto w-full"
        style={{ maxHeight: "300px" }}
      >
        <g id="body-outline">
          <ellipse
            cx="100"
            cy="35"
            rx="28"
            ry="32"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <path
            d="M 100 65 Q 95 70 90 85 L 85 115 L 80 180 L 85 220"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <path
            d="M 100 65 Q 105 70 110 85 L 115 115 L 120 180 L 115 220"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <rect
            x="88"
            y="70"
            width="24"
            height="35"
            rx="4"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <rect
            x="90"
            y="105"
            width="20"
            height="40"
            rx="4"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <path
            d="M 88 75 Q 70 80 60 95 L 55 120"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <path
            d="M 112 75 Q 130 80 140 95 L 145 120"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <path
            d="M 85 145 L 80 180 L 85 235"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />

          <path
            d="M 115 145 L 120 180 L 115 235"
            fill="none"
            stroke="#B8B0A3"
            strokeWidth="2"
          />
        </g>

        {bodyParts.map((part) => (
          <g key={part.id}>
            <circle
              cx={part.cx}
              cy={part.cy}
              r={part.r}
              fill={
                selectedPart === part.id
                  ? "#391419"
                  : "rgba(57, 20, 25, 0.1)"
              }
              className="cursor-pointer transition-all hover:fill-primary/20"
              onClick={() => onSelectBodyPart(part.id)}
            />

            <text
              x={part.cx}
              y={part.cy + part.r + 12}
              textAnchor="middle"
              fontSize="10"
              fill="#391419"
              className="pointer-events-none select-none"
            >
              {part.label}
            </text>
          </g>
        ))}
      </svg>

      {selectedPart && (
        <div className="mt-3 text-center">
          <button
            onClick={() => onSelectBodyPart("")}
            className="text-sm text-primary hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}