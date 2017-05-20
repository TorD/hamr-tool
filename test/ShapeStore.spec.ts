import ShapeStore from '../src/ShapeStore';
import Shape from '../src/Shape';

import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

PIXI.utils.skipHello();

describe('ShapeStore', () => {
	let shapeStore: ShapeStore = undefined;

	let newShape = (): Shape => {
		let shapeName = 'test-shape',
			shapeSettings = {
			type: 'rect',
			x: 0,
			y: 0,
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
		describe('if path does not exist', () => {
			it('should store shape at path', () => {
				let shapePath = 'test.path',
					shape = newShape();

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

		describe('if path already exists', () => {
			it('should throw an error', () => {
				let shape1 = newShape(),
					shape2 = newShape(),
					shapePath = 'test-path';

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

			let firstContainer = shapeStore.getGroupFromPath('first'),
				secondContainer = shapeStore.getGroupFromPath('first.second'),
				thirdContainer = shapeStore.getGroupFromPath('first.second.third');

			expect(firstContainer).to.be.instanceOf(PIXI.Container);
			expect(secondContainer).to.be.instanceOf(PIXI.Container);
			expect(thirdContainer).to.be.instanceOf(PIXI.Container);
		})

		it('should return the last PIXI.Container of a path sequence', () => {
			let result = shapeStore.createGroup('first.second'),
				firstContainer = shapeStore.getGroupFromPath('first'),
				secondContainer = shapeStore.getGroupFromPath('first.second');

			expect(result).to.be.equal(secondContainer);
		})
	})

	describe('getGroupFromPath', () => {
		
	})
})