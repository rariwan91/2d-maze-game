import * as mocha from 'mocha'
import * as chai from 'chai'

import { BoxCollision } from '../src/core/collision'
import { Entity } from '../src/core/entities/entity'

describe('>>> Box Collision', () => {
    describe('>>> Box vs Box', () => {
        class FakeEntity extends Entity {}

        /*
            -----
            |   |
            |   |
            |   |
            -----
                    -----
                    |   |
                    |   |
                    |   |
                    -----
        */
        it('Should not collide if they aren\'t touching', () => {
            const box1 = new BoxCollision({ x: 25, y: 25 }, { height: 25, width: 25 }, new FakeEntity())
            const box2 = new BoxCollision({ x: 75, y: 75 }, { height: 25, width: 25 }, new FakeEntity())
            const result = box1.isColliding(box2)
            chai.expect(result).to.equal(false)
        })

        /*
            -----  ------
            | 2 |  |  3 |
            | --|--|--  |
            | | |  | |  |
            -----  ------
              |  1   |
            -----  ------
            | | |  | |  |
            | --|--|--  |
            | 4 |  |  5 |
            -----  -----
        */
        it('Should collide if a corner is located inside one of the boxes', () => {
            const box1 = new BoxCollision({ x: 20, y: 20 }, { height: 20, width: 20 }, new FakeEntity())
            const box2 = new BoxCollision({ x: 5, y: 5 }, { height: 20, width: 20 }, new FakeEntity())
            const box3 = new BoxCollision({ x: 35, y: 5 }, { height: 20, width: 20 }, new FakeEntity())
            const box4 = new BoxCollision({ x: 5, y: 35 }, { height: 20, width: 20 }, new FakeEntity())
            const box5 = new BoxCollision({ x: 35, y: 35 }, { height: 20, width: 20 }, new FakeEntity())

            const oneCollidesWithTwo = box1.isColliding(box2)
            const oneCollidesWithThree = box1.isColliding(box3)
            const oneCollidesWithFour = box1.isColliding(box4)
            const oneCollidesWithFive = box1.isColliding(box5)
            chai.expect(oneCollidesWithTwo).to.equal(true)
            chai.expect(oneCollidesWithThree).to.equal(true)
            chai.expect(oneCollidesWithFour).to.equal(true)
            chai.expect(oneCollidesWithFive).to.equal(true)

            const twoCollidesWithThree = box2.isColliding(box3)
            const twoCollidesWithFour = box2.isColliding(box4)
            const twoCollidesWithFive = box2.isColliding(box5)
            chai.expect(twoCollidesWithThree).to.equal(false)
            chai.expect(twoCollidesWithFour).to.equal(false)
            chai.expect(twoCollidesWithFive).to.equal(false)

            const threeCollidesWithFour = box3.isColliding(box4)
            const threeCollidesWithFive = box3.isColliding(box5)
            chai.expect(threeCollidesWithFour).to.equal(false)
            chai.expect(threeCollidesWithFive).to.equal(false)

            const fourCollidesWithFive = box4.isColliding(box5)
            chai.expect(fourCollidesWithFive).to.equal(false)
        })
        /*
                -----
                |   |
              --|---|-------
             |  |   |       |
              --|---|-------
                |   |
                -----
        */
        it('Should collide if one completely goes through the other', () => {
            const box1 = new BoxCollision({ x: 20, y: 20 }, { height: 50, width: 20 }, new FakeEntity())
            const box2 = new BoxCollision({ x: 10, y: 30 }, { height: 30, width: 100 }, new FakeEntity())
            const result = box1.isColliding(box2)
            chai.expect(result).to.equal(true)
        })
        /*
             -----------------------------------
            |                                   |
            |          2                        |
            |                                   |
             -----------------------------------
                     ---
                    |   |
                    | 1 |
                    |   |
                     ---
        */
        it('Should not collide if they aren\'t touching but one is centered in the other but still not touching', () => {
            const box1 = new BoxCollision({ x: 484, y: 680 }, { height: 56, width: 56 }, new FakeEntity())
            const box2 = new BoxCollision({ x: 17, y: 17 }, { height: 6, width: 990 }, new FakeEntity())
            const result = box1.isColliding(box2)
            chai.expect(result).to.equal(false)
        })
    })
})
