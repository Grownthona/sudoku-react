import { useState, useEffect, useCallback } from "react";

const generateSudoku = () => {
  const base = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9],
  ];
  const solution = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9],
  ];
  return { puzzle: base, solution };
};

const DIFFICULTIES = {
  Easy: 35,
  Medium: 45,
  Hard: 55,
};

function generateFullBoard() {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));
  
  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
      if (board[i][col] === num) return false;
      const br = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const bc = 3 * Math.floor(col / 3) + (i % 3);
      if (board[br][bc] === num) return false;
    }
    return true;
  }
  
  function solve(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  solve(board);
  return board;
}

function createPuzzle(solution, clues) {
  const puzzle = solution.map(row => [...row]);
  const cells = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      cells.push([r, c]);
  
  const toRemove = cells.sort(() => Math.random() - 0.5).slice(0, 81 - clues);
  toRemove.forEach(([r, c]) => puzzle[r][c] = 0);
  return puzzle;
}

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState("Medium");
  const [solution, setSolution] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [noteMode, setNoteMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const startGame = useCallback((diff = difficulty) => {
    const sol = generateFullBoard();
    const puz = createPuzzle(sol, 81 - DIFFICULTIES[diff]);
    setSolution(sol);
    setPuzzle(puz);
    setBoard(puz.map(row => [...row]));
    setSelected(null);
    setErrors(new Set());
    setNotes({});
    setNoteMode(false);
    setTimer(0);
    setRunning(true);
    setWon(false);
    setMistakes(0);
  }, [difficulty]);

  useEffect(() => { startGame(); }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const isFixed = (r, c) => puzzle && puzzle[r][c] !== 0;

  const handleInput = useCallback((num) => {
    if (!selected || won) return;
    const [r, c] = selected;
    if (isFixed(r, c)) return;

    if (noteMode && num !== 0) {
      const key = `${r}-${c}`;
      setNotes(prev => {
        const cur = new Set(prev[key] || []);
        cur.has(num) ? cur.delete(num) : cur.add(num);
        return { ...prev, [key]: cur };
      });
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Clear notes for this cell
    setNotes(prev => { const n = {...prev}; delete n[`${r}-${c}`]; return n; });

    const newErrors = new Set(errors);
    if (num !== 0 && solution[r][c] !== num) {
      newErrors.add(`${r}-${c}`);
      setMistakes(m => m + 1);
    } else {
      newErrors.delete(`${r}-${c}`);
    }
    setErrors(newErrors);

    // Check win
    const complete = newBoard.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
    if (complete) { setWon(true); setRunning(false); }
  }, [selected, board, solution, puzzle, errors, noteMode, won]);

  useEffect(() => {
    const handleKey = (e) => {
      if (won) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) handleInput(num);
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') handleInput(0);
      if (e.key === 'n') setNoteMode(m => !m);
      if (!selected) return;
      const [r, c] = selected;
      if (e.key === 'ArrowUp' && r > 0) setSelected([r-1, c]);
      if (e.key === 'ArrowDown' && r < 8) setSelected([r+1, c]);
      if (e.key === 'ArrowLeft' && c > 0) setSelected([r, c-1]);
      if (e.key === 'ArrowRight' && c < 8) setSelected([r, c+1]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleInput, selected, won]);

  const isSameBox = (r1, c1, r2, c2) =>
    Math.floor(r1/3) === Math.floor(r2/3) && Math.floor(c1/3) === Math.floor(c2/3);

  const getCellStyle = (r, c) => {
    if (!board) return {};
    const val = board[r][c];
    const key = `${r}-${c}`;
    const isErr = errors.has(key);
    const isSel = selected && selected[0] === r && selected[1] === c;
    const isRelated = selected && (selected[0] === r || selected[1] === c || isSameBox(r, c, selected[0], selected[1]));
    const isSameVal = selected && val !== 0 && board[selected[0]][selected[1]] === val;
    const fixed = isFixed(r, c);

    let bg = 'transparent';
    if (isSel) bg = '#c8a96e';
    else if (isSameVal) bg = 'rgba(200, 169, 110, 0.35)';
    else if (isRelated) bg = 'rgba(255,255,255,0.05)';

    return {
      background: bg,
      color: isErr ? '#e05c5c' : fixed ? '#f0ead8' : '#c8a96e',
      fontWeight: fixed ? '700' : '500',
      opacity: val === 0 && !isSel ? 0.9 : 1,
    };
  };

  if (!board) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f0e0b',color:'#c8a96e',fontFamily:'serif',fontSize:'1.5rem'}}>Loading…</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0e0b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: '20px',
      userSelect: 'none',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=EB+Garamond:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .cell-btn:hover { filter: brightness(1.15); }
        .num-btn:hover { background: rgba(200,169,110,0.2) !important; }
        .num-btn:active { transform: scale(0.93); }
        .diff-btn:hover { border-color: #c8a96e !important; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ color: 'rgba(200,169,110,0.4)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '4px', fontFamily:"'EB Garamond', serif" }}>
          The Daily
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 700,
          color: '#f0ead8',
          margin: 0,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}>SUDOKU</h1>
        <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, #c8a96e, transparent)', marginTop: '12px' }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '20px', alignItems: 'center' }}>
        {/* Difficulty */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {Object.keys(DIFFICULTIES).map(d => (
            <button key={d} className="diff-btn" onClick={() => { setDifficulty(d); startGame(d); }} style={{
              background: difficulty === d ? 'rgba(200,169,110,0.15)' : 'transparent',
              border: `1px solid ${difficulty === d ? '#c8a96e' : 'rgba(200,169,110,0.25)'}`,
              color: difficulty === d ? '#c8a96e' : 'rgba(200,169,110,0.5)',
              padding: '4px 10px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: "'EB Garamond', serif",
              transition: 'all 0.2s',
            }}>{d}</button>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(200,169,110,0.2)' }} />

        <div style={{ color: '#c8a96e', fontSize: '1.1rem', fontFamily:"'Playfair Display', serif", letterSpacing: '0.1em' }}>
          {formatTime(timer)}
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(200,169,110,0.2)' }} />

        <div style={{ color: mistakes >= 3 ? '#e05c5c' : 'rgba(200,169,110,0.6)', fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily:"'EB Garamond', serif" }}>
          ✕ {mistakes} mistakes
        </div>
      </div>

      {/* Win Banner */}
      {won && (
        <div style={{
          background: 'rgba(200,169,110,0.12)',
          border: '1px solid rgba(200,169,110,0.5)',
          borderRadius: '4px',
          padding: '12px 28px',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#c8a96e',
          fontFamily: "'Playfair Display', serif",
          fontSize: '1rem',
          letterSpacing: '0.05em',
        }}>
          Puzzle Solved — {formatTime(timer)} · {mistakes} mistake{mistakes !== 1 ? 's' : ''}
        </div>
      )}

      {/* Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 1fr)',
        border: '2px solid #c8a96e',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(200,169,110,0.08), 0 20px 60px rgba(0,0,0,0.8)',
        width: 'min(90vw, 450px)',
        aspectRatio: '1',
      }}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const key = `${r}-${c}`;
            const cellNotes = notes[key];
            const style = getCellStyle(r, c);
            const borderR = c === 2 || c === 5 ? '2px solid rgba(200,169,110,0.7)' : '1px solid rgba(200,169,110,0.15)';
            const borderB = r === 2 || r === 5 ? '2px solid rgba(200,169,110,0.7)' : '1px solid rgba(200,169,110,0.15)';

            return (
              <button
                key={key}
                className="cell-btn"
                onClick={() => setSelected([r, c])}
                style={{
                  ...style,
                  border: 'none',
                  borderRight: borderR,
                  borderBottom: borderB,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)',
                  fontFamily: "'Playfair Display', serif",
                  transition: 'background 0.1s',
                  position: 'relative',
                  padding: 0,
                  aspectRatio: '1',
                }}
              >
                {val !== 0 ? val : (
                  cellNotes && cellNotes.size > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', width: '90%', height: '90%', gap: '0' }}>
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <span key={n} style={{ fontSize: 'clamp(0.35rem, 0.8vw, 0.45rem)', color: 'rgba(200,169,110,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                          {cellNotes.has(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: 'min(90vw, 450px)' }}>
        {/* Number pad */}
        <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center' }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="num-btn" onClick={() => handleInput(n)} style={{
              flex: 1,
              aspectRatio: '1',
              background: 'rgba(200,169,110,0.07)',
              border: '1px solid rgba(200,169,110,0.2)',
              borderRadius: '3px',
              color: '#f0ead8',
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              fontFamily: "'Playfair Display', serif",
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{n}</button>
          ))}
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button className="num-btn" onClick={() => handleInput(0)} style={{
            flex: 1,
            padding: '8px',
            background: 'rgba(200,169,110,0.07)',
            border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: '3px',
            color: 'rgba(200,169,110,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'EB Garamond', serif",
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>Erase</button>

          <button className="num-btn" onClick={() => setNoteMode(m => !m)} style={{
            flex: 1,
            padding: '8px',
            background: noteMode ? 'rgba(200,169,110,0.2)' : 'rgba(200,169,110,0.07)',
            border: `1px solid ${noteMode ? 'rgba(200,169,110,0.7)' : 'rgba(200,169,110,0.2)'}`,
            borderRadius: '3px',
            color: noteMode ? '#c8a96e' : 'rgba(200,169,110,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'EB Garamond', serif",
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>✎ Notes {noteMode ? 'On' : 'Off'}</button>

          <button className="num-btn" onClick={() => startGame()} style={{
            flex: 1,
            padding: '8px',
            background: 'rgba(200,169,110,0.07)',
            border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: '3px',
            color: 'rgba(200,169,110,0.7)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "'EB Garamond', serif",
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>New Game</button>
        </div>
      </div>

      <div style={{ marginTop: '16px', color: 'rgba(200,169,110,0.25)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily:"'EB Garamond', serif" }}>
        Arrow keys · 1–9 to fill · N to toggle notes
      </div>
    </div>
  );
}
