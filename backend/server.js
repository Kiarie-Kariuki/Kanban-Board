const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-in-production';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '7d';

const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.options('*', (req, res) => {
  res.sendStatus(200);
});

const dbFile = path.join(__dirname, 'data.sqlite');
const db = new Database(dbFile);

function ensureColumn(table, column, definition) {
  const existingColumns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!existingColumns.some((col) => col.name === column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

function initDb() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'medium',
    dueDate TEXT,
    timeEstimate TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`).run();

  // New tables for student management
  db.prepare(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_fee REAL NOT NULL DEFAULT 4500,
    package_type TEXT DEFAULT 'Advanced Web Dev',
    program TEXT DEFAULT 'Cloud Architecture Specialist',
    avatar_url TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`).run();

  ensureColumn('students', 'package_type', "TEXT DEFAULT 'Advanced Web Dev'");
  ensureColumn('students', 'program', "TEXT DEFAULT 'Cloud Architecture Specialist'");
  ensureColumn('students', 'avatar_url', "TEXT DEFAULT ''");

  db.prepare(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL
  )`).run();

  // Clear existing courses that are not in the correct list and ensure only the 10 courses exist
  const correctCourseNames = [
    'Introduction To Computers',
    'MS Word',
    'MS Excel',
    'MS PowerPoint',
    'MS Publisher',
    'Internet Basics',
    'Email Management',
    'Typing Skills',
    'IT Security',
    'Introduction to Artificial Intelligence'
  ];

  const placeholders = correctCourseNames.map(() => '?').join(',');
  const oldCourses = db.prepare(`SELECT id FROM courses WHERE name NOT IN (${placeholders})`).all(...correctCourseNames);
  const oldCourseIds = oldCourses.map((course) => course.id);

  if (oldCourseIds.length > 0) {
    const idPlaceholders = oldCourseIds.map(() => '?').join(',');
    db.prepare(`DELETE FROM class_enrollments WHERE class_id IN (SELECT id FROM classes WHERE course_id IN (${idPlaceholders}))`).run(...oldCourseIds);
    db.prepare(`DELETE FROM classes WHERE course_id IN (${idPlaceholders})`).run(...oldCourseIds);
    db.prepare(`DELETE FROM student_courses WHERE course_id IN (${idPlaceholders})`).run(...oldCourseIds);
    db.prepare(`DELETE FROM courses WHERE id IN (${idPlaceholders})`).run(...oldCourseIds);
  }

  // Delete all existing courses and related data to ensure clean slate and correct IDs
  db.prepare(`DELETE FROM class_enrollments`).run();
  db.prepare(`DELETE FROM classes`).run();
  db.prepare(`DELETE FROM student_courses`).run();
  db.prepare(`DELETE FROM courses`).run();

  // Insert the correct courses with sequential IDs starting from 1
  const courses = [
    { name: 'Introduction To Computers', description: 'Computer fundamentals', duration: 5 },
    { name: 'MS Word', description: 'Word processing basics', duration: 5 },
    { name: 'MS Excel', description: 'Spreadsheet management', duration: 4 },
    { name: 'MS PowerPoint', description: 'Presentation creation', duration: 4 },
    { name: 'MS Publisher', description: 'Publication creation basics', duration: 5 },
    { name: 'Internet Basics', description: 'Web navigation and safety', duration: 4 },
    { name: 'Email Management', description: 'Email usage and etiquette', duration: 4 },
    { name: 'Typing Skills', description: 'Keyboard typing practice', duration: 4 },
    { name: 'IT Security', description: 'Network security fundamentals', duration: 4 },
    { name: 'Introduction to Artificial Intelligence', description: 'Introduction to AI concepts', duration: 4 },
  ];
  
  courses.forEach((course, index) => {
    const id = index + 1;
    db.prepare('INSERT INTO courses (id, name, description, duration_days) VALUES (?, ?, ?, ?)').run(id, course.name, course.description, course.duration);
  });

  db.prepare(`CREATE TABLE IF NOT EXISTS student_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    start_date TEXT,
    end_date TEXT,
    score INTEGER DEFAULT 90,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )`).run();

  // Add score column if it doesn't exist
  try {
    ensureColumn('student_courses', 'score', 'INTEGER DEFAULT 90');
  } catch (e) {
    console.log('Score column already exists');
  }

  // New table for class scheduling
  db.prepare(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 2,
    max_students INTEGER NOT NULL DEFAULT 5,
    type TEXT NOT NULL DEFAULT 'regular', -- 'regular' or 'makeup'
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS class_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(class_id, student_id)
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    certificate_id TEXT NOT NULL UNIQUE,
    generated_date TEXT NOT NULL,
    file_path TEXT,
    certificate_data TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  )`).run();

  // Only add columns if they don't exist (for existing databases)
  try {
    ensureColumn('certificates', 'certificate_id', "TEXT DEFAULT ''");
  } catch (e) {
    // Column might already exist or table has data, skip
    console.log('Certificate table columns already exist or cannot be altered');
  }
  try {
    ensureColumn('certificates', 'file_path', "TEXT");
  } catch (e) {
    console.log('File path column already exists');
  }

  db.prepare(`CREATE TRIGGER IF NOT EXISTS tasks_update_at
    AFTER UPDATE ON tasks
    BEGIN
      UPDATE tasks SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `).run();
}

