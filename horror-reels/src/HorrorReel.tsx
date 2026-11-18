import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, Overlay, Title, cameraTransform} from './fx/Fx';
import {Bedroom, Black, Closet, Defs, Hallway, UnderBed} from './sets/Sets';
import type {ReelProps, SceneCtx} from './types';

const SFX_VOLUME: Record<string, number> = {knock: 0.9, creak: 0.6, sting: 0.75, heartbeat: 0.8};

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

	// lip-sync: volumen de la voz en este frame
	let mouth = 0;
	if (audio && t < tl.speechEnd) {
		const bins = visualizeAudio({fps, frame, audioData: audio, numberOfSamples: 32});
		const energy = bins.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
		mouth = Math.min(1, energy * 9);
	}

	const ctx: SceneCtx = {scene, f, dur, speechEndF, mouth};
	const isJump = scene.camera === 'jumpscare';
	const flash = isJump ? interpolate(f, [speechEndF - 1, speechEndF + 1, speechEndF + 14], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
	const SetComp = {bedroom: Bedroom, hallway: Hallway, closet: Closet, underbed: UnderBed, black: Black}[scene.set];

	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: cameraTransform(scene.camera, f, dur, speechEndF), transformOrigin: '0 0'}}>
				<svg viewBox="0 0 1080 1920" width={1080} height={1920}>
					<Defs />
					<SetComp ctx={ctx} />
				</svg>
			</AbsoluteFill>
			<Overlay frame={frame} sceneF={f} cut={isJump || idx === 0} flash={flash} />
			{scene.showTitle && <Title text={story.title} f={f} dur={dur} />}
			<Captions words={captions.filter((w) => w.scene === scene.id)} t={t} fps={fps} center={scene.set === 'black'} />

			{/* AUDIO */}
			<Audio src={voiceSrc} />
			<Audio src={staticFile('sfx/drone.wav')} loop volume={(fr) => interpolate(fr, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.35, 0.35, 0])} />
			{story.scenes.map((s) => {
				if (!s.sfx) return null;
				const st = timeline.scenes.find((x) => x.id === s.id)!;
				// el golpe del susto suena justo al terminar la frase
				const at = s.camera === 'jumpscare' ? st.speechEnd - 0.05 : st.start;
				return (
					<Sequence key={s.id} from={Math.max(0, Math.round(at * fps))} layout="none">
						<Audio src={staticFile(`sfx/${s.sfx}.wav`)} volume={SFX_VOLUME[s.sfx] ?? 0.7} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};
