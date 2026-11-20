import {AbsoluteFill} from 'remotion';
import './fx/Fx'; // carga las fuentes Creepster y Anton
import {CreatureEyes} from './characters/Creature';
import {GlowingGrin} from './characters/Mimic';
import {Forest} from './sets/ForestSets';
import {Bedroom, Defs} from './sets/Sets';
import type {SceneCtx} from './types';

export type CoverProps = {
	/** líneas del título; la palabra entre *asteriscos* va en rojo */
	lines: string[];
	/** subtítulo pequeño bajo el título */
	tag: string;
	/** escena de fondo: el dormitorio de «el armario» o el bosque de «algo te observa» */
	scene?: 'armario' | 'bosque' | 'llamada';
};

const RED = '#ff2a3a';

const Line: React.FC<{text: string; size: number}> = ({text, size}) => {
	const parts = text.split(/(\*[^*]+\*)/).filter(Boolean);
	return (
		<div style={{fontSize: size, lineHeight: 0.95}}>
			{parts.map((p, i) =>
				p.startsWith('*') ? (
					<span key={i} style={{color: RED, textShadow: `0 0 40px rgba(255,0,30,0.85), 0 8px 0 #000`}}>
						{p.slice(1, -1)}
					</span>
				) : (
					<span key={i}>{p}</span>
				),
			)}
		</div>
	);
};

/**
 * Portada vertical (1080x1920) para TikTok / YouTube Shorts.
 * Reutiliza el dormitorio del reel: Lucía aterrada en la cama, el armario
 * entreabierto con los ojos del fantasma y unos dedos pálidos en el borde.
 * El título queda en la zona central que TikTok muestra en la cuadrícula del perfil (3:4).
 */
export const Cover: React.FC<CoverProps> = ({lines, tag, scene = 'armario'}) => {
	const forest: SceneCtx = {
		scene: {
			id: 'cover',
			set: 'forest',
			speaker: 'narrador',
			text: '',
			camera: 'none',
			ranger: {x: 330, mood: 'scared', look: 1, flashlight: true},
			creature: {where: 'far'},
		},
		f: 100,
		dur: 120,
		speechEndF: 0,
		hitF: 0,
		mouth: 0,
		lead: 0,
	};
	const ctx: SceneCtx = {
		scene: {
			id: 'cover',
			set: 'bedroom',
			speaker: 'narrador',
			text: '',
			camera: 'none',
			kid: scene === 'llamada' ? {x: 760, mood: 'scared', look: -1, variant: 'valeria', phone: true} : {x: 760, mood: 'scared', look: -1},
			closet: scene === 'llamada' ? 0 : 0.35,
			ghost: scene === 'llamada' ? undefined : {where: 'closet'},
			clock: scene === 'llamada' ? '3:33' : '3:00',
		},
		f: 60,
		dur: 120,
		speechEndF: 0,
		hitF: 0,
		mouth: 0,
		lead: 0,
	};
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{scene === 'bosque' ? (
				<AbsoluteFill style={{transform: 'translate(40px, -110px) scale(1.15)', transformOrigin: '50% 60%', filter: 'brightness(1.35)'}}>
					<svg viewBox="0 0 1080 1920" width={1080} height={1920}>
						<Defs />
						<Forest ctx={forest} />
						{/* más ojos entre los arbustos */}
						<g transform="translate(900, 1560)">
							<CreatureEyes frame={10} size={1} gap={60} />
						</g>
					</svg>
				</AbsoluteFill>
			) : (
				<>
			{/* escena: encuadre bajo, del armario a la cama */}
				<AbsoluteFill style={{transform: 'translate(-60px, 330px) scale(1.18)', transformOrigin: '50% 60%'}}>
				<svg viewBox="0 0 1080 1920" width={1080} height={1920}>
					<Defs />
					<Bedroom ctx={ctx} />
					{scene === 'llamada' ? (
						<>
							{/* la puerta del cuarto, abierta a la oscuridad, con la sonrisa */}
							<rect x={50} y={540} width={420} height={890} fill="#020203" stroke="#2b1d17" strokeWidth={14} />
							<g transform="translate(260, 860)">
								<GlowingGrin frame={8} size={1.6} />
							</g>
						</>
					) : (
						<>
					{/* dedos pálidos agarrando el borde de la puerta del armario */}
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={272} y={900 + i * 34} width={[46, 52, 48, 40][i]} height={22} rx={11} fill="#cfd8dc" />
					))}
					{/* un ojo que asoma por la rendija */}
					<ellipse cx={283} cy={800} rx={15} ry={21} fill="#f4f6ff" filter="url(#glow)" />
					<circle cx={286} cy={804} r={7} fill={RED} />
					<circle cx={286} cy={804} r={3} fill="#050507" />
					{/* resplandor rojo que sale de la rendija */}
					<rect x={262} y={570} width={70} height={840} fill={RED} opacity={0.08} />
						</>
					)}
				</svg>
			</AbsoluteFill>
				</>
			)}
			{/* oscurecer arriba para que el título se lea */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0) 52%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,0,0,0.85) 100%)'}} />
			<AbsoluteFill style={{background: '#14224a', mixBlendMode: 'multiply', opacity: 0.3}} />

			{/* marca del canal */}
			{/* abajo, dentro del recorte 3:4 de la cuadrícula del perfil (y 240–1680) */}
			<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0) 40%)'}} />
			<div style={{position: 'absolute', top: 1560, width: '100%', textAlign: 'center', fontFamily: 'Creepster', fontSize: 52, color: '#e9e4dc', letterSpacing: 2, textShadow: '0 0 30px rgba(255,0,30,0.45), 0 6px 0 #000'}}>
				Scary <span style={{color: RED}}>Tellings</span>
			</div>

			{/* título */}
			<div
				style={{
					position: 'absolute',
					top: 200,
					width: '100%',
					padding: '0 60px',
					boxSizing: 'border-box',
					textAlign: 'center',
					fontFamily: 'Anton',
					textTransform: 'uppercase',
					color: '#f3efe6',
					WebkitTextStroke: '6px #000',
					paintOrder: 'stroke fill',
					textShadow: '0 8px 0 #000',
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
				}}
			>
				{lines.map((l, i) => (
					<Line key={i} text={l} size={i === lines.length - 1 ? 170 : 128} />
				))}
				<div style={{fontFamily: 'Anton', fontSize: 46, color: '#cfc8bd', WebkitTextStroke: '0px', textShadow: '0 4px 0 #000', marginTop: 18, letterSpacing: 2}}>{tag}</div>
			</div>
		</AbsoluteFill>
	);
};