initDb();

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

async function generateCertificateHTML(student, certificateId, qrCodeDataURL) {
  const issuedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Generate short certificate ID: first 4 digits of student ID + year
  const shortCertId = String(student.id).slice(-4) + '-' + new Date().getFullYear();
  
  // Create modules list (use passed modules from database, or fallback to all 10 courses)
  const modules = student.modules || [
    { name: 'Introduction To Computers', score: 90 },
    { name: 'MS Word', score: 92 },
    { name: 'MS Excel', score: 91 },
    { name: 'MS PowerPoint', score: 93 },
    { name: 'MS Publisher', score: 89 },
    { name: 'Internet Basics', score: 91 },
    { name: 'Email Management', score: 92 },
    { name: 'Typing Skills', score: 88 },
    { name: 'IT Security', score: 90 },
    { name: 'Introduction to Artificial Intelligence', score: 91 }
  ];

  // Build modules grid HTML
  let modulesHTML = '';
  for (let i = 0; i < modules.length; i += 2) {
    modulesHTML += '<tr>';
    if (i < modules.length) {
      modulesHTML += '<td class="module-left"><div class="module-row"><span class="module-name">' + modules[i].name + '</span><span class="module-score">' + modules[i].score + '%</span></div></td>';
    }
    if (i + 1 < modules.length) {
      modulesHTML += '<td class="module-right"><div class="module-row"><span class="module-name">' + modules[i + 1].name + '</span><span class="module-score">' + modules[i + 1].score + '%</span></div></td>';
    } else {
      modulesHTML += '<td class="module-right"></td>';
    }
    modulesHTML += '</tr>';
  }

  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Certificate of Completion - RIE Technologies</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Caveat:wght@400;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet"><style>@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Caveat:wght@400;700&family=Montserrat:wght@400;600;700&display=swap");' +
    '* { margin: 0; padding: 0; box-sizing: border-box; }' +
    '@page { size: 1123px 794px landscape; margin: 0; }' +
    'body { font-family: "Montserrat", sans-serif; margin: 0; padding: 0; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }' +
    '.certificate-wrapper { width: 1123px; height: 794px; background: white; position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8); }' +
    '.certificate-wrapper::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent); background-size: 50px 50px; pointer-events: none; z-index: 1; }' +
    '.certificate-wrapper::after { content: ""; position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px; border: 2px solid #22c55e; box-shadow: inset 0 0 20px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.5); pointer-events: none; z-index: 2; }' +
    '.certificate-content { position: relative; z-index: 3; width: 100%; height: 100%; padding: 50px 60px; display: flex; flex-direction: column; justify-content: space-between; color: #000000; }' +
    '.header { text-align: center; margin-bottom: 20px; position: relative; }' +
    '.certificate-id { position: absolute; top: 0; right: 0; font-family: "Montserrat", sans-serif; font-size: 12px; color: #666666; letter-spacing: 0.5px; }' +
    '.company-name { font-family: "Playfair Display", serif; font-size: 56px; font-weight: 700; letter-spacing: 4px; color: #22c55e; margin-bottom: 12px; text-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }' +
    '.certificate-title { font-family: "Montserrat", sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; color: #22c55e; text-transform: uppercase; }' +
    '.middle-section { text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 80px; }' +
    '.certifies-label { font-family: "Montserrat", sans-serif; font-size: 14px; letter-spacing: 2px; color: #666666; text-transform: uppercase; margin-bottom: 20px; }' +
    '.recipient-name { font-family: "Caveat", cursive !important; font-size: 80px; color: #22c55e; margin: 20px 0; font-weight: 400; text-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }' +
    '.description { font-family: "Montserrat", sans-serif; font-size: 12px; letter-spacing: 0.5px; line-height: 1.6; color: #333333; margin: 25px 0; max-width: 900px; margin-left: auto; margin-right: auto; }' +
    '.highlight-green { color: #22c55e; font-weight: 600; }' +
    '.modules-section { margin-top: 20px; }' +
    '.modules-table { width: 100%; border-collapse: collapse; margin: 0 auto; }' +
    '.modules-table tr { display: flex; gap: 40px; justify-content: center; margin-bottom: 10px; }' +
    '.module-left, .module-right { width: 200px; }' +
    '.module-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px dashed #22c55e; gap: 20px; }' +
    '.module-name { font-family: "Montserrat", sans-serif; font-size: 11px; color: #000000; text-align: left; }' +
    '.module-score { font-family: "Montserrat", sans-serif; font-size: 11px; font-weight: 600; color: #22c55e; text-align: right; min-width: 35px; }' +
    '.footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px; padding-top: 10px; font-family: "Montserrat", sans-serif; font-size: 10px; color: #666666; letter-spacing: 0.5px; }' +
    '.footer-left { text-align: left; }' +
    '.footer-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }' +
    '.signature-line { border-top: 5px solid #22c55e; display: inline-block; width: 200px; margin-top: 30px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3); }' +
    '.signature-label { font-family: "Montserrat", sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: #666666; text-transform: uppercase; }' +
    '.qr-placeholder { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); width: 80px; height: 80px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(34, 197, 94, 0.3); display: flex; align-items: center; justify-content: center; z-index: 4; }' +
    '.qr-placeholder img { width: 100%; height: 100%; object-fit: contain; }' +
    '@media print { body { background: none; display: block; } .certificate-wrapper { box-shadow: none; width: 100%; height: auto; aspect-ratio: 1123 / 794; } }' +
    '</style></head><body>' +
    '<div class="certificate-wrapper">' +
    '<div class="certificate-content">' +
    '<div class="header">' +
    '<div class="company-name">RIE TECHNOLOGIES</div>' +
    '<div class="certificate-title">Certificate of Completion</div>' +
    '<div class="certificate-id">Certificate ID: <strong>' + shortCertId + '</strong></div>' +
    '</div>' +
    '<div class="middle-section">' +
    '<div class="certifies-label">This certifies that</div>' +
    '<div class="recipient-name">' + student.name + '</div>' +
    '<div class="description">' +
    'has successfully completed the <span class="highlight-green">Computer Packages</span> program, ' +
    'demonstrating proficiency in the following modules:' +
    '</div>' +
    '<div class="modules-section">' +
    '<table class="modules-table">' +
    modulesHTML +
    '</table>' +
    '</div>' +
    '</div>' +
    '<div class="footer">' +
    '<div class="footer-left">Issued: <strong>' + issuedDate + '</strong></div>' +
    '<div class="footer-right">' +
    '<div class="signature-line"></div>' +
    '<div class="signature-label">Instructor</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="qr-placeholder">' +
    '<img src="' + qrCodeDataURL + '" alt="QR Code">' +
    '</div>' +
    '</div>' +
    '</body></html>';
  
  return html;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, fullname: user.fullname }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, fullname, email FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kanban backend is running' });
});

