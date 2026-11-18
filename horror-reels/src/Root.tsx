import {Composition, Still, staticFile} from 'remotion';
import {Cover, type CoverProps} from './Cover';
import {HorrorReel} from './HorrorReel';
import type {ReelProps} from './types';

export const FPS = 30;

const load = async (storyId: string, file: string) => {
	const res = await fetch(staticFile(`reels/${storyId}/${file}`));
	if (!res.ok) {
		throw new Error(`Falta ${file} de "${storyId}". Ejecuta ./make_reel.sh primero.`);
	}
	return res.json();
};

export const RemotionRoot: React.FC = () => {
	return (
		<>
		<Still
			id="Portada"
			component={Cover}
			width={1080}
			height={1920}
			defaultProps={{lines: ['Si escuchas', '3 golpes...', '*No abras*'], tag: 'Historia de terror animada'} as CoverProps}
		/>
		<Composition
			id="HorrorReel"
			component={HorrorReel}
			width={1080}
			height={1920}
			fps={FPS}
			durationInFrames={300}
			defaultProps={{storyId: 'el-armario'} as ReelProps}
			calculateMetadata={async ({props}) => {
				const [story, timeline, captions] = await Promise.all([
					load(props.storyId, 'story.json'),
					load(props.storyId, 'timeline.json'),
					load(props.storyId, 'captions.json'),
				]);
				return {
					durationInFrames: Math.ceil(timeline.duration * FPS),
					props: {...props, story, timeline, captions},
				};
			}}
		/>
		</>
	);
};
