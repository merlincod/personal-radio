class Player {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.volumeControl = document.getElementById('volume');
        this.progress = document.querySelector('.progress');
        this.currentTrackTitle = document.getElementById('current-track-title');
        this.timeDisplay = document.getElementById('time-display');
        this.lyricsContainer = document.getElementById('lyrics-container'); // Section des paroles
        
        this.isPlaying = false;
        this.shuffle = false;
        this.repeat = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => playlist.playPrevious());
        this.nextBtn.addEventListener('click', () => playlist.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.volumeControl.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
    }

    async loadTrack(track) {
        this.audio.src = track.path;
        this.currentTrackTitle.textContent = track.title;
        this.play();
        await this.loadLyrics(track.title, track.artist); // Charger les paroles
    }

    

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play();
        this.isPlaying = true;
        this.playBtn.innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i data-lucide="play"></i>';
        lucide.createIcons();
    }

    setVolume(value) {
        this.audio.volume = value;
    }

    updateProgress() {
        const duration = this.audio.duration;
        const currentTime = this.audio.currentTime;
        const progress = (currentTime / duration) * 100;
        
        this.progress.style.width = `${progress}%`;
        this.timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.shuffleBtn.classList.toggle('active');
    }

    toggleRepeat() {
        this.repeat = !this.repeat;
        this.repeatBtn.classList.toggle('active');
    }

    handleTrackEnd() {
        if (this.repeat) {
            this.audio.play();
        } else {
            playlist.playNext();
        }
    }
}

lucide.createIcons();
const player = new Player();

class Playlist {
    constructor() {
        this.tracks = [];
        this.currentTrackIndex = -1;
        this.container = document.getElementById('tracks-container');
        
        this.loadTracks();
    }

    async loadTracks() {
        try {
            const response = await fetch('/api/tracks');
            this.tracks = await response.json();
            this.renderTracks();
        } catch (error) {
            console.error('Erreur lors du chargement des pistes:', error);
        }
    }

    renderTracks() {
        this.container.innerHTML = this.tracks.map((track, index) => `
            <div class="track-item ${index === this.currentTrackIndex ? 'active' : ''}" 
                 data-index="${index}">
                <div class="track-info">
                    <i data-lucide="${index === this.currentTrackIndex && player.isPlaying ? 'pause' : 'play'}"></i>
                    <div>
                        <div class="track-title">${track.title}</div>
                        ${track.artist ? `<div class="track-artist">${track.artist}</div>` : ''}
                    </div>
                </div>
                <div class="track-duration">${this.formatDuration(track.duration)}</div>
            </div>
        `).join('');

        lucide.createIcons();
        
        this.container.querySelectorAll('.track-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.playTrack(index);
            });
        });
    }
    updateGlobalProgress() {
        const progress = ((this.currentTrackIndex + 1) / this.tracks.length) * 100;
        document.querySelector('.global-progress').style.width = `${progress}%`;
    }

    formatDuration(duration) {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    playTrack(index) {
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        player.loadTrack(track);
        this.renderTracks();
    }

    playNext() {
        if (this.currentTrackIndex < this.tracks.length - 1) {
            this.playTrack(this.currentTrackIndex + 1);
        }
    }

    playPrevious() {
        if (this.currentTrackIndex > 0) {
            this.playTrack(this.currentTrackIndex - 1);
        }
    }
}

const playlist = new Playlist();