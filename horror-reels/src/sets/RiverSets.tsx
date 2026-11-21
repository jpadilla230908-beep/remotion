import {interpolate, random} from 'remotion';
import {Kid} from '../characters/Kid';
import {LloronaBack, LloronaFace} from '../characters/Llorona';
import type {SceneCtx} from '../types';

const W = 1080;
const H = 1920;

const Night: React.FC = () => (
	<>
		<defs>
			<linearGradient id="riverSky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#05070f" />
				<stop offset="45%" stopColor="#141d3a" />
				<stop offset="60%" stopColor="#223160" />
			</linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#riverSky)" />
		<circle cx={300} cy={330} r={200} fill="url(#moonGlow)" />
		<circle cx={300} cy={330} r={58} fill="#eef2ff" />
	</>
);

/** Línea de árboles en la otra orilla */
const FarTrees: React.FC = () => (
	<g fill="#070a14">
		{Array.from({length: 16}).map((_, i) => {
			const x = i * 72 + random(`rt${i}`) * 30;
			const h = 180 + random(`rh${i}`) * 220;
			return <ellipse key={i} cx={x} cy={1120 - h / 2} rx={70} ry={h / 2 + 20} />;
		})}
		<rect x={0} y={1080} width={W} height={80} />
	</g>
);

const Water: React.FC<{f: number; top: number; bottom: number}> = ({f, top, bottom}) => (
	<g>
		<rect x={0} y={top} width={W} height={bottom - top} fill="#0b1226" />
		{/* reflejo de la luna, tembloroso */}
		{Array.from({length: 10}).map((_, i) => {
			const y = top + 20 + i * ((bottom - top - 40) / 10);
			const w = 60 + random(`rw${i}`) * 90 + Math.sin(f / 9 + i) * 18;
			return <ellipse key={i} cx={300 + Math.sin(f / 13 + i * 1.7) * 10} cy={y} rx={w} ry={4} fill="#dfe8ff" opacity={0.25 - i * 0.015} />;
		})}
		{/* ondas */}
		{Array.from({length: 8}).map((_, i) => (
			<path
				key={i}
				d={`M ${((f * 1.5 + i * 160) % (W + 200)) - 200} ${top + 30 + i * 32} q 40 -8 80 0 t 80 0`}
				stroke="#2a3a66"
				strokeWidth={3}
				fill="none"
				opacity={0.6}
			/>
		))}
	</g>
);

const Reeds: React.FC<{f: number; y: number; n?: number}> = ({f, y, n = 26}) => (
	<g stroke="#05070a" strokeWidth={9} strokeLinecap="round" fill="none">
		{Array.from({length: n}).map((_, i) => {
			const x = (i / n) * W + random(`rd${i}`) * 30;
			const h = 120 + random(`rdh${i}`) * 160;
			const sway = Math.sin(f / 22 + i) * 10;
			return <path key={i} d={`M ${x} ${y} q ${sway} ${-h / 2} ${sway * 2} ${-h}`} />;
		})}
	</g>
);

const Fog: React.FC<{f: number; y: number}> = ({f, y}) => (
	<g opacity={0.08}>
		{[0, 1, 2].map((i) => (
			<ellipse key={i} cx={((f * (0.5 + i * 0.25) + i * 380) % (W + 600)) - 300} cy={y + i * 50} rx={460} ry={55} fill="#dfe8ff" />
		))}
	</g>
);

/* ---------------- RÍO (plano general) ---------------- */
export const River: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const k = ctx.scene.kid;
	const far = ctx.scene.llorona?.where === 'far';
	const walk = k ? Math.abs(Math.sin(ctx.f / 8)) * -8 : 0;
	return (
		<g>
			<Night />
			<FarTrees />
			<Water f={ctx.f} top={1150} bottom={1470} />
			{far && (
				<g transform="translate(790, 1185) scale(0.3)" opacity={interpolate(ctx.f, [0, 30], [0, 1], {extrapolateRight: 'clamp'})}>
					<LloronaBack frame={ctx.f} sob={1} glow={1} />
				</g>
			)}
			<Fog f={ctx.f} y={1130} />
			{/* orilla cercana */}
			<path d="M 0 1450 Q 300 1420 540 1460 Q 800 1500 1080 1450 L 1080 1920 L 0 1920 Z" fill="#0a0d12" />
			{k && (
				<g transform={`translate(${k.x}, ${1430 + walk})`}>
					<Kid frame={ctx.f} mood={k.mood} look={k.look} mouth={ctx.scene.speaker === 'mateo' ? ctx.mouth : 0} scale={0.6} variant={k.variant} />
				</g>
			)}
			<Reeds f={ctx.f} y={1700} />
			<Fog f={ctx.f + 200} y={1500} />
		</g>
	);
};

/* ---------------- ORILLA: la mujer de espaldas ---------------- */
export const RiverBank: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const k = ctx.scene.kid;
	// deja de sollozar en la segunda mitad si la escena lo pide
	const sob = ctx.scene.llorona?.turn ? interpolate(ctx.f, [0, ctx.dur * 0.35], [1, 0], {extrapolateRight: 'clamp'}) : 1;
	const turn = ctx.scene.llorona?.turn ? interpolate(ctx.f, [ctx.dur * 0.5, ctx.dur * 0.95], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
	return (
		<g>
			<Night />
			<FarTrees />
			<Water f={ctx.f} top={1150} bottom={1560} />
			<Fog f={ctx.f} y={1200} />
			<path d="M 0 1520 Q 300 1500 540 1530 Q 800 1560 1080 1520 L 1080 1920 L 0 1920 Z" fill="#0a0d12" />
			<g transform="translate(470, 1560)">
				<LloronaBack frame={ctx.f} sob={sob} turn={turn} glow={1} />
			</g>
			{k && (
				<g transform={`translate(${k.x}, 1560)`}>
					<Kid frame={ctx.f} mood={k.mood} look={k.look} mouth={ctx.scene.speaker === 'mateo' ? ctx.mouth : 0} scale={0.55} variant={k.variant} />
				</g>
			)}
			<Reeds f={ctx.f} y={1920} n={14} />
		</g>
	);
};

/* ---------------- SUSTO: se da la vuelta ---------------- */
export const RiverScare: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const hit = ctx.hitF;
	const reveal = interpolate(ctx.f, [hit - 1, hit], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = interpolate(ctx.f, [hit - 1, hit + 2, hit + 40], [0.5, 2.0, 2.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const turn = interpolate(ctx.f, [0, hit], [0.55, 0.95], {extrapolateRight: 'clamp'});
	return (
		<g>
			<Night />
			<FarTrees />
			<Water f={ctx.f} top={1150} bottom={1560} />
			<rect width={W} height={H} fill="#000" opacity={0.35} />
			{reveal < 1 && (
				<g transform="translate(540, 1700) scale(1.5)">
					<LloronaBack frame={ctx.f} sob={0} turn={turn} glow={1} />
				</g>
			)}
			{reveal > 0 && (
				<g transform={`translate(540, 900) scale(${scale}) rotate(${-4 + Math.sin(ctx.f * 2.3) * 3})`} opacity={reveal}>
					<LloronaFace frame={ctx.f} scream={reveal} />
				</g>
			)}
		</g>
	);
};
