export default function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width={32}
      height={32}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* clock circle */}
      <circle cx="32" cy="32" r="30" stroke="#3B82F6" strokeWidth="4" />
      {/* minute hand */}
      <line
        x1="32"
        y1="32"
        x2="32"
        y2="14"
        stroke="#10B981"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* hour hand */}
      <line
        x1="32"
        y1="32"
        x2="44"
        y2="32"
        stroke="#10B981"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* earning “spark” */}
      <path
        d="M50 19l3-3m-3 0l3 3"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}