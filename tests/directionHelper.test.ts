import * as mocha from 'mocha'
import * as chai from 'chai'

import { getDirection } from '../src/helpers'
import { Direction } from '../src/core'

describe('>>> Direction Calculation', () => {
    describe('>>> One Direction', () => {
        it('Should return Up if only Up is pressed', () => {
            const upPressed = true
            const rightPressed = false
            const downPressed = false
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Up)
        })
    
        it('Should return Right if only Right is pressed', () => {
            const upPressed = false
            const rightPressed = true
            const downPressed = false
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Right)
        })
    
        it('Should return Down if only Down is pressed', () => {
            const upPressed = false
            const rightPressed = false
            const downPressed = true
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Down)
        })
    
        it('Should return Left if only Left is pressed', () => {
            const upPressed = false
            const rightPressed = false
            const downPressed = false
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Left)
        })
    })

    describe('>>> Two Directions', () => {
        it('Should return UpRight if Up and Right are pressed', () => {
            const upPressed = true
            const rightPressed = true
            const downPressed = false
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.UpRight)
        })

        it('Should return UpLeft if Up and Left are pressed', () => {
            const upPressed = true
            const rightPressed = false
            const downPressed = false
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.UpLeft)
        })

        it('Should return DownRight if Down and Right are pressed', () => {
            const upPressed = false
            const rightPressed = true
            const downPressed = true
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.DownRight)
        })

        it('Should return DownLeft if Down and Left are pressed', () => {
            const upPressed = false
            const rightPressed = false
            const downPressed = true
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.DownLeft)
        })

        it('Should return None if Up and Down are pressed', () => {
            const upPressed = true
            const rightPressed = false
            const downPressed = true
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.None)
        })

        it('Should return None if Left and Right are pressed', () => {
            const upPressed = false
            const rightPressed = true
            const downPressed = false
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.None)
        })
    })

    describe('>>> Three Directions', () => {
        it('Should return Right if Up, Right, and Down are pressed', () => {
            const upPressed = true
            const rightPressed = true
            const downPressed = true
            const leftPressed = false
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Right)
        })

        it('Should return Down if Right, Down, and Left are pressed', () => {
            const upPressed = false
            const rightPressed = true
            const downPressed = true
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Down)
        })

        it('Should return Left if Down, Left, and Up are pressed', () => {
            const upPressed = true
            const rightPressed = false
            const downPressed = true
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Left)
        })

        it('Should return Up if Left, Up, and Right are pressed', () => {
            const upPressed = true
            const rightPressed = true
            const downPressed = false
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.Up)
        })
    })

    describe('>>> Four Directions', () => {
        it('Should return None if Up, Right, Down, and Left are pressed', () => {
            const upPressed = true
            const rightPressed = true
            const downPressed = true
            const leftPressed = true
    
            const result = getDirection(upPressed, rightPressed, downPressed, leftPressed)
    
            chai.expect(result).to.equal(Direction.None)
        })
    })
})
