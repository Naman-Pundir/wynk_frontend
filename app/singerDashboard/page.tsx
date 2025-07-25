"use client";

import LeafLogo from "@/components/LeafLogo";
import { useEffect, useState } from "react";

export default function SingerDashboard() {
  const [username, setUsername] = useState("");
  const [songName, setSongName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    const storedName = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");
    if (storedName && token) {
      setUsername(storedName);
      fetchSongs(storedName, token);
    }
  }, []);

  const fetchSongs = async (name: string, token: string) => {
    try {
      const res = await fetch(`http://localhost:8080/wynk/singer/getall/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch songs");
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      console.error("Error fetching songs:", err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token || !file) return;

    const formData = new FormData();
    formData.append("name", songName);
    formData.append("runtime", "10");
    formData.append("singerName", username);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8080/wynk/singer/addsong", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload song");
      alert("Song uploaded successfully!");
      setSongName("");
      setFile(null);
      fetchSongs(username, token);
    } catch (err) {
      console.error("Error uploading song:", err);
      alert("Upload failed.");
    }
  };

  const handlePlaySong = async (songId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/wynk/user/stream/${songId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Range: "bytes=0-"
        }
      });

      if (!res.ok && res.status !== 206) throw new Error("Failed to stream song");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }

      const audio = new Audio(url);
      audio.addEventListener("ended", () => {
        setPlayingId(null);
        setCurrentAudio(null);
      });
      audio.play();
      setCurrentAudio(audio);
      setPlayingId(songId);
    } catch (err) {
      console.error("Error playing song:", err);
    }
  };

  const handleDeleteSong = async (songId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/wynk/singer/removesong/${songId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete song");
      alert("Song deleted successfully!");
      fetchSongs(username, token);
    } catch (err) {
      console.error("Error deleting song:", err);
      alert("Delete failed.");
    }
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
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-300">Song Name</label>
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-300">Upload File</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded cursor-pointer"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Upload Song
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Songs</h2>
          {songs.length > 0 ? (
            <ul className="space-y-2">
              {songs.map((song) => (
                <li
                  key={song.id}
                  className="bg-gray-800 p-3 rounded"
                >
                  <div className="flex justify-between items-center">
                    <div onClick={() => handlePlaySong(song.id)} className="cursor-pointer">
                      <div className="font-medium">{song.songName}</div>
                      <div className="text-sm text-gray-400">{song.singerName}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                    >
                      &minus;
                    </button>
                  </div>
                  {playingId === song.id && currentAudio && (
                    <audio
                      className="mt-2 w-full"
                      controls
                      autoPlay
                      src={currentAudio.src}
                      onPause={() => currentAudio?.pause()}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No songs uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
