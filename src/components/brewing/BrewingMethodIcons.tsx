interface IconProps {
  className?: string;
}

export function PourOverIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Cone body */}
      <path d="M8 8h32L28 36H20L8 8z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Neck */}
      <rect x="22" y="36" width="4" height="5" rx="1" fill="currentColor" />
      {/* Stand base */}
      <path d="M12 45q12-5 24 0" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Filter ridges inside cone */}
      <line x1="20" y1="12" x2="17" y2="32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="28" y1="12" x2="31" y2="32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

export function FrenchPressIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Glass body */}
      <rect x="14" y="12" width="20" height="26" rx="2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Lid ring */}
      <rect x="11" y="8" width="26" height="5" rx="2.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      {/* Plunger rod */}
      <line x1="24" y1="4" x2="24" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Plunger disc */}
      <rect x="15" y="24" width="18" height="3" rx="1.5" fill="currentColor" />
      {/* Handle */}
      <path d="M34 16c8 0 8 14 0 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Base */}
      <rect x="12" y="38" width="24" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}

export function AeroPressIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Outer chamber */}
      <rect x="14" y="16" width="20" height="20" rx="3" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Inner plunger body */}
      <rect x="17" y="6" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
      {/* Plunger seal */}
      <rect x="15" y="19" width="18" height="3" rx="1.5" fill="currentColor" />
      {/* Filter cap */}
      <rect x="13" y="36" width="22" height="6" rx="3" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      {/* Filter perforations */}
      <circle cx="19" cy="39" r="1.2" fill="background" opacity="0.6" />
      <circle cx="24" cy="39" r="1.2" fill="background" opacity="0.6" />
      <circle cx="29" cy="39" r="1.2" fill="background" opacity="0.6" />
    </svg>
  );
}

export function AeroPressGoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Outer chamber (shorter) */}
      <rect x="13" y="18" width="22" height="16" rx="3" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Inner plunger */}
      <rect x="17" y="8" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
      {/* Plunger seal */}
      <rect x="14" y="21" width="20" height="3" rx="1.5" fill="currentColor" />
      {/* Travel mug base */}
      <rect x="11" y="34" width="26" height="10" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      {/* Mug handle */}
      <path d="M37 37c5 0 5 6 0 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Filter perforations */}
      <circle cx="19" cy="34" r="1" fill="currentColor" fillOpacity="0.5" />
      <circle cx="24" cy="34" r="1" fill="currentColor" fillOpacity="0.5" />
      <circle cx="29" cy="34" r="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

export function KalitaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Flat-bottom trapezoid */}
      <path d="M9 8h30L33 35H15L9 8z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Three drain holes (Kalita's signature) */}
      <circle cx="18" cy="35" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="24" cy="35" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="30" cy="35" r="2" fill="currentColor" fillOpacity="0.5" />
      {/* Stand legs */}
      <path d="M13 44q11-5 22 0" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Wave filter line */}
      <path d="M18 18q3-2 6 0t6 0" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SiemensDripIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Machine body */}
      <rect x="6" y="6" width="36" height="28" rx="4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Control panel strip */}
      <rect x="6" y="6" width="36" height="9" rx="4" fill="currentColor" fillOpacity="0.1" />
      {/* Power LED */}
      <circle cx="37" cy="10.5" r="2.5" fill="currentColor" fillOpacity="0.7" />
      {/* Display screen */}
      <rect x="11" y="9" width="16" height="5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      {/* Drip outlet */}
      <line x1="24" y1="34" x2="24" y2="39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Carafe */}
      <path d="M15 39h18l-2 7H17z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Carafe handle */}
      <path d="M33 41c5 0 5 4 0 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function EspressoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Machine body */}
      <rect x="7" y="8" width="34" height="24" rx="4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Group head */}
      <rect x="16" y="32" width="16" height="4" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      {/* Portafilter handles */}
      <line x1="16" y1="36" x2="12" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="36" x2="36" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="44" x2="36" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Pressure gauge */}
      <circle cx="13" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="14" x2="13" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Steam wand */}
      <path d="M41 14v10l-5 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Cup */}
      <path d="M19 44h10l1 3H18z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