app.post('/api/auth/signup', (req, res) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    return res.status(400).json({ message: 'fullname, email, password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)').run(fullname, email.toLowerCase(), hashed);
  const user = db.prepare('SELECT id, fullname, email FROM users WHERE id = ?').get(result.lastInsertRowid);

  const token = signToken(user);
  res.status(201).json({ token, user });
});

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = db.prepare('SELECT id, fullname, email, password_hash FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, fullname: user.fullname, email: user.email } });
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY createdAt DESC').all(req.user.id);
  res.json(tasks);
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description, status = 'todo', priority = 'medium', dueDate = null, timeEstimate = null, category = 'general' } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const result = db.prepare(`INSERT INTO tasks (user_id, title, description, status, priority, dueDate, timeEstimate, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    req.user.id,
    title,
    description,
    status,
    priority,
    dueDate,
    timeEstimate,
    category
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status, priority, dueDate, timeEstimate, category } = req.body;

  db.prepare(`UPDATE tasks SET
    title = COALESCE(?, title),
    description = COALESCE(?, description),
    status = COALESCE(?, status),
    priority = COALESCE(?, priority),
    dueDate = COALESCE(?, dueDate),
    timeEstimate = COALESCE(?, timeEstimate),
    category = COALESCE(?, category)
    WHERE id = ? AND user_id = ?
  `).run(title, description, status, priority, dueDate, timeEstimate, category, id, req.user.id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Task not found' });

  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ message: 'Task deleted' });
});

// Student management endpoints
app.get('/api/students', authMiddleware, (req, res) => {
  const students = db.prepare(`
    SELECT s.*, 
      IFNULL((SELECT COUNT(*) FROM student_courses WHERE student_id = s.id), 0) AS total_courses,
      IFNULL((SELECT COUNT(*) FROM student_courses WHERE student_id = s.id AND status = 'completed'), 0) AS completed_courses,
      IFNULL((SELECT SUM(amount) FROM payments WHERE student_id = s.id), 0) AS total_paid,
      s.total_fee - IFNULL((SELECT SUM(amount) FROM payments WHERE student_id = s.id), 0) AS balance
    FROM students s
    WHERE user_id = ?
    ORDER BY s.created_at DESC
  `).all(req.user.id);

  const enriched = students.map((student) => ({
    ...student,
    progress: student.total_courses ? Math.round((student.completed_courses / student.total_courses) * 100) : 0,
    payment_status: student.total_paid >= student.total_fee ? 'Paid' : student.total_paid > 0 ? 'Partial' : 'Unpaid',
  }));

  res.json(enriched);
});

app.get('/api/students/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const totalPaid = db.prepare('SELECT IFNULL(SUM(amount), 0) AS total FROM payments WHERE student_id = ?').get(studentId).total;
  const { total_courses, completed_courses } = db.prepare(`
    SELECT 
      IFNULL(COUNT(*), 0) AS total_courses,
      IFNULL(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_courses
    FROM student_courses
    WHERE student_id = ?
  `).get(studentId);

  const progress = total_courses ? Math.round((completed_courses / total_courses) * 100) : 0;
  const paymentStatus = totalPaid >= student.total_fee ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

  res.json({
    ...student,
    total_paid: totalPaid,
    balance: student.total_fee - totalPaid,
    total_courses,
    completed_courses,
    progress,
    payment_status: paymentStatus,
  });
});

app.post('/api/students', authMiddleware, (req, res) => {
  const { name, phone, start_date, end_date, package_type = 'Web Design Pro', program = 'Cloud Architecture Specialist', total_fee = 4500 } = req.body;
  if (!name || !phone || !start_date || !end_date) {
    return res.status(400).json({ message: 'name, phone, start_date, end_date are required' });
  }

  const result = db.prepare(`INSERT INTO students (user_id, name, phone, start_date, end_date, package_type, program, total_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    req.user.id,
    name,
    phone,
    start_date,
    end_date,
    package_type,
    program,
    total_fee
  );
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);

  // Generate learning plan: assign courses with dates (no initial scores)
  const courses = db.prepare('SELECT * FROM courses ORDER BY id').all();
  let currentDate = new Date(start_date);
  courses.forEach(course => {
    const start = currentDate.toISOString().split('T')[0];
    currentDate.setDate(currentDate.getDate() + course.duration_days);
    const end = currentDate.toISOString().split('T')[0];
    db.prepare('INSERT INTO student_courses (student_id, course_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)').run(
      student.id, course.id, start, end, 'not_started'
    );
  });

  res.status(201).json(student);
});

