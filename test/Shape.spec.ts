import { Shape, Shapes, Filters, Mods } from '../src/Shape';

import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

PIXI.utils.skipHello();

describe('Shape', () => {
	let newRectShape = (shapeName = 'test-rect-shape'): Shape => {
		let shapeSettings = {
			type: 'rect',
			width: 20,
			height: 20
		}

		return new Shape(shapeName, shapeSettings);
	}

	describe('constructor', () => {
		it('should return a valid instance when passed a name string and options object', () => {
			let shape = newRectShape();
			expect(shape).to.be.an('object');
		})

		it('should throw an error if name string is missing', () => {
			let constructorSpy = sinon.spy(Shape.prototype, '_init');

			try {
				newRectShape(null);
			}
			catch(e) {
				// ...
			}

			constructorSpy.restore();

			expect(constructorSpy.threw()).to.be.true;
		})

		it('should throw an error if options object is missing', () => {
			let constructorSpy = sinon.spy(Shape.prototype, '_init');

			try {
				new Shape('name', null);
			}
			catch(e) {
				// ...
			}

			constructorSpy.restore();

			expect(constructorSpy.threw()).to.be.true;
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

			let shape = newRectShape();

			let addModifierSpy = sinon.spy(shape, 'addModifier');

			shape.addModifier(mod);

			expect(addModifierSpy.threw()).to.be.false;
		})

		it('should accept mods of style Mods.ColorFill', () => {
			let mod: Mods.ColorFill = {
				type: 'colorFill',
				color: 0x000000,
				alpha: 0,
			}

			let shape = newRectShape();

			let addModifierSpy = sinon.spy(shape, 'addModifier');

			shape.addModifier(mod);

			expect(addModifierSpy.threw()).to.be.false;
		})

		it('should accept mods of style Mods.PatternFill', () => {
			let mod: Mods.PatternFill = {
				type: 'patternFill',
				texture: new PIXI.Texture(new PIXI.BaseTexture()),
				alpha: 0,
			}

			let shape = newRectShape();

			let addModifierSpy = sinon.spy(shape, 'addModifier');

			shape.addModifier(mod);

			expect(addModifierSpy.threw()).to.be.false;
		})
	})

	describe('type', () => {
		it('should return a string', () => {
			let shapeType = 'rect';
			let shape = newRectShape();

			let result = shape.type;

			expect(result).to.be.equal(shapeType);
		})
	})

	describe('width', () => {
		describe('set', () => {
			it('should call reshape with passed value as width property of options', () => {
				let shape = newRectShape();
				let newWidth = 500;

				let reshapeSpy = sinon.spy(shape, 'reshape');

				shape.width = newWidth;

				let result = reshapeSpy.calledWith({width: newWidth});

				expect(result).to.be.true;
			})

			it('should mark width as modified prop', () => {
				let shape = newRectShape();
				
				shape.width = 500;

				let result = shape.propHasBeenModified('width');

				expect(result).to.be.true;
			})
		})
	})

	describe('height', () => {
		describe('set', () => {
			it('should call reshape with passed value as height property of options', () => {
				let shape = newRectShape();
				let newHeight = 500;

				let reshapeSpy = sinon.spy(shape, 'reshape');

				shape.height = newHeight;

				let result = reshapeSpy.calledWith({height: newHeight});

				expect(result).to.be.true;
			})

			it('should mark height as modified prop', () => {
				let shape = newRectShape();
				
				shape.height = 500;

				let result = shape.propHasBeenModified('height');

				expect(result).to.be.true;
			})
		})
	})

	describe('x', () => {
		describe('set', () => {
			it('should mark x as modified prop', () => {
				let shape = newRectShape();
				
				shape.x = 100;

				let result = shape.propHasBeenModified('x');

				expect(result).to.be.true;
			})
		})
	})

	describe('y', () => {
		describe('set', () => {
			it('should mark y as modified prop', () => {
				let shape = newRectShape();
				
				shape.y = 100;

				let result = shape.propHasBeenModified('y');

				expect(result).to.be.true;
			})
		})
	})

	describe('propHasBeenModified', () => {
		it('should return true if a given prop has been modified', () => {
			let shape = newRectShape();

			shape.x = 200;

			let result = shape.propHasBeenModified('x');

			expect(result).to.be.true;
		})

		it('should return false if a given prop has not been been modified', () => {
			let shape = newRectShape();

			let result = shape.propHasBeenModified('width');

			expect(result).to.be.false;
		})
	})

	describe('reshape', () => {
		it('should throw an error if a property key does not exist on Shape type', () => {
			let shape = newRectShape();

			let reshapeSpy = sinon.spy(shape, 'reshape');

			try {
				shape.reshape({radius: 25});

			}
			catch(e) {
				// ...
			}

			expect(reshapeSpy.threw()).to.be.true;
		})

		it('should modify the value of properties in shapeOptions', () => {
			let shape = newRectShape();
			let newWidth = shape.width + 1000;
			let newHeight = shape.height + 500;

			shape.reshape({width: newWidth, height: newHeight});

			let resultWidth = shape.shapeOptions.width;
			let resultHeight = shape.shapeOptions.height;

			expect(resultWidth).to.be.equal(newWidth);
			expect(resultHeight).to.be.equal(newHeight);
		})

		it('should call redraw by default', () => {
			let shape = newRectShape();

			let redrawSpy = sinon.spy(shape, 'redraw');

			shape.reshape({width: 500});

			expect(redrawSpy.called).to.be.true;
		})

		it('should call redraw if second parameter is true', () => {
			let shape = newRectShape();

			let redrawSpy = sinon.spy(shape, 'redraw');

			shape.reshape({width: 500}, true);

			expect(redrawSpy.called).to.be.true;
		})

		it('should not call redraw if second parameter is false', () => {
			let shape = newRectShape();

			let redrawSpy = sinon.spy(shape, 'redraw');

			shape.reshape({width: 500}, false);

			expect(redrawSpy.called).to.be.false;
		})
	})

	describe('redraw', () => {
		it('should call removeChildren', () => {
			let shape = newRectShape();

			let removeChildrenSpy = sinon.spy(shape, 'removeChildren');

			shape.redraw();

			expect(removeChildrenSpy.called).to.be.true;
		})

		it('should re-apply and re-add its mods as children after removing them', () => {
			let shape = newRectShape();
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
			let shape = newRectShape();

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