import ShapeStore from '../src/ShapeStore';
import { Shape, Shapes } from '../src/Shape';

import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

PIXI.utils.skipHello();

describe('ShapeStore', () => {
	let createShape = (): Shape => {
		let shapeName = 'test-shape';
		let shapeSettings: Shapes.Rect = {
			type: 'rect',
			width: 0,
			height: 0,
		}
		return new Shape(shapeName, shapeSettings);
	}

	describe('constructor', () => {
		it('should return a valid instance', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			expect(shapeStore).to.be.an('object');
		})
	})

	describe('addShape', () => {
		describe('if Shape at path does not exist', () => {
			it('should store shape at path', () => {
				let shapeStore: ShapeStore = new ShapeStore();

				let shapePath = 'test.path';
				let shape = createShape();

				shapeStore.addShape(shapePath, shape);

				let result = shapeStore.getShapeFromPath(shapePath);

				expect(result).to.be.equal(shape);
			});

			it('should create a group object for the shape and path', () => {
				let shapeStore: ShapeStore = new ShapeStore();

				let shapePath = 'test.path',
					shape = createShape();

				shapeStore.addShape(shapePath, shape);

				let result = shapeStore.getGroupFromPath(shapePath);

				expect(result).to.be.instanceOf(PIXI.Container);
			});

			it('should add shape to shapes array', () => {
				let shapeStore: ShapeStore = new ShapeStore();
				let shape = createShape();

				shapeStore.addShape('test-path', shape);

				let result = shapeStore.shapes.indexOf(shape);

				expect(result).to.not.be.equal(-1);
			})

			it('should return passed shape', () => {
				let shapeStore: ShapeStore = new ShapeStore();
				let shape = createShape();

				let result = shapeStore.addShape('test-path', shape);

				expect(result).to.be.equal(shape);
			})
		})

		describe('when Shape at path already exists', () => {
			it('should throw an error', () => {
				let shapeStore: ShapeStore = new ShapeStore();
				let shape1 = createShape();
				let shape2 = createShape();
				let shapePath = 'test-path';

				shapeStore.addShape(shapePath, shape1);

				let addShapeSpy = sinon.spy(shapeStore, 'addShape');

				let addAShapeAtExistingPath = () => {
					shapeStore.addShape(shapePath, shape2);
				}
				
				expect(addAShapeAtExistingPath).to.throw();
			})
		})
	})

	describe('createGroup', () => {
		it('should create a PIXI.Container for each section of a path', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			shapeStore.createGroup('first.second.third');

			let firstContainer = shapeStore.getGroupFromPath('first');
			let secondContainer = shapeStore.getGroupFromPath('first.second');
			let thirdContainer = shapeStore.getGroupFromPath('first.second.third');

			expect(firstContainer).to.be.instanceOf(PIXI.Container);
			expect(secondContainer).to.be.instanceOf(PIXI.Container);
			expect(thirdContainer).to.be.instanceOf(PIXI.Container);
		})

		it('should return the last PIXI.Container of a path sequence', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let result = shapeStore.createGroup('first.second');
			let firstContainer = shapeStore.getGroupFromPath('first');
			let secondContainer = shapeStore.getGroupFromPath('first.second');

			expect(result).to.be.equal(secondContainer);
		})
	})

	describe('getShapeFromPath', () => {
		it('should return a Shape if path exists', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let shape = createShape();
			let path = 'test.path';

			shapeStore.addShape(path, shape);

			let result = shapeStore.getShapeFromPath(path);

			expect(result).to.be.equal(shape);
		})

		it('should throw an error if path does not exist', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let getShapeFromNonExistingPath = () => {
				shapeStore.getShapeFromPath('test.path');
			}

			expect(getShapeFromNonExistingPath).to.throw();
		})
	})

	describe('hasGroupAtPath', () => {
		it('should return true if group exists at path', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let path = 'test.path';

			shapeStore.createGroup(path);

			let result = shapeStore.hasGroupAtPath(path);

			expect(result).to.be.true;
		})

		it('should return false if group does not exist at path', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let result = shapeStore.hasGroupAtPath('test.path');

			expect(result).to.be.false;
		})
	})

	describe('hasShapeAtPath', () => {
		it('should return true if a Shape exists at path', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let shape = createShape();
			let path = 'test.test.path';

			shapeStore.addShape(path, shape);

			let result = shapeStore.hasShapeAtPath(path);

			expect(result).to.be.true;
		})

		it('should return false if Shape does not exist at path', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let result = shapeStore.hasShapeAtPath('test.path');

			expect(result).to.be.false;
		})
	})

	describe('shapes', () => {
		it('should return a FIFO array of all added Shapes', () => {
			let shapeStore: ShapeStore = new ShapeStore();

			let shape1 = createShape();
			let path1 = 'test.path.first';

			let shape2 = createShape();
			let path2 = 'test.path.second';

			shapeStore.addShape(path1, shape1);
			shapeStore.addShape(path2, shape2);

			let resultArray = shapeStore.shapes;
			expect(resultArray).to.deep.equal([shape1, shape2]);
		})
	})
})