app.put('/api/students/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  const existing = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Student not found' });

  const { name, phone, start_date, end_date, package_type, program, total_fee } = req.body;
  db.prepare(`UPDATE students SET
    name = COALESCE(?, name),
    phone = COALESCE(?, phone),
    start_date = COALESCE(?, start_date),
    end_date = COALESCE(?, end_date),
    package_type = COALESCE(?, package_type),
    program = COALESCE(?, program),
    total_fee = COALESCE(?, total_fee)
    WHERE id = ?
  `).run(name, phone, start_date, end_date, package_type, program, total_fee, studentId);
  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  res.json(updated);
});

app.delete('/api/students/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  const existing = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!existing) return res.status(404).json({ message: 'Student not found' });

  db.prepare('DELETE FROM student_courses WHERE student_id = ?').run(studentId);
  db.prepare('DELETE FROM payments WHERE student_id = ?').run(studentId);
  db.prepare('DELETE FROM certificates WHERE student_id = ?').run(studentId);
  db.prepare('DELETE FROM students WHERE id = ?').run(studentId);
  res.json({ message: 'Student deleted' });
});

app.get('/api/courses', authMiddleware, (req, res) => {
  const courses = db.prepare('SELECT * FROM courses ORDER BY id').all();
  res.json(courses);
});

