import React from 'react'
import { createRoot } from 'react-dom/client'
import { config } from './game'
import Phaser from 'phaser'
import styled from 'styled-components'
import { GlobalStyle } from './components/GlobalStyle'
import { mobileInput } from './game/mobileInput'
import { VirtualJoystick } from './components/VirtualJoystick'

const mobileLandscape = '@media (orientation: landscape) and (max-height: 600px)'
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0

const toggleFullscreen = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        document.documentElement.requestFullscreen()
    }
}

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

    margin: 0 auto;
    max-width: 830px;
    padding-bottom: 15px;

    .text-align-center {
        text-align: center;
    }

    hr {
        margin: 15px 0;
    }

    ${mobileLandscape} {
        max-width: 100%;
        padding: 0;
        margin: 0;
        height: 100vh;
    }
`

const GameContainer = styled.div`
    margin-top: 15px;
    padding: 15px;

    border-radius: 5px;
    border: 1px solid grey;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.2);

    background-color: white;

    ${mobileLandscape} {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        margin: 0;
        padding: 0;
        border: none;
        box-shadow: none;
        background: transparent;
        width: 100vw;
        height: 100vh;

        hr {
            display: none;
        }

        #game {
            height: 100vh;
            aspect-ratio: 4 / 3;
            flex-shrink: 0;
        }
    }
`

const Header = styled.div`
    position: relative;

    .github-link {
        position: absolute;
        margin: auto;

        top: 0;
        bottom: 0;
        right: 0;

        a {
            color: black;
            font-size: 32px;

            &:hover {
                color: #505050;
            }
        }
    }

    ${mobileLandscape} {
        display: none;
    }
`

// Right panel: top quarter = fullscreen, bottom three quarters = jump
const RightPanel = styled.div`
    display: none;

    ${mobileLandscape} {
        display: flex;
        flex: 1;
        min-width: 0;
        flex-direction: column;
        align-items: stretch;
    }
`

// Full-area touch zone. $flex controls proportion of the panel it occupies.
const ControlZone = styled.div`
    flex: ${(props) => props.$flex || 1};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none;
`

// Visual indicator only — pointer-events disabled so the zone captures all touches
const ButtonGraphic = styled.div`
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 51, 0.85);
    border: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: inset 0 0 0 4px rgba(68, 68, 170, 0.7);
    color: #ffff00;
    font-family: monospace;
    font-size: 32px;
    pointer-events: none;
`

const FullscreenGraphic = styled.div`
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 51, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 0 0 3px rgba(68, 68, 170, 0.5);
    color: rgba(255, 255, 255, 0.8);
    font-family: monospace;
    font-size: 20px;
    pointer-events: none;
`

const Application = () => (
    <PageWrapper>
        <GlobalStyle />
        <GameContainer>
            <Header>
                <h1 className="text-align-center">Super BlackCat</h1>
                <p className="text-align-center">
                    A Hackday Project made with{' '}
                    <a href="https://phaser.io/" target="_blank">
                        Phaser
                    </a>
                </p>
                <div className="github-link">
                    <a href="https://github.com/Datedsandwich/black-cat-platformer" target="_blank">
                        <i className="fab fa-github" />
                    </a>
                </div>
            </Header>
            <hr />
            {isTouchDevice && <VirtualJoystick />}
            <div id="game" />
            {isTouchDevice && (
                <RightPanel>
                    <ControlZone $flex={1} onClick={toggleFullscreen}>
                        <FullscreenGraphic>⛶</FullscreenGraphic>
                    </ControlZone>
                    <ControlZone
                        $flex={3}
                        onPointerDown={(e) => {
                            e.preventDefault()
                            mobileInput.up = true
                        }}
                        onPointerUp={() => {
                            mobileInput.up = false
                        }}
                        onPointerLeave={() => {
                            mobileInput.up = false
                        }}
                    >
                        <ButtonGraphic>↑</ButtonGraphic>
                    </ControlZone>
                </RightPanel>
            )}
        </GameContainer>
    </PageWrapper>
)

const container = document.getElementById('container')
const root = createRoot(container)
root.render(<Application />)
// Delay Phaser game creation slightly to ensure React has rendered the DOM
setTimeout(() => {
    const game = new Phaser.Game(config)
}, 100)
