'use client'

import { useEffect, useState } from "react";
import LeafLogo from "../../components/LeafLogo";

interface Song {
  id: number;
  songName: string;
  singerName: string;
  rating: number;
}

interface Playlist {
  id: number;
  playlistName: string;
  userName: string;
  songs: Song[];
}

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [selectedSongUrl, setSelectedSongUrl] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  useEffect(() => {
    const storedName = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");
    if (storedName) setUsername(storedName);

    if (token && storedName) {
      fetch("http://localhost:8080/wynk/user/song", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch songs");
          return res.json();
        })
        .then((data) => setSongs(data))
        .catch((err) => console.error("Error fetching songs:", err));

      fetch(`http://localhost:8080/wynk/user/playlist/getuser/${storedName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch playlists");
          return res.json();
        })
        .then((data) => setPlaylists(data))
        .catch((err) => console.error("Error fetching playlists:", err));
    }
  }, []);

  const handlePlaylistClick = (playlistId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    setSelectedPlaylistId(playlistId);
    fetch(`http://localhost:8080/wynk/user/playlist/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch playlist songs");
        return res.json();
      })
      .then((data) => setSongs(data.songs))
      .catch((err) => console.error("Error fetching playlist songs:", err));
  };

  const resetToAllSongs = () => {
    const token = sessionStorage.getItem("token");
    const storedName = sessionStorage.getItem("username");
    if (!token || !storedName) return;
    setSelectedPlaylistId(null);
    fetch("http://localhost:8080/wynk/user/song", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch songs");
        return res.json();
      })
      .then((data) => setSongs(data))
      .catch((err) => console.error("Error fetching songs:", err));
  };

  const handlePlaySong = (songId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    fetch(`http://localhost:8080/wynk/user/stream/${songId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Range: "bytes=0-"
      }
    })
      .then((res) => {
        if (!res.ok && res.status !== 206) throw new Error("Failed to stream song");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setSelectedSongUrl(url);
        setSelectedSongId(songId);
      })
      .catch((err) => console.error("Error playing song:", err));
  };

  const handleAddToPlaylist = (songId: number, playlistId: number) => {
    const token = sessionStorage.getItem("token");
    if (!playlistId || !token) return;

    fetch(`http://localhost:8080/wynk/user/playlist/addSong?playlistId=${playlistId}&songId=${songId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add song to playlist");
        alert("Song added to playlist");
        window.location.reload();
      })
      .catch((err) => console.error("Error adding song to playlist:", err));
  };

  const handleCreatePlaylist = (songId: number) => {
    const playlistName = prompt("Enter new Playlist name:");
    const token = sessionStorage.getItem("token");
    const userName = sessionStorage.getItem("username");
    if (!playlistName || !token || !userName) return;

    fetch("http://localhost:8080/wynk/user/addPlaylist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: playlistName, userName, songId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create playlist");
        alert("Playlist created and song added");
        window.location.reload();
      })
      .catch((err) => console.error("Error creating playlist:", err));
  };

  const handleRemoveFromPlaylist = (songId: number, playlistId: number) => {
    const token = sessionStorage.getItem("token");
    if (!playlistId || !token) return;

    fetch(`http://localhost:8080/wynk/user/playlist/removeSong?playlistId=${playlistId}&songId=${songId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove song from playlist");
        alert("Song removed from playlist");
        window.location.reload();
      })
      .catch((err) => console.error("Error removing song from playlist:", err));
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-4">
      <header className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <div className="text-3xl font-bold flex items-center gap-4">
          <LeafLogo />
          Team-7
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Welcome, {username}</h2>
          <div>
            <h3 className="text-lg font-medium mb-2">Your Playlists:</h3>
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist.id)}
                className="cursor-pointer border border-gray-600 rounded p-4 mb-4 hover:bg-gray-800"
              >
                <h4 className="text-white font-semibold mb-2">{playlist.playlistName}</h4>
                <ul className="space-y-1">
                  {playlist.songs.map((song) => (
                    <li key={song.id} className="text-gray-300">
                      {song.songName} by {song.singerName}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              onClick={resetToAllSongs}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Deselect Playlist
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Songs:</h3>
          <ul className="space-y-4">
            {songs.map((song) => (
              <li
                key={song.id}
                className="border border-gray-600 rounded p-4 hover:bg-gray-800 relative"
              >
                <div onClick={() => handlePlaySong(song.id)} className="cursor-pointer">
                  <div className="font-semibold text-white">{song.songName}</div>
                  <div className="text-sm text-gray-400">
                    {song.singerName}
                  </div>
                </div>
                {selectedPlaylistId ? (
                  <button
                    onClick={() => handleRemoveFromPlaylist(song.id, selectedPlaylistId)}
                    className="absolute right-4 top-4 text-red-400 hover:text-red-600 text-xl"
                  >
                    &minus;
                  </button>
                ) : (
                  <select
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        handleCreatePlaylist(song.id);
                      } else {
                        handleAddToPlaylist(song.id, parseInt(e.target.value));
                      }
                    }}
                    className="absolute right-4 top-4 text-white bg-gray-800 border border-gray-600 px-2 py-1 rounded"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Playlist</option>
                    {playlists.map(p => (
                      <option key={p.id} value={p.id}>{p.playlistName}</option>
                    ))}
                    <option value="new">➕ New Playlist</option>
                  </select>
                )}
                {selectedSongId === song.id && selectedSongUrl && (
                  <audio
                    controls
                    autoPlay
                    className="w-full mt-4 bg-gray-900 rounded-lg p-2 shadow-lg"
                    src={selectedSongUrl}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
