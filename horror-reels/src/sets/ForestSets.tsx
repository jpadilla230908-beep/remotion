import {interpolate, random} from 'remotion';
import {CreatureBody, CreatureEyes, CreatureFace} from '../characters/Creature';
import {Ranger} from '../characters/Ranger';
import type {SceneCtx} from '../types';

const W = 1080;
const H = 1920;

const Pine: React.FC<{x: number; base: number; h: number; color: string}> = ({x, base, h, color}) => {
	const w = h * 0.42;
	return (
		<g fill={color}>
			<rect x={x - h * 0.03} y={base - h * 0.25} width={h * 0.06} height={h * 0.25} />
			{[0, 1, 2].map((i) => {
				const top = base - h + i * h * 0.22;
				const bw = w * (0.55 + i * 0.25);
				return <polygon key={i} points={`${x},${top} ${x - bw / 2},${top + h * 0.42} ${x + bw / 2},${top + h * 0.42}`} />;
			})}
		</g>
	);
};

const trees = (seed: string, n: number, base: number, hMin: number, hMax: number) =>
	Array.from({length: n}).map((_, i) => ({
		x: (i + 0.5) * (W / n) + (random(`${seed}x${i}`) - 0.5) * (W / n) * 0.8,
		h: hMin + random(`${seed}h${i}`) * (hMax - hMin),
		base: base + random(`${seed}b${i}`) * 40,
	}));
const FAR = trees('far', 13, 1260, 520, 820);
const MID = trees('mid', 6, 1470, 900, 1250);

const Fog: React.FC<{f: number; y: number}> = ({f, y}) => (
	<g opacity={0.07}>
		{[0, 1, 2].map((i) => (
			<ellipse key={i} cx={((f * (0.6 + i * 0.3) + i * 400) % (W + 600)) - 300} cy={y + i * 60} rx={420} ry={60} fill="#dfe8ff" />
		))}
	</g>
);

const Sky: React.FC = () => (
	<>
		<defs>
			<linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#060914" />
				<stop offset="55%" stopColor="#1b2a52" />
				<stop offset="75%" stopColor="#2c3f70" />
			</linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#forestSky)" />
		<circle cx={860} cy={300} r={200} fill="url(#moonGlow)" />
		<circle cx={860} cy={300} r={62} fill="#eef2ff" />
		<circle cx={838} cy={285} r={11} fill="#cfd6ee" />
	</>
);

const Beam: React.FC<{x: number; y: number; angle: number; len?: number}> = ({x, y, angle, len = 900}) => (
	<g transform={`translate(${x}, ${y}) rotate(${angle})`}>
		<polygon points={`0,-14 ${len},-${len * 0.32} ${len},${len * 0.32} 0,14`} fill="#ffe9b0" opacity={0.16} />
		<polygon points={`0,-8 ${len},-${len * 0.16} ${len},${len * 0.16} 0,8`} fill="#ffe9b0" opacity={0.14} />
	</g>
);

/* ---------------- BOSQUE (plano general) ---------------- */
export const Forest: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const r = ctx.scene.ranger;
	const walk = r && r.mood === 'normal' ? Math.abs(Math.sin(ctx.f / 7)) * -10 : 0;
	const where = ctx.scene.creature?.where;
	const farOpacity = interpolate(ctx.f, [ctx.dur * 0.35, ctx.dur * 0.6], [0, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<g>
			<Sky />
			{FAR.map((t, i) => (
				<Pine key={i} x={t.x} base={t.base} h={t.h} color="#0d1424" />
			))}
			{/* suelo lejano del bosque */}
			<rect x={0} y={1240} width={W} height={220} fill="#0a0f1a" />
			<Fog f={ctx.f} y={1150} />
			{MID.map((t, i) => (
				<Pine key={i} x={t.x} base={t.base} h={t.h} color="#05080e" />
			))}
			{where === 'far' && (
				<g transform="translate(615, 1300) scale(0.46)">
					<CreatureBody frame={ctx.f} opacity={farOpacity} />
				</g>
			)}
			<rect x={0} y={1440} width={W} height={H - 1440} fill="#070b10" />
			<path d="M 380 1920 Q 470 1600 540 1450 L 600 1450 Q 650 1600 760 1920 Z" fill="#111822" />
			<Fog f={ctx.f + 300} y={1420} />
			{r && (
				<g transform={`translate(${r.x}, ${1330 + walk})`}>
					<Ranger frame={ctx.f} mood={r.mood} look={r.look} mouth={ctx.scene.speaker === 'tomas' ? ctx.mouth : 0} flashlight={r.flashlight} scale={0.62} />
				</g>
			)}
			{r?.flashlight && <Beam x={r.x + 190} y={1330 - 45} angle={-12 + Math.sin(ctx.f / 25) * 10} />}
			{/* arbustos delante */}
			<g fill="#05080c">
				<ellipse cx={170} cy={1600} rx={230} ry={120} />
				<ellipse cx={330} cy={1640} rx={180} ry={100} />
				<ellipse cx={980} cy={1620} rx={240} ry={130} />
			</g>
			{where === 'bushes' && ctx.f > ctx.dur * 0.3 && (
				<g transform="translate(200, 1580)">
					<CreatureEyes frame={ctx.f} size={1.1} gap={70} />
				</g>
			)}
		</g>
	);
};

