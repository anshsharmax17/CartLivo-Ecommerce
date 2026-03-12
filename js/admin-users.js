async function loadUsers() {
  const token = localStorage.getItem("authToken");

  const res = await fetch("http://localhost:5000/api/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const users = await res.json();

  const table = document.getElementById("userTable");
  table.innerHTML = "";

  users.forEach(user => {
    table.innerHTML += `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
      </tr>
    `;
  });
}

loadUsers();