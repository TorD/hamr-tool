import ShapeStore from '../src/ShapeStore';
import Shape from '../src/Shape';

import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

PIXI.utils.skipHello();

describe('ShapeStore', () => {
	let shapeStore: ShapeStore = undefined;

	let newShape = (): Shape => {
		let shapeName = 'test-shape';
		let shapeSettings = {
			type: 'rect',
			width: 0,
			height: 0,
		}
		return new Shape(shapeName, shapeSettings);
	}

	beforeEach(() => {
		shapeStore = new ShapeStore();
	})

	describe('constructor', () => {
		it('should return a valid instance', () => {
			expect(shapeStore).to.be.an('object');
		})
	})

	describe('addShape', () => {
		describe('if Shape at path does not exist', () => {
			it('should store shape at path', () => {
				let shapePath = 'test.path';
				let shape = newShape();

				shapeStore.addShape(shapePath, shape);

				let result = shapeStore.getShapeFromPath(shapePath);

				expect(result).to.be.equal(shape);
			});

			it('should create a group object for the shape and path', () => {
				let shapePath = 'test.path',
					shape = newShape();

				shapeStore.addShape(shapePath, shape);

				let result = shapeStore.getGroupFromPath(shapePath);

				expect(result).to.be.instanceOf(PIXI.Container);
			});

			it('should add shape to shapes array', () => {
				let shape = newShape();

				shapeStore.addShape('test-path', shape);

				let result = shapeStore.shapes.indexOf(shape);

				expect(result).to.be.greaterThan(-1);
			})

			it('should return passed shape', () => {
				let shape = newShape();

				let result = shapeStore.addShape('test-path', shape);

				expect(result).to.be.equal(shape);
			})
		})

		describe('if Shape at path already exists', () => {
			it('should throw an error', () => {
				let shape1 = newShape();
				let shape2 = newShape();
				let shapePath = 'test-path';

				shapeStore.addShape(shapePath, shape1);

				let addShapeSpy = sinon.spy(shapeStore, 'addShape');

				try {
					shapeStore.addShape(shapePath, shape2);
				}
				catch(e) {
					// ...
				}
				
				expect(addShapeSpy.threw()).to.be.true;
			})
		})
	})

	describe('createGroup', () => {
		it('should create a PIXI.Container for each section of a path', () => {
			shapeStore.createGroup('first.second.third');

			let firstContainer = shapeStore.getGroupFromPath('first');
			let secondContainer = shapeStore.getGroupFromPath('first.second');
			let thirdContainer = shapeStore.getGroupFromPath('first.second.third');

			expect(firstContainer).to.be.instanceOf(PIXI.Container);
			expect(secondContainer).to.be.instanceOf(PIXI.Container);
			expect(thirdContainer).to.be.instanceOf(PIXI.Container);
		})

		it('should return the last PIXI.Container of a path sequence', () => {
			let result = shapeStore.createGroup('first.second');
			let firstContainer = shapeStore.getGroupFromPath('first');
			let secondContainer = shapeStore.getGroupFromPath('first.second');

			expect(result).to.be.equal(secondContainer);
		})
	})

	describe('getGroupFromPath', () => {
		it('should return a Shape if path exists', () => {
			let shape = newShape();
			let path = 'test.path';

			let result = shapeStore.addShape(path, shape);

			expect(result).to.be.equal(shape);
		})

		it('should throw an error if path does not exist', () => {
			let getShapeFromPathSpy = sinon.spy(shapeStore, 'getShapeFromPath');

			try {
				shapeStore.getShapeFromPath('test.path');
			}
			catch(e) {
				// ...
			}

			expect(getShapeFromPathSpy.threw()).to.be.true;
		})
	})

	describe('hasGroupAtPath', () => {
		it('should return true if group exists at path', () => {
			let path = 'test.path';

			shapeStore.createGroup(path);

			let result = shapeStore.hasGroupAtPath(path);

			expect(result).to.be.true;
		})

		it('should return false if group does not exist at path', () => {
			let result = shapeStore.hasGroupAtPath('test.path');

			expect(result).to.be.false;
		})
	})

	describe('hasShapeAtPath', () => {
		it('should return true if a Shape exists at path', () => {
			let shape = newShape();
			let path = 'test.test.path';

			shapeStore.addShape(path, shape);

			let result = shapeStore.hasShapeAtPath(path);

			expect(result).to.be.true;
		})

		it('should return false if Shape does not exist at path', () => {
			let result = shapeStore.hasShapeAtPath('test.path');

			expect(result).to.be.false;
		})
	})

	describe('shapes', () => {
		it('should return a FIFO array of all added Shapes', () => {
			let shape1 = newShape();
			let path1 = 'test.path.first';

			let shape2 = newShape();
			let path2 = 'test.path.second';

			shapeStore.addShape(path1, shape1);
			shapeStore.addShape(path2, shape2);

			let resultArray = shapeStore.shapes;

			expect(resultArray[0]).to.be.equal(shape1);
			expect(resultArray[1]).to.be.equal(shape2);
		})
	})
})