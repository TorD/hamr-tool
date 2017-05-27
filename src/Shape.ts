import * as PIXI from 'pixi.js';

export namespace Filters {
	export interface Shadow {
		type: 'shadow'
		color: number
		alpha: number
		x: number
		y: number
		blur: number
		spread: number
	}
	export interface InnerShadow {
		type: 'innerShadow'
		color: number
		alpha: number
		x: number
		y: number
		blur: number
		spread: number
	}
	export interface GaussianBlur {
		type: 'gaussianBlur'
		strength: number
	}
}

export namespace Shapes {
	export interface Rect {
		type: 'rect' | string
		width: number
		height: number
		[key: string]: any
	};

	export interface RoundedRect {
		type: 'roundedRect' | string
		width: number
		height: number
		radius: number
		[key: string]: any
	}
	
	export interface Ellipse {
		type: 'ellipse' | string
		width: number
		height: number
		[key: string]: any
	}

	export interface ReshapeObject {
		[key: string]: any
	}
}

export namespace Mods {
	export interface ColorFill {
		type: 'colorFill' | string,
		color: number
		alpha: number
		filters?: Array<Filters.Shadow | Filters.InnerShadow | Filters.GaussianBlur>
	}

	export interface PatternFill {
		type: 'patternFill' | string,
		texture: PIXI.Texture
		alpha: number
		filters?: Array<Filters.Shadow | Filters.InnerShadow | Filters.GaussianBlur>
	}

	export interface Border {
		type: 'border' | string,
		color: number
		alpha: number
		lineWidth: number
		position: 'outside' | 'center' | 'inside'
		filters?: Array<Filters.Shadow | Filters.InnerShadow | Filters.GaussianBlur>
	}
}

interface ModifiedProps {
	x: Boolean
	y: Boolean
	width: Boolean
	height: Boolean
	[key: string]: Boolean
};

export class Shape extends PIXI.Sprite {
	private _shapeOptions: Shapes.Rect | Shapes.RoundedRect | Shapes.Ellipse;
	private _shapeMods: Array<Mods.Border | Mods.ColorFill | Mods.PatternFill>; // An array of functions that contain the logic to redraw this shape with the added mods
	private _modifiedProps: ModifiedProps;
	private _name: string;

	constructor(name: string, options: Shapes.Rect | Shapes.RoundedRect | Shapes.Ellipse) {
		super();

		this._init(name, options);
	}

	public addModifier(modOptions: Mods.Border | Mods.ColorFill | Mods.PatternFill): Shape {
		this._addMod(modOptions);

		return this;
	}

	public get name(): string {
		return this._name;
	}

	public get type(): string {
		return this.shapeOptions.type;
	}

	public set width(value: number) {
		this._modifiedProps.width = true;
		this.reshape({width: value});
	}

	public get width(): number {
		return this.shapeOptions.width;
	}

	public set height(value: number) {
		this._modifiedProps.height = true;
		this.reshape({height: value});
	}

	public get height(): number {
		return this.shapeOptions.height;
	}

	public set x(value: number) {
		this._modifiedProps.x = true;
		this.position.x = value;
	}

	public set y(value: number) {
		this._modifiedProps.y = true;
		this.position.y = value;
	}

	public get mods(): Array<Mods.Border | Mods.ColorFill | Mods.PatternFill> {
		return this._shapeMods;
	}

	public propHasBeenModified(prop: string): Boolean {
		return this._modifiedProps[prop];
	}

	public get shapeOptions(): Shapes.Rect | Shapes.RoundedRect | Shapes.Ellipse {
		return this._shapeOptions;
	}

	public reshape(options: Shapes.ReshapeObject, performRedraw: Boolean = true): Shape {
		for (let key in options) {
			if (this._shapeOptions.hasOwnProperty(key)) {
				this._shapeOptions[key] = options[key];
			}
			else {
				throw new Error('Property ' + key + ' does not exist on Shape with type ' + this.type);
			}
		}

		if (performRedraw) this.redraw();

		return this;
	}

	/**
	 * Redraw Shape with all mods
	 */
	public redraw(): void {
		this.removeChildren();
		this._applyMods(this.mods);
	}

	public resetMods(): void {
		this._shapeMods = [];
	}

	private _init(name: string, options: Shapes.Rect | Shapes.RoundedRect | Shapes.Ellipse): void {
		if(!name) throw new Error('Shape name not provided');
		if(!options) throw new Error('Shape options not provided');

		this._name = name;
		this._shapeOptions = options;
		this._modifiedProps = {x: false, y: false, width: false, height: false};

		this.resetMods();
	}

