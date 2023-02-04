import React, { useState } from 'react';
const MatrixSolver = (props) => {

    const [matrix, setMatrix] = useState(props.matrix);

    return(
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
    );
}

export default MatrixSolver;