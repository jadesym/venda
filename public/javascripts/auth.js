var ref = new Firebase("https://venda.firebaseio.com/");

function Error(message) {
  $('#success').empty();
  $('#error').text(message);
}

function Success(msg) {
  $('#error').empty();
  $('#success').html(msg);
}

var usersRef = ref.child("users");

function setUser(userId, name) {
  usersRef.child(userId).set({
    "name": name,
    "currentLocation": {
      "longitude": -1,
      "latitude": -1
    },
    "generalRating": {
      "numRatings": 0,
      "ratingsSum": 0
    },
    "myItems": { },
    "myBids": { }
  });
};

// Functiont that checks if the user is logged in
function isLoggedIn(authData) {
  if (authData) {
  	// user is logged in
    return true
  } else {
  	// user is not logged in
  	return false
  }
}

// Register the callback to be fired every time auth state changes
// Use the below function call for this
// ref.onAuth(isLoggedIn);

function createAccount(user, pass) {
	ref.createUser({
	  email    : user,
	  password : pass
	}, function(error, userData) {
	  if (error) {
	    Error("Error creating user:" + error);
	  } else {
	  	var userId = userData.uid;
	  	setUser(userId, "Jack");
		// var errorCode = null;
	 //  	if (error === null) {
	 //  		console.log(user, pass);
		//   	ref.authWithPassword({
		// 	  email    : user,
		// 	  password : pass
		// 	}, function(error, authData) {
		// 	  if (error) {
		// 	  } else {
		//     	error = true;
		// 	  }
		// 	}, {
		// 		remember: "sessionOnly"
		// 	});	  		
	 //  	}
	    Success("Successfully created user account with uid");
	    // window.location.href="/search"
	  }
	});
};

function login(user, pass) {
  ref.authWithPassword({
	  email    : user,
	  password : pass
	}, function(error, authData) {
	  if (error) {
	  	console.log("error on login");
	  	switch (error.code) {
	  		case "INVALID_EMAIL":
	  			$('#error').html('Invalid email!');
	  			break;
	  		case "INVALID_PASSWORD":
	  			$('#error').html('Password is invalid!');
	  			break;
	  		case "INVALID_USER":
	  			$('#error').html('User is invalid!');
	  			break;
	  		default:
	  			$('#error').html('Login failed for unknown reasons!');
	  			break;
	  	}
	  } else {
    	console.log("Authenticated successfully with payload:", authData);
    	window.location.href = "/search";
	  }
	}, {
		remember: "sessionOnly"
	});
};

var loginFacebookPopup = function() {
	ref.authWithOAuthPopup("facebook", function(error, authData) {
	  if (error) {
	    console.log("Login to Facebook failed!", error);
	    return false;
	  } else {
	    console.log("Authenticated successfully with facebook with payload:", authData);
	    window.location.href = "/search";
	    return true;
	  }
	}, {
		remember: "sessionOnly"
	});
};

var logout = function() {
	ref.unauth();
}
