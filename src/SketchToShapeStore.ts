import ShapeStore from 'ShapeStore';
interface ColorValue {
	type: 'hex' | 'patternFill' | null,
	value: any | PIXI.Texture | null
}
export class SketchToShapeStore {
	private _template: XMLDocument;
	private _rootId: string;
	private _shapeStore: ShapeStore;

	constructor(options: {template: XMLDocument, rootId: string, shapeStore?: ShapeStore}) {
		let {template, rootId, shapeStore} = options;

		this._init(template, rootId, shapeStore);
	}

	public parseToShapeStore(updatedTemplate: XMLDocument = this._template): ShapeStore {
		this._template = updatedTemplate;

		let rootNode = this._template.getElementById(this._rootId),
			path = this._rootId;

		this._shapeStore.resetAllShapeMods();

		if (!rootNode || !rootNode.childNodes) throw new Error('Root ID not found or empty: ' + this._rootId);

		this._traverseNodes(rootNode.childNodes, path, this._shapeStore, rootNode);

		return this._shapeStore;
	}

	private _init(template: XMLDocument, rootId: string, shapeStore?: ShapeStore): void {
		this._template = template;
		this._rootId = rootId;
		this._shapeStore = shapeStore || new ShapeStore();
	}

	private _traverseNodes(nodes: NodeList, path: string, shapeStore: ShapeStore, groupNode: Node): void {
		for (let i = 0, l = nodes.length; i < l; i++) {
			let node = nodes[i];

			if (node.nodeType == 1) {
				switch (node.nodeName) {
					case 'g':
						if (this._nodeHasAttribute(node, 'id')) {

							let id = this._getNodeAttribute(node, 'id'),
								subPath = path + ShapeStore.GROUP_SEPARATOR + id;
							
							if (!shapeStore.hasGroupAtPath(subPath)) {
								let container = shapeStore.createGroup(subPath),
									{x, y} = this._parseTranslatePosition(node);
								
								container.x = x;
								container.y = y;
							}
							this._traverseNodes(node.childNodes, subPath, shapeStore, node);
						}
						else {
							this._traverseNodes(node.childNodes, path, shapeStore, groupNode);
						}
						break;
					case 'use':
					case 'rect':
						this._makeOrModifyShape(node, path, shapeStore, groupNode);
						break;
				}
			}
		}
	}

	private _makeOrModifyShape(node: Node, path: string, shapeStore: ShapeStore, groupNode: Node): void {
		let shape: Shape;

		if (shapeStore.hasShapeAtPath(path)) {
			shape = shapeStore.getShapeFromPath(path);
		}
		else {
			shape = this._makeShapeFromNode(node, path, groupNode);
			shapeStore.addShape(path, shape);
			
			let groupPos = this._parseTranslatePosition(groupNode),
				group = shape.parent || shape;

			group.x = groupPos.x;
			group.y = groupPos.y;
		}


		if (this._nodeHasAttribute(node, 'fill')) {
			let color = this._parseColorValue(this._getNodeAttribute(node, 'fill'));
			if (color) {
				if (color.type == 'hex') {
					shape.addModifier({
						type: 'colorFill',
						color: color.value,
						alpha: parseFloat(this._getNodeAttribute(node, 'fill-opacity') || 1),
						filters: this._getFiltersFromNode(shape, node)
					});
				}
				else if (color.type == 'patternFill') {
					shape.addModifier({
						type: 'patternFill',
						texture: color.value,
						alpha: parseFloat(this._getNodeAttribute(node, 'fill-opacity') || 1),
					});
				}
			}
		}

		if (this._nodeHasAttribute(node, 'stroke')) {
			let position = null,
				nodeWidth = this._getNodeAttribute(node, 'width');

			if (shape.width == nodeWidth) {
				position = 'center';
			}
			else if (shape.width < nodeWidth) {
				position = 'outside';
			}
			else {
				position = 'inside';
			}

			shape.addModifier({
				type: 'border',
				color: this._convertStringToHex(this._getNodeAttribute(node, 'stroke')),
				alpha: parseFloat(this._getNodeAttribute(node, 'stroke-opacity') || 1),
				lineWidth: parseInt(this._getNodeAttribute(node, 'stroke-width') || 1),
				position: position
			});
		}
	}

	private _makeShapeFromNode(node: Node, path: string, groupNode: Node): Shape {
		let shapeNode = node,
			shapeOptions: Shapes.Ellipse | Shapes.Rect | Shapes.RoundedRect;

		if (node.nodeName == 'use') {
			let ref = this._getNodeAttribute(node, 'xlink:href'),
				refId = this._parseXlinkId(ref);
			shapeNode = this._template.getElementById(refId);
		}

		switch (shapeNode.nodeName) {
			case 'rect':
				shapeOptions = {
					type: 'rect',
					width: parseFloat(this._getNodeAttribute(shapeNode, 'width')),
					height: parseFloat(this._getNodeAttribute(shapeNode, 'height')),
				}
				if (this._nodeHasAttribute(node, 'rx')) {
					shapeOptions['type'] = 'roundedRect',
					shapeOptions['radius'] = parseInt(this._getNodeAttribute(node, 'rx'))
				}
				break;
			default: 
				return null;
		}

		let shape = new Shape(this._getNodeAttribute(groupNode, 'id'), shapeOptions);

		shape.x = parseFloat(this._getNodeAttribute(shapeNode, 'x') || 0);
		shape.y = parseFloat(this._getNodeAttribute(shapeNode, 'y') || 0);

		return shape;
	}

