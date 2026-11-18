export type SetName = 'bedroom' | 'hallway' | 'closet' | 'underbed' | 'black';
export type CameraMove =
	| 'none'
	| 'zoomIn'
	| 'slowZoomIn'
	| 'shake'
	| 'closeKid'
	| 'panCloset'
	| 'dolly'
	| 'jumpscare';
export type Mood = 'normal' | 'scared' | 'hiding';

export type Scene = {
	id: string;
	set: SetName;
	speaker: string;
	text: string;
	camera: CameraMove;
	kid?: {x: number; mood: Mood; look: number};
	ghost?: {where: 'closet' | 'underbed'};
	closet?: number;
	sfx?: 'knock' | 'creak' | 'sting' | 'heartbeat';
	clock?: string;
	showTitle?: boolean;
	pauseAfter?: number;
};

export type Story = {
	id: string;
	title: string;
	voices: Record<string, {voice: string; speed?: number; fx?: string}>;
	scenes: Scene[];
};

export type Timeline = {
	duration: number;
	scenes: {id: string; start: number; speechEnd: number; end: number}[];
};

export type Word = {text: string; start: number; end: number; scene: string};

export type ReelProps = {
	storyId: string;
	story?: Story;
	timeline?: Timeline;
	captions?: Word[];
};

/** Estado de la escena activa que reciben sets y personajes */
export type SceneCtx = {
	scene: Scene;
	/** frame relativo al inicio de la escena */
	f: number;
	/** duración de la escena en frames */
	dur: number;
	/** frame (relativo) en que termina de hablar */
	speechEndF: number;
	/** apertura de boca 0..1 del personaje que habla */
	mouth: number;
};
