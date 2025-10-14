import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '@pages/Home';
import NotFound from "@pages/NotFound";
import AdminPanel from "@pages/AdminPanel";
import ReportsPage from "@pages/Reports"

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/reports/:forumId" element={<ReportsPage />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/panel" element={<AdminPanel />} /> 
            </Routes>
        </Router>
    );
};

export default App;
