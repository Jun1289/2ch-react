import { Routes, Route } from 'react-router-dom'
// import { Home } from './components/Home';
import { Header } from './components/Header';
import { Thread } from './components/Thread';
import "./styles/global.css"


function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Thread />} />
      </Routes>
    </>
  );
}

export default App;
