import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, Overlay, Title, cameraTransform} from './fx/Fx';
import {Cabin, CabinScare, CabinWindow, Forest, ForestPath} from './sets/ForestSets';
import {Bedroom, Black, Closet, Defs, Hallway, HallwayScare, UnderBed} from './sets/Sets';
import type {ReelProps, SceneCtx} from './types';

const SFX_VOLUME: Record<string, number> = {knock: 0.9, creak: 0.6, sting: 0.75, heartbeat: 0.5, scream: 1, scream_creature: 1, snap: 0.9, static: 0.5, ring: 0.6, scream_mimic: 1};
// segundos desde el inicio del archivo hasta su golpe (el grito D1 trae un "chupón" de 0.88 s antes)
const SFX_HIT: Record<string, number> = {sting: 0.05, scream: 0.88, scream_creature: 0.88, scream_mimic: 0.88};
const sfxSrc = (name: string) => staticFile(name.startsWith('scream') ? `audio/${name}.wav` : `sfx/${name}.wav`);

export const HorrorReel: React.FC<ReelProps> = ({storyId, story, timeline, captions}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const voiceSrc = staticFile(`reels/${storyId}/voice.wav`);
	const audio = useAudioData(voiceSrc);

	if (!story || !timeline || !captions) {
		return <AbsoluteFill style={{background: '#000'}} />;
	}

	const t = frame / fps;
	const idx = Math.max(
		0,
		timeline.scenes.findIndex((s) => t >= s.start && t < s.end),
	);
	const tl = timeline.scenes[idx === -1 ? timeline.scenes.length - 1 : idx];
	const scene = story.scenes.find((s) => s.id === tl.id)!;
	const startF = Math.round(tl.start * fps);
	// la primera escena arranca en el frame 0 (incluye el silencio inicial)
	const sceneStartF = idx === 0 ? 0 : startF;
	const f = frame - sceneStartF;
	const dur = Math.round(tl.end * fps) - sceneStartF;
	const speechEndF = Math.round(tl.speechEnd * fps) - sceneStartF;
	const hitF = speechEndF + Math.round((scene.hitDelay ?? 0) * fps);
	// momento absoluto (s) del susto, para apagar el ambiente antes del golpe
	const jumpScene = story.scenes.find((s) => s.camera === 'jumpscare');
	const jumpTl = jumpScene ? timeline.scenes.find((x) => x.id === jumpScene.id) : undefined;
	const hitT = jumpTl && jumpScene ? jumpTl.speechEnd + (jumpScene.hitDelay ?? 0) : null;

	// lip-sync: volumen de la voz en este frame
	let mouth = 0;
	if (audio && t < tl.speechEnd) {
		const bins = visualizeAudio({fps, frame, audioData: audio, numberOfSamples: 32});
		const energy = bins.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
		mouth = Math.min(1, energy * 9);
	}

	const ctx: SceneCtx = {scene, f, dur, speechEndF, hitF, mouth, lead: startF - sceneStartF};
	const isJump = scene.camera === 'jumpscare';
	// flash blanco de 1 frame en el golpe y un latido rojo corto; la cara tiene que verse
	const flash = isJump ? interpolate(f, [hitF - 1, hitF, hitF + 1, hitF + 8], [0, 1, 0.45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
	const sinceHit = isJump ? f - hitF : -1;
	// estroboscopio y desdoble de color durante el golpe
	const shock = sinceHit >= 0 && sinceHit < 14;
	const strobe = shock && (sinceHit === 4 || sinceHit === 9);
	const SetComp = {bedroom: Bedroom, hallway: Hallway, closet: Closet, underbed: UnderBed, black: Black, forest: Forest, forestPath: ForestPath, cabin: Cabin, cabinWindow: CabinWindow, cabinScare: CabinScare, hallwayScare: HallwayScare}[scene.set];

	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: cameraTransform(scene.camera, f, dur, hitF), transformOrigin: '0 0', filter: strobe ? 'invert(1) contrast(1.6)' : undefined}}>
				<svg viewBox="0 0 1080 1920" width={1080} height={1920}>
					<Defs />
					<SetComp ctx={ctx} />
				</svg>
			</AbsoluteFill>
			{shock &&
				[
					{dx: 18, tint: 'hue-rotate(-40deg) saturate(6)', c: '#ff0030'},
					{dx: -18, tint: 'hue-rotate(160deg) saturate(6)', c: '#00e5ff'},
				].map(({dx, c}) => (
					<AbsoluteFill
						key={c}
						style={{
							transform: `translateX(${dx * (1 - sinceHit / 14)}px) ${cameraTransform(scene.camera, f, dur, hitF)}`,
							transformOrigin: '0 0',
							mixBlendMode: 'screen',
							opacity: 0.55,
						}}
					>
						<svg viewBox="0 0 1080 1920" width={1080} height={1920}>
							<SetComp ctx={ctx} />
							<rect width={1080} height={1920} fill={c} style={{mixBlendMode: 'multiply'}} />
						</svg>
					</AbsoluteFill>
				))}
			<Overlay frame={frame} sceneF={f} cut={isJump || idx === 0} flash={flash} />
			{scene.showTitle && <Title text={story.title} f={f} dur={dur} />}
			<Captions words={captions.filter((w) => w.scene === scene.id)} t={t} fps={fps} center={scene.set === 'black'} high={['forest', 'forestPath', 'cabin'].includes(scene.set)} />

			{/* AUDIO */}
			<Audio src={voiceSrc} />
			<Audio
				src={staticFile('sfx/drone.wav')}
				loop
				volume={(fr) => {
					const base = interpolate(fr, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.35, 0.35, 0]);
					if (hitT === null) return base;
					// silencio total justo antes del golpe; vuelve poco a poco después
					const duck = interpolate(fr / fps, [hitT - 1.4, hitT - 0.5, hitT + 2, hitT + 4], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return base * duck;
				}}
			/>
			{story.scenes.map((s) => {
				if (!s.sfx) return null;
				const st = timeline.scenes.find((x) => x.id === s.id)!;
				// el golpe del susto cae en el momento del susto (fin de la frase + hitDelay)
				const at = s.camera === 'jumpscare' ? st.speechEnd + (s.hitDelay ?? 0) - (SFX_HIT[s.sfx] ?? 0) : st.start + (s.sfxAt ?? 0);
				return (
					<Sequence key={s.id} from={Math.max(0, Math.round(at * fps))} layout="none">
						<Audio src={sfxSrc(s.sfx)} volume={SFX_VOLUME[s.sfx] ?? 0.7} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};
