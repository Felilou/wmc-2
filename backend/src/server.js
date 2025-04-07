import path from "path";

import express from 'express'
import mysql from "mysql2/promise";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../config/serviceAccountKey.json' with {type: "json"};
import { cert } from "firebase-admin/app";

const app = express();
// Set up disk storage
const storagebeer = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'backend', 'images', 'beer');
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid name conflicts
  }
});

const storagebrewery = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'backend', 'images', 'brewery');
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid name conflicts
  }
});

const uploadbeer = multer({ storage: storagebeer });
const uploadbrewery = multer({ storage: storagebrewery });
const port = 3300;
const __dirname = path.resolve();
const admin = initializeApp({
  credential: cert(serviceAccount)
});
const auth = getAuth(admin);

const pool = mysql.createPool({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "bierchen",
});

app.use(cors());
app.use(express.json());
app.use("/api/img/beer", express.static(path.join(__dirname, "../backend/images/beer")));
app.use("/api/img/brewery", express.static(path.join(__dirname, "../backend/images/brewery")));

// Firebase

// Authentication Middleware
const authenticateUser = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

//Admin check middleware
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.admin === true) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admins only' });
  }
};

// Endpoint to set custom claims
app.post('/api/setAdminClaim', async (req, res) => {
  const { uid, isAdmin } = req.body;

  if (typeof uid !== 'string' || typeof isAdmin !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    await getAuth().setCustomUserClaims(uid, { admin: isAdmin });
    res.json({ message: `Successfully set admin claim for user ${uid}` });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    res.status(500).json({ error: 'Failed to set custom claims' });
  }
});

// API Routes

// Beer Routes
// GET all beers
app.get('/api/beer', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM beer');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching beers:', error);
    res.status(500).json({ error: 'Failed to fetch beers' });
  }
});

// GET beer by ID
app.get('/api/beer/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM beer WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Beer not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching beer:', error);
    res.status(500).json({ error: 'Failed to fetch beer' });
  }
});

// CREATE beer
app.post('/api/beer', uploadbeer.single('image'), async (req, res) => {
  try {
    const { name, description, brewery_id, rating } = req.body;
    let image_url = null;
    
    if (req.file) {
      image_url = `/api/img/beer/${req.file.filename}`;
    }
    
    const [result] = await pool.query(
      'INSERT INTO beer (name, description, image_url, brewery_id, rating) VALUES (?, ?, ?, ?, ?)',
      [name, description, image_url, brewery_id, rating]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      name,
      description,
      image_url,
      brewery_id,
      rating
    });
  } catch (error) {
    console.error('Error creating beer:', error);
    res.status(500).json({ error: 'Failed to create beer' });
  }
});

