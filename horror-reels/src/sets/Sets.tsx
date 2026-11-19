import {interpolate, random} from 'remotion';
import {Ghost, GhostEyes} from '../characters/Ghost';
import {Kid} from '../characters/Kid';
import {GlowingGrin, MimicFace} from '../characters/Mimic';
import type {SceneCtx} from '../types';

const W = 1080;
const H = 1920;

/** Defs compartidas: gradientes y filtros */
export const Defs: React.FC = () => (
	<defs>
		<radialGradient id="moonGlow">
			<stop offset="0%" stopColor="#dfe8ff" stopOpacity={0.9} />
			<stop offset="100%" stopColor="#dfe8ff" stopOpacity={0} />
		</radialGradient>
		<linearGradient id="moonBeam" x1="1" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#bcd0ff" stopOpacity={0.35} />
			<stop offset="100%" stopColor="#bcd0ff" stopOpacity={0} />
		</linearGradient>
		<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stopColor="#141a33" />
			<stop offset="100%" stopColor="#232a4d" />
		</linearGradient>
		<radialGradient id="ghostShade" cx="0.5" cy="0.35">
			<stop offset="40%" stopColor="#000" stopOpacity={0} />
			<stop offset="100%" stopColor="#1d2333" stopOpacity={0.75} />
		</radialGradient>
		<radialGradient id="lamp">
			<stop offset="0%" stopColor="#ffd98a" stopOpacity={0.55} />
			<stop offset="100%" stopColor="#ffd98a" stopOpacity={0} />
		</radialGradient>
		<filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
			<feGaussianBlur stdDeviation="5" result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>
);

/* ---------------- DORMITORIO ---------------- */

const Wardrobe: React.FC<{open: number; ctx: SceneCtx}> = ({open, ctx}) => {
	const doorW = 200;
	const visible = doorW * (1 - open * 0.88);
	const ghostHere = ctx.scene.ghost?.where === 'closet' && open > 0.05 && open < 0.95;
	return (
		<g>
			<rect x={50} y={540} width={420} height={890} rx={10} fill="#2b1d17" />
			<rect x={70} y={570} width={380} height={840} fill="#020203" />
			{ghostHere && (
				<g transform="translate(300, 820)">
					<GhostEyes frame={ctx.f} size={0.9} gap={50} />
				</g>
			)}
			{/* puerta izquierda */}
			<rect x={70} y={570} width={doorW - 6} height={840} fill="#4a3226" stroke="#21150f" strokeWidth={6} />
			<rect x={100} y={610} width={doorW - 66} height={330} fill="none" stroke="#3a2619" strokeWidth={6} />
			<rect x={100} y={990} width={doorW - 66} height={370} fill="none" stroke="#3a2619" strokeWidth={6} />
			<circle cx={245} cy={990} r={9} fill="#b08a4a" />
			{/* puerta derecha (bisagra a la derecha) */}
			<rect x={450 - visible} y={570} width={visible} height={840} fill="#56392b" stroke="#21150f" strokeWidth={6} />
			{visible > 40 && <circle cx={450 - visible + 22} cy={990} r={9} fill="#b08a4a" />}
			{open > 0 && <rect x={450 - visible - 14} y={570} width={14} height={840} fill="#1a100b" />}
		</g>
	);
};

