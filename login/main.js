const firebaseConfig = {
    apiKey: "AIzaSyA0C7Hbt2UsuqJmBRBbTvx2Y7aUXRZSzIc",
    authDomain: "b8-hackathon-6f47c.firebaseapp.com",
    projectId: "b8-hackathon-6f47c",
    storageBucket: "b8-hackathon-6f47c.appspot.com",
    messagingSenderId: "65171787640",
    appId: "1:65171787640:web:89345a160a3024e377c28d",
    measurementId: "G-HZR4WH9ZKH"
  };
  

// initialize firebase
firebase.initializeApp(firebaseConfig);

// logout automatically
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.location.href = "../home/index.html";
    }
});

// show Password
function showPassword(event) {
    event.target.className = "eye bi bi-eye-slash";
    event.target.previousElementSibling.type = "text";
    event.target.removeEventListener('click', showPassword);
    event.target.addEventListener('click', hidePassword);
}

// hide password
function hidePassword(event) {
    event.target.className = "eye bi bi-eye";
    event.target.previousElementSibling.type = "password";
    event.target.removeEventListener('click', hidePassword);
    event.target.addEventListener('click', showPassword);
}

function login(event) {
    event.preventDefault()
    let email = document.getElementById("email-login").value
    let password = document.getElementById("password-login").value
    let message = document.querySelector(".validationMessage");

    if (!(email.endsWith("@gmail.com"))) {
        message.innerText = `Invalid email address`;
        message.style.display = "block";
        message.style.color = "#e55865";
        return;
    }

    if (
        email.trim() === '' ||
        password.trim() === ''
        // || password.length > 8 || password.length < 4
    ) {
        message.innerText = `Please fill required fields`;
        message.style.display = "block";
        message.style.color = "#e55865";
        return;
    }

    // firebase

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // console.log("Login successful");
            Swal.fire({
                icon: 'success',
                title: 'Logged In',
                text: 'Login Successfull',
                confirmButtonColor: "#66ba45"
            })
            window.location.href = "";
        })
        .catch((error) => {
            console.log("Login error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'Invalid email or password. Please enter correct credentials',
                confirmButtonColor: "#66ba45"
            })
            // alert("Invalid email or password. Please enter correct credentials.");
        });

    document.getElementById("email-login").value
    document.getElementById("password-login").value
}