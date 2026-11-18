import {AbsoluteFill} from 'remotion';
import './fx/Fx'; // carga las fuentes Creepster y Anton
import {Bedroom, Defs} from './sets/Sets';
import type {SceneCtx} from './types';

export type CoverProps = {
	/** líneas del título; la palabra entre *asteriscos* va en rojo */
	lines: string[];
	/** subtítulo pequeño bajo el título */
	tag: string;
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
export const Cover: React.FC<CoverProps> = ({lines, tag}) => {
	const ctx: SceneCtx = {
		scene: {
			id: 'cover',
			set: 'bedroom',
			speaker: 'narrador',
			text: '',
			camera: 'none',
			kid: {x: 760, mood: 'scared', look: -1},
			closet: 0.35,
			ghost: {where: 'closet'},
			clock: '3:00',
		},
		f: 60,
		dur: 120,
		speechEndF: 0,
		hitF: 0,
		mouth: 0,
	};
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{/* escena: encuadre bajo, del armario a la cama */}
			<AbsoluteFill style={{transform: 'translate(-60px, 330px) scale(1.18)', transformOrigin: '50% 60%'}}>
				<svg viewBox="0 0 1080 1920" width={1080} height={1920}>
					<Defs />
					<Bedroom ctx={ctx} />
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
				</svg>
			</AbsoluteFill>
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