const Bed: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const kid = ctx.scene.kid;
	// despertar de golpe: antes de wakeAt duerme; al despertar se incorpora de un salto
	const wakeF = kid?.wakeAt !== undefined ? Math.round(kid.wakeAt * 30) : null;
	const sleeping = kid?.mood === 'sleeping' || (wakeF !== null && ctx.f < wakeF);
	const sinceWake = wakeF !== null ? ctx.f - wakeF : 999;
	const jumpY = interpolate(sinceWake, [0, 3, 7, 12], [90, -35, 6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const hiding = kid?.mood === 'hiding';
	const shiver = hiding ? Math.sin(ctx.f * 1.6) * 3 : 0;
	return (
		<g>
			{/* cabecero */}
			<rect x={980} y={930} width={80} height={460} rx={14} fill="#3b2a4a" />
			<rect x={520} y={1180} width={540} height={150} rx={20} fill="#e6e1f0" />
			{/* niña dormida: acostada con la cabeza en la almohada */}
			{kid && sleeping && (
				<>
					<rect x={890} y={1110} width={130} height={90} rx={40} fill="#f4f1fa" />
					<g transform="translate(925, 1135) rotate(80)">
						<Kid frame={ctx.f} mood="sleeping" look={0} mouth={0} scale={0.6} />
					</g>
					{[0, 1, 2].map((i) => {
						const t = ((ctx.f + i * 25) % 75) / 75;
						return (
							<text key={i} x={980 + t * 50 + i * 8} y={1040 - t * 140} fontFamily="Anton, sans-serif" fontSize={34 + i * 10} fill="#cfd8ff" opacity={Math.sin(t * Math.PI) * 0.8}>
								z
							</text>
						);
					})}
				</>
			)}
			{/* niña sentada */}
			{kid && !sleeping && (
				<g transform={`translate(${kid.x}, ${(hiding ? 1105 : 1010) + jumpY})`}>
					<Kid
						frame={ctx.f}
						mood={kid.mood}
						look={kid.look}
						mouth={ctx.scene.speaker === 'lucia' || ctx.scene.speaker === 'valeria' ? ctx.mouth : 0}
						scale={0.85}
						variant={kid.variant}
					/>
					{kid.phone && (
						// teléfono pegado a la oreja, con la pantalla iluminada; tiembla mientras suena
						<g transform={`translate(${118 + (ctx.scene.sfx === 'ring' && ctx.f < 70 ? Math.sin(ctx.f * 3) * 4 : 0)}, 10) rotate(12)`}>
							<circle cx={-60} cy={10} r={150} fill="#9fd3ff" opacity={0.08} />
							<rect x={-22} y={-50} width={44} height={84} rx={8} fill="#15171c" />
							<rect x={-17} y={-43} width={34} height={68} rx={4} fill="#bfe3ff" filter="url(#glow)" />
							<text x={0} y={-8} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={700} fontSize={10} fill="#15171c">MAMÁ</text>
							<text x={0} y={8} textAnchor="middle" fontFamily="monospace" fontSize={9} fill="#15171c">3:33</text>
						</g>
					)}
					{sinceWake >= 0 && sinceWake < 28 && (
						<text
							x={95}
							y={-150}
							fontFamily="Anton, sans-serif"
							fontSize={110}
							fill="#ff2a3a"
							stroke="#000"
							strokeWidth={6}
							paintOrder="stroke"
							transform={`scale(${interpolate(sinceWake, [0, 4, 8], [0.3, 1.25, 1], {extrapolateRight: 'clamp'})})`}
							opacity={interpolate(sinceWake, [20, 28], [1, 0], {extrapolateLeft: 'clamp'})}
						>
							!
						</text>
					)}
				</g>
			)}
			{/* almohada */}
			{!sleeping && <rect x={890} y={1110} width={130} height={90} rx={40} fill="#f4f1fa" />}
			{/* manta */}
			<path
				d={
					sleeping
						? `M 500 1340 Q 515 1190 600 ${1170 + Math.sin(ctx.f / 40) * 4} Q 760 ${1150 + Math.sin(ctx.f / 40) * 5} 880 1160 L 905 1240 L 1060 1240 L 1060 1340 Z`
						: hiding
						? `M 500 1340 Q 520 ${1110 + shiver} 640 ${1085 + shiver} Q 760 ${1050 + shiver} 880 ${1090 + shiver} Q 1020 1120 1060 1340 Z`
						: 'M 500 1340 Q 515 1235 600 1230 L 1060 1235 L 1060 1340 Z'
				}
				fill="#7a3550"
			/>
			<path
				d={hiding ? `M 560 ${1170 + shiver} Q 760 ${1120 + shiver} 980 ${1170 + shiver}` : 'M 540 1280 L 1060 1280'}
				stroke="#9c4b6b"
				strokeWidth={10}
				fill="none"
			/>
			{/* patas */}
			<rect x={530} y={1330} width={30} height={90} fill="#2a1e33" />
			<rect x={1020} y={1330} width={30} height={90} fill="#2a1e33" />
			{/* hueco oscuro debajo de la cama */}
			<rect x={560} y={1340} width={460} height={70} fill="#050508" />
			{ctx.scene.clock && (
				<g transform="translate(870, 760)">
					<rect x={-55} y={-35} width={110} height={60} rx={10} fill="#111" stroke="#333" strokeWidth={4} />
					<text
						x={0}
						y={12}
						textAnchor="middle"
						fontFamily="monospace"
						fontWeight={700}
						fontSize={40}
						fill="#ff2b2b"
						opacity={Math.floor(ctx.f / 15) % 2 === 0 ? 1 : 0.65}
						filter="url(#glow)"
					>
						{ctx.scene.clock}
					</text>
				</g>
			)}
		</g>
	);
};

export const Bedroom: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const open = interpolate(ctx.f, [0, Math.min(45, ctx.dur)], [ctx.scene.closet === 1 ? 0.35 : 0, ctx.scene.closet ?? 0], {
		extrapolateRight: 'clamp',
		extrapolateLeft: 'clamp',
	});
	const curtain = Math.sin(ctx.f / 25) * 10;
	return (
		<g>
			<rect width={W} height={H} fill="url(#wall)" />
			{/* papel pintado */}
			{Array.from({length: 9}).map((_, i) => (
				<line key={i} x1={i * 130 + 30} y1={0} x2={i * 130 + 30} y2={1420} stroke="#1b2244" strokeWidth={14} />
			))}
			{/* ventana */}
			<rect x={600} y={230} width={380} height={480} fill="#0a0f24" stroke="#3a3350" strokeWidth={18} />
			<circle cx={860} cy={360} r={150} fill="url(#moonGlow)" />
			<circle cx={860} cy={360} r={55} fill="#eef2ff" />
			<circle cx={840} cy={345} r={10} fill="#cfd6ee" />
			<line x1={790} y1={230} x2={790} y2={710} stroke="#3a3350" strokeWidth={12} />
			<line x1={600} y1={470} x2={980} y2={470} stroke="#3a3350" strokeWidth={12} />
			{/* rama */}
			<path d="M 980 300 Q 880 420 760 440 M 880 380 Q 860 470 820 520" stroke="#05060c" strokeWidth={10} fill="none" />
			{/* cortinas */}
			<path d={`M 570 200 Q ${600 + curtain} 450 560 740 L 630 740 Q ${640 + curtain} 450 640 200 Z`} fill="#3c2340" />
			<path d={`M 1010 200 Q ${980 - curtain} 450 1020 740 L 950 740 Q ${940 - curtain} 450 940 200 Z`} fill="#3c2340" />
			{/* rayo de luna */}
			<polygon points="600,710 980,710 700,1500 120,1500" fill="url(#moonBeam)" />
			{/* suelo */}
			<rect x={0} y={1400} width={W} height={520} fill="#1a1222" />
			{Array.from({length: 7}).map((_, i) => (
				<line key={i} x1={0} y1={1430 + i * 75} x2={W} y2={1430 + i * 75} stroke="#120c18" strokeWidth={5} />
			))}
			{/* alfombra y peluche */}
			<ellipse cx={560} cy={1560} rx={330} ry={70} fill="#2d1f3d" />
			<g transform="translate(300,1480)">
				<circle r={45} fill="#8a6a4f" />
				<circle cx={-32} cy={-36} r={16} fill="#8a6a4f" />
				<circle cx={32} cy={-36} r={16} fill="#8a6a4f" />
				<path d="M -14 -6 l 10 10 M -4 -6 l -10 10 M 6 -6 l 10 10 M 16 -6 l -10 10" stroke="#1a1a1a" strokeWidth={4} />
			</g>
			<Wardrobe open={open} ctx={ctx} />
			<Bed ctx={ctx} />
		</g>
	);
};

