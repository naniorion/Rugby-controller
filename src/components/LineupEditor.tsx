import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { Player } from '../types';

interface LineupEditorProps {
    teamId: 'home' | 'away';
}

export const LineupEditor: React.FC<LineupEditorProps> = ({ teamId }) => {
    const { matchState, updateTeamInfo, setOverlayView } = useMatch();
    const team = matchState[teamId];
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [isStarter, setIsStarter] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const addPlayer = () => {
        if (!newName || !newNumber) return;

        // Validation: Check for duplicate number
        const exists = (team.lineup || []).some((p: Player) => p.number === newNumber);
        if (exists) {
            setErrorMsg(`Player #${newNumber} already exists!`);
            setTimeout(() => setErrorMsg(null), 3000);
            return;
        }

        const newPlayer: Player = {
            id: Date.now().toString(),
            name: newName,
            number: newNumber,
            isStarter
        };
        const newLineup = [...(team.lineup || []), newPlayer];
        updateTeamInfo(teamId, { lineup: newLineup });
        setNewName('');
        setNewNumber('');
        setErrorMsg(null);
    };

    const removePlayer = (id: string) => {
        const newLineup = team.lineup.filter((p: Player) => p.id !== id);
        updateTeamInfo(teamId, { lineup: newLineup });
    };

    return (
        <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${matchState[teamId].info.color}`, paddingBottom: 10, marginBottom: 15 }}>
                <h3 style={{ margin: 0, color: 'white' }}>{matchState[teamId].info.name}</h3>
                <button
                    onClick={() => {
                        const isShowing = matchState.overlay?.activeView === `lineup_${teamId}`;
                        if (isShowing) {
                            setOverlayView('scoreboard');
                        } else {
                            setOverlayView(`lineup_${teamId}`);
                        }
                    }}
                    className={`btn ${matchState.overlay?.activeView === `lineup_${teamId}` ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ background: matchState.overlay?.activeView === `lineup_${teamId}` ? '#555' : '#e91e63' }}
                >
                    {matchState.overlay?.activeView === `lineup_${teamId}` ? 'Ocultar Alineación' : 'Mostrar Alineación'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 15, alignItems: 'center' }}>
                <input
                    className="input-field"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="#"
                    style={{ width: 60, textAlign: 'center' }}
                />
                <input
                    className="input-field"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre"
                    style={{ flex: 1 }}
                />
                <label style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                        type="checkbox"
                        checked={isStarter}
                        onChange={(e) => setIsStarter(e.target.checked)}
                        style={{ width: 18, height: 18 }}
                    />
                    Titular
                </label>
                <button onClick={addPlayer} className="btn btn-success" style={{ padding: '0 20px', fontSize: '1.2em' }}>+</button>
            </div>

            {/* Inline Error Message */}
            {errorMsg && (
                <div style={{
                    background: '#ffcdd2',
                    color: '#c62828',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '0.9em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <span style={{ fontWeight: 'bold' }}>⚠</span>
                    {errorMsg}
                </div>
            )}

            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Starters Column */}
                <div>
                    <h4 style={{ margin: '10px 0 10px', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 5 }}>Titulares</h4>
                    {matchState[teamId].lineup.filter((p: any) => p.isStarter).map((p: any) => (
                        <div key={p.id} className="flex-between" style={{ padding: '8px 10px', borderBottom: '1px solid #444', background: 'rgba(0,0,0,0.1)', marginBottom: 2, borderRadius: 4 }}>
                            <span style={{ fontSize: '1.1em' }}><b style={{ color: matchState[teamId].info.color, marginRight: 8 }}>{p.number}</b> {p.name}</span>
                            <button onClick={() => removePlayer(p.id)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', padding: '0 5px' }}>×</button>
                        </div>
                    ))}
                </div>

                {/* Bench Column */}
                <div>
                    <h4 style={{ margin: '10px 0 10px', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 5 }}>Finalizadores/as</h4>
                    {matchState[teamId].lineup.filter((p: any) => !p.isStarter).map((p: any) => (
                        <div key={p.id} className="flex-between" style={{ padding: '8px 10px', borderBottom: '1px solid #444', background: 'rgba(0,0,0,0.1)', marginBottom: 2, borderRadius: 4 }}>
                            <span style={{ fontSize: '1.1em' }}><b style={{ color: '#aaa', marginRight: 8 }}>{p.number}</b> {p.name}</span>
                            <button onClick={() => removePlayer(p.id)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', padding: '0 5px' }}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
