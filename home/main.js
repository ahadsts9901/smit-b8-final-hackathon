const firebaseConfig = {
    apiKey: "AIzaSyBUn3n_bx699MPHBgdCyaqnh-gS1nOMtvI",
    authDomain: "b8-final.firebaseapp.com",
    projectId: "b8-final",
    storageBucket: "b8-final.appspot.com",
    messagingSenderId: "196020829543",
    appId: "1:196020829543:web:40089549bcf2048b42c3c2",
    measurementId: "G-LD2CQVZL42"
};

// initialize firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()

// logout automatically
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        window.location.href = "../login/index.html";
    } else {
        let username = user.email
        {
            db.collection("users")
                .get()
                .then((querySnapshot) => {
                    {
                        querySnapshot.forEach(function (doc) {
                            var data = doc.data();

                            if (data.email === username) {

                                // console.log(data.isAdmin);

                                if (data.isAdmin == true) {
                                    window.location.href = "../admin/index.html"
                                }

                                let names = document.getElementById("userName")
                                if (names) { names.innerText = `${data.firstName}  ${data.lastName}` }

                                let pic = document.querySelector(".userProfile")
                                if (pic) { pic.src = data.photo }

                                // console.log("founded")
                            }

                        })
                    }
                })
                .catch((error) => {
                    console.error("Error getting posts: ", error);
                });
        }
    }
});

function logout() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            // console.log("Sign out successful");
            // Redirect to the sign-in page or any other desired destination
            window.location.href = "../index.html";
        })
        .catch((error) => {
            console.log("Sign out error:", error);
        });
}

function editName() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            username = user.email;

            {
                db.collection("users")
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach(function (doc) {
                            var data = doc.data();

                            if (data.email === username) {
                                // Display SweetAlert input for editing FirstName and LastName
                                Swal.fire({
                                    title: 'Edit Profile',
                                    html: `<input id="swal-input-firstname" class="swal2-input" placeholder="First Name" value="${data.firstName || ''}">
                           <input id="swal-input-lastname" class="swal2-input" placeholder="Last Name" value="${data.lastName || ''}">`,
                                    focusConfirm: false,
                                    showCancelButton: true,
                                    cancelButtonColor: "#66ba45",
                                    confirmButtonColor: "#66ba45",
                                    preConfirm: () => {
                                        const newFirstName = document.getElementById('swal-input-firstname').value;
                                        const newLastName = document.getElementById('swal-input-lastname').value;

                                        // Validate if inputs are not empty
                                        if (!newFirstName.trim() || !newLastName.trim()) {
                                            Swal.showValidationMessage('Please fill in both First Name and Last Name.');
                                        } else {
                                            // Update the values on the front end
                                            data.firstName = newFirstName;
                                            data.lastName = newLastName;
                                        }
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        // Update the Firestore document after confirming
                                        db.collection("users").doc(doc.id).update({
                                            firstName: data.firstName,
                                            lastName: data.lastName
                                        }).then(() => {
                                            // console.log("Profile updated successfully!");
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Profile Updated',
                                                showConfirmButton: false,
                                                timer: 1500 // Show success message for 1.5 seconds
                                            });
                                            setTimeout(() => {
                                                window.location.reload()
                                            }, 1000)
                                        }).catch((error) => {
                                            console.error("Error updating profile: ", error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: `Can't update`,
                                                showConfirmButton: false,
                                                timer: 1500 // Show success message for 1.5 seconds
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Error getting posts: ", error);
                    });


            }

        } else {
            window.location.href = "./all.html";
        }
    });

}

function file(event) {
    // console.log(event.target.files[0])
    let uid = firebase.auth().currentUser.uid
    // console.log(uid)
    let fileref = firebase.storage().ref().child(`/users/${uid}/profile`)
    let uploadTask = fileref.put(event.target.files[0])

    uploadTask.on('state_changed',
        (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log('Upload is ' + progress + '% done');
            if (progress == 100) {
                Swal.fire({
                    icon: 'success',
                    title: 'Uploaded',
                    showConfirmButton: false,
                    timer: 1000 // Show success message for 1.5 seconds
                });
            }
        },
        (error) => {
            console.log(error)
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                // console.log('File available at', downloadURL);

                // Update the photo field in the user's document in Firestore
                db.collection("users").where("email", "==", firebase.auth().currentUser.email)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            db.collection("users").doc(doc.id).update({
                                photo: downloadURL
                            }).then(() => {
                                // console.log("Photo URL updated in Firestore.");
                                setTimeout(() => {
                                    window.location.reload()
                                })
                            }).catch((error) => {
                                console.error("Error updating photo URL:", error);
                            });
                        });
                    })
                    .catch((error) => {
                        console.error("Error querying Firestore:", error);
                    });

                firebase.auth().currentUser.updateProfile({
                    photoURL: downloadURL
                })
            });
        }
    );

}