	private _addMod(mod: Mods.Border | Mods.ColorFill | Mods.PatternFill): Mods.Border | Mods.ColorFill | Mods.PatternFill {
		this._validateMod(mod);

		this._shapeMods.push(mod); 

		return mod;
	}

	private _validateMod(mod: Mods.Border | Mods.ColorFill | Mods.PatternFill): void {
		let blueprint = {};
		let valid = true;

		switch(mod.type) {
			case 'border':
				blueprint = {
					type: 'border',
					color: 0x000000,
					alpha: 1,
					lineWidth: 1,
					position: 'outside',
				}
				break;
			case 'colorFill':
				blueprint = {
					type: 'colorFill',
					color: 0x000000,
					alpha: 1,
				}
				break;
			case 'patternFill':
				blueprint = {
					type: 'patternFill',
					texture: PIXI.Texture.prototype,
					alpha: 1,
				}
				break;
			default:
				// If mod is not in this list it's considered invalid
				valid = false;
		}


		for(let prop in blueprint) {
			if (mod.hasOwnProperty(prop)) {
				if (typeof mod[prop] != typeof blueprint[prop]) {
					valid = false;
					break;
				}
			}
			else {
				valid = false;
				break;
			}
		}

		if(valid == false) throw new Error("Mod is not valid; a mod of type " + mod.type + " should have this structure: " + JSON.stringify(blueprint));
	}

	private _applyMods(mods: Array<Mods.Border | Mods.ColorFill | Mods.PatternFill>): void {
		for (let mod of mods) {
			let modFunc = undefined;

			switch (mod.type) {
				case 'border':
					modFunc = this._makeBorderGraphic;
					break;
				case 'colorFill':
					modFunc = this._makeColorFillGraphic;
					break;
				case 'patternFill':
					modFunc = this._makePatternFillSprite;
					break;
			}

			if (!modFunc) throw new Error("Mod doesn't exist: " + mod.type);

			let targetDisplayObject = modFunc.call(this, mod);

			if (mod.filters) {
				let displayObjects = this._applyFilters(targetDisplayObject, mod.filters);

				for (let i = 0; i < displayObjects.length; i++) this.addChild(displayObjects[i]);
			}
			else {
				this.addChild(targetDisplayObject);
			}
		}
	}

	private _makeColorFillGraphic(fillOptions: Mods.ColorFill, shapeOptions: Shapes.Ellipse | Shapes.Rect | Shapes.RoundedRect = this.shapeOptions): PIXI.Graphics {
		switch (this.type) {
			case 'rect':
				return this._makeFilledRect(shapeOptions as Shapes.Rect, fillOptions);
			case 'roundedRect':
				return this._makeFilledRoundedRect(shapeOptions as Shapes.RoundedRect, fillOptions);
			case 'ellipse':
				return this._makeFilledEllipse(shapeOptions as Shapes.Ellipse, fillOptions);
			default:
				throw new Error('No valid fill option of type ' + fillOptions.type);
		}
	}

	private _makeBorderGraphic(borderOptions: Mods.Border, shapeOptions: Shapes.Ellipse | Shapes.Rect | Shapes.RoundedRect = this.shapeOptions): PIXI.Graphics {
		let {color, alpha, lineWidth, position} = borderOptions,
			graphics = new PIXI.Graphics(),
			styleDimensionMod = 0;

		switch (position) {
			case 'inside':
				styleDimensionMod = lineWidth / 2;
				break;
			case 'outside':
				styleDimensionMod = -(lineWidth / 2);
				break;
		}
		
		graphics.lineStyle(lineWidth, color, alpha);

		if (this.type == 'rect') {
			let options = this.shapeOptions as Shapes.Rect,
				offsetWidth = options.width - (styleDimensionMod * 2),
				offsetHeight = options.height - (styleDimensionMod * 2);
			graphics.drawRect(styleDimensionMod, styleDimensionMod, offsetWidth, offsetHeight);
		}
		else if (this.type == 'roundedRect') {
			let options = this.shapeOptions as Shapes.RoundedRect,
				offsetWidth = options.width - (styleDimensionMod * 2),
				offsetHeight = options.height - (styleDimensionMod * 2),
				radius = options.radius;
			graphics.drawRoundedRect(styleDimensionMod, styleDimensionMod, offsetWidth, offsetHeight, radius);
		}
		else if (this.type == 'ellipse') {
			let options = this.shapeOptions as Shapes.Ellipse,
				offsetX = styleDimensionMod,
				offsetY = styleDimensionMod,
				offsetWidth = options.width - (styleDimensionMod * 2),
				offsetHeight = options.height - (styleDimensionMod * 2);
			graphics.drawEllipse(offsetX, offsetY, offsetWidth, offsetHeight);
		}

		return graphics;
	}

