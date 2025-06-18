// import React, { useEffect, useState } from "react";

// export default function Students() {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
// const token = localStorage.getItem("authToken");

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:3000/api/progress/students/${courseId}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
        
//         if (!response.ok) {
//           throw new Error("Failed to fetch students");
//         }

//         const data = await response.json();
//         setStudents(data);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, [courseId]);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div>
//       <h2>Students Progress</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Avatar</th>
//             <th>Full Name</th>
//             <th>Status</th>
//             <th>Progress (%)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((student) => (
//             <tr key={student.student._id}>
//               <td>
//                 <img
//                   src={student.student.avatar}
//                   alt="Avatar"
//                   width="50"
//                   height="50"
//                   style={{ borderRadius: "50%" }}
//                 />
//               </td>
//               <td>{student.student.fullname}</td>
//               <td>{student.status}</td>
//               <td>{student.percent.toFixed(2)}%</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


import React from 'react'

export default function Students() {
  return (
    <div>

        <h2>Students Progress</h2>
        
      
    </div>
  )
}
