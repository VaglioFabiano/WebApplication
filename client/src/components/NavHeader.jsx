import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';

function NavHeader(props) {
  return (
    <Navbar bg='primary' data-bs-theme='dark' fixed="top" expand="lg" className="navbar">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <Link to='/' className='navbar-brand d-flex align-items-center'>
          <img src="../immagini/homeface.png" alt="HomeFace" className="img-fluid2" />
          Gioco Meme
        </Link>
        <Nav className="ml-auto">
          {props.loggedIn ? 
            <LogoutButton className="btn btn-outline-light logout-btn" logout={props.handleLogout} /> :
            <Link to='/login' className='btn btn-outline-light'>Login</Link>
          }
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavHeader;
