import { Routes, Route } from 'react-router-dom'
import { Home } from './components/Home';
import { Header } from './components/Header';
import { Thread } from './components/Thread';
import "./styles/global.css"
import { User } from './components/User';
import { UserProvider } from './state/userContext';


function App() {

  return (
    <UserProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/threads/:threadId" element={<Thread />}></Route>
        <Route path="/user/:userId?" element={<User />}></Route>
        {/* <Route path="/" element={<Thread />} /> */}
      </Routes>
    </UserProvider>
  );
}

export default App;