export function MokaPotIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Upper chamber */}
      <path d="M18 4h12l2 4v12H16V8z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Spout */}
      <path d="M20 4q0-2-2-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Waist / valve */}
      <rect x="14" y="20" width="20" height="4" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      {/* Lower chamber */}
      <path d="M14 24l-2 18h24l-2-18z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Handle */}
      <path d="M36 28c8 0 8 12 0 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Base */}
      <rect x="10" y="42" width="28" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function ColdBrewIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Jar body */}
      <rect x="12" y="12" width="24" height="32" rx="4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Jar lid */}
      <rect x="10" y="7" width="28" height="7" rx="3.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      {/* Ice cube 1 */}
      <rect x="15" y="18" width="8" height="8" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      {/* Ice cube 2 */}
      <rect x="25" y="22" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      {/* Ice cube 3 */}
      <rect x="16" y="30" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      {/* Coffee liquid level */}
      <path d="M13 38q12-3 23 0" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
    </svg>
  );
}

export function DripIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Dripper funnel */}
      <path d="M10 6h28l-8 22H18L10 6z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Drip line */}
      <line x1="24" y1="28" x2="24" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
      {/* Carafe body */}
      <path d="M13 34v10q0 2 11 2t11-2V34z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Carafe top opening */}
      <rect x="11" y="32" width="26" height="4" rx="2" fill="currentColor" />
      {/* Carafe handle */}
      <path d="M36 37c6 0 6 6 0 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function OtherBrewIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Coffee cup */}
      <path d="M10 20l3 22h22l3-22z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cup handle */}
      <path d="M36 26c7 0 7 10 0 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Saucer */}
      <path d="M6 42q18 5 36 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Steam 1 */}
      <path d="M17 16q2-4 0-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Steam 2 */}
      <path d="M24 14q2-4 0-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Steam 3 */}
      <path d="M31 16q2-4 0-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Water source icons ─────────────────────────────────────────────────────────

export function TapWaterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Pipe */}
      <rect x="4" y="16" width="20" height="6" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      {/* Faucet body */}
      <rect x="22" y="13" width="8" height="12" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      {/* Spout bend */}
      <path d="M26 25v6q0 4 6 4h4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Water drop */}
      <path d="M36 35q0 7 5 7t5-7q0-5-5-9-5 4-5 9z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Handle */}
      <rect x="24" y="8" width="4" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function FilteredTapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Pipe */}
      <rect x="4" y="16" width="16" height="6" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
      {/* Spout */}
      <path d="M20 19v6q0 3 4 3h2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Filter cylinder */}
      <rect x="26" y="22" width="10" height="18" rx="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
      {/* Filter layers */}
      <line x1="27" y1="27" x2="35" y2="27" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="27" y1="31" x2="35" y2="31" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="27" y1="35" x2="35" y2="35" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      {/* Water drop below filter */}
      <path d="M28 40q0 5 3 5t3-5q0-3-3-5-3 2-3 5z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

export function BottledStillIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Bottle neck */}
      <rect x="19" y="5" width="10" height="9" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      {/* Cap */}
      <rect x="18" y="3" width="12" height="4" rx="2" fill="currentColor" />
      {/* Bottle body */}
      <path d="M19 14q-7 3-7 10v16q0 4 12 4t12-4V24q0-7-7-10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      {/* Label */}
      <rect x="16" y="26" width="16" height="10" rx="1.5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      {/* Water level */}
      <path d="M13 35q11-3 22 0" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
    </svg>
  );
}

export function BottledSparklingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Bottle neck */}
      <rect x="19" y="5" width="10" height="9" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
      {/* Cap */}
      <rect x="18" y="3" width="12" height="4" rx="2" fill="currentColor" />
      {/* Bottle body */}
      <path d="M19 14q-7 3-7 10v16q0 4 12 4t12-4V24q0-7-7-10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" />
      {/* Bubbles */}
      <circle cx="20" cy="26" r="2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="28" cy="22" r="2.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="24" cy="32" r="1.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="21" cy="37" r="1" fill="currentColor" fillOpacity="0.35" />
      <circle cx="27" cy="36" r="2" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

export function SpringWaterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Mountain */}
      <path d="M4 42L20 14l10 14 6-8 8 22z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Snow cap */}
      <path d="M16 20l4-6 4 6z" fill="currentColor" fillOpacity="0.45" />
      {/* Spring water drop */}
      <path d="M18 32q0 8 6 8t6-8q0-6-6-10-6 4-6 10z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function OtherWaterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Drop shape */}
      <path d="M14 30q0 12 10 12t10-12q0-10-10-18-10 8-10 18z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.5" />
      {/* Question mark */}
      <path d="M21 22q0-3 3-3t3 3q0 3-3 4v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="36" r="1.5" fill="currentColor" />
    </svg>
  );
}
