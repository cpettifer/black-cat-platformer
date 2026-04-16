import { LEVEL_BONUS_MAX, LEVEL_BONUS_DECAY_RATE } from './const/gameConfig'

const SCORES_KEY = 'blackcat_scores'

export const getScores = () => {
    try {
        return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]')
    } catch {
        return []
    }
}

export const getHighScore = () => getScores()[0]?.score ?? 0

export const isTopTen = (score) => {
    if (score <= 0) return false
    const scores = getScores()
    return scores.length < 10 || score > scores[scores.length - 1].score
}

export const addScore = (initials, score) => {
    const scores = getScores()
    scores.push({ initials: initials.toUpperCase().slice(0, 3).padEnd(3, ' '), score })
    scores.sort((a, b) => b.score - a.score)
    if (scores.length > 10) scores.splice(10)
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
}

export const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Returns a time bonus on an exponential decay curve.
// Full bonus (LEVEL_BONUS_MAX) is awarded within parTime seconds.
// After parTime, the bonus decays quickly and is rounded to the nearest 10.
export const calculateLevelBonus = (seconds, parTime) => {
    const overtime = Math.max(0, seconds - parTime)
    const raw = LEVEL_BONUS_MAX * Math.exp(-LEVEL_BONUS_DECAY_RATE * overtime)
    return Math.round(raw / 10) * 10
}
