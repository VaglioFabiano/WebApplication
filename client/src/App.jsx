import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Button,  Dropdown } from 'react-bootstrap';
import { BrowserRouter, Route, Routes, Navigate, Link } from 'react-router-dom';
import NavHeader from "./components/NavHeader";
import { LoginForm } from './components/AuthComponents';
import GamePage from './components/GamePage';
import UserProfile from './components/UserProfile';
import API from './API.mjs';
import SummaryPage from './components/SummaryPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false); 
  const [user, setUser] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (loggedIn) {
        try {
          const user = await API.getUserInfo();
          setUser(user);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
  
    checkAuth();
  }, [loggedIn]);
  

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({ msg: `Welcome, ${user.username}!`, type: 'success' });
      setUser(user);
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setMessage('');
  };

  return (
    <BrowserRouter>
      <NavHeader loggedIn={loggedIn} handleLogout={handleLogout} />
      <Container fluid className='mt-3'>
        {message && (
          <Row>
            <Alert variant={message.type} onClose={() => setMessage('')} dismissible>
              {message.msg}
            </Alert>
          </Row>
        )}
        <Routes>
          <Route path='/' element={
            <div className="full-height d-flex flex-column justify-content-center align-items-center text-center">
              <Row className="mb-4">
                <Col>
                  <h1>Benvenuti al Meme Game!</h1>
                  <p>Divertiti con i memes!</p>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col className='d-flex justify-content-center'>
                  <img src="/immagini/frontpage.jpg" alt="FrontMeme" className="img-fluid" />
                </Col>
              </Row>
              <Row className="mb-2">
                <Col className='d-flex justify-content-center'>
                  {loggedIn ? (
                    <>
                      <Link to="/UserProfile" className="btn btn-primary mx-2 ">Profilo Utente</Link>
                      <Link to="/GamePage"><Button variant="secondary" className="mx-2 btn-wide">Gioca</Button></Link>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="btn btn-primary mx-2 btn-wide">Login</Link>
                      <Link to="/GamePage"><Button variant="secondary" className="mx-2">Gioca come ospite</Button></Link>
                    </>
                  )}                
                </Col>
              </Row>
              <Row className="mb-2">
                <Col className='d-flex justify-content-center position-relative'>
                  <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      Regolamento
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown-menu-full">
                      <Dropdown.ItemText>
                        <p>Il gameplay si svolge in <b>più round</b> per <b>gli utenti loggati</b> e in <b>un round</b> per gli <b>ospiti</b>. Ogni round propone un meme, come segue:</p>
                        <ul>
                          <li>Regola 1: Il giocatore riceve un’immagine di un meme casuale e sette possibili didascalie per quel meme in ordine casuale. Sia l’immagine del meme che le didascalie devono essere generate dal server. Tra le sette didascalie, due di esse devono essere tra quelle che meglio si adattano a quel meme.</li>
                          <li>Regola 2: Il giocatore deve selezionare una didascalia che meglio si adatta al meme entro 30 secondi.</li>
                          <li>Regola 3: Se il giocatore seleziona una delle due didascalie più appropriate per il meme entro 30 secondi, ottiene 5 punti e l’applicazione mostra un messaggio che segnala la fine del round.</li>
                          <li>Regola 4: Se il giocatore seleziona una delle altre didascalie o il tempo scade, ottiene 0 punti. In questo caso, l'applicazione mostra un messaggio adeguato insieme alle due didascalie che sono le migliori per il meme dato.</li>
                        </ul>
                      </Dropdown.ItemText>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </div>
          } />
          <Route path='/login' element={
            loggedIn ? <Navigate replace to='/' /> :
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
              <LoginForm login={handleLogin} />
            </div>
          } />
          <Route path='/GamePage' element={<GamePage loggedIn={loggedIn} handleLogout={handleLogout} user={user} />} />
          <Route path="/UserProfile" element={<UserProfile loggedIn={loggedIn} handleLogout={handleLogout} user={user} />} />
          <Route path="/SummaryPage" element={<SummaryPage loggedIn={loggedIn} handleLogout={handleLogout} user={user} />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
