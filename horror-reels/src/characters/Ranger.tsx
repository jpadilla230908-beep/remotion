import {random} from 'remotion';

const HAND = {x: 235, y: 115};
const tremble = (frame: number, scared: boolean) => (scared ? Math.sin(frame * 1.7) * 2.5 : 0);
const breathe = (frame: number, scared: boolean) => Math.sin(frame / (scared ? 9 : 20)) * 3;

/**
 * Punto exacto del cristal de la linterna, relativo al origen donde se coloca
 * <Ranger> (incluye el temblor y la respiración), para que el haz salga de ahí.
 */
export const flashlightTip = (frame: number, mood: 'normal' | 'scared', scale: number, angle: number) => {
	const a = (angle * Math.PI) / 180;
	const dx = 73;
	const dy = 0;
	const scared = mood === 'scared';
	return {
		x: tremble(frame, scared) + scale * (HAND.x + dx * Math.cos(a) - dy * Math.sin(a)),
		y: breathe(frame, scared) + scale * (HAND.y + dx * Math.sin(a) + dy * Math.cos(a)),
	};
};

/**
 * Tomás, el guardabosques. Chibi como Lucía: centro de la cabeza en (0,0).
 * mood: normal | scared. flashlight: brazo derecho levantado con la linterna
 * (el haz de luz lo dibuja el escenario). mouth 0..1 = lip-sync.
 */
export const Ranger: React.FC<{
	frame: number;
	mood: 'normal' | 'scared';
	look: number;
	mouth: number;
	flashlight?: boolean;
	/** ángulo de la linterna en grados (0 = horizontal a la derecha) */
	flashAngle?: number;
	scale?: number;
}> = ({frame, mood, look, mouth, flashlight = false, flashAngle = -20, scale = 1}) => {
	const scared = mood === 'scared';
	const cycle = frame % 110;
	const blinkStart = 90 + Math.floor(random(`rblink-${Math.floor(frame / 110)}`) * 12);
	const blink = cycle >= blinkStart && cycle < blinkStart + 4 ? 0.12 : 1;
	const tr = tremble(frame, scared);
	const br = breathe(frame, scared);
	const eyeRy = (scared ? 26 : 20) * blink;
	const lookX = look * 8 + (scared ? Math.sin(frame * 0.8) * 2 : 0);
	const open = Math.min(1, mouth);
	const skin = '#e2b896';
	return (
		<g transform={`translate(${tr}, ${br}) scale(${scale})`}>
			{/* cuerpo: camisa caqui, chaleco verde */}
			<path d="M -120 120 Q -150 330 -165 380 L 165 380 Q 150 330 120 120 Z" fill="#8a7a52" />
			<path d="M -120 120 Q -140 300 -150 380 L -60 380 L -40 140 Z M 120 120 Q 140 300 150 380 L 60 380 L 40 140 Z" fill="#3f5a3a" />
			{/* placa */}
			<path d="M 70 190 l 14 -10 l 14 10 l -4 18 l -20 0 Z" fill="#d9b25a" />
			{/* brazo izquierdo */}
			<path d="M -125 150 Q -175 240 -150 300" stroke="#8a7a52" strokeWidth={46} strokeLinecap="round" fill="none" />
			<circle cx={-150} cy={305} r={26} fill={skin} />
			{/* brazo derecho: con linterna levantada o abajo */}
			{flashlight ? (
				<>
					<path d="M 125 150 Q 200 170 230 120" stroke="#8a7a52" strokeWidth={46} strokeLinecap="round" fill="none" />
					<circle cx={235} cy={115} r={26} fill={skin} />
					<g transform={`rotate(${flashAngle} ${HAND.x} ${HAND.y})`}>
						<rect x={230} y={100} width={70} height={30} rx={8} fill="#2b2b33" />
						<rect x={292} y={95} width={16} height={40} rx={4} fill="#fff1c2" />
					</g>
				</>
			) : (
				<>
					<path d="M 125 150 Q 175 240 150 300" stroke="#8a7a52" strokeWidth={46} strokeLinecap="round" fill="none" />
					<circle cx={150} cy={305} r={26} fill={skin} />
				</>
			)}
			{/* cabeza */}
			<circle cx={0} cy={0} r={132} fill={skin} />
			{/* orejas */}
			<circle cx={-128} cy={20} r={22} fill={skin} />
			<circle cx={128} cy={20} r={22} fill={skin} />
			{/* barba */}
			<path d="M -118 20 Q -120 140 0 150 Q 120 140 118 20 Q 90 70 60 62 Q 0 90 -60 62 Q -90 70 -118 20 Z" fill="#5b3a24" />
			{/* bigote */}
			<path d="M -48 52 Q -20 36 0 50 Q 20 36 48 52 Q 30 66 0 58 Q -30 66 -48 52 Z" fill="#4a2e1c" />
			{/* boca (dentro de la barba) */}
			{open > 0.05 ? (
				<ellipse cx={0} cy={80} rx={12 + open * 8} ry={3 + open * 16} fill="#3a1414" />
			) : scared ? (
				<ellipse cx={0} cy={80} rx={10} ry={9} fill="#3a1414" />
			) : (
				<path d="M -16 78 Q 0 86 16 78" stroke="#3a1414" strokeWidth={6} fill="none" strokeLinecap="round" />
			)}
			{/* ojos */}
			{[-46, 46].map((x) => (
				<g key={x}>
					<ellipse cx={x} cy={-8} rx={22} ry={eyeRy} fill="#fff" />
					{blink > 0.5 && <circle cx={x + lookX} cy={-6} r={scared ? 7 : 10} fill="#1b1b2b" />}
				</g>
			))}
			{/* cejas */}
			{scared ? (
				<>
					<path d="M -76 -52 L -26 -62" stroke="#4a2e1c" strokeWidth={10} strokeLinecap="round" />
					<path d="M 76 -52 L 26 -62" stroke="#4a2e1c" strokeWidth={10} strokeLinecap="round" />
				</>
			) : (
				<>
					<path d="M -74 -44 L -24 -48" stroke="#4a2e1c" strokeWidth={10} strokeLinecap="round" />
					<path d="M 74 -44 L 24 -48" stroke="#4a2e1c" strokeWidth={10} strokeLinecap="round" />
				</>
			)}
			{/* nariz */}
			<ellipse cx={0} cy={30} rx={16} ry={12} fill="#c99673" />
			{/* sombrero de guardabosques */}
			<ellipse cx={0} cy={-88} rx={190} ry={34} fill="#6b5232" />
			<path d="M -95 -92 Q -100 -190 0 -196 Q 100 -190 95 -92 Z" fill="#7d6038" />
			<path d="M -95 -110 Q 0 -96 95 -110 L 95 -92 Q 0 -78 -95 -92 Z" fill="#3a2a18" />
			<path d="M -20 -196 Q 0 -170 20 -196" stroke="#5e4629" strokeWidth={8} fill="none" />
			{/* sudor */}
			{scared && <path d="M 116 -40 q 10 22 0 30 q -10 -8 0 -30 Z" fill="#9fd3ff" opacity={0.85} />}
		</g>
	);
};