/* ---------------- SENDERO (linterna en la oscuridad) ---------------- */
export const ForestPath: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const r = ctx.scene.ranger ?? {x: 380, mood: 'scared' as const, look: 1, flashlight: true};
	const angle = -18 + Math.sin(ctx.f / 16) * 28;
	// los ojos aparecen a la izquierda cuando la linterna mira a la derecha
	const eyesOn = ctx.scene.creature?.where === 'dark' && Math.sin(ctx.f / 16) > 0.3;
	return (
		<g>
			<rect width={W} height={H} fill="#04060b" />
			{[120, 330, 760, 980].map((x, i) => (
				<rect key={i} x={x - 45} y={0} width={90 + (i % 2) * 30} height={1500} fill="#0a0f18" />
			))}
			<Beam x={r.x + 150} y={1180 - 40} angle={angle} len={1100} />
			{/* troncos iluminados dentro del haz (más claros) */}
			<g opacity={0.25}>
				{[760, 980].map((x, i) => (
					<rect key={i} x={x - 45} y={0} width={90 + (i % 2) * 30} height={1500} fill="#4a4030" opacity={Math.max(0, Math.cos(((angle + 10) * Math.PI) / 90))} />
				))}
			</g>
			<rect x={0} y={1480} width={W} height={H - 1480} fill="#06090e" />
			{eyesOn && (
				<g transform="translate(150, 820)">
					<CreatureEyes frame={ctx.f} size={0.9} gap={50} />
				</g>
			)}
			<g transform={`translate(${r.x}, 1240)`}>
				<Ranger frame={ctx.f} mood={r.mood} look={r.look} mouth={ctx.scene.speaker === 'tomas' ? ctx.mouth : 0} flashlight scale={0.95} />
			</g>
		</g>
	);
};

/* ---------------- CABAÑA (interior con radio) ---------------- */
const Planks: React.FC = () => (
	<>
		<rect width={W} height={H} fill="#3a2618" />
		{Array.from({length: 22}).map((_, i) => (
			<line key={i} x1={0} y1={i * 70} x2={W} y2={i * 70} stroke="#2b1b10" strokeWidth={6} />
		))}
	</>
);

const WindowView: React.FC<{f: number; x: number; y: number; w: number; h: number; hand: number}> = ({f, x, y, w, h, hand}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} fill="#0a0f22" />
		<circle cx={x + w * 0.75} cy={y + h * 0.25} r={w * 0.1} fill="#eef2ff" opacity={0.9} />
		{[0.1, 0.3, 0.55, 0.8, 0.95].map((k, i) => (
			<polygon key={i} points={`${x + k * w},${y + h * 0.35} ${x + k * w - w * 0.09},${y + h} ${x + k * w + w * 0.09},${y + h}`} fill="#0b111d" />
		))}
		<g opacity={0.12}>
			<ellipse cx={x + ((f * 1.2) % w)} cy={y + h * 0.85} rx={w * 0.4} ry={h * 0.06} fill="#dfe8ff" />
		</g>
		{/* huella de mano en el cristal, por dentro */}
		{hand > 0 && (
			<g transform={`translate(${x + w * 0.42}, ${y + h * 0.48}) scale(${w / 480})`} opacity={hand} fill="#e9eef2">
				<ellipse cx={0} cy={40} rx={46} ry={56} />
				<rect x={-46} y={-70} width={16} height={90} rx={8} />
				<rect x={-24} y={-92} width={16} height={110} rx={8} />
				<rect x={-2} y={-96} width={16} height={114} rx={8} />
				<rect x={20} y={-84} width={16} height={104} rx={8} />
				<rect x={44} y={-10} width={16} height={70} rx={8} transform="rotate(-35 52 30)" />
			</g>
		)}
		<rect x={x} y={y} width={w} height={h} fill="none" stroke="#5a3a22" strokeWidth={26} />
		<line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#5a3a22" strokeWidth={18} />
		<line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#5a3a22" strokeWidth={18} />
	</g>
);

