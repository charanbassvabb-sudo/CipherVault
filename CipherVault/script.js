document.addEventListener("DOMContentLoaded", function () {
    // Get the current page's URL path
    var currentPage = window.location.pathname;

    // Ensure the current page path starts with a '/'
    if (currentPage.charAt(0) !== '/') {
        currentPage = '/' + currentPage;
    }

    // Find all links in the nav
    var navLinks = document.querySelectorAll('nav a');
    var dropdownLinks = document.querySelectorAll('.dropdown-menu a'); // To target dropdown items

    navLinks.forEach(function(link) {
        var linkHref = link.getAttribute('href');

        // Ensure the link's href starts with a '/'
        if (linkHref.charAt(0) !== '/') {
            linkHref = '/' + linkHref;
        }

        // Compare the link's href with the current page path
        if (currentPage === linkHref) {
            link.classList.add("active");

            // Check if the link is a dropdown item, and highlight its parent
            if (link.closest('.dropdown')) {
                link.closest('.dropdown').classList.add('active');
            }
        }
    });

    // Add 'active' class to the dropdown parent when a dropdown item is clicked
    dropdownLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            var dropdownParent = link.closest('.dropdown');
            if (dropdownParent) {
                dropdownParent.classList.add('active');
            }
        });
    });
});

// Toggle Password Visibility
function togglePassword(passwordId, toggleIconId) {
    const passwordField = document.getElementById(passwordId);
    const eyeIcon = document.getElementById(toggleIconId);

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordField.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

// Check Password Strength
function checkPasswordStrength() {
    const passwordInput = document.getElementById("password");
    const bars = document.querySelectorAll(".bar");
    const text = document.getElementById("text");

    let password = passwordInput.value;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    if (password.length >= 12) strength++;

    updateStrengthBar(strength);
}

function updateStrengthBar(strength) {
    const colors = ["#ff2c2c", "#ff5733", "#ff9800", "#12ff12", "#008000"];
    const messages = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];

    const passwordInput = document.getElementById("password");
    const bars = document.querySelectorAll(".bar");
    const text = document.getElementById("text");

    passwordInput.style.borderColor = colors[strength - 1] || "#ccc";
    passwordInput.style.boxShadow = `0 0 10px ${colors[strength - 1] || "transparent"}`;

    bars.forEach((bar, index) => {
        bar.style.background = index < strength ? colors[strength - 1] : "#555";
    });

    text.textContent = messages[strength - 1] || "Too Short";
    text.style.color = colors[strength - 1] || "#ffffff";
}

// Handle Signup
async function signup() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!username || !password) {
        alert("Please fill in both fields.");
        return;
    }
      // Password validation
    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

    if (!passwordRegex.test(password)) {
        alert("Password must be at least 8 characters long and include at least one special character.");
        return;
    }

    const url = 'http://localhost:8000/users/';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            alert("Registration successful!");
            localStorage.setItem('username', data.username);
            window.location.href = 'login.html';
        } else {
            const errorData = await response.json();
            alert(errorData.detail || "Something went wrong.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    }
}

// Handle Login
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const url = new URL('http://localhost:8000/login/');
    url.searchParams.append('username', username);
    url.searchParams.append('password', password);

    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });

        if (response.ok) {
            const data = await response.json();
            alert("Login successful!");
            localStorage.setItem('username', username);
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            alert(data.detail || "Invalid credentials.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    }
}

// Handle Account Deletion
async function deleteUser() {
    const username = localStorage.getItem("username");

    if (!username) {
        alert("No user is logged in.");
        return;
    }

    // Ask the user for confirmation before deleting the account
    const confirmAction = confirm("Are you sure you want to delete your account? This will also delete your passwords.");
    if (!confirmAction) {
        return;  // If the user cancels, stop the deletion
    }

    const apiUrl = `http://127.0.0.1:8000/users/${username}`;  // Corrected the string formatting

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert('Error: ' + errorText);
            return;
        }

        const data = await response.json();
        alert(data.message);  // Notify the user about the successful deletion

        // Call logout after successful account deletion
        logout();

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the account.');
    }
}

