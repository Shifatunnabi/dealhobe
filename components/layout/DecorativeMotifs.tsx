type Motif = {
  id: string;
  type: "cloud" | "rainbow";
  className: string;
  animation: string;
  flipX?: boolean;
};

const MOTIFS: Motif[] = [
  {
    id: "cloud-1",
    type: "cloud",
    className: "left-[40%] top-[8%] w-16 sm:w-20 lg:w-24 opacity-35",
    animation: "float 10s ease-in-out infinite",
  },
  {
    id: "cloud-2",
    type: "cloud",
    className: "left-[52%] top-[16%] w-20 sm:w-24 lg:w-28 opacity-34",
    animation: "float 9.5s ease-in-out infinite",
  },
  {
    id: "cloud-3",
    type: "cloud",
    className: "left-[34%] top-[30%] w-20 sm:w-24 lg:w-32 opacity-33",
    animation: "float 10.8s ease-in-out infinite",
  },
  {
    id: "cloud-4",
    type: "cloud",
    className: "left-[48%] top-[38%] w-16 sm:w-24 lg:w-28 opacity-34",
    animation: "float 11.2s ease-in-out infinite",
  },
  {
    id: "cloud-5",
    type: "cloud",
    className: "left-[42%] top-[52%] w-20 sm:w-24 lg:w-32 opacity-33",
    animation: "float 10.4s ease-in-out infinite",
  },
  {
    id: "cloud-6",
    type: "cloud",
    className: "left-[56%] top-[62%] w-16 sm:w-20 lg:w-24 opacity-34",
    animation: "float 9.8s ease-in-out infinite",
  },
  {
    id: "cloud-7",
    type: "cloud",
    className: "left-[38%] top-[74%] w-20 sm:w-24 lg:w-32 opacity-33",
    animation: "float 10.6s ease-in-out infinite",
  },
  {
    id: "cloud-8",
    type: "cloud",
    className: "left-[50%] top-[84%] w-16 sm:w-20 lg:w-24 opacity-32",
    animation: "float 11.4s ease-in-out infinite",
  },
  {
    id: "cloud-9",
    type: "cloud",
    className: "left-[60%] top-[92%] w-16 sm:w-20 lg:w-24 opacity-30",
    animation: "float 9.9s ease-in-out infinite",
  },

  /* Left boundary rainbows (2) */
  {
    id: "rainbow-1",
    type: "rainbow",
    className: "-left-24 top-[12%] w-36 sm:w-44 lg:w-52 opacity-42",
    animation: "float 11s ease-in-out infinite",
  },
  {
    id: "rainbow-3",
    type: "rainbow",
    className: "-left-24 top-[66%] w-36 sm:w-44 lg:w-52 opacity-40",
    animation: "float 10.8s ease-in-out infinite",
  },

  /* Right boundary rainbows (2) */
  {
    id: "rainbow-2",
    type: "rainbow",
    className: "-right-24 top-[30%] w-36 sm:w-44 lg:w-52 opacity-42",
    animation: "float 12s ease-in-out infinite",
    flipX: true,
  },
  {
    id: "rainbow-4",
    type: "rainbow",
    className: "-right-24 top-[82%] w-36 sm:w-44 lg:w-52 opacity-40",
    animation: "float 11.2s ease-in-out infinite",
    flipX: true,
  },
];

function Cloud() {
  return (
    <svg viewBox="0 0 220 120" className="h-auto w-full" aria-hidden="true">
      <g fill="#1CB0E6">
        <circle cx="70" cy="58" r="32" />
        <circle cx="110" cy="44" r="38" />
        <circle cx="150" cy="58" r="30" />
        <rect x="42" y="58" width="132" height="34" rx="17" />
      </g>
    </svg>
  );
}

function Rainbow({ flipX = false }: { flipX?: boolean }) {
  return (
    <svg
      viewBox="0 0 260 220"
      className={`h-auto w-full ${flipX ? "scale-x-[1]" : "scale-x-[-1]"}`}
      aria-hidden="true"
    >
      <path
        d="M10 208 C 14 130, 76 44, 194 16"
        fill="none"
        stroke="#37AFE1"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M24 208 C 30 144, 84 62, 186 34"
        fill="none"
        stroke="#F7C948"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M40 208 C 46 156, 92 80, 178 52"
        fill="none"
        stroke="#FF8FB0"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DecorativeMotifs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {MOTIFS.map((motif) => (
        <div
          key={motif.id}
          className={`absolute ${motif.className}`}
          style={{ animation: motif.animation }}
        >
          {motif.type === "cloud" ? <Cloud /> : <Rainbow flipX={motif.flipX} />}
        </div>
      ))}
    </div>
  );
}
