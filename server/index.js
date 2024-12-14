import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mm from 'music-metadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Configuration du dossier de musique
const MUSIC_DIR = path.join(__dirname, '../music');

// Création du dossier music s'il n'existe pas
try {
    await fs.mkdir(MUSIC_DIR, { recursive: true });
} catch (err) {
    console.error('Erreur lors de la création du dossier music:', err);
}

// Route pour récupérer la liste des pistes
app.get('/api/tracks', async (req, res) => {
    try {
        const files = await fs.readdir(MUSIC_DIR);
        const tracks = await Promise.all(
            files
                .filter(file => file.endsWith('.mp3'))
                .map(async (file) => {
                    const filePath = path.join(MUSIC_DIR, file);
                    const metadata = await mm.parseFile(filePath);
                    
                    return {
                        id: file,
                        title: metadata.common.title || file.replace('.mp3', ''),
                        artist: metadata.common.artist || undefined,
                        duration: metadata.format.duration || 0,
                        path: `/tracks/${file}`
                    };
                })
        );
        
        res.json(tracks);
    } catch (error) {
        console.error('Erreur lors de la lecture des fichiers:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour servir les fichiers MP3
app.get('/tracks/:id', (req, res) => {
    const filePath = path.join(MUSIC_DIR, req.params.id);
    res.sendFile(filePath);
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});