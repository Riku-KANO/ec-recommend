const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login</title>
    </head>
    <body>
      <h1>Login</h1>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div id="error" style="color: red; display: none;">Invalid credentials</div>
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (response.ok) {
            window.location.href = '/';
          } else {
            document.getElementById('error').style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Signup page
app.get('/signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sign Up</title>
    </head>
    <body>
      <h1>Sign Up</h1>
      <form id="signupForm">
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
        <button type="submit">Sign Up</button>
      </form>
      <div id="error" style="color: red; display: none;"></div>
      <div id="success" style="color: green; display: none;">Registration successful</div>
      <script>
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const form = e.target;
          const email = form.email.value;
          const password = form.password.value;
          const confirmPassword = form.confirmPassword.value;
          
          const errorDiv = document.getElementById('error');
          errorDiv.style.display = 'none';
          
          // Email validation
          if (!email.includes('@')) {
            errorDiv.textContent = 'Invalid email format';
            errorDiv.style.display = 'block';
            return;
          }
          
          // Password validation
          if (password.length < 8) {
            errorDiv.textContent = 'Password must be at least 8 characters';
            errorDiv.style.display = 'block';
            return;
          }
          
          if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
          }
          
          document.getElementById('success').style.display = 'block';
        });
      </script>
    </body>
    </html>
  `);
});

// Home page
app.get('/', (req, res) => {
  const isLoggedIn = req.headers.cookie && req.headers.cookie.includes('auth=true');
  
  if (!isLoggedIn) {
    return res.redirect('/login');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Home</title>
    </head>
    <body>
      <h1>Welcome</h1>
      <button onclick="logout()">Logout</button>
      <script>
        function logout() {
          document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          window.location.href = '/login';
        }
      </script>
    </body>
    </html>
  `);
});

// Dashboard (protected route)
app.get('/dashboard', (req, res) => {
  const isLoggedIn = req.headers.cookie && req.headers.cookie.includes('auth=true');
  
  if (!isLoggedIn) {
    return res.redirect('/login');
  }
  
  res.send('<h1>Dashboard</h1>');
});

// API endpoint for login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'testuser@example.com' && password === 'TestPass123!') {
    res.cookie('auth', 'true');
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(port, () => {
  console.log(`Frontend mock server running at http://localhost:${port}`);
});