import {random} from 'remotion';

/**
 * La Llorona de espaldas, arrodillada: vestido blanco, pelo negro larguísimo y velo.
 * Origen (0,0) en el suelo, centro de la falda. sob 0..1: cuánto solloza (le tiemblan los hombros).
 * turn 0..1: gira la cabeza y deja ver un lado de la cara, lisa, sin rasgos.
 */
export const LloronaBack: React.FC<{frame: number; sob?: number; turn?: number; glow?: number}> = ({frame, sob = 1, turn = 0, glow = 0}) => {
	const shake = Math.sin(frame * 0.9) * 4 * sob;
	return (
		<g>
			{glow > 0 && <ellipse cx={0} cy={-330} rx={300} ry={420} fill="#dfe8ff" opacity={0.07 * glow} />}
			{/* falda extendida en el suelo */}
			<path d="M -230 0 Q -170 -280 -95 -380 L 95 -380 Q 170 -280 230 0 Q 0 34 -230 0 Z" fill="#e6eaee" />
			<path d="M -150 -10 Q -110 -200 -60 -370 M 0 10 L 0 -370 M 150 -10 Q 110 -200 60 -370" stroke="#c2c9cf" strokeWidth={6} fill="none" />
			<g transform={`translate(0, ${shake})`}>
				{/* espalda y hombros, cabeza agachada */}
				<path d="M -82 -372 Q -96 -470 -116 -540 Q -62 -580 0 -582 Q 62 -580 116 -540 Q 96 -470 82 -372 Z" fill="#eef1f4" />
				{/* brazos doblados hacia delante (se tapa la cara con las manos) */}
				<path d="M -112 -536 Q -150 -470 -118 -410" stroke="#e3e7eb" strokeWidth={34} strokeLinecap="round" fill="none" />
				<path d="M 112 -536 Q 150 -470 118 -410" stroke="#e3e7eb" strokeWidth={34} strokeLinecap="round" fill="none" />
				{/* lado de la cara al girar: pálido y liso */}
				{turn > 0 && <ellipse cx={-38 * turn} cy={-610} rx={48} ry={60} fill="#e9ecef" />}
				{/* cabeza */}
				<ellipse cx={14 * turn} cy={-614} rx={54} ry={64} fill="#08080d" />
				{/* melena negra larguísima por la espalda */}
				<path d={`M ${-56 + 14 * turn} -640 Q -82 -540 -74 -420 Q -66 -320 -46 -268 Q -20 -250 0 -262 Q 22 -248 46 -268 Q 66 -320 74 -420 Q 82 -540 ${56 + 14 * turn} -640 Z`} fill="#08080d" />
				<path d="M -30 -560 Q -36 -420 -24 -300 M 18 -560 Q 24 -420 14 -290" stroke="#1c1c26" strokeWidth={4} fill="none" />
				{/* velo */}
				<path d="M -70 -680 Q 0 -715 70 -680 Q 140 -560 130 -380 Q 0 -350 -130 -380 Q -140 -560 -70 -680 Z" fill="#ffffff" opacity={0.2} />
			</g>
		</g>
	);
};

/** Cara de la Llorona para el susto: sin ojos ni nariz, solo lágrimas negras y la boca. */
export const LloronaFace: React.FC<{frame: number; scream: number}> = ({frame, scream}) => {
	const jitter = (random(`lf-${frame}`) - 0.5) * 6;
	const open = scream;
	return (
		<g transform={`translate(${jitter}, 0)`}>
			{/* pelo */}
			<path d="M -160 -40 Q -180 -240 0 -245 Q 180 -240 160 -40 L 200 460 Q 0 510 -200 460 Z" fill="#101016" stroke="#3a3a4a" strokeWidth={6} />
			{/* cara lisa */}
			<ellipse cx={0} cy={10} rx={122} ry={165} fill="#e9ecef" />
			<ellipse cx={0} cy={10} rx={122} ry={165} fill="#1d2333" opacity={0.18} />
			{/* donde deberían estar los ojos: solo piel, y lágrimas negras que caen */}
			<path d="M -50 -36 Q -58 20 -52 70 Q -48 110 -58 160 M 50 -36 Q 58 20 52 70 Q 48 110 58 160" stroke="#1a0c12" strokeWidth={11} strokeLinecap="round" fill="none" />
			<ellipse cx={-50} cy={-42} rx={22} ry={6} fill="#c9cdd2" />
			<ellipse cx={50} cy={-42} rx={22} ry={6} fill="#c9cdd2" />
			{/* boca: lo único que tiene */}
			<ellipse cx={0} cy={100} rx={18 + open * 36} ry={8 + open * 72} fill="#0b0508" />
			{/* velo */}
			<path d="M -150 -150 Q 0 -280 150 -150 Q 175 100 165 300 Q 0 330 -165 300 Q -175 100 -150 -150 Z" fill="#ffffff" opacity={0.14} />
		</g>
	);
};