export const Cabin: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const r = ctx.scene.ranger;
	const radioTalk = ctx.scene.speaker === 'radio';
	const led = radioTalk ? 0.6 + 0.4 * ctx.mouth : Math.floor(ctx.f / 20) % 2 ? 1 : 0.4;
	return (
		<g>
			<Planks />
			<WindowView f={ctx.f} x={330} y={330} w={440} h={460} hand={0} />
			{/* puerta con cerrojo */}
			<rect x={40} y={760} width={250} height={700} fill="#4a3020" stroke="#22150c" strokeWidth={10} />
			<rect x={250} y={1080} width={40} height={18} fill="#9a9aa2" />
			<rect x={230} y={1072} width={26} height={34} rx={4} fill="#7a7a82" />
			{/* lámpara cálida */}
			<circle cx={900} cy={420} r={420} fill="url(#lamp)" opacity={0.7} />
			<line x1={900} y1={0} x2={900} y2={330} stroke="#111" strokeWidth={4} />
			<path d="M 860 330 L 940 330 L 920 290 L 880 290 Z" fill="#2b2b2b" />
			<circle cx={900} cy={338} r={10} fill="#fff1c2" filter="url(#glow)" />
			{/* suelo */}
			<rect x={0} y={1460} width={W} height={H - 1460} fill="#24170e" />
			{/* mesa y radio */}
			<rect x={620} y={1250} width={420} height={30} fill="#5a3a22" />
			<rect x={650} y={1280} width={24} height={180} fill="#4a2e1a" />
			<rect x={990} y={1280} width={24} height={180} fill="#4a2e1a" />
			<rect x={700} y={1110} width={260} height={140} rx={12} fill="#2f3530" stroke="#1b1f1c" strokeWidth={6} />
			<line x1={930} y1={1110} x2={980} y2={960} stroke="#888" strokeWidth={6} />
			<circle cx={760} cy={1180} r={30} fill="#1b1f1c" />
			<circle cx={760} cy={1180} r={18} fill="#3a403b" />
			<rect x={810} y={1140} width={120} height={36} rx={6} fill="#c8d8b0" opacity={0.85} />
			<circle cx={910} cy={1220} r={9} fill="#ff2b2b" opacity={led} filter="url(#glow)" />
			{radioTalk && (
				<g stroke="#c8d8b0" strokeWidth={5} fill="none" opacity={0.3 + ctx.mouth * 0.7}>
					<path d="M 990 1120 q 30 60 0 120" />
					<path d="M 1020 1100 q 45 80 0 160" />
				</g>
			)}
			{r && (
				<g transform={`translate(${r.x}, 1150)`}>
					<Ranger frame={ctx.f} mood={r.mood} look={r.look} mouth={ctx.scene.speaker === 'tomas' ? ctx.mouth : 0} scale={0.8} />
				</g>
			)}
		</g>
	);
};

/* ---------------- VENTANA (primer plano) ---------------- */
export const CabinWindow: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const hand = ctx.scene.handprint ? interpolate(ctx.f, [ctx.dur * 0.45, ctx.dur * 0.8], [0, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
	return (
		<g>
			<Planks />
			<WindowView f={ctx.f} x={90} y={300} w={900} h={1200} hand={hand} />
		</g>
	);
};

/* ---------------- SUSTO EN LA CABAÑA ---------------- */
export const CabinScare: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const hit = ctx.hitF;
	const reveal = interpolate(ctx.f, [hit - 1, hit], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = interpolate(ctx.f, [hit - 1, hit + 2, hit + 40], [0.5, 2.0, 2.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const eyesIn = interpolate(ctx.f, [0, hit], [0.6, 1.1], {extrapolateRight: 'clamp'});
	const r = ctx.scene.ranger;
	return (
		<g>
			<rect width={W} height={H} fill="#0c0806" />
			{/* marco de la puerta oscura detrás de Tomás */}
			<rect x={560} y={420} width={360} height={1060} fill="#020203" stroke="#2b1b10" strokeWidth={16} />
			{reveal < 1 && ctx.f > hit * 0.3 && (
				<g transform={`translate(740, 720) scale(${eyesIn})`} opacity={1 - reveal}>
					<CreatureEyes frame={ctx.f + 40} size={0.9} gap={60} />
				</g>
			)}
			<rect x={0} y={1460} width={W} height={H - 1460} fill="#1a110a" />
			{r && reveal < 1 && (
				<g transform={`translate(${r.x}, 1200)`}>
					<Ranger frame={ctx.f} mood={r.mood} look={r.look} mouth={0} scale={1.05} />
				</g>
			)}
			{reveal > 0 && (
				<g transform={`translate(540, 900) scale(${scale}) rotate(${-6 + Math.sin(ctx.f * 2.1) * 3})`} opacity={reveal}>
					<CreatureFace frame={ctx.f} scream={reveal} />
				</g>
			)}
		</g>
	);
};