// Class scheduling endpoints
app.get('/api/classes', authMiddleware, (req, res) => {
  const { date, course_id } = req.query;
  let query = `
    SELECT c.*, 
      COUNT(ce.id) as enrolled_count,
      co.name as course_name
    FROM classes c
    LEFT JOIN class_enrollments ce ON c.id = ce.class_id
    JOIN courses co ON c.course_id = co.id
    WHERE 1=1
  `;
  const params = [];
  if (date) {
    query += ' AND c.date = ?';
    params.push(date);
  }
  if (course_id) {
    query += ' AND c.course_id = ?';
    params.push(parseInt(course_id));
  }
  query += ' GROUP BY c.id ORDER BY c.date, c.start_time';
  const classes = db.prepare(query).all(...params);
  res.json(classes);
});

app.post('/api/classes', authMiddleware, (req, res) => {
  const { course_id, date, start_time, duration_hours = 2, max_students = 5, type = 'regular' } = req.body;
  
  // Validation for scheduling rules
  const dayOfWeek = new Date(date).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (type === 'regular' && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return res.status(400).json({ message: 'Regular classes can only be scheduled on weekdays' });
  }
  if (type === 'makeup' && dayOfWeek >= 1 && dayOfWeek <= 5) {
    return res.status(400).json({ message: 'Makeup classes can only be scheduled on weekends' });
  }
  if (dayOfWeek === 6 && start_time >= '12:00') { // Saturday afternoon
    return res.status(400).json({ message: 'Saturday classes can only be in the morning' });
  }
  
  const result = db.prepare(`
    INSERT INTO classes (course_id, date, start_time, duration_hours, max_students, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(course_id, date, start_time, duration_hours, max_students, type);
  
  const newClass = db.prepare('SELECT * FROM classes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newClass);
});

app.put('/api/classes/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const classId = parseInt(id, 10);
  if (isNaN(classId)) return res.status(404).json({ message: 'Invalid class ID' });
  
  const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
  if (!existing) return res.status(404).json({ message: 'Class not found' });
  
  const { course_id, date, start_time, duration_hours, max_students, type, status } = req.body;
  
  // Validation for scheduling rules
  const dayOfWeek = new Date(date || existing.date).getDay();
  const classType = type || existing.type;
  if (classType === 'regular' && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return res.status(400).json({ message: 'Regular classes can only be scheduled on weekdays' });
  }
  if (classType === 'makeup' && dayOfWeek >= 1 && dayOfWeek <= 5) {
    return res.status(400).json({ message: 'Makeup classes can only be scheduled on weekends' });
  }
  if (dayOfWeek === 6 && (start_time || existing.start_time) >= '12:00') {
    return res.status(400).json({ message: 'Saturday classes can only be in the morning' });
  }
  
  db.prepare(`
    UPDATE classes SET
      course_id = COALESCE(?, course_id),
      date = COALESCE(?, date),
      start_time = COALESCE(?, start_time),
      duration_hours = COALESCE(?, duration_hours),
      max_students = COALESCE(?, max_students),
      type = COALESCE(?, type),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(course_id, date, start_time, duration_hours, max_students, type, status, classId);
  
  const updated = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
  res.json(updated);
});

app.delete('/api/classes/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const classId = parseInt(id, 10);
  if (isNaN(classId)) return res.status(404).json({ message: 'Invalid class ID' });
  
  const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
  if (!existing) return res.status(404).json({ message: 'Class not found' });
  
  db.prepare('DELETE FROM class_enrollments WHERE class_id = ?').run(classId);
  db.prepare('DELETE FROM classes WHERE id = ?').run(classId);
  res.json({ message: 'Class deleted successfully' });
});

