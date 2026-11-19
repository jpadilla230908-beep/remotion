import {random} from 'remotion';

/**
 * «La que imita voces»: cara de mujer pálida, pelo negro largo, ojos negros
 * y una sonrisa que llega de oreja a oreja. Centro de la cara en (0,0).
 * scream 0..1: la sonrisa se convierte en una boca abierta enorme.
 */
export const MimicFace: React.FC<{frame: number; scream: number}> = ({frame, scream}) => {
	const jitter = (random(`mf-${frame}`) - 0.5) * 5;
	const open = scream;
	return (
		<g transform={`translate(${jitter}, 0)`}>
			{/* pelo */}
			<path d="M -150 -40 Q -170 -230 0 -235 Q 170 -230 150 -40 L 185 420 Q 0 470 -185 420 Z" fill="#101016" stroke="#3a3a4a" strokeWidth={6} />
			{/* cara */}
			<ellipse cx={0} cy={10} rx={125} ry={160} fill="#d6d2cc" />
			<ellipse cx={0} cy={10} rx={125} ry={160} fill="#1d2333" opacity={0.2} />
			{/* flequillo redondeado */}
			<path d="M -132 -20 Q -136 -172 0 -176 Q 136 -172 132 -20 Q 80 -96 0 -98 Q -80 -96 -132 -20 Z" fill="#101016" />
			<path d="M -100 -70 Q -40 -100 0 -98 M 100 -70 Q 40 -100 0 -98" stroke="#3a3a4a" strokeWidth={4} fill="none" />
			{/* ojos negros */}
			<ellipse cx={-48} cy={-30} rx={26 + open * 6} ry={18 + open * 10} fill="#050507" />
			<ellipse cx={48} cy={-30} rx={26 + open * 6} ry={18 + open * 10} fill="#050507" />
			<circle cx={-48} cy={-28} r={4 + open * 3} fill="#f4f6ff" filter="url(#glow)" />
			<circle cx={48} cy={-28} r={4 + open * 3} fill="#f4f6ff" filter="url(#glow)" />
			{/* boca: sonrisa de oreja a oreja que se abre */}
			<path d={`M -105 50 Q 0 ${120 + open * 160} 105 50 Q 0 ${70 + open * 40} -105 50 Z`} fill="#0b0508" />
			{Array.from({length: 14}).map((_, i) => {
				const x = -91 + i * 14;
				const y = 52 + Math.sin(((i + 0.5) / 14) * Math.PI) * (16 + open * 30);
				return <path key={i} d={`M ${x} ${y} l 6 ${12 + open * 14} l 6 ${-12 - open * 14} Z`} fill="#efeae2" />;
			})}
		</g>
	);
};

/** La sonrisa sola, brillando en la oscuridad (antes del susto) */
export const GlowingGrin: React.FC<{frame: number; size?: number}> = ({frame, size = 1}) => {
	const flick = 0.75 + 0.25 * Math.sin(frame / 4);
	return (
		<g transform={`scale(${size})`} opacity={flick}>
			<ellipse cx={-30} cy={-40} rx={12} ry={8} fill="#f4f6ff" filter="url(#glow)" />
			<ellipse cx={30} cy={-40} rx={12} ry={8} fill="#f4f6ff" filter="url(#glow)" />
			<path d="M -70 0 Q 0 60 70 0 Q 0 25 -70 0 Z" fill="#efeae2" filter="url(#glow)" />
			<path d="M -60 6 Q 0 42 60 6" stroke="#0b0508" strokeWidth={3} fill="none" />
			{Array.from({length: 9}).map((_, i) => (
				<line key={i} x1={-48 + i * 12} y1={8 + Math.sin(((i + 0.5) / 9) * Math.PI) * 14} x2={-48 + i * 12} y2={18 + Math.sin(((i + 0.5) / 9) * Math.PI) * 20} stroke="#0b0508" strokeWidth={2} />
			))}
		</g>
	);
};
