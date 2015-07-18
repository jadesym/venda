var ref = new Firebase("https://venda.firebaseio.com/");
// var ref = new Firebase("https://fiery-torch-745.firebaseio.com");
var usersRef = ref.child("users");
var itemsRef = ref.child("items");
var searchRef = ref.child("itemLookup")
var authId;
function authDataCallback(authData) {
  if (authData) {
    authId = authData.uid;
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
  } else {
    authId = null;
    console.log("User is no longer logged in!");
  }
}

ref.onAuth(authDataCallback);
function Error(msg) {
  $('#error').html(msg);
}

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

// clientCallback updates the name
function getUserName(userId, clientCallback) {
  var nameRef = usersRef.child(userId).child("name");
  nameRef.on("value", function(data) {
    clientCallback(data.val());
  })
}

function updateUserLocation(longitude, latitude) {
  if (authId !== null && authId !== undefined) {
    var userLocationRef = usersRef.child(authId).child("currentLocation");
    userLocationRef.update({
      "longitude": longitude,
      "latitude": latitude
  })} else {
    Error("Error! user needs to be logged in to update location!");
  }
};

function addUserRating(userId, rating) {
  var userNumRatingsRef = usersRef.child(userId).child("generalRating").child("numRatings");
  userNumRatingsRef.transaction(function (current_value) {
    // console.log(current_value);
    return current_value + 1;
  });
  var userSumRatingsRef = usersRef.child(userId).child("generalRating").child("ratingsSum");
  userSumRatingsRef.transaction(function(current_value) {
    return current_value + rating;
  });
};

// clientCallback to update average
function getRating(userId, clientCallback) {
  // console.log("userID: " + userId);
  var userNumRatingsRef = usersRef.child(userId).child("generalRating").child("numRatings");
  var userSumRatingsRef = usersRef.child(userId).child("generalRating").child("ratingsSum");
  var numRatings;
  var sumRatings;
  userNumRatingsRef.on("value", function(data) {
    numRatings = data.val();
    userSumRatingsRef.on("value", function(data) {
      sumRatings = data.val();
      // console.log("numRatings: " + numRatings);
      // console.log("sumRatings: " + sumRatings);
      var average = (sumRatings/numRatings).toFixed(2);
      clientCallback(average);
    });
  });
};

function updateMyItem(itemId) {
    //login Error
  if (authId !== null && authId !== undefined) {
    var itemRef = usersRef.child(authId).child("myItems");
    temp = {};
    temp[itemId] = true;
    itemRef.update(temp);
  } else {
     Error("Error! user needs to be logged in to update selling items!");
  }
};

function updateBidItem(itemId, price) {
  if (authId !== null && authId !== undefined) {
    var itemRef = usersRef.child(authId).child("myBids");
    temp = {};
    temp[itemId] = price;
    itemRef.update(temp);
  } else {
    Error("Error! user needs to be logged in to update bid of an item!");
  }
};

// clientCallback to update price
function getMyBidPriceOnItem(itemId, clientCallback) {
  var myBidRef = usersRef.child(authId).child("myBids").child(itemId);
  myBidRef.on("value", function(data) {
    clientCallback(data.val());
  })
};

function getUserLocation(userId, clientCallback) {
  var userLocationRef = usersRef.child(userId).child("currentLocation");
  userLocationRef.on("value", function(data) {
    clientCallback(data.val());
  })
};

