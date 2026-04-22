import { useEffect, useState } from "react";

const emojis = [
  "😊",
  "😂",
  "🔥",
  "👍",
  "💚",
  "❤️",
  "🙏",
  "❗",
  "✔",
  "📦",
  "🎉",
  "😎",
  "😍",
  "😉",
  "🌹",
  "💪",
  "🙂",
  "👀",
  "🤗",
  "🌿",
  "✨",
  "👌",
];

export default function App() {
  // ✅ FIX localStorage (lazy init)
  const [scripts, setScripts] = useState(() => {
    try {
      const data = localStorage.getItem("qs_scripts");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const insertEmoji = (emoji, type = "text") => {
    if (type === "key") setKeyInput((prev) => prev + emoji);
    else setTextInput((prev) => prev + emoji);
  };

  const [keyInput, setKeyInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [search, setSearch] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [dark, setDark] = useState(() => {
    try {
      const data = localStorage.getItem("mood");
      return data ? JSON.parse(data) : false;
    } catch {
      return false;
    }
  });

  // ✅ SAVE
  useEffect(() => {
    localStorage.setItem("qs_scripts", JSON.stringify(scripts));
  }, [scripts]);

  useEffect(() => {
    localStorage.setItem("mood", JSON.stringify(dark));
  }, [dark]);

  // ➕ Add
  const addScript = () => {
    if (!keyInput || !textInput) return;

    setScripts((prev) => [
      ...prev,
      { id: Date.now(), key: keyInput, text: textInput },
    ]);

    setKeyInput("");
    setTextInput("");
  };

  // ✏️ Edit
  const saveEdit = () => {
    setScripts((prev) =>
      prev.map((s) => (s.id === editItem.id ? editItem : s)),
    );
    setEditItem(null);
  };

  // ❌ Delete
  const confirmDelete = () => {
    setScripts((prev) => prev.filter((s) => s.id !== deleteItem.id));
    setDeleteItem(null);
  };

  // 📋 Copy
  const copy = (item) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  // 🔼🔽 Move
  const move = (index, dir) => {
    const updated = [...scripts];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= scripts.length) return;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setScripts(updated);
  };

  // 📤 Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify(scripts)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quickscripts.json";
    a.click();
  };

  // 📥 Import
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setScripts(JSON.parse(ev.target.result));
      } catch {
        alert("Invalid file");
      }
    };
    reader.readAsText(file);
  };

  // 🔍 Search
  const filtered = scripts.filter(
    (s) =>
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      s.text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={
        (dark ? "bg-[#0b0f14] text-white" : "bg-[#f4f6f8] text-black") +
        " min-h-screen flex flex-col"
      }
    >
      {/* HEADER */}
      <header className="bg-[#003a4e] text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">QuickScripts</h1>
        <button
          onClick={() => setDark(!dark)}
          className="bg-white text-black px-3 py-1 rounded"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <main className="flex-1 max-w-3xl mx-auto p-4 w-full">
        {/* ADD */}
        <div
          className={
            dark
              ? "bg-gray-900 p-4 rounded-xl mb-4"
              : "bg-white p-4 rounded-xl mb-4 shadow-md"
          }
        >
          <input
            className="w-full p-2 mb-2 outline-none rounded bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-[#003a4e]"
            placeholder="Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />

          <textarea
            className="w-full h-40 p-2 mb-2 outline-none rounded bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-[#003a4e]"
            placeholder="Script"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          {/* Emoji Picker for Text */}
          <div className="flex gap-2 mb-2 flex-wrap">
            {emojis.map((e, i) => (
              <button key={i} onClick={() => insertEmoji(e, "text")}>
                {e}
              </button>
            ))}
          </div>

          <button
            onClick={addScript}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            Add Script
          </button>
        </div>

        {/* TOOLS */}
        <div className="flex gap-2 mb-4 items-center">
          <div className="relative flex-1">
            <input
              className="w-full p-2 outline-none pr-10 rounded bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-[#003a4e]"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={exportData}
            className="bg-green-600 px-3  rounded text-white"
          >
            Export
          </button>

          <label className="bg-purple-600 px-3 rounded text-white cursor-pointer">
            Import
            <input type="file" hidden onChange={importData} />
          </label>
        </div>

        {/* LIST */}
        {filtered.map((s, i) => (
          <div
            key={s.id}
            className={
              dark
                ? "bg-gray-900 p-4 rounded-xl mb-3"
                : "bg-white p-4 rounded-xl mb-3 shadow-md"
            }
          >
            <div className="flex justify-between">
              <strong>{s.key}</strong>

              <div className="flex gap-2">
                <button onClick={() => move(i, -1)}>⬆</button>
                <button onClick={() => move(i, 1)}>⬇</button>
              </div>
            </div>

            <p className="mt-2 mb-3 opacity-80">{s.text}</p>

            <div className="flex gap-2">
              <button
                onClick={() => copy(s)}
                className="bg-green-500 px-3 py-1 rounded"
              >
                {copiedId === s.id ? "✔" : "Copy"}
              </button>

              <button
                onClick={() => setEditItem({ ...s })}
                className="bg-yellow-500 px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => setDeleteItem(s)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#003a4e] text-white text-center p-3 mt-auto">
        QuickScripts © 2026 • Built with ❤️ by Abdallah Yasser
      </footer>

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white text-black p-4 rounded w-[300px] sm:w-[650px]">
            <input
              className="w-full p-2 mb-2 border"
              value={editItem.key}
              onChange={(e) =>
                setEditItem({ ...editItem, key: e.target.value })
              }
            />

            <textarea
              className="w-full h-40 p-2 mb-2 border"
              value={editItem.text}
              onChange={(e) =>
                setEditItem({ ...editItem, text: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditItem(null)}>Cancel</button>
              <button
                onClick={saveEdit}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white text-black p-4 rounded w-80 text-center">
            <p className="mb-4">Are you sure you want to delete?</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setDeleteItem(null)}>Cancel</button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
