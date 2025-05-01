import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginRegister from "./LoginRegister.jsx";
import Dashboard from "./Dashboard.jsx";
import Browse from "./Browse.jsx";
import Profile from "./Profile.jsx";
import LandingPage from "./LandingPage.jsx";
import FavoriteAuthor from "./FavoriteAuthor.jsx";
import AuthorLogin from "./AuthorLogin";
import AuthorRegister from "./AuthorRegister";
import PublisherDashboard from "./PublisherDashboard.jsx";
import UploadBook from "./UploadBook.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Browse" element={<Browse />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/AuthorLogin" element={<AuthorLogin/>}/>
        <Route path="/PublisherDashboard" element={<PublisherDashboard/>}/>
        <Route path="/AuthorRegister" element={<AuthorRegister/>}/>
        <Route path="/login-register" element={<LoginRegister />} />
        <Route path="/FavoriteAuthor" element={<FavoriteAuthor />} />
        <Route path="/UploadBook" element={<UploadBook />} /> 
      </Routes>
    </Router>
  );
}

export default App;