/* ---------------- PASILLO ---------------- */

export const Hallway: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const lampOn = random(`lamp-${Math.floor(ctx.f / 2)}`) > 0.12;
	return (
		<g>
			<rect width={W} height={H} fill="#0c0d18" />
			{/* paredes en perspectiva */}
			<polygon points="0,0 400,700 400,1230 0,1920" fill="#1e1a2c" />
			<polygon points="1080,0 680,700 680,1230 1080,1920" fill="#191526" />
			<polygon points="0,0 1080,0 680,700 400,700" fill="#14111f" />
			<polygon points="0,1920 1080,1920 680,1230 400,1230" fill="#2a1d1a" />
			{[0.25, 0.5, 0.75].map((k) => (
				<line key={k} x1={400 - 400 * (1 - k)} y1={1230 + 690 * (1 - k)} x2={680 + 400 * (1 - k)} y2={1230 + 690 * (1 - k)} stroke="#1f1512" strokeWidth={6} />
			))}
			{/* cuadros torcidos */}
			<g transform="translate(140,700) skewY(30)">
				<rect width={150} height={190} fill="#3b2b22" />
				<rect x={15} y={15} width={120} height={160} fill="#1a1520" />
				<circle cx={75} cy={80} r={30} fill="#2c2433" />
			</g>
			<g transform="translate(830,780) skewY(-30) rotate(6)">
				<rect width={130} height={160} fill="#3b2b22" />
				<rect x={14} y={14} width={102} height={132} fill="#1a1520" />
			</g>
			{/* puerta de mamá al fondo */}
			<rect x={455} y={820} width={170} height={410} fill="#3d2a20" stroke="#140d0a" strokeWidth={6} />
			<circle cx={600} cy={1030} r={7} fill="#b08a4a" />
			<rect x={596} y={1045} width={8} height={18} fill="#050505" />
			<rect x={455} y={1222} width={170} height={8} fill="#ffcf7a" opacity={ctx.scene.feetUnderDoor ? 0.6 : 0.25} />
			{ctx.scene.feetUnderDoor && (
				<g fill="#050505">
					<rect x={492 + Math.sin(ctx.f / 20) * 3} y={1222} width={34} height={8} />
					<rect x={552 - Math.sin(ctx.f / 20) * 3} y={1222} width={34} height={8} />
				</g>
			)}
			{/* lámpara que parpadea */}
			<line x1={540} y1={0} x2={540} y2={300} stroke="#111" strokeWidth={4} />
			<path d="M 500 300 L 580 300 L 560 260 L 520 260 Z" fill="#2b2b2b" />
			{lampOn && (
				<>
					<circle cx={540} cy={420} r={420} fill="url(#lamp)" />
					<circle cx={540} cy={308} r={12} fill="#fff1c2" filter="url(#glow)" />
				</>
			)}
		</g>
	);
};