// Items
function addItem(closingTime, name, type, minimumSuggestedPrice, initialBidPrice, description) {
  console.log("adding item!" + authId);
  if (authId !== null && authId !== undefined) {
    var sellerLocation = "10";
    var wordObject = {};
    getUserLocation(authId, function(sellerLocation) {
      var itemId = itemsRef.push({
        status: "OPEN",
        sellerId: authId,
        closingTime: closingTime,
        name: name,
        type: type,
        currentBidPrice: initialBidPrice,
        minimumSuggestedPrice: minimumSuggestedPrice,
        description: description,
        sellerLocation: sellerLocation
      });
      var userItemsRef = usersRef.child(authId).child('myItems');
      var tempObjectMyItems = {};
      tempObjectMyItems[itemId.key()] = true;
      userItemsRef.update(tempObjectMyItems);
      updateMyItem(itemId.key());
      console.log(name);
      var wordList = name.split(" ");
      var listLen = wordList.length;
      for (var i = 0; i < listLen; i++) {
        var curWord = wordList[i];
        wordObject[curWord] = itemId.key();
        console.log(wordObject);
        for (var key in wordObject) {
          wordRef = searchRef.child(key);
          var id = wordObject[key];
          var object = {};
          object[id] = true;
          wordRef.update(object);
        }

      }
    })
    

  } else {
    Error("Error! user needs to be logged in to add an item!");
  }
};

function addImage(itemId, imageUrl) {
  var imagesRef = itemsRef.child(itemId).child("imageUrls");
  imagesRef.push({
    imageUrls: imageUrl
  });
}

function setMeetingLocation(itemId, time, loc) {
  meetupTimeRef = itemsRef.child(itemId);
  meetupTimeRef.update({meetupTime: time, meetupLocation: loc});
}

