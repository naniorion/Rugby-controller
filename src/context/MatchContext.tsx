import { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { MatchState, Substitution, MatchAction } from '../types';

/**
 * MatchContext is the core system of the application.
 * It manages the global state (scores, timers, lineups, overlay configuration)
 * and handles synchronization between the Desktop Dashboard and the Browser Overlay via Socket.IO.
 */
interface MatchContextType {
    matchState: MatchState;
    isConnected: boolean;
    updateScore: (team: 'home' | 'away', type: 'try' | 'conversion' | 'penalty' | 'drop' | 'manual' | 'penaltyTry', delta: number, playerId?: string) => void;
    updateTimer: (action: 'start' | 'stop' | 'reset' | 'set', val?: number) => void;
    updateTeamInfo: (team: 'home' | 'away', info: any) => void;
    addCard: (card: any) => void;
    removeCard: (cardId: string) => void;
    performSub: (teamId: 'home' | 'away', playerInId: string, playerOutId: string) => void;
    setOverlayView: (view: 'scoreboard' | 'lineup_home' | 'lineup_away' | 'custom_label' | 'match_summary' | 'stats_comparison' | 'stats_lower', text?: string, subtext?: string, color?: string) => void;
    saveLabel?: (label: any) => void;
    deleteLabel?: (labelId: string) => void;
    deleteAction?: (actionId: string) => void;
    updateSummaryConfig?: (config: { maxItems?: number; filterTypes?: string[] }) => void;
    connectOBS?: (config: { address: string; password: string }) => void;
    setHalf?: (half: 1 | 2) => void;
    resetMatch?: () => void;
    setLeagueLogo?: (logo: string) => void;
    setScoreboardConfig?: (config: { scale: number; opacity: number }) => void;
    setLeagueLogoConfig?: (config: { scale: number; opacity: number }) => void;

    // Add other methods as needed
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider = ({ children }: { children: ReactNode }) => {
    const { matchState, isConnected, updateState, sendCommand } = useSocket();

    const updateScore = (team: 'home' | 'away', type: 'try' | 'conversion' | 'penalty' | 'drop' | 'manual' | 'penaltyTry', delta: number, playerId?: string) => {
        // Calculate new values locally to send delta or absolute? 
        // We will read current state and increment, then send update.
        // In a real app we might send an "action" to the server to handle logic. 
        // But here we'll compute and send full team object update.

        const teamState = matchState[team];
        const newScore = { ...teamState.score };

        if (type === 'try') newScore.tries = Math.max(0, newScore.tries + delta);
        if (type === 'conversion') newScore.conversions = Math.max(0, newScore.conversions + delta);
        if (type === 'penalty') newScore.penalties = Math.max(0, newScore.penalties + delta);
        if (type === 'drop') newScore.drops = Math.max(0, newScore.drops + delta);
        if (type === 'penaltyTry') {
            newScore.penaltyTries = Math.max(0, (newScore.penaltyTries || 0) + delta);
            newScore.tries = Math.max(0, newScore.tries + delta); // Also counts as a try stat-wise
        }
        if (type === 'manual') newScore.manual = (newScore.manual || 0) + delta; // Can be negative

        // Recalculate total
        // Note: penaltyTry is worth 7 points (5 try + 2 auto-conversion). 
        // Since we increment 'tries' (+5), we need to ensure the math is correct.
        // Option A: Total = Tries*5 + Conv*2 + Pen*3 + Drop*3 + Manual
        // In this case, if penaltyTry adds +1 Try, we get 5 points. We need 2 more.
        // We could also add +1 Conversion, but that messes up conversion stats.
        // Better: Total = (Tries * 5) + (Conversions * 2) + (Penalties * 3) + (Drops * 3) + (PenaltyTries * 2) + Manual ?? No that's confusing.
        // Let's explicitly calculate:
        // Total = (Tries * 5) + (Conversions * 2) + (Penalties * 3) + (Drops * 3) + (PenaltyTries * 2) + Manual
        // Wait, if we added to 'tries', then we have 5 points. We need 7 total. So we add 2 points for the auto-conversion element.
        // So: Total = (Tries * 5) + (Conversions * 2) + (Penalties * 3) + (Drops * 3) + ((newScore.penaltyTries || 0) * 2) + (newScore.manual || 0);

        newScore.total = (newScore.tries * 5) + (newScore.conversions * 2) + (newScore.penalties * 3) + (newScore.drops * 3) + ((newScore.penaltyTries || 0) * 2) + (newScore.manual || 0);

        // Find Player info if playerId provided
        const player = playerId ? teamState.lineup.find((p: any) => p.id === playerId) : undefined;
        // Construct description
        let desc = `${team === 'home' ? matchState.home.info.name : matchState.away.info.name} scored a ${type}`;
        if (type === 'penaltyTry') desc = `${team === 'home' ? matchState.home.info.name : matchState.away.info.name} awarded Penalty Try`;

        if (player) {
            desc = `${player.name} (#${player.number}) scored a ${type}`;
        }

        // ... rest of the function ...

        const newAction = {
            id: Date.now().toString(),
            type: type,
            teamId: team,
            player: player, // Add player object to action
            description: desc,
            timestamp: matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00',
            scoreSnapshot: {
                home: team === 'home' ? newScore.total : matchState.home.score.total,
                away: team === 'away' ? newScore.total : matchState.away.score.total
            }
        };

        const currentActions = matchState.actions || [];

        updateState({
            [team]: { ...teamState, score: newScore },
            actions: [newAction, ...currentActions]
        });
    };

    const performSub = (teamId: 'home' | 'away', playerInId: string, playerOutId: string) => {
        const team = matchState[teamId];
        const newLinup = team.lineup.map((p: any) => {
            if (p.id === playerInId) return { ...p, isOnField: true };
            if (p.id === playerOutId) return { ...p, isOnField: false };
            return p;
        });

        const playerIn = team.lineup.find((p: any) => p.id === playerInId);
        const playerOut = team.lineup.find((p: any) => p.id === playerOutId);

        if (!playerIn || !playerOut) {
            console.error("Player substitution failed: player not found");
            return;
        }

        const newSub: Substitution = {
            id: Date.now().toString(),
            teamId,
            playerIn,
            playerOut,
            matchTime: matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00'
        };

        const newAction: MatchAction | any = {
            id: Date.now().toString(),
            type: 'sub',
            teamId,
            description: `Substitution: ${playerIn.name} In, ${playerOut.name} Out`,
            timestamp: newSub.matchTime,
            // Attach details for Overlay
            subDetails: {
                playerIn: { name: playerIn.name, number: playerIn.number, id: playerIn.id },
                playerOut: { name: playerOut.name, number: playerOut.number, id: playerOut.id }
            },
            scoreSnapshot: {
                home: matchState.home.score.total,
                away: matchState.away.score.total
            }
        };

        updateState({
            [teamId]: { ...team, lineup: newLinup },
            subs: [newSub, ...(matchState.subs || [])],
            actions: [newAction, ...(matchState.actions || [])]
        });
    };

    const updateTimer = (action: 'start' | 'stop' | 'reset' | 'set', val?: number) => {
        if (action === 'start') sendCommand('timer-start');
        if (action === 'stop') sendCommand('timer-stop');
        if (action === 'reset') sendCommand('timer-reset', val || 0);
        if (action === 'set') sendCommand('timer-set', val || 0);
    };

    const updateTeamInfo = (team: 'home' | 'away', updates: any) => {
        const teamState = matchState[team];
        const newTeamState = { ...teamState };

        // Handle lineup specifically if present
        if ('lineup' in updates) {
            newTeamState.lineup = updates.lineup;
        }

        // Handle generic info updates (name, color, logoVal)
        // We exclude 'lineup' from being added to 'info'
        const { lineup, ...infoUpdates } = updates;
        if (Object.keys(infoUpdates).length > 0) {
            newTeamState.info = { ...teamState.info, ...infoUpdates };
        }

        updateState({
            [team]: newTeamState
        });
    };

    const addCard = (card: any) => {
        // Append to cards
        const newAction = {
            id: Date.now().toString(),
            type: 'card' as const,
            cardType: card.type,
            teamId: card.teamId,
            description: `Card (${card.type}) for #${card.player?.number || '?'}`,
            timestamp: matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00',
            linkedId: card.id, // Link this action to the card
            player: card.player, // Attach player for Overlay
            scoreSnapshot: { // For cards, score doesn't change, usage current state
                home: matchState.home.score.total,
                away: matchState.away.score.total
            }
        };

        const newCards = [...matchState.cards, card];
        const currentActions = matchState.actions || [];

        updateState({
            cards: newCards,
            actions: [newAction, ...currentActions]
        });
    }

    const removeCard = (cardId: string) => {
        const newCards = matchState.cards.filter((c: any) => c.id !== cardId);
        // Also remove associated action from log
        const newActions = (matchState.actions || []).filter((a: any) => a.linkedId !== cardId);

        updateState({
            cards: newCards,
            actions: newActions
        });
    }

    const setOverlayView = (view: 'scoreboard' | 'lineup_home' | 'lineup_away' | 'custom_label' | 'match_summary' | 'stats_comparison' | 'stats_lower', text?: string, subtext?: string, color?: string) => {
        updateState({ overlay: { activeView: view, customLabelText: text, customLabelSubtext: subtext, customLabelColor: color } });
    }

    const saveLabel = (label: any) => {
        const current = matchState.savedLabels || [];
        const newLabels = [...current, label];
        updateState({ savedLabels: newLabels });
    };

    const deleteLabel = (labelId: string) => {
        const current = matchState.savedLabels || [];
        const newLabels = current.filter((l: any) => l.id !== labelId);
        updateState({ savedLabels: newLabels });
    };

    const deleteAction = (actionId: string) => {
        const currentActions = matchState.actions || [];
        const actionToDelete = currentActions.find((a: any) => a.id === actionId);

        if (!actionToDelete) return;

        // UNDO LOGIC
        const updates: any = {};

        // 1. Revert Score
        if (['try', 'conversion', 'penalty', 'drop', 'penaltyTry'].includes(actionToDelete.type)) {
            const teamId = actionToDelete.teamId;
            const teamState = matchState[teamId];
            const newScore = { ...teamState.score };

            // Determine values to subtract
            if (actionToDelete.type === 'try') {
                newScore.tries = Math.max(0, newScore.tries - 1);
            } else if (actionToDelete.type === 'conversion') {
                newScore.conversions = Math.max(0, newScore.conversions - 1);
            } else if (actionToDelete.type === 'penalty') {
                newScore.penalties = Math.max(0, newScore.penalties - 1);
            } else if (actionToDelete.type === 'drop') {
                newScore.drops = Math.max(0, newScore.drops - 1);
            } else if (actionToDelete.type === 'penaltyTry') {
                newScore.penaltyTries = Math.max(0, newScore.penaltyTries - 1);
                newScore.tries = Math.max(0, newScore.tries - 1);
            }

            // Recalculate total
            newScore.total = (newScore.tries * 5) + (newScore.conversions * 2) + (newScore.penalties * 3) + (newScore.drops * 3) + ((newScore.penaltyTries || 0) * 2) + (newScore.manual || 0);

            updates[teamId] = { ...teamState, score: newScore };
        }

        // 2. Revert Card
        else if (actionToDelete.type === 'card' && actionToDelete.linkedId) {
            const newCards = matchState.cards.filter((c: any) => c.id !== actionToDelete.linkedId);
            updates.cards = newCards;
        }

        // 3. Revert Sub
        else if (actionToDelete.type === 'sub' && actionToDelete.subDetails) {
            const { teamId, subDetails } = actionToDelete;
            if (subDetails.playerIn?.id && subDetails.playerOut?.id) {
                // Swap them back: In -> Off field, Out -> On field
                const team = updates[teamId] || matchState[teamId]; // Use pending update if exists
                const newLineup = team.lineup.map((p: any) => {
                    if (p.id === subDetails.playerIn.id) return { ...p, isOnField: false };
                    if (p.id === subDetails.playerOut.id) return { ...p, isOnField: true };
                    return p;
                });
                updates[teamId] = { ...team, lineup: newLineup };
            }
        }

        // Apply updates
        const newActions = currentActions.filter((a: any) => a.id !== actionId);
        updateState({ ...updates, actions: newActions });
    };

    const updateSummaryConfig = (config: { maxItems?: number; filterTypes?: string[] }) => {
        const currentConfig = matchState.summaryConfig || { maxItems: 8, filterTypes: [] };
        updateState({
            summaryConfig: {
                ...currentConfig,
                ...config
            }
        });
    };

    const connectOBS = (config: { address: string; password: string }) => {
        // Send connect request to backend
        sendCommand('obs-connect', config);
    };

    const setHalf = (half: 1 | 2) => {
        const timeVal = half === 2 ? 2400 : 0; // 40 minutes * 60 seconds

        // Update local state and backend state via updateState
        // Note: We also need to set the timer value on the backend so the tick starts from there.
        sendCommand('timer-reset', timeVal);

        updateState({
            timer: {
                ...matchState.timer,
                half: half,
                label: half === 1 ? '1st Half' : '2nd Half',
                value: timeVal // Optimistic update
            }
        });
    };

    const resetMatch = () => {
        // Stop backend timer
        sendCommand('timer-reset', 0);

        updateState({
            // Reset scores
            home: { ...matchState.home, score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 } },
            away: { ...matchState.away, score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 } },
            // Reset timer & half
            timer: { ...matchState.timer, value: 0, isRunning: false, half: 1, label: '1st Half' },
            // Clear lists
            cards: [],
            subs: [],
            actions: []
            // Preserves info, savedLabels, summaryConfig, obsConfig, overlay
        });
    };

    const setLeagueLogo = (logo: string) => {
        updateState({ leagueLogo: logo });
    };

    const setScoreboardConfig = (config: { scale: number; opacity: number }) => {
        updateState({ scoreboardConfig: config });
    };

    const setLeagueLogoConfig = (config: { scale: number; opacity: number }) => {
        updateState({ leagueLogoConfig: config });
    };

    return (
        <MatchContext.Provider value={{
            matchState,
            isConnected,
            updateScore,
            updateTimer,
            updateTeamInfo,
            addCard,
            removeCard,
            setOverlayView,
            saveLabel,
            deleteLabel,
            deleteAction,
            updateSummaryConfig,
            connectOBS,
            setHalf,
            resetMatch,
            performSub,
            setLeagueLogo,
            setScoreboardConfig,
            setLeagueLogoConfig
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (context === undefined) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
};