// Handle Logout with a warning
function logout() {
    // Show a confirmation warning before logging out
    const confirmed = window.confirm('Are you sure you want to log out?');

    if (confirmed) {
        // Remove the username from localStorage
        localStorage.removeItem('username');

        // Redirect the user to the login page
        window.location.href = 'login.html';
    } else {
        console.log('Logout canceled.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('username');

    const contactUsBtn = document.getElementById('contact-us-btn');
    const loginBtn = document.getElementById('login-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    const getStartedBtn2 = document.getElementById('get-started-btn2');
    const profileSection = document.getElementById('profile-section');
    const logoutBtn = document.getElementById('logout-btn');

    if (loggedInUser) {
        if (contactUsBtn) contactUsBtn.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (getStartedBtn) getStartedBtn.style.display = 'none';
        if (getStartedBtn2) getStartedBtn2.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (contactUsBtn) contactUsBtn.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'block';
        if (getStartedBtn) getStartedBtn.style.display = 'inline-block';
        if (getStartedBtn2) getStartedBtn2.style.display = 'inline-block';
        if (profileSection) profileSection.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
});

const API_BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend URL

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser  = localStorage.getItem('username'); // Retrieve the stored username

    if (loggedInUser ) {
        console.log(`Logged-in user: ${loggedInUser }`);
        const contactUsBtn = document.getElementById('contact-us-btn'); // Corrected variable name & ID
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const getStartedBtn = document.getElementById('get-started-btn'); // Target "Get Started Now"
        const getStartedBtn2 = document.getElementById('get-started-btn2');
        const profileSection = document.getElementById('profile-section');
        const logoutBtn = document.getElementById('logout-btn');

        // Hide login and registration buttons, show profile and logout
        if (contactUsBtn) contactUsBtn.style.display = 'block';  // Correct variable name
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (getStartedBtn) getStartedBtn.style.display = 'none'; 
        if (profileSection) profileSection.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        // Show login and registration buttons, hide profile and logout
        if (contactUsBtn) contactUsBtn.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (getStartedBtn) getStartedBtn.style.display = 'inline-block';
        if (profileSection) profileSection.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    // Event listener for showing saved passwords
    const showPasswordsBtn = document.getElementById('show-passwords-btn');
    if (showPasswordsBtn) {
        showPasswordsBtn.addEventListener('click', () => {
            getPasswords(loggedInUser ); // Pass the logged-in user to the function
        });
    }

    // Event listener for storing passwords
    const storePasswordBtn = document.getElementById('store-password-btn');
    if (storePasswordBtn) {
        storePasswordBtn.addEventListener('click', storePassword);
    }
});
async function storePassword() {
const username = localStorage.getItem('username'); // Get logged-in user
const website = document.getElementById('website-input')?.value.trim();
const siteUsername = document.getElementById('site-username-input')?.value.trim();
const password = document.getElementById('password-input')?.value.trim();

if (!username) {
    alert('Please log in first.');
    return;
}

if (!website || !siteUsername || !password) {
    alert('Please fill in all fields.');
    return;
}

const data = {
    website: website,
    site_username: siteUsername,
    password: password
};

console.log("Sending JSON:", JSON.stringify(data, null, 2));

try {
    const response = await fetch(`http://127.0.0.1:8000/users/${username}/passwords/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("API Response:", result);

    if (response.ok) {
        alert('Password stored successfully!');

        // Retrieve existing passwords from localStorage
        let savedPasswords = JSON.parse(localStorage.getItem('savedPasswords')) || [];

        // Add the new password entry
        savedPasswords.push(data);

        // Save updated list back to localStorage
        localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
    } else {
        console.error('API Error Response:', result);
        alert(`Error: ${JSON.stringify(result.detail)}`);
    }
} catch (error) {
    console.error('Error storing password:', error);
    alert('Failed to store password. Please try again.');
}
}

async function getPasswords(username) {
if (!username) {
    alert('Please log in first.');
    return;
}

try {
    const response = await fetch(`${API_BASE_URL}/users/${username}/passwords/`);
    const result = await response.json();

    if (response.ok) {
        displayPasswords(result); // Let displayPasswords handle empty passwords case
    } else {
        alert(`Error: ${result.detail}`);
    }
} catch (error) {
    console.error('Error fetching passwords:', error);
    alert('Failed to retrieve passwords.');
}
}

function displayPasswords(passwords) {
const vault = document.getElementById('vault');
vault.innerHTML = '<h3>Saved Passwords:</h3>';

if (passwords.length === 0) {
    vault.innerHTML = '<h3>No passwords saved yet.</h3>'; // No need for an alert here
    return; // Stop further execution
}

passwords.forEach((pass, index) => {
    const passItem = document.createElement('div');
    passItem.innerHTML = `
        <strong>Website:</strong> ${pass.website} <br>
        <strong>Username:</strong> ${pass.username} <br>
        <strong>Password:</strong> 
        <div class="unique-password-container">
            <input type="password" id="saved-password-${index}" value="${pass.password}" readonly class="password-input">
            <i class="fas fa-trash delete-password" id="delete-password-${index}" onclick="deletePassword('${pass.password}')"></i>
            <i class="fas fa-eye toggle-password" id="toggle-password-${index}" onclick="togglePassword1('saved-password-${index}', 'toggle-password-${index}')"></i>
        </div>
        <hr>
    `;
    vault.appendChild(passItem);
});
}

async function deletePassword(password) {
const username = localStorage.getItem('username'); // Get logged-in user

if (!username) {
    alert('Please log in first.');
    return;
}

let savedPasswords = JSON.parse(localStorage.getItem('savedPasswords')) || [];

// Find the matching password entry
const passwordEntry = savedPasswords.find(entry => entry.password === password);

if (!passwordEntry) {
    alert('Password not found.');
    return;
}
// Show confirmation dialog before deletion
const isConfirmed = window.confirm("Are you sure you want to delete this password?");

if (!isConfirmed) {
    // If the user cancels, don't proceed with the deletion
    return;
}

const data = { 
    password: passwordEntry.password,
    website: passwordEntry.website,
    site_username: passwordEntry.site_username
};

console.log("Sending JSON:", JSON.stringify(data, null, 2));

try {
    const response = await fetch(`http://127.0.0.1:8000/users/${username}/passwords/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    const result = await response.json(); // Handle JSON response

    console.log("API Response:", result);

    if (response.ok) {
        alert('Password deleted successfully!');

        // Remove deleted password from localStorage
        savedPasswords = savedPasswords.filter(entry => entry.password !== passwordEntry.password);
        localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));

        // Optionally reload to refresh the UI
        location.reload();
    } else {
        alert(`Error: ${result.detail || result.message}`);
    }
} catch (error) {
    console.error('Error deleting password:', error);
    alert('Failed to delete password. Please try again.');
}
}

// Toggle password visibility for input fields
function togglePassword1(inputId, iconId) {
let passwordInput = document.getElementById(inputId);
let eyeIcon = document.getElementById(iconId);

if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
} else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
}
}