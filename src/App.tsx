// import React from 'react'; // React 17+ doesn't need this
import { Routes, Route } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { Dashboard } from './pages/Dashboard';
import { Overlay } from './pages/Overlay';

function App() {
    return (
        <MatchProvider>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/overlay" element={<Overlay />} />
            </Routes>
        </MatchProvider>
    );
}

export default App;