function bidItem(itemId, price) {
  if (authId !== null && authId !== undefined) {
    itemToBid = itemsRef.child(itemId);
    itemToBid.on("value", function(snapshot) {
      var curPrice = snapshot.val();
      if (curPrice >= price) {
        console.log("Could not bid on the price. Bidding price is too low!");
        // Insert jquery here for giving the user an error
      } else {
        itemToBid.update({ currentBidPrice: price });
        updateBidItem(itemId, price);
        console.log("Successfully bid on the price! New price is : " + price);
        // Insert jquery telling the user that the bid went through.

      }
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  } else {
    Error("Error! user needs to be logged in to bid an item!"); 
  }
}

// clientCallback to get current bid price
function getItemCurrentBidPrice(itemId, clientCallback) {
  var bidPriceRef = itemsRef.child(itemId).child("currentBidPrice");
  bidPriceRef.on("value", function(data) {
    clientCallback(data.val());
  })
};

function itemNameLookup(words) { 
  var wordSet = new Set(words);
  
  
}

// clientCallback to get the bid price
function getItemStatus(itemId, clientCallback) {
  var itemRef = itemsRef.child(itemId).child("status");
  itemRef.on("value", function(data) {
    clientCallback(data.val());
  })
}

function updateItemStatus(itemId, status) {
  var itemRef = itemsRef.child(itemId);
  itemRef.update({
      "status": status
  })
}

function closeItem(itemId) {
  updateItemStatus(itemId, "CLOSED");
}

function setOnHoldItem(itemId) {
  updateItemStatus(itemId, "ON HOLD");
}

function getItemSellerId(itemId, clientCallback) {
  var itemRef = itemsRef.child(itemId).child("sellerId");
  itemRef.on("value", function(data) {
    clientCallback(data.val());
  })
}

function getItemClosingTime(itemId, clientCallback) {
  var itemRef = itemsRef.child(itemId).child("closingTime");
  itemRef.on("value", function(data) {
    clientCallback(data.val());
  })
}

function getItem(itemId) {
  var itemRef = itemsRef.child(itemId);
  itemRef.on("value", function(data) {
    clientCallback(data.val());
  })
}

function getTopKItemsLeastCost(k, type, clientCallback) {
  var tempRef = ref.child("temp");
  itemsRef.orderByChild("type").equalTo(type).on("value", function(snapshot) {
    tempRef.set({})
    // console.log(snapshot.val());
    snapshot.forEach(function(data) {
      // console.log(data.key());
      // console.log(data.val());
      // console.log(data.val().currentBidPrice);
      // list format
      // temp = {};    
      // temp[data.key()] = data.val().currentBidPrice;
      // tempRef.update(temp);
      tempRef.push({
        pushId: data.key(),
        currentBidPrice: data.val().currentBidPrice,
        item: data.val()
      });
    });
    // console.log("--------------------------------------------")
    tempRef.orderByChild("currentBidPrice").limitToFirst(3).on("value", function(snapshot2) {
      // console.log(snapshot2.val());
      clientCallback(snapshot2.val());
    })
  });
}

function getItemsBelowPrice(type, maxPrice, clientCallback) {

  $('#search-result-h1').css('opacity', '1');
  $('#search-result-h6').css('opacity', '0.85');

  var tempRef = ref.child("temp");

  if(type === "all") {
    itemsRef.on("value", function(snapshot) {
    tempRef.set({})
    // console.log(snapshot.val());
    snapshot.forEach(function(data) {
      // console.log(data.key());
      // console.log(data.val());
      // console.log(data.val().currentBidPrice);
      // list format
      // temp = {};    
      // temp[data.key()] = data.val().currentBidPrice;
      // tempRef.update(temp);
      tempRef.push({
        pushId: data.key(),
        currentBidPrice: data.val().currentBidPrice,
        item: data.val()
      });
    });
    // console.log("--------------------------------------------")
    tempRef.orderByChild("currentBidPrice").endAt(maxPrice).on("value", function(snapshot2) {      
      clientCallback(snapshot2);
    });
  });
  } else {

    itemsRef.orderByChild("type").equalTo(type).on("value", function(snapshot) {
      tempRef.set({})
      // console.log(snapshot.val());
      snapshot.forEach(function(data) {
        // console.log(data.key());
        // console.log(data.val());
        // console.log(data.val().currentBidPrice);
        // list format
        // temp = {};    
        // temp[data.key()] = data.val().currentBidPrice;
        // tempRef.update(temp);
        tempRef.push({
          pushId: data.key(),
          currentBidPrice: data.val().currentBidPrice,
          item: data.val()
        });
      });
      // console.log("--------------------------------------------")
      tempRef.orderByChild("currentBidPrice").endAt(maxPrice).on("value", function(snapshot2) {      
        clientCallback(snapshot2);
      });
    });
  }
}

function searchResults(data_list) {
  $('.search-results').html('');
  $('#search-result-h6').css('display', 'none');

  var imagelinks = [
  "./images/splenda.jpg",
  "./images/kitchin.jpg",
  "./images/sliced-pork-belly.jpg", 
  "./images/ticket.jpg", 
  "./images/iphone4.jpeg"];

  var i = 0;

  console.log(data_list.val());
  data_list.forEach(function(data) {

    if(i < 5){
    $('.search-results').append('<li class="search-results-item">'
      + '<img src="' + imagelinks[i++] + '" alt="pic" class="search-pic">'
      + '<button class="bid-button">BID</button>' 
      + data.val().item.name + ' | $' + data.val().currentBidPrice + '<br>' 
      + data.val().item.description + '<br>' + data.val().item.sellerLocation + '</li>');
    } else{
    $('.search-results').append('<li class="search-results-item">'
      + '<div class="search-pic"></div>'
      + '<button class="bid-button">BID</button>' 
      + data.val().item.name + ' | $' + data.val().currentBidPrice + '<br>' 
      + data.val().item.description + '<br>' + data.val().item.sellerLocation + '</li>');  
    }

    console.log(data.val());
    console.log(data.val().item.name);
    console.log(data.val().currentBidPrice);
    console.log(data.val().item.description);
    console.log(data.val().item.sellerLocation);
  })
}

// Sample Usage Call back function
// getItemsBelowPrice("container", 10, function(data_list) {
//   console.log(data_list.val());
//   data_list.forEach(function(data) {
//     console.log(data.val());
//     console.log(data.val().item.name);
//     console.log(data.val().currentBidPrice);
//     console.log(data.val().item.description);
//     console.log(data.val().item.sellerLocation);
//   })
// });