import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { Player } from '../types';

interface SubstitutionControlProps {
    teamId: 'home' | 'away';
}

export const SubstitutionControl: React.FC<SubstitutionControlProps> = ({ teamId }) => {
    const { matchState, performSub } = useMatch() as any;
    const team = matchState[teamId];

    // Default isOnField logic if not set specificially yet
    // We treat isStarter as initial field state, but we should rely on isOnField if present
    const getIsOnField = (p: Player) => p.isOnField !== undefined ? p.isOnField : p.isStarter;

    const onFieldPlayers = team.lineup.filter((p: Player) => getIsOnField(p));
    const benchPlayers = team.lineup.filter((p: Player) => !getIsOnField(p));

    const [selectedOut, setSelectedOut] = useState<string | null>(null);
    const [selectedIn, setSelectedIn] = useState<string | null>(null);
    const [confirmMode, setConfirmMode] = useState(false);

    const handleSub = () => {
        if (!selectedOut || !selectedIn) return;

        if (!confirmMode) {
            setConfirmMode(true);
            return;
        }

        performSub(teamId, selectedIn, selectedOut);
        setSelectedOut(null);
        setSelectedIn(null);
        setConfirmMode(false);
    };

    // Auto-cancel confirmation if selection changes
    React.useEffect(() => {
        if (confirmMode) setConfirmMode(false);
    }, [selectedOut, selectedIn]);

    return (
        <div className="panel" style={{ borderTop: `4px solid ${matchState[teamId].info.color}` }}>
            <h3 className="section-title" style={{ borderBottomColor: matchState[teamId].info.color }}>
                {matchState[teamId].info.name}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 10, alignItems: 'start' }}>
                {/* On Field */}
                <div>
                    <h4 style={{ borderBottom: '1px solid #555', paddingBottom: 5, marginTop: 0, color: '#aaa', fontSize: '0.9em' }}>SALIENTE (Titular)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 300, overflowY: 'auto' }}>
                        {onFieldPlayers.length === 0 && <div style={{ fontStyle: 'italic', color: '#666' }}>Sin jugadores</div>}
                        {onFieldPlayers.map((p: any) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedOut(p.id)}
                                style={{
                                    padding: '8px 10px',
                                    background: selectedOut === p.id ? '#f44336' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    border: selectedOut === p.id ? '1px solid #ff7961' : '1px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <b>#{p.number}</b> {p.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirm Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
                    {selectedOut && selectedIn ? (
                        confirmMode ? (
                            <button
                                onClick={handleSub}
                                className="btn btn-success"
                                style={{
                                    borderRadius: '20px', padding: '10px 15px', width: '100%',
                                    animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                ¿Confirmar?
                            </button>
                        ) : (
                            <button
                                onClick={() => setConfirmMode(true)}
                                className="btn btn-primary"
                                style={{
                                    borderRadius: '50%', width: 50, height: 50, padding: 0,
                                    fontSize: '1.5em', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                ⇄
                            </button>
                        )
                    ) : (
                        <div style={{ color: '#555', fontSize: '2em' }}>⇄</div>
                    )}
                </div>

                {/* Bench */}
                <div>
                    <h4 style={{ borderBottom: '1px solid #555', paddingBottom: 5, marginTop: 0, color: '#aaa', fontSize: '0.9em' }}>ENTRANTE (Suplente)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 300, overflowY: 'auto' }}>
                        {benchPlayers.length === 0 && <div style={{ fontStyle: 'italic', color: '#666' }}>Sin jugadores</div>}
                        {benchPlayers.map((p: any) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedIn(p.id)}
                                style={{
                                    padding: '8px 10px',
                                    background: selectedIn === p.id ? '#4caf50' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    border: selectedIn === p.id ? '1px solid #a5d6a7' : '1px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <b>#{p.number}</b> {p.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
