import {random} from 'remotion';

/** Ojos del fantasma: huecos negros con pupilas que brillan */
export const GhostEyes: React.FC<{frame: number; size?: number; gap?: number}> = ({
	frame,
	size = 1,
	gap = 70,
}) => {
	const glow = 0.7 + 0.3 * Math.sin(frame / 5);
	return (
		<g>
			{[-gap / 2, gap / 2].map((x) => (
				<g key={x} transform={`translate(${x},0) scale(${size})`}>
					<ellipse rx={26} ry={20} fill="#050507" />
					<circle r={7} fill="#f4f6ff" opacity={glow} filter="url(#glow)" />
				</g>
			))}
		</g>
	);
};

/**
 * La niña del armario: cara pálida, pelo negro largo tapándola a medias.
 * Centro de la cara en (0,0). `reveal` 0..1 controla cuánto se asoma la boca.
 */
export const Ghost: React.FC<{frame: number; mouth: number; scream?: number}> = ({
	frame,
	mouth,
	scream = 0,
}) => {
	const sway = Math.sin(frame / 22) * 6;
	const twitch = random(`tw-${Math.floor(frame / 3)}`) > 0.93 ? (random(`twx-${frame}`) - 0.5) * 18 : 0;
	const open = Math.max(Math.min(1, mouth), scream);
	return (
		<g transform={`translate(${twitch}, ${sway}) rotate(${twitch * 0.4})`}>
			{/* pelo largo detrás */}
			<path
				d={`M -150 -40 Q -170 -200 0 -205 Q 170 -200 150 -40 L 175 520 Q ${120 + sway} 560 90 520 L 60 600 Q 0 560 -50 610 L -95 520 Q -140 560 -175 520 Z`}
				fill="#07070b"
			/>
			{/* cara */}
			<ellipse cx={0} cy={10} rx={118} ry={140} fill="#c9d3d6" />
			<ellipse cx={0} cy={10} rx={118} ry={140} fill="url(#ghostShade)" />
			<g transform="translate(0,-5)">
				<GhostEyes frame={frame} size={1.25 + scream * 0.6} gap={84} />
			</g>
			{/* ojeras */}
			<path d="M -75 25 Q -42 40 -10 25 M 10 25 Q 42 40 75 25" stroke="#6b5f75" strokeWidth={6} fill="none" opacity={0.6} />
			{/* boca */}
			<ellipse cx={0} cy={85} rx={16 + open * 30} ry={4 + open * 60} fill="#0b0508" />
			{/* mechones que cubren media cara */}
			<path d="M -120 -60 Q -60 -150 20 -150 Q -30 -60 -40 80 Q -55 200 -70 260 Q -110 160 -120 -60 Z" fill="#07070b" />
			<path d="M 120 -60 Q 90 -150 30 -150 Q 80 -40 70 120 Q 85 180 100 220 Q 125 120 120 -60 Z" fill="#07070b" />
			{/* manos de dedos largos */}
			<g opacity={0.95}>
				<path d="M -150 330 l -10 -110 M -130 330 l 0 -125 M -110 330 l 12 -115 M -90 335 l 22 -95" stroke="#c9d3d6" strokeWidth={14} strokeLinecap="round" />
				<path d="M 150 330 l 10 -110 M 130 330 l 0 -125 M 110 330 l -12 -115 M 90 335 l -22 -95" stroke="#c9d3d6" strokeWidth={14} strokeLinecap="round" />
			</g>
		</g>
	);
};
