import Shape from 'Shape';

export class ShapeStore {
	private _paths: {[index: string]: Shape};
	private _groups: {[index: string]: PIXI.Container}
	private _shapes: Shape[];

	public static GROUP_SEPARATOR = '.';

	constructor() {
		this._init();
	}

	public resetAllShapeMods(): void {
		for (let shape of this._shapes) {
			shape.resetMods();
		}
	}

	public redrawShapes(): void {
		for (let shape of this._shapes) {
			shape.redraw();
		}
	}

	public addShapesAsChildren(target: PIXI.Container): void {
		for (let shape of this._shapes) {
			target.addChild(shape);
		}
	}

	public addShape(path: string, shape: Shape): Shape {
		if (this.hasShapeAtPath(path)) throw new Error('Shape already exists at path ' + path + '; paths must be unique.');

		let group = this.createGroup(path);

		this._paths[path] = shape;
		this._shapes.push(shape);
		group.addChild(shape);

		return shape;
	}

	public createGroup(path: string): PIXI.Container {
		let separator = ShapeStore.GROUP_SEPARATOR,
			pathSplit = path.split(separator),
			groupPath = "",
			group: PIXI.Container;

		// Generate necessary group containers
		for (let i = 0, l = pathSplit.length; i < l; i++) {
			if (i > 0) groupPath += separator;
			groupPath += pathSplit[i];
			if (!this.hasGroupAtPath(groupPath)) {
				if (i == 0) {
					group = new PIXI.Container();
				}
				else {
					// Add to previous group's children
					group = group.addChild(new PIXI.Container());
				}
				this._groups[groupPath] = group;
			}
			else {
				group = this.getGroupFromPath(groupPath);
			}

		}

		return this._groups[groupPath];
	}

	public getShapeFromPath(path: string): Shape {
		if (this.hasShapeAtPath(path) == false) throw new Error('No shape exists at path ' + path);

		return this._paths[path];
	}

	public hasShapeAtPath(path: string): Boolean {
		return this._paths[path] != null;
	}

	public getGroupFromPath(path: string): PIXI.Container {
		if (this.hasGroupAtPath(path) == false) {
			if (this.hasShapeAtPath(path)) {
				throw new Error('Path is not a group but a Shape object: ' + this.getShapeFromPath(path));
			}
			else {
				throw new Error('No group at path ' + path);
			}
		}

		return this._groups[path];
	}

	public hasGroupAtPath(path: string): Boolean {
		return this._groups[path] != null;
	}

	public get shapes(): Array<Shape> {
		return this._shapes;
	}

	private _init(): void {
		this._paths = {};
		this._groups = {};
		this._shapes = [];
	}
}

export default ShapeStore;