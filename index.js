
function sayHii(){
  console.log("hii script ");
}

sayHii();


// <!-- The script manages the behavior of a sidebar navigation menu, user selection through checkboxes, and dynamically toggles the visibility of sections on a webpage. Here's a breakdown of its functionality: -->
  document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".sidebar .nav-link");
  const sections = {
    "clients-section": document.getElementById("clients-section"),
    "leads-section": document.getElementById("leads-section"),
    "roles-section": document.getElementById("roles-section"),
    "HR-Mails-section": document.getElementById("HR-Mails-section"),
    "Marketing-section": document.getElementById("Marketing-section"),
    "create-testimonial": document.getElementById("create-testimonial"),
  };
  const selectedUsersDiv = document.getElementById("selected-users"); // The selected-users section
  const userCheckboxes = document.querySelectorAll(".user-checkbox");
  const selectAllCheckbox = document.getElementById("select-all");
  const selectedUsersList = document.getElementById("selected-user-list");
  const selectedUsersInput = document.getElementById("selected-users-input");
  let selectedUsers = [];

  // Initially hide the selected-users section
  selectedUsersDiv.style.display = "none";

  // Function to handle section switching
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove 'active' class from all links
      navLinks.forEach((link) => link.classList.remove("active"));
      this.classList.add("active");

      // Hide all sections
      Object.keys(sections).forEach((key) => (sections[key].style.display = "none"));

      // Show the clicked section
      const targetSection = this.getAttribute("data-target");
      sections[targetSection].style.display = "block";

      // Ensure Selected Users section is visible only in the Leads section
      if (targetSection === "leads-section" && selectedUsers.length > 0) {
        selectedUsersDiv.style.display = "block";
      } else {
        selectedUsersDiv.style.display = "none";
      }
    });
  });

  // Function to update the visibility and content of the selected-users section
  function updateSelectedUsers() {
    selectedUsersList.innerHTML = ""; // Clear the list

    if (selectedUsers.length > 0) {
      const activeSection = document.querySelector(".sidebar .nav-link.active").getAttribute("data-target");
      if (activeSection === "leads-section") {
        selectedUsersDiv.style.display = "block"; // Show the section
      }
      selectedUsers.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.name} (${user.email})`;
        selectedUsersList.appendChild(li);
      });
      selectedUsersInput.value = JSON.stringify(selectedUsers.map((user) => user.email));
    } else {
      selectedUsersDiv.style.display = "none"; // Hide the section
    }
  }

  // Handle Select All functionality
  selectAllCheckbox.addEventListener("change", function () {
    selectedUsers = []; // Reset the array
    userCheckboxes.forEach((checkbox) => {
      checkbox.checked = this.checked;
      if (this.checked) {
        selectedUsers.push({
          email: checkbox.value,
          name: checkbox.getAttribute("data-name"),
        });
      }
    });
    updateSelectedUsers(); // Update UI
  });

  // Handle individual checkbox change
  userCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const userEmail = this.value;
      const userName = this.getAttribute("data-name");

      if (this.checked) {
        selectedUsers.push({
          email: userEmail,
          name: userName,
        });
      } else {
        selectedUsers = selectedUsers.filter((user) => user.email !== userEmail);
      }

      updateSelectedUsers(); // Update UI
    });
  });
});


// <!-- Uploading an Email Template, Sending Marketing Emails, Dynamically Handling Email Sending for Table Rows: -->

  document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("upload-template-form2");
    const templateNameInput = document.getElementById("template-name2");
    const templateKeyInput = document.getElementById("template-key2");
  
    uploadForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Prevent the default form submission
  
      // Create a FormData object to handle the file and form inputs
      const formData = new FormData();
      formData.append("name", templateNameInput.value);
      formData.append("key", templateKeyInput.value);
  
      // Send the form data using fetch
     
      fetch("/add_email_template", {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert("Template uploaded successfully!");
  
          } else {
            alert("Failed to upload template: " + data.message);
          }
        })
        .catch(error => {
          console.error("Error uploading template:", error);
          alert("An error occurred while uploading the template.");
        });
    });
  });
  document.getElementById("send-marketing-mail").addEventListener("click", async (event) => {
    event.preventDefault();
  
    const form = document.getElementById("send-email-form");
    const fileInput = document.getElementById("file");
    const templateSelect = document.getElementById("template-select2");
    const responseMessage = document.getElementById("response-message");
  
    // Validate inputs
    if (!fileInput.files.length) {
      alert("Please select an Excel file.");
      return;
    }
  
    if (!templateSelect.value) {
      alert("Please select an email template.");
      return;
    }
  
    // Get the selected option text
    const selectedTemplateName = templateSelect.options[templateSelect.selectedIndex].text;
  
    // Create FormData object
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("template_id", templateSelect.value); // Template key
    formData.append("template_name", selectedTemplateName); // Template name
  
    console.log("Selected Template:", selectedTemplateName);
  
    try {
      // Send POST request to the Flask backend
      const response = await fetch("/marketing/send_emails", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      // Handle the response
      if (response.ok) {
        responseMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        console.log("Emails sent to:", data.emails);
      } else {
        responseMessage.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
      }
    } catch (error) {
      console.error("Error:", error);
      responseMessage.innerHTML = `<div class="alert alert-danger">Failed to send emails. Please try again later.</div>`;
    }
  });
 

  // Dynamically handle "Send Email" button click for table rows
  document.querySelector('#file-list').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.innerText === 'Send Email') {
      const row = event.target.closest('tr'); // Get the current table row
      const filename = row.querySelector('td').innerText.trim(); // First cell contains filename
      const templateSelect = row.querySelector('select[name="template_id"]'); // Dropdown in the same row
      const templateId = templateSelect.value; // Get selected template ID
      const templateName = templateSelect.options[templateSelect.selectedIndex]?.text; // Get template name

      // Validate if a template is selected
      if (!templateId) {
        alert('Please select a template before sending emails.');
        return;
      }

      // Create FormData to send to the server
      const formData = new FormData();
      formData.append('filename', filename); // Add filename
      formData.append('template_id', templateId); // Add selected template ID
      formData.append('template_name', templateName); // Add selected template name

      // Make the POST request to send emails
      fetch('/marketing/send_emails', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(`Error: ${data.error}`);
          } else {
            alert('Emails sent successfully.');
          }
        })
        .catch((error) => {
          console.error('Error sending emails:', error);
          alert('An error occurred while sending emails.');
        });
    }
  });

 
        
// <!-- JavaScript for New Entry -->

  // Array to track input rows
  let inputRows = [];

  // New Entry button click handler
  document.getElementById("new-entry-btn").addEventListener("click", function () {
    const tableBody = document.querySelector("#hr-mails-table tbody");

    // Create a new row for input
    const newRow = document.createElement("tr");
    newRow.classList.add("input-row");

    // Create input fields for Name, Company, Email, and Status
    newRow.innerHTML = `
      <td><input type="text" name="name" placeholder="Enter Name" required></td>
      <td><input type="text" name="company" placeholder="Enter Company" required></td>
      <td><input type="email" name="email" placeholder="Enter Email" required></td>
      <td><input type="text" name="status" value="Active" required></td>
      <td>
        <button class="btn btn-sm btn-success add-btn" onclick="addNewEntry(this)" style="background: none; border: none; padding: 0;">
          <i class="bi bi-person-fill-add" style="color: #28a745; font-size: 18px;"></i>
        </button>
      </td>
    `;





    // Insert the new row at the top of the table body
    tableBody.insertBefore(newRow, tableBody.firstChild);

    // Track the input row and show the Undo button
    inputRows.push(newRow);
    document.getElementById("undo-btn").style.display = "inline-block";
  });

  // Undo button click handler
  document.getElementById("undo-btn").addEventListener("click", function () {
    if (inputRows.length > 0) {
      const lastInputRow = inputRows.pop();
      lastInputRow.remove();
    }

    if (inputRows.length === 0) {
      this.style.display = "none";
    }
  });

  // Function to handle the "Add" button click
  // Function to handle the "Add" button click
function addNewEntry(button) {
  const row = button.closest("tr");

  // Extract input values
  const name = row.querySelector('input[name="name"]').value;
  const company = row.querySelector('input[name="company"]').value;
  const email = row.querySelector('input[name="email"]').value;
  const status = row.querySelector('input[name="status"]').value;

  // Validate inputs
  if (!name || !company || !email) {
    alert("Please fill in all fields.");
    return;
  }

  // Prepare data for submission
  const data = { name, company, email, status };

  // Send the data to the Flask route
  fetch("/add_hr_entry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message) {
        alert("New entry added successfully!");

        // Add the new entry to the table without reloading the page
        const tableBody = document.querySelector("#hr-mails-table tbody");
        const newEntryRow = document.createElement("tr");

        // Create the new row content with the same format as existing rows
        newEntryRow.innerHTML = `
          <td>${name}</td>
          <td>${company}</td>
          <td>
            ${email}
            <button class="copy-btn" onclick="copyToClipboard('${email}')">Copy</button>
          </td>
          <td>${status}</td>
          <td>
            <form action="/delete_email/${email}" method="post" style="margin-bottom: 20px;">
              <button class="delete-btn" type="submit">
              <i class="bi bi-trash-fill" style="color: #dc3545; font-size: 18px;"></i>
              </button>
            </form>
          </td>
        `;

        // Insert the new entry row at the top of the table body
        tableBody.insertBefore(newEntryRow, tableBody.firstChild);

        // Remove the input row and clear the inputRows array
        row.remove();
        inputRows = []; // Clear the input rows tracking array

        // Hide the Undo button if no input rows remain
        document.getElementById("undo-btn").style.display = "none";
      } else {
        alert(result.error || "Failed to add new entry.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    });
}




// <!-- JavaScript for Search and Copy Functionality -->

// Function to filter the table based on search input
function filterTable() {
const searchValue = document.getElementById("search-bar").value.toLowerCase();
const table = document.getElementById("hr-mails-table");
const rows = table.getElementsByTagName("tr");

// Loop through all table rows and hide those that do not match the search query
for (let i = 1; i < rows.length; i++) {
  const companyCell = rows[i].getElementsByTagName("td")[1];
  if (companyCell) {
    const companyName = companyCell.textContent || companyCell.innerText;
    rows[i].style.display = companyName.toLowerCase().includes(searchValue) ? "" : "none";
  }
}
}





// <!-- focuses on user selection management, dynamic updates of a user list, and AJAX-based email sending. It also includes a utility function for copying email addresses to the clipboard. Here's a breakdown: -->

document.addEventListener('DOMContentLoaded', function () {
  const selectAllCheckbox = document.getElementById('select-all');
  const userCheckboxes = document.querySelectorAll('.user-checkbox');
  const selectedUsersList = document.getElementById('selected-user-list');
  const selectedUsersInput = document.getElementById('selected-users-input');
  const selectedUsersDiv = document.getElementById('selected-users');
  let selectedUsers = [];

  // Select All functionality
  selectAllCheckbox.addEventListener('change', function () {
    selectedUsers = [];
    userCheckboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
      if (this.checked) {
        selectedUsers.push({ email: checkbox.value, name: checkbox.getAttribute('data-name') });
      }
    });
    updateSelectedUsers();
  });

  // Handle individual checkbox click
  userCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      const userEmail = this.value;
      const userName = this.getAttribute('data-name');
      if (this.checked) {
        selectedUsers.push({ email: userEmail, name: userName });
      } else {
        selectedUsers = selectedUsers.filter(user => user.email !== userEmail);
      }
      updateSelectedUsers();
    });
  });

  // Update the UI with selected users
  function updateSelectedUsers() {
    selectedUsersList.innerHTML = '';
    if (selectedUsers.length > 0) {
      selectedUsersDiv.style.display = 'block';
      selectedUsers.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email})`;
        selectedUsersList.appendChild(li);
      });
      selectedUsersInput.value = JSON.stringify(selectedUsers.map(user => user.email));
    } else {
      selectedUsersDiv.style.display = 'none';
    }
  }

  // AJAX form submission
  const form = document.getElementById('send-email-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    fetch('/send_template_email', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Emails sent successfully!');
        } else {
          alert('Error sending emails.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});
    function copyToClipboard(email) {
      navigator.clipboard.writeText(email).then(() => {
        alert("Email copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy: ", err);
      });
    }



// <!-- modal to display user email logs fetched from a server. -->

// Modal Elements
const userLogsModal = document.getElementById('userLogsModal');
const modalClose = document.querySelector('.modal-close');
const logsTableBody = document.getElementById('logsTableBody');

// Function to view user logs
async function viewUserLogs(userEmail) {
try {
  // Make API call to fetch logs for the specific user
  const response = await fetch(`/get_email_logs`);
  const data = await response.json();

  if (data.success) {
    populateLogsTable(data.logs);
    userLogsModal.classList.add('show-modal');
  } else {
    alert('Failed to fetch user logs');
  }
} catch (error) {
  console.error('Error fetching user logs:', error);
  alert('Error fetching user logs');
}
}

// Populate Logs Table
function populateLogsTable(logs) {
logsTableBody.innerHTML = ''; // Clear existing rows
logs.forEach(log => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${log.email}</td>
    <td>${log.status}</td>
    <td>${log.template_id}</td>
    <td>${log.timestamp}</td>
  `;
  logsTableBody.appendChild(row);
});
}

// Close Modal
modalClose.addEventListener('click', () => {
userLogsModal.classList.remove('show-modal');
});

// Close modal if clicked outside the modal content
userLogsModal.addEventListener('click', (event) => {
if (event.target === userLogsModal) {
  userLogsModal.classList.remove('show-modal');
}
});


// <!-- The script dynamically populates an HTML list with items using JavaScript. Here’s a breakdown of its functionality: -->

// Example function to populate the list
function populateList(items) {
  const list = document.querySelector('.scroll-list');
  list.innerHTML = ''; // Clear existing items
  
  items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
  });
}

// Example usage
const sampleItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
populateList(sampleItems);



// // <!-- The script is a JavaScript program designed to:
// Fetch email templates from a server.
// Populate multiple dropdown menus (<select> elements) with these templates.
// Handle a form submission to send an email using the selected template and specified users. -->



// TODO : write code in such a way so we dont have to repeat line of code 
document.addEventListener("DOMContentLoaded", () => {
const templateSelect = document.getElementById("template-select");
const templateSelect2 = document.getElementById("template-select2");
const sendEmailButton = document.getElementById("send-email-button");
const selectedUsersInput = document.getElementById("selected-users-input");

// Fetch templates from the API
fetch('/get_email_templates')
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }
    return response.json();
  })
  .then(data => {
    if (data.success && Array.isArray(data.templates)) {
      // Clear existing options for both selects
      templateSelect.innerHTML = '<option value="" disabled selected>Select a template</option>';
      templateSelect2.innerHTML = '<option value="" disabled selected>Select a template</option>';
      templateSelect3.innerHTML = '<option value="" disabled selected>Select a template</option>';

      // Populate both dropdowns with templates
      data.templates.forEach(template => {
        const option1 = document.createElement("option");
        const option2 = document.createElement("option");
        const option3 = document.createElement("option");

        option1.value = template.key;
        option1.textContent = template.name;
        templateSelect.appendChild(option1);
        console.log("child appedned : " , templateSelect);
        
        option2.value = template.key;
        option2.textContent = template.name;
        templateSelect2.appendChild(option2);
        console.log("child appedned : " , templateSelect2);


        option3.value = template.key;
        option3.textContent = template.name;
        // templateSelect3.appendChild(option3);
      });
    } else {
      console.error("Invalid template data received");
    }
  })
  .catch(error => {
    console.error("Error loading templates:", error);
  });

  function fetchTemplates() {
fetch('/get_email_templates')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const options = data.templates
        .map(template => `<option value="${template.key}">${template.name}</option>`)
        .join('');
      document.querySelectorAll("select[name='template_id']").forEach(select => {
        select.innerHTML = '<option value="" disabled selected>Select a template</option>' + options;
      });
    }
  })
  .catch(console.error);
}
fetchTemplates()

// Handle form submission
sendEmailButton.addEventListener("click", () => {
  const templateId = templateSelect.value ;
  
  const selectedUsers = JSON.parse(selectedUsersInput.value);

  if (!templateId) {
    alert("Please select a template.");
    return;
  }

  // Prepare JSON payload
  const payload = {
    template_id: templateId,
    selected_users: selectedUsers
  };

  // Send the request via fetch
  fetch('/send_template_email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Email sent successfully.");
      } else {
        alert("Failed to send email: " + data.message);
      }
    })
    .catch(error => {
      console.error("Error sending email:", error);
      alert("An error occurred while sending the email.");
    });
});
});


 
// <!-- The provided script uses async/await for a fetch request within an event listener. However, await needs to be within an async function,  -->

document.addEventListener("DOMContentLoaded", () => {
const uploadForm = document.getElementById("upload-template-form2");
const templateNameInput = document.getElementById("template-name2");
const templateKeyInput = document.getElementById("template-key2");

uploadForm.addEventListener("submit", (event) => {
event.preventDefault(); // Prevent the default form submission

// Get the template name and key values
const templateName = templateNameInput.value.trim();
const templateKey = templateKeyInput.value.trim();

if (!templateName || !templateKey) {
  alert("Please fill out all fields.");
  return;
}

// Create a FormData object to handle the file and form inputs
const formData = new FormData();
formData.append("name", templateName);
formData.append("key", templateKey);

// Log the form data for debugging (optional)
console.log("FormData contents:", [...formData.entries()]);

  try {
    // Send the request to upload the template
    const response = await fetch('/add_email_template1', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert("Template uploaded successfully.");
    } else {
      alert("Failed to upload template: " + data.message);
    }
  } catch (error) {
    console.error("Error uploading template:", error);
    alert("An error occurred while uploading the template.");
  }
});
});




// <!-- This script provides functionality to upload a template using an HTML button click event.        -->

document.addEventListener("DOMContentLoaded", () => {
const uploadButton = document.getElementById("upload-template-button");
const templateNameInput = document.getElementById("template-name");
const templateKeyInput = document.getElementById("template-key");

// Handle form submission
uploadButton.addEventListener("click", async () => {
  const templateName = templateNameInput.value.trim();
  const templateKey = templateKeyInput.value.trim();

  if (!templateName || !templateKey ) {
    alert("Please fill out all fields and select a file.");
    return;
  }

  // Prepare the FormData for file upload
  const formData = new FormData();
  formData.append("name", templateName);
  formData.append("key", templateKey);

  try {
    // Send the request to upload the template
    const response = await fetch('/add_email_template', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert("Template uploaded successfully.");
    } else {
      alert("Failed to upload template: " + data.message);
    }
  } catch (error) {
    console.error("Error uploading template:", error);
    alert("An error occurred while uploading the template.");
  }
});
});


// <!-- This script implements functionality to upload a template via a button click. It interacts with an HTML structure to collect user input, validate it, and send the data to a server using the fetch API. Here's a detailed explanation of the script: -->

document.addEventListener("DOMContentLoaded", () => {
const uploadButton = document.getElementById("upload-template-button");
const templateNameInput = document.getElementById("template-name");
const templateKeyInput = document.getElementById("template-key");

// Handle form submission
uploadButton.addEventListener("click", async () => {
  const templateName = templateNameInput.value.trim();
  const templateKey = templateKeyInput.value.trim();

  if (!templateName || !templateKey ) {
    alert("Please fill out all fields and select a file.");
    return;
  }

  // Prepare the FormData for file upload
  const formData = new FormData();
  formData.append("name", templateName);
  formData.append("key", templateKey);

  try {
    // Send the request to upload the template
    const response = await fetch('/add_email_template', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert("Template uploaded successfully.");
    } else {
      alert("Failed to upload template: " + data.message);
    }
  } catch (error) {
    console.error("Error uploading template:", error);
    alert("An error occurred while uploading the template.");
  }
});
});



// <!-- The script is a JavaScript program designed to upload template information via a button click. It collects user input, validates it, and sends the data to the server using the fetch API. Here's a detailed explanation of its functionality: -->

document.addEventListener("DOMContentLoaded", () => {
const uploadButton = document.getElementById("upload-template-button");
const templateNameInput = document.getElementById("template-name");
const templateKeyInput = document.getElementById("template-key");

// Handle form submission
uploadButton.addEventListener("click", async () => {
  const templateName = templateNameInput.value.trim();
  const templateKey = templateKeyInput.value.trim();

  if (!templateName || !templateKey ) {
    alert("Please fill out all fields and select a file.");
    return;
  }

  // Prepare the FormData for file upload
  const formData = new FormData();
  formData.append("name", templateName);
  formData.append("key", templateKey);

  try {
    // Send the request to upload the template
    const response = await fetch('/add_email_template', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert("Template uploaded successfully.");
    } else {
      alert("Failed to upload template: " + data.message);
    }
  } catch (error) {
    console.error("Error uploading template:", error);
    alert("An error occurred while uploading the template.");
  }
});
});


// <!-- The script is a JavaScript implementation designed to handle the upload of a template by gathering input data from an HTML form and sending it to the server. Here's a step-by-step explanation: -->

document.addEventListener("DOMContentLoaded", () => {
const uploadButton = document.getElementById("upload-template-button");
const templateNameInput = document.getElementById("template-name");
const templateKeyInput = document.getElementById("template-key");

// Handle form submission
uploadButton.addEventListener("click", async () => {
  const templateName = templateNameInput.value.trim();
  const templateKey = templateKeyInput.value.trim();

  if (!templateName || !templateKey ) {
    alert("Please fill out all fields and select a file.");
    return;
  }

  // Prepare the FormData for file upload
  const formData = new FormData();
  formData.append("name", templateName);
  formData.append("key", templateKey);

  try {
    // Send the request to upload the template
    const response = await fetch('/add_email_template', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert("Template uploaded successfully.");
    } else {
      alert("Failed to upload template: " + data.message);
    }
  } catch (error) {
    console.error("Error uploading template:", error);
    alert("An error occurred while uploading the template.");
  }
});
});


// <!-- Add a script to handle the toggle functionality for each row in the table: Approved -->

document.addEventListener("DOMContentLoaded", () => {
const toggleButtons = document.querySelectorAll(".status-toggle");

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const userId = button.getAttribute("data-user-id");
    const newState = button.classList.contains("off");

    // Update the button state
    button.classList.toggle("on", newState);
    button.classList.toggle("off", !newState);
    button.textContent = newState ? "APPROVED" : "NOT APPROVED";

    // Send the new state to the server
    fetch("/update_approval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approved: newState,
        user_id: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          alert("Failed to update approval status.");
          // Revert the button state if the server update fails
          button.classList.toggle("on", !newState);
          button.classList.toggle("off", newState);
          button.textContent = !newState ? "APPROVED" : "NOT APPROVED";
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        alert("An error occurred while updating approval status.");
        // Revert the button state if there's a network error
        button.classList.toggle("on", !newState);
        button.classList.toggle("off", newState);
        button.textContent = !newState ? "APPROVED" : "NOT APPROVED";
      });
  });
});
});




// <!-- The provided script dynamically toggles the status of a user when a button is clicked. It uses JavaScript's fetch API to communicate with the server and updates the button's text and styling based on the server's response. Here's a breakdown of its functionality: -->

document.querySelectorAll('.toggle-status').forEach(button => {
  button.addEventListener('click', function () {
      const userId = this.getAttribute('data-user-id');
      const currentButton = this;

      fetch(`/toggle_status/${userId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensure session cookie is sent
      })
      .then(response => response.json())
      .then(data => {
          if (data.new_status) {
              currentButton.textContent = data.new_status;
              currentButton.classList.toggle('btn-success', data.new_status === 'active');
              currentButton.classList.toggle('btn-danger', data.new_status === 'inactive');
          } else {
              alert(data.error || 'Failed to toggle status.');
          }
      })
      .catch(error => {
          console.error('Error:', error);
          alert('An error occurred while toggling the status.');
      });
  });
});




