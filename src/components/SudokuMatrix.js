import React, { useState } from 'react';
import MatrixSolver from './MatrixSolver';

const generateSudokuMatrix = (numZeros) => {
  const matrix = Array(9).fill().map(() => Array(9).fill(0));

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      matrix[i][j] = (Math.random() > 0.5) ? (i * 3 + j + 1) % 9 + 1 : 0;
    }
  }

  let count = 0;
  while (count < numZeros) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (matrix[row][col] !== 0) {
      matrix[row][col] = 0;
      count++;
    }
  }

  return matrix;
};

  const SudokuMatrix = () => {
  const [matrix, setMatrix] = useState(generateSudokuMatrix(6));

  const generateMatrix = () => {
   setMatrix(generateSudokuMatrix(6));
  };

  return (
   <div>
    <button className="button-52" onClick={generateMatrix}>Generate Matrix</button>
   <div className="matrix">
      <table>
                <tbody>
                    {matrix.map((row, i) =>(
                        <tr key = {i}>
                            {row.map((col, j) => (
                                <td key = {j} className="matrix-cell wrapper">
                                     {col===0 ? "" : col}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
    </div>
    </div>
  );
};

export default SudokuMatrix;