function renderProducts() {

    var container = document.querySelector(".products")
    container.innerHTML = "";

    db.collection("products")
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size === 0) {
                container.innerHTML = "<div class='blue'>No Product found</div>";
            } else {
                querySnapshot.forEach(function (doc) {

                    var data = doc.data();

                    // console.log(data)

                    let product = document.createElement("div")
                    product.className += "flex justify-between items-center gap-[1em] p-[0.5em] w-[100%]"

                    let image = document.createElement("img")
                    image.className += "product w-[7em] h-[5em] rounded-[15px] object-cover"
                    image.src = data.image

                    let cont = document.createElement("div")
                    cont.className += "flex flex-col justify-right items-start w-[100%]"

                    let title = document.createElement("p")
                    title.className += "font-bold text-[1em]"
                    title.innerText = data.name
                    cont.appendChild(title)

                    let desc = document.createElement("p")
                    desc.className += "font-bold text-[0.7em] text-[#888]"
                    desc.innerText = data.description
                    cont.appendChild(desc)

                    let smcont = document.createElement("div")
                    smcont.className += "flex flex-col justify-right items-end w-[5em] h-[100%] gap-[1em]"

                    let det = document.createElement("p")
                    det.className += "text-[0.8em] text-[#212121] self-end"
                    det.innerText = `${data.price} - ${data.unit}`
                    smcont.appendChild(det)

                    let plus = document.createElement("span")
                    plus.className += "w-[3em] h-[1.5em] bg-[#66ba45] rounded-[5px] text-[#fff] flex justify-center items-center"
                    smcont.appendChild(plus)

                    let icon = document.createElement("i")
                    icon.className += "bi bi-plus text-[#fff] pt-[0.3em]"
                    icon.addEventListener("click", function () {
                        addToCart(data);
                    })
                    plus.appendChild(icon)


                    product.appendChild(image)
                    product.appendChild(cont)
                    product.appendChild(smcont)

                    container.appendChild(product)

                });
            }
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

}

function addToCart(product) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('User not authenticated. Cannot update cart and place an order.');
        return;
    }

    const db = firebase.firestore();

    const userIdentifier = user.email;

    db.collection('users')
        .where('email', '==', userIdentifier)
        .get()
        .then(querySnapshot => {
            if (querySnapshot.size === 1) {
                const userDocRef = querySnapshot.docs[0].ref;
                userDocRef.collection('orders').add(product)
                    .then(docRef => {

                        renderProducts();
                    })
                    .catch(error => {
                        console.error('Error adding order to the "orders" subcollection:', error);
                    });
            } else {
                console.error('User not found or multiple users with the same identifier.');
            }
        })
        .catch(error => {
            console.error('Error querying users:', error);
        });
}

function renderCartToUser() {
    var container = document.querySelector(".cart");
    container.innerHTML = "";
    console.log("renderCart");

    const db = firebase.firestore();

    db.collection("users")
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size === 0) {
                container.innerHTML = "<div>No user found.</div>";
            } else {
                querySnapshot.forEach(function (doc) {

                    const userData = doc.data();
                    let userEmail = firebase.auth().currentUser.email

                    if (userEmail === userData.email) {

                        console.log("user",userData);
                        const ordersCollectionRef = doc.ref.collection("orders");

                        ordersCollectionRef.get()
                            .then(function (ordersQuerySnapshot) {
                                if (ordersQuerySnapshot.size === 0) {
                                    console.log("No orders found for this user.");
                                } else {
                                    ordersQuerySnapshot.forEach(function (orderDoc) {
                                        const orderData = orderDoc.data();
                                        console.log("orders",orderData);

                                        // render cart products

                                    });
                                }
                            })
                            .catch(function (error) {
                                console.error("Error getting orders: ", error);
                            });

                    }

                });
            }
        })
        .catch(function (error) {
            console.error("Error getting user documents: ", error);
        });
}


document.addEventListener("DOMContentLoaded", function () {
    try {
        renderProducts();
    } catch (error) {
        console.error('Error rendering products:', error);
        renderCartToUser();
    }
});
