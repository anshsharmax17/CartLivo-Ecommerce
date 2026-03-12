const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const { data: existingUser, error: existingErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingErr) {
      return res.status(500).json({ message: 'Failed to check existing user.', error: existingErr.message });
    }

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error: insertErr } = await supabase
      .from('users')
      .insert({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'user',
      })
      .select('id, name, email, role, created_at')
      .single();

    if (insertErr) {
      return res.status(500).json({ message: 'Failed to create user.', error: insertErr.message });
    }

    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      message: 'Signup successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, password, role, created_at')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchErr) {
      return res.status(500).json({ message: 'Failed to fetch user.', error: fetchErr.message });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

module.exports = { signup, login };