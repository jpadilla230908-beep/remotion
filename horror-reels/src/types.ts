export type SetName = 'bedroom' | 'hallway' | 'closet' | 'underbed' | 'black' | 'forest' | 'forestPath' | 'cabin' | 'cabinWindow' | 'cabinScare' | 'hallwayScare' | 'river' | 'riverBank' | 'riverScare';
export type CameraMove =
	| 'none'
	| 'zoomIn'
	| 'slowZoomIn'
	| 'shake'
	| 'closeKid'
	| 'panCloset'
	| 'dolly'
	| 'jumpscare';
export type Mood = 'normal' | 'neutral' | 'scared' | 'hiding' | 'sleeping';

export type Scene = {
	id: string;
	set: SetName;
	speaker: string;
	text: string;
	camera: CameraMove;
	/** wakeAt: segundos de la escena en que se despierta de golpe (antes, duerme) */
	kid?: {x: number; mood: Mood; look: number; wakeAt?: number; variant?: 'lucia' | 'valeria' | 'mateo'; phone?: boolean; scaredAt?: number};
	ghost?: {where: 'closet' | 'underbed'};
	ranger?: {x: number; mood: 'normal' | 'scared'; look: number; flashlight?: boolean};
	creature?: {where: 'far' | 'bushes' | 'dark'};
	/** huella de mano que aparece en el cristal (set cabinWindow) */
	handprint?: boolean;
	/** la Llorona: al otro lado del río (far) o en la orilla; turn = se da la vuelta */
	llorona?: {where: 'far' | 'bank'; turn?: boolean};
	/** sombras de dos pies bajo la puerta del pasillo */
	feetUnderDoor?: boolean;
	closet?: number;
	sfx?: 'knock' | 'creak' | 'sting' | 'heartbeat' | 'scream' | 'scream_creature' | 'snap' | 'static' | 'ring' | 'scream_mimic' | 'scream_llorona' | 'water';
	/** susto: segundos de silencio entre el final de la frase y el golpe */
	hitDelay?: number;
	/** segundos dentro de la escena en que suena el sfx (por defecto, al empezar) */
	sfxAt?: number;
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
	/** frame (relativo) del golpe del susto */
	hitF: number;
	/** frames entre f=0 y el inicio real de la escena en la línea de tiempo (solo la primera escena tiene silencio inicial) */
	lead: number;
	/** apertura de boca 0..1 del personaje que habla */
	mouth: number;
};
