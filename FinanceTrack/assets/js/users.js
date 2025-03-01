$(document).ready(function () {
  const apiBaseUrl = "https://localhost:44310/api/User";
  let currentPage = 1;
  let pageSize = 10; // Page size for each fetch
  let totalCount = 0;

  // Fetch Users and Populate Table
  function fetchUsers(page) {
    $.ajax({
      url: apiBaseUrl + `/GetPaginatedUsers?page=${page}&pageSize=${pageSize}`,
      method: "GET",
      success: function (response) {
        if (response.StatusCode === 200) {
          renderUserTable(response.Users);
          totalCount = response.TotalCount;
          currentPage = response.CurrentPage;
          updatePagination();
        } else {
          alert("Failed to fetch users.");
        }
      },
      error: function () {
        alert("Failed to fetch users.");
      },
    });
  }

  function renderUserTable(users) {
    const tableBody = $("#userTable tbody");
    tableBody.empty(); // Clear the existing rows
    if (users.length === 0) {
      tableBody.append("<tr><td colspan='4'>No users available.</td></tr>");
    } else {
      users.forEach((user) => {
        tableBody.append(`
                    <tr>
                        <td>${user.Id}</td>
                        <td>${user.Email}</td>
                        <td>${user.Contact}</td>
                        <td>
                            <span class="delete-btn" onclick="deleteUser(${user.Id})">
                                🗑️ Delete
                            </span>
                        </td>
                    </tr>
                `);
      });
    }
  }

  // Delete User
  window.deleteUser = function (userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      $.ajax({
        url: apiBaseUrl + "/DeletePageUser?id=" + userId,
        method: "DELETE",
        success: function () {
          alert("User deleted successfully!");

          // Check if it's the last item on the page
          if ($("#userTable tbody tr").length === 1 && currentPage > 1) {
            // If it's the last item and not on the first page, go to the previous page
            fetchUsers(currentPage - 1);
          } else {
            // Otherwise, refresh the current page
            fetchUsers(currentPage);
          }
        },
        error: function () {
          alert("Failed to delete user.");
        },
      });
    }
  };

  // Open Modal for Create User
  $("#createUserBtn").click(function () {
    $("#createUserModal").show();
  });

  // Submit New User
  $("#createUserForm").submit(function (e) {
    e.preventDefault();
    const formData = {
      Email: $("#userEmail").val(),
      Contact: $("#userContact").val(),
    };
    $.ajax({
      url: apiBaseUrl + "/CreatePageUser",
      method: "POST",
      data: JSON.stringify(formData),
      contentType: "application/json",
      success: function () {
        alert("User created successfully!");
        $('#createUserForm')[0].reset(); // Clears the form
        $("#createUserModal").hide();
        fetchUsers(currentPage); // Refresh current page
      },
      error: function () {
        alert("Failed to create user.");
      },
    });
  });

  // Update Pagination UI
  function updatePagination() {
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginationContainer = $(".pagination");
    paginationContainer.empty();

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    // First page
    if (startPage > 1) {
      paginationContainer.append('<span class="dots">...</span>');
    }

    // Page Numbers
    for (let i = startPage; i <= endPage; i++) {
      paginationContainer.append(`
                <button class="page-btn ${
                  i === currentPage ? "active" : ""
                }" data-page="${i}">${i}</button>
            `);
    }

    // Last page
    if (endPage < totalPages) {
      paginationContainer.append('<span class="dots">...</span>');
    }

    // Event for Page Buttons
    $(".page-btn").click(function () {
      const selectedPage = $(this).data("page");
      fetchUsers(selectedPage);
    });
  }

  // Fetch Users on Initial Load
  fetchUsers(currentPage);
});