	private _makePatternFillSprite(fillOptions: Mods.PatternFill, shapeOptions: Shapes.Ellipse | Shapes.Rect | Shapes.RoundedRect = this.shapeOptions): PIXI.Sprite {
		let sprite = new PIXI.extras.TilingSprite(fillOptions.texture, this.width, this.height),
			mask = sprite.addChild(
				this._makeColorFillGraphic({
					type: 'colorFill',
					color: 0x000000,
					alpha: 1
				})
			);

		sprite.mask = mask;
		sprite.alpha = fillOptions.alpha;

		return sprite;
	}

	private _makeFilledRect(shapeOptions: Shapes.Rect, fillOptions: Mods.ColorFill): PIXI.Graphics {
		let {width, height} = shapeOptions,
			{color, alpha} = fillOptions,
			graphics = new PIXI.Graphics();

		graphics
			.beginFill(color, alpha)
			.drawRect(0, 0, width, height)
			.endFill();

		return graphics;
	}

	private _makeFilledRoundedRect(shapeOptions: Shapes.RoundedRect, fillOptions: Mods.ColorFill): PIXI.Graphics {
		let {width, height, radius} = shapeOptions,
			{color, alpha} = fillOptions,
			graphics = new PIXI.Graphics;

		graphics
			.beginFill(color, alpha)
			.drawRoundedRect(0, 0, width, height, radius)
			.endFill()

		return graphics;
	}

	private _makeFilledEllipse(shapeOptions: Shapes.Ellipse, fillOptions: Mods.ColorFill): PIXI.Graphics {
		let {width, height} = shapeOptions,
			{color, alpha} = fillOptions,
			graphics = new PIXI.Graphics,
			halfWidth = width / 2,
			halfHeight = height / 2;

		graphics
			.beginFill(color, alpha)
			.drawEllipse(halfWidth, halfHeight, halfWidth, halfHeight)
			.endFill()

		return graphics;

	}

	private _applyFilters(target: PIXI.DisplayObject, filters: Array<Filters.Shadow | Filters.InnerShadow | Filters.GaussianBlur>): Array<PIXI.DisplayObject> {
		let displayObjects = [];

		if (filters) {
			let isShadow = false;
			// Add shadows first
			for (let filter of filters) {
				if (filter.type == 'shadow') {
					displayObjects.push(this._makeShadowObject(filter));
					isShadow = true;
				}
			}
			// Insert target above shadow objects
			if (isShadow == false) displayObjects.push(target);
			// Add innerShadow objects and apply blurs
			for (let filter of filters) {
				switch (filter.type) {
					case 'innerShadow':
						displayObjects.push(this._makeInnerShadowObject(filter));
						break;
					case 'gaussianBlur':
						this._applyGaussianBlurFilter(target, filter);
						break;
				}
			}
		}
		else {
			displayObjects.push(target);
		}

		return displayObjects;
	}

	private _makeShadowObject(filter: Filters.Shadow): PIXI.Graphics {
		let blurFilter: Filters.GaussianBlur = {
				type: 'gaussianBlur',
				strength: filter.blur
			},
			colorFill: Mods.ColorFill = {
				type: 'colorFill',
				color: filter.color,
				alpha: filter.alpha,
				filters: [blurFilter]
			},
			modifiedShapeOptions = {
				type: this.type,
				width: this.shapeOptions.width + (filter.spread * 2),
				height: this.shapeOptions.height + (filter.spread * 2)
			},
			shadow = this._makeColorFillGraphic(colorFill, modifiedShapeOptions);
			this._applyFilters(shadow, colorFill.filters);

		shadow.x = filter.x - (filter.spread / 2);
		shadow.y = filter.y - (filter.spread / 2);

		return shadow;
	}

	private _makeInnerShadowObject(filter: Filters.InnerShadow): PIXI.Graphics {
		return null;
	}

	private _applyGaussianBlurFilter(target: PIXI.DisplayObject, filter: Filters.GaussianBlur): void {
		if (filter.strength <= 0) return;
		let activeFilters = target.filters || [],
			shadowFilter = new PIXI.filters.BlurFilter(filter.strength, 3);
		
		shadowFilter.padding = filter.strength * 4;
		
		activeFilters.push(shadowFilter);
		target.filters = activeFilters;
	}
}

export default Shape;