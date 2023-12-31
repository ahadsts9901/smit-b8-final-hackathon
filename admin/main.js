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


                                document.querySelector("#userName").innerText = `${data.firstName} ${data.lastName}`

                                document.querySelector(".userProfile").src = data.photo

                                if (data.isAdmin == false) {
                                    window.location.href = "../home/index.html"
                                }

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

function addProduct(e) {

    e.preventDefault();

    let fileImg = e.target.querySelector("#productImg")

    let d = new Date();
    let time = d.getTime();
    // console.log(time);
    let fileref = firebase.storage().ref().child(`/admin/products/${time}`);

    // console.log(fileImg.files[0]);

    let uploadTask = fileref.put(fileImg.files[0]);

    uploadTask.on('state_changed',
        (snapshot) => {
            // console.log(snapshot);
        },
        (error) => {
            console.error(error);
        },
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {

                // add product

                let productImage = downloadURL
                let productName = document.querySelector("#itemName").value
                let productCategory = document.querySelector("#category").value
                let productDesc = document.querySelector("#description").value
                let productPrice = document.querySelector("#price").value
                let productUnit = document.querySelector("#unit").value

                setTimeout(() => {

                    db.collection("products")
                        .add({
                            image: productImage,
                            name: productName,
                            category: productCategory,
                            description: productDesc,
                            price: productPrice,
                            unit: productUnit
                        })
                        .then(function (docRef) {

                            const Toast = Swal.mixin({
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 1500,
                                timerProgressBar: true,
                                didOpen: (toast) => {
                                    toast.addEventListener('mouseenter', Swal.stopTimer)
                                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                                }
                            })

                            Toast.fire({
                                icon: 'success',
                                title: 'Added successfully'
                            })

                            // console.log("Added");

                        })
                        .catch(function (error) {
                            console.error("Error adding document: ", error);
                        });

                }, 0)

                e.target.reset()

            });
        }
    );

}

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
            console.error("Sign out error:", error);
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
            console.error(error)
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

    var container = document.querySelector(".adminProducts")
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
                    product.className += "flex justify-between items-center gap-[1em] p-[0.5em] w-[100%] border-[1px] border-[#66ba45] rounded-[10px]"

                    let image = document.createElement("img")
                    image.className += "product w-[6em] h-[4em] rounded-[15px] object-cover"
                    image.src = data.image

                    let title = document.createElement("p")
                    title.className += "font-bold text-[1em] w-[100%] text-left"
                    title.innerText = data.name

                    let det = document.createElement("p")
                    det.className += "text-[#aaa] pr-[1em]"
                    det.innerText = `${data.price}`

                    product.appendChild(image)
                    product.appendChild(title)
                    product.appendChild(det)

                    container.appendChild(product)

                });
            }
        })
        .catch(function (error) {
            console.error("Error getting documents: ", error);
        });

}

function adminOrders() {

    var container = document.querySelector(".adminOrders");
    container.innerHTML = "";

    db.collection("orders")
        .orderBy("time", "desc") //sort by time
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.size === 0) {
                container.innerHTML = "<div class='blue'>No Orders found</div>";
            } else {
                querySnapshot.forEach(function (doc) {
                    var data = doc.data();

                    let userName = firebase.auth().currentUser.email

                    if (data.userEmail === userName) {
                        // console.log(data);

                        let product = document.createElement("div")
                        product.className += "flex flex-col justify-between items-start gap-[1em] border-b-[1px] border-[#ccc] p-[0.5em] w-[100%]"

                        let head = document.createElement("div")
                        head.className += "flex justify-between items-center gap-[1em] w-[100%]"

                        let orderName = document.createElement("p")
                        orderName.className += "text-[#212121] text-left"
                        orderName.innerText = data.name

                        let cont = document.createElement("div")
                        cont.className += "flex flex-col justify-right items-start w-[fit-content]"

                        // time

                        let orderTime = document.createElement("p")
                        orderTime.className += "text-[#aaa] text-[0.6em] text-left"
                        orderTime.innerText = `${moment(data.time.seconds).fromNow()} - ${data.status}`

                        let num = document.createElement("p")
                        num.className += "text-[#212121] text-[0.8em] text-right"
                        num.innerText = data.number

                        // time completed

                        let body = document.createElement("div")
                        body.className += "flex flex-col justify-start items-start gap-[0em]"

                        // products quantity algorithm started

                        const productQuantities = {};

                        data.items.forEach((product) => {
                            const productName = product.name;
                            if (productQuantities[productName]) {
                                productQuantities[productName].quantity += 1;
                            } else {
                                productQuantities[productName] = {
                                    quantity: 1,
                                    name: productName,
                                    unit: product.unit,
                                    price: product.price,
                                    image: product.image,
                                };
                            }
                        });

                        for (const productName in productQuantities) {
                            const product = productQuantities[productName];
                            const productQuantity = product.quantity;
                            let finalQuantity = `${productName} x ${productQuantity}`
                            // console.log(`Unit: ${product.unit}`);
                            // console.log(`Price: ${product.price}`);
                            // console.log(`Image: ${product.image}`);
                            // console.log('---');

                            let quantity = document.createElement("p")
                            quantity.className += "text-[#aaa] text-[0.8em]"
                            quantity.innerText = finalQuantity

                            body.appendChild(quantity)
                        }

                        //   algorithm completed

                        let footer = document.createElement("div")
                        footer.className += "flex justify-between items-center w-[100%]"

                        let footerTotal = document.createElement("p")
                        footerTotal.className += "text-[#212121]"
                        footerTotal.innerText = "Total"

                        let footerPrice = document.createElement("p")
                        footerPrice.className += "text-[#66ba45]"
                        footerPrice.innerText = `Rs ${data.total}`

                        footer.appendChild(footerTotal)
                        footer.appendChild(footerPrice)

                        // making select

                        let select = document.createElement("select")
                        select.className += "w-[100%] bg-[#fff] text-[#888] border-0 rounded-[5px] p-[0.5em]"
                        select.addEventListener("change", function () { updateStatus(doc.id, select.value) })

                        function updateStatus(orderId, newStatus) {
                            var orderRef = db.collection("orders").doc(orderId);

                            orderRef.update({
                                status: newStatus
                            })
                                .then(function () {
                                    // console.log("Status updated successfully!");
                                })
                                .catch(function (error) {
                                    console.error("Error updating status: ", error);
                                });
                        }


                        let opt1 = document.createElement("option")
                        opt1.innerText = "Pending"
                        opt1.value = "Pending"
                        select.appendChild(opt1)

                        let opt2 = document.createElement("option")
                        opt2.innerText = "In Progress"
                        opt2.value = "In Progress"
                        select.appendChild(opt2)

                        let opt3 = document.createElement("option")
                        opt3.innerText = "Delievered"
                        opt3.value = "Delievered"
                        select.appendChild(opt3)

                        head.appendChild(cont)
                        head.appendChild(num)
                        cont.appendChild(orderName)
                        cont.appendChild(orderTime)

                        product.appendChild(head)
                        product.appendChild(body)
                        product.appendChild(footer)
                        product.appendChild(select)

                        container.appendChild(product)

                    }

                });
            }
        })
        .catch(function (error) {
            console.error("Error getting documents: ", error);
        });

}

document.addEventListener("DOMContentLoaded", function () {
    try {
        renderProducts();
    } catch (error) {
        console.error('render products', error);
        try {
            adminOrders();
        } catch (error) {
            console.error("userOrders", error);
        }
    }
});
