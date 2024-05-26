document.addEventListener('DOMContentLoaded', () => {
    // Login form submission
    const listener0 = document.getElementById('login-form'); if(listener0){listener0.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('home-container').style.display = 'block';
                document.getElementById('welcome-username').textContent = email;
                // window.location.href = "/"; // Redirect to home page
            } else {
                alert(data.message);
            }
        });
    })};

    // Signup form submission
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('signup-container').style.display = 'none';
                document.getElementById('home-container').style.display = 'block';
                document.getElementById('welcome-username').textContent = email;
                // window.location.href = "/signup"; // Redirect to home page
            } else {
                alert(data.message);
            }
        });
    });

    // Create group button
    document.getElementById('createGroupBtn').addEventListener('click', function() {
        document.querySelector('.options').classList.add('hidden');
        document.querySelector('.group-creation').classList.remove('hidden');
    });

    // Create group form submission
    document.getElementById('createGroupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const groupName = document.getElementById('groupName').value;
        const groupPrivacy = document.getElementById('groupPrivacy').value;
        const adminEmail = sessionStorage.getItem('email');

        fetch('/create-group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ group_name: groupName, privacy: groupPrivacy, admin_email: adminEmail })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Group created successfully with ID: ' + data.group_id);
                // window.location.href = "/create-group"; // Redirect to home page
            } else {
                alert('Failed to create group: ' + data.message);
            }
        });
    });

    // Show signup form
    const listener = document.getElementById('showSignupBtn'); if(listener){listener.addEventListener('click', showSignup);}
    // Show login form
    const listener2 =document.getElementById('showLoginBtn'); if(listener2){listener2.addEventListener('click', showLogin);}
    // Logout function
    const listener3 =document.getElementById('logoutBtn'); if(listener3){listener3.addEventListener('click', logout);}

    // Fetch and display public groups
    fetch('/public-groups')
        .then(response => response.json())
        .then(groups => {
            console.log(groups); // Log the fetched groups to the console
            const groupsList = document.getElementById('publicGroupsList');
            groups.forEach(group => {
                const groupId = group[0]; // Accessing the id from sub-array
                const groupName = group[1]; // Accessing the group_name from sub-array
                const groupItem = document.createElement('div');
                groupItem.textContent = groupName;
                groupItem.classList.add('group-item');
                groupItem.dataset.groupId = groupId; // Assign groupId to data-group-id 
                groupItem.addEventListener('click', function() {
                    const selectedGroupId = groupItem.dataset.groupId;
                    alert('Selected group ID: ' + selectedGroupId);
                    navigateToGroup(selectedGroupId);
                });
                groupsList.appendChild(groupItem);
            });
        })
        .catch(error => {
            console.error('Error fetching public groups:', error);
            alert('Failed to fetch public groups. Please try again.');
        });

    function navigateToGroup(selectedGroupId) {
        // redirect to the group page with group ID
        window.location.href = `/group/${selectedGroupId}`;
    }

    // fetch and display public groups when "Join a Group" is clicked
    document.getElementById('joinGroupBtn').addEventListener('click', function() {
        document.querySelector('.options').classList.add('hidden');
        document.querySelector('.group-creation').classList.add('hidden');
        document.querySelector('.group-join').classList.remove('hidden');
    });

    document.getElementById('backToOptionsBtn').addEventListener('click', function() {
        document.querySelector('.group-join').classList.add('hidden');
        document.querySelector('.options').classList.remove('hidden');
    });

    document.getElementById('createGroupBtn').addEventListener('click', function() {
        document.querySelector('.options').classList.add('hidden');
        document.querySelector('.group-join').classList.add('hidden');
        document.querySelector('.group-creation').classList.remove('hidden');
    });

    document.getElementById('backToOptionsBtnCreate').addEventListener('click', function() {
        document.querySelector('.group-creation').classList.add('hidden');
        document.querySelector('.options').classList.remove('hidden');
    });

    // Timer
    let timerInterval;
    let elapsedTime = 0;

    const listener1 = document.getElementById('start-timer-btn'); if(listener1){listener1.addEventListener('click', startTimer);}
    const listener4 =document.getElementById('stop-timer-btn'); if(listener4){listener4.addEventListener('click', stopTimer);}

    function startTimer() {
        clearInterval(timerInterval); //clear existing interval
        const startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            document.getElementById('timer-display').innerText = formatTime(elapsedTime);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function pad(number) {
        return number.toString().padStart(2, '0');
    }
});

function showSignup() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function logout() {
    fetch('/logout')
    .then(() => {
        document.getElementById('home-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
        // window.location.href = "/"; // redirect to home page
    });
}