	private _parseXlinkId(ref: string): string {
		return ref.replace('#', '');
	}

	private _parseUrlAttribute(ref: string): string {
		return ref.match(/\(#(\S+)\)/)[1];
	}

	private _getFiltersFromNode(sourceShape: Shape, node: Node): Array<Filters.GaussianBlur | Filters.InnerShadow | Filters.Shadow> {
		let filters = [];

		if (this._nodeHasAttribute(node, 'filter')) {
			let filterId = this._parseUrlAttribute(this._getNodeAttribute(node, 'filter')),
				filtersNode = this._template.getElementById(filterId);

			if (filtersNode) {
				for (let i = 0, length = filtersNode.childNodes.length; i < length; i++) {
					let node = filtersNode.childNodes[i];

					if (node.nodeName == 'feOffset') {
						// This is a outer shadow, so let's go ahead and find modifiers below until we reach the end or the next feOffset
						let spread = 0,
							xOffset = parseInt(this._getNodeAttribute(node, 'dx')),
							yOffset = parseInt(this._getNodeAttribute(node, 'dy')),
							blurStrength = 0,
							rgba = {r: 0, g: 0, b: 0, a: 0};

						let previousNode = filtersNode.childNodes[i - 2];

						if (previousNode && previousNode.nodeName == 'feMorphology') {
							spread = parseFloat(this._getNodeAttribute(previousNode, 'radius')) * 2; // It's given in radius, so we double it
						}
							
						for (i = i + 1; i < length; i++) {
							let subNode = filtersNode.childNodes[i];
							if (subNode.nodeType != 1) continue;
							if (subNode.nodeName == 'feOffset') break; // Break out if next shadow

							switch (subNode.nodeName) {
								// Spread mod
								case 'feMorphology':
									spread = parseFloat(this._getNodeAttribute(subNode, 'radius')) * 2; // It's given in radius, so we double it
									break;
								case 'feGaussianBlur':
									blurStrength = parseFloat(this._getNodeAttribute(subNode, 'stdDeviation'));
									break;
								case 'feColorMatrix':
									rgba = this._colorMatrixToRGBA(this._getNodeAttribute(subNode, 'values'));
									break;
							}
						}

						let shadowFilter: Filters.Shadow = {
							type: 'shadow',
							color: PIXI.utils.rgb2hex([rgba.r, rgba.g, rgba.b]),
							alpha: rgba.a,
							x: xOffset,
							y: yOffset,
							blur: blurStrength,
							spread: spread
						}
						filters.push(shadowFilter);
					}
					else if (node.nodeName == 'feGaussianBlur') {
						let blurFilter: Filters.GaussianBlur = {
							type: 'gaussianBlur',
							strength: parseFloat(this._getNodeAttribute(node, 'stdDeviation'))
						}
						filters.push(blurFilter);
					}
				}
			}
		}

		return filters;
	}

	private _nodeHasAttribute(node: Node, attribute: string): Boolean {
		if (node.attributes.getNamedItem(attribute)) return true;
		return false;
	}

	private _getNodeAttribute(node: Node, attribute: string): any {
		let result = node.attributes.getNamedItem(attribute);
		if (result) return result.textContent;
		return null;
	}

	private _parsePercentageMod(source: number, mod: string): number {
		let positionPercent = parseFloat(mod.replace('%', '')) / 100,
			calcPosition = Math.round(source * positionPercent);
			
		return calcPosition;
	}

	private _colorMatrixToRGBA(source: string): {r: number, g: number, b: number, a: number} {
		let match = source.match(/(\d+\.?\d*)/g),
			rgba = {r: parseFloat(match[4]), g: parseFloat(match[9]), b: parseFloat(match[14]), a: parseFloat(match[18])};

		return rgba;
	}

	private _parseTranslatePosition(node: Node): {x: number, y: number} {
		let result = {x: 0, y: 0}

		if (this._nodeHasAttribute(node, 'transform')) {
			let transform = this._getNodeAttribute(node, 'transform'),
				match = transform.match(/translate\((\S+),\s(\S+)\)/i);

			if (match) {
				result = {x: parseInt(match[1]), y: parseInt(match[2])}
			}
		}

		return result;
	}

	private _parseColorValue(value: string): ColorValue {
		let result:ColorValue = {type: null, value: null};

		if (!value) return result;

		if (value.substr(0, 3) == 'url') {
			let node = this._template.getElementById(this._parseUrlAttribute(value));
			switch (node.nodeName) {
				case 'patternFill':
				default:
					result = {type: 'patternFill', value: this._parsePatternNode(this._template, node)}
			}
		}
		else if (value[0] == '#') {
			result = {type: 'hex', value: this._convertStringToHex(value)};
		}
		else {
			result = {type: 'hex', value: 0x000000} // The word 'black' is used certain filter containers...
		}
		
		return result;
	}

	private _convertStringToHex(value: string): any {
		return value.replace('#', '0x');
	}

	private _parsePatternNode(template: XMLDocument, node: Node): PIXI.Texture {
		let imageId = this._getNodeAttribute(node.childNodes[1], 'xlink:href'),
			imageNode = template.getElementById(imageId.replace('#', '')),
			base64 = this._getNodeAttribute(imageNode, 'xlink:href'),
			width = parseInt(this._getNodeAttribute(imageNode, 'width')),
			height = parseInt(this._getNodeAttribute(imageNode, 'height')),
			image = new Image();
		image.src = base64;
		let baseTexture = new PIXI.BaseTexture(image),
			texture = new PIXI.Texture(baseTexture);
		return texture;
	}
}

export default SketchToShapeStore;