export interface Team {
    id: 'home' | 'away';
    name: string;
    initials: string; // Short code for Scoreboard
    color: string;
    logoVal: string; // Base64 or URL
}

export interface Score {
    tries: number;
    conversions: number;
    penalties: number;
    drops: number;
    penaltyTries: number;
    manual: number; // For +/- 1 adjustments
    total: number;
}

export interface Player {
    id: string;
    name: string;
    number: string;
    isStarter: boolean; // true = Starting XV, false = Bench
    isOnField?: boolean; // Track if currently playing
}

export interface MatchTimer {
    value: number; // in seconds
    isRunning: boolean;
    mode: 'up' | 'down';
    half: 1 | 2;
    label: string; // "1st Half", "Time Off", etc.
}

export interface Card {
    id: string;
    teamId: 'home' | 'away';
    player: Player;
    type: 'yellow' | 'red';
    timestamp: number; // When it happened
    remainingSeconds: number; // For countdown
}

export interface Substitution {
    id: string;
    teamId: 'home' | 'away';
    playerIn: Player;
    playerOut: Player;
    matchTime: string; // e.g., "1st - 25:00"
}

export interface MatchAction {
    id: string;
    type: 'try' | 'conversion' | 'penalty' | 'drop' | 'card' | 'sub' | 'manual' | 'penaltyTry';
    teamId: 'home' | 'away';
    player?: Player;
    description: string;
    timestamp: string;
    linkedId?: string; // Links action to specific entity (like a Card ID)
    cardType?: 'yellow' | 'red';
    subDetails?: {
        playerIn: { name: string; number: string; id: string };
        playerOut: { name: string; number: string; id: string };
    };
    scoreSnapshot?: { home: number; away: number };
}

export interface MatchState {
    home: {
        info: Team;
        score: Score;
        lineup: Player[];
    };
    away: {
        info: Team;
        score: Score;
        lineup: Player[];
    };
    timer: MatchTimer;
    cards: Card[];
    subs: Substitution[];
    actions: MatchAction[];
    savedLabels: { id: string; text: string; subtext: string; color: string }[];
    overlay: {
        activeView: 'scoreboard' | 'lineup_home' | 'lineup_away' | 'custom_label' | 'match_summary' | 'stats_comparison' | 'stats_lower';
        customLabelText?: string;
        customLabelSubtext?: string;
        customLabelColor?: string;
    };
    summaryConfig: {
        maxItems: number; // Def 8
        filterTypes: string[]; // ['try', 'card', 'sub', 'penalty', 'conversion', 'drop']
    };
    obsConfig: {
        address: string;
        password: string;
        isConnected: boolean;
    };
    leagueLogo: string;
    scoreboardConfig: {
        scale: number;
        opacity: number;
    };
    leagueLogoConfig: {
        scale: number;
        opacity: number;
    };
}

export const INITIAL_STATE: MatchState = {
    home: {
        info: { id: 'home', name: 'Home Team', initials: 'HOM', color: '#21752f', logoVal: '' },
        score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 },
        lineup: []
    },
    away: {
        info: { id: 'away', name: 'Away Team', initials: 'AWY', color: '#a8a8a8', logoVal: '' },
        score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 },
        lineup: []
    },
    timer: { value: 0, isRunning: false, mode: 'up', half: 1, label: '1st Half' },
    cards: [],
    subs: [],
    actions: [],
    savedLabels: [],
    overlay: { activeView: 'scoreboard' },
    summaryConfig: { maxItems: 20, filterTypes: ['try', 'conversion', 'penalty', 'drop', 'card', 'sub', 'manual', 'penaltyTry'] },
    obsConfig: { address: 'ws://localhost:4455', password: '', isConnected: false },
    leagueLogo: '',
    scoreboardConfig: { scale: 1, opacity: 1 },
    leagueLogoConfig: { scale: 1, opacity: 1 }
};
