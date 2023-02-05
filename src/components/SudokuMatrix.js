import React, { useState } from 'react';

const generateSudokuMatrix = (numZeros) => {
  
   const matrix = [
    [
      [2, 9, 5, 7, 4, 3, 8, 6, 1],
      [4, 3, 1, 8, 6, 5, 9, 2, 7],
      [8, 7, 6, 1, 9, 2, 5, 4, 3],
      [3, 8, 7, 4, 5, 9, 2, 1, 6],
      [6, 1, 2, 3, 8, 7, 4, 9, 5],
      [5, 4, 9, 2, 1, 6, 7, 3, 8],
      [7, 6, 3, 5, 2, 4, 1, 8, 9],
      [9, 2, 8, 6, 7, 1, 3, 5, 4],
      [1, 5, 4, 9, 3, 8, 6, 7, 2]
    ],
    [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ],
    [
      [ 3, 1, 6, 5, 7, 8, 4, 9, 2 ],
      [ 5, 2, 9, 1, 3, 4, 7, 6, 8 ],
      [ 4, 8, 7, 6, 2, 9, 5, 3, 1 ],
      [ 2, 6, 3, 0, 1, 5, 9, 8, 7 ],
      [ 9, 7, 4, 8, 6, 0, 1, 2, 5 ],
      [ 8, 5, 1, 7, 9, 2, 6, 4, 3 ],
      [ 1, 3, 8, 0, 4, 7, 2, 0, 6 ],
      [ 6, 9, 2, 3, 5, 1, 8, 7, 4 ],
      [ 7, 4, 5, 0, 8, 6, 3, 1, 0 ]
    ]];

    let SudokuMatrix = matrix[numZeros];
    
  let count = 0;
  while (count < 35) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (SudokuMatrix[row][col] !== 0) {
      SudokuMatrix[row][col] = 0;
      count++;
    }
  }
  return SudokuMatrix;
};

   /* Sudoku Solver Part */
   
   
    const isSolveSafe = (r,c,arr,value) => {
    for (let i = 0; i < 9; i++) {
      if(arr[r][i]===value && i!==c){
        return false;
      }
      if(arr[i][c]===value && i!==r){
        return false;
      }
    }
    let r1 = Math.floor(r / 3) * 3;
    let c1 = Math.floor(c / 3) * 3;
    for (let rr = r1; rr < r1 + 3; ++rr) {
        for (let cc = c1; cc < c1 + 3; ++cc) {
            if (arr[rr][cc] === value) return false;
        }
    }
    return true;
  }

  const solveSudoku = (sudokuArr) => {
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(sudokuArr[i][j]===0){
                for(let n=1;n<=9;n++){
                    if(isSolveSafe(i,j,sudokuArr,n)){
                        sudokuArr[i][j] = n;
                        if(solveSudoku(sudokuArr)){
                            return true;
                        }
                        sudokuArr[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }
   return true;
   }

  

    /* Sudoku Solver Part */

  const SudokuMatrix = () => {
  const [matrix, setMatrix] = useState(generateSudokuMatrix(Math.floor(Math.random() * 9)%3));
  const [matrixcopy, setMatrixCopy] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]);

  const[row,setRow] = useState(0);
  const[col,setCol] = useState(0);
  const[w_row,setWrongRow] = useState([]);
  const[w_col,setWrongCol] = useState([]);

  const getCellStyle = (row_color,col_color) => {
    let color = "black";
    
    for(let i=0;i<w_row.length;i++)
    {
      if (row_color===w_row[i] && col_color===w_col[i]) {
        color = "red";
      }
    }
    return {
      color: color
    };
  };
  const handleClick = (i, j) => {
    setRow(i);
    setCol(j);
  };
    
   const isSafe = (r,c,value) =>{
    for (let i = 0; i < 9; i++) {
      //console.log(matrix[r][i]);
      if(matrix[r][i]===value && i!==c){
        const rw = [...w_row];
        const cw = [...w_col];
        rw.push(r);
        cw.push(c);
        setWrongCol(cw);
        setWrongRow(rw);
        return false;
      }
      if(matrix[i][c]===value && i!==r){
        const rw = [...w_row];
        const cw = [...w_col];
        rw.push(r);
        cw.push(c);
        setWrongCol(cw);
        setWrongRow(rw);
        return false;
      }
    }
    let r1 = Math.floor(r / 3) * 3;
    let c1 = Math.floor(c / 3) * 3;
    for (let rr = r1; rr < r1 + 3; ++rr) {
        for (let cc = c1; cc < c1 + 3; ++cc) {
            if (matrix[rr][cc] == value){ 
              const rw = [...w_row];
              const cw = [...w_col];
              rw.push(r);
              cw.push(c);
              setWrongCol(cw);
              setWrongRow(rw);
              return false;
            }
        }
    }
    const indexOfRow = w_row.indexOf(r);
    const indexOfColumn = w_col.indexOf(c);
    if (indexOfRow > -1 && indexOfColumn > -1) { // only splice array when item is found
      w_row.splice(indexOfRow, 1); // 2nd parameter means remove one item only
      w_col.splice(indexOfColumn,1);
    }
    return true;
  };

   function printNumber(v) {
    const newMatrix = [...matrix];
    newMatrix[row][col] = v;
    setMatrix(newMatrix);
    isSafe(row,col,v);
  };

  return (
   <div>
    <div className="matrix">
        <table>
              <tbody>
                  {matrix.map((row, i) =>(
                      <tr key = {i}>
                          {row.map((col, j) => (
                              <td key = {j} onClick={() => handleClick(i, j)} style={getCellStyle(i,j)} className="matrix-cell wrapper">
                                    {col===0 ? "" : col}
                              </td>
                          ))}
                      </tr>
                  ))}
              </tbody>
          </table>
       </div>
       <button onClick={() => printNumber(1)}>1</button>
       <button onClick={() => printNumber(2)}>2</button>
       <button onClick={() => printNumber(3)}>3</button>
       <button onClick={() => printNumber(4)}>4</button>
       <button onClick={() => printNumber(5)}>5</button>
       <button onClick={() => printNumber(6)}>6</button>
       <button onClick={() => printNumber(7)}>7</button>
       <button onClick={() => printNumber(8)}>8</button>
       <button onClick={() => printNumber(9)}>9</button>
    </div>
  );
};

export default SudokuMatrix;