// <!-- below is the button script to show active clients -->

// Sorting functionality
document.getElementById("sort-button").addEventListener("click", function () {
const tableBody = document.querySelector("#clients-table tbody");
const rows = Array.from(tableBody.querySelectorAll("tr"));
const isAscending = this.classList.toggle("ascending");

// Sort rows by total_jobs
rows.sort((a, b) => {
  const aJobs = parseInt(a.querySelector("td:nth-child(4)").textContent.split('/')[0].trim());
  const bJobs = parseInt(b.querySelector("td:nth-child(4)").textContent.split('/')[0].trim());
  return isAscending ? aJobs - bJobs : bJobs - aJobs;
});

// Append sorted rows back to the table
rows.forEach(row => tableBody.appendChild(row));
});

// Filter functionality
document.getElementById("filter-active").addEventListener("click", function () {
const tableRows = document.querySelectorAll("#clients-table tbody tr");
const isFilterActive = this.classList.toggle("filter-active");

if (isFilterActive) {
  // Show only rows with status 'active'
  tableRows.forEach(row => {
    const status = row.querySelector(".status-column button").textContent.toLowerCase().trim();
    if (status !== "active") {
      row.style.display = "none";
    }
  });
} else {
  // Show all rows
  tableRows.forEach(row => {
    row.style.display = "";
  });
}
});
  