// Enroll student in class
app.post('/api/classes/:classId/enroll/:studentId', authMiddleware, (req, res) => {
  const { classId, studentId } = req.params;
  const class_id = parseInt(classId, 10);
  const student_id = parseInt(studentId, 10);
  if (isNaN(class_id) || isNaN(student_id)) return res.status(400).json({ message: 'Invalid IDs' });
  
  // Check if student belongs to user
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(student_id, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  
  // Check if class exists
  const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(class_id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  
  // Check if already enrolled
  const existing = db.prepare('SELECT * FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(class_id, student_id);
  if (existing) return res.status(400).json({ message: 'Student already enrolled in this class' });
  
  // Check capacity
  const enrolledCount = db.prepare('SELECT COUNT(*) as count FROM class_enrollments WHERE class_id = ?').get(class_id).count;
  if (enrolledCount >= cls.max_students) return res.status(400).json({ message: 'Class is full' });
  
  const result = db.prepare('INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)').run(class_id, student_id);
  res.status(201).json({ id: result.lastInsertRowid, class_id, student_id });
});

// Unenroll student from class
app.delete('/api/classes/:classId/enroll/:studentId', authMiddleware, (req, res) => {
  const { classId, studentId } = req.params;
  const class_id = parseInt(classId, 10);
  const student_id = parseInt(studentId, 10);
  if (isNaN(class_id) || isNaN(student_id)) return res.status(400).json({ message: 'Invalid IDs' });
  
  // Check if student belongs to user
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(student_id, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  
  const result = db.prepare('DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?').run(class_id, student_id);
  if (result.changes === 0) return res.status(404).json({ message: 'Enrollment not found' });
  
  res.json({ message: 'Student unenrolled successfully' });
});

// Get enrollments for a class
app.get('/api/classes/:id/enrollments', authMiddleware, (req, res) => {
  const { id } = req.params;
  const classId = parseInt(id, 10);
  if (isNaN(classId)) return res.status(404).json({ message: 'Invalid class ID' });
  
  const enrollments = db.prepare(`
    SELECT ce.*, s.name as student_name, s.phone
    FROM class_enrollments ce
    JOIN students s ON ce.student_id = s.id
    WHERE ce.class_id = ? AND s.user_id = ?
    ORDER BY ce.enrolled_at
  `).all(classId, req.user.id);
  
  res.json(enrollments);
});

// Get classes for a student
app.get('/api/students/:id/classes', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  
  const classes = db.prepare(`
    SELECT c.*, co.name as course_name, ce.enrolled_at
    FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    JOIN courses co ON c.course_id = co.id
    WHERE ce.student_id = ?
    ORDER BY c.date, c.start_time
  `).all(studentId);
  
  res.json(classes);
});

app.get('/api/students/:id/courses', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const courses = db.prepare(`
    SELECT sc.*, c.name, c.description, c.duration_days
    FROM student_courses sc
    JOIN courses c ON sc.course_id = c.id
    WHERE sc.student_id = ?
    ORDER BY sc.start_date
  `).all(studentId);
  res.json(courses);
});

app.put('/api/students/:studentId/courses/:courseId', authMiddleware, (req, res) => {
  const { studentId, courseId } = req.params;
  const studentIdNum = parseInt(studentId, 10);
  const courseIdNum = parseInt(courseId, 10);
  if (isNaN(studentIdNum) || isNaN(courseIdNum)) return res.status(404).json({ message: 'Invalid IDs' });
  const { status, score } = req.body;
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentIdNum, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  // Validate score if provided
  if (score !== undefined && (score < 0 || score > 100)) {
    return res.status(400).json({ message: 'Score must be between 0 and 100' });
  }

  const updateFields = [];
  const updateValues = [];
  if (status !== undefined) {
    updateFields.push('status = ?');
    updateValues.push(status);
  }
  if (score !== undefined) {
    updateFields.push('score = ?');
    updateValues.push(score);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  updateValues.push(studentIdNum, courseIdNum);
  db.prepare(`UPDATE student_courses SET ${updateFields.join(', ')} WHERE student_id = ? AND course_id = ?`).run(...updateValues);
  const updated = db.prepare('SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?').get(studentIdNum, courseIdNum);
  res.json(updated);
});

app.get('/api/students/:id/payments', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const payments = db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC').all(studentId);
  res.json(payments);
});

app.post('/api/students/:id/payments', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  const { amount, payment_date, description } = req.body;
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const result = db.prepare('INSERT INTO payments (student_id, amount, payment_date, description) VALUES (?, ?, ?, ?)').run(
    studentId, amount, payment_date, description
  );
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(payment);
});

app.post('/api/generate-certificate', authMiddleware, async (req, res) => {
  const { student_id } = req.body;
  const studentId = parseInt(student_id, 10);
  if (isNaN(studentId)) return res.status(400).json({ message: 'Invalid student ID' });

  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  // Check if all courses completed (temporarily disabled for testing)
  // const incomplete = db.prepare('SELECT COUNT(*) as count FROM student_courses WHERE student_id = ? AND status != "completed"').get(studentId);
  // if (incomplete.count > 0) return res.status(400).json({ message: 'Not all courses completed' });

  // For testing: check if student has any courses assigned
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM student_courses WHERE student_id = ?').get(studentId);
  if (courseCount.count === 0) {
    // If no courses assigned, create some test data from actual database courses
    const courses = db.prepare('SELECT * FROM courses').all();
    courses.forEach(course => {
      db.prepare('INSERT OR IGNORE INTO student_courses (student_id, course_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)').run(
        studentId, course.id, 'not_started', student.start_date, student.end_date
      );
    });
  }

  // Check if fee paid in full
  const totalPaid = db.prepare('SELECT SUM(amount) as total FROM payments WHERE student_id = ?').get(studentId);
  if (totalPaid.total < student.total_fee) return res.status(400).json({ message: 'Fee not fully paid' });

  // Check if certificate already exists
  let cert = db.prepare('SELECT * FROM certificates WHERE student_id = ?').get(studentId);
  if (cert && cert.file_path && fs.existsSync(path.join(__dirname, cert.file_path))) {
    // Certificate already generated
    const downloadUrl = `${req.protocol}://${req.get('host')}/certificates/${path.basename(cert.file_path)}`;
    return res.json({ message: 'Certificate already generated', downloadUrl, certificateId: cert.certificate_id });
  }

  try {
    // Generate unique certificate ID
    const certificateId = uuidv4();

    // Generate QR code for verification
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-certificate/${certificateId}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl);

    // Fetch student's actual courses with scores from database
    const studentCourses = db.prepare(`
      SELECT sc.score, c.name
      FROM student_courses sc
      JOIN courses c ON sc.course_id = c.id
      WHERE sc.student_id = ?
      ORDER BY c.id
    `).all(studentId);

    // Check that all courses have scores
    const coursesWithoutScores = studentCourses.filter(course => course.score == null);
    if (coursesWithoutScores.length > 0) {
      return res.status(400).json({ message: 'All courses must have scores before generating certificate' });
    }

    // Calculate average score
    const avgScore = studentCourses.length > 0 
      ? Math.round(studentCourses.reduce((sum, c) => sum + c.score, 0) / studentCourses.length)
      : 90;

    // Generate HTML with actual student courses
    const html = await generateCertificateHTML({
      id: studentId,
      name: student.name,
      course: 'Computer Packages',
      marks: avgScore + '%',
      completion_date: student.end_date,
      modules: studentCourses
    }, certificateId, qrCodeDataURL);

    // Generate PDF
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle2' });
    
    // Set viewport for landscape A4 size: 1123px × 794px
    await page.setViewport({ width: 1123, height: 794 });

    const fileName = `certificate_${studentId}_${certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);
    
    // Wait for the fonts to load before rendering PDF
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF in landscape orientation with custom size
    await page.pdf({
      path: filePath,
      width: '1123px',
      height: '794px',
      margin: 0,
      printBackground: true,
      landscape: false  // Already landscape in our custom size
    });

    await browser.close();

    // Save to database
    const generated_date = new Date().toISOString().split('T')[0];
    const certificate_data = JSON.stringify({
      student_name: student.name,
      course: 'Computer Packages',
      marks: '95%',
      completion_date: student.end_date,
      certificate_id: certificateId
    });

    if (cert) {
      // Update existing
      db.prepare('UPDATE certificates SET certificate_id = ?, file_path = ?, certificate_data = ? WHERE student_id = ?').run(
        certificateId, `certificates/${fileName}`, certificate_data, studentId
      );
    } else {
      // Insert new
      db.prepare('INSERT INTO certificates (student_id, certificate_id, generated_date, file_path, certificate_data) VALUES (?, ?, ?, ?, ?)').run(
        studentId, certificateId, generated_date, `certificates/${fileName}`, certificate_data
      );
    }

    const downloadUrl = `${req.protocol}://${req.get('host')}/certificates/${fileName}`;
    res.json({ message: 'Certificate generated successfully', downloadUrl, certificateId });

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
});

// Serve certificate files
app.use('/certificates', express.static(certificatesDir));

// Verify certificate endpoint
app.get('/api/verify-certificate/:certificateId', (req, res) => {
  const { certificateId } = req.params;
  const cert = db.prepare('SELECT * FROM certificates WHERE certificate_id = ?').get(certificateId);
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });

  const data = JSON.parse(cert.certificate_data);
  res.json({
    valid: true,
    certificate_id: certificateId,
    student_name: data.student_name,
    course: data.course,
    completion_date: data.completion_date,
    generated_date: cert.generated_date
  });
});

// Check if certificate exists for student
app.get('/api/students/:id/certificate-status', authMiddleware, (req, res) => {
  const { id } = req.params;
  const studentId = parseInt(id, 10);
  if (isNaN(studentId)) return res.status(404).json({ message: 'Invalid student ID' });
  
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND user_id = ?').get(studentId, req.user.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const cert = db.prepare('SELECT * FROM certificates WHERE student_id = ?').get(studentId);
  if (!cert || !cert.file_path || !fs.existsSync(path.join(__dirname, cert.file_path))) {
    return res.json({ exists: false });
  }

  const downloadUrl = `${req.protocol}://${req.get('host')}/${cert.file_path}`;
  res.json({ exists: true, downloadUrl, certificateId: cert.certificate_id });
});

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Kanban backend listening on http://localhost:${PORT}`);
  console.log(`API endpoints ready:`);
  console.log(`  POST /api/auth/signup`);
  console.log(`  POST /api/auth/signin`);
  console.log(`  GET /api/health`);
});