/* ---------------- PRIMER PLANO DEL ARMARIO ---------------- */

export const Closet: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const peek = interpolate(ctx.f, [0, 40], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<g>
			<rect width={W} height={H} fill="#1a110c" />
			{/* hueco de la puerta entreabierta */}
			<rect x={330} y={0} width={420} height={H} fill="#010102" />
			<g transform={`translate(${interpolate(peek, [0, 1], [420, 560])}, 820) scale(1.35)`}>
				<Ghost frame={ctx.f} mouth={ctx.scene.speaker === 'fantasma' ? ctx.mouth : 0} />
			</g>
			{/* puertas de madera */}
			<rect x={0} y={0} width={360} height={H} fill="#4a3226" />
			<rect x={40} y={80} width={280} height={700} fill="none" stroke="#3a2619" strokeWidth={10} />
			<rect x={40} y={880} width={280} height={950} fill="none" stroke="#3a2619" strokeWidth={10} />
			<rect x={720} y={0} width={360} height={H} fill="#56392b" />
			<rect x={760} y={80} width={280} height={700} fill="none" stroke="#3a2619" strokeWidth={10} />
			<rect x={760} y={880} width={280} height={950} fill="none" stroke="#3a2619" strokeWidth={10} />
			{/* dedos agarrando el borde */}
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={690} y={760 + i * 48} width={70} height={30} rx={15} fill="#c9d3d6" />
			))}
		</g>
	);
};