// UPDATE beer
app.put('/api/beer/:id', uploadbeer.single('image'), async (req, res) => {
  try {
    const { name, description, brewery_id, rating } = req.body;
    const beerId = req.params.id;
    
    // Check if beer exists
    const [existingBeer] = await pool.query('SELECT * FROM beer WHERE id = ?', [beerId]);
    
    if (existingBeer.length === 0) {
      return res.status(404).json({ error: 'Beer not found' });
    }
    
    let image_url = existingBeer[0].image_url;
    
    if (req.file) {
      // Delete old image if exists
      if (image_url) {
        const oldImagePath = path.join(__dirname, '..', 'backend', 'images', 'beer', path.basename(image_url));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      image_url = `/api/img/beer/${req.file.filename}`;
    }
    
    await pool.query(
      'UPDATE beer SET name = ?, description = ?, image_url = ?, brewery_id = ?, rating = ? WHERE id = ?',
      [name, description, image_url, brewery_id, rating, beerId]
    );
    
    res.json({
      id: beerId,
      name,
      description,
      image_url,
      brewery_id,
      rating
    });
  } catch (error) {
    console.error('Error updating beer:', error);
    res.status(500).json({ error: 'Failed to update beer' });
  }
});

// DELETE beer
app.delete('/api/beer/:id', async (req, res) => {
  try {
    const beerId = req.params.id;
    
    // Get beer to find image
    const [beer] = await pool.query('SELECT * FROM beer WHERE id = ?', [beerId]);
    
    if (beer.length === 0) {
      return res.status(404).json({ error: 'Beer not found' });
    }
    
    // Delete image if exists
    if (beer[0].image_url) {
      const imagePath = path.join(__dirname, '..', 'backend', 'images', 'beer', path.basename(beer[0].image_url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await pool.query('DELETE FROM beer WHERE id = ?', [beerId]);
    
    res.json({ message: 'Beer deleted successfully' });
  } catch (error) {
    console.error('Error deleting beer:', error);
    res.status(500).json({ error: 'Failed to delete beer' });
  }
});

// Brewery Routes
// GET all breweries
app.get('/api/brewery', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brewery');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching breweries:', error);
    res.status(500).json({ error: 'Failed to fetch breweries' });
  }
});

// GET brewery by ID
app.get('/api/brewery/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brewery WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Brewery not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching brewery:', error);
    res.status(500).json({ error: 'Failed to fetch brewery' });
  }
});

// CREATE brewery
app.post('/api/brewery', uploadbrewery.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    let image_url = null;
    
    if (req.file) {
      image_url = `/api/img/brewery/${req.file.filename}`;
    }
    
    const [result] = await pool.query(
      'INSERT INTO brewery (name, description, image_url) VALUES (?, ?, ?)',
      [name, description, image_url]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      name,
      description,
      image_url
    });
  } catch (error) {
    console.error('Error creating brewery:', error);
    res.status(500).json({ error: 'Failed to create brewery' });
  }
});

// UPDATE brewery
app.put('/api/brewery/:id', uploadbrewery.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const breweryId = req.params.id;
    
    // Check if brewery exists
    const [existingBrewery] = await pool.query('SELECT * FROM brewery WHERE id = ?', [breweryId]);
    
    if (existingBrewery.length === 0) {
      return res.status(404).json({ error: 'Brewery not found' });
    }
    
    let image_url = existingBrewery[0].image_url;
    
    if (req.file) {
      // Delete old image if exists
      if (image_url) {
        const oldImagePath = path.join(__dirname, '..', 'backend', 'images', 'brewery', path.basename(image_url));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      image_url = `/api/img/brewery/${req.file.filename}`;
    }
    
    await pool.query(
      'UPDATE brewery SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [name, description, image_url, breweryId]
    );
    
    res.json({
      id: breweryId,
      name,
      description,
      image_url
    });
  } catch (error) {
    console.error('Error updating brewery:', error);
    res.status(500).json({ error: 'Failed to update brewery' });
  }
});

// DELETE brewery
app.delete('/api/brewery/:id', async (req, res) => {
  try {
    const breweryId = req.params.id;
    
    // Get brewery to find image
    const [brewery] = await pool.query('SELECT * FROM brewery WHERE id = ?', [breweryId]);
    
    if (brewery.length === 0) {
      return res.status(404).json({ error: 'Brewery not found' });
    }
    
    // Check if brewery has associated beers
    const [beers] = await pool.query('SELECT * FROM beer WHERE brewery_id = ?', [breweryId]);
    
    if (beers.length > 0) {
      return res.status(400).json({ error: 'Cannot delete brewery with associated beers' });
    }
    
    // Delete image if exists
    if (brewery[0].image_url) {
      const imagePath = path.join(__dirname, '..', 'backend', 'images', 'brewery', path.basename(brewery[0].image_url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await pool.query('DELETE FROM brewery WHERE id = ?', [breweryId]);
    
    res.json({ message: 'Brewery deleted successfully' });
  } catch (error) {
    console.error('Error deleting brewery:', error);
    res.status(500).json({ error: 'Failed to delete brewery' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;