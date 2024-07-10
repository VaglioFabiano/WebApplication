import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };
    props.login(credentials);
  };

  return (
    <div className="full-height d-flex justify-content-center align-items-center">
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
        <div className="login-form">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId='username' className='mb-3'>
              <Form.Label>Username</Form.Label>
              <Form.Control type='text' value={username} onChange={ev => setUsername(ev.target.value)} required />
            </Form.Group>
            <Form.Group controlId='password' className='mb-3'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} /*required minLength={6}*/ />
            </Form.Group>
            <Button type='submit' className='btn btn-primary'>Login</Button>
            <Link className='btn btn-danger my-2' to='/'>Cancel</Link>
          </Form>
        </div>
      </Container>
    </div>
  );
}

function LogoutButton(props) {
  return (
    <Button variant='outline-light' onClick={props.logout}>Logout</Button>
  );
}

export { LoginForm, LogoutButton };
