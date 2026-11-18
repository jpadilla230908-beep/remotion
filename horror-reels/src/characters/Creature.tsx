import {random} from 'remotion';

/**
 * «Algo»: figura alta y delgada, piel gris pálida, cuencas negras con un punto
 * blanco y brazos demasiado largos. Pies en (0,0), mide ~900 px de alto.
 */
export const CreatureBody: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 1}) => {
	const sway = Math.sin(frame / 30) * 6;
	const twitch = random(`ct-${Math.floor(frame / 4)}`) > 0.92 ? (random(`ctx-${frame}`) - 0.5) * 14 : 0;
	return (
		<g opacity={opacity} transform={`translate(${twitch}, 0) rotate(${sway * 0.2})`}>
			{/* piernas */}
			<path d="M -30 0 L -40 -380 M 30 0 L 40 -380" stroke="#b9c0c4" strokeWidth={22} strokeLinecap="round" />
			{/* torso */}
			<path d="M -60 -380 Q -70 -600 0 -640 Q 70 -600 60 -380 Z" fill="#b9c0c4" />
			{/* costillas */}
			<path d="M -40 -560 Q 0 -545 40 -560 M -44 -520 Q 0 -505 44 -520 M -44 -480 Q 0 -465 44 -480" stroke="#7d868b" strokeWidth={6} fill="none" />
			{/* brazos larguísimos */}
			<path d={`M -55 -600 Q -120 -400 ${-110 + sway} -150`} stroke="#b9c0c4" strokeWidth={18} strokeLinecap="round" fill="none" />
			<path d={`M 55 -600 Q 120 -400 ${110 - sway} -150`} stroke="#b9c0c4" strokeWidth={18} strokeLinecap="round" fill="none" />
			<path d={`M ${-110 + sway} -150 l -14 70 M ${-110 + sway} -150 l 0 80 M ${-110 + sway} -150 l 14 70`} stroke="#b9c0c4" strokeWidth={8} strokeLinecap="round" />
			<path d={`M ${110 - sway} -150 l -14 70 M ${110 - sway} -150 l 0 80 M ${110 - sway} -150 l 14 70`} stroke="#b9c0c4" strokeWidth={8} strokeLinecap="round" />
			{/* cabeza alargada */}
			<ellipse cx={0} cy={-730} rx={56} ry={95} fill="#c9d0d4" />
			{/* ramas como cuernos */}
			<path d="M -30 -805 Q -70 -900 -40 -960 M -55 -880 L -100 -910 M 30 -805 Q 70 -900 40 -960 M 55 -880 L 100 -910" stroke="#2b2118" strokeWidth={9} strokeLinecap="round" fill="none" />
			{/* cuencas */}
			<ellipse cx={-22} cy={-740} rx={16} ry={22} fill="#050507" />
			<ellipse cx={22} cy={-740} rx={16} ry={22} fill="#050507" />
			<circle cx={-22} cy={-738} r={4} fill="#f4f6ff" />
			<circle cx={22} cy={-738} r={4} fill="#f4f6ff" />
			{/* sonrisa fina */}
			<path d="M -26 -690 Q 0 -676 26 -690" stroke="#050507" strokeWidth={4} fill="none" />
		</g>
	);
};

/** Ojos de la criatura en la oscuridad (para arbustos y fondos) */
export const CreatureEyes: React.FC<{frame: number; size?: number; gap?: number}> = ({frame, size = 1, gap = 60}) => {
	// parpadeo lento cada ~2.5 s
	const b = frame % 75 < 3 ? 0.1 : 1;
	return (
		<g>
			{[-gap / 2, gap / 2].map((x) => (
				<g key={x} transform={`translate(${x},0) scale(${size})`}>
					<ellipse rx={14} ry={9 * b} fill="#f4f6ff" filter="url(#glow)" />
					<ellipse rx={3} ry={7 * b} fill="#050507" />
				</g>
			))}
		</g>
	);
};

/** Cara de la criatura para el susto: centro de la cara en (0,0) */
export const CreatureFace: React.FC<{frame: number; scream: number}> = ({frame, scream}) => {
	const jaw = 40 + scream * 170;
	const jitter = (random(`cf-${frame}`) - 0.5) * 6;
	return (
		<g transform={`translate(${jitter}, 0)`}>
			{/* ramas */}
			<path d="M -70 -170 Q -150 -320 -90 -420 M -120 -300 L -210 -350 M 70 -170 Q 150 -320 90 -420 M 120 -300 L 210 -350" stroke="#2b2118" strokeWidth={16} strokeLinecap="round" fill="none" />
			{/* cráneo huesudo: frente ancha, pómulos marcados, mandíbula que se descuelga */}
			<path
				d={`M -105 -150 Q -90 -250 0 -255 Q 90 -250 105 -150 Q 125 -60 95 0 Q 80 ${60 + jaw * 0.5} 30 ${150 + jaw} Q 0 ${165 + jaw} -30 ${150 + jaw} Q -80 ${60 + jaw * 0.5} -95 0 Q -125 -60 -105 -150 Z`}
				fill="#aeb6b2"
			/>
			{/* sombras: cuencas hundidas y mejillas chupadas */}
			<path d="M -95 0 Q -60 30 -40 90 Q -80 60 -95 0 Z M 95 0 Q 60 30 40 90 Q 80 60 95 0 Z" fill="#4a5250" opacity={0.7} />
			<ellipse cx={0} cy={-80} rx={110} ry={70} fill="#2a302e" opacity={0.35} />
			<path d="M -14 -10 L 0 20 L 14 -10 Z" fill="#2a302e" />
			{/* cuencas enormes */}
			<ellipse cx={-50} cy={-70} rx={38} ry={52} fill="#050507" />
			<ellipse cx={50} cy={-70} rx={38} ry={52} fill="#050507" />
			<circle cx={-50} cy={-66} r={6 + scream * 4} fill="#f4f6ff" filter="url(#glow)" />
			<circle cx={50} cy={-66} r={6 + scream * 4} fill="#f4f6ff" filter="url(#glow)" />
			{/* boca abierta con dientes finos */}
			<path d={`M -62 50 Q -50 ${60 + jaw} 0 ${80 + jaw} Q 50 ${60 + jaw} 62 50 Q 0 30 -62 50 Z`} fill="#0b0508" />
			{Array.from({length: 9}).map((_, i) => {
				const x = -56 + i * 13;
				return <path key={i} d={`M ${x} 46 l 5 ${24 + scream * 22} l 5 ${-24 - scream * 22} Z`} fill="#e9e4dc" />;
			})}
			{/* grietas */}
			<path d="M -100 -150 l 20 40 l -14 30 M 96 -160 l -16 44 l 12 26" stroke="#5a4a4a" strokeWidth={5} fill="none" />
		</g>
	);
};
