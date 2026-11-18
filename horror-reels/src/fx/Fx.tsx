import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, interpolate, random, spring, staticFile} from 'remotion';
import type {CameraMove, Word} from '../types';

// Fuentes servidas desde public/fonts (OFL, descargadas de Google Fonts)
const creepster = 'Creepster';
const anton = 'Anton';
loadFont({family: creepster, url: staticFile('fonts/Creepster.woff2')});
loadFont({family: anton, url: staticFile('fonts/Anton.woff2')});

/** Movimiento de cámara: devuelve el transform CSS para el set */
export const cameraTransform = (move: CameraMove, f: number, dur: number, hitF: number): string => {
	const p = Math.min(1, f / Math.max(1, dur));
	const ease = (x: number) => 1 - Math.pow(1 - x, 3);
	const jitter = (amp: number, seed: string) =>
		`translate(${(random(`${seed}x${f}`) - 0.5) * amp}px, ${(random(`${seed}y${f}`) - 0.5) * amp}px)`;
	// origen en px del canvas 1080x1920
	const zoomAt = (s: number, x: number, y: number) =>
		`translate(${540 - x * s}px, ${960 - y * s}px) scale(${s})`;
	switch (move) {
		case 'zoomIn':
			return zoomAt(1 + 0.12 * ease(p), 540 + 40 * p, 960);
		case 'slowZoomIn':
			return zoomAt(1 + 0.4 * p, 540 + 220 * p, 960 + 260 * p);
		case 'shake': {
			// sacudidas sincronizadas con los 3 golpes (0, 0.55, 1.1 s)
			const knocks = [0, 16, 33].map((k) => Math.max(0, 1 - Math.abs(f - k - 2) / 5));
			const amp = Math.max(...knocks) * 30;
			return `${jitter(amp, 'sh')} ${zoomAt(1.1, 540, 1000)}`;
		}
		case 'closeKid':
			return zoomAt(1.7 + 0.1 * p, 760, 1000);
		case 'panCloset': {
			const x = interpolate(ease(p), [0, 1], [760, 300]);
			const y = interpolate(ease(p), [0, 1], [1050, 900]);
			return zoomAt(1.35 + 0.25 * p, x, y);
		}
		case 'dolly':
			return zoomAt(1 + 0.6 * ease(p), 540, 1000);
		case 'jumpscare': {
			if (f < hitF) {
				return zoomAt(1 + 0.15 * (f / Math.max(1, hitF)), 560, 1000);
			}
			const decay = Math.max(0, 1 - (f - hitF) / 25);
			return `${jitter(70 * decay + 6, 'js')} ${zoomAt(1.25, 540, 1000)}`;
		}
		default:
			return 'none';
	}
};

/** Grano, viñeta, parpadeo de luz y fundidos */
export const Overlay: React.FC<{frame: number; sceneF: number; cut: boolean; flash: number}> = ({
	frame,
	sceneF,
	cut,
	flash,
}) => {
	const flicker = random(`fl-${Math.floor(frame / 2)}`) > 0.96 ? 0.35 : 0;
	const fadeIn = cut ? 0 : interpolate(sceneF, [0, 6], [1, 0], {extrapolateRight: 'clamp'});
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.85) 100%)'}} />
			<AbsoluteFill style={{background: '#14224a', mixBlendMode: 'multiply', opacity: 0.35}} />
			<AbsoluteFill style={{opacity: 0.13, mixBlendMode: 'overlay'}}>
				<svg width="100%" height="100%">
					<filter id="grain">
						<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} />
					</filter>
					<rect width="100%" height="100%" filter="url(#grain)" />
				</svg>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: Math.max(flicker, fadeIn)}} />
			{flash > 0 && (
				<>
					<AbsoluteFill style={{background: '#fff', opacity: flash > 0.7 ? 0.9 : 0}} />
					<AbsoluteFill style={{background: '#b0001a', mixBlendMode: 'multiply', opacity: flash * 0.55}} />
				</>
			)}
		</>
	);
};

/** Título de la historia con goteo */
export const Title: React.FC<{text: string; f: number; dur: number}> = ({text, f, dur}) => {
	const on = random(`t-${Math.floor(f / 2)}`) > 0.08 || f > 40;
	const opacity = interpolate(f, [0, 8, dur - 10, dur], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
	const drip = interpolate(f, [0, dur], [0, 40]);
	return (
		<AbsoluteFill style={{alignItems: 'center', paddingTop: 210}}>
			<div
				style={{
					fontFamily: creepster,
					fontSize: 150,
					lineHeight: 0.95,
					color: '#d10f1f',
					textAlign: 'center',
					whiteSpace: 'pre-line',
					opacity: on ? opacity : 0.2,
					textShadow: `0 ${6 + drip / 3}px 0 #5a0008, 0 0 40px rgba(255,0,30,0.55)`,
					transform: `rotate(-3deg)`,
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

/** Subtítulos karaoke: grupos de hasta 3 palabras, la activa en rojo */
export const Captions: React.FC<{words: Word[]; t: number; fps: number; center: boolean}> = ({
	words,
	t,
	fps,
	center,
}) => {
	const pages: Word[][] = [];
	let cur: Word[] = [];
	for (const w of words) {
		cur.push(w);
		if (cur.length >= 3 || /[.,?!…]$/.test(w.text)) {
			pages.push(cur);
			cur = [];
		}
	}
	if (cur.length) pages.push(cur);

	const page = pages.find((pg, i) => {
		const next = pages[i + 1];
		const end = next && next[0].scene === pg[0].scene ? next[0].start : pg[pg.length - 1].end + 0.4;
		return t >= pg[0].start - 0.05 && t < end;
	});
	if (!page) return null;
	const pageAge = (t - page[0].start) * fps;
	const pop = spring({frame: pageAge, fps, config: {damping: 12, stiffness: 200}});

	return (
		<AbsoluteFill style={{justifyContent: center ? 'center' : 'flex-end', alignItems: 'center', paddingBottom: center ? 0 : 470}}>
			<div
				style={{
					fontFamily: anton,
					fontSize: center ? 104 : 92,
					textTransform: 'uppercase',
					textAlign: 'center',
					padding: '0 70px',
					lineHeight: 1.1,
					transform: `scale(${0.85 + 0.15 * pop})`,
				}}
			>
				{page.map((w, i) => {
					const active = t >= w.start && t < w.end + 0.08;
					return (
						<span
							key={i}
							style={{
								color: active ? '#ff2a3a' : '#f3efe6',
								WebkitTextStroke: '10px #000',
								paintOrder: 'stroke fill',
								textShadow: active ? '0 0 30px rgba(255,0,30,0.8)' : '0 6px 0 #000',
								marginRight: 22,
								display: 'inline-block',
							}}
						>
							{w.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
