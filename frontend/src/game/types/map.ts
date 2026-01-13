export interface Vec2 {
  x: number;
  y: number;
}

export interface TileMap {
  width: number;
  height: number;
  tiles: number[]; // length = width*height
  solid: Set<number>; // tileId set
}

export interface MapEncounter {
  id: string;
  pos: Vec2; // tile coords
  templateId: string;
  defeatedOrCaptured: boolean;
}

export interface WorldMap {
  id: string;
  name: string;
  tileSize: number;
  map: TileMap;
  playerSpawn: Vec2;
  encounters: MapEncounter[];
}
