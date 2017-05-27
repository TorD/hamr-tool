import { Shape, Shapes, Filters, Mods } from '../src/Shape';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

PIXI.utils.skipHello();

describe('Shape', () => {
	let createRectShape = (shapeName = 'test-rect-shape'): Shape => {
		let shapeSettings = {
			type: 'rect',
			width: 20,
			height: 20
		}

		return new Shape(shapeName, shapeSettings);
	}

	describe('constructor', () => {
		it('should return a valid instance when passed a name string and options object', () => {
			let shape = createRectShape();
			expect(shape).to.be.an('object');
		})

		it('should throw an error if name string is missing', () => {
			let createShapeWithoutName = () => {
				createRectShape(null);
			}

			expect(createShapeWithoutName).to.throw('Shape name not provided');
		})

		it('should throw an error if options object is missing', () => {
			let createShapeWithoutOptions = () => {
				new Shape('name', null);
			}

			expect(createShapeWithoutOptions).to.throw('Shape options not provided');
		})
	})

	describe('addModifier', () => {
		it('should accept mods of style Mods.Border', () => {
			let mod: Mods.Border = {
				type: 'border',
				color: 0xff0000,
				alpha: 0,
				lineWidth: 2,
				position: 'inside'
			}

			let shape = createRectShape();

			let addABorderModifier = () => {
				shape.addModifier(mod);
			}

			expect(addABorderModifier).to.not.throw();
		})

		it('should accept mods of style Mods.ColorFill', () => {
			let mod: Mods.ColorFill = {
				type: 'colorFill',
				color: 0x000000,
				alpha: 0,
			}

			let shape = createRectShape();

			let addAColorFillModifier = () => {
				shape.addModifier(mod);
			}

			expect(addAColorFillModifier).to.not.throw();
		})

		it('should accept mods of style Mods.PatternFill', () => {
			let mod: Mods.PatternFill = {
				type: 'patternFill',
				texture: new PIXI.Texture(new PIXI.BaseTexture()),
				alpha: 0,
			}

			let shape = createRectShape();

			let addAPatternFillModifier = () => {
				shape.addModifier(mod);
			}

			expect(addAPatternFillModifier).to.not.throw();
		})
	})

	describe('type', () => {
		it('should return the shape type', () => {
			let shapeType = 'rect';
			let shape = createRectShape();

			let result = shape.type;

			expect(result).to.be.equal(shapeType);
		})
	})

	describe('width', () => {
		describe('set', () => {
			it('should call reshape with passed value as width property of options', () => {
				let shape = createRectShape();
				let newWidth = 500;

				let reshapeSpy = sinon.spy(shape, 'reshape');

				shape.width = newWidth;

				expect(reshapeSpy).to.be.calledWith({width: newWidth});
			})

			it('should mark width as modified prop', () => {
				let shape = createRectShape();
				
				shape.width = 500;

				let result = shape.propHasBeenModified('width');

				expect(result).to.be.true;
			})
		})
	})

	describe('height', () => {
		describe('set', () => {
			it('should call reshape with passed value as height property of options', () => {
				let shape = createRectShape();
				let newHeight = 500;

				let reshapeSpy = sinon.spy(shape, 'reshape');

				shape.height = newHeight;

				expect(reshapeSpy).to.be.calledWith({height: newHeight});
			})

			it('should mark height as modified prop', () => {
				let shape = createRectShape();
				
				shape.height = 500;

				let result = shape.propHasBeenModified('height');

				expect(result).to.be.true;
			})
		})
	})

	describe('x', () => {
		describe('set', () => {
			it('should mark x as modified prop', () => {
				let shape = createRectShape();
				
				shape.x = 100;

				let result = shape.propHasBeenModified('x');

				expect(result).to.be.true;
			})
		})
	})

	describe('y', () => {
		describe('set', () => {
			it('should mark y as modified prop', () => {
				let shape = createRectShape();
				
				shape.y = 100;

				let result = shape.propHasBeenModified('y');

				expect(result).to.be.true;
			})
		})
	})

	describe('propHasBeenModified', () => {
		it('should return true if a given prop has been modified', () => {
			let shape = createRectShape();

			shape.x = 200;

			let result = shape.propHasBeenModified('x');

			expect(result).to.be.true;
		})

		it('should return false if a given prop has not been been modified', () => {
			let shape = createRectShape();

			let result = shape.propHasBeenModified('width');

			expect(result).to.be.false;
		})
	})

	describe('reshape', () => {
		it('should throw an error if a property key does not exist on Shape type', () => {
			let shape = createRectShape();

			let reshapeWithNonExistentProperty = () => {
				shape.reshape({radius: 25});
			}

			expect(reshapeWithNonExistentProperty).to.throw();
		})

		it('should modify the value of properties in shapeOptions', () => {
			let shape = createRectShape();
			let newWidth = shape.width + 1000;
			let newHeight = shape.height + 500;

			shape.reshape({width: newWidth, height: newHeight});

			let resultWidth = shape.shapeOptions.width;
			let resultHeight = shape.shapeOptions.height;

			expect(resultWidth).to.be.equal(newWidth);
			expect(resultHeight).to.be.equal(newHeight);
		})

		it('should call redraw by default', () => {
			let shape = createRectShape();

			let redrawSpy = sinon.spy(shape, 'redraw');

			shape.reshape({width: 500});

			expect(redrawSpy).to.be.called;
		})

		it('should call redraw if second parameter is true', () => {
			let shape = createRectShape();

			let redrawSpy = sinon.spy(shape, 'redraw');

			shape.reshape({width: 500}, true);

			expect(redrawSpy).to.be.called;
		})

		it('should not call redraw if second parameter is false', () => {
			let shape = createRectShape();

			let redrawSpy = sinon.spy(shape, 'redraw');

			shape.reshape({width: 500}, false);

			expect(redrawSpy).not.to.be.called;
		})
	})

	describe('redraw', () => {
		it('should call removeChildren', () => {
			let shape = createRectShape();

			let removeChildrenSpy = sinon.spy(shape, 'removeChildren');

			shape.redraw();

			expect(removeChildrenSpy).to.be.called;
		})

		it('should re-apply and re-add its mods as children after removing them', () => {
			let shape = createRectShape();
			let mod: Mods.Border = {
				type: 'border',
				color: 0xff0000,
				alpha: 0,
				lineWidth: 2,
				position: 'inside'
			}

			shape.addModifier(mod);

			shape.redraw();

			let modsNum = shape.children.length;

			expect(modsNum).to.be.equal(1);
		})
	})

	describe('resetMods', () => {
		it('should remove all mods', () => {
			let shape = createRectShape();

			let mod: Mods.Border = {
				type: 'border',
				color: 0xff0000,
				alpha: 0,
				lineWidth: 2,
				position: 'inside'
			}

			shape.addModifier(mod);

			shape.resetMods();

			let modsNum = shape.mods.length;

			expect(modsNum).to.be.equal(0);
		})
	})
})