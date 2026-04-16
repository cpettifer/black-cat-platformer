import React, { useState, useRef, useCallback } from 'react'
import styled from 'styled-components'

import { mobileInput } from '../game/mobileInput'

const mobileLandscape = '@media (orientation: landscape) and (max-height: 600px)'

const MAX_RADIUS = 55
// Minimum stick deflection (as fraction of MAX_RADIUS) before input registers
const DEAD_ZONE = 0.18
// How far up the stick must point (normalised y) before jump triggers
const JUMP_THRESHOLD = -0.5
// How far sideways the stick must point before left/right triggers
const MOVE_THRESHOLD = 0.35

const Panel = styled.div`
    display: none;

    ${mobileLandscape} {
        display: block;
        flex: 1;
        min-width: 0;
        position: relative;
        overflow: hidden;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
`

// Faint hint shown when the joystick is idle so the player knows where to touch
const HintRing = styled.div`
    position: absolute;
    width: ${MAX_RADIUS * 2}px;
    height: ${MAX_RADIUS * 2}px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 51, 0.12);
    left: 50%;
    bottom: 48px;
    transform: translateX(-50%);
    pointer-events: none;
`

const baseStyle = (x, y, r) => ({
    position: 'absolute',
    left: x - r,
    top: y - r,
    width: r * 2,
    height: r * 2,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.55)',
    background: 'rgba(0,0,51,0.45)',
    pointerEvents: 'none',
    boxSizing: 'border-box'
})

const thumbStyle = (x, y) => ({
    position: 'absolute',
    left: x - 24,
    top: y - 24,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.85)',
    border: '2px solid rgba(255,255,255,0.95)',
    pointerEvents: 'none',
    boxSizing: 'border-box'
})

export const VirtualJoystick = () => {
    // visual: null when idle, { baseX, baseY, thumbX, thumbY } when active
    const [visual, setVisual] = useState(null)

    // base position stored in a ref so move handler never has stale values
    const baseRef = useRef(null)
    const activePointerRef = useRef(null)
    const panelRef = useRef(null)

    const resetInput = useCallback(() => {
        mobileInput.left = false
        mobileInput.right = false
        mobileInput.up = false
    }, [])

    const updateInput = useCallback(
        (dx, dy) => {
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist / MAX_RADIUS < DEAD_ZONE) {
                resetInput()
                return
            }
            const nx = dx / dist
            const ny = dy / dist
            mobileInput.left = nx < -MOVE_THRESHOLD
            mobileInput.right = nx > MOVE_THRESHOLD
            mobileInput.up = ny < JUMP_THRESHOLD
        },
        [resetInput]
    )

    const handlePointerDown = useCallback((e) => {
        // Only track one touch at a time
        if (activePointerRef.current !== null) return
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        activePointerRef.current = e.pointerId

        const rect = panelRef.current.getBoundingClientRect()
        const bx = e.clientX - rect.left
        const by = e.clientY - rect.top
        baseRef.current = { x: bx, y: by }
        setVisual({ baseX: bx, baseY: by, thumbX: bx, thumbY: by })
    }, [])

    const handlePointerMove = useCallback(
        (e) => {
            if (e.pointerId !== activePointerRef.current) return
            e.preventDefault()

            const rect = panelRef.current.getBoundingClientRect()
            const base = baseRef.current
            const dx = e.clientX - rect.left - base.x
            const dy = e.clientY - rect.top - base.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const clamp = Math.min(dist, MAX_RADIUS)
            const angle = Math.atan2(dy, dx)

            setVisual({
                baseX: base.x,
                baseY: base.y,
                thumbX: base.x + Math.cos(angle) * clamp,
                thumbY: base.y + Math.sin(angle) * clamp
            })

            updateInput(dx, dy)
        },
        [updateInput]
    )

    const handlePointerUp = useCallback(
        (e) => {
            if (e.pointerId !== activePointerRef.current) return
            activePointerRef.current = null
            baseRef.current = null
            setVisual(null)
            resetInput()
        },
        [resetInput]
    )

    return (
        <Panel
            ref={panelRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {!visual && <HintRing />}
            {visual && (
                <>
                    <div style={baseStyle(visual.baseX, visual.baseY, MAX_RADIUS)} />
                    <div style={thumbStyle(visual.thumbX, visual.thumbY)} />
                </>
            )}
        </Panel>
    )
}
