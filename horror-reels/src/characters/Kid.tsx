import {interpolate, random} from 'remotion';
import type {Mood} from '../types';

/**
 * Lucía: niña chibi. Dibujada con el centro de la cabeza en (0,0).
 * mouth 0..1 viene del volumen de la voz (lip-sync).
 */
export const Kid: React.FC<{
	frame: number;
	mood: Mood;
	look: number;
	mouth: number;
	scale?: number;
}> = ({frame, mood, look, mouth, scale = 1}) => {
	const scared = mood === 'scared' || mood === 'hiding';
	const sleeping = mood === 'sleeping';
	// parpadeo cada ~3 s con algo de azar
	const cycle = frame % 95;
	const blinkStart = 80 + Math.floor(random(`blink-${Math.floor(frame / 95)}`) * 10);
	const blink = cycle >= blinkStart && cycle < blinkStart + 4 ? 0.12 : 1;
	const tremble = scared ? Math.sin(frame * 1.9) * 2.5 : 0;
	const breathe = sleeping ? Math.sin(frame / 40) * 4 : Math.sin(frame / 18) * 3;
	const eyeRy = (scared ? 38 : 31) * blink;
	const pupilR = scared ? 9 : 13;
	const lookX = look * 9 + (scared ? Math.sin(frame * 0.7) * 2 : 0);
	const mouthOpen = Math.min(1, mouth);

	return (
		<g transform={`translate(${tremble}, ${breathe}) scale(${scale})`}>
			{/* cuerpo / pijama */}
			<path d="M -95 120 Q -120 330 -140 360 L 140 360 Q 120 330 95 120 Z" fill="#6d5bc4" />
			<circle cx={-40} cy={210} r={8} fill="#f7e27a" opacity={0.8} />
			<circle cx={50} cy={260} r={6} fill="#f7e27a" opacity={0.8} />
			<circle cx={-10} cy={310} r={7} fill="#f7e27a" opacity={0.8} />
			{/* manos */}
			<circle cx={-100} cy={250 + (scared ? -50 : 0)} r={26} fill="#e8c6b3" />
			<circle cx={100} cy={250 + (scared ? -50 : 0)} r={26} fill="#e8c6b3" />
			{/* pelo trasero */}
			<path d="M -150 -10 Q -160 -170 0 -165 Q 160 -170 150 -10 L 155 110 Q 0 140 -155 110 Z" fill="#2a1b18" />
			{/* cara */}
			<circle cx={0} cy={0} r={128} fill="#ecc9b6" />
			{/* flequillo */}
			<path d="M -130 -20 Q -120 -150 0 -140 Q 120 -150 130 -20 Q 90 -80 40 -70 Q 0 -100 -40 -70 Q -90 -80 -130 -20 Z" fill="#2a1b18" />
			{/* lazo */}
			<path d="M 80 -120 l 45 -30 l 5 50 Z M 80 -120 l 50 15 l -20 35 Z" fill="#c2334a" />
			{/* mejillas */}
			<ellipse cx={-70} cy={45} rx={22} ry={12} fill="#e48a8a" opacity={scared ? 0.25 : 0.55} />
			<ellipse cx={70} cy={45} rx={22} ry={12} fill="#e48a8a" opacity={scared ? 0.25 : 0.55} />
			{/* cejas */}
			{scared ? (
				<>
					<path d="M -78 -48 L -28 -60" stroke="#2a1b18" strokeWidth={8} strokeLinecap="round" />
					<path d="M 78 -48 L 28 -60" stroke="#2a1b18" strokeWidth={8} strokeLinecap="round" />
				</>
			) : (
				<>
					<path d="M -75 -45 Q -50 -55 -25 -45" stroke="#2a1b18" strokeWidth={7} fill="none" strokeLinecap="round" />
					<path d="M 75 -45 Q 50 -55 25 -45" stroke="#2a1b18" strokeWidth={7} fill="none" strokeLinecap="round" />
				</>
			)}
			{/* ojos */}
			{sleeping
				? [-48, 48].map((x) => (
						<path key={x} d={`M ${x - 24} 8 Q ${x} 26 ${x + 24} 8`} stroke="#2a1b18" strokeWidth={7} fill="none" strokeLinecap="round" />
					))
				: [-48, 48].map((x) => (
				<g key={x}>
					<ellipse cx={x} cy={5} rx={27} ry={eyeRy} fill="#fff" />
					{blink > 0.5 && (
						<>
							<circle cx={x + lookX} cy={8} r={pupilR} fill="#1b1b2b" />
							<circle cx={x + lookX + 4} cy={2} r={4} fill="#fff" />
						</>
					)}
				</g>
			))}
			{/* boca */}
			{sleeping ? (
				<ellipse cx={0} cy={74} rx={8} ry={4 + Math.max(0, Math.sin(frame / 40)) * 3} fill="#5a1e24" />
			) : mouthOpen > 0.05 ? (
				<ellipse cx={0} cy={72} rx={12 + mouthOpen * 6} ry={3 + mouthOpen * 16} fill="#5a1e24" />
			) : scared ? (
				<ellipse cx={0} cy={74} rx={9} ry={11} fill="#5a1e24" />
			) : (
				<path d="M -14 70 Q 0 80 14 70" stroke="#5a1e24" strokeWidth={6} fill="none" strokeLinecap="round" />
			)}
			{/* gota de sudor */}
			{scared && (
				<path
					d="M 112 -40 q 10 22 0 30 q -10 -8 0 -30 Z"
					fill="#9fd3ff"
					opacity={interpolate(Math.sin(frame / 6), [-1, 1], [0.4, 0.9])}
				/>
			)}
		</g>
	);
};