/* ---------------- DEBAJO DE LA CAMA ---------------- */

export const UnderBed: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const hit = ctx.hitF;
	// en 2 frames pasa de invisible a encima de la cámara
	const reveal = interpolate(ctx.f, [hit - 1, hit], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = interpolate(ctx.f, [hit - 1, hit + 2, hit + 40], [0.5, 2.1, 2.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	// antes del golpe los ojos se acercan despacio y parpadean una vez
	const eyesIn = interpolate(ctx.f, [0, hit], [0.7, 1.2], {extrapolateRight: 'clamp'});
	const blink = Math.abs(ctx.f - (hit - 18)) < 2 ? 0 : 1;
	return (
		<g>
			<rect width={W} height={H} fill="#07060b" />
			{/* parte inferior de la cama */}
			<rect x={0} y={0} width={W} height={640} fill="#18121f" />
			<rect x={0} y={600} width={W} height={50} fill="#2a1e33" />
			<rect x={40} y={600} width={60} height={600} fill="#2a1e33" />
			<rect x={980} y={600} width={60} height={600} fill="#2a1e33" />
			{/* suelo */}
			<polygon points="0,1350 1080,1350 1080,1920 0,1920" fill="#1a1222" />
			{/* zapatilla y juguete */}
			<ellipse cx={230} cy={1400} rx={110} ry={40} fill="#c2334a" />
			<circle cx={860} cy={1390} r={45} fill="#8a6a4f" />
			{/* antes del susto: solo ojos en la oscuridad */}
			{reveal < 1 && (
				<g transform={`translate(560, 1000) scale(${eyesIn})`} opacity={(1 - reveal) * blink}>
					<GhostEyes frame={ctx.f} size={0.9} gap={110} />
				</g>
			)}
			{reveal > 0 && (
				<g transform={`translate(540, 980) scale(${scale}) rotate(${-8 + Math.sin(ctx.f * 2.3) * 3})`} opacity={reveal}>
					<Ghost frame={ctx.f} mouth={0} scream={reveal} />
				</g>
			)}
		</g>
	);
};

/* ---------------- SUSTO EN EL PASILLO ---------------- */

export const HallwayScare: React.FC<{ctx: SceneCtx}> = ({ctx}) => {
	const hit = ctx.hitF;
	const reveal = interpolate(ctx.f, [hit - 1, hit], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const scale = interpolate(ctx.f, [hit - 1, hit + 2, hit + 40], [0.5, 2.0, 2.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	// la sonrisa se acerca por el pasillo, cada vez más rápido
	const k = Math.min(1, ctx.f / Math.max(1, hit));
	const grinScale = 0.6 + 1.4 * k * k;
	const grinY = 1000 - 120 * k * k;
	return (
		<g>
			<Hallway ctx={{...ctx, scene: {...ctx.scene, feetUnderDoor: false}}} />
			<rect width={W} height={H} fill="#000" opacity={0.6} />
			{/* la puerta del fondo ahora está abierta */}
			<rect x={455} y={820} width={170} height={410} fill="#000" />
			{reveal < 1 && (
				<g transform={`translate(540, ${grinY})`} opacity={1 - reveal}>
					<GlowingGrin frame={ctx.f} size={grinScale} />
				</g>
			)}
			{reveal > 0 && (
				<g transform={`translate(540, 900) scale(${scale}) rotate(${-5 + Math.sin(ctx.f * 2.2) * 3})`} opacity={reveal}>
					<MimicFace frame={ctx.f} scream={reveal} />
				</g>
			)}
		</g>
	);
};

export const Black: React.FC = () => <rect width={W} height={H} fill="#000" />;
