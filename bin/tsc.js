var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("Shape", ["require", "exports", "pixi.js"], function (require, exports, PIXI) {
    "use strict";
    exports.__esModule = true;
    var Shapes;
    (function (Shapes) {
        ;
    })(Shapes = exports.Shapes || (exports.Shapes = {}));
    var Shape = (function (_super) {
        __extends(Shape, _super);
        function Shape(name, options) {
            var _this = _super.call(this) || this;
            _this._modifiedProps = { x: false, y: false, width: false, height: false };
            _this._name = name;
            _this._shapeOptions = options;
            _this._init();
            return _this;
        }
        Shape.prototype.reshape = function (options, performRedraw) {
            if (performRedraw === void 0) { performRedraw = true; }
            for (var key in options) {
                if (this._shapeOptions.hasOwnProperty(key)) {
                    this._shapeOptions[key] = options[key];
                }
                else {
                    throw new Error('Property ' + key + ' does not exist on Shape with type ' + this.type);
                }
            }
            if (performRedraw)
                this.redraw();
            return this;
        };
        Shape.prototype.redraw = function () {
            this.removeChildren();
            this._applyMods(this._shapeMods);
        };
        Shape.prototype.resetMods = function () {
            this._shapeMods = [];
        };
        Shape.prototype.addModifier = function (modOptions) {
            this._addMod(modOptions);
            return this;
        };
        Object.defineProperty(Shape.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "type", {
            get: function () {
                return this.shapeOptions.type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "width", {
            get: function () {
                this._modifiedProps.width = true;
                return this.shapeOptions.width;
            },
            set: function (value) {
                this.reshape({ width: value });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "height", {
            get: function () {
                return this.shapeOptions.height;
            },
            set: function (value) {
                this._modifiedProps.height = true;
                this.reshape({ height: value });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "x", {
            set: function (value) {
                this._modifiedProps.x = true;
                this.position.x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Shape.prototype, "y", {
            set: function (value) {
                this._modifiedProps.y = true;
                this.position.y = value;
            },
            enumerable: true,
            configurable: true
        });
        Shape.prototype.propHasBeenModified = function (prop) {
            return this._modifiedProps[prop];
        };
        Object.defineProperty(Shape.prototype, "shapeOptions", {
            get: function () {
                return this._shapeOptions;
            },
            enumerable: true,
            configurable: true
        });
        Shape.prototype._init = function () {
            this.resetMods();
        };
        Shape.prototype._addMod = function (mod) {
            this._shapeMods.push(mod);
            return mod;
        };
        Shape.prototype._applyMods = function (mods) {
            for (var _i = 0, mods_1 = mods; _i < mods_1.length; _i++) {
                var mod = mods_1[_i];
                var modFunc = undefined;
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
                if (!modFunc)
                    throw new Error("Mod doesn't exist: " + mod.type);
                var targetDisplayObject = modFunc.call(this, mod);
                if (mod.filters) {
                    var displayObjects = this._applyFilters(targetDisplayObject, mod.filters);
                    for (var i = 0; i < displayObjects.length; i++)
                        this.addChild(displayObjects[i]);
                }
                else {
                    this.addChild(targetDisplayObject);
                }
            }
        };
        Shape.prototype._makeColorFillGraphic = function (fillOptions, shapeOptions) {
            if (shapeOptions === void 0) { shapeOptions = this.shapeOptions; }
            switch (this.type) {
                case 'rect':
                    return this._makeFilledRect(shapeOptions, fillOptions);
                case 'roundedRect':
                    return this._makeFilledRoundedRect(shapeOptions, fillOptions);
                case 'ellipse':
                    return this._makeFilledEllipse(shapeOptions, fillOptions);
                default:
                    throw new Error('No valid fill option of type ' + fillOptions.type);
            }
        };
        Shape.prototype._makeBorderGraphic = function (borderOptions, shapeOptions) {
            if (shapeOptions === void 0) { shapeOptions = this.shapeOptions; }
            var color = borderOptions.color, alpha = borderOptions.alpha, lineWidth = borderOptions.lineWidth, position = borderOptions.position, graphics = new PIXI.Graphics(), styleDimensionMod = 0;
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
                var options = this.shapeOptions, offsetWidth = options.width - (styleDimensionMod * 2), offsetHeight = options.height - (styleDimensionMod * 2);
                graphics.drawRect(styleDimensionMod, styleDimensionMod, offsetWidth, offsetHeight);
            }
            else if (this.type == 'roundedRect') {
                var options = this.shapeOptions, offsetWidth = options.width - (styleDimensionMod * 2), offsetHeight = options.height - (styleDimensionMod * 2), radius = options.radius;
                graphics.drawRoundedRect(styleDimensionMod, styleDimensionMod, offsetWidth, offsetHeight, radius);
            }
            else if (this.type == 'ellipse') {
                var options = this.shapeOptions, offsetX = styleDimensionMod, offsetY = styleDimensionMod, offsetWidth = options.width - (styleDimensionMod * 2), offsetHeight = options.height - (styleDimensionMod * 2);
                graphics.drawEllipse(offsetX, offsetY, offsetWidth, offsetHeight);
            }
            return graphics;
        };
        Shape.prototype._makePatternFillSprite = function (fillOptions, shapeOptions) {
            if (shapeOptions === void 0) { shapeOptions = this.shapeOptions; }
            var sprite = new PIXI.extras.TilingSprite(fillOptions.texture, this.width, this.height), mask = sprite.addChild(this._makeColorFillGraphic({
                type: 'colorFill',
                color: 0x000000,
                alpha: 1
            }));
            sprite.mask = mask;
            sprite.alpha = fillOptions.alpha;
            return sprite;
        };
        Shape.prototype._makeFilledRect = function (shapeOptions, fillOptions) {
            var width = shapeOptions.width, height = shapeOptions.height, color = fillOptions.color, alpha = fillOptions.alpha, graphics = new PIXI.Graphics();
            graphics
                .beginFill(color, alpha)
                .drawRect(0, 0, width, height)
                .endFill();
            return graphics;
        };
        Shape.prototype._makeFilledRoundedRect = function (shapeOptions, fillOptions) {
            var width = shapeOptions.width, height = shapeOptions.height, radius = shapeOptions.radius, color = fillOptions.color, alpha = fillOptions.alpha, graphics = new PIXI.Graphics;
            graphics
                .beginFill(color, alpha)
                .drawRoundedRect(0, 0, width, height, radius)
                .endFill();
            return graphics;
        };
        Shape.prototype._makeFilledEllipse = function (shapeOptions, fillOptions) {
            var width = shapeOptions.width, height = shapeOptions.height, color = fillOptions.color, alpha = fillOptions.alpha, graphics = new PIXI.Graphics, halfWidth = width / 2, halfHeight = height / 2;
            graphics
                .beginFill(color, alpha)
                .drawEllipse(halfWidth, halfHeight, halfWidth, halfHeight)
                .endFill();
            return graphics;
        };
        Shape.prototype._applyFilters = function (target, filters) {
            var displayObjects = [];
            if (filters) {
                var isShadow = false;
                for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
                    var filter = filters_1[_i];
                    if (filter.type == 'shadow') {
                        displayObjects.push(this._makeShadowObject(filter));
                        isShadow = true;
                    }
                }
                if (isShadow == false)
                    displayObjects.push(target);
                for (var _a = 0, filters_2 = filters; _a < filters_2.length; _a++) {
                    var filter = filters_2[_a];
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
        };
        Shape.prototype._makeShadowObject = function (filter) {
            var blurFilter = {
                type: 'gaussianBlur',
                strength: filter.blur
            }, colorFill = {
                type: 'colorFill',
                color: filter.color,
                alpha: filter.alpha,
                filters: [blurFilter]
            }, modifiedShapeOptions = {
                type: this.type,
                width: this.shapeOptions.width + (filter.spread * 2),
                height: this.shapeOptions.height + (filter.spread * 2)
            }, shadow = this._makeColorFillGraphic(colorFill, modifiedShapeOptions);
            this._applyFilters(shadow, colorFill.filters);
            shadow.x = filter.x - (filter.spread / 2);
            shadow.y = filter.y - (filter.spread / 2);
            return shadow;
        };
        Shape.prototype._makeInnerShadowObject = function (filter) {
            return null;
        };
        Shape.prototype._applyGaussianBlurFilter = function (target, filter) {
            if (filter.strength <= 0)
                return;
            var activeFilters = target.filters || [], shadowFilter = new PIXI.filters.BlurFilter(filter.strength, 3);
            shadowFilter.padding = filter.strength * 4;
            activeFilters.push(shadowFilter);
            target.filters = activeFilters;
        };
        return Shape;
    }(PIXI.Sprite));
    exports.Shape = Shape;
    exports["default"] = Shape;
});
define("ShapeStore", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var ShapeStore = (function () {
        function ShapeStore() {
            this._init();
        }
        ShapeStore.prototype.resetAllShapeMods = function () {
            for (var _i = 0, _a = this._shapes; _i < _a.length; _i++) {
                var shape = _a[_i];
                shape.resetMods();
            }
        };
        ShapeStore.prototype.redrawShapes = function () {
            for (var _i = 0, _a = this._shapes; _i < _a.length; _i++) {
                var shape = _a[_i];
                shape.redraw();
            }
        };
        ShapeStore.prototype.addShapesAsChildren = function (target) {
            for (var _i = 0, _a = this._shapes; _i < _a.length; _i++) {
                var shape = _a[_i];
                target.addChild(shape);
            }
        };
        ShapeStore.prototype.addShape = function (path, shape) {
            if (this.hasShapeAtPath(path))
                throw new Error('Shape already exists at path ' + path + '; paths must be unique.');
            var group = this.createGroup(path);
            this._paths[path] = shape;
            this._shapes.push(shape);
            group.addChild(shape);
            return shape;
        };
        ShapeStore.prototype.createGroup = function (path) {
            var separator = ShapeStore.GROUP_SEPARATOR, pathSplit = path.split(separator), groupPath = "", group;
            for (var i = 0, l = pathSplit.length; i < l; i++) {
                if (i > 0)
                    groupPath += separator;
                groupPath += pathSplit[i];
                if (!this.hasGroupAtPath(groupPath)) {
                    if (i == 0) {
                        group = new PIXI.Container();
                    }
                    else {
                        group = group.addChild(new PIXI.Container());
                    }
                    this._groups[groupPath] = group;
                }
                else {
                    group = this.getGroupFromPath(groupPath);
                }
            }
            return this._groups[groupPath];
        };
        ShapeStore.prototype.getShapeFromPath = function (path) {
            if (this.hasShapeAtPath(path) == false)
                throw new Error('No shape exists at path ' + path);
            return this._paths[path];
        };
        ShapeStore.prototype.hasShapeAtPath = function (path) {
            return this._paths[path] != null;
        };
        ShapeStore.prototype.getGroupFromPath = function (path) {
            if (this.hasGroupAtPath(path) == false) {
                if (this.hasShapeAtPath(path)) {
                    throw new Error('Path is not a group but a Shape object: ' + this.getShapeFromPath(path));
                }
                else {
                    throw new Error('No group at path ' + path);
                }
            }
            return this._groups[path];
        };
        ShapeStore.prototype.hasGroupAtPath = function (path) {
            return this._groups[path] != null;
        };
        Object.defineProperty(ShapeStore.prototype, "shapes", {
            get: function () {
                return this._shapes;
            },
            enumerable: true,
            configurable: true
        });
        ShapeStore.prototype._init = function () {
            this._paths = {};
            this._groups = {};
            this._shapes = [];
        };
        return ShapeStore;
    }());
    ShapeStore.GROUP_SEPARATOR = '.';
    exports.ShapeStore = ShapeStore;
    exports["default"] = ShapeStore;
});
define("SketchToShapeStore", ["require", "exports", "ShapeStore"], function (require, exports, ShapeStore_1) {
    "use strict";
    exports.__esModule = true;
    var SketchToShapeStore = (function () {
        function SketchToShapeStore(options) {
            var template = options.template, rootId = options.rootId, shapeStore = options.shapeStore;
            this._init(template, rootId, shapeStore);
        }
        SketchToShapeStore.prototype.parseToShapeStore = function (updatedTemplate) {
            if (updatedTemplate === void 0) { updatedTemplate = this._template; }
            this._template = updatedTemplate;
            var rootNode = this._template.getElementById(this._rootId), path = this._rootId;
            this._shapeStore.resetAllShapeMods();
            if (!rootNode || !rootNode.childNodes)
                throw new Error('Root ID not found or empty: ' + this._rootId);
            this._traverseNodes(rootNode.childNodes, path, this._shapeStore, rootNode);
            return this._shapeStore;
        };
        SketchToShapeStore.prototype._init = function (template, rootId, shapeStore) {
            this._template = template;
            this._rootId = rootId;
            this._shapeStore = shapeStore || new ShapeStore_1["default"]();
        };
        SketchToShapeStore.prototype._traverseNodes = function (nodes, path, shapeStore, groupNode) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node.nodeType == 1) {
                    switch (node.nodeName) {
                        case 'g':
                            if (this._nodeHasAttribute(node, 'id')) {
                                var id = this._getNodeAttribute(node, 'id'), subPath = path + ShapeStore_1["default"].GROUP_SEPARATOR + id;
                                if (!shapeStore.hasGroupAtPath(subPath)) {
                                    var container = shapeStore.createGroup(subPath), _a = this._parseTranslatePosition(node), x = _a.x, y = _a.y;
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
        };
        SketchToShapeStore.prototype._makeOrModifyShape = function (node, path, shapeStore, groupNode) {
            var shape;
            if (shapeStore.hasShapeAtPath(path)) {
                shape = shapeStore.getShapeFromPath(path);
            }
            else {
                shape = this._makeShapeFromNode(node, path, groupNode);
                shapeStore.addShape(path, shape);
                var groupPos = this._parseTranslatePosition(groupNode), group = shape.parent || shape;
                group.x = groupPos.x;
                group.y = groupPos.y;
            }
            if (this._nodeHasAttribute(node, 'fill')) {
                var color = this._parseColorValue(this._getNodeAttribute(node, 'fill'));
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
                            alpha: parseFloat(this._getNodeAttribute(node, 'fill-opacity') || 1)
                        });
                    }
                }
            }
            if (this._nodeHasAttribute(node, 'stroke')) {
                var position = null, nodeWidth = this._getNodeAttribute(node, 'width');
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
        };
        SketchToShapeStore.prototype._makeShapeFromNode = function (node, path, groupNode) {
            var shapeNode = node, shapeOptions;
            if (node.nodeName == 'use') {
                var ref = this._getNodeAttribute(node, 'xlink:href'), refId = this._parseXlinkId(ref);
                shapeNode = this._template.getElementById(refId);
            }
            switch (shapeNode.nodeName) {
                case 'rect':
                    shapeOptions = {
                        type: 'rect',
                        width: parseFloat(this._getNodeAttribute(shapeNode, 'width')),
                        height: parseFloat(this._getNodeAttribute(shapeNode, 'height'))
                    };
                    if (this._nodeHasAttribute(node, 'rx')) {
                        shapeOptions['type'] = 'roundedRect',
                            shapeOptions['radius'] = parseInt(this._getNodeAttribute(node, 'rx'));
                    }
                    break;
                default:
                    return null;
            }
            var shape = new Shape(this._getNodeAttribute(groupNode, 'id'), shapeOptions);
            shape.x = parseFloat(this._getNodeAttribute(shapeNode, 'x') || 0);
            shape.y = parseFloat(this._getNodeAttribute(shapeNode, 'y') || 0);
            return shape;
        };
        SketchToShapeStore.prototype._parseXlinkId = function (ref) {
            return ref.replace('#', '');
        };
        SketchToShapeStore.prototype._parseUrlAttribute = function (ref) {
            return ref.match(/\(#(\S+)\)/)[1];
        };
        SketchToShapeStore.prototype._getFiltersFromNode = function (sourceShape, node) {
            var filters = [];
            if (this._nodeHasAttribute(node, 'filter')) {
                var filterId = this._parseUrlAttribute(this._getNodeAttribute(node, 'filter')), filtersNode = this._template.getElementById(filterId);
                if (filtersNode) {
                    for (var i = 0, length_1 = filtersNode.childNodes.length; i < length_1; i++) {
                        var node_1 = filtersNode.childNodes[i];
                        if (node_1.nodeName == 'feOffset') {
                            var spread = 0, xOffset = parseInt(this._getNodeAttribute(node_1, 'dx')), yOffset = parseInt(this._getNodeAttribute(node_1, 'dy')), blurStrength = 0, rgba = { r: 0, g: 0, b: 0, a: 0 };
                            var previousNode = filtersNode.childNodes[i - 2];
                            if (previousNode && previousNode.nodeName == 'feMorphology') {
                                spread = parseFloat(this._getNodeAttribute(previousNode, 'radius')) * 2;
                            }
                            for (i = i + 1; i < length_1; i++) {
                                var subNode = filtersNode.childNodes[i];
                                if (subNode.nodeType != 1)
                                    continue;
                                if (subNode.nodeName == 'feOffset')
                                    break;
                                switch (subNode.nodeName) {
                                    case 'feMorphology':
                                        spread = parseFloat(this._getNodeAttribute(subNode, 'radius')) * 2;
                                        break;
                                    case 'feGaussianBlur':
                                        blurStrength = parseFloat(this._getNodeAttribute(subNode, 'stdDeviation'));
                                        break;
                                    case 'feColorMatrix':
                                        rgba = this._colorMatrixToRGBA(this._getNodeAttribute(subNode, 'values'));
                                        break;
                                }
                            }
                            var shadowFilter = {
                                type: 'shadow',
                                color: PIXI.utils.rgb2hex([rgba.r, rgba.g, rgba.b]),
                                alpha: rgba.a,
                                x: xOffset,
                                y: yOffset,
                                blur: blurStrength,
                                spread: spread
                            };
                            filters.push(shadowFilter);
                        }
                        else if (node_1.nodeName == 'feGaussianBlur') {
                            var blurFilter = {
                                type: 'gaussianBlur',
                                strength: parseFloat(this._getNodeAttribute(node_1, 'stdDeviation'))
                            };
                            filters.push(blurFilter);
                        }
                    }
                }
            }
            return filters;
        };
        SketchToShapeStore.prototype._nodeHasAttribute = function (node, attribute) {
            if (node.attributes.getNamedItem(attribute))
                return true;
            return false;
        };
        SketchToShapeStore.prototype._getNodeAttribute = function (node, attribute) {
            var result = node.attributes.getNamedItem(attribute);
            if (result)
                return result.textContent;
            return null;
        };
        SketchToShapeStore.prototype._parsePercentageMod = function (source, mod) {
            var positionPercent = parseFloat(mod.replace('%', '')) / 100, calcPosition = Math.round(source * positionPercent);
            return calcPosition;
        };
        SketchToShapeStore.prototype._colorMatrixToRGBA = function (source) {
            var match = source.match(/(\d+\.?\d*)/g), rgba = { r: parseFloat(match[4]), g: parseFloat(match[9]), b: parseFloat(match[14]), a: parseFloat(match[18]) };
            return rgba;
        };
        SketchToShapeStore.prototype._parseTranslatePosition = function (node) {
            var result = { x: 0, y: 0 };
            if (this._nodeHasAttribute(node, 'transform')) {
                var transform = this._getNodeAttribute(node, 'transform'), match = transform.match(/translate\((\S+),\s(\S+)\)/i);
                if (match) {
                    result = { x: parseInt(match[1]), y: parseInt(match[2]) };
                }
            }
            return result;
        };
        SketchToShapeStore.prototype._parseColorValue = function (value) {
            var result = { type: null, value: null };
            if (!value)
                return result;
            if (value.substr(0, 3) == 'url') {
                var node = this._template.getElementById(this._parseUrlAttribute(value));
                switch (node.nodeName) {
                    case 'patternFill':
                    default:
                        result = { type: 'patternFill', value: this._parsePatternNode(this._template, node) };
                }
            }
            else if (value[0] == '#') {
                result = { type: 'hex', value: this._convertStringToHex(value) };
            }
            else {
                result = { type: 'hex', value: 0x000000 };
            }
            return result;
        };
        SketchToShapeStore.prototype._convertStringToHex = function (value) {
            return value.replace('#', '0x');
        };
        SketchToShapeStore.prototype._parsePatternNode = function (template, node) {
            var imageId = this._getNodeAttribute(node.childNodes[1], 'xlink:href'), imageNode = template.getElementById(imageId.replace('#', '')), base64 = this._getNodeAttribute(imageNode, 'xlink:href'), width = parseInt(this._getNodeAttribute(imageNode, 'width')), height = parseInt(this._getNodeAttribute(imageNode, 'height')), image = new Image();
            image.src = base64;
            var baseTexture = new PIXI.BaseTexture(image), texture = new PIXI.Texture(baseTexture);
            return texture;
        };
        return SketchToShapeStore;
    }());
    exports.SketchToShapeStore = SketchToShapeStore;
    exports["default"] = SketchToShapeStore;
});
//# sourceMappingURL=tsc.js.map