// <!-- The script implements functionality for a form submission process, which allows users to submit testimonials to a server. It uses async/await for handling asynchronous operations and provides real-time feedback to the user. -->

document.getElementById("testimonial-form").addEventListener("submit", async function (e) {
e.preventDefault();

const form = document.getElementById("testimonial-form");
const responseMessage = document.getElementById("response-message");

// Collect form data
const formData = new FormData(form);

try {
  // Send API request
  const response = await fetch("/create_testimonial", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  // Handle response
  if (response.ok) {
    responseMessage.className = "message success";
    responseMessage.textContent = data.message;
    responseMessage.style.backgroundColor = "#d4edda";
    responseMessage.style.color = "#155724";

    // Reset form after successful submission
    form.reset();
  } else {
    responseMessage.className = "message error";
    responseMessage.textContent = data.error || "An error occurred.";
    responseMessage.style.backgroundColor = "#f8d7da";
    responseMessage.style.color = "#721c24";
  }

  // Show the response message
  responseMessage.style.display = "block";

  // Hide the message after 5 seconds
  setTimeout(() => {
    responseMessage.style.display = "none";
  }, 5000);
} catch (error) {
  // Handle unexpected errors
  responseMessage.className = "message error";
  responseMessage.textContent = "An unexpected error occurred.";
  responseMessage.style.backgroundColor = "#f8d7da";
  responseMessage.style.color = "#721c24";
  responseMessage.style.display = "block";

  // Hide the message after 5 seconds
  setTimeout(() => {
    responseMessage.style.display = "none";
  }, 5000);
}
});



// <!-- This script handles the deletion of emails from a form by requiring a user to provide a reason before confirming the deletion. It prevents duplicate submissions, sends the reason to the server, and provides feedback to the user. Below is the same functionality written in a streamlined and clear way. -->

document.addEventListener("DOMContentLoaded", function () {
// Select all delete-email forms
document.querySelectorAll(".delete-email-form").forEach((form) => {
  const deleteButton = form.querySelector(".delete-btn"); // Delete button
  const reasonInput = form.querySelector(".reason-input"); // Reason input field
  const confirmButton = form.querySelector(".confirm-btn"); // Confirm button

  // Variable to track if a request is already in progress
  let isProcessing = false;

  // Attach a click event to the delete button
  deleteButton.addEventListener("click", function (event) {
    event.preventDefault();

    // Show the reason input and confirm button
    reasonInput.style.display = "inline-block";
    confirmButton.style.display = "inline-block";

    // Hide the delete button
    deleteButton.style.display = "none";

    // Focus on the reason input
    reasonInput.focus();
  });

  // Attach a click event to the confirm button
  confirmButton.addEventListener("click", async function (event) {
    event.preventDefault();

    // Prevent multiple clicks
    if (isProcessing) return;
    isProcessing = true;

    const email = form.querySelector('input[name="email"]').value; // Get email
    const reason = reasonInput.value.trim(); // Get reason

    if (!reason) {
      alert("A reason is required to delete the email.");
      isProcessing = false; // Allow retry
      return;
    }

    // Disable the confirm button to prevent duplicate clicks
    confirmButton.disabled = true;

    try {
      // Send the POST request
      const response = await fetch(form.getAttribute("action"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // JSON content type
        },
        body: JSON.stringify({ reason: reason }), // Send the reason
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Show success message
        location.reload(); // Reload to reflect changes
      } else {
        alert(`Error: ${result.error}`); // Show error message
      }
    } catch (error) {
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      // Re-enable confirm button and reset processing state
      confirmButton.disabled = false;
      isProcessing = false;
    }
  });
});
});
